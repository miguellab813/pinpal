// Pinpal relay: the only code that talks to Notion.
// The browser can't call Notion directly (Notion blocks browser requests and the
// key would be exposed), so the page calls this file and this file calls Notion.
//
// Env vars (set in Vercel → Project → Settings → Environment Variables):
//   NOTION_TOKEN  required  your Notion integration secret (starts with "ntn_" or "secret_")
//   APP_PIN       strongly recommended  passcode the page must send; blocks strangers

const NOTION = 'https://api.notion.com/v1';
const VERSION = '2022-06-28';
const DB = {
  vials: process.env.VIALS_DB || 'd44a6364-6dae-4240-b7ab-254952b74fb5',
  doses: process.env.DOSES_DB || 'e9a4cfd0-f326-42af-be97-843aa4f4b929',
};
const SITES = ['Abdomen L', 'Abdomen R', 'Thigh L', 'Thigh R', 'Glute L', 'Glute R', 'Arm L', 'Arm R', 'Other'];
const TODS = ['Morning', 'Afternoon', 'Evening', 'Bedtime'];
const EFFECTS = ['None', 'Redness', 'Itching', 'Nausea', 'Fatigue', 'Other'];
const UUID = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
const norm = (id) => String(id).replace(/-/g, '').toLowerCase();

async function notion(path, method = 'GET', body) {
  const r = await fetch(NOTION + path, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': VERSION,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json();
  if (!r.ok) {
    const e = new Error(data.message || `Notion error ${r.status}`);
    e.status = r.status;
    throw e;
  }
  return data;
}

async function queryAll(db, body, maxPages = 3) {
  let out = [], cursor;
  for (let i = 0; i < maxPages; i++) {
    const d = await notion(`/databases/${db}/query`, 'POST', { ...body, start_cursor: cursor });
    out = out.concat(d.results);
    if (!d.has_more) break;
    cursor = d.next_cursor;
  }
  return out;
}

// Turn any Notion property into a plain value.
function val(p) {
  if (!p) return null;
  switch (p.type) {
    case 'title': return p.title.map((t) => t.plain_text).join('');
    case 'rich_text': return p.rich_text.map((t) => t.plain_text).join('');
    case 'number': return p.number;
    case 'select': return p.select ? p.select.name : null;
    case 'multi_select': return p.multi_select.map((o) => o.name);
    case 'date': return p.date ? p.date.start : null;
    case 'relation': return p.relation.map((r) => r.id);
    case 'checkbox': return p.checkbox;
    case 'formula': { const f = p.formula; return f[f.type] ?? null; }
    case 'rollup': {
      const r = p.rollup;
      if (r.type === 'array') return r.array.map(val).flat().filter((x) => x != null);
      return r[r.type] ?? null;
    }
    default: return null;
  }
}
const first = (v) => (Array.isArray(v) ? v[0] ?? null : v);

const toVial = (pg) => {
  const P = pg.properties;
  return {
    id: pg.id,
    name: val(P['Vial']),
    status: val(P['Status']),
    totalMg: val(P['Total (mg)']),
    bac: val(P['BAC Water (mL)']),
    strength: val(P['Strength (mcg/mL)']),
    remMcg: val(P['Remaining (mcg)']),
    remPct: val(P['Remaining %']),
    dosesLeft: val(P['Doses Left']),
    low: val(P['Low Stock']),
    stdIU: first(val(P['Std Dose (IU)'])),
    dot: first(val(P['Dot'])),
  };
};

const toDose = (pg) => {
  const P = pg.properties;
  return {
    id: pg.id,
    title: val(P['Entry']),
    date: val(P['Date']) || pg.created_time,
    iu: val(P['Dose (IU)']),
    mcg: val(P['Dose (mcg)']),
    site: val(P['Site']),
    tod: val(P['Time of Day']),
    se: val(P['Side Effects']) || [],
    notes: val(P['Notes']),
    vialId: first(val(P['Vial'])),
  };
};

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (!process.env.NOTION_TOKEN) return res.status(500).json({ error: 'NOTION_TOKEN is not set in Vercel.' });
    if (process.env.APP_PIN && req.headers['x-pin'] !== process.env.APP_PIN) {
      return res.status(401).json({ error: 'Wrong or missing PIN.' });
    }
    const action = req.query.action;

    if (action === 'load' && req.method === 'GET') {
      const [vials, doses] = await Promise.all([
        queryAll(DB.vials, { page_size: 100 }),
        queryAll(DB.doses, { page_size: 60, sorts: [{ property: 'Date', direction: 'descending' }] }, 1),
      ]);
      return res.json({ vials: vials.map(toVial), doses: doses.map(toDose) });
    }

    if (action === 'log' && req.method === 'POST') {
      const b = req.body || {};
      const iu = Number(b.iu);
      if (!UUID.test(b.vialId || '')) return res.status(400).json({ error: 'Pick a vial.' });
      if (!(iu > 0 && iu <= 200)) return res.status(400).json({ error: 'Dose must be 1–200 IU.' });
      if (b.site && !SITES.includes(b.site)) return res.status(400).json({ error: 'Unknown site.' });
      const tod = TODS.includes(b.tod) ? b.tod : null;
      const se = (Array.isArray(b.se) ? b.se : []).filter((x) => EFFECTS.includes(x));
      const when = typeof b.date === 'string' && !isNaN(Date.parse(b.date)) ? b.date : new Date().toISOString();
      const title = String(b.title || `${iu} IU`).slice(0, 120);
      const notes = String(b.notes || '').slice(0, 1000);

      const props = {
        Entry: { title: [{ text: { content: title } }] },
        Date: { date: { start: when } },
        'Dose (IU)': { number: iu },
        Vial: { relation: [{ id: b.vialId }] },
        'Side Effects': { multi_select: se.map((name) => ({ name })) },
      };
      if (b.site) props.Site = { select: { name: b.site } };
      if (tod) props['Time of Day'] = { select: { name: tod } };
      if (notes) props.Notes = { rich_text: [{ text: { content: notes } }] };

      const pg = await notion('/pages', 'POST', { parent: { database_id: DB.doses }, properties: props });
      return res.json({ dose: toDose(pg) });
    }

    if (action === 'undo' && req.method === 'POST') {
      const id = (req.body || {}).id;
      if (!UUID.test(id || '')) return res.status(400).json({ error: 'Bad id.' });
      const pg = await notion(`/pages/${id}`);
      // Only allow removing entries from the Injection Log.
      if (norm(pg.parent && pg.parent.database_id) !== norm(DB.doses)) {
        return res.status(403).json({ error: 'Not an Injection Log entry.' });
      }
      await notion(`/pages/${id}`, 'PATCH', { archived: true });
      return res.json({ ok: true });
    }

    return res.status(404).json({ error: 'Unknown action.' });
  } catch (e) {
    return res.status(e.status && e.status < 500 ? e.status : 502).json({ error: e.message });
  }
};

# Pinpal Web v0.0 — setup

A one-screen phone app for logging doses. All data stays in your Notion **Pinpal** databases.

```
iPhone home-screen icon → pinpal_v0.0.html (the screen)
                        → api/notion.js     (relay on Vercel, holds your Notion key)
                        → Notion: Vials + Injection Log
```

**Why a relay is needed:** Notion blocks requests that come straight from a browser. Your Notion key also can't be put inside the page, because anyone who opens the page could read it. The relay is one small file that Vercel runs for free.

## 1. Create a Notion key (2 min)
1. Go to **notion.so/profile/integrations** → **New integration**.
2. Name: `Pinpal`. Type: **Internal**. Workspace: yours. Save.
3. Copy the **Internal Integration Secret** (starts with `ntn_`).
4. Under **Capabilities**, keep Read, Update, and Insert content turned on.
5. In Notion, open the **Pinpal** page → `•••` (top right) → **Connections** → add **Pinpal**. This gives the key access to Peptides, Vials, Injection Log, and Protocols.

## 2. Put it on Vercel (5 min, one time)
On your Windows PC, with [Node.js](https://nodejs.org) installed, open PowerShell in this folder:

```powershell
npm i -g vercel
vercel login
vercel                       # answer the prompts; accept the defaults
vercel env add NOTION_TOKEN  # paste the ntn_ secret, select all environments
vercel env add APP_PIN       # pick a 4–6 digit PIN; select all environments
vercel --prod
```
Vercel prints a URL like `https://pinpal-web-xxxx.vercel.app`.

> If you'd rather not use the command line: put this folder in a GitHub repo, then go to vercel.com → **Add New → Project** → import it. Add the same two variables under **Settings → Environment Variables**, then redeploy.

## 3. Put it on your iPhone
1. Open the URL in **Safari** (not Chrome, which can't add a full-screen app to the home screen).
2. **Share** → **Add to Home Screen** → Add.
3. Open it from the icon and enter your PIN once. The phone remembers it.
4. Delete the old Shortcuts icon if you want.

## Daily use
- **Log a dose:** tap a vial → check the units (it fills in the vial's standard dose) → the next injection site is already chosen in rotation → **Log**. That's 2 taps if nothing changes.
- **Logged the wrong thing?** Tap **Undo** in the pop-up (it stays for about 7 seconds), or delete the entry in Notion.
- **Recent doses:** grouped by day, at the bottom. Switch between **All** and **this vial**.
- **No signal:** the dose is saved on your phone, marked "not synced yet," and sent to Notion the next time you open the app.
- **Vial cards** show % left, doses left at your standard dose, and time since the last shot. They turn orange when stock is low.
- **Only vials marked "Reconstituted"** in Notion show up. When you mix a new vial, set its Status in Notion and it appears here.
- **Preview without setup:** open `pinpal_v0.0.html` directly on a computer, or add `?demo` to the URL. It runs with fake data.

## What changes in Notion
Each log creates one row in **Injection Log**: Entry title, Date (with time), Dose (IU), Vial, Site, Time of Day, Side Effects, Notes. Your existing formulas then update the vial's remaining stock.

## Files
| File | What it is |
|---|---|
| `pinpal_v0.0.html` | The whole app screen |
| `api/notion.js` | The relay (the only code that sees your Notion key) |
| `vercel.json` | Makes the site's main address open the app |
| `manifest.json`, `apple-touch-icon.png` | Home-screen name and icon |

## Security notes
- The Notion key lives only in Vercel's settings, never in the page.
- `APP_PIN` stops anyone who finds the URL from reading or writing your log. Set it.
- The relay can only read Vials and Injection Log, add log entries, and remove log entries. It can't touch anything else in your Notion.

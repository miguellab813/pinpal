import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://shpkomsojxelggdmaeog.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNocGtvbXNvanhlbGdnZG1hZW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MjQzMzUsImV4cCI6MjA4OTUwMDMzNX0.YZGOsS9xtBxZDQ3sBmzo-_n2rMYGwXW96z1rUczFvLg";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

const T = {
  bg:"#0d0d0f", surface:"#17171a", elevated:"#1f1f24", border:"#2a2a30",
  accent:"#4f9eff", accentDim:"rgba(79,158,255,.15)",
  green:"#30d158", greenDim:"rgba(48,209,88,.15)",
  red:"#ff453a", redDim:"rgba(255,69,58,.15)",
  amber:"#ffd60a",
  text:"#f2f2f7", textSub:"#d0d0d8", textMute:"#888898",
};

const fmt = (d) => new Date(d).toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const localNow = () => {
  const d = new Date(), pad = n => String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// ── Icons ─────────────────────────────────────────────────────────────────
const Icon = ({name,size=20,color="currentColor"}) => {
  const paths = {
    flask:"M9 3v7L4.5 18h15L15 10V3M9 3h6M9 3H7m8 0h2",
    box:"M21 8l-9-5-9 5m18 0v8l-9 5-9-5V8m9 5v9m0-9L3 8",
    calendar:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    clock:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    dollar:"M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6",
    plus:"M12 4v16m-8-8h16",
    trash:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a2 2 0 00-2-2H9a2 2 0 00-2 2m12 0H3",
    check:"M5 13l4 4L19 7",
    alert:"M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
    x:"M6 18L18 6M6 6l12 12",
    edit:"M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    syringe:"M18 2l4 4-1 1-4-4 1-1zm-2 2l-10 10m1 5l-4 1 1-4m3 3l-2-2m9-11l2 2",
    download:"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
    logout:"M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
    download:"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
    download:"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
    eye:"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
    eyeoff:"M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24 M1 1l22 22",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]}/>
    </svg>
  );
};

// ── Primitives ────────────────────────────────────────────────────────────
const Card = ({children, style={}}) => (
  <div style={{background:T.surface,borderRadius:16,padding:18,border:`1px solid ${T.border}`,...style}}>{children}</div>
);

const Input = ({label, ...props}) => (
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label && <label style={{fontSize:11,fontWeight:700,color:T.textSub,letterSpacing:.6,textTransform:"uppercase"}}>{label}</label>}
    <input {...props} style={{border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 13px",fontSize:15,outline:"none",background:T.elevated,color:T.text,colorScheme:"dark",...props.style}}
      onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
  </div>
);

const NumInput = ({label, ...props}) => (
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label && <label style={{fontSize:11,fontWeight:700,color:T.textSub,letterSpacing:.6,textTransform:"uppercase"}}>{label}</label>}
    <input type="number" inputMode="decimal" {...props}
      style={{border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 13px",fontSize:15,outline:"none",background:T.elevated,color:T.text,colorScheme:"dark",...props.style}}
      onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
  </div>
);

const Sel = ({label, options, ...props}) => (
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label && <label style={{fontSize:11,fontWeight:700,color:T.textSub,letterSpacing:.6,textTransform:"uppercase"}}>{label}</label>}
    <select {...props} style={{border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 13px",fontSize:15,outline:"none",background:T.elevated,color:T.text,appearance:"none",colorScheme:"dark",...props.style}}>
      {options.map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
    </select>
  </div>
);

const Btn = ({children, variant="primary", icon, loading=false, style={}, ...props}) => {
  const v = {
    primary:{background:T.accent,color:"#fff"},
    secondary:{background:T.elevated,color:T.text},
    danger:{background:T.red,color:"#fff"},
    ghost:{background:"transparent",color:T.accent,padding:"8px 4px"},
    success:{background:T.green,color:"#000"},
  };
  return (
    <button {...props} disabled={loading||props.disabled}
      style={{display:"inline-flex",alignItems:"center",gap:7,borderRadius:12,padding:"11px 18px",fontSize:14,fontWeight:700,cursor:"pointer",border:"none",letterSpacing:.2,opacity:loading?.6:1,...v[variant],...style}}>
      {icon && !loading && <Icon name={icon} size={16} color={variant==="success"?"#000":"currentColor"}/>}
      {loading && <span style={{width:14,height:14,border:"2px solid currentColor",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>}
      {children}
    </button>
  );
};

const Badge = ({children, bg=T.accentDim, color=T.accent}) => (
  <span style={{background:bg,color,fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:20,whiteSpace:"nowrap"}}>{children}</span>
);

const Modal = ({open, onClose, title, children}) => {
  if(!open) return null;
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",backdropFilter:"blur(8px)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:T.surface,borderRadius:"22px 22px 0 0",width:"100%",maxWidth:600,maxHeight:"92vh",overflowY:"auto",border:`1px solid ${T.border}`,borderBottom:"none"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"22px 24px 14px"}}>
          <span style={{fontSize:18,fontWeight:800,color:T.text}}>{title}</span>
          <button onClick={onClose} style={{background:T.elevated,border:"none",borderRadius:50,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <Icon name="x" size={16} color={T.textSub}/>
          </button>
        </div>
        <div style={{padding:"0 24px 44px"}}>{children}</div>
      </div>
    </div>
  );
};

// ── Auth ──────────────────────────────────────────────────────────────────
const AuthScreen = ({onAuth}) => {
  const [mode,setMode] = useState("login");
  const [email,setEmail] = useState("");
  const [pass,setPass] = useState("");
  const [showPw,setShowPw] = useState(false);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const [info,setInfo] = useState("");

  const submit = async () => {
    setError(""); setInfo(""); setLoading(true);
    try {
      if(mode==="login") {
        const {data,error:e} = await supabase.auth.signInWithPassword({email,password:pass});
        if(e) throw e;
        onAuth(data.user);
      } else if(mode==="signup") {
        const {error:e} = await supabase.auth.signUp({email,password:pass});
        if(e) throw e;
        setInfo("Check your email to confirm, then sign in."); setMode("login");
      } else {
        const {error:e} = await supabase.auth.resetPasswordForEmail(email);
        if(e) throw e;
        setInfo("Reset email sent."); setMode("login");
      }
    } catch(e) { setError(e.message||"Something went wrong."); }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px",fontFamily:"-apple-system,BlinkMacSystemFont,sans-serif",colorScheme:"dark"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,marginBottom:36}}>
        <div style={{width:72,height:72,borderRadius:18,overflow:"hidden"}}>
          <img src="/icon.png" alt="PinPal" style={{width:"100%",height:"100%"}} onError={e=>{e.target.style.display="none";}}/>
        </div>
        <div style={{textAlign:"center"}}>
          <h1 style={{fontSize:28,fontWeight:900,color:T.text,margin:0,letterSpacing:-1}}>PinPal</h1>
          <p style={{fontSize:13,color:T.textMute,margin:"4px 0 0"}}>Happy pinning</p>
        </div>
      </div>
      <div style={{width:"100%",maxWidth:380,background:T.surface,borderRadius:20,padding:"28px 24px",border:`1px solid ${T.border}`}}>
        <h2 style={{fontSize:18,fontWeight:800,color:T.text,margin:"0 0 20px",textAlign:"center"}}>
          {mode==="login"?"Welcome back":mode==="signup"?"Create account":"Reset password"}
        </h2>
        {error && <div style={{background:T.redDim,border:`1px solid ${T.red}44`,borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:T.red}}>{error}</div>}
        {info  && <div style={{background:T.greenDim,borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:T.green}}>{info}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
          {mode!=="reset" && (
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              <label style={{fontSize:11,fontWeight:700,color:T.textSub,letterSpacing:.6,textTransform:"uppercase"}}>Password</label>
              <div style={{position:"relative"}}>
                <input type={showPw?"text":"password"} value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••"
                  onKeyDown={e=>e.key==="Enter"&&submit()}
                  style={{width:"100%",boxSizing:"border-box",border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 42px 10px 13px",fontSize:15,outline:"none",background:T.elevated,color:T.text,colorScheme:"dark"}}
                  onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
                <button onClick={()=>setShowPw(s=>!s)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer"}}>
                  <Icon name={showPw?"eyeoff":"eye"} size={17} color={T.textSub}/>
                </button>
              </div>
            </div>
          )}
          <Btn loading={loading} style={{width:"100%",justifyContent:"center",marginTop:4}} onClick={submit}>
            {mode==="login"?"Sign In":mode==="signup"?"Create Account":"Send Reset"}
          </Btn>
        </div>
        <div style={{marginTop:20,display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
          {mode==="login" && <>
            <button onClick={()=>{setMode("signup");setError("");}} style={{background:"none",border:"none",color:T.accent,fontSize:14,fontWeight:600,cursor:"pointer"}}>No account? Sign up</button>
            <button onClick={()=>{setMode("reset");setError("");}} style={{background:"none",border:"none",color:T.textSub,fontSize:13,cursor:"pointer"}}>Forgot password?</button>
          </>}
          {mode!=="login" && <button onClick={()=>{setMode("login");setError("");}} style={{background:"none",border:"none",color:T.accent,fontSize:14,fontWeight:600,cursor:"pointer"}}>Back to sign in</button>}
        </div>
      </div>
    </div>
  );
};

// ── Data hooks ────────────────────────────────────────────────────────────
const useVials = (userId) => {
  const [vials,setVials] = useState([]);
  const [loading,setLoading] = useState(true);

  const load = useCallback(async () => {
    if(!userId) return;
    const {data,error} = await supabase.from("vials").select("*").order("created_at",{ascending:true});
    if(error) console.error("load vials:", error.message);
    const sorted = (data||[]).slice().sort((a,b)=>{
      const ao = a.sort_order ?? 999999;
      const bo = b.sort_order ?? 999999;
      if(ao!==bo) return ao-bo;
      return new Date(a.created_at)-new Date(b.created_at);
    });
    setVials(sorted);
    setLoading(false);
  },[userId]);

  useEffect(()=>{load();},[load]);

  const addVial = async (v) => {
    const {data,error} = await supabase.from("vials").insert({
      user_id:userId, name:v.name, total_mg:+v.totalMg, remaining_mg:+v.totalMg,
      dot:v.dot||null, notes:v.notes||null,
      status:v.status||"powder",
      bac_water_ml:v.bacWaterMl?+v.bacWaterMl:null,
      shape:v.shape||"circle",
      standard_dose_iu:v.standardDoseIu?+v.standardDoseIu:null,
      dose_unit:v.doseUnit||"mcg",
      cost_paid:v.costPaid?+v.costPaid:null,
    }).select().single();
    if(error) return {error};
    if(data) setVials(s=>[...s,data]);
    return {data};
  };

  const updateVial = async (id,v) => {
    const patch = {
      name:v.name, total_mg:+v.totalMg, remaining_mg:+v.remaining,
      dot:v.dot||null, notes:v.notes||null,
      status:v.status||"powder",
      bac_water_ml:v.bacWaterMl?+v.bacWaterMl:null,
      shape:v.shape||"circle",
      standard_dose_iu:v.standardDoseIu?+v.standardDoseIu:null,
      dose_unit:v.doseUnit||"mcg",
      cost_paid:v.costPaid?+v.costPaid:null,
    };
    await supabase.from("vials").update(patch).eq("id",id);
    setVials(s=>s.map(x=>x.id===id?{...x,...patch}:x));
  };

  const deductVial = async (id,mgAmount) => {
    const vial = vials.find(x=>x.id===id);
    if(!vial) return;
    const newRem = Math.max(0,+(vial.remaining_mg-mgAmount).toFixed(4));
    await supabase.from("vials").update({remaining_mg:newRem}).eq("id",id);
    setVials(s=>s.map(x=>x.id===id?{...x,remaining_mg:newRem}:x));
  };

  const deleteVial = async (id) => {
    await supabase.from("vials").delete().eq("id",id);
    setVials(s=>s.filter(x=>x.id!==id));
  };

  const reorderVials = async (reordered) => {
    // Optimistic update
    setVials(cur => {
      const ids = new Set(reordered.map(v=>v.id));
      return [...reordered, ...cur.filter(v=>!ids.has(v.id))];
    });
    await Promise.all(reordered.map((v,i)=>
      supabase.from("vials").update({sort_order:i}).eq("id",v.id)
    ));
  };

  return {vials,loading,addVial,updateVial,deductVial,deleteVial,reorderVials};
};

const useLog = (userId) => {
  const [entries,setEntries] = useState([]);

  useEffect(()=>{
    if(!userId) return;
    supabase.from("injection_log").select("*").order("injected_at",{ascending:false})
      .then(({data,error})=>{
        if(error) console.error("load log:", error.message);
        setEntries(data||[]);
      });
  },[userId]);

  const addEntry = async (e) => {
    const {data} = await supabase.from("injection_log").insert({
      user_id:userId, vial_id:e.vialId, vial_name:e.vialName, vial_dot:e.vialDot||null,
      dose_mcg:e.doseMcg?+e.doseMcg:null, dose_iu:e.doseIU?+e.doseIU:null,
      dose_ml:e.doseML?+e.doseML:null, injected_at:new Date(e.timestamp).toISOString(),
      notes:e.notes||null,
    }).select().single();
    if(data) setEntries(s=>[data,...s]);
  };

  const deleteEntry = async (id) => {
    await supabase.from("injection_log").delete().eq("id",id);
    setEntries(s=>s.filter(x=>x.id!==id));
  };

  return {entries,addEntry,deleteEntry};
};

// ── Calculator ────────────────────────────────────────────────────────────
const Calculator = () => {
  const [mg,setMg] = useState("");
  const [bac,setBac] = useState(1);
  const [mcg,setMcg] = useState("");
  const [iu,setIu] = useState("100");
  const [result,setResult] = useState(null);

  const calc = () => {
    const m=parseFloat(mg),b=parseFloat(bac),d=parseFloat(mcg),s=parseFloat(iu);
    if(!m||!b||!d||!s) return;
    const cpm=(m*1000)/b, ml=d/cpm;
    setResult({cpm,ml,iuNeeded:ml*s});
  };

  const stepBac = (dir) => setBac(v=>Math.max(0.5,parseFloat((v+dir*.5).toFixed(1))));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Card>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <NumInput label="Peptide (mg)" placeholder="5" value={mg} onChange={e=>setMg(e.target.value)}/>
          <NumInput label="Desired Dose (mcg)" placeholder="250" value={mcg} onChange={e=>setMcg(e.target.value)}/>
        </div>
        <div style={{marginTop:12}}>
          <label style={{fontSize:11,fontWeight:700,color:T.textSub,letterSpacing:.6,textTransform:"uppercase"}}>BAC Water (mL)</label>
          <div style={{display:"flex",gap:8,marginTop:5,alignItems:"center"}}>
            <button onClick={()=>stepBac(-1)} style={{width:40,height:40,borderRadius:10,border:"none",background:T.elevated,color:T.text,fontSize:22,cursor:"pointer"}}>−</button>
            <div style={{flex:1,textAlign:"center",background:T.elevated,borderRadius:10,padding:"10px",border:`1.5px solid ${T.border}`,fontSize:20,fontWeight:700,color:T.text}}>{bac} <span style={{fontSize:13,color:T.textSub}}>mL</span></div>
            <button onClick={()=>stepBac(1)} style={{width:40,height:40,borderRadius:10,border:"none",background:T.elevated,color:T.text,fontSize:22,cursor:"pointer"}}>+</button>
          </div>
        </div>
        <div style={{marginTop:12}}><NumInput label="Syringe (IU)" placeholder="100" value={iu} onChange={e=>setIu(e.target.value)}/></div>
        <Btn style={{width:"100%",justifyContent:"center",marginTop:16}} icon="flask" onClick={calc}>Calculate</Btn>
      </Card>
      {result && (
        <Card style={{borderColor:`${T.accent}44`}}>
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
            <span style={{color:T.textSub}}>Concentration</span>
            <span style={{color:T.text,fontWeight:600}}>{result.cpm.toFixed(0)} mcg/mL</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
            <span style={{color:T.textSub}}>Volume</span>
            <span style={{color:T.text,fontWeight:600}}>{result.ml.toFixed(3)} mL</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"12px 0 4px"}}>
            <span style={{color:T.textSub}}>Draw to</span>
            <span style={{fontSize:32,fontWeight:900,color:T.accent}}>{result.iuNeeded.toFixed(1)} <span style={{fontSize:14,color:T.textSub}}>IU</span></span>
          </div>
        </Card>
      )}
    </div>
  );
};

// ── Presets + dot renderer ────────────────────────────────────────────────
const PRESETS = [
  {name:"BPC-157",           totalMg:10,  unit:"mg",    dot:"#4caf72", shape:"circle"},
  {name:"TB-500",            totalMg:10,  unit:"mg",    dot:"#1a7a3c", shape:"circle"},
  {name:"GHK-Cu",            totalMg:50,  unit:"mg",    dot:"#2255cc", shape:"circle"},
  {name:"GLOW Blend",        totalMg:70,  unit:"mg",    dot:"rainbow", shape:"square"},
  {name:"Melanotan-1",       totalMg:10,  unit:"mg",    dot:"#e07020", shape:"circle"},
  {name:"CJC-1295 nDAC+Ipa", totalMg:10,  unit:"mg",    dot:"#e8e8e8", shape:"circle"},
  {name:"Sermorelin",        totalMg:10,  unit:"mg",    dot:"#e8e8e8", shape:"circle"},
  {name:"Tesamorelin",       totalMg:10,  unit:"mg",    dot:"#e8e8e8", shape:"circle"},
  {name:"NAD+",              totalMg:500, unit:"mg",    dot:"#888888", shape:"diamond"},
  {name:"Tirzepatide",       totalMg:10,  unit:"mg",    dot:"#e03030", shape:"circle"},
  {name:"Retatrutide",       totalMg:10,  unit:"mg",    dot:"#e03030", shape:"circle"},
  {name:"L-Carnitine",       totalMg:500, unit:"mg/mL", dot:"#e0c020", shape:"circle"},
];

const DotIcon = ({dot, shape="circle", size=9}) => {
  const base = {width:size, height:size, display:"inline-block", flexShrink:0,
    borderRadius: shape==="circle"?"50%": shape==="diamond"?"2px":"3px",
    transform: shape==="diamond"?"rotate(45deg)":"none"};
  if(dot==="rainbow") return <span style={{...base, width:size+2, height:size+2,
    background:"linear-gradient(135deg,#ff453a,#ff9f0a,#30d158,#4f9eff,#bf5af2)"}}/>;
  return <span style={{...base, background:dot}}/>;
};

// ── Inventory ─────────────────────────────────────────────────────────────
const Inventory = ({vials,addVial,updateVial,deleteVial,reorderVials}) => {
  const [modal,setModal] = useState(false);
  const [editId,setEditId] = useState(null);
  const [saving,setSaving] = useState(false);
  const [saveError,setSaveError] = useState("");
  const EMPTY = {name:"",totalMg:"",remaining:"",dot:"#4f9eff",shape:"circle",status:"powder",bacWaterMl:"",standardDoseIu:"10",doseUnit:"mcg",costPaid:"",notes:""};
  const [form,setForm] = useState(EMPTY);
  const [collapsed,setCollapsed] = useState({reconstituted:false,powder:false});
  const toggleCollapse = k => setCollapsed(s=>({...s,[k]:!s[k]}));

  const save = async () => {
    if(!form.name||!form.totalMg) return;
    setSaving(true); setSaveError("");
    const result = editId ? await updateVial(editId,form) : await addVial(form);
    setSaving(false);
    if(result?.error) { setSaveError(result.error.message); return; }
    setModal(false); setEditId(null); setForm(EMPTY);
  };

  const openEdit = (v) => {
    setForm({name:v.name,totalMg:v.total_mg,remaining:v.remaining_mg,dot:v.dot||"#4f9eff",shape:v.shape||"circle",status:v.status||"powder",bacWaterMl:v.bac_water_ml||"",standardDoseIu:v.standard_dose_iu||"10",doseUnit:v.dose_unit||"mcg",costPaid:v.cost_paid||"",notes:v.notes||""});
    setEditId(v.id); setModal(true);
  };

  const pct = (v) => Math.max(0,Math.min(100,Math.round((v.remaining_mg/v.total_mg)*100)));

  const folders = [
    {key:"reconstituted",label:"Active / Reconstituted",color:T.amber,icon:"💉"},
    {key:"powder",label:"Storage / Powder Only",color:T.textSub,icon:"🧪"},
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:13,color:T.textSub}}>{vials.length} vials</span>
        <Btn icon="plus" onClick={()=>{setEditId(null);setForm(EMPTY);setModal(true);}}>Add Vial</Btn>
      </div>

      {vials.length===0 && <Card style={{textAlign:"center",padding:48}}><p style={{color:T.textSub,margin:0}}>No vials yet.</p></Card>}

      {folders.map(f=>{
        const group = vials.filter(v=>(v.status||"powder")===f.key);
        if(!group.length) return null;
        const isOpen = !collapsed[f.key];

        const handleDragStart = (e,id) => { e.dataTransfer.setData("vialId",id); e.dataTransfer.setData("folderKey",f.key); e.dataTransfer.effectAllowed="move"; };
        const handleDragOver  = e => { e.preventDefault(); e.dataTransfer.dropEffect="move"; };
        const handleDrop = (e,targetId) => {
          e.preventDefault();
          const dragId = e.dataTransfer.getData("vialId");
          const fromFolder = e.dataTransfer.getData("folderKey");
          if(dragId===targetId||fromFolder!==f.key) return;
          const from=group.findIndex(v=>v.id===dragId);
          const to=group.findIndex(v=>v.id===targetId);
          if(from<0||to<0) return;
          const r=[...group]; const [m]=r.splice(from,1); r.splice(to,0,m);
          reorderVials(r);
        };

        return (
          <div key={f.key} style={{display:"flex",flexDirection:"column",gap:8}}>
            {/* Folder header — tappable to collapse */}
            <button onClick={()=>toggleCollapse(f.key)}
              style={{display:"flex",alignItems:"center",gap:8,padding:"12px 14px",background:T.elevated,border:`1px solid ${T.border}`,borderRadius:12,cursor:"pointer",textAlign:"left",width:"100%"}}>
              <span style={{fontSize:16}}>{f.icon}</span>
              <span style={{fontSize:13,fontWeight:800,color:f.color,textTransform:"uppercase",letterSpacing:.6,flex:1}}>{f.label}</span>
              <span style={{fontSize:12,color:T.textMute,fontWeight:600}}>({group.length})</span>
              {isOpen && group.length>1 && <span style={{fontSize:10,color:T.textMute,marginRight:4}}>drag</span>}
              <span style={{fontSize:14,color:T.textSub}}>{isOpen?"▾":"▸"}</span>
            </button>

            {isOpen && group.map(v=>{
              const p=pct(v), bar=p<25?T.red:p<50?T.amber:T.green;
              const dotC = v.dot==="rainbow"?"#bf5af2":(v.dot||T.accent);
              return (
                <div key={v.id} draggable onDragStart={e=>handleDragStart(e,v.id)} onDragOver={handleDragOver} onDrop={e=>handleDrop(e,v.id)} style={{borderRadius:16}}>
                <Card style={{borderLeft:`3px solid ${dotC}`,cursor:"grab"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                        <span style={{width:9,height:9,borderRadius:"50%",background:dotC,display:"inline-block"}}/>
                        <span style={{fontSize:16,fontWeight:800,color:T.text}}>{v.name}</span>
                        <span style={{fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:.6,padding:"2px 7px",borderRadius:6,
                          background:v.status==="reconstituted"?"rgba(255,214,10,.15)":"rgba(180,180,180,.12)",
                          color:v.status==="reconstituted"?T.amber:"#aaa",
                          border:`1px solid ${v.status==="reconstituted"?"rgba(255,214,10,.25)":"rgba(180,180,180,.2)"}`}}>
                          {v.status==="reconstituted"?"Reconstituted":"Powder Only"}
                        </span>
                        {p<25 && <Badge bg={T.redDim} color={T.red}>Low</Badge>}
                      </div>
                      <span style={{fontSize:12,color:T.textSub}}>{v.total_mg} mg · {fmtDate(v.created_at)}</span>
                    </div>
                    <div style={{display:"flex",gap:6,marginLeft:8}}>
                      <button onClick={()=>openEdit(v)} style={{background:T.elevated,border:"none",borderRadius:8,padding:"7px 9px",cursor:"pointer"}}><Icon name="edit" size={14} color={T.textSub}/></button>
                      <button onClick={()=>deleteVial(v.id)} style={{background:T.redDim,border:"none",borderRadius:8,padding:"7px 9px",cursor:"pointer"}}><Icon name="trash" size={14} color={T.red}/></button>
                    </div>
                  </div>
                  <div style={{marginTop:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:12,color:T.textSub}}>Remaining</span>
                      <span style={{fontSize:12,fontWeight:700,color:bar}}>{v.remaining_mg} mg ({p}%)</span>
                    </div>
                    <div style={{height:5,background:T.elevated,borderRadius:99}}>
                      <div style={{height:5,borderRadius:99,width:`${p}%`,background:bar}}/>
                    </div>
                  </div>
                  {v.notes && <p style={{marginTop:8,fontSize:12,color:T.textSub,marginBottom:0}}>{v.notes}</p>}
                </Card>
                </div>
              );
            })}
          </div>
        );
      })}

      <Modal open={modal} onClose={()=>{setModal(false);setSaveError("");}} title={editId?"Edit Vial":"Add Vial"}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>

          {/* Quick-add presets — new vials only */}
          {!editId && (
            <div>
              <label style={{fontSize:11,fontWeight:700,color:T.textSub,letterSpacing:.6,textTransform:"uppercase"}}>Quick Add</label>
              <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:8}}>
                {PRESETS.map(p=>(
                  <button key={p.name}
                    onClick={()=>setForm(f=>({...f,name:p.name,totalMg:String(p.totalMg),dot:p.dot,shape:p.shape}))}
                    style={{display:"flex",alignItems:"center",gap:10,
                      background:form.name===p.name?T.accentDim:T.elevated,
                      border:`1.5px solid ${form.name===p.name?T.accent:T.border}`,
                      borderRadius:10,padding:"9px 14px",cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
                    <DotIcon dot={p.dot} shape={p.shape} size={10}/>
                    <span style={{fontSize:14,fontWeight:600,color:T.text,flex:1}}>{p.name}</span>
                    <span style={{fontSize:12,color:T.textSub}}>{p.totalMg} {p.unit}</span>
                  </button>
                ))}
              </div>
              <div style={{height:1,background:T.border,margin:"14px 0 0"}}/>
            </div>
          )}

          {/* Dot color row */}
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <label style={{fontSize:11,fontWeight:700,color:T.textSub,letterSpacing:.6,textTransform:"uppercase",flexShrink:0}}>Color</label>
            {[
              {dot:"#4caf72",shape:"circle"},{dot:"#1a7a3c",shape:"circle"},
              {dot:"#2255cc",shape:"circle"},{dot:"#e07020",shape:"circle"},
              {dot:"#e03030",shape:"circle"},{dot:"#e0c020",shape:"circle"},
              {dot:"#888888",shape:"diamond"},{dot:"#e8e8e8",shape:"circle"},
              {dot:"rainbow",shape:"square"},{dot:"#4f9eff",shape:"circle"},
              {dot:"#bf5af2",shape:"circle"},
            ].map(opt=>(
              <button key={opt.dot} onClick={()=>setForm(f=>({...f,dot:opt.dot,shape:opt.shape}))}
                style={{width:24,height:24,padding:0,border:form.dot===opt.dot?"2.5px solid #fff":"2.5px solid transparent",
                  borderRadius:4,cursor:"pointer",background:"none",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <DotIcon dot={opt.dot} shape={opt.shape} size={15}/>
              </button>
            ))}
            <input type="color" value={form.dot&&form.dot!=="rainbow"?form.dot:"#4f9eff"}
              onChange={e=>setForm(f=>({...f,dot:e.target.value,shape:"circle"}))}
              style={{width:24,height:24,padding:0,border:"none",borderRadius:4,cursor:"pointer",background:"transparent"}}/>
          </div>

          <Input label="Name" placeholder="e.g. BPC-157" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          <NumInput label="Total (mg)" placeholder="10" value={form.totalMg} onChange={e=>setForm(f=>({...f,totalMg:e.target.value}))}/>
          {editId && <NumInput label="Remaining (mg)" value={form.remaining} onChange={e=>setForm(f=>({...f,remaining:e.target.value}))}/>}
          <Sel label="Status" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} options={[{value:"powder",label:"Powder Only"},{value:"reconstituted",label:"Reconstituted"}]}/>
          {form.status==="reconstituted" && <NumInput label="BAC Water (mL)" placeholder="2" value={form.bacWaterMl} onChange={e=>setForm(f=>({...f,bacWaterMl:e.target.value}))}/>}
          <NumInput label="Cost Paid ($, optional)" placeholder="45.00" value={form.costPaid} onChange={e=>setForm(f=>({...f,costPaid:e.target.value}))}/>
          <Input label="Notes (optional)" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
          {saveError && <div style={{background:T.redDim,borderRadius:10,padding:"10px 14px",fontSize:13,color:T.red}}>{saveError}</div>}
          <Btn loading={saving} icon="check" style={{width:"100%",justifyContent:"center"}} onClick={save}>{editId?"Save":"Add Vial"}</Btn>
        </div>
      </Modal>
    </div>
  );
};

// ── Log ───────────────────────────────────────────────────────────────────
const Log = ({vials,entries,addEntry,deleteEntry,deductVial}) => {
  const [modal,setModal] = useState(false);
  const [saving,setSaving] = useState(false);
  const EMPTY = {vialId:"",doseIU:"10",timestamp:localNow(),notes:""};
  const [form,setForm] = useState(EMPTY);

  const logEntry = async () => {
    if(!form.vialId||!form.doseIU) return;
    setSaving(true);
    const vial = vials.find(v=>v.id===form.vialId);
    let computedMcg=null, computedMl=null;
    if(vial?.bac_water_ml && vial?.total_mg) {
      const mcgPerMl=(vial.total_mg*1000)/vial.bac_water_ml;
      computedMl=Number(form.doseIU)/100;
      computedMcg=mcgPerMl*computedMl;
    }
    if(vial && computedMcg) await deductVial(vial.id,computedMcg/1000);
    await addEntry({...form,doseMcg:computedMcg?.toFixed(2),doseML:computedMl?.toFixed(3),vialName:vial?.name||"Unknown",vialDot:vial?.dot||""});
    setSaving(false); setModal(false); setForm({...EMPTY,timestamp:localNow()});
  };

  const grouped = entries.reduce((acc,e)=>{
    const day=new Date(e.injected_at).toDateString();
    if(!acc[day]) acc[day]=[];
    acc[day].push(e); return acc;
  },{});

  const reconVials = vials.filter(v=>v.status==="reconstituted");

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:13,color:T.textSub}}>{entries.length} injections</span>
        <Btn icon="plus" onClick={()=>{setForm({...EMPTY,timestamp:localNow()});setModal(true);}}>Log Injection</Btn>
      </div>
      {entries.length===0 && <Card style={{textAlign:"center",padding:48}}><p style={{color:T.textSub,margin:0}}>No injections logged yet.</p></Card>}
      {Object.entries(grouped).map(([day,dayEntries])=>(
        <div key={day}>
          <div style={{fontSize:11,fontWeight:700,color:T.textMute,textTransform:"uppercase",letterSpacing:.8,marginBottom:8}}>{day}</div>
          {dayEntries.map(e=>(
            <Card key={e.id} style={{padding:"12px 14px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,borderRadius:10,background:e.vial_dot?`${e.vial_dot}22`:T.accentDim,display:"flex",alignItems:"center",justifyContent:"center",border:`1.5px solid ${e.vial_dot||T.accent}44`}}>
                    {e.vial_dot?<span style={{width:12,height:12,borderRadius:"50%",background:e.vial_dot}}/>:<Icon name="syringe" size={15} color={T.accent}/>}
                  </div>
                  <div>
                    <div style={{fontSize:14,fontWeight:800,color:T.text}}>{e.vial_name}</div>
                    <div style={{fontSize:12,color:T.textSub}}>
                      {e.dose_iu && <span style={{color:T.accent}}>{e.dose_iu} IU</span>}
                      {e.dose_mcg && <span> · {+e.dose_mcg>=1000?(+e.dose_mcg/1000).toFixed(2)+" mg":(+e.dose_mcg).toFixed(1)+" mcg"}</span>}
                    </div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:11,color:T.textMute}}>{fmt(e.injected_at)}</div>
                  <button onClick={()=>deleteEntry(e.id)} style={{background:"none",border:"none",cursor:"pointer",padding:"4px 0"}}><Icon name="trash" size={13} color={T.textMute}/></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Log Injection">
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Sel label="Peptide" value={form.vialId} onChange={e=>setForm(f=>({...f,vialId:e.target.value}))}
            options={[{value:"",label:"Select vial…"},...reconVials.map(v=>({value:v.id,label:`${v.name} (${v.remaining_mg} mg left)`}))]}/>
          {reconVials.length===0 && <div style={{background:"rgba(255,214,10,.08)",border:"1px solid rgba(255,214,10,.25)",borderRadius:10,padding:"10px 14px",fontSize:13,color:T.amber}}>No reconstituted vials. Reconstitute a vial first.</div>}
          <div style={{background:T.elevated,borderRadius:12,padding:"14px",textAlign:"center"}}>
            <div style={{fontSize:11,fontWeight:700,color:T.textSub,letterSpacing:.6,textTransform:"uppercase",marginBottom:8}}>Units to Draw</div>
            <div style={{fontSize:44,fontWeight:900,color:T.accent,letterSpacing:-1}}>{form.doseIU||0} <span style={{fontSize:14,color:T.textSub}}>IU</span></div>
            {(()=>{
              const v=vials.find(x=>x.id===form.vialId);
              if(!v?.bac_water_ml||!v?.total_mg||!form.doseIU) return null;
              const amt=((v.total_mg*1000)/v.bac_water_ml)*(Number(form.doseIU)/100);
              return <div style={{fontSize:13,color:T.amber,fontWeight:600,marginTop:4}}>= {amt>=1000?(amt/1000).toFixed(3)+" mg":amt.toFixed(1)+" mcg"}</div>;
            })()}
            <div style={{display:"flex",gap:6,marginTop:12}}>
              {[-5,-1,1,5].map(n=>(
                <button key={n} onClick={()=>setForm(f=>({...f,doseIU:String(Math.max(0,Number(f.doseIU||0)+n))}))}
                  style={{flex:1,height:40,borderRadius:10,border:`1px solid ${T.border}`,background:T.surface,color:Math.abs(n)===5?T.accent:T.text,fontWeight:700,fontSize:13,cursor:"pointer"}}>
                  {n>0?"+":""}{n}
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:6,marginTop:8,justifyContent:"center"}}>
              {[5,10,20,25,50].map(n=>(
                <button key={n} onClick={()=>setForm(f=>({...f,doseIU:String(n)}))}
                  style={{padding:"4px 12px",borderRadius:20,border:`1.5px solid ${Number(form.doseIU)===n?T.accent:T.border}`,background:Number(form.doseIU)===n?T.accentDim:"transparent",color:Number(form.doseIU)===n?T.accent:T.textSub,fontSize:13,fontWeight:700,cursor:"pointer"}}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <Input label="Date & Time" type="datetime-local" value={form.timestamp} onChange={e=>setForm(f=>({...f,timestamp:e.target.value}))}/>
          <Input label="Notes (optional)" placeholder="Site, how you felt…" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
          <Btn loading={saving} icon="check" style={{width:"100%",justifyContent:"center"}} onClick={logEntry}>Log Injection</Btn>
        </div>
      </Modal>
    </div>
  );
};

// ── Cost ──────────────────────────────────────────────────────────────────
const Cost = ({vials,updateVial,reorderVials}) => {
  const [editId,setEditId] = useState(null);
  const [editVal,setEditVal] = useState("");
  const [saving,setSaving] = useState(false);

  const saveCost = async (v) => {
    setSaving(true);
    await updateVial(v.id,{name:v.name,totalMg:v.total_mg,remaining:v.remaining_mg,dot:v.dot,shape:v.shape||"circle",status:v.status||"powder",bacWaterMl:v.bac_water_ml,standardDoseIu:v.standard_dose_iu,doseUnit:v.dose_unit||"mcg",notes:v.notes,costPaid:editVal?+editVal:null});
    setSaving(false); setEditId(null); setEditVal("");
  };

  const cpd = (v) => {
    if(!v.cost_paid||!v.total_mg||v.status!=="reconstituted"||!v.standard_dose_iu||!v.bac_water_ml) return null;
    const doses=(v.total_mg*1000)/(((v.total_mg*1000)/v.bac_water_ml)*(v.standard_dose_iu/100));
    return doses>0?v.cost_paid/doses:null;
  };

  const totalVal = vials.reduce((s,v)=>s+(v.cost_paid||0),0);
  const remVal = vials.reduce((s,v)=>s+(v.cost_paid||0)*(v.remaining_mg/v.total_mg),0);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card style={{background:"linear-gradient(135deg,#1a2a1a,#1a1a2a)"}}>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <div><div style={{fontSize:11,fontWeight:700,color:T.textSub,textTransform:"uppercase",letterSpacing:.7,marginBottom:4}}>Total Paid</div>
            <div style={{fontSize:28,fontWeight:900,color:T.text}}>${totalVal.toFixed(2)}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:11,fontWeight:700,color:T.textSub,textTransform:"uppercase",letterSpacing:.7,marginBottom:4}}>Remaining Value</div>
            <div style={{fontSize:24,fontWeight:800,color:T.green}}>${remVal.toFixed(2)}</div></div>
        </div>
      </Card>
      {vials.length===0 && <Card style={{textAlign:"center",padding:48}}><p style={{color:T.textSub,margin:0}}>Add vials first.</p></Card>}
      {vials.map(v=>{
        const p=Math.max(0,Math.min(100,Math.round((v.remaining_mg/v.total_mg)*100)));
        const bar=p<25?T.red:p<50?T.amber:T.green;
        const c=cpd(v);
        const isEditing=editId===v.id;
        return (
          <Card key={v.id} style={{padding:"12px 14px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{width:9,height:9,borderRadius:"50%",background:v.dot||T.accent,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:800,color:T.text}}>{v.name}</div>
                <div style={{height:3,background:T.elevated,borderRadius:99,marginTop:4}}>
                  <div style={{height:3,borderRadius:99,width:`${p}%`,background:bar}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
                  <span style={{fontSize:11,color:T.textSub}}>{v.remaining_mg} mg ({p}%)</span>
                  {c && <span style={{fontSize:11,color:T.amber,fontWeight:700}}>${c.toFixed(2)}/dose</span>}
                </div>
              </div>
              <div style={{flexShrink:0}}>
                {isEditing?(
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",background:T.elevated,borderRadius:8,border:`1.5px solid ${T.accent}`,overflow:"hidden"}}>
                      <span style={{paddingLeft:8,fontSize:13,color:T.textSub}}>$</span>
                      <input type="number" inputMode="decimal" autoFocus value={editVal} onChange={e=>setEditVal(e.target.value)}
                        style={{width:60,padding:"7px 8px",fontSize:13,background:"transparent",border:"none",outline:"none",color:T.text,colorScheme:"dark"}}/>
                    </div>
                    <button onClick={()=>saveCost(v)} style={{background:T.green,border:"none",borderRadius:8,padding:"7px 9px",cursor:"pointer"}}><Icon name="check" size={13} color="#000"/></button>
                    <button onClick={()=>{setEditId(null);setEditVal("");}} style={{background:T.elevated,border:"none",borderRadius:8,padding:"7px 9px",cursor:"pointer"}}><Icon name="x" size={13} color={T.textSub}/></button>
                  </div>
                ):(
                  <button onClick={()=>{setEditId(v.id);setEditVal(v.cost_paid||"");}}
                    style={{background:T.elevated,border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                    <span style={{fontSize:13,fontWeight:700,color:v.cost_paid?T.text:T.textSub}}>{v.cost_paid?`$${(+v.cost_paid).toFixed(2)}`:"Add $"}</span>
                    <Icon name="edit" size={12} color={T.textSub}/>
                  </button>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// ── Calendar ──────────────────────────────────────────────────────────────
const Calendar = ({vials,entries}) => {
  const [weekOffset,setWeekOffset] = useState(0);
  const [selDay,setSelDay] = useState(null);
  const [dayModal,setDayModal] = useState(false);

  const toYMD = d => { const p=n=>String(n).padStart(2,"0"); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`; };
  const addDays = (d,n) => { const r=new Date(d); r.setDate(r.getDate()+n); return r; };
  const today = new Date(), todayYMD = toYMD(today);
  const weekStart = addDays(today,-today.getDay()+weekOffset*7);
  const days = Array.from({length:7},(_,i)=>addDays(weekStart,i));
  const mmdd = d => d.toLocaleDateString("en-US",{month:"short",day:"numeric"});

  const byDay = {};
  entries.forEach(e=>{ const d=toYMD(new Date(e.injected_at)); if(!byDay[d]) byDay[d]=[]; byDay[d].push(e); });

  const wStart=toYMD(weekStart), wEnd=toYMD(days[6]);
  const weekEntries=entries.filter(e=>{ const d=toYMD(new Date(e.injected_at)); return d>=wStart&&d<=wEnd; });
  const summary={};
  weekEntries.forEach(e=>{ const k=e.vial_id||e.vial_name; if(!summary[k]) summary[k]={name:e.vial_name,dot:e.vial_dot,days:new Set(),mcg:0}; summary[k].days.add(toYMD(new Date(e.injected_at))); summary[k].mcg+=+(e.dose_mcg||0); });

  const streak = (key) => { let s=0,d=new Date(today); const set=new Set(entries.filter(e=>(e.vial_id||e.vial_name)===key).map(e=>toYMD(new Date(e.injected_at)))); while(set.has(toYMD(d))){s++;d=addDays(d,-1);} return s; };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <button onClick={()=>setWeekOffset(w=>w-1)} style={{width:36,height:36,borderRadius:10,border:`1px solid ${T.border}`,background:T.elevated,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth={2.2} strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <span style={{flex:1,textAlign:"center",fontSize:13,fontWeight:700,color:T.text}}>Week of {mmdd(weekStart)} – {mmdd(days[6])}</span>
        <button onClick={()=>setWeekOffset(w=>Math.min(0,w+1))} disabled={weekOffset>=0}
          style={{width:36,height:36,borderRadius:10,border:`1px solid ${T.border}`,background:T.elevated,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:weekOffset>=0?.3:1}}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth={2.2} strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      <Card style={{padding:"12px 8px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
          {days.map((day,i)=>{
            const ymd=toYMD(day), isToday=ymd===todayYMD, logs=byDay[ymd]||[], sel=selDay===ymd;
            const dots=[...new Map(logs.map(e=>[e.vial_id||e.vial_name,e.vial_dot])).entries()];
            return (
              <button key={ymd} onClick={()=>{setSelDay(ymd);setDayModal(true);}}
                style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"6px 2px",borderRadius:9,border:`1.5px solid ${sel?T.accent:isToday?"rgba(79,158,255,.4)":"transparent"}`,background:sel?T.accentDim:isToday?"rgba(79,158,255,.07)":"transparent",cursor:"pointer"}}>
                <span style={{fontSize:9,fontWeight:700,color:T.textSub}}>{"SMTWTFS"[i]}</span>
                <span style={{fontSize:15,fontWeight:isToday?900:600,color:isToday?T.accent:T.text}}>{day.getDate()}</span>
                <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:2,minHeight:12}}>
                  {dots.slice(0,4).map(([k,dot])=><span key={k} style={{width:6,height:6,borderRadius:"50%",background:dot||T.accent}}/>)}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {Object.keys(summary).length>0 && (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{fontSize:11,fontWeight:700,color:T.textSub,textTransform:"uppercase",letterSpacing:.7}}>This Week</div>
          {Object.entries(summary).map(([k,s])=>{
            const str=streak(k), mg=s.mcg/1000;
            return (
              <Card key={k} style={{padding:"12px 14px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <span style={{width:9,height:9,borderRadius:"50%",background:s.dot||T.accent}}/>
                  <span style={{fontSize:14,fontWeight:800,color:T.text}}>{s.name}</span>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <div style={{flex:1,background:T.elevated,borderRadius:8,padding:"7px",textAlign:"center"}}>
                    <div style={{fontSize:13,fontWeight:700,color:T.text}}>{mg>=1?mg.toFixed(2)+" mg":s.mcg.toFixed(1)+" mcg"}</div>
                    <div style={{fontSize:10,color:T.textSub,marginTop:1}}>this week</div>
                  </div>
                  <div style={{flex:1,background:T.elevated,borderRadius:8,padding:"7px",textAlign:"center"}}>
                    <div style={{fontSize:13,fontWeight:700,color:str>=5?T.green:str>=3?T.amber:T.text}}>{str} day{str!==1?"s":""}{str>=2?" 🔥":""}</div>
                    <div style={{fontSize:10,color:T.textSub,marginTop:1}}>streak</div>
                  </div>
                  <div style={{flex:1,background:T.elevated,borderRadius:8,padding:"7px",textAlign:"center"}}>
                    <div style={{fontSize:13,fontWeight:700,color:T.accent}}>{s.days.size}</div>
                    <div style={{fontSize:10,color:T.textSub,marginTop:1}}>days taken</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={dayModal} onClose={()=>setDayModal(false)} title={selDay?new Date(selDay+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}):""}>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {(byDay[selDay]||[]).length===0
            ? <p style={{color:T.textSub,textAlign:"center",padding:"20px 0",margin:0}}>Nothing logged this day.</p>
            : (byDay[selDay]||[]).map(e=>(
              <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,background:T.elevated,borderRadius:10,padding:"10px 12px"}}>
                <span style={{width:10,height:10,borderRadius:"50%",background:e.vial_dot||T.accent,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:T.text}}>{e.vial_name}</div>
                  <div style={{fontSize:12,color:T.textSub}}>{e.dose_iu&&<span style={{color:T.accent}}>{e.dose_iu} IU · </span>}{e.dose_mcg&&<span>{+e.dose_mcg>=1000?(+e.dose_mcg/1000).toFixed(2)+" mg":(+e.dose_mcg).toFixed(1)+" mcg"}</span>}</div>
                </div>
                <div style={{fontSize:11,color:T.textMute}}>{new Date(e.injected_at).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}</div>
              </div>
            ))
          }
        </div>
      </Modal>
    </div>
  );
};

// ── CSV helpers ──────────────────────────────────────────────────────────
const escapeCSV = v => {
  if(v===null||v===undefined) return "";
  const s = String(v);
  return (s.includes(",")||s.includes('"')||s.includes("\n")) ? `"${s.replace(/"/g,'""')}"` : s;
};
const toCSV = (headers,rows) => [headers,...rows].map(r=>r.map(escapeCSV).join(",")).join("\n");
const downloadCSV = (filename,csv) => {
  const blob = new Blob([csv],{type:"text/csv;charset=utf-8;"});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url);
};

// ── Export Modal ──────────────────────────────────────────────────────────
const ExportModal = ({open,onClose,vials,entries}) => {
  const [done,setDone] = useState(false);

  const handle = () => {
    const ts  = new Date().toISOString().slice(0,10);
    const fmtD = d => new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});

    const vialsCSV = toCSV(
      ["Name","Total (mg)","Remaining (mg)","% Left","Status","BAC Water (mL)",
       "Std Dose (IU)","Dose Unit","Cost Paid","Notes","Added"],
      vials.map(v=>[
        v.name, v.total_mg, v.remaining_mg,
        Math.round((v.remaining_mg/v.total_mg)*100)+"%",
        v.status||"powder", v.bac_water_ml||"",
        v.standard_dose_iu||"", v.dose_unit||"mcg",
        v.cost_paid||"", v.notes||"", fmtD(v.created_at),
      ])
    );

    const logCSV = toCSV(
      ["Peptide","IU","Dose (mcg)","Volume (mL)","Injected At","Notes"],
      entries.map(e=>[
        e.vial_name, e.dose_iu||"", e.dose_mcg||"", e.dose_ml||"",
        new Date(e.injected_at).toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}),
        e.notes||"",
      ])
    );

    const combined = [
      `PinPal Export — ${ts}`,
      "",
      "=== INVENTORY ===",
      vialsCSV,
      "",
      "=== INJECTION LOG ===",
      logCSV,
    ].join("\n");

    downloadCSV(`pinpal-export-${ts}.csv`, combined);
    setDone(true);
    setTimeout(()=>{ setDone(false); onClose(); }, 1800);
  };

  return (
    <Modal open={open} onClose={onClose} title="Export Data">
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <p style={{fontSize:14,color:T.text,margin:0}}>
          Downloads a single <strong style={{color:T.accent}}>.csv</strong> with your full inventory and injection log. Nothing leaves your device until you choose where to save it.
        </p>
        {[
          {label:"Vials",  count:vials.length,   icon:"box"},
          {label:"Injections", count:entries.length, icon:"clock"},
        ].map(r=>(
          <div key={r.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:T.elevated,borderRadius:10,padding:"12px 14px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Icon name={r.icon} size={16} color={T.accent}/>
              <span style={{fontSize:14,color:T.text}}>{r.label}</span>
            </div>
            <span style={{fontSize:13,fontWeight:700,color:T.accent,background:T.accentDim,padding:"3px 10px",borderRadius:20}}>
              {r.count} row{r.count!==1?"s":""}
            </span>
          </div>
        ))}
        <Btn
          variant={done?"success":"primary"}
          icon={done?"check":"download"}
          style={{width:"100%",justifyContent:"center",marginTop:4}}
          onClick={handle}>
          {done?"Downloaded!":"Download CSV"}
        </Btn>
        <p style={{fontSize:11,color:T.textMute,textAlign:"center",margin:0}}>
          Saved locally · no data sent anywhere
        </p>
      </div>
    </Modal>
  );
};

// ── Root ──────────────────────────────────────────────────────────────────
const TABS = [
  {id:"calc",  label:"Calculator",icon:"flask"},
  {id:"inv",   label:"Inventory", icon:"box"},
  {id:"cal",   label:"Calendar",  icon:"calendar"},
  {id:"log",   label:"Log",       icon:"clock"},
  {id:"cost",  label:"Cost",      icon:"dollar"},
];

export default function App() {
  const [user,setUser] = useState(null);
  const [authLoading,setAuthLoading] = useState(true);
  const [tab,setTab] = useState("inv");
  const [exportOpen,setExportOpen] = useState(false);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{ setUser(session?.user??null); setAuthLoading(false); });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,session)=>setUser(session?.user??null));
    return ()=>subscription.unsubscribe();
  },[]);

  const {vials,loading,addVial,updateVial,deductVial,deleteVial,reorderVials} = useVials(user?.id);
  const {entries,addEntry,deleteEntry} = useLog(user?.id);

  if(authLoading) return <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:32,height:32,border:`3px solid ${T.border}`,borderTopColor:T.accent,borderRadius:"50%",animation:"spin .7s linear infinite"}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(!user) return <AuthScreen onAuth={setUser}/>;

  const lowCount = vials.filter(v=>(v.remaining_mg/v.total_mg)<0.25).length;

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"-apple-system,BlinkMacSystemFont,sans-serif",colorScheme:"dark"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;} ::-webkit-scrollbar{display:none;}`}</style>
      <ExportModal open={exportOpen} onClose={()=>setExportOpen(false)} vials={vials} entries={entries}/>

      <div style={{background:`${T.surface}ee`,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:`1px solid ${T.border}`,position:"sticky",top:0,zIndex:50,paddingTop:"env(safe-area-inset-top)"}}>
        <div style={{padding:"14px 18px 0",maxWidth:700,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:34,height:34,borderRadius:9,overflow:"hidden",flexShrink:0}}>
                <img src="/icon.png" alt="" style={{width:"100%",height:"100%"}} onError={e=>e.target.style.display="none"}/>
              </div>
              <div>
                <h1 style={{fontSize:20,fontWeight:900,color:T.text,margin:0,letterSpacing:-.6}}>PinPal</h1>
                <p style={{fontSize:10,color:T.textMute,margin:0,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.email}</p>
              </div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {lowCount>0 && <div style={{display:"flex",alignItems:"center",gap:4,background:T.redDim,borderRadius:10,padding:"5px 10px"}}><Icon name="alert" size={13} color={T.red}/><span style={{fontSize:11,fontWeight:700,color:T.red}}>{lowCount} low</span></div>}
              <button onClick={()=>setExportOpen(true)} title="Export CSV" style={{background:T.elevated,border:`1px solid ${T.border}`,borderRadius:10,width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                <Icon name="download" size={15} color={T.textSub}/>
              </button>
              <button onClick={()=>supabase.auth.signOut()} style={{background:T.elevated,border:`1px solid ${T.border}`,borderRadius:10,width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                <Icon name="logout" size={15} color={T.textSub}/>
              </button>
            </div>
          </div>
          <div style={{display:"flex"}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"6px 2px 11px",border:"none",background:"transparent",cursor:"pointer",borderBottom:`2px solid ${tab===t.id?T.accent:"transparent"}`}}>
                <Icon name={t.icon} size={18} color={tab===t.id?T.accent:T.textMute}/>
                <span style={{fontSize:9,fontWeight:700,letterSpacing:.3,color:tab===t.id?T.accent:T.textMute}}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:700,margin:"0 auto",padding:"16px 14px 120px"}}>
        {loading ? (
          <div style={{display:"flex",justifyContent:"center",padding:60}}>
            <div style={{width:28,height:28,border:`3px solid ${T.border}`,borderTopColor:T.accent,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
          </div>
        ) : <>
          {tab==="inv"  && <Inventory vials={vials} addVial={addVial} updateVial={updateVial} deleteVial={deleteVial} reorderVials={reorderVials}/>}
          {tab==="calc" && <Calculator/>}
          {tab==="cal"  && <Calendar  vials={vials} entries={entries}/>}
          {tab==="log"  && <Log vials={vials} entries={entries} addEntry={addEntry} deleteEntry={deleteEntry} deductVial={deductVial}/>}
          {tab==="cost" && <Cost vials={vials} updateVial={updateVial} reorderVials={reorderVials}/>}
        </>}
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────────────────
// CONFIG — replace these two values after creating your Supabase project
// ─────────────────────────────────────────────────────────────────────────
const SUPABASE_URL  = "https://shpkomsojxelggdmaeog.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNocGtvbXNvanhlbGdnZG1hZW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MjQzMzUsImV4cCI6MjA4OTUwMDMzNX0.YZGOsS9xtBxZDQ3sBmzo-_n2rMYGwXW96z1rUczFvLg";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Theme ─────────────────────────────────────────────────────────────────
const T = {
  bg:"#0d0d0f", surface:"#17171a", elevated:"#1f1f24", border:"#2a2a30",
  accent:"#4f9eff", accentDim:"rgba(79,158,255,.15)",
  green:"#30d158", greenDim:"rgba(48,209,88,.15)",
  red:"#ff453a", redDim:"rgba(255,69,58,.15)",
  amber:"#ffd60a",
  text:"#f2f2f7", textSub:"#8e8e93", textMute:"#48484e",
};

// ── Presets ───────────────────────────────────────────────────────────────
const PRESETS = [
  { name:"BPC-157",     totalMg:10,  unit:"mg",    dot:"#1a7a3c" },
  { name:"GHK-Cu",      totalMg:50,  unit:"mg",    dot:"#2255cc" },
  { name:"Melanotan-1", totalMg:10,  unit:"mg",    dot:"#e07020" },
  { name:"Tirzepatide", totalMg:10,  unit:"mg",    dot:"#e03030" },
  { name:"Retatrutide", totalMg:10,  unit:"mg",    dot:"#e03030" },
  { name:"L-Carnitine", totalMg:500, unit:"mg/mL", dot:"#e0c020" },
];

// ── Helpers ───────────────────────────────────────────────────────────────
const uid     = () => Math.random().toString(36).slice(2,9);
const fmt     = (d) => new Date(d).toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});

// ── Storage mode — localStorage when no real keys, Supabase when deployed ─
const USE_LOCAL = SUPABASE_URL === "YOUR_SUPABASE_URL";

// localStorage adapter — mirrors Supabase field names so components work identically
const LS = {
  get: (k) => { try { return JSON.parse(localStorage.getItem("pp_"+k))||[]; } catch { return []; } },
  set: (k, v) => localStorage.setItem("pp_"+k, JSON.stringify(v)),
};

// Fake user for local mode
const LOCAL_USER = { id:"local", email:"local@pinpal.app" };

// ── CSV ───────────────────────────────────────────────────────────────────
const escapeCSV = (v) => {
  if(v===null||v===undefined) return "";
  const s = String(v);
  return (s.includes(",")||s.includes('"')||s.includes("\n")) ? `"${s.replace(/"/g,'""')}"` : s;
};
const toCSV = (headers,rows) => [headers,...rows].map(r=>r.map(escapeCSV).join(",")).join("\n");
const downloadCSV = (filename,csv) => {
  const blob = new Blob([csv],{type:"text/csv;charset=utf-8;"});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
};

// ── Icons ─────────────────────────────────────────────────────────────────
const Icon = ({name,size=20,color="currentColor"}) => {
  const paths = {
    flask:    "M9 3v7L4.5 18h15L15 10V3M9 3h6M9 3H7m8 0h2",
    box:      "M21 8l-9-5-9 5m18 0v8l-9 5-9-5V8m9 5v9m0-9L3 8",
    calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    plus:     "M12 4v16m-8-8h16",
    trash:    "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a2 2 0 00-2-2H9a2 2 0 00-2 2m12 0H3",
    check:    "M5 13l4 4L19 7",
    alert:    "M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
    x:        "M6 18L18 6M6 6l12 12",
    syringe:  "M18 2l4 4-1 1-4-4 1-1zm-2 2l-10 10m1 5l-4 1 1-4m3 3l-2-2m9-11l2 2",
    edit:     "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    clock:    "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    download: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
    pin:      "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
    user:     "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
    logout:   "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
    eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
    eyeoff:   "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24 M1 1l22 22",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]}/>
    </svg>
  );
};

// ── Primitives ────────────────────────────────────────────────────────────
const Badge = ({children,bg=T.accentDim,color=T.accent}) => (
  <span style={{background:bg,color,fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:20,letterSpacing:.3,whiteSpace:"nowrap"}}>{children}</span>
);

const Card = ({children,style={}}) => (
  <div style={{background:T.surface,borderRadius:16,padding:"18px",border:`1px solid ${T.border}`,...style}}>{children}</div>
);

const NumInput = ({label,value,onChange,placeholder,style={},...rest}) => (
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label && <label style={{fontSize:11,fontWeight:700,color:T.textSub,letterSpacing:.6,textTransform:"uppercase"}}>{label}</label>}
    <input type="number" inputMode="decimal" pattern="[0-9]*" value={value} onChange={onChange} placeholder={placeholder}
      style={{border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 13px",fontSize:15,outline:"none",background:T.elevated,color:T.text,transition:"border-color .15s",colorScheme:"dark",...style}}
      onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border} {...rest}/>
  </div>
);

const Input = ({label,...props}) => (
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label && <label style={{fontSize:11,fontWeight:700,color:T.textSub,letterSpacing:.6,textTransform:"uppercase"}}>{label}</label>}
    <input {...props} style={{border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 13px",fontSize:15,outline:"none",background:T.elevated,color:T.text,transition:"border-color .15s",colorScheme:"dark",...props.style}}
      onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/>
  </div>
);

const Sel = ({label,options,...props}) => (
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label && <label style={{fontSize:11,fontWeight:700,color:T.textSub,letterSpacing:.6,textTransform:"uppercase"}}>{label}</label>}
    <select {...props} style={{border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 13px",fontSize:15,outline:"none",background:T.elevated,color:T.text,appearance:"none",cursor:"pointer",colorScheme:"dark",...props.style}}>
      {options.map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
    </select>
  </div>
);

const Btn = ({children,variant="primary",icon,loading=false,style={},...props}) => {
  const v = {
    primary:   {background:T.accent,   color:"#fff"},
    secondary: {background:T.elevated, color:T.text},
    danger:    {background:T.red,      color:"#fff"},
    ghost:     {background:"transparent",color:T.accent,padding:"8px 4px"},
    success:   {background:T.green,    color:"#000"},
  };
  return (
    <button {...props} disabled={loading||props.disabled}
      style={{display:"inline-flex",alignItems:"center",gap:7,borderRadius:12,padding:"11px 18px",fontSize:14,fontWeight:700,cursor:loading?"not-allowed":"pointer",border:"none",transition:"transform .1s,opacity .15s",letterSpacing:.2,opacity:loading?0.6:1,...v[variant],...style}}
      onMouseDown={e=>!loading&&(e.currentTarget.style.transform="scale(.96)")}
      onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
      {icon && !loading && <Icon name={icon} size={16} color={variant==="success"?"#000":"currentColor"}/>}
      {loading && <span style={{width:14,height:14,border:"2px solid currentColor",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>}
      {children}
    </button>
  );
};

const Modal = ({open,onClose,title,children}) => {
  if(!open) return null;
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",backdropFilter:"blur(8px)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:T.surface,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:520,maxHeight:"92vh",overflowY:"auto",border:`1px solid ${T.border}`,borderBottom:"none"}}>
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

const BacStepper = ({value,onChange}) => {
  const dec = () => onChange(Math.max(0.5,parseFloat((parseFloat(value||1)-0.5).toFixed(1))));
  const inc = () => onChange(parseFloat((parseFloat(value||0)+0.5).toFixed(1)));
  const bs  = {width:40,height:40,borderRadius:10,border:"none",cursor:"pointer",background:T.elevated,color:T.text,fontSize:22,fontWeight:300,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"transform .1s"};
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      <label style={{fontSize:11,fontWeight:700,color:T.textSub,letterSpacing:.6,textTransform:"uppercase"}}>BAC Water (mL)</label>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <button style={bs} onMouseDown={e=>e.currentTarget.style.transform="scale(.9)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"} onClick={dec}>−</button>
        <div style={{flex:1,textAlign:"center",background:T.elevated,borderRadius:10,padding:"10px 0",border:`1.5px solid ${T.border}`,fontSize:20,fontWeight:700,color:T.text,letterSpacing:-.5}}>
          {value||"0"} <span style={{fontSize:13,fontWeight:400,color:T.textSub}}>mL</span>
        </div>
        <button style={bs} onMouseDown={e=>e.currentTarget.style.transform="scale(.9)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"} onClick={inc}>+</button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// AUTH SCREEN
// ══════════════════════════════════════════════════════════════════════════
const AuthScreen = ({onAuth}) => {
  const [mode,    setMode]    = useState("login"); // login | signup | reset
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [info,    setInfo]    = useState("");

  const submit = async () => {
    setError(""); setInfo(""); setLoading(true);
    try {
      if(mode==="login") {
        const {data,error} = await supabase.auth.signInWithPassword({email,password:pass});
        if(error) throw error;
        onAuth(data.user);
      } else if(mode==="signup") {
        const {data,error} = await supabase.auth.signUp({email,password:pass});
        if(error) throw error;
        setInfo("Check your email to confirm your account, then log in.");
        setMode("login");
      } else {
        const {error} = await supabase.auth.resetPasswordForEmail(email);
        if(error) throw error;
        setInfo("Password reset email sent. Check your inbox.");
        setMode("login");
      }
    } catch(e) {
      setError(e.message||"Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px",fontFamily:"-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif",colorScheme:"dark"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Logo */}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,marginBottom:40}}>
        <div style={{width:64,height:64,borderRadius:18,background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 40px ${T.accentDim}`}}>
          <Icon name="pin" size={32} color="#fff"/>
        </div>
        <div style={{textAlign:"center"}}>
          <h1 style={{fontSize:30,fontWeight:900,letterSpacing:-1,color:T.text,margin:0}}>PinPal</h1>
          <p style={{fontSize:13,color:T.textMute,margin:"4px 0 0",letterSpacing:.3}}>Peptide management</p>
        </div>
      </div>

      {/* Card */}
      <div style={{width:"100%",maxWidth:380,background:T.surface,borderRadius:20,padding:"28px 24px",border:`1px solid ${T.border}`}}>
        <h2 style={{fontSize:20,fontWeight:800,color:T.text,margin:"0 0 20px",textAlign:"center"}}>
          {mode==="login"?"Welcome back":mode==="signup"?"Create account":"Reset password"}
        </h2>

        {error && (
          <div style={{background:T.redDim,border:`1px solid ${T.red}44`,borderRadius:10,padding:"10px 14px",marginBottom:16,display:"flex",gap:8,alignItems:"flex-start"}}>
            <Icon name="alert" size={15} color={T.red}/>
            <span style={{fontSize:13,color:T.red,lineHeight:1.4}}>{error}</span>
          </div>
        )}
        {info && (
          <div style={{background:T.greenDim,border:`1px solid ${T.green}44`,borderRadius:10,padding:"10px 14px",marginBottom:16}}>
            <span style={{fontSize:13,color:T.green,lineHeight:1.4}}>{info}</span>
          </div>
        )}

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>

          {mode!=="reset" && (
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              <label style={{fontSize:11,fontWeight:700,color:T.textSub,letterSpacing:.6,textTransform:"uppercase"}}>Password</label>
              <div style={{position:"relative"}}>
                <input type={showPw?"text":"password"} value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••"
                  style={{width:"100%",boxSizing:"border-box",border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 42px 10px 13px",fontSize:15,outline:"none",background:T.elevated,color:T.text,colorScheme:"dark"}}
                  onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}
                  onKeyDown={e=>e.key==="Enter"&&submit()}/>
                <button onClick={()=>setShowPw(s=>!s)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:4,color:T.textSub}}>
                  <Icon name={showPw?"eyeoff":"eye"} size={17} color={T.textSub}/>
                </button>
              </div>
            </div>
          )}

          <Btn loading={loading} style={{width:"100%",justifyContent:"center",marginTop:4}} onClick={submit}>
            {mode==="login"?"Sign In":mode==="signup"?"Create Account":"Send Reset Email"}
          </Btn>
        </div>

        <div style={{marginTop:20,display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
          {mode==="login" && <>
            <button onClick={()=>{setMode("signup");setError("");setInfo("");}} style={{background:"none",border:"none",color:T.accent,fontSize:14,fontWeight:600,cursor:"pointer"}}>Don't have an account? Sign up</button>
            <button onClick={()=>{setMode("reset");setError("");setInfo("");}} style={{background:"none",border:"none",color:T.textSub,fontSize:13,cursor:"pointer"}}>Forgot password?</button>
          </>}
          {mode!=="login" && (
            <button onClick={()=>{setMode("login");setError("");setInfo("");}} style={{background:"none",border:"none",color:T.accent,fontSize:14,fontWeight:600,cursor:"pointer"}}>Back to sign in</button>
          )}
        </div>
      </div>

      <p style={{marginTop:24,fontSize:12,color:T.textMute,textAlign:"center",maxWidth:300,lineHeight:1.6}}>
        Your data is private and only visible to you. It is never shared with other users.
      </p>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// DATA HOOKS — dual mode: localStorage (preview) or Supabase (deployed)
// ══════════════════════════════════════════════════════════════════════════
const useVials = (userId) => {
  const [vials,   setVialsState] = useState([]);
  const [loading, setLoading]    = useState(true);

  const load = useCallback(async () => {
    if(!userId) return;
    if(USE_LOCAL) {
      setVialsState(LS.get("vials"));
      setLoading(false);
      return;
    }
    const {data} = await supabase.from("vials").select("*").order("created_at",{ascending:true});
    setVialsState(data||[]);
    setLoading(false);
  },[userId]);

  useEffect(()=>{load();},[load]);

  const addVial = async (v) => {
    const row = {id:uid(),user_id:userId,name:v.name,total_mg:+v.totalMg,remaining_mg:+v.totalMg,dot:v.dot||null,notes:v.notes||null,created_at:new Date().toISOString()};
    if(USE_LOCAL) {
      const next = [...LS.get("vials"), row];
      LS.set("vials", next);
      setVialsState(next);
      return;
    }
    const {data} = await supabase.from("vials").insert({...row,id:undefined}).select().single();
    if(data) setVialsState(s=>[...s,data]);
  };

  const updateVial = async (id,v) => {
    const row = {name:v.name,total_mg:+v.totalMg,remaining_mg:+v.remaining,dot:v.dot||null,notes:v.notes||null};
    if(USE_LOCAL) {
      const next = LS.get("vials").map(x=>x.id===id?{...x,...row}:x);
      LS.set("vials", next);
      setVialsState(next);
      return;
    }
    await supabase.from("vials").update(row).eq("id",id);
    setVialsState(s=>s.map(x=>x.id===id?{...x,...row}:x));
  };

  const deductVial = async (id,mgAmount) => {
    const vial = vials.find(x=>x.id===id);
    if(!vial) return;
    const newRem = Math.max(0,+(vial.remaining_mg - mgAmount).toFixed(4));
    if(USE_LOCAL) {
      const next = LS.get("vials").map(x=>x.id===id?{...x,remaining_mg:newRem}:x);
      LS.set("vials", next);
      setVialsState(next);
      return;
    }
    await supabase.from("vials").update({remaining_mg:newRem}).eq("id",id);
    setVialsState(s=>s.map(x=>x.id===id?{...x,remaining_mg:newRem}:x));
  };

  const deleteVial = async (id) => {
    if(USE_LOCAL) {
      const next = LS.get("vials").filter(x=>x.id!==id);
      LS.set("vials", next);
      setVialsState(next);
      return;
    }
    await supabase.from("vials").delete().eq("id",id);
    setVialsState(s=>s.filter(x=>x.id!==id));
  };

  return {vials,loading,addVial,updateVial,deductVial,deleteVial,reload:load};
};

const useProtocols = (userId) => {
  const [protocols, setProtos] = useState([]);

  useEffect(()=>{
    if(!userId) return;
    if(USE_LOCAL) { setProtos(LS.get("protocols")); return; }
    supabase.from("protocols").select("*").order("created_at",{ascending:true}).then(({data})=>setProtos(data||[]));
  },[userId]);

  const addProto = async (p) => {
    const row = {id:uid(),user_id:userId,name:p.name,type:p.type,frequency:p.frequency,start_date:p.startDate||null,end_date:p.endDate||null,active:true,doses:p.doses,notes:p.notes||null,created_at:new Date().toISOString()};
    if(USE_LOCAL) {
      const next = [...LS.get("protocols"), row];
      LS.set("protocols", next);
      setProtos(next);
      return;
    }
    const {data} = await supabase.from("protocols").insert({...row,id:undefined}).select().single();
    if(data) setProtos(s=>[...s,data]);
  };

  const toggleProto = async (id,active) => {
    if(USE_LOCAL) {
      const next = LS.get("protocols").map(x=>x.id===id?{...x,active:!active}:x);
      LS.set("protocols", next);
      setProtos(next);
      return;
    }
    await supabase.from("protocols").update({active:!active}).eq("id",id);
    setProtos(s=>s.map(x=>x.id===id?{...x,active:!active}:x));
  };

  const deleteProto = async (id) => {
    if(USE_LOCAL) {
      const next = LS.get("protocols").filter(x=>x.id!==id);
      LS.set("protocols", next);
      setProtos(next);
      return;
    }
    await supabase.from("protocols").delete().eq("id",id);
    setProtos(s=>s.filter(x=>x.id!==id));
  };

  return {protocols,addProto,toggleProto,deleteProto};
};

const useLog = (userId) => {
  const [entries, setEntries] = useState([]);

  useEffect(()=>{
    if(!userId) return;
    if(USE_LOCAL) { setEntries(LS.get("log")); return; }
    supabase.from("injection_log").select("*").order("logged_at",{ascending:false}).then(({data})=>setEntries(data||[]));
  },[userId]);

  const addEntry = async (e) => {
    const row = {id:uid(),user_id:userId,vial_id:e.vialId,vial_name:e.vialName,vial_dot:e.vialDot||null,dose_mcg:e.doseMcg?+e.doseMcg:null,dose_iu:e.doseIU?+e.doseIU:null,dose_ml:e.doseML?+e.doseML:null,injected_at:new Date(e.timestamp).toISOString(),notes:e.notes||null,logged_at:new Date().toISOString()};
    if(USE_LOCAL) {
      const next = [row, ...LS.get("log")];
      LS.set("log", next);
      setEntries(next);
      return;
    }
    const {data} = await supabase.from("injection_log").insert({...row,id:undefined}).select().single();
    if(data) setEntries(s=>[data,...s]);
  };

  const deleteEntry = async (id) => {
    if(USE_LOCAL) {
      const next = LS.get("log").filter(x=>x.id!==id);
      LS.set("log", next);
      setEntries(next);
      return;
    }
    await supabase.from("injection_log").delete().eq("id",id);
    setEntries(s=>s.filter(x=>x.id!==id));
  };

  return {entries,addEntry,deleteEntry};
};

// ══════════════════════════════════════════════════════════════════════════
// CALCULATOR
// ══════════════════════════════════════════════════════════════════════════
const Calculator = () => {
  const [peptideMg,  setPeptideMg]  = useState("");
  const [bacWaterMl, setBacWaterMl] = useState(1);
  const [desiredMcg, setDesiredMcg] = useState("");
  const [syringeIU,  setSyringeIU]  = useState("100");
  const [result,     setResult]     = useState(null);

  const calculate = () => {
    const mg=parseFloat(peptideMg),bac=parseFloat(bacWaterMl),mcg=parseFloat(desiredMcg),iu=parseFloat(syringeIU);
    if(!mg||!bac||!mcg||!iu) return;
    const mcgPerMl=(mg*1000)/bac, mlNeeded=mcg/mcgPerMl;
    setResult({mcgPerMl,mlNeeded,iuNeeded:mlNeeded*iu});
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Card>
        <p style={{fontSize:13,color:T.textSub,margin:"0 0 16px"}}>Enter your vial info and desired dose to get exact syringe measurements.</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <NumInput label="Peptide (mg)" placeholder="e.g. 5" value={peptideMg} onChange={e=>setPeptideMg(e.target.value)}/>
          <NumInput label="Desired Dose (mcg)" placeholder="e.g. 250" value={desiredMcg} onChange={e=>setDesiredMcg(e.target.value)}/>
        </div>
        <div style={{marginTop:12}}><BacStepper value={bacWaterMl} onChange={setBacWaterMl}/></div>
        <div style={{marginTop:12}}><NumInput label="Syringe Size (IU)" placeholder="100" value={syringeIU} onChange={e=>setSyringeIU(e.target.value)}/></div>
        <Btn style={{width:"100%",justifyContent:"center",marginTop:16}} icon="flask" onClick={calculate}>Calculate</Btn>
      </Card>
      {result && (
        <Card style={{borderColor:`${T.accent}44`}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}>
            <Icon name="check" size={15} color={T.green}/>
            <span style={{fontSize:11,fontWeight:700,color:T.green,textTransform:"uppercase",letterSpacing:.8}}>Results</span>
          </div>
          {[{label:"Concentration",val:`${result.mcgPerMl.toFixed(0)} mcg / mL`},{label:"Volume to draw",val:`${result.mlNeeded.toFixed(3)} mL`}].map(r=>(
            <div key={r.label} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
              <span style={{fontSize:14,color:T.textSub}}>{r.label}</span>
              <span style={{fontSize:15,fontWeight:600,color:T.text}}>{r.val}</span>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"14px 0 8px"}}>
            <span style={{fontSize:14,color:T.textSub}}>Draw to</span>
            <span style={{fontSize:34,fontWeight:900,color:T.accent,letterSpacing:-1.5}}>{result.iuNeeded.toFixed(1)}<span style={{fontSize:16,fontWeight:500,color:T.textSub,marginLeft:5}}>IU</span></span>
          </div>
          <div style={{background:T.accentDim,borderRadius:10,padding:"11px 14px"}}>
            <p style={{fontSize:13,color:T.text,margin:0}}>Draw to <strong style={{color:T.accent}}>{result.iuNeeded.toFixed(1)} IU</strong> on a {syringeIU}-IU syringe for exactly <strong>{desiredMcg} mcg</strong>.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// INVENTORY
// ══════════════════════════════════════════════════════════════════════════
const Inventory = ({vials,addVial,updateVial,deleteVial}) => {
  const [modal,  setModal]  = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const EMPTY = {name:"",totalMg:"",remaining:"",dot:"",notes:""};
  const [form, setForm] = useState(EMPTY);

  const save = async () => {
    if(!form.name||!form.totalMg) return;
    setSaving(true);
    if(editId) {
      await updateVial(editId,form);
    } else {
      await addVial(form);
    }
    setSaving(false); setModal(false); setEditId(null); setForm(EMPTY);
  };

  const openEdit = (v) => {
    setForm({name:v.name,totalMg:v.total_mg,remaining:v.remaining_mg,dot:v.dot||"",notes:v.notes||""});
    setEditId(v.id); setModal(true);
  };

  const pct = (v) => Math.max(0,Math.min(100,Math.round((v.remaining_mg/v.total_mg)*100)));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:13,color:T.textSub}}>{vials.length} vial{vials.length!==1?"s":""} tracked</span>
        <Btn icon="plus" onClick={()=>{setEditId(null);setForm(EMPTY);setModal(true);}}>Add Vial</Btn>
      </div>

      {vials.length===0 && <Card style={{textAlign:"center",padding:52}}><Icon name="box" size={40} color={T.textMute}/><p style={{color:T.textMute,marginTop:12,fontSize:14}}>No vials yet. Add your first one.</p></Card>}

      {vials.map(v=>{
        const p=pct(v); const barColor=p<25?T.red:p<50?T.amber:T.green;
        return (
          <Card key={v.id} style={{borderLeft:`3px solid ${v.dot||T.accent}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  {v.dot && <span style={{width:9,height:9,borderRadius:"50%",background:v.dot,display:"inline-block",flexShrink:0}}/>}
                  <span style={{fontSize:17,fontWeight:800,color:T.text}}>{v.name}</span>
                  {p<25 && <Badge bg={T.redDim} color={T.red}>Low Supply</Badge>}
                </div>
                <span style={{fontSize:13,color:T.textSub}}>{v.total_mg} mg total · added {fmtDate(v.created_at)}</span>
              </div>
              <div style={{display:"flex",gap:6,marginLeft:8}}>
                <button onClick={()=>openEdit(v)} style={{background:T.elevated,border:"none",borderRadius:8,padding:"7px 9px",cursor:"pointer"}}><Icon name="edit" size={15} color={T.textSub}/></button>
                <button onClick={()=>deleteVial(v.id)} style={{background:T.redDim,border:"none",borderRadius:8,padding:"7px 9px",cursor:"pointer"}}><Icon name="trash" size={15} color={T.red}/></button>
              </div>
            </div>
            <div style={{marginTop:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                <span style={{fontSize:13,color:T.textSub}}>Remaining</span>
                <span style={{fontSize:13,fontWeight:700,color:barColor}}>{v.remaining_mg} mg ({p}%)</span>
              </div>
              <div style={{height:5,background:T.elevated,borderRadius:99}}>
                <div style={{height:5,borderRadius:99,width:`${p}%`,background:barColor,transition:"width .5s ease"}}/>
              </div>
            </div>
            {v.notes && <p style={{marginTop:10,fontSize:13,color:T.textSub,marginBottom:0}}>{v.notes}</p>}
          </Card>
        );
      })}

      <Modal open={modal} onClose={()=>setModal(false)} title={editId?"Edit Vial":"Add Vial"}>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {!editId && (
            <div>
              <label style={{fontSize:11,fontWeight:700,color:T.textSub,letterSpacing:.6,textTransform:"uppercase"}}>Quick Add</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:8}}>
                {PRESETS.map(p=>(
                  <button key={p.name} onClick={()=>setForm(f=>({...f,name:p.name,totalMg:p.totalMg,dot:p.dot}))}
                    style={{display:"flex",alignItems:"center",gap:6,background:form.name===p.name?T.accentDim:T.elevated,border:`1.5px solid ${form.name===p.name?T.accent:T.border}`,borderRadius:20,padding:"6px 12px",cursor:"pointer",transition:"all .15s"}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:p.dot,flexShrink:0}}/>
                    <span style={{fontSize:13,fontWeight:600,color:T.text,whiteSpace:"nowrap"}}>{p.name}</span>
                    <span style={{fontSize:11,color:T.textSub}}>{p.totalMg} {p.unit}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{height:1,background:T.border}}/>
          <Input label="Peptide Name" placeholder="e.g. BPC-157" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>

          <div>
            <label style={{fontSize:11,fontWeight:700,color:T.textSub,letterSpacing:.6,textTransform:"uppercase"}}>Dot Color</label>
            <div style={{display:"flex",gap:10,marginTop:8,alignItems:"center",flexWrap:"wrap"}}>
              {["#1a7a3c","#2255cc","#e07020","#e03030","#e0c020","#8855dd","#4f9eff","#30d158"].map(c=>(
                <button key={c} onClick={()=>setForm(f=>({...f,dot:c}))}
                  style={{width:26,height:26,borderRadius:"50%",background:c,border:form.dot===c?"3px solid #fff":"3px solid transparent",cursor:"pointer"}}/>
              ))}
              <input type="color" value={form.dot||"#4f9eff"} onChange={e=>setForm(f=>({...f,dot:e.target.value}))} style={{width:26,height:26,padding:0,border:"none",borderRadius:"50%",cursor:"pointer",background:"transparent"}}/>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <NumInput label="Total (mg)" placeholder="10" value={form.totalMg} onChange={e=>setForm(f=>({...f,totalMg:e.target.value}))}/>
            {editId && <NumInput label="Remaining (mg)" placeholder="10" value={form.remaining} onChange={e=>setForm(f=>({...f,remaining:e.target.value}))}/>}
          </div>
          <Input label="Notes (optional)" placeholder="Storage, source, batch…" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
          <Btn loading={saving} style={{width:"100%",justifyContent:"center"}} icon="check" onClick={save}>{editId?"Save Changes":"Add Vial"}</Btn>
        </div>
      </Modal>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// PROTOCOLS
// ══════════════════════════════════════════════════════════════════════════
const Protocols = ({vials,protocols,addProto,toggleProto,deleteProto}) => {
  const [modal,  setModal]  = useState(false);
  const [saving, setSaving] = useState(false);
  const [form,   setForm]   = useState({name:"",type:"single",startDate:"",endDate:"",frequency:"daily",doses:[{vialId:"",doseMcg:"",time:"08:00"}],notes:""});

  const addDose  = () => setForm(f=>({...f,doses:[...f.doses,{vialId:"",doseMcg:"",time:"08:00"}]}));
  const updDose  = (i,k,v) => setForm(f=>{const d=[...f.doses];d[i]={...d[i],[k]:v};return{...f,doses:d};});
  const remDose  = (i) => setForm(f=>({...f,doses:f.doses.filter((_,j)=>j!==i)}));

  const save = async () => {
    if(!form.name) return;
    setSaving(true);
    await addProto(form);
    setSaving(false); setModal(false);
    setForm({name:"",type:"single",startDate:"",endDate:"",frequency:"daily",doses:[{vialId:"",doseMcg:"",time:"08:00"}],notes:""});
  };

  const freqLabel = {daily:"Every day",eod:"Every other day","3x":"3× / week","2x":"Twice daily"};

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:13,color:T.textSub}}>{protocols.filter(p=>p.active).length} active</span>
        <Btn icon="plus" onClick={()=>setModal(true)}>New Protocol</Btn>
      </div>

      {protocols.length===0 && <Card style={{textAlign:"center",padding:52}}><Icon name="calendar" size={40} color={T.textMute}/><p style={{color:T.textMute,marginTop:12,fontSize:14}}>No protocols yet.</p></Card>}

      {protocols.map(p=>{
        const vial0=vials.find(x=>x.id===p.doses?.[0]?.vialId);
        const dotColor=vial0?.dot||T.accent;
        return (
          <Card key={p.id} style={{opacity:p.active?1:.5,borderLeft:`3px solid ${dotColor}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:3}}>
                  <span style={{fontSize:17,fontWeight:800,color:T.text}}>{p.name}</span>
                  <Badge bg={p.active?T.greenDim:T.elevated} color={p.active?T.green:T.textSub}>{p.active?"Active":"Paused"}</Badge>
                  <Badge bg={T.elevated} color={T.textSub}>{p.type==="single"?"Single":"Stack"}</Badge>
                </div>
                <span style={{fontSize:13,color:T.textSub}}>{freqLabel[p.frequency]} · {(p.doses||[]).length} compound{(p.doses||[]).length!==1?"s":""}</span>
                {p.start_date && <div style={{fontSize:12,color:T.textMute,marginTop:2}}>{fmtDate(p.start_date)}{p.end_date?` → ${fmtDate(p.end_date)}`:" → ongoing"}</div>}
              </div>
              <div style={{display:"flex",gap:6,marginLeft:8}}>
                <button onClick={()=>toggleProto(p.id,p.active)} style={{background:T.elevated,border:"none",borderRadius:8,padding:"7px 10px",cursor:"pointer",fontSize:12,fontWeight:700,color:T.textSub,whiteSpace:"nowrap"}}>{p.active?"Pause":"Resume"}</button>
                <button onClick={()=>deleteProto(p.id)} style={{background:T.redDim,border:"none",borderRadius:8,padding:"7px 9px",cursor:"pointer"}}><Icon name="trash" size={15} color={T.red}/></button>
              </div>
            </div>
            <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:6}}>
              {(p.doses||[]).map((d,i)=>{
                const v=vials.find(x=>x.id===d.vialId);
                return (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:T.elevated,borderRadius:9,padding:"9px 13px"}}>
                    {v?.dot ? <span style={{width:8,height:8,borderRadius:"50%",background:v.dot,flexShrink:0}}/> : <Icon name="syringe" size={14} color={T.accent}/>}
                    <span style={{fontSize:14,fontWeight:700,color:T.text}}>{v?v.name:<span style={{color:T.textMute}}>Unknown</span>}</span>
                    <span style={{fontSize:13,color:T.textSub,marginLeft:"auto"}}>{d.doseMcg} mcg @ {d.time}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}

      <Modal open={modal} onClose={()=>setModal(false)} title="New Protocol">
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Input label="Protocol Name" placeholder="e.g. BPC + TB500 Healing Stack" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Sel label="Type" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} options={[{value:"single",label:"Single peptide"},{value:"stack",label:"Multi-peptide stack"}]}/>
            <Sel label="Frequency" value={form.frequency} onChange={e=>setForm(f=>({...f,frequency:e.target.value}))} options={[{value:"daily",label:"Daily"},{value:"eod",label:"Every other day"},{value:"3x",label:"3× / week"},{value:"2x",label:"Twice daily"}]}/>
            <Input label="Start Date" type="date" value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))}/>
            <Input label="End Date (opt.)" type="date" value={form.endDate} onChange={e=>setForm(f=>({...f,endDate:e.target.value}))}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <label style={{fontSize:11,fontWeight:700,color:T.textSub,textTransform:"uppercase",letterSpacing:.6}}>Compounds</label>
            <Btn variant="ghost" icon="plus" onClick={addDose}>Add</Btn>
          </div>
          {form.doses.map((d,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 72px 66px 34px",gap:8,alignItems:"end"}}>
              <Sel label={i===0?"Peptide":""} value={d.vialId} onChange={e=>updDose(i,"vialId",e.target.value)} options={[{value:"",label:"Select…"},...vials.map(v=>({value:v.id,label:v.name}))]}/>
              <NumInput label={i===0?"mcg":""} placeholder="250" value={d.doseMcg} onChange={e=>updDose(i,"doseMcg",e.target.value)}/>
              <Input label={i===0?"Time":""} type="time" value={d.time} onChange={e=>updDose(i,"time",e.target.value)}/>
              {form.doses.length>1 && <button onClick={()=>remDose(i)} style={{background:T.redDim,border:"none",borderRadius:8,height:40,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",marginTop:i===0?20:0}}><Icon name="x" size={14} color={T.red}/></button>}
            </div>
          ))}
          <Input label="Notes (optional)" placeholder="Titration plan, goals…" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
          <Btn loading={saving} style={{width:"100%",justifyContent:"center"}} icon="check" onClick={save}>Create Protocol</Btn>
        </div>
      </Modal>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// LOG
// ══════════════════════════════════════════════════════════════════════════
const Log = ({vials,entries,addEntry,deleteEntry,deductVial}) => {
  const [modal,  setModal]  = useState(false);
  const [saving, setSaving] = useState(false);
  const EMPTY = {vialId:"",doseMcg:"",doseIU:"10",doseML:"",timestamp:new Date().toISOString().slice(0,16),notes:""};
  const [form, setForm] = useState(EMPTY);

  const logEntry = async () => {
    if(!form.vialId||!form.doseMcg) return;
    setSaving(true);
    const vial = vials.find(v=>v.id===form.vialId);
    if(vial && form.doseMcg) await deductVial(vial.id, parseFloat(form.doseMcg)/1000);
    await addEntry({...form, vialName:vial?.name||"Unknown", vialDot:vial?.dot||""});
    setSaving(false); setModal(false); setForm(EMPTY);
  };

  const grouped = entries.reduce((acc,e)=>{
    const day = new Date(e.injected_at||e.logged_at).toDateString();
    if(!acc[day]) acc[day]=[];
    acc[day].push(e); return acc;
  },{});

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:13,color:T.textSub}}>{entries.length} injection{entries.length!==1?"s":""} logged</span>
        <Btn icon="plus" onClick={()=>{setForm({...EMPTY,timestamp:new Date().toISOString().slice(0,16)});setModal(true);}}>Log Injection</Btn>
      </div>

      {entries.length===0 && <Card style={{textAlign:"center",padding:52}}><Icon name="clock" size={40} color={T.textMute}/><p style={{color:T.textMute,marginTop:12,fontSize:14}}>No injections logged yet.</p></Card>}

      {Object.entries(grouped).map(([day,dayEntries])=>(
        <div key={day}>
          <div style={{fontSize:11,fontWeight:700,color:T.textMute,textTransform:"uppercase",letterSpacing:.8,marginBottom:8,paddingLeft:2}}>{day}</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {dayEntries.map(e=>(
              <Card key={e.id} style={{padding:"14px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:38,height:38,borderRadius:11,background:e.vial_dot?`${e.vial_dot}22`:T.accentDim,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:`1.5px solid ${e.vial_dot||T.accent}44`}}>
                      {e.vial_dot ? <span style={{width:14,height:14,borderRadius:"50%",background:e.vial_dot}}/> : <Icon name="syringe" size={17} color={T.accent}/>}
                    </div>
                    <div>
                      <div style={{fontSize:15,fontWeight:800,color:T.text}}>{e.vial_name}</div>
                      <div style={{fontSize:13}}>
                        <span style={{color:T.text}}>{e.dose_mcg} mcg</span>
                        {e.dose_iu ? <span style={{color:T.accent}}> · {e.dose_iu} IU</span> : ""}
                        {e.dose_ml ? <span style={{color:T.textSub}}> · {e.dose_ml} mL</span> : ""}
                      </div>
                    </div>
                  </div>
                  <div style={{textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                    <div style={{fontSize:12,color:T.textMute}}>{fmt(e.injected_at)}</div>
                    <button onClick={()=>deleteEntry(e.id)} style={{background:"none",border:"none",cursor:"pointer",padding:0}}><Icon name="trash" size={14} color={T.textMute}/></button>
                  </div>
                </div>
                {e.notes && <p style={{marginTop:8,fontSize:13,color:T.textSub,paddingLeft:50,marginBottom:0}}>{e.notes}</p>}
              </Card>
            ))}
          </div>
        </div>
      ))}

      <Modal open={modal} onClose={()=>setModal(false)} title="Log Injection">
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <Sel label="Peptide" value={form.vialId} onChange={e=>setForm(f=>({...f,vialId:e.target.value}))} options={[{value:"",label:"Select vial…"},...vials.map(v=>({value:v.id,label:`${v.name} (${v.remaining_mg} mg left)`}))]}/>

          <div style={{background:T.elevated,borderRadius:14,padding:"14px 14px 16px",border:`1px solid ${T.border}`}}>
            <label style={{fontSize:11,fontWeight:700,color:T.textSub,letterSpacing:.6,textTransform:"uppercase"}}>IU Dose — Quick Set</label>
            <div style={{textAlign:"center",margin:"10px 0 14px"}}>
              <span style={{fontSize:48,fontWeight:900,color:T.accent,letterSpacing:-2,lineHeight:1}}>{form.doseIU||0}</span>
              <span style={{fontSize:16,fontWeight:500,color:T.textSub,marginLeft:6}}>IU</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
              <span style={{fontSize:11,fontWeight:700,color:T.textMute,width:24,textAlign:"right"}}>±1</span>
              <button onClick={()=>setForm(f=>({...f,doseIU:String(Math.max(0,Number(f.doseIU||0)-1))}))} style={{flex:1,height:42,borderRadius:10,border:`1px solid ${T.border}`,background:T.surface,color:T.text,fontSize:22,fontWeight:300,cursor:"pointer"}} onMouseDown={e=>e.currentTarget.style.transform="scale(.94)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>−</button>
              <button onClick={()=>setForm(f=>({...f,doseIU:String(Number(f.doseIU||0)+1)}))} style={{flex:1,height:42,borderRadius:10,border:`1px solid ${T.border}`,background:T.surface,color:T.text,fontSize:22,fontWeight:300,cursor:"pointer"}} onMouseDown={e=>e.currentTarget.style.transform="scale(.94)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>+</button>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12}}>
              <span style={{fontSize:11,fontWeight:700,color:T.textMute,width:24,textAlign:"right"}}>±5</span>
              <button onClick={()=>setForm(f=>({...f,doseIU:String(Math.max(0,Number(f.doseIU||0)-5))}))} style={{flex:1,height:42,borderRadius:10,border:`1px solid ${T.border}`,background:T.surface,color:T.accent,fontSize:15,fontWeight:700,cursor:"pointer"}} onMouseDown={e=>e.currentTarget.style.transform="scale(.94)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>−5</button>
              <button onClick={()=>setForm(f=>({...f,doseIU:String(Number(f.doseIU||0)+5)}))} style={{flex:1,height:42,borderRadius:10,border:`1px solid ${T.border}`,background:T.surface,color:T.accent,fontSize:15,fontWeight:700,cursor:"pointer"}} onMouseDown={e=>e.currentTarget.style.transform="scale(.94)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>+5</button>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              {[10,20,25,50].map(n=>(
                <button key={n} onClick={()=>setForm(f=>({...f,doseIU:String(n)}))}
                  style={{padding:"5px 14px",borderRadius:20,border:`1.5px solid ${Number(form.doseIU)===n?T.accent:T.border}`,background:Number(form.doseIU)===n?T.accentDim:"transparent",color:Number(form.doseIU)===n?T.accent:T.textSub,fontSize:13,fontWeight:700,cursor:"pointer",transition:"all .15s"}}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div style={{height:1,background:T.border}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <NumInput label="Dose (mcg)" placeholder="250" value={form.doseMcg} onChange={e=>setForm(f=>({...f,doseMcg:e.target.value}))}/>
            <NumInput label="IU (override)" placeholder="—" value={form.doseIU} onChange={e=>setForm(f=>({...f,doseIU:e.target.value}))}/>
            <NumInput label="mL drawn" placeholder="0.25" value={form.doseML} onChange={e=>setForm(f=>({...f,doseML:e.target.value}))}/>
          </div>
          <Input label="Date & Time" type="datetime-local" value={form.timestamp} onChange={e=>setForm(f=>({...f,timestamp:e.target.value}))}/>
          <Input label="Notes (optional)" placeholder="Site, how you felt, etc." value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
          <Btn loading={saving} style={{width:"100%",justifyContent:"center"}} icon="check" onClick={logEntry}>Log Injection</Btn>
        </div>
      </Modal>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// EXPORT
// ══════════════════════════════════════════════════════════════════════════
const ExportModal = ({open,onClose,vials,protocols,entries}) => {
  const [done,setDone] = useState(false);
  const handle = () => {
    const ts = new Date().toISOString().slice(0,10);
    const vialsCSV = toCSV(["ID","Name","Total (mg)","Remaining (mg)","% Left","Notes","Created"],vials.map(v=>[v.id,v.name,v.total_mg,v.remaining_mg,Math.round((v.remaining_mg/v.total_mg)*100),v.notes||"",fmtDate(v.created_at)]));
    const protoCSV = toCSV(["ID","Name","Type","Frequency","Start","End","Active","Notes"],protocols.map(p=>[p.id,p.name,p.type,p.frequency,p.start_date||"",p.end_date||"",p.active?"Yes":"No",p.notes||""]));
    const logCSV   = toCSV(["ID","Peptide","Dose (mcg)","IU","mL","Injected At","Notes"],entries.map(e=>[e.id,e.vial_name,e.dose_mcg||"",e.dose_iu||"",e.dose_ml||"",e.injected_at,e.notes||""]));
    const combined = [`PinPal Export — ${ts}`,"","=== INVENTORY ===",vialsCSV,"","=== PROTOCOLS ===",protoCSV,"","=== INJECTION LOG ===",logCSV].join("\n");
    downloadCSV(`pinpal-export-${ts}.csv`,combined);
    setDone(true); setTimeout(()=>{setDone(false);onClose();},1800);
  };
  return (
    <Modal open={open} onClose={onClose} title="Export Data">
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <p style={{fontSize:14,color:T.textSub,margin:0}}>Single <strong style={{color:T.text}}>.csv</strong> with all three sections. Downloaded to your device.</p>
        {[{label:"Vials",count:vials.length,icon:"box"},{label:"Protocols",count:protocols.length,icon:"calendar"},{label:"Injection entries",count:entries.length,icon:"clock"}].map(r=>(
          <div key={r.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:T.elevated,borderRadius:10,padding:"12px 14px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}><Icon name={r.icon} size={17} color={T.accent}/><span style={{fontSize:14,color:T.text}}>{r.label}</span></div>
            <Badge>{r.count} row{r.count!==1?"s":""}</Badge>
          </div>
        ))}
        <Btn variant={done?"success":"primary"} icon={done?"check":"download"} style={{width:"100%",justifyContent:"center",marginTop:4}} onClick={handle}>{done?"Downloaded!":"Download CSV"}</Btn>
      </div>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════════════════════════
const TABS = [
  {id:"calc",  label:"Calculator", icon:"flask"},
  {id:"inv",   label:"Inventory",  icon:"box"},
  {id:"proto", label:"Protocols",  icon:"calendar"},
  {id:"log",   label:"Log",        icon:"clock"},
];

export default function App() {
  const [user,        setUser]        = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab,         setTab]         = useState("calc");
  const [exportOpen,  setExportOpen]  = useState(false);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user??null);
      setAuthLoading(false);
    });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,session)=>{
      setUser(session?.user??null);
    });
    return ()=>subscription.unsubscribe();
  },[]);

  const {vials,loading:vialsLoading,addVial,updateVial,deductVial,deleteVial} = useVials(user?.id);
  const {protocols,addProto,toggleProto,deleteProto}                         = useProtocols(user?.id);
  const {entries,addEntry,deleteEntry}                                        = useLog(user?.id);

  const signOut = () => { if(USE_LOCAL) { setUser(null); } else { supabase.auth.signOut(); } };

  if(USE_LOCAL && !user) {
    // Skip auth in local/preview mode — auto sign in as local user
    setUser(LOCAL_USER);
  }

  if(!USE_LOCAL && authLoading) return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:32,height:32,border:`3px solid ${T.border}`,borderTopColor:T.accent,borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if(!USE_LOCAL && !user) return <AuthScreen onAuth={setUser}/>;

  const lowCount = vials.filter(v=>(v.remaining_mg/v.total_mg)<0.25).length;

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif",colorScheme:"dark"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <ExportModal open={exportOpen} onClose={()=>setExportOpen(false)} vials={vials} protocols={protocols} entries={entries}/>

      {/* Header */}
      <div style={{background:`${T.surface}f0`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.border}`,position:"sticky",top:0,zIndex:50}}>
        <div style={{maxWidth:520,margin:"0 auto",padding:"16px 18px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:T.accent,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Icon name="pin" size={19} color="#fff"/>
              </div>
              <div>
                <h1 style={{fontSize:22,fontWeight:900,letterSpacing:-.7,color:T.text,margin:0,lineHeight:1.1}}>PinPal</h1>
                <p style={{fontSize:11,color:T.textMute,margin:0,letterSpacing:.3,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{USE_LOCAL ? "Preview mode" : user.email}</p>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {lowCount>0 && (
                <div style={{display:"flex",alignItems:"center",gap:5,background:T.redDim,borderRadius:10,padding:"6px 11px"}}>
                  <Icon name="alert" size={14} color={T.red}/>
                  <span style={{fontSize:12,fontWeight:700,color:T.red}}>{lowCount} low</span>
                </div>
              )}
              <button onClick={()=>setExportOpen(true)} title="Export" style={{background:T.elevated,border:`1px solid ${T.border}`,borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                <Icon name="download" size={16} color={T.textSub}/>
              </button>
              {!USE_LOCAL && (
                <button onClick={signOut} title="Sign out" style={{background:T.elevated,border:`1px solid ${T.border}`,borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                  <Icon name="logout" size={16} color={T.textSub}/>
                </button>
              )}
            </div>
          </div>

          <div style={{display:"flex"}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"7px 4px 12px",border:"none",background:"transparent",cursor:"pointer",borderBottom:`2px solid ${tab===t.id?T.accent:"transparent"}`,transition:"border-color .2s"}}>
                <Icon name={t.icon} size={19} color={tab===t.id?T.accent:T.textMute}/>
                <span style={{fontSize:10,fontWeight:700,letterSpacing:.3,color:tab===t.id?T.accent:T.textMute}}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:520,margin:"0 auto",padding:"18px 14px 100px"}}>
        {vialsLoading ? (
          <div style={{display:"flex",justifyContent:"center",padding:60}}>
            <div style={{width:28,height:28,border:`3px solid ${T.border}`,borderTopColor:T.accent,borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>
          </div>
        ) : <>
          {tab==="calc"  && <Calculator/>}
          {tab==="inv"   && <Inventory  vials={vials} addVial={addVial} updateVial={updateVial} deleteVial={deleteVial}/>}
          {tab==="proto" && <Protocols  vials={vials} protocols={protocols} addProto={addProto} toggleProto={toggleProto} deleteProto={deleteProto}/>}
          {tab==="log"   && <Log        vials={vials} entries={entries} addEntry={addEntry} deleteEntry={deleteEntry} deductVial={deductVial}/>}
        </>}
      </div>
    </div>
  );
}

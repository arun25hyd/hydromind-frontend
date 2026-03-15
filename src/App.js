import React, { useState, useEffect, useRef } from "react";

// ── CONFIG ─────────────────────────────────────────────────────────────────
const API          = process.env.REACT_APP_BACKEND_URL || "https://hydromind-backend.onrender.com";
const ADMIN_EMAILS = ["arun25hyd@proton.me", "arun25hyd@gmail.com"];
const FEEDBACK_EMAIL = "feedback@hydromindai.com"; // ← change this when ready

// ── GLOBAL STYLES ──────────────────────────────────────────────────────────
const GlobalStyle = () => {
  useEffect(() => {
    const id = "hm-global";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      html{scroll-behavior:smooth}
      body{font-family:'Rajdhani',sans-serif;background:#020b18;color:#e8f4fd;overflow-x:hidden}
      :root{
        --navy:#020b18;--navy2:#041428;--steel:#0a2540;--blue:#0d4f8c;
        --cyan:#1a9fd4;--gold:#c8921a;--gold-light:#f0b429;--gold-bright:#ffd166;
        --white:#e8f4fd;--muted:#6b8fa8;--green:#28ca41;--red:#e84040;
        --border:rgba(200,146,26,0.25);--glow:0 0 30px rgba(200,146,26,0.3);
      }
      @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
      @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.6)}}
      @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
      @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      .fadeUp-1{animation:fadeUp 0.8s 0.1s ease both}
      .fadeUp-2{animation:fadeUp 0.8s 0.3s ease both}
      .fadeUp-3{animation:fadeUp 0.8s 0.5s ease both}
      .fadeUp-4{animation:fadeUp 0.8s 0.7s ease both}
      .reveal{opacity:0;transform:translateY(30px);transition:opacity 0.7s ease,transform 0.7s ease}
      .reveal.visible{opacity:1;transform:none}
      .chat-in{animation:fadeUp 0.3s ease both}
      ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#041428}::-webkit-scrollbar-thumb{background:#0d4f8c;border-radius:3px}
      @media(max-width:768px){.hide-mob{display:none!important}}
    `;
    document.head.appendChild(s);
  }, []);
  return null;
};

// ── CANVAS BACKGROUND ──────────────────────────────────────────────────────
const HydraulicBG = () => {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let id, t = 0;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const sx = x => x / 1440 * canvas.width;
    const sy = y => y / 900  * canvas.height;
    const ss = s => s * Math.min(canvas.width / 1440, canvas.height / 900);
    const pipes = [
      [[100,200],[300,200],[300,400],[600,400],"rgba(26,159,212,0.35)"],
      [[600,400],[900,400],[900,200],[1200,200],"rgba(200,146,26,0.25)"],
      [[200,600],[500,600],[500,750],[900,750],"rgba(26,159,212,0.2)"],
      [[900,750],[1200,750],[1200,500],[1400,500],"rgba(200,146,26,0.18)"],
    ];
    const pathPos = (pts, tv) => {
      const tot = pts.reduce((a,_,i)=>{ if(!i)return a; const dx=pts[i][0]-pts[i-1][0],dy=pts[i][1]-pts[i-1][1]; return a+Math.sqrt(dx*dx+dy*dy); },0);
      let d=tv*tot,tr=0;
      for(let i=1;i<pts.length;i++){const dx=pts[i][0]-pts[i-1][0],dy=pts[i][1]-pts[i-1][1],seg=Math.sqrt(dx*dx+dy*dy);if(tr+seg>=d){const f=(d-tr)/seg;return[pts[i-1][0]+dx*f,pts[i-1][1]+dy*f];}tr+=seg;}
      return pts[pts.length-1];
    };
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      const g=ctx.createLinearGradient(0,0,canvas.width,canvas.height);
      g.addColorStop(0,"#020b18"); g.addColorStop(1,"#041428");
      ctx.fillStyle=g; ctx.fillRect(0,0,canvas.width,canvas.height);
      pipes.forEach(([pts,_1,_2,_3,pcolor])=>{
        const p=pts; ctx.beginPath(); ctx.strokeStyle=pcolor||"rgba(26,159,212,0.3)";
        ctx.lineWidth=ss(2); ctx.lineCap="round";
        p.forEach(([x,y],i)=>i?ctx.lineTo(sx(x),sy(y)):ctx.moveTo(sx(x),sy(y)));
        ctx.stroke();
      });
      pipes.forEach(([pts],pi)=>{
        const pos=pathPos(pts,((t*0.12+pi*0.28)%1+1)%1);
        ctx.beginPath(); ctx.arc(sx(pos[0]),sy(pos[1]),ss(4),0,Math.PI*2);
        ctx.fillStyle=pi%2===0?"rgba(26,159,212,0.8)":"rgba(240,180,41,0.8)";
        ctx.fill();
      });
      // pump circles
      [[300,200,28],[900,400,22]].forEach(([x,y,r])=>{
        ctx.beginPath(); ctx.arc(sx(x),sy(y),ss(r),0,Math.PI*2);
        ctx.strokeStyle="rgba(26,159,212,0.5)"; ctx.lineWidth=ss(2); ctx.stroke();
        ctx.save(); ctx.translate(sx(x),sy(y)); ctx.rotate(t*0.6);
        ctx.strokeStyle="rgba(26,159,212,0.6)"; ctx.lineWidth=ss(1.5);
        for(let i=0;i<6;i++){const a=i/6*Math.PI*2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*ss(r*0.7),Math.sin(a)*ss(r*0.7));ctx.stroke();}
        ctx.restore();
      });
      t+=0.016; id=requestAnimationFrame(draw);
    };
    draw();
    return ()=>{ cancelAnimationFrame(id); window.removeEventListener("resize",resize); };
  },[]);
  return <canvas ref={ref} style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",zIndex:0,pointerEvents:"none"}}/>;
};

const GridOverlay = () => (
  <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",zIndex:0,pointerEvents:"none",
    backgroundImage:"linear-gradient(rgba(26,159,212,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(26,159,212,0.025) 1px,transparent 1px)",
    backgroundSize:"60px 60px"}}/>
);

// ── NAV ────────────────────────────────────────────────────────────────────
const Nav = ({ onFeedback, onLaunch }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(()=>{ const fn=()=>setScrolled(window.scrollY>30); window.addEventListener("scroll",fn); return()=>window.removeEventListener("scroll",fn); },[]);
  const go = id => { const _el=document.getElementById(id); if(_el) _el.scrollIntoView({behavior:"smooth"}); };
  return (
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,
      background:scrolled?"rgba(2,11,24,0.96)":"transparent",
      backdropFilter:scrolled?"blur(12px)":"none",
      borderBottom:scrolled?"1px solid rgba(200,146,26,0.2)":"none",
      padding:"0 2rem",height:"64px",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"all 0.3s"}}>
      <div style={{fontFamily:"'Orbitron',monospace",fontSize:"1.1rem",fontWeight:700}}>
        Hydro<span style={{color:"#f0b429"}}>Mind</span><span style={{color:"#1a9fd4",fontSize:"0.65rem",verticalAlign:"middle",marginLeft:"4px"}}>AI</span>
      </div>
      <div style={{display:"flex",gap:"1.8rem",alignItems:"center"}} className="hide-mob">
        {["features","how-it-works","pricing"].map(id=>(
          <button key={id} onClick={()=>go(id)} style={{background:"none",border:"none",color:"#6b8fa8",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontSize:"0.9rem",textTransform:"uppercase",letterSpacing:"0.05em",transition:"color 0.2s"}}
            onMouseEnter={e=>e.target.style.color="#e8f4fd"} onMouseLeave={e=>e.target.style.color="#6b8fa8"}>{id.replace("-"," ")}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:"0.75rem"}}>
        <button onClick={onFeedback} style={{background:"none",border:"1px solid rgba(200,146,26,0.35)",color:"#c8921a",padding:"7px 14px",borderRadius:"4px",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontSize:"0.85rem"}}>Feedback</button>
        <button onClick={onLaunch} style={{background:"linear-gradient(135deg,#c8921a,#f0b429)",border:"none",color:"#020b18",padding:"7px 18px",borderRadius:"4px",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:"0.68rem",fontWeight:700,letterSpacing:"0.08em"}}>LAUNCH APP</button>
      </div>
    </nav>
  );
};

// ── HERO ───────────────────────────────────────────────────────────────────
const Hero = ({ onLaunch }) => (
  <section style={{position:"relative",zIndex:1,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"0 2rem"}}>
    <div>
      <div className="fadeUp-1" style={{fontFamily:"'Share Tech Mono',monospace",color:"#1a9fd4",fontSize:"0.75rem",letterSpacing:"0.3em",marginBottom:"1.5rem",textTransform:"uppercase"}}>⚙ Hydraulic Intelligence Platform</div>
      <h1 className="fadeUp-2" style={{fontFamily:"'Orbitron',monospace",fontSize:"clamp(2.5rem,6vw,5rem)",fontWeight:900,lineHeight:1.1,marginBottom:"1.5rem"}}>
        Hydro<span style={{color:"#f0b429"}}>Mind</span>
        <span style={{display:"block",fontSize:"0.42em",color:"#1a9fd4",marginTop:"0.5rem"}}>AI ADVISOR</span>
      </h1>
      <p className="fadeUp-3" style={{fontSize:"1.15rem",color:"#6b8fa8",maxWidth:"580px",margin:"0 auto 2.5rem",lineHeight:1.7}}>
        Expert hydraulic systems intelligence for crane &amp; heavy equipment technicians.<br/>Fault diagnosis · System design · Electrical · PLC · OEM knowledge base.
      </p>
      <div className="fadeUp-4" style={{display:"flex",gap:"1rem",justifyContent:"center",flexWrap:"wrap"}}>
        <button onClick={onLaunch} style={{background:"linear-gradient(135deg,#c8921a,#f0b429)",border:"none",color:"#020b18",padding:"15px 34px",borderRadius:"4px",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:"0.78rem",fontWeight:700,letterSpacing:"0.1em",boxShadow:"0 0 40px rgba(200,146,26,0.4)"}}>LAUNCH APP &rarr;</button>
        <button onClick={()=>(function(){var _e=document.getElementById("how-it-works");if(_e)_e.scrollIntoView({behavior:"smooth"});})()} style={{background:"none",border:"1px solid rgba(26,159,212,0.4)",color:"#1a9fd4",padding:"15px 34px",borderRadius:"4px",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontSize:"0.95rem"}}>How It Works</button>
      </div>
    </div>
  </section>
);

// ── HOW IT WORKS ───────────────────────────────────────────────────────────
const HowItWorks = () => {
  const ref = useRef(null);
  useEffect(()=>{const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")}),{threshold:0.1});if(ref.current)ref.current.querySelectorAll(".reveal").forEach(el=>obs.observe(el));return()=>obs.disconnect();},[]);
  return (
    <section id="how-it-works" ref={ref} style={{position:"relative",zIndex:1,padding:"5rem 2rem"}}>
      <div style={{maxWidth:"1100px",margin:"0 auto"}}>
        <h2 className="reveal" style={{fontFamily:"'Orbitron',monospace",fontSize:"clamp(1.4rem,3vw,2rem)",textAlign:"center",marginBottom:"3rem"}}>How It <span style={{color:"#f0b429"}}>Works</span></h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1.5rem"}}>
          {[["🔍","Describe","Type the fault in plain language — slow hoist, CBV chatter, valve not shifting, PLC alarm."],
            ["🧠","KB Search","Searches 33 OEM manuals and field cases before touching the web."],
            ["⚙️","Structured Answer","Root cause, diagnosis steps, pressure settings, torque specs — formatted clearly."],
            ["📐","Design & Calc","Size pumps, motors, pipes. Generate full BOM. Built-in calculators."]
          ].map(([icon,title,desc])=>(
            <div key={title} className="reveal" style={{background:"rgba(4,20,40,0.6)",border:"1px solid rgba(26,159,212,0.15)",borderRadius:"8px",padding:"1.8rem 1.4rem",textAlign:"center",transition:"border-color 0.3s",cursor:"default"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(200,146,26,0.4)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(26,159,212,0.15)"}>
              <div style={{fontSize:"2.2rem",marginBottom:"0.8rem"}}>{icon}</div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:"0.72rem",color:"#f0b429",marginBottom:"0.6rem",letterSpacing:"0.05em"}}>{title}</div>
              <div style={{fontSize:"0.85rem",color:"#6b8fa8",lineHeight:1.6}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── FEATURES ───────────────────────────────────────────────────────────────
const Features = () => {
  const ref = useRef(null);
  useEffect(()=>{const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")}),{threshold:0.1});if(ref.current)ref.current.querySelectorAll(".reveal").forEach(el=>obs.observe(el));return()=>obs.disconnect();},[]);
  const items = [
    ["🏗️","Offshore Cranes","Favelle Favco, Liebherr, NOV. ADNOC field cases included."],
    ["⚡","Electrical Faults","Solenoid, proportional card, sensor and encoder diagnostics."],
    ["🔌","PLC / SCADA","Hydraulic-PLC interface faults, alarm codes, safety relay logic."],
    ["🌡️","Thermal Analysis","Heat load, cooler sizing, oil grade by ambient temperature."],
    ["📊","System Design","12-step HPU design: pump → motor → DCV → filter → tank → BOM."],
    ["🧮","Calculators","Cylinder, motor, pump, pressure drop, piping — live results."],
  ];
  return (
    <section id="features" ref={ref} style={{position:"relative",zIndex:1,padding:"4rem 2rem"}}>
      <div style={{maxWidth:"1100px",margin:"0 auto"}}>
        <h2 className="reveal" style={{fontFamily:"'Orbitron',monospace",fontSize:"clamp(1.4rem,3vw,2rem)",textAlign:"center",marginBottom:"3rem"}}>Platform <span style={{color:"#f0b429"}}>Features</span></h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1.2rem"}}>
          {items.map(([icon,title,desc])=>(
            <div key={title} className="reveal" style={{background:"rgba(4,20,40,0.6)",border:"1px solid rgba(26,159,212,0.15)",borderRadius:"8px",padding:"1.6rem"}}>
              <div style={{fontSize:"1.8rem",marginBottom:"0.6rem"}}>{icon}</div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:"0.72rem",color:"#1a9fd4",marginBottom:"0.5rem"}}>{title}</div>
              <div style={{fontSize:"0.88rem",color:"#6b8fa8",lineHeight:1.6}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── PRICING ────────────────────────────────────────────────────────────────
const Pricing = ({ onLaunch }) => {
  const ref = useRef(null);
  useEffect(()=>{const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")}),{threshold:0.1});if(ref.current)ref.current.querySelectorAll(".reveal").forEach(el=>obs.observe(el));return()=>obs.disconnect();},[]);
  return (
    <section id="pricing" ref={ref} style={{position:"relative",zIndex:1,padding:"5rem 2rem"}}>
      <div style={{maxWidth:"800px",margin:"0 auto"}}>
        <h2 className="reveal" style={{fontFamily:"'Orbitron',monospace",fontSize:"clamp(1.4rem,3vw,2rem)",textAlign:"center",marginBottom:"3rem"}}>Simple <span style={{color:"#f0b429"}}>Pricing</span></h2>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2rem"}}>
          {[{name:"FREE",price:"$0",period:"/month",features:["5 queries/day","KB search","Basic fault diagnosis","Community support"],hl:false},
            {name:"PREMIUM",price:"$29",period:"/month",features:["Unlimited queries","Full KB + web search","Electrical & PLC modules","System design (12-step)","Priority support","Export reports"],hl:true}
          ].map(plan=>(
            <div key={plan.name} className="reveal" style={{background:plan.hl?"rgba(200,146,26,0.08)":"rgba(4,20,40,0.6)",border:`2px solid ${plan.hl?"rgba(200,146,26,0.5)":"rgba(26,159,212,0.2)"}`,borderRadius:"12px",padding:"2.5rem",textAlign:"center",boxShadow:plan.hl?"0 0 40px rgba(200,146,26,0.12)":"none"}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:"0.75rem",color:plan.hl?"#f0b429":"#1a9fd4",letterSpacing:"0.15em",marginBottom:"0.8rem"}}>{plan.name}</div>
              <div style={{fontSize:"2.8rem",fontWeight:700,fontFamily:"'Orbitron',monospace",color:plan.hl?"#f0b429":"#e8f4fd"}}>{plan.price}</div>
              <div style={{color:"#6b8fa8",fontSize:"0.85rem",marginBottom:"1.8rem"}}>{plan.period}</div>
              <ul style={{listStyle:"none",marginBottom:"1.8rem",textAlign:"left"}}>
                {plan.features.map(f=>(
                  <li key={f} style={{padding:"0.45rem 0",borderBottom:"1px solid rgba(255,255,255,0.05)",fontSize:"0.88rem",color:"#e8f4fd",display:"flex",gap:"0.5rem"}}>
                    <span style={{color:"#1a9fd4"}}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={onLaunch} style={{width:"100%",padding:"12px",background:plan.hl?"linear-gradient(135deg,#c8921a,#f0b429)":"none",border:plan.hl?"none":"1px solid rgba(26,159,212,0.4)",color:plan.hl?"#020b18":"#1a9fd4",borderRadius:"4px",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:"0.68rem",fontWeight:700,letterSpacing:"0.1em"}}>
                {plan.hl?"START TRIAL":"GET STARTED"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── FOOTER ─────────────────────────────────────────────────────────────────
const Footer = ({ onFeedback }) => (
  <footer style={{position:"relative",zIndex:1,borderTop:"1px solid rgba(200,146,26,0.15)",padding:"2.5rem 2rem",textAlign:"center"}}>
    <div style={{fontFamily:"'Orbitron',monospace",fontSize:"0.95rem",marginBottom:"0.4rem"}}>Hydro<span style={{color:"#f0b429"}}>Mind</span> AI</div>
    <div style={{color:"#6b8fa8",fontSize:"0.82rem",marginBottom:"0.8rem"}}>Hydraulic Intelligence for the Field</div>
    <button onClick={onFeedback} style={{background:"none",border:"none",color:"#6b8fa8",cursor:"pointer",fontSize:"0.82rem",textDecoration:"underline"}}>Send Feedback</button>
    <div style={{color:"#6b8fa8",fontSize:"0.72rem",marginTop:"1.2rem"}}>© 2026 HydroMind AI · hydromindai.com</div>
  </footer>
);

// ── FEEDBACK MODAL ─────────────────────────────────────────────────────────
const FeedbackModal = ({ onClose }) => {
  const [text,    setText]    = useState("");
  const [email,   setEmail]   = useState("");
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const submit = async () => {
    if (!text.trim()) return;
    setSending(true); setError("");
    try {
      const res = await fetch(`${API}/api/feedback`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ message: text, email, source:"landing" }),
      });
      if (res.ok) { setSent(true); }
      else {
        // fallback: open mailto
        window.location.href = "mailto:"+FEEDBACK_EMAIL+"?subject=HydroMind%20Feedback&body="+encodeURIComponent(text);
        setSent(true);
      }
    } catch(_err) {
      window.location.href = "mailto:"+FEEDBACK_EMAIL+"?subject=HydroMind%20Feedback&body="+encodeURIComponent(text);
      setSent(true);
    }
    setSending(false);
  };

  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose()}} style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",zIndex:999,background:"rgba(2,11,24,0.9)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"rgba(4,20,40,0.97)",border:"1px solid rgba(200,146,26,0.3)",borderRadius:"10px",padding:"2.5rem",maxWidth:"460px",width:"90%",position:"relative",boxShadow:"0 0 60px rgba(200,146,26,0.15)"}}>
        <div style={{position:"absolute",top:0,left:0,width:"100%",height:"3px",background:"linear-gradient(90deg,#c8921a,#f0b429,#1a9fd4)",borderRadius:"10px 10px 0 0"}}/>
        <button onClick={onClose} style={{position:"absolute",top:"14px",right:"16px",background:"none",border:"none",color:"#6b8fa8",fontSize:"1.2rem",cursor:"pointer"}}>✕</button>
        {sent ? (
          <div style={{textAlign:"center",padding:"2rem"}}>
            <div style={{fontSize:"3rem",marginBottom:"1rem"}}>✅</div>
            <div style={{fontFamily:"'Orbitron',monospace",color:"#f0b429",marginBottom:"0.5rem"}}>Thank you!</div>
            <div style={{color:"#6b8fa8",fontSize:"0.88rem"}}>Your feedback helps improve HydroMind AI.</div>
          </div>
        ) : (
          <React.Fragment>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:"0.95rem",marginBottom:"1.5rem"}}>Send <span style={{color:"#f0b429"}}>Feedback</span></div>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email (optional)" type="email"
              style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(26,159,212,0.25)",borderRadius:"4px",padding:"10px 12px",color:"#e8f4fd",fontSize:"0.9rem",marginBottom:"0.8rem",outline:"none"}}/>
            <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Describe a fault scenario, missing feature, or component not in KB..."
              style={{width:"100%",height:"130px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(26,159,212,0.25)",borderRadius:"4px",padding:"10px 12px",color:"#e8f4fd",fontSize:"0.9rem",resize:"vertical",outline:"none",marginBottom:"1rem"}}/>
            {error && <div style={{color:"#e84040",fontSize:"0.82rem",marginBottom:"0.8rem"}}>{error}</div>}
            <button onClick={submit} disabled={sending||!text.trim()} style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#c8921a,#f0b429)",border:"none",borderRadius:"4px",color:"#020b18",fontFamily:"'Orbitron',monospace",fontSize:"0.72rem",fontWeight:700,cursor:"pointer",opacity:sending?0.7:1}}>
              {sending?"SENDING...":"SUBMIT FEEDBACK"}
            </button>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

// ── CALC PANEL ─────────────────────────────────────────────────────────────
const CalcPanel = () => {
  const [screen, setScreen] = useState("home");
  const [v, setV] = useState({});
  const [r, setR] = useState({});
  const n = k => parseFloat(v[k])||0;
  const set = (k,val) => setV(p=>({...p,[k]:val}));
  const reset = () => { setV({}); setR({}); };

  const inp = (k,label,unit) => (
    <div style={{marginBottom:"0.75rem"}}>
      <div style={{fontSize:"0.78rem",color:"#6b8fa8",marginBottom:"3px"}}>{label}</div>
      <div style={{display:"flex",gap:"0.5rem"}}>
        <input value={v[k]||""} onChange={e=>set(k,e.target.value)} type="number"
          style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(26,159,212,0.25)",borderRadius:"4px",padding:"9px 11px",color:"#e8f4fd",fontSize:"0.92rem",outline:"none"}}/>
        <div style={{minWidth:"54px",padding:"9px 6px",border:"1px solid rgba(26,159,212,0.3)",borderRadius:"4px",color:"#1a9fd4",fontSize:"0.82rem",textAlign:"center",background:"rgba(26,159,212,0.05)"}}>{unit}</div>
      </div>
    </div>
  );
  const res = (label,val,unit) => (
    <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.6rem"}}>
      <div style={{flex:1,fontSize:"0.85rem",color:"#6b8fa8"}}>{label}</div>
      <div style={{flex:1,background:"rgba(40,202,65,0.06)",border:"1px solid rgba(40,202,65,0.2)",borderRadius:"4px",padding:"8px 10px",color:"#28ca41",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.88rem"}}>{val||"—"}</div>
      <div style={{minWidth:"54px",padding:"8px 6px",border:"1px solid rgba(26,159,212,0.3)",borderRadius:"4px",color:"#1a9fd4",fontSize:"0.78rem",textAlign:"center",background:"rgba(26,159,212,0.05)"}}>{unit}</div>
    </div>
  );
  const calcBtn = fn => (
    <button onClick={fn} style={{width:"100%",padding:"11px",background:"linear-gradient(135deg,#1a9fd4,#0d4f8c)",border:"none",borderRadius:"5px",color:"#fff",fontFamily:"'Orbitron',monospace",fontSize:"0.68rem",fontWeight:700,cursor:"pointer",letterSpacing:"0.08em",margin:"0.8rem 0 0.5rem"}}>CALCULATE</button>
  );
  const back = () => (
    <button onClick={()=>{setScreen("home");reset();}} style={{background:"none",border:"none",color:"#1a9fd4",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontSize:"0.92rem",marginBottom:"1rem",display:"flex",alignItems:"center",gap:"4px"}}>← Back</button>
  );
  const wrap = {flex:1,overflowY:"auto",padding:"1.5rem"};
  const hr = <hr style={{border:"none",borderTop:"1px solid rgba(255,255,255,0.07)",margin:"1rem 0"}}/>;

  const calcs = {
    cylinder: () => {
      const Ab=(Math.PI*(n("cb")/2)**2), Ar=Math.PI*((n("cb")/2)**2-(n("cr")/2)**2);
      setR({Ab:(Ab/100).toFixed(2),Ar:(Ar/100).toFixed(2),Fe:(n("cp")*Ab/1000/10).toFixed(2),Fr:(n("cp")*Ar/1000/10).toFixed(2),
        Ve:n("cq")>0?(n("cq")/60000/(Ab/1e6)).toFixed(3):"—",Vr:n("cq")>0?(n("cq")/60000/(Ar/1e6)).toFixed(3):"—"});
    },
    motor: () => {
      const Q=(n("mv")*n("mn")*(n("me")||100)/100/1000).toFixed(1);
      const T=(n("mp")*n("mv")*(n("mm")||100)/100/(20*Math.PI)).toFixed(1);
      setR({Q,T,P:(n("mp")*parseFloat(Q)/600).toFixed(2)});
    },
    pump: () => setR({Q:(n("pv")*n("pn")*(n("pe")||100)/100/1000).toFixed(1)}),
    pdrop: () => {
      const Q=n("dq")/60000,d=n("dd")/1000,Cd=n("dc")||0.7,sg=n("ds")||0.87;
      const A=Math.PI*(d/2)**2,vel=A>0?Q/A:0;
      setR({vel:vel.toFixed(3),dP:(sg*1000*vel**2/(2*Cd**2)/1000).toFixed(2)});
    },
    piping: () => {
      const Q=n("piq")/60000,sg=n("pis")||0.87,d=n("pid")/1000,mu=(n("piv")||32)/1000;
      const A=Math.PI*(d/2)**2,vel=A>0?Q/A:0,Re=mu>0?sg*1000*vel*d/mu:0;
      setR({A:(A*1e6).toFixed(2),vel:vel.toFixed(3),Re:Re.toFixed(0),regime:Re<2300?"Laminar":Re<4000?"Transitional":"Turbulent"});
    },
  };

  if (screen==="home") return (
    <div style={wrap}>
      <div style={{fontFamily:"'Orbitron',monospace",fontSize:"0.95rem",marginBottom:"0.4rem"}}>🧮 Hydraulic System</div>
      <div style={{color:"#6b8fa8",fontSize:"0.82rem",marginBottom:"1.5rem"}}>Select calculator module</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",maxWidth:"520px"}}>
        {[["cylinder","🔩","Cylinder"],["motor","⚙️","Motor"],["pump","🔄","Pump"],["pdrop","📉","Pressure Drop"],["piping","🔧","Piping"]].map(([id,icon,label])=>(
          <div key={id} onClick={()=>setScreen(id)}
            style={{background:"rgba(4,20,40,0.7)",border:"1px solid rgba(26,159,212,0.18)",borderRadius:"10px",padding:"1.8rem 1rem",textAlign:"center",cursor:"pointer",transition:"all 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(26,159,212,0.5)";e.currentTarget.style.background="rgba(26,159,212,0.08)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(26,159,212,0.18)";e.currentTarget.style.background="rgba(4,20,40,0.7)";}}>
            <div style={{fontSize:"2rem",marginBottom:"0.6rem"}}>{icon}</div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:"0.68rem",color:"#1a9fd4",letterSpacing:"0.05em"}}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  if (screen==="cylinder") return <div style={wrap}>{back()}<div style={{fontFamily:"'Orbitron',monospace",fontSize:"0.88rem",marginBottom:"1.2rem"}}>🔩 Cylinder</div>
    {inp("cb","Piston / Bore Diameter","mm")}{inp("cr","Rod Diameter","mm")}{inp("cs","Stroke","mm")}{inp("cp","Pressure","bar")}{inp("cq","Oil Flow","lpm")}
    {hr}{res("Bore Area",r.Ab,"cm²")}{res("Rod-Side Area",r.Ar,"cm²")}{res("Extend Force",r.Fe,"kN")}{res("Retract Force",r.Fr,"kN")}{res("Extend Speed",r.Ve,"m/s")}{res("Retract Speed",r.Vr,"m/s")}
    {calcBtn(calcs.cylinder)}<button onClick={reset} style={{width:"100%",padding:"9px",background:"none",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"5px",color:"#6b8fa8",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontSize:"0.88rem"}}>Reset</button></div>;

  if (screen==="motor") return <div style={wrap}>{back()}<div style={{fontFamily:"'Orbitron',monospace",fontSize:"0.88rem",marginBottom:"1.2rem"}}>⚙️ Motor</div>
    {inp("mv","Displacement","cc/rev")}{inp("mn","Speed","rpm")}{inp("me","Volumetric Efficiency","%")}{inp("mp","Pressure","bar")}{inp("mm","Mechanical Efficiency","%")}
    {hr}{res("Flow Rate",r.Q,"L/min")}{res("Output Torque",r.T,"Nm")}{res("Input Power",r.P,"kW")}
    {calcBtn(calcs.motor)}<button onClick={reset} style={{width:"100%",padding:"9px",background:"none",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"5px",color:"#6b8fa8",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontSize:"0.88rem"}}>Reset</button></div>;

  if (screen==="pump") return <div style={wrap}>{back()}<div style={{fontFamily:"'Orbitron',monospace",fontSize:"0.88rem",marginBottom:"1.2rem"}}>🔄 Pump</div>
    {inp("pv","Displacement","cc/rev")}{inp("pn","Speed","rpm")}{inp("pe","Volumetric Efficiency","%")}
    {hr}{res("Flow Rate",r.Q,"L/min")}
    {calcBtn(calcs.pump)}<button onClick={reset} style={{width:"100%",padding:"9px",background:"none",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"5px",color:"#6b8fa8",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontSize:"0.88rem"}}>Reset</button></div>;

  if (screen==="pdrop") return <div style={wrap}>{back()}<div style={{fontFamily:"'Orbitron',monospace",fontSize:"0.88rem",marginBottom:"1.2rem"}}>📉 Pressure Drop</div>
    {inp("dq","Flow Rate","lpm")}{inp("dd","Orifice Diameter","mm")}{inp("dc","Flow Coefficient (Cd)","—")}{inp("ds","Specific Gravity","—")}
    {hr}{res("Fluid Velocity",r.vel,"m/s")}{res("Pressure Drop",r.dP,"kPa")}
    {calcBtn(calcs.pdrop)}<button onClick={reset} style={{width:"100%",padding:"9px",background:"none",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"5px",color:"#6b8fa8",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontSize:"0.88rem"}}>Reset</button></div>;

  if (screen==="piping") return <div style={wrap}>{back()}<div style={{fontFamily:"'Orbitron',monospace",fontSize:"0.88rem",marginBottom:"1.2rem"}}>🔧 Piping</div>
    <div style={{fontSize:"0.72rem",color:"#c8921a",marginBottom:"0.8rem"}}>Using absolute viscosity</div>
    {inp("piq","Flow Rate","lpm")}{inp("pis","Specific Gravity","—")}{inp("pid","Inside Pipe Diameter","mm")}{inp("piv","Absolute Viscosity","cP")}
    {hr}{res("Cross-sectional Area",r.A,"mm²")}{res("Flow Velocity",r.vel,"m/s")}{res("Reynolds Number",r.Re,"—")}{res("Flow Regime",r.regime,"—")}
    {calcBtn(calcs.piping)}<button onClick={reset} style={{width:"100%",padding:"9px",background:"none",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"5px",color:"#6b8fa8",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontSize:"0.88rem"}}>Reset</button></div>;

  return null;
};

// ── ELECTRICAL PANEL ───────────────────────────────────────────────────────
const ElectricalPanel = ({ sendMsg }) => {
  const checklist = [
    {cat:"Solenoid Valve",faults:[
      {sym:"Solenoid not energising",checks:["Check 24VDC supply at coil terminals","Measure coil resistance (typ 20–40Ω)","Check PLC output card — LED on?","Check common/neutral wiring continuity"],causes:["Open coil","Blown fuse","PLC output failed","Broken wire"]},
      {sym:"Solenoid energises but valve not shifting",checks:["Check pilot pressure (min 3.5 bar)","Check spool for contamination","Measure current draw vs rated"],causes:["Contaminated spool","Low pilot pressure","Coil voltage drop"]},
    ]},
    {cat:"Proportional Valve",faults:[
      {sym:"No output / no movement",checks:["Check enable signal (24VDC)","Check command signal (0–10V or 4–20mA)","Check amplifier card LEDs","Verify min current (I_min) setting"],causes:["Amplifier not enabled","Signal cable open circuit","Wrong signal range","I_min too high"]},
      {sym:"Output unstable / oscillating",checks:["Check dither frequency/amplitude setting","Check supply voltage ripple","Check feedback sensor signal","Check P-gain — reduce if hunting"],causes:["Dither setting incorrect","Electrical noise","Feedback sensor fault","P-gain too high"]},
    ]},
    {cat:"Pressure Transducer / Sensor",faults:[
      {sym:"No signal / 0mA output",checks:["Check 24VDC supply to sensor","Check wiring: +V, GND, signal","Measure signal with multimeter","Try known-good sensor"],causes:["Power supply missing","Wiring fault","Sensor failed","Short circuit"]},
      {sym:"Incorrect reading",checks:["Check pressure range matches display scaling","Check 4–20mA loop resistance","Zero calibration under no-pressure condition"],causes:["Wrong range configured","Loop resistance too high","Zero drift"]},
    ]},
  ];

  const [open, setOpen]     = useState(null);
  const [faultOpen, setFO]  = useState(null);

  return (
    <div style={{flex:1,overflowY:"auto",padding:"1.5rem"}}>
      <div style={{fontFamily:"'Orbitron',monospace",fontSize:"0.95rem",marginBottom:"0.3rem"}}>⚡ Electrical Fault Diagnosis</div>
      <div style={{color:"#6b8fa8",fontSize:"0.82rem",marginBottom:"1.2rem"}}>Built-in checklist · or ask AI below</div>

      {checklist.map((cat,ci)=>(
        <div key={ci} style={{marginBottom:"0.8rem"}}>
          <button onClick={()=>setOpen(open===ci?null:ci)}
            style={{width:"100%",padding:"10px 14px",background:open===ci?"rgba(26,159,212,0.12)":"rgba(4,20,40,0.7)",border:`1px solid ${open===ci?"rgba(26,159,212,0.5)":"rgba(26,159,212,0.2)"}`,borderRadius:"6px",color:"#e8f4fd",fontFamily:"'Orbitron',monospace",fontSize:"0.72rem",cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",letterSpacing:"0.05em"}}>
            <span>⚡ {cat.cat}</span><span>{open===ci?"▲":"▼"}</span>
          </button>
          {open===ci && cat.faults.map((f,fi)=>(
            <div key={fi} style={{margin:"0.4rem 0 0.4rem 1rem",background:"rgba(4,20,40,0.5)",border:"1px solid rgba(26,159,212,0.12)",borderRadius:"5px",overflow:"hidden"}}>
              <button onClick={()=>setFO(faultOpen===`${ci}-${fi}`?null:`${ci}-${fi}`)}
                style={{width:"100%",padding:"9px 12px",background:"none",border:"none",color:"#c8921a",fontFamily:"'Rajdhani',sans-serif",fontSize:"0.88rem",cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between"}}>
                <span>▸ {f.sym}</span><span style={{color:"#6b8fa8",fontSize:"0.75rem"}}>{faultOpen===`${ci}-${fi}`?"hide":"show"}</span>
              </button>
              {faultOpen===`${ci}-${fi}` && (
                <div style={{padding:"0.8rem 1rem",borderTop:"1px solid rgba(26,159,212,0.1)"}}>
                  <div style={{fontSize:"0.78rem",color:"#1a9fd4",marginBottom:"0.4rem",fontWeight:700}}>CHECK SEQUENCE</div>
                  {f.checks.map((c,i)=><div key={i} style={{fontSize:"0.84rem",color:"#e8f4fd",padding:"3px 0",display:"flex",gap:"8px"}}><span style={{color:"#1a9fd4",flexShrink:0}}>{i+1}.</span>{c}</div>)}
                  <div style={{fontSize:"0.78rem",color:"#c8921a",margin:"0.6rem 0 0.3rem",fontWeight:700}}>LIKELY CAUSES</div>
                  {f.causes.map((c,i)=><div key={i} style={{fontSize:"0.84rem",color:"#6b8fa8",padding:"2px 0",display:"flex",gap:"8px"}}><span style={{color:"#c8921a"}}>•</span>{c}</div>)}
                  <button onClick={()=>sendMsg("I have a "+cat.cat+" fault: "+f.sym+". Give me detailed diagnosis steps.")}
                    style={{marginTop:"0.8rem",padding:"7px 14px",background:"rgba(26,159,212,0.1)",border:"1px solid rgba(26,159,212,0.3)",borderRadius:"4px",color:"#1a9fd4",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontSize:"0.82rem"}}>
                    Ask AI for deeper analysis &rarr;
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      <div style={{marginTop:"1rem",padding:"0.8rem",background:"rgba(26,159,212,0.05)",border:"1px solid rgba(26,159,212,0.15)",borderRadius:"6px",fontSize:"0.82rem",color:"#6b8fa8"}}>
        💬 Type your electrical fault in the chat below for AI diagnosis
      </div>
    </div>
  );
};

// ── PLC PANEL ──────────────────────────────────────────────────────────────
const PLCPanel = ({ sendMsg }) => {
  const faults = [
    {sym:"Hydraulic pump not starting on PLC command",checks:["Check PLC output Q0.x — is it ON?","Check motor starter / contactor coil 24VDC","Check overload relay — reset if tripped","Check enable permissive inputs (E-stop, pressure switch, level switch)"],causes:["PLC output card failed","Contactor coil fault","Overload tripped","Permissive interlock not satisfied"]},
    {sym:"PLC shows fault but hydraulics normal",checks:["Check analog input scaling (4–20mA range in PLC config)","Check sensor power supply","Check shielding on analog cables — ground at one end only","Read raw PLC register value — is it reasonable?"],causes:["Scaling misconfigured","EMI / electrical noise","Sensor loop fault","Loose terminal"]},
    {sym:"Proportional valve not responding to PLC analog output",checks:["Check PLC AO card output — measure with multimeter","Check signal cable continuity","Verify amplifier card enable signal from PLC DQ","Check command signal range in amplifier vs PLC output range"],causes:["AO card failed","Signal range mismatch (0–10V vs 4–20mA)","Amplifier not enabled","Cable fault"]},
    {sym:"Emergency stop from PLC not stopping hydraulic pump",checks:["Check E-stop PLC logic — is output coil de-energising?","Check hardwired E-stop circuit (should be hardwired, NOT PLC-only)","Check safety relay output contacts","Verify motor starter control circuit"],causes:["E-stop not hardwired (safety violation)","Safety relay contacts welded","PLC program fault","Wiring error"]},
    {sym:"Inconsistent cycle times / slow response",checks:["Check PLC scan time — is it within spec for hydraulic response?","Check analog filter time constant in PLC config","Check proportional valve ramp time setting","Check hydraulic accumulator pre-charge"],causes:["PLC scan too slow","Filter time constant too long","Ramp time too slow","Accumulator pre-charge low"]},
  ];
  const [open, setOpen] = useState(null);
  return (
    <div style={{flex:1,overflowY:"auto",padding:"1.5rem"}}>
      <div style={{fontFamily:"'Orbitron',monospace",fontSize:"0.95rem",marginBottom:"0.3rem"}}>🔌 PLC / SCADA Fault Diagnosis</div>
      <div style={{color:"#6b8fa8",fontSize:"0.82rem",marginBottom:"1.2rem"}}>Hydraulic-PLC interface faults · or ask AI below</div>
      {faults.map((f,i)=>(
        <div key={i} style={{marginBottom:"0.6rem",background:"rgba(4,20,40,0.6)",border:`1px solid ${open===i?"rgba(200,146,26,0.4)":"rgba(200,146,26,0.12)"}`,borderRadius:"6px",overflow:"hidden"}}>
          <button onClick={()=>setOpen(open===i?null:i)}
            style={{width:"100%",padding:"10px 14px",background:"none",border:"none",color:"#c8921a",fontFamily:"'Rajdhani',sans-serif",fontSize:"0.88rem",cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between"}}>
            <span>🔌 {f.sym}</span><span style={{color:"#6b8fa8",fontSize:"0.75rem"}}>{open===i?"▲":"▼"}</span>
          </button>
          {open===i && (
            <div style={{padding:"0.8rem 1rem",borderTop:"1px solid rgba(200,146,26,0.1)"}}>
              <div style={{fontSize:"0.78rem",color:"#1a9fd4",marginBottom:"0.4rem",fontWeight:700}}>CHECK SEQUENCE</div>
              {f.checks.map((c,j)=><div key={j} style={{fontSize:"0.84rem",color:"#e8f4fd",padding:"3px 0",display:"flex",gap:"8px"}}><span style={{color:"#1a9fd4",flexShrink:0}}>{j+1}.</span>{c}</div>)}
              <div style={{fontSize:"0.78rem",color:"#c8921a",margin:"0.6rem 0 0.3rem",fontWeight:700}}>LIKELY CAUSES</div>
              {f.causes.map((c,j)=><div key={j} style={{fontSize:"0.84rem",color:"#6b8fa8",padding:"2px 0",display:"flex",gap:"8px"}}><span style={{color:"#c8921a"}}>•</span>{c}</div>)}
              <button onClick={()=>sendMsg("PLC-hydraulic fault: "+f.sym+". Give me detailed diagnosis and fix steps.")}
                style={{marginTop:"0.8rem",padding:"7px 14px",background:"rgba(200,146,26,0.08)",border:"1px solid rgba(200,146,26,0.3)",borderRadius:"4px",color:"#c8921a",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontSize:"0.82rem"}}>
                Ask AI for deeper analysis &rarr;
              </button>
            </div>
          )}
        </div>
      ))}
      <div style={{marginTop:"1rem",padding:"0.8rem",background:"rgba(200,146,26,0.05)",border:"1px solid rgba(200,146,26,0.15)",borderRadius:"6px",fontSize:"0.82rem",color:"#6b8fa8"}}>
        💬 Type your PLC fault or alarm code in the chat below for AI diagnosis
      </div>
    </div>
  );
};

// ── NEWS PANEL ─────────────────────────────────────────────────────────────
const NewsPanel = () => {
  const curated = [
    {title:"Rexroth Hydraulics — Technical Articles & Whitepapers",url:"https://www.boschrexroth.com/en/xc/knowledge-hub",tag:"Rexroth"},
    {title:"Hydraulics & Pneumatics Magazine",url:"https://www.hydraulicspneumatics.com",tag:"Industry"},
    {title:"Danfoss Power Solutions — Application Notes",url:"https://www.danfoss.com/en/service-and-support/downloads",tag:"Danfoss"},
    {title:"Parker Hannifin — Technical Resources",url:"https://www.parker.com/en/resources",tag:"Parker"},
    {title:"IFPS — Fluid Power Society Technical Articles",url:"https://www.ifps.org/technical-resources",tag:"IFPS"},
    {title:"Crane & Offshore Technology — HSE Resources",url:"https://www.hse.gov.uk/offshore/lifting.htm",tag:"Safety"},
    {title:"DNV GL — Offshore Lifting Equipment Rules",url:"https://www.dnv.com/maritime/rules-regulations",tag:"DNV GL"},
    {title:"Liebherr Crane — Technical Bulletins",url:"https://www.liebherr.com/en/gbr/products/cranes/service",tag:"Liebherr"},
  ];
  return (
    <div style={{flex:1,overflowY:"auto",padding:"1.5rem"}}>
      <div style={{fontFamily:"'Orbitron',monospace",fontSize:"0.95rem",marginBottom:"0.3rem"}}>📰 News & Resources</div>
      <div style={{color:"#6b8fa8",fontSize:"0.82rem",marginBottom:"1.5rem"}}>Curated hydraulics &amp; crane industry links</div>
      <div style={{display:"grid",gap:"0.7rem"}}>
        {curated.map((item,i)=>(
          <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
            style={{display:"flex",alignItems:"center",gap:"0.8rem",padding:"0.9rem 1rem",background:"rgba(4,20,40,0.6)",border:"1px solid rgba(26,159,212,0.15)",borderRadius:"6px",textDecoration:"none",transition:"all 0.2s",color:"inherit"}}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(26,159,212,0.45)"; e.currentTarget.style.background="rgba(26,159,212,0.07)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(26,159,212,0.15)"; e.currentTarget.style.background="rgba(4,20,40,0.6)"; }}>
            <div style={{minWidth:"64px",padding:"4px 6px",background:"rgba(26,159,212,0.1)",border:"1px solid rgba(26,159,212,0.2)",borderRadius:"3px",textAlign:"center",fontSize:"0.65rem",color:"#1a9fd4",fontFamily:"'Orbitron',monospace",letterSpacing:"0.03em"}}>{item.tag}</div>
            <div style={{fontSize:"0.88rem",color:"#e8f4fd",lineHeight:1.4}}>{item.title}</div>
            <div style={{marginLeft:"auto",color:"#6b8fa8",fontSize:"0.85rem",flexShrink:0}}>↗</div>
          </a>
        ))}
      </div>
      <div style={{marginTop:"1.5rem",padding:"1rem",background:"rgba(26,159,212,0.05)",border:"1px solid rgba(26,159,212,0.15)",borderRadius:"6px"}}>
        <div style={{fontSize:"0.78rem",color:"#1a9fd4",marginBottom:"0.5rem",fontFamily:"'Orbitron',monospace",letterSpacing:"0.05em"}}>LIVE NEWS SEARCH</div>
        <div style={{fontSize:"0.85rem",color:"#6b8fa8"}}>Ask in the Troubleshoot chat: <span style={{color:"#e8f4fd"}}>"Latest news on Rexroth A4VG series"</span> or <span style={{color:"#e8f4fd"}}>"Recent Liebherr crane updates"</span> — the AI will search the web.</div>
      </div>
    </div>
  );
};

// ── CHAT DASHBOARD ─────────────────────────────────────────────────────────
const ChatDashboard = ({ user, onLogout }) => {
  const isAdmin = ADMIN_EMAILS.includes((user&&user.email)||"");
  const [mode,     setMode]     = useState("troubleshoot");
  const [sessions, setSessions] = useState(()=>{ try{return JSON.parse(localStorage.getItem("hm_sessions")||"[]");}catch(_e){return [];} });
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [sideOpen, setSideOpen] = useState(true);
  const bottomRef = useRef(null);

  useEffect(()=>{ localStorage.setItem("hm_sessions",JSON.stringify(sessions)); },[sessions]);
  useEffect(()=>{ if(bottomRef.current) bottomRef.current.scrollIntoView({behavior:"smooth"}); },[messages]);
  useEffect(()=>{ if(!activeId){setMessages([]);return;} const s=sessions.find(s=>s.id===activeId); setMessages((s&&s.messages)||[]); },[activeId]);

  const newSession = () => { const id=Date.now().toString(); const s={id,title:"New Chat",mode,messages:[],createdAt:new Date().toISOString()}; setSessions(p=>[s,...p]); setActiveId(id); setMessages([]); };
  const updateSession = (id,msgs) => setSessions(p=>p.map(s=>{ if(s.id!==id)return s; return{...s,messages:msgs,title:(function(){var _m=msgs.find(function(m){return m.role==="user";});return _m&&_m.content?_m.content.slice(0,38):"New Chat";})()}; }));
  const deleteSession = id => { setSessions(p=>p.filter(s=>s.id!==id)); if(activeId===id){setActiveId(null);setMessages([]);} };

  const sendMsg = async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text||loading) return;
    setInput("");
    let sid=activeId;
    if(!sid){ sid=Date.now().toString(); const s={id:sid,title:text.slice(0,38),mode,messages:[],createdAt:new Date().toISOString()}; setSessions(p=>[s,...p]); setActiveId(sid); }
    // Switch to troubleshoot mode if triggered from electrical/plc panel
    if(overrideText && (mode==="electrical"||mode==="plc")) setMode("troubleshoot");
    const uMsg={role:"user",content:text,ts:Date.now()};
    const newMsgs=[...messages,uMsg];
    setMessages(newMsgs); updateSession(sid,newMsgs); setLoading(true);
    try {
      const token=localStorage.getItem("hm_token");
      const res=await fetch(`${API}/api/chat`,{
        method:"POST",headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})},
        body:JSON.stringify({messages:newMsgs.map(m=>({role:m.role,content:m.content})),mode}),
        signal:AbortSignal.timeout(60000)
      });
      const data=await res.json();
      let reply="",source="kb";
      if(data.content&&Array.isArray(data.content)) reply=(function(){var _b=data.content.find(function(b){return b.type==="text";});return _b&&_b.text?_b.text:"No response received.";})();
      else if(data.reply) reply=data.reply;
      else if(data.error) reply=`Error: ${typeof data.error==="string"?data.error:JSON.stringify(data.error)}`;
      else reply="No response received.";
      if(data.source) source=data.source;
      else if(reply.toLowerCase().includes("search")||reply.toLowerCase().includes("according to")) source="web";
      const aMsg={role:"assistant",content:reply,ts:Date.now(),source};
      const fin=[...newMsgs,aMsg]; setMessages(fin); updateSession(sid,fin);
    } catch(err) {
      const eMsg={role:"assistant",content:`Connection error: ${err.message}. Please check your network and try again.`,ts:Date.now(),source:"error"};
      const fin=[...newMsgs,eMsg]; setMessages(fin); updateSession(sid,fin);
    }
    setLoading(false);
  };

  const modes = [
    {id:"troubleshoot",label:"🔧 Troubleshoot",color:"#1a9fd4"},
    {id:"designer",    label:"📐 Designer",    color:"#c8921a"},
    {id:"calc",        label:"🧮 Calculator",  color:"#28ca41"},
    {id:"electrical",  label:"⚡ Electrical",  color:"#ffd166"},
    {id:"plc",         label:"🔌 PLC Faults",  color:"#9b8afb"},
    {id:"news",        label:"📰 News",         color:"#6b8fa8"},
    ...(isAdmin?[{id:"admin",label:"⚙ Admin",color:"#f0b429"}]:[]),
  ];
  const activeMode = modes.find(m=>m.id===mode)||modes[0];
  const chatModes  = ["troubleshoot","designer","admin"];
  const panelModes = ["calc","electrical","plc","news"];

  const modeDesc = {
    troubleshoot:"🔧 Troubleshooter Mode — I'll search the Knowledge Base first, then the web if needed.",
    designer:    "📐 System Designer Mode — Describe your application and I'll guide you through a full 12-step HPU design.",
    electrical:  "⚡ Use the checklist above or type your electrical fault below for AI diagnosis.",
    plc:         "🔌 Use the fault tree above or type your PLC alarm / fault below for AI diagnosis.",
    news:        "📰 Curated hydraulics & crane resources.",
    admin:       "⚙ Admin Panel — Full access mode.",
  };

  return (
    <div style={{display:"flex",height:"100vh",background:"#020b18",fontFamily:"'Rajdhani',sans-serif"}}>

      {/* SIDEBAR */}
      <div style={{width:sideOpen?"240px":"0",minWidth:sideOpen?"240px":"0",overflow:"hidden",background:"rgba(4,20,40,0.98)",borderRight:"1px solid rgba(200,146,26,0.15)",display:"flex",flexDirection:"column",transition:"all 0.3s ease"}}>
        <div style={{padding:"1rem",borderBottom:"1px solid rgba(200,146,26,0.15)"}}>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:"0.88rem",marginBottom:"0.7rem"}}>Hydro<span style={{color:"#f0b429"}}>Mind</span></div>
          <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.7rem"}}>
            <div style={{width:"26px",height:"26px",borderRadius:"50%",background:"linear-gradient(135deg,#0d4f8c,#1a9fd4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.68rem",fontWeight:700,flexShrink:0}}>
              {((user&&(user.name||user.email))||"U")[0].toUpperCase()}
            </div>
            <div style={{overflow:"hidden"}}>
              <div style={{fontSize:"0.8rem",color:"#e8f4fd",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{(user&&(user.name||user.email))||""}</div>
              {isAdmin&&<div style={{fontSize:"0.62rem",color:"#f0b429"}}>ADMIN</div>}
            </div>
          </div>
          <button onClick={newSession} style={{width:"100%",padding:"7px",background:"linear-gradient(135deg,#c8921a,#f0b429)",border:"none",borderRadius:"4px",color:"#020b18",fontFamily:"'Orbitron',monospace",fontSize:"0.62rem",fontWeight:700,cursor:"pointer",letterSpacing:"0.05em"}}>+ NEW CHAT</button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"0.4rem"}}>
          <div style={{fontSize:"0.65rem",color:"#6b8fa8",padding:"0.5rem",letterSpacing:"0.1em",textTransform:"uppercase"}}>//&nbsp;RECENT SESSIONS</div>
          {sessions.map(s=>(
            <div key={s.id} onClick={()=>setActiveId(s.id)}
              style={{padding:"0.55rem 0.7rem",borderRadius:"4px",cursor:"pointer",marginBottom:"2px",background:s.id===activeId?"rgba(13,79,140,0.3)":"transparent",border:s.id===activeId?"1px solid rgba(26,159,212,0.2)":"1px solid transparent",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all 0.2s"}}
              onMouseEnter={e=>{if(s.id!==activeId)e.currentTarget.style.background="rgba(255,255,255,0.04)";}}
              onMouseLeave={e=>{if(s.id!==activeId)e.currentTarget.style.background="transparent";}}>
              <div style={{overflow:"hidden"}}>
                <div style={{fontSize:"0.78rem",color:"#e8f4fd",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"155px"}}>{s.title}</div>
                <div style={{fontSize:"0.62rem",color:"#6b8fa8"}}>{new Date(s.createdAt).toLocaleDateString()}</div>
              </div>
              <button onClick={e=>{e.stopPropagation();deleteSession(s.id);}} style={{background:"none",border:"none",color:"#6b8fa8",cursor:"pointer",fontSize:"0.78rem",padding:"2px 4px",flexShrink:0}}>🗑</button>
            </div>
          ))}
        </div>
        <div style={{padding:"0.7rem",borderTop:"1px solid rgba(200,146,26,0.15)"}}>
          <button onClick={onLogout} style={{width:"100%",padding:"7px",background:"none",border:"1px solid rgba(232,64,64,0.3)",borderRadius:"4px",color:"#e84040",fontFamily:"'Rajdhani',sans-serif",fontSize:"0.82rem",cursor:"pointer"}}>LOGOUT</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* TOPBAR */}
        <div style={{height:"52px",background:"rgba(4,20,40,0.95)",borderBottom:"1px solid rgba(200,146,26,0.15)",display:"flex",alignItems:"center",padding:"0 0.8rem",gap:"0.5rem",flexShrink:0,overflowX:"auto"}}>
          <button onClick={()=>setSideOpen(v=>!v)} style={{background:"none",border:"none",color:"#6b8fa8",cursor:"pointer",fontSize:"1rem",flexShrink:0}}>☰</button>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:"0.8rem",color:"#e8f4fd",marginRight:"0.5rem",flexShrink:0}}>Hydro<span style={{color:"#f0b429"}}>Mind</span></div>
          {modes.map(m=>(
            <button key={m.id} onClick={()=>setMode(m.id)}
              style={{padding:"5px 11px",borderRadius:"4px",cursor:"pointer",fontSize:"0.72rem",fontFamily:"'Rajdhani',sans-serif",fontWeight:600,letterSpacing:"0.02em",transition:"all 0.2s",flexShrink:0,
                background:mode===m.id?`${m.color}20`:"none",
                border:mode===m.id?`1px solid ${m.color}`:"1px solid transparent",
                color:mode===m.id?m.color:"#6b8fa8"}}>
              {m.label}
            </button>
          ))}
          <button onClick={onLogout} style={{marginLeft:"auto",padding:"5px 10px",borderRadius:"4px",background:"none",border:"1px solid rgba(232,64,64,0.3)",color:"#e84040",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontSize:"0.78rem",flexShrink:0}}>LOGOUT</button>
        </div>

        {/* PANELS */}
        {mode==="calc"        && <CalcPanel/>}
        {mode==="electrical"  && <ElectricalPanel sendMsg={sendMsg}/>}
        {mode==="plc"         && <PLCPanel sendMsg={sendMsg}/>}
        {mode==="news"        && <NewsPanel/>}

        {/* CHAT AREA */}
        {!panelModes.includes(mode) && (
          <div style={{flex:1,overflowY:"auto",padding:"1.2rem",display:"flex",flexDirection:"column",gap:"0.9rem"}}>
            {messages.length===0&&(
              <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:"0.8rem",opacity:0.45,marginTop:"4rem"}}>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:"1.4rem"}}>Hydro<span style={{color:"#f0b429"}}>Mind</span></div>
                <div style={{color:"#6b8fa8",fontSize:"0.88rem",textAlign:"center",maxWidth:"400px",lineHeight:1.6}}>{modeDesc[mode]}</div>
              </div>
            )}
            {messages.map((m,i)=>(
              <div key={i} className="chat-in" style={{display:"flex",gap:"0.6rem",flexDirection:m.role==="user"?"row-reverse":"row",alignItems:"flex-start"}}>
                <div style={{width:"30px",height:"30px",borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.65rem",fontWeight:700,fontFamily:"'Orbitron',monospace",
                  background:m.role==="user"?"linear-gradient(135deg,#0d4f8c,#1a9fd4)":"linear-gradient(135deg,#c8921a,#f0b429)",color:m.role==="user"?"white":"#020b18"}}>
                  {m.role==="user"?((user&&user.name)||""||"U")[0].toUpperCase():"HM"}
                </div>
                <div style={{maxWidth:"80%",display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start"}}>
                  {m.role==="assistant"&&m.source&&m.source!=="error"&&(
                    <div style={{fontSize:"0.62rem",color:m.source==="web"?"#c8921a":"#1a9fd4",marginBottom:"3px",display:"flex",alignItems:"center",gap:"3px"}}>
                      <span style={{width:"5px",height:"5px",borderRadius:"50%",display:"inline-block",background:m.source==="web"?"#c8921a":"#1a9fd4"}}/>
                      SOURCE: {m.source==="web"?"WEB SEARCH":"KNOWLEDGE BASE"}
                    </div>
                  )}
                  <div style={{padding:"9px 13px",borderRadius:m.role==="user"?"8px 2px 8px 8px":"2px 8px 8px 8px",fontSize:"0.87rem",lineHeight:1.65,color:"#e8f4fd",
                    background:m.role==="user"?"rgba(13,79,140,0.35)":"rgba(200,146,26,0.07)",
                    border:`1px solid ${m.role==="user"?"rgba(26,159,212,0.2)":"rgba(200,146,26,0.14)"}`,
                    whiteSpace:"pre-wrap",wordBreak:"break-word"}}>
                    {m.content}
                  </div>
                </div>
              </div>
            ))}
            {loading&&(
              <div style={{display:"flex",gap:"0.6rem",alignItems:"flex-start"}}>
                <div style={{width:"30px",height:"30px",borderRadius:"50%",background:"linear-gradient(135deg,#c8921a,#f0b429)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.65rem",color:"#020b18",fontWeight:700}}>HM</div>
                <div style={{padding:"11px 14px",background:"rgba(200,146,26,0.07)",border:"1px solid rgba(200,146,26,0.14)",borderRadius:"2px 8px 8px 8px",display:"flex",gap:"4px",alignItems:"center"}}>
                  {[0,1,2].map(i=><span key={i} style={{width:"6px",height:"6px",borderRadius:"50%",background:"#1a9fd4",display:"inline-block",animation:`pulse 1.2s ${i*0.2}s infinite`}}/>)}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>
        )}

        {/* INPUT BAR — visible for chat modes and also electrical/plc (AI assist) */}
        {(chatModes.includes(mode)||mode==="electrical"||mode==="plc") && (
          <div style={{padding:"0.9rem",borderTop:"1px solid rgba(200,146,26,0.15)",background:"rgba(4,20,40,0.95)",display:"flex",gap:"0.6rem",alignItems:"flex-end"}}>
            <textarea value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}}}
              placeholder={mode==="electrical"?"Type electrical fault for AI diagnosis... (Enter to send)":mode==="plc"?"Type PLC alarm or fault for AI diagnosis... (Enter to send)":"Describe the fault or ask a hydraulic question... (Enter to send)"}
              rows={2}
              style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(26,159,212,0.2)",borderRadius:"6px",padding:"9px 12px",color:"#e8f4fd",fontSize:"0.88rem",fontFamily:"'Rajdhani',sans-serif",outline:"none",resize:"none",lineHeight:1.5,transition:"border-color 0.2s"}}
              onFocus={e=>e.target.style.borderColor="rgba(26,159,212,0.5)"} onBlur={e=>e.target.style.borderColor="rgba(26,159,212,0.2)"}/>
            <button onClick={()=>sendMsg()} disabled={loading||!input.trim()}
              style={{padding:"9px 18px",background:loading||!input.trim()?"rgba(200,146,26,0.25)":"linear-gradient(135deg,#c8921a,#f0b429)",border:"none",borderRadius:"6px",color:"#020b18",fontFamily:"'Orbitron',monospace",fontSize:"0.68rem",fontWeight:700,cursor:loading||!input.trim()?"default":"pointer",letterSpacing:"0.05em",transition:"all 0.2s",flexShrink:0}}>
              SEND
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── AUTH MODAL ─────────────────────────────────────────────────────────────
const AuthModal = ({ onClose, onLogin }) => {
  const [view,    setView]    = useState("login");
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [msg,     setMsg]     = useState({text:"",type:""});
  const [loading, setLoading] = useState(false);
  const reset = () => setMsg({text:"",type:""});

  const post = async (endpoint, body) => {
    const res  = await fetch(`${API}${endpoint}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const data = await res.json();
    if (!res.ok) throw new Error(data.error||"Request failed");
    return data;
  };

  const handleLogin = async () => {
    if(!email||!pass){setMsg({text:"Email and password required.",type:"error"});return;}
    setLoading(true);reset();
    try {
      const data = await post("/api/auth/login",{email,password:pass});
      localStorage.setItem("hm_token", data.token);
      localStorage.setItem("hm_user",  JSON.stringify(data.user||{email,name:data.name||email}));
      onLogin(data.user||{email,name:data.name||email});
    } catch(e){setMsg({text:e.message,type:"error"});}
    setLoading(false);
  };

  const handleRegister = async () => {
    if(!name||!email||!pass){setMsg({text:"All fields required.",type:"error"});return;}
    setLoading(true);reset();
    try {
      await post("/api/auth/register",{name,email,password:pass});
      setMsg({text:"✅ Account created! You can now sign in.",type:"success"});
      setTimeout(()=>setView("login"),1500);
    } catch(e){setMsg({text:e.message,type:"error"});}
    setLoading(false);
  };

  const handleForgot = async () => {
    if(!email){setMsg({text:"Email required.",type:"error"});return;}
    setLoading(true);reset();
    try {
      await post("/api/auth/forgot-password",{email});
      setMsg({text:"✅ Password reset link sent to your email.",type:"success"});
    } catch(e){setMsg({text:e.message,type:"error"});}
    setLoading(false);
  };

  const IS = {width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(26,159,212,0.25)",borderRadius:"4px",padding:"11px 13px",color:"#e8f4fd",fontSize:"0.93rem",marginBottom:"0.9rem",outline:"none"};
  const BS = {width:"100%",padding:"12px",background:"linear-gradient(135deg,#c8921a,#f0b429)",border:"none",borderRadius:"4px",color:"#020b18",fontFamily:"'Orbitron',monospace",fontSize:"0.75rem",fontWeight:700,letterSpacing:"0.1em",cursor:"pointer",marginTop:"0.3rem",opacity:loading?0.7:1};
  const LS = {background:"none",border:"none",color:"#1a9fd4",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontSize:"0.88rem",textDecoration:"underline",padding:0};

  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}} style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",zIndex:999,background:"rgba(2,11,24,0.9)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"rgba(4,20,40,0.97)",border:"1px solid rgba(200,146,26,0.3)",borderRadius:"10px",padding:"2.5rem",maxWidth:"410px",width:"90%",position:"relative",boxShadow:"0 0 60px rgba(200,146,26,0.18)"}}>
        <div style={{position:"absolute",top:0,left:0,width:"100%",height:"3px",background:"linear-gradient(90deg,#c8921a,#f0b429,#1a9fd4)",borderRadius:"10px 10px 0 0"}}/>
        <button onClick={onClose} style={{position:"absolute",top:"13px",right:"15px",background:"none",border:"none",color:"#6b8fa8",fontSize:"1.2rem",cursor:"pointer"}}>✕</button>
        <div style={{textAlign:"center",marginBottom:"1.6rem"}}>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:"1.1rem",fontWeight:700}}>Hydro<span style={{color:"#f0b429"}}>Mind</span> AI</div>
          <div style={{fontSize:"0.78rem",color:"#6b8fa8",marginTop:"0.3rem"}}>
            {view==="login"?"Sign in to your account":view==="register"?"Create your account":"Reset your password"}
          </div>
        </div>
        {view==="register"&&<input value={name} onChange={e=>setName(e.target.value)} placeholder="Full Name" style={IS}/>}
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email" style={IS}/>
        {(view==="login"||view==="register")&&<input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" type="password" style={IS}/>}
        {msg.text&&<div style={{padding:"0.65rem",borderRadius:"4px",marginBottom:"0.9rem",fontSize:"0.85rem",background:msg.type==="success"?"rgba(40,202,65,0.1)":"rgba(232,64,64,0.1)",border:`1px solid ${msg.type==="success"?"rgba(40,202,65,0.3)":"rgba(232,64,64,0.3)"}`,color:msg.type==="success"?"#28ca41":"#e84040"}}>{msg.text}</div>}
        <button onClick={view==="login"?handleLogin:view==="register"?handleRegister:handleForgot} style={BS} disabled={loading}>
          {loading?"PROCESSING...":view==="login"?"SIGN IN":view==="register"?"CREATE ACCOUNT":"SEND RESET LINK"}
        </button>
        <div style={{marginTop:"1.1rem",textAlign:"center",fontSize:"0.88rem",color:"#6b8fa8"}}>
          {view==="login"&&<React.Fragment><button style={LS} onClick={()=>{setView("forgot");reset();}}>Forgot password?</button><span style={{margin:"0 0.4rem"}}>·</span><button style={LS} onClick={()=>{setView("register");reset();}}>Create account</button></React.Fragment>}
          {view==="register"&&<button style={LS} onClick={()=>{setView("login");reset();}}>Already have an account? Sign in</button>}
          {view==="forgot"&&<button style={LS} onClick={()=>{setView("login");reset();}}>← Back to sign in</button>}
        </div>
      </div>
    </div>
  );
};

// ── ROOT APP ───────────────────────────────────────────────────────────────
export default function App() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAuth,     setShowAuth]     = useState(false);
  const [user,         setUser]         = useState(()=>{ try{return JSON.parse(localStorage.getItem("hm_user")||"null");}catch(_e){return null;} });

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    if(params.get("reset")) setShowAuth(true);
    const token=localStorage.getItem("hm_token");
    const saved=localStorage.getItem("hm_user");
    if(token&&saved&&!user){try{setUser(JSON.parse(saved));}catch(_e){}}
  },[]);

  const handleLogin  = u => { setUser(u); setShowAuth(false); };
  const handleLogout = () => { localStorage.removeItem("hm_token"); localStorage.removeItem("hm_user"); setUser(null); };

  if (user) return (
    <React.Fragment>
      <GlobalStyle/>
      <ChatDashboard user={user} onLogout={handleLogout}/>
    </React.Fragment>
  );

  return (
    <React.Fragment>
      <GlobalStyle/>
      <HydraulicBG/>
      <GridOverlay/>
      <Nav onFeedback={()=>setShowFeedback(true)} onLaunch={()=>setShowAuth(true)}/>
      <Hero onLaunch={()=>setShowAuth(true)}/>
      <HowItWorks/>
      <Features/>
      <Pricing onLaunch={()=>setShowAuth(true)}/>
      <Footer onFeedback={()=>setShowFeedback(true)}/>
      {showFeedback && <FeedbackModal onClose={()=>setShowFeedback(false)}/>}
      {showAuth     && <AuthModal     onClose={()=>setShowAuth(false)} onLogin={handleLogin}/>}
    </React.Fragment>
  );
}

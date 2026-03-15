import { useState, useEffect, useRef, useCallback } from "react";

// ── CONSTANTS ──────────────────────────────────────────────
const API = process.env.REACT_APP_BACKEND_URL || "https://hydromind-backend.onrender.com";

const ADMIN_EMAILS = ["arun25hyd@proton.me", "arun25hyd@gmail.com"];

const COLORS = {
  navy:     "#020b18",
  navy2:    "#041428",
  steel:    "#0a2540",
  blue:     "#0d4f8c",
  cyan:     "#1a9fd4",
  gold:     "#c8921a",
  goldLt:   "#f0b429",
  goldBrt:  "#ffd166",
  white:    "#e8f4fd",
  muted:    "#6b8fa8",
};

// ── GLOBAL STYLES ──
const GlobalStyle = () => {
  useEffect(() => {
    const id = "hydromind-global";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { font-family: 'Rajdhani', sans-serif; background: #020b18; color: #e8f4fd; overflow-x: hidden; }
      :root {
        --navy:#020b18; --navy2:#041428; --steel:#0a2540; --blue:#0d4f8c;
        --cyan:#1a9fd4; --gold:#c8921a; --gold-light:#f0b429; --gold-bright:#ffd166;
        --white:#e8f4fd; --muted:#6b8fa8;
        --border:rgba(200,146,26,0.25);
        --glow:0 0 30px rgba(200,146,26,0.3);
      }
      @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
      @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.6)} }
      @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
      .fadeUp-1{animation:fadeUp 0.8s 0.1s ease both}
      .fadeUp-2{animation:fadeUp 0.8s 0.3s ease both}
      .fadeUp-3{animation:fadeUp 0.8s 0.5s ease both}
      .fadeUp-4{animation:fadeUp 0.8s 0.7s ease both}
      .fadeUp-5{animation:fadeUp 0.8s 0.9s ease both}
      .typing-cursor{display:inline-block;width:2px;height:1em;background:var(--cyan);margin-left:2px;animation:blink 1s infinite;vertical-align:text-bottom}
      .chat-msg-enter{animation:fadeUp 0.3s ease both}
      .reveal{opacity:0;transform:translateY(30px);transition:opacity 0.7s ease,transform 0.7s ease}
      .reveal.visible{opacity:1;transform:none}
      @media(max-width:768px){
        .hide-mobile{display:none!important}
        .grid-2{grid-template-columns:1fr!important}
        .grid-3{grid-template-columns:1fr 1fr!important}
      }
      @media(max-width:480px){
        .grid-3{grid-template-columns:1fr!important}
        .grid-5{grid-template-columns:1fr 1fr!important}
      }
      ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:#041428} ::-webkit-scrollbar-thumb{background:#0d4f8c;border-radius:3px}
    `;
    document.head.appendChild(style);
  }, []);
  return null;
};

// ── HYDRAULIC BACKGROUND ──
const HydraulicBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId, mouse = { x: 0.5, y: 0.5 };
    const VW = 1440, VH = 900;
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);
    const onMouse = (e) => { mouse.x = e.clientX / window.innerWidth; mouse.y = e.clientY / window.innerHeight; };
    window.addEventListener("mousemove", onMouse);
    const sx = (x) => (x / VW) * canvas.width;
    const sy = (y) => (y / VH) * canvas.height;
    const ss = (s) => s * Math.min(canvas.width / VW, canvas.height / VH);
    let t = 0;
    const pipes = [
      { pts: [[100,200],[300,200],[300,400],[600,400]], color: "rgba(26,159,212,0.4)", w: 3 },
      { pts: [[600,400],[900,400],[900,200],[1200,200]], color: "rgba(200,146,26,0.3)", w: 2 },
      { pts: [[200,600],[500,600],[500,750],[900,750]], color: "rgba(26,159,212,0.25)", w: 2 },
      { pts: [[900,750],[1200,750],[1200,500],[1400,500]], color: "rgba(200,146,26,0.2)", w: 1.5 },
    ];
    function polyLine(pts, color, width) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = ss(width);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(sx(x), sy(y)) : ctx.lineTo(sx(x), sy(y)));
      ctx.stroke();
    }
    function circle(x, y, r, strokeC, fillC, lw) {
      ctx.beginPath();
      ctx.arc(sx(x), sy(y), ss(r), 0, Math.PI * 2);
      if (fillC) { ctx.fillStyle = fillC; ctx.fill(); }
      if (strokeC) { ctx.strokeStyle = strokeC; ctx.lineWidth = ss(lw || 1.5); ctx.stroke(); }
    }
    function drawPump(x, y, r) {
      circle(x, y, r, "rgba(26,159,212,0.6)", "rgba(13,79,140,0.3)", 2);
      circle(x, y, r * 0.5, "rgba(200,146,26,0.5)", null, 0);
      ctx.save();
      ctx.translate(sx(x), sy(y));
      ctx.rotate(t * 0.8);
      ctx.strokeStyle = "rgba(26,159,212,0.7)";
      ctx.lineWidth = ss(1.5);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * ss(r * 0.8), Math.sin(a) * ss(r * 0.8));
        ctx.stroke();
      }
      ctx.restore();
    }
    function drawGauge(x, y, r, pressure) {
      circle(x, y, r, "rgba(200,146,26,0.5)", "rgba(4,20,40,0.8)", 2);
      const angle = -Math.PI * 0.8 + (pressure / 350) * Math.PI * 1.6;
      ctx.save();
      ctx.translate(sx(x), sy(y));
      ctx.strokeStyle = "#f0b429";
      ctx.lineWidth = ss(2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * ss(r * 0.7), Math.sin(angle) * ss(r * 0.7));
      ctx.stroke();
      ctx.restore();
    }
    function pathPos(pts, t2) {
      const total = pts.reduce((acc, _, i) => {
        if (i === 0) return acc;
        const dx = pts[i][0] - pts[i-1][0], dy = pts[i][1] - pts[i-1][1];
        return acc + Math.sqrt(dx*dx + dy*dy);
      }, 0);
      let dist = t2 * total, traveled = 0;
      for (let i = 1; i < pts.length; i++) {
        const dx = pts[i][0] - pts[i-1][0], dy = pts[i][1] - pts[i-1][1];
        const seg = Math.sqrt(dx*dx + dy*dy);
        if (traveled + seg >= dist) {
          const f = (dist - traveled) / seg;
          return [pts[i-1][0] + dx * f, pts[i-1][1] + dy * f];
        }
        traveled += seg;
      }
      return pts[pts.length - 1];
    }
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, "#020b18");
      grad.addColorStop(1, "#041428");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      pipes.forEach(p => polyLine(p.pts, p.color, p.w));
      drawPump(300, 200, 30);
      drawPump(900, 400, 25);
      drawGauge(600, 400, 22, 180 + Math.sin(t) * 40);
      drawGauge(1200, 200, 18, 220 + Math.cos(t * 0.7) * 30);
      pipes.forEach((p, pi) => {
        const pos = pathPos(p.pts, ((t * 0.15 + pi * 0.3) % 1 + 1) % 1);
        circle(pos[0], pos[1], 4, null, pi % 2 === 0 ? "rgba(26,159,212,0.8)" : "rgba(240,180,41,0.8)");
      });
      t += 0.016;
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"fixed", top:0, left:0, width:"100%", height:"100%", zIndex:0, pointerEvents:"none" }}/>;
};

const GridOverlay = () => (
  <div style={{ position:"fixed", top:0, left:0, width:"100%", height:"100%", zIndex:0, pointerEvents:"none",
    backgroundImage:"linear-gradient(rgba(26,159,212,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(26,159,212,0.03) 1px,transparent 1px)",
    backgroundSize:"60px 60px" }}/>
);

// ── NAVIGATION ──
const Nav = ({ onFeedback, onLaunch }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const scrollTo = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior:"smooth" }); };
  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100,
      background: scrolled ? "rgba(2,11,24,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(200,146,26,0.2)" : "none",
      padding:"0 2rem", height:"64px", display:"flex", alignItems:"center", justifyContent:"space-between",
      transition:"all 0.3s ease" }}>
      <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"1.2rem", fontWeight:700 }}>
        Hydro<span style={{ color:"#f0b429" }}>Mind</span> <span style={{ color:"#1a9fd4", fontSize:"0.7rem", verticalAlign:"middle" }}>AI</span>
      </div>
      <div style={{ display:"flex", gap:"2rem", alignItems:"center" }} className="hide-mobile">
        {["features","how-it-works","pricing"].map(id => (
          <button key={id} onClick={() => scrollTo(id)}
            style={{ background:"none", border:"none", color:"#6b8fa8", cursor:"pointer", fontFamily:"'Rajdhani',sans-serif",
              fontSize:"0.95rem", textTransform:"uppercase", letterSpacing:"0.05em", transition:"color 0.2s" }}
            onMouseEnter={e => e.target.style.color="#e8f4fd"} onMouseLeave={e => e.target.style.color="#6b8fa8"}>
            {id.replace("-"," ")}
          </button>
        ))}
      </div>
      <div style={{ display:"flex", gap:"1rem" }}>
        <button onClick={onFeedback}
          style={{ background:"none", border:"1px solid rgba(200,146,26,0.4)", color:"#c8921a", padding:"8px 16px",
            borderRadius:"4px", cursor:"pointer", fontFamily:"'Rajdhani',sans-serif", fontSize:"0.85rem" }}>
          Feedback
        </button>
        <button onClick={onLaunch}
          style={{ background:"linear-gradient(135deg,#c8921a,#f0b429)", border:"none", color:"#020b18",
            padding:"8px 20px", borderRadius:"4px", cursor:"pointer", fontFamily:"'Orbitron',monospace",
            fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.08em" }}>
          LAUNCH APP
        </button>
      </div>
    </nav>
  );
};

// ── HERO ──
const Hero = ({ onLaunch }) => {
  const scrollTo = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior:"smooth" }); };
  return (
    <section style={{ position:"relative", zIndex:1, minHeight:"100vh", display:"flex", alignItems:"center",
      justifyContent:"center", textAlign:"center", padding:"0 2rem" }}>
      <div>
        <div className="fadeUp-1" style={{ fontFamily:"'Share Tech Mono',monospace", color:"#1a9fd4",
          fontSize:"0.8rem", letterSpacing:"0.3em", marginBottom:"1.5rem", textTransform:"uppercase" }}>
          ⚙ Hydraulic Intelligence Platform
        </div>
        <h1 className="fadeUp-2" style={{ fontFamily:"'Orbitron',monospace", fontSize:"clamp(2.5rem,6vw,5rem)",
          fontWeight:900, lineHeight:1.1, marginBottom:"1.5rem" }}>
          Hydro<span style={{ color:"#f0b429" }}>Mind</span>
          <span style={{ display:"block", fontSize:"0.45em", color:"#1a9fd4", marginTop:"0.5rem" }}>AI ADVISOR</span>
        </h1>
        <p className="fadeUp-3" style={{ fontSize:"1.2rem", color:"#6b8fa8", maxWidth:"600px", margin:"0 auto 2.5rem",
          lineHeight:1.7 }}>
          Expert hydraulic systems intelligence for crane & heavy equipment technicians.
          Fault diagnosis · System design · OEM knowledge base.
        </p>
        <div className="fadeUp-4" style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={onLaunch}
            style={{ background:"linear-gradient(135deg,#c8921a,#f0b429)", border:"none", color:"#020b18",
              padding:"16px 36px", borderRadius:"4px", cursor:"pointer", fontFamily:"'Orbitron',monospace",
              fontSize:"0.8rem", fontWeight:700, letterSpacing:"0.1em",
              boxShadow:"0 0 40px rgba(200,146,26,0.4)" }}>
            LAUNCH APP →
          </button>
          <button onClick={() => scrollTo("how-it-works")}
            style={{ background:"none", border:"1px solid rgba(26,159,212,0.4)", color:"#1a9fd4",
              padding:"16px 36px", borderRadius:"4px", cursor:"pointer", fontFamily:"'Rajdhani',sans-serif",
              fontSize:"0.95rem", letterSpacing:"0.05em" }}>
            How It Works
          </button>
        </div>
      </div>
    </section>
  );
};

// ── HOW IT WORKS ──
const HowItWorks = () => {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) e.target.classList.add("visible"); }), {threshold:0.1});
    if (ref.current) ref.current.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  const steps = [
    { icon:"🔍", title:"Describe the Fault", desc:"Type your symptom — slow hoist, pressure drop, CBV chatter, pump noise. Plain language works." },
    { icon:"🧠", title:"KB Search First", desc:"HydroMind searches 33 indexed OEM manuals and field case studies before touching the web." },
    { icon:"⚙️", title:"Structured Answer", desc:"Receive root cause analysis, step-by-step diagnosis, pressure settings, and torque specs." },
    { icon:"📐", title:"Design & Calculate", desc:"Size pumps, motors, pipes, coolers. Generate full BOM for new hydraulic systems." },
  ];
  return (
    <section id="how-it-works" ref={ref} style={{ position:"relative", zIndex:1, padding:"6rem 2rem" }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
        <h2 className="reveal" style={{ fontFamily:"'Orbitron',monospace", fontSize:"clamp(1.5rem,3vw,2.2rem)",
          textAlign:"center", marginBottom:"3.5rem" }}>
          How It <span style={{ color:"#f0b429" }}>Works</span>
        </h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1.5rem" }} className="grid-2 grid-3">
          {steps.map((s, i) => (
            <div key={i} className="reveal" style={{ background:"rgba(4,20,40,0.6)",
              border:"1px solid rgba(26,159,212,0.15)", borderRadius:"8px", padding:"2rem 1.5rem", textAlign:"center",
              transition:"border-color 0.3s", cursor:"default" }}
              onMouseEnter={e => e.currentTarget.style.borderColor="rgba(200,146,26,0.4)"}
              onMouseLeave={e => e.currentTarget.style.borderColor="rgba(26,159,212,0.15)"}>
              <div style={{ fontSize:"2.5rem", marginBottom:"1rem" }}>{s.icon}</div>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"0.8rem", color:"#f0b429",
                marginBottom:"0.8rem", letterSpacing:"0.05em" }}>{s.title}</div>
              <div style={{ fontSize:"0.9rem", color:"#6b8fa8", lineHeight:1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── AI ADVISOR SECTION ──
const AiAdvisor = () => {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) e.target.classList.add("visible"); }), {threshold:0.1});
    if (ref.current) ref.current.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return (
    <section id="features" ref={ref} style={{ position:"relative", zIndex:1, padding:"4rem 2rem" }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
        <h2 className="reveal" style={{ fontFamily:"'Orbitron',monospace", fontSize:"clamp(1.5rem,3vw,2.2rem)",
          textAlign:"center", marginBottom:"1rem" }}>
          AI <span style={{ color:"#f0b429" }}>Knowledge Base</span>
        </h2>
        <p className="reveal" style={{ textAlign:"center", color:"#6b8fa8", marginBottom:"3rem", fontSize:"1rem" }}>
          33 indexed manuals · Rexroth · Danfoss · Parker · Kawasaki · Favelle Favco · Liebherr
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"1rem" }} className="grid-5">
          {[["📖","OEM MANUALS","Rexroth, Eaton,\nLiebherr, Favco"],
            ["📐","ISO SCHEMATICS","Open/closed loop,\ncrane circuits"],
            ["⚗️","THEORY & LAWS","Pascal, Bernoulli,\nvalve theory"],
            ["🔍","FAULT LIBRARY","Symptoms, causes,\nremedies"],
            ["✏️","AI SCHEMATIC","AI draws circuit\nPDF / PNG export",true]
          ].map(([icon,label,sub,hl]) => (
            <div key={label} className="reveal" style={{ background: hl ? "rgba(200,146,26,0.08)" : "rgba(4,20,40,0.6)",
              border:`1px solid ${hl ? "rgba(200,146,26,0.4)" : "rgba(26,159,212,0.15)"}`,
              borderRadius:"8px", padding:"1.5rem 1rem", textAlign:"center" }}>
              <div style={{ fontSize:"2rem", marginBottom:"0.8rem" }}>{icon}</div>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"0.65rem", color: hl ? "#f0b429" : "#1a9fd4",
                marginBottom:"0.5rem", letterSpacing:"0.05em" }}>{label}</div>
              <div style={{ fontSize:"0.78rem", color:"#6b8fa8", lineHeight:1.5, whiteSpace:"pre-line" }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── FEATURES ──
const Features = () => {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) e.target.classList.add("visible"); }), {threshold:0.1});
    if (ref.current) ref.current.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  const feats = [
    { icon:"🏗️", title:"Offshore Crane Support", desc:"Favelle Favco, Liebherr, National Oilwell. ADNOC field cases included." },
    { icon:"⚡", title:"Proportional Valves", desc:"Rexroth, Eaton, Sauer Danfoss amplifier card setup and diagnostics." },
    { icon:"🌡️", title:"Thermal Analysis", desc:"Heat load calculation, cooler sizing, oil grade selection by ambient." },
    { icon:"📊", title:"System Design", desc:"12-step HPU design: pump → motor → DCV → filter → tank → BOM." },
    { icon:"🔧", title:"Commissioning", desc:"Step-by-step first-start checklist, pressure setting, flushing procedure." },
    { icon:"📋", title:"PM Schedules", desc:"Preventive maintenance intervals per OEM and DNV GL offshore rules." },
  ];
  return (
    <section ref={ref} style={{ position:"relative", zIndex:1, padding:"4rem 2rem" }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
        <h2 className="reveal" style={{ fontFamily:"'Orbitron',monospace", fontSize:"clamp(1.5rem,3vw,2.2rem)",
          textAlign:"center", marginBottom:"3rem" }}>
          Platform <span style={{ color:"#f0b429" }}>Features</span>
        </h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.5rem" }} className="grid-2">
          {feats.map((f, i) => (
            <div key={i} className="reveal" style={{ background:"rgba(4,20,40,0.6)",
              border:"1px solid rgba(26,159,212,0.15)", borderRadius:"8px", padding:"1.8rem" }}>
              <div style={{ fontSize:"2rem", marginBottom:"0.8rem" }}>{f.icon}</div>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"0.75rem", color:"#1a9fd4",
                marginBottom:"0.6rem" }}>{f.title}</div>
              <div style={{ fontSize:"0.9rem", color:"#6b8fa8", lineHeight:1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── CALCULATORS ──
const Calculators = () => {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) e.target.classList.add("visible"); }), {threshold:0.1});
    if (ref.current) ref.current.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return (
    <section ref={ref} style={{ position:"relative", zIndex:1, padding:"4rem 2rem" }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
        <h2 className="reveal" style={{ fontFamily:"'Orbitron',monospace", fontSize:"clamp(1.5rem,3vw,2.2rem)",
          textAlign:"center", marginBottom:"1rem" }}>
          Built-in <span style={{ color:"#f0b429" }}>Calculators</span>
        </h2>
        <p className="reveal" style={{ textAlign:"center", color:"#6b8fa8", marginBottom:"3rem" }}>
          Engineering formulas at your fingertips — no spreadsheet needed
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem" }} className="grid-2">
          {[
            ["Flow Rate","Q = Vg × n / 1000","L/min"],
            ["Cylinder Force","F = p × A / 10","kN"],
            ["Motor Torque","T = p × Vg / 20π","Nm"],
            ["Hydraulic Power","P = p × Q / 600","kW"],
            ["Pipe Bore","d = √(Q × 21.22 / v)","mm"],
            ["Heat Rejection","Qh = P × (1 − η)","kW"],
          ].map(([name, formula, unit]) => (
            <div key={name} className="reveal" style={{ background:"rgba(13,79,140,0.15)",
              border:"1px solid rgba(26,159,212,0.2)", borderRadius:"6px", padding:"1.2rem" }}>
              <div style={{ fontSize:"0.75rem", color:"#6b8fa8", marginBottom:"0.4rem" }}>{name}</div>
              <div style={{ fontFamily:"'Share Tech Mono',monospace", color:"#1a9fd4", fontSize:"0.85rem",
                marginBottom:"0.3rem" }}>{formula}</div>
              <div style={{ fontSize:"0.7rem", color:"#c8921a" }}>{unit}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── PRICING ──
const Pricing = ({ onLaunch }) => {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) e.target.classList.add("visible"); }), {threshold:0.1});
    if (ref.current) ref.current.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return (
    <section id="pricing" ref={ref} style={{ position:"relative", zIndex:1, padding:"6rem 2rem" }}>
      <div style={{ maxWidth:"900px", margin:"0 auto" }}>
        <h2 className="reveal" style={{ fontFamily:"'Orbitron',monospace", fontSize:"clamp(1.5rem,3vw,2.2rem)",
          textAlign:"center", marginBottom:"3rem" }}>
          Simple <span style={{ color:"#f0b429" }}>Pricing</span>
        </h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2rem" }} className="grid-2">
          {[
            { name:"FREE", price:"$0", period:"/month", features:["5 queries/day","KB search","Basic fault diagnosis","Community support"], cta:"GET STARTED", hl:false },
            { name:"PREMIUM", price:"$29", period:"/month", features:["Unlimited queries","Full KB + web search","System design (12-step)","Priority support","Export reports"], cta:"START TRIAL", hl:true },
          ].map(plan => (
            <div key={plan.name} className="reveal" style={{ background: plan.hl ? "rgba(200,146,26,0.08)" : "rgba(4,20,40,0.6)",
              border:`2px solid ${plan.hl ? "rgba(200,146,26,0.5)" : "rgba(26,159,212,0.2)"}`,
              borderRadius:"12px", padding:"2.5rem", textAlign:"center",
              boxShadow: plan.hl ? "0 0 40px rgba(200,146,26,0.15)" : "none" }}>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"0.8rem", color: plan.hl ? "#f0b429" : "#1a9fd4",
                letterSpacing:"0.15em", marginBottom:"1rem" }}>{plan.name}</div>
              <div style={{ fontSize:"3rem", fontWeight:700, fontFamily:"'Orbitron',monospace",
                color: plan.hl ? "#f0b429" : "#e8f4fd" }}>{plan.price}</div>
              <div style={{ color:"#6b8fa8", fontSize:"0.85rem", marginBottom:"2rem" }}>{plan.period}</div>
              <ul style={{ listStyle:"none", marginBottom:"2rem", textAlign:"left" }}>
                {plan.features.map(f => (
                  <li key={f} style={{ padding:"0.5rem 0", borderBottom:"1px solid rgba(255,255,255,0.05)",
                    fontSize:"0.9rem", color:"#e8f4fd", display:"flex", gap:"0.6rem" }}>
                    <span style={{ color:"#1a9fd4" }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={onLaunch} style={{ width:"100%", padding:"13px",
                background: plan.hl ? "linear-gradient(135deg,#c8921a,#f0b429)" : "none",
                border: plan.hl ? "none" : "1px solid rgba(26,159,212,0.4)",
                color: plan.hl ? "#020b18" : "#1a9fd4",
                borderRadius:"4px", cursor:"pointer", fontFamily:"'Orbitron',monospace",
                fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.1em" }}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── FOOTER ──
const Footer = ({ onFeedback }) => (
  <footer style={{ position:"relative", zIndex:1, borderTop:"1px solid rgba(200,146,26,0.15)",
    padding:"3rem 2rem", textAlign:"center" }}>
    <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"1rem", marginBottom:"0.5rem" }}>
      Hydro<span style={{ color:"#f0b429" }}>Mind</span> AI
    </div>
    <div style={{ color:"#6b8fa8", fontSize:"0.85rem", marginBottom:"1rem" }}>
      Hydraulic Intelligence for the Field
    </div>
    <button onClick={onFeedback} style={{ background:"none", border:"none", color:"#6b8fa8",
      cursor:"pointer", fontSize:"0.85rem", textDecoration:"underline" }}>
      Send Feedback
    </button>
    <div style={{ color:"#6b8fa8", fontSize:"0.75rem", marginTop:"1.5rem" }}>
      © 2026 HydroMind AI · hydromindai.com
    </div>
  </footer>
);

// ── FEEDBACK MODAL ──
const FeedbackModal = ({ onClose }) => {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const submit = () => { if (text.trim()) setSent(true); };
  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose()}} style={{ position:"fixed",top:0,left:0,width:"100%",height:"100%",
      zIndex:999, background:"rgba(2,11,24,0.88)", backdropFilter:"blur(8px)",
      display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"rgba(4,20,40,0.97)", border:"1px solid rgba(200,146,26,0.3)",
        borderRadius:"10px", padding:"2.5rem", maxWidth:"480px", width:"90%", position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute",top:"14px",right:"16px",background:"none",
          border:"none",color:"#6b8fa8",fontSize:"1.3rem",cursor:"pointer" }}>✕</button>
        {sent ? (
          <div style={{ textAlign:"center", padding:"2rem" }}>
            <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>✅</div>
            <div style={{ fontFamily:"'Orbitron',monospace", color:"#f0b429" }}>Thank you!</div>
            <div style={{ color:"#6b8fa8", marginTop:"0.5rem" }}>Your feedback helps improve HydroMind.</div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"1rem", marginBottom:"1.5rem" }}>
              Send <span style={{ color:"#f0b429" }}>Feedback</span>
            </div>
            <textarea value={text} onChange={e=>setText(e.target.value)}
              placeholder="Describe a fault scenario, missing component, or feature request..."
              style={{ width:"100%", height:"140px", background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(26,159,212,0.25)", borderRadius:"4px", padding:"12px",
                color:"#e8f4fd", fontSize:"0.9rem", resize:"vertical", outline:"none", marginBottom:"1rem" }}/>
            <button onClick={submit} style={{ width:"100%", padding:"12px",
              background:"linear-gradient(135deg,#c8921a,#f0b429)", border:"none", color:"#020b18",
              borderRadius:"4px", cursor:"pointer", fontFamily:"'Orbitron',monospace",
              fontSize:"0.75rem", fontWeight:700 }}>
              SUBMIT FEEDBACK
            </button>
          </>
        )}
      </div>
    </div>
  );
};


// ── HYDRAULIC CALCULATOR PANEL ──────────────────────────────────────────────
const CalcPanel = () => {
  const [screen, setScreen] = useState("home"); // home | cylinder | motor | pump | pressure_drop | piping
  const [vals, setVals] = useState({});
  const [results, setResults] = useState({});

  const set = (k, v) => setVals(p => ({ ...p, [k]: v }));
  const num = (k) => parseFloat(vals[k]) || 0;

  const cardStyle = (active) => ({
    background: active ? "rgba(26,159,212,0.12)" : "rgba(4,20,40,0.7)",
    border: `1px solid ${active ? "rgba(26,159,212,0.5)" : "rgba(26,159,212,0.15)"}`,
    borderRadius:"10px", padding:"2rem 1rem", textAlign:"center", cursor:"pointer",
    transition:"all 0.2s",
  });
  const inp = (k, placeholder, unit) => (
    <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.8rem" }}>
      <input value={vals[k]||""} onChange={e=>set(k,e.target.value)} placeholder={placeholder}
        type="number" style={{ flex:1, background:"rgba(255,255,255,0.04)",
          border:"1px solid rgba(26,159,212,0.25)", borderRadius:"4px", padding:"10px 12px",
          color:"#e8f4fd", fontSize:"0.95rem", outline:"none" }}/>
      <div style={{ minWidth:"52px", padding:"10px 8px", border:"1px solid rgba(26,159,212,0.3)",
        borderRadius:"4px", color:"#1a9fd4", fontSize:"0.85rem", textAlign:"center",
        background:"rgba(26,159,212,0.06)" }}>{unit}</div>
    </div>
  );
  const resRow = (label, value, unit) => (
    <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.8rem" }}>
      <div style={{ flex:1, fontSize:"0.9rem", color:"#6b8fa8" }}>{label}</div>
      <div style={{ flex:1, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(26,159,212,0.15)",
        borderRadius:"4px", padding:"10px 12px", color:"#28ca41", fontSize:"0.95rem",
        fontFamily:"'Share Tech Mono',monospace" }}>{value || "—"}</div>
      <div style={{ minWidth:"52px", padding:"10px 8px", border:"1px solid rgba(26,159,212,0.3)",
        borderRadius:"4px", color:"#1a9fd4", fontSize:"0.85rem", textAlign:"center",
        background:"rgba(26,159,212,0.06)" }}>{unit}</div>
    </div>
  );
  const calcBtn = (fn) => (
    <button onClick={fn} style={{ width:"100%", padding:"12px",
      background:"linear-gradient(135deg,#1a9fd4,#0d4f8c)", border:"none", borderRadius:"6px",
      color:"#fff", fontFamily:"'Orbitron',monospace", fontSize:"0.72rem", fontWeight:700,
      cursor:"pointer", letterSpacing:"0.08em", marginTop:"0.5rem", marginBottom:"1rem" }}>
      CALCULATE
    </button>
  );
  const resetBtn = () => (
    <button onClick={()=>{setVals({});setResults({});}}
      style={{ width:"100%", padding:"10px", background:"none",
        border:"1px solid rgba(255,255,255,0.1)", borderRadius:"6px", color:"#6b8fa8",
        fontFamily:"'Rajdhani',sans-serif", fontSize:"0.9rem", cursor:"pointer" }}>
      Reset
    </button>
  );
  const backBtn = () => (
    <button onClick={()=>{setScreen("home");setVals({});setResults({});}}
      style={{ background:"none", border:"none", color:"#1a9fd4", cursor:"pointer",
        fontFamily:"'Rajdhani',sans-serif", fontSize:"0.95rem", marginBottom:"1.2rem",
        display:"flex", alignItems:"center", gap:"0.4rem" }}>
      ← Back
    </button>
  );

  // ── CALCULATIONS ──
  const calcCylinder = () => {
    const bore = num("cyl_bore");
    const rod  = num("cyl_rod");
    const p    = num("cyl_pressure");
    const q    = num("cyl_flow"); // lpm
    const Ab   = Math.PI * (bore/2)**2; // mm²
    const Ar   = Math.PI * ((bore/2)**2 - (rod/2)**2); // mm²
    const F_ext = (p * Ab / 100).toFixed(1);   // kN
    const F_ret = (p * Ar / 100).toFixed(1);   // kN
    const v_ext = q > 0 ? (q * 1000 / 60 / (Ab / 1e6) / 1000).toFixed(3) : "—"; // m/s
    const v_ret = q > 0 ? (q * 1000 / 60 / (Ar / 1e6) / 1000).toFixed(3) : "—";
    setResults({ Ab: Ab.toFixed(1), Ar: Ar.toFixed(1), F_ext, F_ret, v_ext, v_ret });
  };
  const calcMotor = () => {
    const Vg   = num("mot_vg");     // cc/rev
    const n    = num("mot_speed");  // rpm
    const etav = num("mot_etav") / 100 || 1;
    const etam = num("mot_etam") / 100 || 1;
    const p    = num("mot_pressure"); // bar
    const Q    = (Vg * n * etav / 1000).toFixed(1);        // L/min
    const T    = (p * Vg * etam / (20 * Math.PI)).toFixed(1); // Nm
    const P    = (p * parseFloat(Q) / 600).toFixed(2);        // kW
    setResults({ Q, T, P });
  };
  const calcPump = () => {
    const Vg   = num("pump_vg");
    const n    = num("pump_speed");
    const etav = num("pump_etav") / 100 || 1;
    const Q    = (Vg * n * etav / 1000).toFixed(1);
    setResults({ Q });
  };
  const calcPressureDrop = () => {
    const Q  = num("pd_flow") / 60000; // m³/s
    const d  = num("pd_dia") / 1000;   // m
    const Cd = num("pd_cd") || 0.7;
    const sg = num("pd_sg") || 0.87;
    const rho = sg * 1000;
    const A   = Math.PI * (d/2)**2;
    const v   = A > 0 ? Q / A : 0;
    const dP  = Cd > 0 ? (rho * v**2 / (2 * Cd**2)) / 1000 : 0; // kPa
    setResults({ v: v.toFixed(3), dP: dP.toFixed(2) });
  };
  const calcPiping = () => {
    const Q   = num("pip_flow") / 60000;  // m³/s
    const sg  = num("pip_sg") || 0.87;
    const d   = num("pip_dia") / 1000;    // m
    const mu  = (num("pip_visc") / 1000); // Pa.s (from cP)
    const rho = sg * 1000;
    const A   = Math.PI * (d/2)**2;
    const v   = A > 0 ? Q / A : 0;
    const Re  = mu > 0 ? (rho * v * d / mu) : 0;
    const regime = Re < 2300 ? "Laminar" : Re < 4000 ? "Transitional" : "Turbulent";
    setResults({ A: (A * 1e6).toFixed(2), v: v.toFixed(3), Re: Re.toFixed(0), regime });
  };

  const wrap = { flex:1, overflowY:"auto", padding:"1.5rem", background:"transparent" };
  const title = (t) => (
    <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"1rem", color:"#e8f4fd",
      marginBottom:"1.5rem" }}>{t}</div>
  );

  // HOME SCREEN
  if (screen === "home") {
    const modules = [
      { id:"cylinder",      icon:"🔩", label:"Cylinder" },
      { id:"motor",         icon:"⚙️", label:"Motor" },
      { id:"pump",          icon:"🔄", label:"Pump" },
      { id:"pressure_drop", icon:"📉", label:"Pressure Drop" },
      { id:"piping",        icon:"🔧", label:"Piping" },
    ];
    return (
      <div style={wrap}>
        <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"1rem", color:"#e8f4fd",
          marginBottom:"0.5rem" }}>🧮 Hydraulic System</div>
        <div style={{ color:"#6b8fa8", fontSize:"0.85rem", marginBottom:"1.5rem" }}>
          Select a calculator module
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", maxWidth:"600px" }}>
          {modules.map(m => (
            <div key={m.id} onClick={()=>setScreen(m.id)} style={cardStyle(false)}
              onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(26,159,212,0.5)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(26,159,212,0.15)"}>
              <div style={{ fontSize:"2.2rem", marginBottom:"0.7rem" }}>{m.icon}</div>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"0.75rem",
                color:"#1a9fd4", letterSpacing:"0.05em" }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // CYLINDER
  if (screen === "cylinder") return (
    <div style={wrap}>
      {backBtn()}
      {title("🔩 Cylinder Calculator")}
      {inp("cyl_bore",     "Piston / Bore Diameter", "mm")}
      {inp("cyl_rod",      "Rod Diameter",            "mm")}
      {inp("cyl_stroke",   "Stroke",                  "mm")}
      {inp("cyl_pressure", "Pressure",                "bar")}
      {inp("cyl_flow",     "Oil Flow",                "lpm")}
      <hr style={{ border:"none", borderTop:"1px solid rgba(255,255,255,0.07)", margin:"1rem 0" }}/>
      {resRow("Bore Area",       results.Ab,    "cm²")}
      {resRow("Rod-Side Area",   results.Ar,    "cm²")}
      {resRow("Extend Force",    results.F_ext, "kN")}
      {resRow("Retract Force",   results.F_ret, "kN")}
      {resRow("Extend Speed",    results.v_ext, "m/s")}
      {resRow("Retract Speed",   results.v_ret, "m/s")}
      {calcBtn(calcCylinder)}
      {resetBtn()}
    </div>
  );

  // MOTOR
  if (screen === "motor") return (
    <div style={wrap}>
      {backBtn()}
      {title("⚙️ Motor Calculator")}
      {inp("mot_vg",       "Displacement",          "cc/rev")}
      {inp("mot_speed",    "Speed",                 "rpm")}
      {inp("mot_etav",     "Volumetric Efficiency", "%")}
      {inp("mot_pressure", "Pressure",              "bar")}
      {inp("mot_etam",     "Mechanical Efficiency", "%")}
      <hr style={{ border:"none", borderTop:"1px solid rgba(255,255,255,0.07)", margin:"1rem 0" }}/>
      {resRow("Flow Rate",    results.Q, "L/min")}
      {resRow("Output Torque",results.T, "Nm")}
      {resRow("Input Power",  results.P, "kW")}
      {calcBtn(calcMotor)}
      {resetBtn()}
    </div>
  );

  // PUMP
  if (screen === "pump") return (
    <div style={wrap}>
      {backBtn()}
      {title("🔄 Pump Calculator")}
      {inp("pump_vg",    "Displacement",          "cc/rev")}
      {inp("pump_speed", "Speed",                 "rpm")}
      {inp("pump_etav",  "Volumetric Efficiency", "%")}
      <hr style={{ border:"none", borderTop:"1px solid rgba(255,255,255,0.07)", margin:"1rem 0" }}/>
      {resRow("Flow Rate", results.Q, "L/min")}
      {calcBtn(calcPump)}
      {resetBtn()}
    </div>
  );

  // PRESSURE DROP
  if (screen === "pressure_drop") return (
    <div style={wrap}>
      {backBtn()}
      {title("📉 Pressure Drop Calculator")}
      {inp("pd_flow", "Flow Rate",               "lpm")}
      {inp("pd_dia",  "Orifice Diameter",         "mm")}
      {inp("pd_cd",   "Flow Coefficient (Cd)",    "—")}
      {inp("pd_sg",   "Specific Gravity of Fluid","—")}
      <hr style={{ border:"none", borderTop:"1px solid rgba(255,255,255,0.07)", margin:"1rem 0" }}/>
      {resRow("Fluid Velocity",  results.v,  "m/s")}
      {resRow("Pressure Drop",   results.dP, "kPa")}
      {calcBtn(calcPressureDrop)}
      {resetBtn()}
    </div>
  );

  // PIPING
  if (screen === "piping") return (
    <div style={wrap}>
      {backBtn()}
      {title("🔧 Piping Calculator")}
      <div style={{ fontSize:"0.75rem", color:"#c8921a", marginBottom:"1rem" }}>
        Using absolute viscosity
      </div>
      {inp("pip_flow", "Flow Rate",            "lpm")}
      {inp("pip_sg",   "Specific Gravity",     "—")}
      {inp("pip_dia",  "Inside Pipe Diameter", "mm")}
      {inp("pip_visc", "Absolute Viscosity",   "cP")}
      <hr style={{ border:"none", borderTop:"1px solid rgba(255,255,255,0.07)", margin:"1rem 0" }}/>
      {resRow("Cross-sectional Area", results.A,      "mm²")}
      {resRow("Flow Velocity",        results.v,      "m/s")}
      {resRow("Reynolds Number",      results.Re,     "—")}
      {resRow("Flow Regime",          results.regime, "—")}
      {calcBtn(calcPiping)}
      {resetBtn()}
    </div>
  );

  return null;
};

// ── CHAT DASHBOARD ──────────────────────────────────────────────────────────
const ChatDashboard = ({ user, onLogout }) => {
  const isAdmin = ADMIN_EMAILS.includes(user?.email);
  const [mode, setMode]           = useState("troubleshoot");
  const [sessions, setSessions]   = useState(() => {
    try { return JSON.parse(localStorage.getItem("hm_sessions") || "[]"); } catch { return []; }
  });
  const [activeId, setActiveId]   = useState(null);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [sideOpen, setSideOpen]   = useState(true);
  const bottomRef = useRef(null);

  // Persist sessions
  useEffect(() => {
    localStorage.setItem("hm_sessions", JSON.stringify(sessions));
  }, [sessions]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages]);

  // Load session messages
  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    const s = sessions.find(s => s.id === activeId);
    setMessages(s?.messages || []);
  }, [activeId]);

  const newSession = () => {
    const id = Date.now().toString();
    const s  = { id, title:"New Chat", mode, messages:[], createdAt: new Date().toISOString() };
    setSessions(prev => [s, ...prev]);
    setActiveId(id);
    setMessages([]);
  };

  const updateSession = (id, msgs) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== id) return s;
      const title = msgs.find(m => m.role === "user")?.content?.slice(0, 40) || "New Chat";
      return { ...s, messages: msgs, title };
    }));
  };

  const deleteSession = (id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeId === id) { setActiveId(null); setMessages([]); }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    // Ensure active session
    let sid = activeId;
    if (!sid) {
      sid = Date.now().toString();
      const s = { id: sid, title: text.slice(0, 40), mode, messages:[], createdAt: new Date().toISOString() };
      setSessions(prev => [s, ...prev]);
      setActiveId(sid);
    }

    const userMsg  = { role:"user", content: text, ts: Date.now() };
    const newMsgs  = [...messages, userMsg];
    setMessages(newMsgs);
    updateSession(sid, newMsgs);
    setLoading(true);

    try {
      const token = localStorage.getItem("hm_token");
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type":"application/json", ...(token ? { Authorization:`Bearer ${token}` } : {}) },
        body: JSON.stringify({
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
          mode
        }),
        signal: AbortSignal.timeout(60000)
      });

      const data = await res.json();

      // Extract text from Anthropic response format
      let reply = "";
      let source = "kb";
      if (data.content && Array.isArray(data.content)) {
        reply = data.content.find(b => b.type === "text")?.text || "No response received.";
      } else if (data.reply) {
        reply = data.reply;
      } else if (data.error) {
        reply = `Error: ${typeof data.error === "string" ? data.error : JSON.stringify(data.error)}`;
      } else {
        reply = "No response received.";
      }

      // Detect source
      if (data.source) source = data.source;
      else if (reply.toLowerCase().includes("web search") || reply.toLowerCase().includes("according to")) source = "web";

      const aiMsg = { role:"assistant", content: reply, ts: Date.now(), source };
      const finalMsgs = [...newMsgs, aiMsg];
      setMessages(finalMsgs);
      updateSession(sid, finalMsgs);
    } catch (err) {
      const errMsg = { role:"assistant", content:`Connection error: ${err.message}`, ts: Date.now(), source:"error" };
      const finalMsgs = [...newMsgs, errMsg];
      setMessages(finalMsgs);
      updateSession(sid, finalMsgs);
    }
    setLoading(false);
  };

  const modeConfig = {
    troubleshoot: { label:"🔧 Troubleshoot", color:"#1a9fd4",  desc:"Troubleshooter Mode Active" },
    designer:     { label:"📐 Designer",     color:"#c8921a",  desc:"System Designer Mode Active" },
    calc:         { label:"🧮 Calculator",   color:"#28ca41",  desc:"Hydraulic System Calculators" },
    news:         { label:"📰 News",          color:"#6b8fa8",  desc:"Hydraulics News & Updates" },
    admin:        { label:"⚙ Admin",          color:"#f0b429",  desc:"Admin Panel" },
  };

  const modes = isAdmin
    ? ["troubleshoot","designer","calc","news","admin"]
    : ["troubleshoot","designer","calc","news"];

  const S = { // styles shorthand
    dash:   { display:"flex", height:"100vh", background:"#020b18", fontFamily:"'Rajdhani',sans-serif" },
    side:   { width: sideOpen ? "240px" : "0", minWidth: sideOpen ? "240px" : "0", overflow:"hidden",
               background:"rgba(4,20,40,0.98)", borderRight:"1px solid rgba(200,146,26,0.15)",
               display:"flex", flexDirection:"column", transition:"all 0.3s ease" },
    main:   { flex:1, display:"flex", flexDirection:"column", overflow:"hidden" },
    topbar: { height:"56px", background:"rgba(4,20,40,0.95)", borderBottom:"1px solid rgba(200,146,26,0.15)",
               display:"flex", alignItems:"center", padding:"0 1rem", gap:"0.75rem", flexShrink:0 },
    msgs:   { flex:1, overflowY:"auto", padding:"1.5rem", display:"flex", flexDirection:"column", gap:"1rem" },
    input:  { padding:"1rem", borderTop:"1px solid rgba(200,146,26,0.15)", background:"rgba(4,20,40,0.95)",
               display:"flex", gap:"0.75rem", alignItems:"flex-end" },
  };

  return (
    <div style={S.dash}>
      {/* SIDEBAR */}
      <div style={S.side}>
        <div style={{ padding:"1rem", borderBottom:"1px solid rgba(200,146,26,0.15)" }}>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"0.9rem", marginBottom:"0.8rem" }}>
            Hydro<span style={{ color:"#f0b429" }}>Mind</span>
          </div>
          {/* User badge */}
          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.8rem" }}>
            <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"linear-gradient(135deg,#0d4f8c,#1a9fd4)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem", fontWeight:700, flexShrink:0 }}>
              {(user?.name || user?.email || "U")[0].toUpperCase()}
            </div>
            <div style={{ overflow:"hidden" }}>
              <div style={{ fontSize:"0.82rem", color:"#e8f4fd", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {user?.name || user?.email}
              </div>
              {isAdmin && <div style={{ fontSize:"0.65rem", color:"#f0b429" }}>ADMIN</div>}
            </div>
          </div>
          <button onClick={newSession} style={{ width:"100%", padding:"8px", background:"linear-gradient(135deg,#c8921a,#f0b429)",
            border:"none", borderRadius:"4px", color:"#020b18", fontFamily:"'Orbitron',monospace",
            fontSize:"0.65rem", fontWeight:700, cursor:"pointer", letterSpacing:"0.05em" }}>
            + NEW CHAT
          </button>
        </div>

        {/* Session list */}
        <div style={{ flex:1, overflowY:"auto", padding:"0.5rem" }}>
          <div style={{ fontSize:"0.7rem", color:"#6b8fa8", padding:"0.5rem", letterSpacing:"0.1em",
            textTransform:"uppercase" }}>// RECENT SESSIONS</div>
          {sessions.map(s => (
            <div key={s.id} onClick={() => setActiveId(s.id)}
              style={{ padding:"0.6rem 0.8rem", borderRadius:"4px", cursor:"pointer", marginBottom:"2px",
                background: s.id === activeId ? "rgba(13,79,140,0.3)" : "transparent",
                border: s.id === activeId ? "1px solid rgba(26,159,212,0.2)" : "1px solid transparent",
                display:"flex", justifyContent:"space-between", alignItems:"center",
                transition:"all 0.2s" }}
              onMouseEnter={e => { if(s.id!==activeId) e.currentTarget.style.background="rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { if(s.id!==activeId) e.currentTarget.style.background="transparent"; }}>
              <div style={{ overflow:"hidden" }}>
                <div style={{ fontSize:"0.8rem", color:"#e8f4fd", whiteSpace:"nowrap",
                  overflow:"hidden", textOverflow:"ellipsis", maxWidth:"160px" }}>{s.title}</div>
                <div style={{ fontSize:"0.65rem", color:"#6b8fa8" }}>
                  {new Date(s.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button onClick={e=>{ e.stopPropagation(); deleteSession(s.id); }}
                style={{ background:"none", border:"none", color:"#6b8fa8", cursor:"pointer",
                  fontSize:"0.8rem", padding:"2px 4px", flexShrink:0 }}>🗑</button>
            </div>
          ))}
        </div>

        {/* Logout */}
        <div style={{ padding:"0.8rem", borderTop:"1px solid rgba(200,146,26,0.15)" }}>
          <button onClick={onLogout} style={{ width:"100%", padding:"8px", background:"none",
            border:"1px solid rgba(232,64,64,0.3)", borderRadius:"4px", color:"#e84040",
            fontFamily:"'Rajdhani',sans-serif", fontSize:"0.85rem", cursor:"pointer" }}>
            LOGOUT
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={S.main}>
        {/* Top bar */}
        <div style={S.topbar}>
          <button onClick={() => setSideOpen(v => !v)}
            style={{ background:"none", border:"none", color:"#6b8fa8", cursor:"pointer", fontSize:"1.1rem", flexShrink:0 }}>
            ☰
          </button>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"0.85rem", color:"#e8f4fd", marginRight:"auto" }}>
            Hydro<span style={{ color:"#f0b429" }}>Mind</span> <span style={{ color:"#1a9fd4", fontSize:"0.65rem" }}>AI</span>
          </div>
          {/* Mode tabs */}
          {modes.map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{ padding:"6px 14px", borderRadius:"4px", cursor:"pointer", fontSize:"0.75rem",
                fontFamily:"'Rajdhani',sans-serif", fontWeight:600, letterSpacing:"0.03em", transition:"all 0.2s",
                background: mode === m ? `${modeConfig[m].color}22` : "none",
                border: mode === m ? `1px solid ${modeConfig[m].color}` : "1px solid transparent",
                color: mode === m ? modeConfig[m].color : "#6b8fa8" }}>
              {modeConfig[m].label}
            </button>
          ))}
          <button onClick={onLogout}
            style={{ padding:"6px 12px", borderRadius:"4px", background:"none",
              border:"1px solid rgba(232,64,64,0.3)", color:"#e84040", cursor:"pointer",
              fontFamily:"'Rajdhani',sans-serif", fontSize:"0.8rem", flexShrink:0 }}>
            LOGOUT
          </button>
        </div>

        {/* CALCULATOR PANEL */}
        {mode === "calc" && <CalcPanel/>}

        {/* Messages */}
        {mode !== "calc" && <div style={S.msgs}>
          {messages.length === 0 && (
            <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column",
              gap:"1rem", opacity:0.5 }}>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"1.5rem" }}>
                Hydro<span style={{ color:"#f0b429" }}>Mind</span>
              </div>
              <div style={{ color:"#6b8fa8", fontSize:"0.9rem", textAlign:"center" }}>
                🔧 {modeConfig[mode].desc}<br/>
                <span style={{ fontSize:"0.8rem" }}>I'll search the Knowledge Base first, then the web if needed.</span>
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className="chat-msg-enter"
              style={{ display:"flex", gap:"0.75rem", flexDirection: m.role==="user" ? "row-reverse" : "row",
                alignItems:"flex-start" }}>
              {/* Avatar */}
              <div style={{ width:"32px", height:"32px", borderRadius:"50%", flexShrink:0,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem", fontWeight:700,
                fontFamily:"'Orbitron',monospace",
                background: m.role==="user"
                  ? "linear-gradient(135deg,#0d4f8c,#1a9fd4)"
                  : "linear-gradient(135deg,#c8921a,#f0b429)",
                color: m.role==="user" ? "white" : "#020b18" }}>
                {m.role==="user" ? (user?.name||"U")[0].toUpperCase() : "HM"}
              </div>
              {/* Bubble */}
              <div style={{ maxWidth:"78%", display:"flex", flexDirection:"column",
                alignItems: m.role==="user" ? "flex-end" : "flex-start" }}>
                {/* Source badge */}
                {m.role==="assistant" && m.source && m.source !== "error" && (
                  <div style={{ fontSize:"0.65rem", color: m.source==="web" ? "#c8921a" : "#1a9fd4",
                    marginBottom:"3px", display:"flex", alignItems:"center", gap:"4px" }}>
                    <span style={{ width:"6px", height:"6px", borderRadius:"50%", display:"inline-block",
                      background: m.source==="web" ? "#c8921a" : "#1a9fd4" }}/>
                    SOURCE: {m.source === "web" ? "WEB SEARCH" : "KNOWLEDGE BASE"}
                  </div>
                )}
                <div style={{ padding:"10px 14px", borderRadius: m.role==="user" ? "8px 2px 8px 8px" : "2px 8px 8px 8px",
                  fontSize:"0.88rem", lineHeight:1.65, color:"#e8f4fd",
                  background: m.role==="user" ? "rgba(13,79,140,0.35)" : "rgba(200,146,26,0.08)",
                  border:`1px solid ${m.role==="user" ? "rgba(26,159,212,0.2)" : "rgba(200,146,26,0.15)"}`,
                  whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display:"flex", gap:"0.75rem", alignItems:"flex-start" }}>
              <div style={{ width:"32px", height:"32px", borderRadius:"50%",
                background:"linear-gradient(135deg,#c8921a,#f0b429)", display:"flex",
                alignItems:"center", justifyContent:"center", fontSize:"0.7rem", color:"#020b18", fontWeight:700 }}>HM</div>
              <div style={{ padding:"12px 16px", background:"rgba(200,146,26,0.08)",
                border:"1px solid rgba(200,146,26,0.15)", borderRadius:"2px 8px 8px 8px" }}>
                <span style={{ display:"inline-flex", gap:"4px" }}>
                  {[0,1,2].map(i => <span key={i} style={{ width:"6px", height:"6px", borderRadius:"50%",
                    background:"#1a9fd4", display:"inline-block", animation:`pulse 1.2s ${i*0.2}s infinite` }}/>)}
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>}

        {/* Input */}
        {mode !== "calc" && <div style={S.input}>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={`Describe the fault or ask a hydraulic question... (Enter to send)`}
            rows={2}
            style={{ flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(26,159,212,0.2)",
              borderRadius:"6px", padding:"10px 14px", color:"#e8f4fd", fontSize:"0.9rem",
              fontFamily:"'Rajdhani',sans-serif", outline:"none", resize:"none", lineHeight:1.5,
              transition:"border-color 0.2s" }}
            onFocus={e => e.target.style.borderColor="rgba(26,159,212,0.5)"}
            onBlur={e => e.target.style.borderColor="rgba(26,159,212,0.2)"}/>
          <button onClick={sendMessage} disabled={loading || !input.trim()}
            style={{ padding:"10px 20px", background: loading || !input.trim()
              ? "rgba(200,146,26,0.3)" : "linear-gradient(135deg,#c8921a,#f0b429)",
              border:"none", borderRadius:"6px", color:"#020b18", fontFamily:"'Orbitron',monospace",
              fontSize:"0.7rem", fontWeight:700, cursor: loading || !input.trim() ? "default" : "pointer",
              letterSpacing:"0.05em", transition:"all 0.2s", flexShrink:0 }}>
            SEND
          </button>
        </div>}
      </div>
    </div>
  );
};

// ── LAUNCH / AUTH MODAL ──
const LaunchModal = ({ onClose, onLogin }) => {
  const [view,     setView]     = useState("login");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPass]     = useState("");
  const [msg,      setMsg]      = useState({ text:"", type:"" });
  const [loading,  setLoading]  = useState(false);
  const reset = () => setMsg({ text:"", type:"" });

  const handleLogin = async () => {
    if (!email || !password) { setMsg({ text:"Email and password required.", type:"error" }); return; }
    setLoading(true); reset();
    try {
      const res  = await fetch(`${API}/api/auth/login`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("hm_token", data.token);
      localStorage.setItem("hm_user",  JSON.stringify(data.user || { email, name: data.name || email }));
      onLogin(data.user || { email, name: data.name || email });
    } catch(e) { setMsg({ text:e.message, type:"error" }); }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!name || !email || !password) { setMsg({ text:"All fields required.", type:"error" }); return; }
    setLoading(true); reset();
    try {
      const res  = await fetch(`${API}/api/auth/register`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ name, email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setMsg({ text:"✅ Account created! You can now sign in.", type:"success" });
      setTimeout(() => setView("login"), 1600);
    } catch(e) { setMsg({ text:e.message, type:"error" }); }
    setLoading(false);
  };

  const handleForgot = async () => {
    if (!email) { setMsg({ text:"Email required.", type:"error" }); return; }
    setLoading(true); reset();
    try {
      const res  = await fetch(`${API}/api/auth/forgot-password`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMsg({ text:"✅ Reset link sent! Check your inbox.", type:"success" });
    } catch(e) { setMsg({ text:e.message, type:"error" }); }
    setLoading(false);
  };

  const inputStyle = { width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(26,159,212,0.25)",
    borderRadius:"4px", padding:"11px 14px", color:"#e8f4fd", fontSize:"0.95rem", marginBottom:"1rem", outline:"none" };
  const btnStyle   = { width:"100%", padding:"13px", background:"linear-gradient(135deg,#c8921a,#f0b429)",
    border:"none", borderRadius:"4px", color:"#020b18", fontFamily:"'Orbitron',monospace",
    fontSize:"0.78rem", fontWeight:700, letterSpacing:"0.1em", cursor:"pointer", marginTop:"0.5rem", opacity:loading?0.7:1 };
  const linkStyle  = { background:"none", border:"none", color:"#1a9fd4", cursor:"pointer",
    fontFamily:"'Rajdhani',sans-serif", fontSize:"0.9rem", textDecoration:"underline", padding:0 };

  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose()}}
      style={{ position:"fixed",top:0,left:0,width:"100%",height:"100%",zIndex:999,
        background:"rgba(2,11,24,0.88)", backdropFilter:"blur(8px)",
        display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"rgba(4,20,40,0.97)", border:"1px solid rgba(200,146,26,0.3)",
        borderRadius:"10px", padding:"2.5rem", maxWidth:"420px", width:"90%", position:"relative",
        boxShadow:"0 0 60px rgba(200,146,26,0.2)" }}>
        <div style={{ position:"absolute",top:0,left:0,width:"100%",height:"3px",
          background:"linear-gradient(90deg,#c8921a,#f0b429,#1a9fd4)", borderRadius:"10px 10px 0 0" }}/>
        <button onClick={onClose} style={{ position:"absolute",top:"14px",right:"16px",background:"none",
          border:"none",color:"#6b8fa8",fontSize:"1.3rem",cursor:"pointer" }}>✕</button>
        <div style={{ textAlign:"center", marginBottom:"1.8rem" }}>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"1.2rem", fontWeight:700 }}>
            Hydro<span style={{ color:"#f0b429" }}>Mind</span> AI
          </div>
          <div style={{ fontSize:"0.8rem", color:"#6b8fa8", marginTop:"0.3rem" }}>
            {view==="login" ? "Sign in to your account" : view==="register" ? "Create your account" : "Reset your password"}
          </div>
        </div>
        {view==="register" && <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full Name" style={inputStyle}/>}
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email" style={inputStyle}/>
        {(view==="login"||view==="register") && <input value={password} onChange={e=>setPass(e.target.value)} placeholder="Password" type="password" style={inputStyle}/>}
        {msg.text && (
          <div style={{ padding:"0.7rem", borderRadius:"4px", marginBottom:"1rem", fontSize:"0.88rem",
            background:msg.type==="success"?"rgba(40,202,65,0.1)":"rgba(232,64,64,0.1)",
            border:`1px solid ${msg.type==="success"?"rgba(40,202,65,0.3)":"rgba(232,64,64,0.3)"}`,
            color:msg.type==="success"?"#28ca41":"#e84040" }}>{msg.text}</div>
        )}
        <button onClick={view==="login"?handleLogin:view==="register"?handleRegister:handleForgot}
          style={btnStyle} disabled={loading}>
          {loading ? "PROCESSING..." : view==="login" ? "SIGN IN" : view==="register" ? "CREATE ACCOUNT" : "SEND RESET LINK"}
        </button>
        <div style={{ marginTop:"1.2rem", textAlign:"center", fontSize:"0.9rem", color:"#6b8fa8" }}>
          {view==="login" && <>
            <button style={linkStyle} onClick={()=>{setView("forgot");reset();}}>Forgot password?</button>
            <span style={{ margin:"0 0.5rem" }}>·</span>
            <button style={linkStyle} onClick={()=>{setView("register");reset();}}>Create account</button>
          </>}
          {view==="register" && <button style={linkStyle} onClick={()=>{setView("login");reset();}}>Already have an account? Sign in</button>}
          {view==="forgot"   && <button style={linkStyle} onClick={()=>{setView("login");reset();}}>← Back to sign in</button>}
        </div>
      </div>
    </div>
  );
};

// ── ROOT APP ──────────────────────────────────────────────────
export default function App() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showLaunch,   setShowLaunch]   = useState(false);
  const [user,         setUser]         = useState(() => {
    try { return JSON.parse(localStorage.getItem("hm_user") || "null"); } catch { return null; }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset")) setShowLaunch(true);
    // Auto-restore session
    const token = localStorage.getItem("hm_token");
    const saved = localStorage.getItem("hm_user");
    if (token && saved && !user) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
  }, []);

  const handleLogin = (u) => { setUser(u); setShowLaunch(false); };
  const handleLogout = () => {
    localStorage.removeItem("hm_token");
    localStorage.removeItem("hm_user");
    setUser(null);
  };

  // ── Authenticated: show ChatDashboard ──
  if (user) {
    return (
      <>
        <GlobalStyle/>
        <ChatDashboard user={user} onLogout={handleLogout}/>
      </>
    );
  }

  // ── Landing page ──
  return (
    <>
      <GlobalStyle/>
      <HydraulicBackground/>
      <GridOverlay/>
      <Nav onFeedback={() => setShowFeedback(true)} onLaunch={() => setShowLaunch(true)}/>
      <Hero onLaunch={() => setShowLaunch(true)}/>
      <HowItWorks/>
      <AiAdvisor/>
      <Features/>
      <Calculators/>
      <Pricing onLaunch={() => setShowLaunch(true)}/>
      <Footer onFeedback={() => setShowFeedback(true)}/>
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)}/>}
      {showLaunch   && <LaunchModal   onClose={() => setShowLaunch(false)} onLogin={handleLogin}/>}
    </>
  );
}

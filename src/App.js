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

// ── GLOBAL STYLES injected once ──
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
      .badge-dot{width:6px;height:6px;background:var(--cyan);border-radius:50%;animation:pulse 2s infinite;display:inline-block}
      .reveal{opacity:0;transform:translateY(30px);transition:opacity 0.7s ease,transform 0.7s ease}
      .reveal.visible{opacity:1;transform:none}
      .gold-divider{width:60px;height:3px;background:linear-gradient(90deg,var(--gold),var(--gold-light));margin:1.2rem 0}
      ::-webkit-scrollbar{width:6px}
      ::-webkit-scrollbar-track{background:#020b18}
      ::-webkit-scrollbar-thumb{background:rgba(200,146,26,0.3);border-radius:3px}
      textarea,input{background:rgba(255,255,255,0.04);border:1px solid rgba(26,159,212,0.2);color:#e8f4fd;outline:none;font-family:'Rajdhani',sans-serif}
      textarea:focus,input:focus{border-color:rgba(200,146,26,0.5)}
      .chat-msg-enter{animation:fadeUp 0.3s ease both}
      @media(max-width:900px){
        .hide-mobile{display:none!important}
        .grid-2{grid-template-columns:1fr!important}
        .grid-3{grid-template-columns:1fr 1fr!important}
      }
      @media(max-width:600px){
        .grid-3{grid-template-columns:1fr!important}
        .grid-5{grid-template-columns:1fr 1fr!important}
      }
    `;
    document.head.appendChild(style);
  }, []);
  return null;
};

// ── HYDRAULIC SCHEMATIC BACKGROUND ──────────────────────────
const HydraulicBackground = () => {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const mouseRef  = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const onMouse = (e) => {
      mouseRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    };
    window.addEventListener("mousemove", onMouse);

    const VW = 1400, VH = 900;
    const sx = (x) => (x / VW) * canvas.width;
    const sy = (y) => (y / VH) * canvas.height;
    const ss = (s) => s * Math.min(canvas.width / VW, canvas.height / VH);

    const C = {
      gold:"#c8921a", goldLt:"#f0b429", goldLine:"rgba(200,146,26,0.55)",
      goldDim:"rgba(200,146,26,0.18)", cyan:"#1a9fd4", cyanLine:"rgba(26,159,212,0.5)",
      cyanDim:"rgba(26,159,212,0.15)", pipeFill:"rgba(26,159,212,0.07)",
      red:"#e84040", redDim:"rgba(232,64,64,0.6)", muted:"rgba(107,143,168,0.7)",
      white:"rgba(232,244,253,0.9)",
    };

    function polyLine(pts, color, width, dash) {
      if (pts.length < 2) return;
      ctx.save();
      ctx.strokeStyle = color; ctx.lineWidth = ss(width || 1.5);
      if (dash) ctx.setLineDash(dash);
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(sx(pts[0][0]), sy(pts[0][1]));
      for (let i = 1; i < pts.length; i++) ctx.lineTo(sx(pts[i][0]), sy(pts[i][1]));
      ctx.stroke();
      ctx.restore();
    }

    function circle(x, y, r, strokeC, fillC, lw) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(sx(x), sy(y), ss(r), 0, Math.PI * 2);
      if (fillC) { ctx.fillStyle = fillC; ctx.fill(); }
      if (strokeC) { ctx.strokeStyle = strokeC; ctx.lineWidth = ss(lw || 1.5); ctx.stroke(); }
      ctx.restore();
    }

    function text(str, x, y, color, size, align) {
      ctx.save();
      ctx.font = `${ss(size || 10)}px 'Share Tech Mono',monospace`;
      ctx.fillStyle = color; ctx.textAlign = align || "center";
      ctx.fillText(str, sx(x), sy(y));
      ctx.restore();
    }

    function drawPump(x, y, r, angle) {
      circle(x, y, r, C.goldLine, C.cyanDim, 2);
      ctx.save();
      ctx.translate(sx(x), sy(y)); ctx.rotate(angle || 0);
      ctx.fillStyle = C.goldLt;
      ctx.beginPath();
      ctx.moveTo(ss(-r * 0.55), ss(-r * 0.3));
      ctx.lineTo(ss(r * 0.55), 0);
      ctx.lineTo(ss(-r * 0.55), ss(r * 0.3));
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    function drawGauge(x, y, r, pressure) {
      circle(x, y, r, C.goldLine, "rgba(4,20,40,0.7)", 1.5);
      for (let i = 0; i < 9; i++) {
        const ang = -Math.PI * 0.8 + (i / 8) * Math.PI * 1.6;
        ctx.save();
        ctx.strokeStyle = i > 5 ? C.red : C.goldLt; ctx.lineWidth = ss(1);
        ctx.beginPath();
        ctx.moveTo(sx(x + Math.cos(ang) * r * 0.7), sy(y + Math.sin(ang) * r * 0.7));
        ctx.lineTo(sx(x + Math.cos(ang) * r * 0.9), sy(y + Math.sin(ang) * r * 0.9));
        ctx.stroke(); ctx.restore();
      }
      const nAng = -Math.PI * 0.8 + pressure * Math.PI * 1.6;
      ctx.save();
      ctx.strokeStyle = pressure > 0.7 ? C.red : C.goldLt;
      ctx.lineWidth = ss(1.5); ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(sx(x), sy(y));
      ctx.lineTo(sx(x + Math.cos(nAng) * r * 0.65), sy(y + Math.sin(nAng) * r * 0.65));
      ctx.stroke(); ctx.restore();
      circle(x, y, r * 0.12, C.gold, C.goldLt, 1);
    }

    const PIPES = [
      { pts:[[190,750],[285,750],[285,615],[420,615],[560,615],[560,750]], color:C.cyanLine, w:3 },
      { pts:[[560,750],[600,750],[740,750],[740,680],[760,680],[760,550],[740,550]], color:C.goldLine, w:3 },
      { pts:[[460,735],[460,680],[380,680],[380,520],[460,520]], color:C.cyanLine, w:2.5 },
      { pts:[[460,430],[460,370],[900,370],[900,820],[160,820],[160,750]], color:C.cyanLine, w:2 },
      { pts:[[440,615],[440,820],[820,820]], color:C.redDim, w:1.5, dash:true },
      { pts:[[950,300],[1250,300],[1250,700],[950,700],[950,300]], color:"rgba(200,146,26,0.12)", w:1.2 },
      { pts:[[1100,300],[1100,700]], color:"rgba(26,159,212,0.10)", w:1 },
      { pts:[[50,200],[50,600],[130,600],[130,200],[50,200]], color:"rgba(26,159,212,0.09)", w:1 },
    ];

    const PARTICLE_PIPES = [
      { pts:[[190,750],[285,750],[285,615],[420,615],[560,615],[560,750]], color:C.cyan, r:3.5, speed:0.18 },
      { pts:[[560,750],[740,750],[740,680],[760,680],[760,550],[740,550]], color:C.goldLt, r:3, speed:0.22 },
      { pts:[[460,735],[460,680],[380,680],[380,520],[460,520]], color:C.cyan, r:2.5, speed:0.16 },
      { pts:[[460,430],[460,370],[900,370],[900,820],[160,820],[160,750]], color:C.cyanLine, r:2, speed:0.12 },
    ];

    const particles = [];
    PARTICLE_PIPES.forEach((pp) => {
      const count = 5;
      for (let i = 0; i < count; i++) {
        particles.push({ pts:pp.pts, t:i/count, speed:pp.speed*(0.8+Math.random()*0.4), color:pp.color, r:pp.r*(0.6+Math.random()*0.7), tail:[] });
      }
    });

    function pathPos(pts, t) {
      const total = pts.reduce((acc, _, i) => {
        if (i === 0) return 0;
        const dx = pts[i][0]-pts[i-1][0], dy = pts[i][1]-pts[i-1][1];
        return acc + Math.sqrt(dx*dx+dy*dy);
      }, 0);
      let target = t * total;
      for (let i = 1; i < pts.length; i++) {
        const dx = pts[i][0]-pts[i-1][0], dy = pts[i][1]-pts[i-1][1];
        const seg = Math.sqrt(dx*dx+dy*dy);
        if (target <= seg) return [pts[i-1][0]+dx*(target/seg), pts[i-1][1]+dy*(target/seg)];
        target -= seg;
      }
      return pts[pts.length-1];
    }

    let t = 0;
    function draw() {
      animRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const vg = ctx.createRadialGradient(canvas.width*0.5,canvas.height*0.5,canvas.height*0.1,canvas.width*0.5,canvas.height*0.5,canvas.height*0.9);
      vg.addColorStop(0, "rgba(2,11,24,0)"); vg.addColorStop(1, "rgba(2,11,24,0.6)");
      ctx.fillStyle = vg; ctx.fillRect(0,0,canvas.width,canvas.height);

      const ox = (mouseRef.current.x - 0.5) * 8, oy = (mouseRef.current.y - 0.5) * 5;
      ctx.save();
      ctx.translate(sx(ox), sy(oy));

      // Pipes
      PIPES.forEach(p => {
        polyLine(p.pts, p.color, p.w||1.5, p.dash ? [ss(5),ss(5)] : undefined);
        if (!p.dash && p.w >= 2) polyLine(p.pts, C.pipeFill, (p.w||2)*2.5);
      });

      // Junctions
      [[285,615],[560,615],[460,370],[900,370],[900,820],[160,820]].forEach(j => circle(j[0],j[1],4,null,C.goldLt));

      // Symbols
      drawPump(285, 750, 32, t * 1.2);
      const p1 = 0.45 + Math.sin(t * 0.9) * 0.15;
      const p2 = 0.60 + Math.sin(t * 0.7 + 1) * 0.18;
      drawGauge(300, 615, 22, p1);
      drawGauge(680, 615, 22, p2);

      // Tank
      ctx.save();
      ctx.strokeStyle = C.goldLine; ctx.lineWidth = ss(2);
      ctx.fillStyle = "rgba(26,159,212,0.1)";
      ctx.strokeRect(sx(100),sy(710),ss(90),ss(80));
      ctx.fillRect(sx(100),sy(710),ss(90),ss(80));
      ctx.restore();
      text("TANK", 145, 755, C.cyan, 9);

      // Pressure readings
      text(`${(180+Math.sin(t*0.9)*35).toFixed(0)} bar`, 300, 597, C.goldLt, 8);
      text(`${(240+Math.sin(t*0.7+1)*50).toFixed(0)} bar`, 680, 597, p2>0.7?C.red:C.goldLt, 8);
      text(p2 <= 0.78 ? "● SYSTEM OK" : "● OVER-PRESSURE", 700, 780, p2<=0.78?"rgba(40,202,65,0.7)":C.red, 9);

      // Background labels
      text("HP LINE", 420, 602, C.gold, 8);
      text("RETURN", 650, 358, C.muted, 8);
      text("SUCTION", 237, 762, C.cyan, 8);

      // Particles
      particles.forEach(p => {
        p.t = (p.t + p.speed * 0.003) % 1;
        const pos = pathPos(p.pts, p.t);
        p.tail.push([...pos]);
        if (p.tail.length > 6) p.tail.shift();
        if (p.tail.length > 1) {
          for (let i = 1; i < p.tail.length; i++) {
            ctx.save(); ctx.globalAlpha = (i/p.tail.length)*0.35;
            ctx.strokeStyle = p.color; ctx.lineWidth = ss(p.r*0.7); ctx.lineCap="round";
            ctx.beginPath();
            ctx.moveTo(sx(p.tail[i-1][0]),sy(p.tail[i-1][1]));
            ctx.lineTo(sx(p.tail[i][0]),sy(p.tail[i][1]));
            ctx.stroke(); ctx.restore();
          }
        }
        circle(pos[0], pos[1], p.r, null, p.color);
      });

      // Piston animation
      const pist = Math.sin(t * 0.9) * 20;
      ctx.save();
      ctx.strokeStyle = C.goldLt; ctx.lineWidth = ss(3); ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(sx(550),sy(480)); ctx.lineTo(sx(550+pist),sy(480));
      ctx.stroke(); ctx.restore();
      circle(550+pist, 480, 5, C.gold, C.goldLt, 1.5);

      // Watermark
      ctx.save(); ctx.globalAlpha = 0.04;
      ctx.font = `bold ${ss(70)}px 'Orbitron',monospace`;
      ctx.fillStyle = C.gold; ctx.textAlign = "center";
      ctx.fillText("HYDRAULIC", sx(700), sy(460));
      ctx.fillText("SCHEMATIC", sx(700), sy(550));
      ctx.restore();

      ctx.restore();
      t += 0.012;
    }

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{ position:"fixed", top:0, left:0, width:"100%", height:"100%", zIndex:0, pointerEvents:"none" }} />
  );
};

// ── GRID OVERLAY ──
const GridOverlay = () => (
  <div style={{
    position:"fixed", top:0, left:0, width:"100%", height:"100%", zIndex:1, pointerEvents:"none",
    backgroundImage:"linear-gradient(rgba(26,159,212,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(26,159,212,0.04) 1px,transparent 1px)",
    backgroundSize:"60px 60px"
  }} />
);

// ── NAV ──────────────────────────────────────────────────────
const Nav = ({ onFeedback, onLaunch }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior:"smooth" }); };

  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 5%", height:"70px",
      background: scrolled ? "rgba(2,11,24,0.97)" : "rgba(2,11,24,0.85)",
      backdropFilter:"blur(20px)",
      borderBottom:"1px solid rgba(200,146,26,0.25)",
      transition:"background 0.3s"
    }}>
      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:"12px", cursor:"pointer" }} onClick={() => window.scrollTo({top:0,behavior:"smooth"})}>
        <svg viewBox="0 0 40 40" fill="none" width="36" height="36">
          <circle cx="20" cy="20" r="18" stroke="#c8921a" strokeWidth="1.5" opacity="0.5"/>
          <circle cx="20" cy="20" r="12" stroke="#1a9fd4" strokeWidth="1" opacity="0.6"/>
          <path d="M12 20 C12 14 28 14 28 20 C28 26 12 26 12 20Z" fill="none" stroke="#c8921a" strokeWidth="1.5"/>
          <circle cx="20" cy="20" r="3" fill="#f0b429"/>
          <line x1="20" y1="2" x2="20" y2="8" stroke="#1a9fd4" strokeWidth="1.5"/>
          <line x1="20" y1="32" x2="20" y2="38" stroke="#1a9fd4" strokeWidth="1.5"/>
          <line x1="2" y1="20" x2="8" y2="20" stroke="#1a9fd4" strokeWidth="1.5"/>
          <line x1="32" y1="20" x2="38" y2="20" stroke="#1a9fd4" strokeWidth="1.5"/>
        </svg>
        <span style={{ fontFamily:"'Orbitron',monospace", fontSize:"1.15rem", fontWeight:700, letterSpacing:"0.05em" }}>
          Hydro<span style={{ color:"#f0b429" }}>Mind</span> AI
        </span>
      </div>

      {/* Links */}
      <ul className="hide-mobile" style={{ display:"flex", alignItems:"center", gap:"2rem", listStyle:"none" }}>
        {[["modes","How It Works"],["ai-advisor","AI Advisor"],["features","Features"],["calculators","Calculators"],["pricing","Pricing"]].map(([id,label]) => (
          <li key={id}>
            <button onClick={() => scrollTo(id)} style={{
              background:"none", border:"none", cursor:"pointer",
              fontFamily:"'Rajdhani',sans-serif", fontSize:"0.9rem", fontWeight:600,
              letterSpacing:"0.08em", textTransform:"uppercase", color:"#6b8fa8",
              transition:"color 0.3s", padding:0
            }}
              onMouseEnter={e=>e.target.style.color="#f0b429"}
              onMouseLeave={e=>e.target.style.color="#6b8fa8"}
            >{label}</button>
          </li>
        ))}
        <li>
          <button onClick={onLaunch} style={{
            fontFamily:"'Orbitron',monospace", fontSize:"0.72rem", fontWeight:600,
            letterSpacing:"0.1em", textTransform:"uppercase", color:"#020b18",
            background:"linear-gradient(135deg,#c8921a,#f0b429)",
            padding:"8px 20px", borderRadius:"3px", border:"none", cursor:"pointer",
            transition:"all 0.3s", boxShadow:"0 0 20px rgba(200,146,26,0.4)"
          }}
            onMouseEnter={e=>{e.target.style.boxShadow="0 0 35px rgba(200,146,26,0.7)";e.target.style.transform="translateY(-1px)"}}
            onMouseLeave={e=>{e.target.style.boxShadow="0 0 20px rgba(200,146,26,0.4)";e.target.style.transform="none"}}
          >Launch App</button>
        </li>
      </ul>
    </nav>
  );
};

// ── HERO ─────────────────────────────────────────────────────
const Hero = ({ onLaunch }) => {
  const scrollTo = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior:"smooth" }); };
  return (
    <section style={{ position:"relative", zIndex:10, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"70px 5% 0", textAlign:"center" }}>
      <div style={{ maxWidth:"900px" }}>
        <div className="fadeUp-1" style={{ display:"inline-flex", alignItems:"center", gap:"8px", fontFamily:"'Share Tech Mono',monospace", fontSize:"0.72rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"#1a9fd4", border:"1px solid rgba(26,159,212,0.4)", padding:"6px 16px", borderRadius:"2px", marginBottom:"2rem", background:"rgba(26,159,212,0.05)" }}>
          <span className="badge-dot"></span>
          AI-Powered Hydraulic Intelligence Platform
        </div>

        <h1 className="fadeUp-2" style={{ fontFamily:"'Orbitron',monospace", fontSize:"clamp(2.4rem,5.5vw,4.8rem)", fontWeight:900, lineHeight:1.05, marginBottom:"1.5rem" }}>
          <span style={{ color:"#e8f4fd" }}>Hydraulic AI Advisor</span><br/>
          <span style={{ background:"linear-gradient(135deg,#c8921a 0%,#ffd166 50%,#1a9fd4 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Design. Diagnose. Solve.</span>
        </h1>

        <p className="fadeUp-3" style={{ fontSize:"1.15rem", fontWeight:400, color:"#6b8fa8", lineHeight:1.7, maxWidth:"640px", margin:"0 auto 2.5rem" }}>
          Built for <strong style={{color:"#1a9fd4"}}>hydraulic system designers</strong> and <strong style={{color:"#1a9fd4"}}>field troubleshooters</strong>. Ask HydroMind AI to design your complete hydraulic system — or diagnose any fault — using deep OEM knowledge, ISO schematics, and live web search.
        </p>

        <div className="fadeUp-4" style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={() => scrollTo("modes")} style={{ fontFamily:"'Orbitron',monospace", fontSize:"0.78rem", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#020b18", background:"linear-gradient(135deg,#c8921a,#f0b429)", padding:"14px 32px", borderRadius:"3px", border:"none", cursor:"pointer", transition:"all 0.3s", boxShadow:"0 0 30px rgba(200,146,26,0.4)" }}
            onMouseEnter={e=>{e.target.style.transform="translateY(-2px)";e.target.style.boxShadow="0 0 50px rgba(200,146,26,0.7)"}}
            onMouseLeave={e=>{e.target.style.transform="none";e.target.style.boxShadow="0 0 30px rgba(200,146,26,0.4)"}}>
            See How It Works
          </button>
          <button onClick={onLaunch} style={{ fontFamily:"'Orbitron',monospace", fontSize:"0.78rem", fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:"#1a9fd4", background:"transparent", padding:"14px 32px", borderRadius:"3px", border:"1px solid rgba(26,159,212,0.4)", cursor:"pointer", transition:"all 0.3s" }}
            onMouseEnter={e=>{e.target.style.background="rgba(26,159,212,0.1)";e.target.style.borderColor="#1a9fd4";e.target.style.transform="translateY(-2px)"}}
            onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.borderColor="rgba(26,159,212,0.4)";e.target.style.transform="none"}}>
            Launch AI Advisor
          </button>
        </div>

        <div className="fadeUp-5" style={{ display:"flex", justifyContent:"center", gap:"3rem", marginTop:"4rem", paddingTop:"3rem", borderTop:"1px solid rgba(200,146,26,0.15)", flexWrap:"wrap" }}>
          {[["2","Expert AI Modes"],["KB","+ Web Search"],["OEM","Grade Knowledge"],["24/7","AI Availability"]].map(([n,l]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <span style={{ fontFamily:"'Orbitron',monospace", fontSize:"2rem", fontWeight:700, color:"#f0b429", display:"block", lineHeight:1 }}>{n}</span>
              <span style={{ fontSize:"0.78rem", fontWeight:500, letterSpacing:"0.1em", textTransform:"uppercase", color:"#6b8fa8", marginTop:"0.4rem", display:"block" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── HOW IT WORKS ─────────────────────────────────────────────
const HowItWorks = () => {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) e.target.classList.add("visible"); }), {threshold:0.1});
    if (ref.current) ref.current.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="modes" ref={ref} style={{ position:"relative", zIndex:10, background:"linear-gradient(180deg,transparent,rgba(4,20,40,0.7),transparent)" }}>
      <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"100px 5%" }}>
        <div className="reveal" style={{ textAlign:"center", marginBottom:"3rem" }}>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:"0.7rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"#c8921a", marginBottom:"1rem" }}>// HOW HYDROMIND AI WORKS</div>
          <h2 style={{ fontFamily:"'Orbitron',monospace", fontSize:"clamp(1.8rem,3.5vw,2.8rem)", fontWeight:700, lineHeight:1.15 }}>Two Powerful AI Modes.<br/>One Platform.</h2>
        </div>

        <div className="reveal grid-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2rem", marginBottom:"3rem" }}>
          {/* Designer */}
          <div style={{ background:"rgba(4,20,40,0.8)", border:"1px solid rgba(200,146,26,0.4)", borderRadius:"8px", padding:"2.5rem", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, width:"100%", height:"3px", background:"linear-gradient(90deg,#c8921a,#f0b429)" }}/>
            <div style={{ fontSize:"2.5rem", marginBottom:"1rem" }}>🔩</div>
            <div style={{ fontFamily:"'Orbitron',monospace", fontSize:"0.7rem", letterSpacing:"0.15em", color:"#c8921a", marginBottom:"0.5rem" }}>MODE 01</div>
            <h3 style={{ fontFamily:"'Orbitron',monospace", fontSize:"1.2rem", fontWeight:700, color:"#f0b429", marginBottom:"1rem" }}>System Designer</h3>
            <p style={{ fontSize:"0.95rem", color:"#6b8fa8", lineHeight:1.7, marginBottom:"1.5rem" }}>Enter your system parameters — load, pressure, flow, speed — and HydroMind AI designs your complete hydraulic circuit with preferred make selection.</p>
            <div style={{ borderTop:"1px solid rgba(200,146,26,0.15)", paddingTop:"1.2rem" }}>
              <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:"0.72rem", color:"#c8921a", marginBottom:"0.8rem" }}>AI SELECTS FOR
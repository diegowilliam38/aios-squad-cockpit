import React, { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────
   PIXEL-AGENTS AUTHENTIC SPRITES
   Format: RPG Maker standard spritesheet
   Each char_X.png has 4 rows × 3 columns of frames (walk cycle)
   Row 0: walk down, Row 1: walk left, Row 2: walk right, Row 3: walk up
   We use row 0 (facing camera), frame 1 (center = standing)
   Sheet: approximately 144×192px → each frame: 48×64px
────────────────────────────────────────────────────────────── */

// Spritesheet constants (RPG Maker standard for these char sheets)
const FRAME_COLS = 3;    // 3 walk frames per direction
const FRAME_ROWS = 4;    // 4 directions
const STANDING_FRAME = 1; // center frame of row 0 (facing down = towards camera)
const FACING_ROW = 0;    // row 0 = facing down (towards viewer)

// Display scale — we render each sprite at this size
const SPRITE_W = 48;
const SPRITE_H = 64;

// The sprite images are fetched from the pixel-agents repo assets
// char_0..5 available — we map 12 agents to these 6 sprites (each used twice)
const CHAR_FILES = ["char_0","char_1","char_2","char_3","char_4","char_5"];

/* Build CSS background-position to extract a single frame */
function getSpriteStyle(charFile, animate = false) {
  // We'll use CSS animation steps to walk through frames when active
  // For idle: show center frame (col 1) of row 0
  const bgX = -(STANDING_FRAME * SPRITE_W);
  const bgY = -(FACING_ROW * SPRITE_H);

  return {
    width: SPRITE_W,
    height: SPRITE_H,
    backgroundImage: `url('/${charFile}.png')`,
    backgroundPosition: `${bgX}px ${bgY}px`,
    backgroundRepeat: "no-repeat",
    imageRendering: "pixelated",
    // KEY: multiply blend mode turns WHITE background transparent on any surface
    mixBlendMode: "multiply",
    transform: "scale(2.2)",
    transformOrigin: "bottom center",
  };
}

/* Build walk animation style (cycles through 3 frames of row 0) */
function getWalkStyle(charFile) {
  const bgY = -(FACING_ROW * SPRITE_H);
  return {
    width: SPRITE_W,
    height: SPRITE_H,
    backgroundImage: `url('/${charFile}.png')`,
    backgroundPositionY: `${bgY}px`,
    backgroundRepeat: "no-repeat",
    imageRendering: "pixelated",
    mixBlendMode: "multiply",
    transform: "scale(2.2)",
    transformOrigin: "bottom center",
    // CSS animation that cycles through 3 horizontal frames
    animation: "sprite-walk 0.4s steps(3, start) infinite",
    backgroundSize: "auto",
    // Start from frame 0 of that row
    backgroundPositionX: "0px",
  };
}

/* ─────────────────────────────────────────────────────────────
   AGENT DEFINITIONS
   charFile: one of char_0..5 (rotated through 6 sprites)
   pos: x/y percentages on office background
────────────────────────────────────────────────────────────── */
const AGENTS = [
  {
    id: "analyst",        name: "Analyst",     label: "@analyst",  role: "Business & ROI",
    pos: { x: 14, y: 28 }, charFile: "char_0", color: "#f77f00",
    bubbles: ["🔍 Analisando ROI...", "📊 Mapeando dores...", "💡 Insights!"],
    dialogTexts: ["Iniciando análise de ROI do projeto...", "Mapeando dores do usuário...", "Relatório de viabilidade concluído!"],
  },
  {
    id: "pm",             name: "PM",          label: "@pm",       role: "Backlog & PRD",
    pos: { x: 27, y: 28 }, charFile: "char_1", color: "#fee440",
    bubbles: ["📝 PRD...", "✏️ Escrevendo...", "✅ Story!"],
    dialogTexts: ["Refinando backlog com base na análise...", "Escrevendo o PRD do produto...", "Backlog priorizado e documentado!"],
  },
  {
    id: "sm",             name: "Scrum",       label: "@sm",       role: "Sprints & Stories",
    pos: { x: 41, y: 28 }, charFile: "char_2", color: "#00bbf9",
    bubbles: ["📋 Sprint...", "🗓️ Stories...", "✅ Planejado!"],
    dialogTexts: ["Quebrando PRD em stories atômicas...", "Estimando pontos do sprint...", "Sprint configurada no projeto!"],
  },
  {
    id: "architect",      name: "Architect",   label: "@arch",     role: "Tech Design",
    pos: { x: 56, y: 28 }, charFile: "char_3", color: "#9b5de5",
    bubbles: ["📐 Arquitetura...", "🗺️ Mermaid...", "✅ ADR!"],
    dialogTexts: ["Propondo topologia técnica e padrões...", "Gerando diagrama C4 + Mermaid...", "ADR rascunhado para revisão!"],
  },
  {
    id: "ux-design-expert", name: "UX Expert", label: "@ux",      role: "Design System",
    pos: { x: 70, y: 28 }, charFile: "char_4", color: "#ff0055",
    bubbles: ["🎨 Design...", "🖌️ Wireframe...", "✅ Tokens!"],
    dialogTexts: ["Definindo tokens de design para o produto...", "Criando wireframes das telas principais...", "Design system e componentes entregues!"],
  },
  {
    id: "dev",            name: "Developer",   label: "@dev",      role: "Core Code",
    pos: { x: 14, y: 58 }, charFile: "char_5", color: "#00ff66",
    bubbles: ["💻 Codando...", "⌨️ Feature...", "✅ Build!"],
    dialogTexts: ["Executando subtask de implementação...", "Escrevendo código seguindo a spec...", "Feature implementada. Build verde!"],
  },
  {
    id: "prompt-engineer", name: "Prompt Eng.", label: "@prompt", role: "AI Guard",
    pos: { x: 26, y: 58 }, charFile: "char_0", color: "#00f5d4",
    bubbles: ["🛡️ Prompts...", "🤖 Testing LLM...", "✅ Validado!"],
    dialogTexts: ["Revisando prompts LangGraph e RAG...", "Testando resistência a injection...", "Prompts calibrados e documentados!"],
  },
  {
    id: "security-auditor", name: "SecAudit",  label: "@sec",     role: "Security",
    pos: { x: 38, y: 58 }, charFile: "char_1", color: "#d62828",
    bubbles: ["🔐 Auditando...", "🔎 CVEs...", "✅ Zero críticos!"],
    dialogTexts: ["Iniciando auditoria de segurança do código...", "Rodando Snyk scan e checando CVEs...", "Auditoria concluída. Zero itens críticos!"],
  },
  {
    id: "lint-and-validate", name: "Linter",   label: "@lint",    role: "Style & Lint",
    pos: { x: 50, y: 58 }, charFile: "char_2", color: "#94a3b8",
    bubbles: ["🧹 Lint...", "✍️ Padrões...", "✅ Zero erros!"],
    dialogTexts: ["Executando ESLint e checagens de padrão...", "Corrigindo formatação e consistência...", "Código padronizado. Zero erros de lint!"],
  },
  {
    id: "doc-coauthoring", name: "DocWriter",  label: "@doc",     role: "Documentation",
    pos: { x: 61, y: 58 }, charFile: "char_3", color: "#a2d2ff",
    bubbles: ["📚 Docs...", "✏️ ADR...", "✅ Publicado!"],
    dialogTexts: ["Documentando enquanto o contexto está vivo...", "Gerando ADR da decisão arquitetural...", "Documentação estruturada e commitada!"],
  },
  {
    id: "qa",             name: "QA Tester",   label: "@qa",      role: "Tests E2E",
    pos: { x: 71, y: 58 }, charFile: "char_4", color: "#e2e8f0",
    bubbles: ["🧪 Testing...", "🐛 Bug found!", "✅ Spec ok!"],
    dialogTexts: ["Revisando spec vs implementação...", "Rodando testes unitários e E2E...", "Build aprovado. Spec 100% coberta!"],
  },
  {
    id: "devops",         name: "DevOps",      label: "@devops",  role: "CI/CD & Push",
    pos: { x: 82, y: 58 }, charFile: "char_5", color: "#ffb703",
    bubbles: ["🚀 Deploying...", "⚙️ CI/CD...", "✅ Push!"],
    dialogTexts: ["Configurando pipeline de CI/CD...", "Executando git push para produção...", "Deploy concluído com sucesso! 🎉"],
  },
];

/* ─── AGENT SPRITE ON MAP ────────────────────────────────── */
function AgentOnMap({ agent, isActive, onClick }) {
  const spriteStyle = isActive ? getWalkStyle(agent.charFile) : getSpriteStyle(agent.charFile);

  // Cycle through bubbles while active
  const bubbleIdx = isActive ? Math.floor(Date.now() / 2500) % agent.bubbles.length : 0;

  return (
    <div
      className="agent-on-map"
      style={{ left: `${agent.pos.x}%`, top: `${agent.pos.y}%` }}
      onClick={() => onClick(agent.id)}
      title={`${agent.name} — ${agent.role}`}
    >
      {/* Ellipse shadow under sprite for depth */}
      <div className="sprite-shadow" />

      <div className="sprite-wrap">
        {/* Selection glow when active */}
        {isActive && <div className="sprite-glow" style={{ boxShadow: `0 0 18px 6px ${agent.color}55` }} />}

        {/* Speech bubble */}
        {isActive && (
          <div className="speech-bubble">{agent.bubbles[bubbleIdx]}</div>
        )}

        {/* The actual sprite — multiply blend removes white background */}
        <div style={spriteStyle} />
      </div>

      {/* Name tag */}
      <div className={`agent-tag ${isActive ? "tag-active" : ""}`}
           style={{ borderColor: isActive ? agent.color : "transparent", color: isActive ? agent.color : "rgba(255,255,255,0.7)" }}>
        {agent.label}
      </div>
    </div>
  );
}

/* ─── KANBAN CARD ────────────────────────────────────────── */
function KanbanCard({ task, status }) {
  return (
    <div className={`kanban-card ${status === "doing" ? "card-doing" : status === "done" ? "card-done" : ""}`}>
      <div style={{ fontSize: "0.72rem", textDecoration: status === "done" ? "line-through" : "none", color: status === "done" ? "#475569" : "#e2e8f0" }}>
        {task.text}
      </div>
      <div className="card-agent">@{task.agent}</div>
    </div>
  );
}

/* ─── APP ROOT ───────────────────────────────────────────── */
export default function App() {
  const [projects, setProjects]         = useState([]);
  const [selected, setSelected]         = useState("");
  const [projectStatus, setStatus]      = useState(null);
  const [tasks, setTasks]               = useState([]);
  const [activeAgent, setActiveAgent]   = useState(null);
  const [dialogAgent, setDialogAgent]   = useState(null);
  const [dialogLine, setDialogLine]     = useState(0);

  const [simActive, setSimActive]       = useState(false);
  const [simStep, setSimStep]           = useState(-1);
  const [simSteps, setSimSteps]         = useState([]);
  const [logs, setLogs] = useState([
    "▶ AIOS Squad Cockpit inicializado.",
    "▶ Selecione um projeto ou pressione SIMULAR.",
  ]);

  const logRef = useRef(null);
  const addLog = useCallback((msg) => setLogs(p => p[p.length-1]===msg ? p : [...p, msg]), []);

  /* Load projects */
  useEffect(() => {
    fetch("http://localhost:8124/api/projects")
      .then(r => r.json())
      .then(d => { setProjects(d); if(d[0]) setSelected(d[0]); })
      .catch(() => addLog("❌ Backend offline. Porta 8124 não encontrada."));
  }, [addLog]);

  /* Load project data */
  const loadData = useCallback((proj) => {
    if (!proj) return;
    fetch(`http://localhost:8124/api/projects/${proj}/status`).then(r=>r.json()).then(setStatus).catch(()=>{});
    fetch(`http://localhost:8124/api/projects/${proj}/tasks`).then(r=>r.json()).then(data => {
      setTasks(data);
      if (!simActive) {
        const doing = data.find(t=>t.status==="doing");
        if (doing) { setActiveAgent(doing.agent); const ag=AGENTS.find(a=>a.id===doing.agent); if(ag){setDialogAgent(ag); setDialogLine(0);} addLog(`⚙️ @${doing.agent} → "${doing.text}"`); }
        else { setActiveAgent(null); setDialogAgent(null); }
      }
    }).catch(()=>{});
  }, [simActive, addLog]);

  useEffect(() => {
    loadData(selected);
    if (simActive) return;
    const iv = setInterval(() => loadData(selected), 5000);
    return () => clearInterval(iv);
  }, [selected, simActive, loadData]);

  useEffect(() => {
    fetch("http://localhost:8124/api/simulation/steps").then(r=>r.json()).then(setSimSteps).catch(()=>{});
  }, []);

  useEffect(() => { logRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  /* Simulation */
  useEffect(() => {
    if (!simActive || simStep < 0 || simStep >= simSteps.length) {
      if (simActive && simStep >= simSteps.length) { setSimActive(false); setActiveAgent(null); setDialogAgent(null); addLog("🎉 CICLO COMPLETO!"); }
      return;
    }
    const step = simSteps[simStep];
    setActiveAgent(step.agent);
    const ag = AGENTS.find(a => a.id === step.agent);
    if (ag) { setDialogAgent(ag); setDialogLine(0); }
    addLog(step.log);
    setTasks(p => p.map(t => t.agent===step.agent ? {...t,status:"doing"} : t));

    let li = 0;
    const lineIv = setInterval(() => { li=(li+1)%(ag?.dialogTexts?.length||1); setDialogLine(li); }, 1200);
    const t = setTimeout(() => { clearInterval(lineIv); setTasks(p => p.map(t => t.agent===step.agent ? {...t,status:"done"} : t)); setSimStep(s=>s+1); }, step.duration);
    return () => { clearTimeout(t); clearInterval(lineIv); };
  }, [simActive, simStep, simSteps, addLog]);

  const startSim = () => {
    if (!simSteps.length) return;
    setSimActive(true); setSimStep(0);
    setTasks(p => p.map(t => ({...t,status:"todo"})));
    setLogs(["🚀 SIMULAÇÃO INICIADA", "🏢 Agentes tomaram seus postos..."]);
  };
  const stopSim = () => {
    setSimActive(false); setSimStep(-1); setActiveAgent(null); setDialogAgent(null);
    loadData(selected); addLog("⏹ Simulação encerrada.");
  };

  const handleClick = (id) => {
    if (simActive) return;
    const ag = AGENTS.find(a => a.id === id);
    if (!ag) return;
    setDialogAgent(ag); setDialogLine(0);
    addLog(`👆 Inspecionando: ${ag.name} [${ag.role}]`);
  };

  const todoTasks  = tasks.filter(t => t.status === "todo");
  const doingTasks = tasks.filter(t => t.status === "doing");
  const doneTasks  = tasks.filter(t => t.status === "done");

  const logColor = l =>
    l.includes("❌") ? "#ff0055" : l.includes("🎉") ? "#00ff66" :
    l.includes("🚀") ? "#ffb703" : l.includes("💻") ? "#00f5d4" :
    l.includes("⏹")  ? "#fee440" : "#e2e8f0";

  // Build the sprite style for dialog face
  const dialogFaceStyle = dialogAgent ? { ...getSpriteStyle(dialogAgent.charFile), transform: "scale(2)", mixBlendMode: "normal", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" } : {};

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden", background:"#030610" }}>

      {/* HEADER */}
      <header style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 20px", background:"rgba(3,6,16,0.97)", borderBottom:"2px solid #1a2240", flexShrink:0, zIndex:10 }}>
        <div>
          <div style={{ fontFamily:"'Press Start 2P',monospace", fontSize:"0.95rem", color:"#fff", textShadow:"0 0 10px #00bbf9", letterSpacing:"1px" }}>
            🏢 AIOS SQUAD COCKPIT
          </div>
          <div style={{ fontFamily:"'VT323',monospace", fontSize:"0.85rem", color:"#64748b", letterSpacing:"1px" }}>
            12-AGENT PIXEL OFFICE SIMULATOR
          </div>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          {projectStatus && <>
            <Chip color="#00f5d4">FASE: {projectStatus.phase?.toUpperCase()}</Chip>
            <Chip color="#00bbf9">STATUS: {projectStatus.status?.toUpperCase()}</Chip>
          </>}
          <Chip color={simActive ? "#00ff66" : "#475569"}>{simActive ? "● SIMULANDO" : "○ LIVE"}</Chip>
        </div>
      </header>

      {/* MAIN */}
      <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 265px", overflow:"hidden" }}>

        {/* LEFT — Game + Dialog */}
        <div style={{ display:"flex", flexDirection:"column", overflow:"hidden", borderRight:"2px solid #1a2240" }}>

          {/* OFFICE MAP */}
          <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
            {/* Background */}
            <img src="/office_bg.png" alt="office" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"top center", imageRendering:"pixelated", filter:"brightness(0.9) saturate(1.1)" }} />

            {/* Scanlines */}
            <div style={{ position:"absolute", inset:0, background:"repeating-linear-gradient(0deg,transparent 0,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)", pointerEvents:"none", zIndex:5 }} />

            {/* AGENTS */}
            {AGENTS.map(ag => (
              <AgentOnMap key={ag.id} agent={ag} isActive={activeAgent===ag.id} onClick={handleClick} />
            ))}
          </div>

          {/* RPG DIALOG BOX */}
          <div style={{ flexShrink:0, background:"rgba(5,8,22,0.97)", borderTop:"3px solid #2a3560", padding:"10px 16px", display:"flex", alignItems:"center", gap:16, minHeight:76, position:"relative" }}>
            <div style={{ position:"absolute", inset:3, border:"1px solid rgba(255,255,255,0.05)", pointerEvents:"none" }} />
            {dialogAgent ? (
              <>
                {/* Sprite face — use normal blend so white bg doesn't show against dark panel */}
                <div style={dialogFaceStyle} />
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'VT323',monospace", fontSize:"1rem", color: dialogAgent.color, marginBottom:2 }}>
                    {dialogAgent.name}
                    <span style={{ color:"#475569", fontSize:"0.75rem", marginLeft:10 }}>[{dialogAgent.role}]</span>
                  </div>
                  <div style={{ fontFamily:"'VT323',monospace", fontSize:"1.1rem", color:"#fff" }}>
                    "{dialogAgent.dialogTexts[dialogLine]}"
                    {activeAgent === dialogAgent.id && <span style={{ display:"inline-block", width:10, height:14, background:"#00f5d4", marginLeft:3, verticalAlign:"middle", animation:"blink 0.7s step-end infinite" }} />}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ fontFamily:"'VT323',monospace", fontSize:"1.05rem", color:"#475569" }}>
                Clique em um agente para inspecionar ou pressione SIMULAR WORKFLOW...
                <span style={{ display:"inline-block", width:10, height:14, background:"#475569", marginLeft:3, verticalAlign:"middle", animation:"blink 0.7s step-end infinite" }} />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ display:"flex", flexDirection:"column", background:"rgba(8,12,30,0.95)", overflow:"hidden" }}>

          {/* KANBAN */}
          <div style={{ flex:1, padding:"12px 10px", overflow:"hidden", display:"flex", flexDirection:"column", gap:8 }}>
            <div style={{ fontFamily:"'VT323',monospace", fontSize:"1.2rem", color:"#00bbf9", letterSpacing:1 }}>📋 SPRINT KANBAN</div>

            <KanbanCol title="A FAZER" count={todoTasks.length} color="#475569">
              {todoTasks.map(t => <KanbanCard key={t.id} task={t} status="todo" />)}
              {!todoTasks.length && <EmptyMsg>— vazio —</EmptyMsg>}
            </KanbanCol>

            <KanbanCol title="EM PROGRESSO" count={doingTasks.length} color="#00bbf9" glow>
              {doingTasks.map(t => <KanbanCard key={t.id} task={t} status="doing" />)}
              {!doingTasks.length && <EmptyMsg color="#00bbf9">— aguardando —</EmptyMsg>}
            </KanbanCol>

            <KanbanCol title="CONCLUÍDO" count={doneTasks.length} color="#00ff66">
              {doneTasks.map(t => <KanbanCard key={t.id} task={t} status="done" />)}
              {!doneTasks.length && <EmptyMsg color="#00ff66">— nenhuma ainda —</EmptyMsg>}
            </KanbanCol>
          </div>

          {/* TERMINAL */}
          <div style={{ flexShrink:0, background:"#010408", borderTop:"2px solid #1a2240", padding:"8px 10px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", inset:0, background:"repeating-linear-gradient(0deg,transparent 0,transparent 2px,rgba(0,0,0,0.1) 2px,rgba(0,0,0,0.1) 4px)", pointerEvents:"none", zIndex:1 }} />
            <div style={{ fontFamily:"'VT323',monospace", fontSize:"0.85rem", color:"#00ff66", borderBottom:"1px solid #1a2240", paddingBottom:4, marginBottom:6, display:"flex", justifyContent:"space-between", zIndex:2, position:"relative" }}>
              <span>🖥 TELEMETRY LOG</span>
              <span style={{ color:"#475569" }}>[{simActive?"SIMULATING":"LIVE"}]</span>
            </div>
            <div style={{ height:110, overflowY:"auto", display:"flex", flexDirection:"column", gap:2, position:"relative", zIndex:2 }}>
              {logs.map((log,i) => <div key={i} style={{ fontFamily:"'VT323',monospace", fontSize:"0.88rem", color:logColor(log) }}>{log}</div>)}
              <div ref={logRef} />
            </div>
          </div>

          {/* CONTROLS */}
          <div style={{ flexShrink:0, padding:"10px", borderTop:"2px solid #1a2240", display:"flex", flexDirection:"column", gap:8 }}>
            <div>
              <div style={{ fontFamily:"'VT323',monospace", fontSize:"0.7rem", color:"#475569", marginBottom:3 }}>PROJETO ATIVO</div>
              <select value={selected} onChange={e=>setSelected(e.target.value)} disabled={simActive}
                style={{ width:"100%", background:"#030610", color:"#fff", border:"2px solid #2a3560", padding:"5px 8px", fontFamily:"'VT323',monospace", fontSize:"0.9rem", outline:"none" }}>
                {projects.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            {!simActive
              ? <button id="btn-simulate" onClick={startSim} style={{ width:"100%", fontFamily:"'VT323',monospace", fontSize:"1.2rem", padding:"9px", border:"none", cursor:"pointer", background:"#00bbf9", color:"#000", boxShadow:"0 0 12px rgba(0,187,249,0.4)", letterSpacing:1 }}>▶ SIMULAR WORKFLOW</button>
              : <button id="btn-stop"     onClick={stopSim}  style={{ width:"100%", fontFamily:"'VT323',monospace", fontSize:"1.2rem", padding:"9px", border:"none", cursor:"pointer", background:"#ff0055", color:"#fff", boxShadow:"0 0 12px rgba(255,0,85,0.4)", letterSpacing:1 }}>⏹ PARAR SIMULAÇÃO</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SMALL HELPER COMPONENTS ────────────────────────────── */
function Chip({ color, children }) {
  return (
    <span style={{ fontFamily:"'VT323',monospace", fontSize:"0.8rem", padding:"2px 9px", color, border:`1px solid ${color}44`, background:`${color}11` }}>
      {children}
    </span>
  );
}

function KanbanCol({ title, count, color, glow, children }) {
  return (
    <div style={{ padding:"7px 7px", background: glow ? `rgba(0,187,249,0.04)` : "rgba(5,8,20,0.5)", border: glow ? "1px solid rgba(0,187,249,0.15)" : "none", flex: 1, overflow: "hidden", display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"'VT323',monospace", fontSize:"0.85rem", color, marginBottom:4 }}>
        <span>{title}</span>
        <span style={{ padding:"0 6px", border:`1px solid ${color}44`, background:`${color}11` }}>{count}</span>
      </div>
      <div style={{ overflowY:"auto", flex:1, display:"flex", flexDirection:"column", gap:4 }}>
        {children}
      </div>
    </div>
  );
}

function EmptyMsg({ color = "#475569", children }) {
  return <div style={{ fontFamily:"'VT323',monospace", fontSize:"0.8rem", color, textAlign:"center", padding:"5px" }}>{children}</div>;
}

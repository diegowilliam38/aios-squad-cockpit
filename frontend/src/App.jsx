import React, { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────
   AGENT DEFINITIONS
   pos: {x, y} = percentage position on the office map image
   spriteRow: which sprite sheet (1 or 2)
   spriteCol: column index in that sheet (0-based, 0..6)
───────────────────────────────────────────────────────────── */
const AGENTS = [
  {
    id: "analyst", name: "Analyst", label: "@analyst", role: "Business & ROI",
    pos: { x: 19, y: 33 }, spriteRow: 1, spriteCol: 0,
    color: "#f77f00",
    bubbles: ["🔍 Analisando ROI...", "📊 Calculando viabilidade...", "💡 Insights gerados!"],
    dialogTexts: ["Iniciando análise de ROI do projeto...", "Mapeando dores do usuário...", "Relatório de viabilidade concluído!"],
  },
  {
    id: "pm", name: "PM", label: "@pm", role: "Backlog & PRD",
    pos: { x: 35, y: 33 }, spriteRow: 1, spriteCol: 1,
    color: "#fee440",
    bubbles: ["📝 Priorizando backlog...", "✏️ Escrevendo PRD...", "✅ Story criada!"],
    dialogTexts: ["Refinando backlog com base na análise...", "Escrevendo o PRD do produto...", "Backlog priorizado e documentado!"],
  },
  {
    id: "sm", name: "Scrum", label: "@sm", role: "Sprints & Stories",
    pos: { x: 52, y: 33 }, spriteRow: 1, spriteCol: 2,
    color: "#00bbf9",
    bubbles: ["📋 Criando sprint...", "🗓️ Definindo stories...", "✅ Sprint planejada!"],
    dialogTexts: ["Quebrando PRD em stories atômicas...", "Estimando pontos do sprint...", "Sprint configurada no projeto!"],
  },
  {
    id: "architect", name: "Architect", label: "@arch", role: "Tech Design",
    pos: { x: 69, y: 33 }, spriteRow: 1, spriteCol: 3,
    color: "#9b5de5",
    bubbles: ["📐 Desenhando arquitetura...", "🗺️ Diagrama Mermaid...", "✅ ADR criado!"],
    dialogTexts: ["Propondo topologia técnica e padrões...", "Gerando diagrama C4 + Mermaid...", "ADR rascunhado para revisão do Tech Lead!"],
  },
  {
    id: "ux-design-expert", name: "UX Expert", label: "@ux", role: "Design System",
    pos: { x: 83, y: 33 }, spriteRow: 1, spriteCol: 4,
    color: "#ff0055",
    bubbles: ["🎨 Criando design system...", "🖌️ Wireframing...", "✅ Componentes prontos!"],
    dialogTexts: ["Definindo tokens de design para o produto...", "Criando wireframes das telas principais...", "Design system e componentes entregues!"],
  },
  {
    id: "dev", name: "Developer", label: "@dev", role: "Core Code",
    pos: { x: 19, y: 63 }, spriteRow: 1, spriteCol: 5,
    color: "#00ff66",
    bubbles: ["💻 Codando...", "⌨️ Implementando feature...", "✅ Build passando!"],
    dialogTexts: ["Executando subtask de implementação...", "Escrevendo código seguindo a spec...", "Feature implementada. Build verde!"],
  },
  {
    id: "prompt-engineer", name: "Prompt Eng.", label: "@prompt", role: "AI Guard",
    pos: { x: 33, y: 63 }, spriteRow: 2, spriteCol: 0,
    color: "#00f5d4",
    bubbles: ["🛡️ Revisando prompts...", "🤖 Testando LLM...", "✅ Prompts validados!"],
    dialogTexts: ["Revisando prompts LangGraph e RAG...", "Testando resistência a injection...", "Prompts calibrados e documentados!"],
  },
  {
    id: "security-auditor", name: "SecAudit", label: "@sec", role: "Security",
    pos: { x: 47, y: 63 }, spriteRow: 2, spriteCol: 1,
    color: "#d62828",
    bubbles: ["🔐 Auditando código...", "🔎 Escaneando CVEs...", "✅ Zero críticos!"],
    dialogTexts: ["Iniciando auditoria de segurança do código...", "Rodando Snyk scan e checando CVEs...", "Auditoria concluída. Zero itens críticos!"],
  },
  {
    id: "lint-and-validate", name: "Linter", label: "@lint", role: "Style & Lint",
    pos: { x: 58, y: 63 }, spriteRow: 2, spriteCol: 2,
    color: "#94a3b8",
    bubbles: ["🧹 Lintando código...", "✍️ Padronizando estilo...", "✅ Zero erros!"],
    dialogTexts: ["Executando ESLint e checagens de padrão...", "Corrigindo formatação e consistência...", "Código padronizado. Zero erros de lint!"],
  },
  {
    id: "doc-coauthoring", name: "DocWriter", label: "@doc", role: "Documentation",
    pos: { x: 68, y: 63 }, spriteRow: 2, spriteCol: 3,
    color: "#a2d2ff",
    bubbles: ["📚 Documentando...", "✏️ Escrevendo ADR...", "✅ Docs gerados!"],
    dialogTexts: ["Documentando enquanto o contexto está vivo...", "Gerando ADR da decisão arquitetural...", "Documentação estruturada e commitada!"],
  },
  {
    id: "qa", name: "QA Tester", label: "@qa", role: "Tests E2E",
    pos: { x: 76, y: 63 }, spriteRow: 2, spriteCol: 4,
    color: "#e2e8f0",
    bubbles: ["🧪 Testando...", "🐛 Bug found!", "✅ Spec aprovada!"],
    dialogTexts: ["Revisando spec vs implementação...", "Rodando testes unitários e E2E...", "Build aprovado. Spec 100% coberta!"],
  },
  {
    id: "devops", name: "DevOps", label: "@devops", role: "CI/CD & Push",
    pos: { x: 85, y: 63 }, spriteRow: 2, spriteCol: 5,
    color: "#ffb703",
    bubbles: ["🚀 Deploying...", "⚙️ CI/CD rodando...", "✅ Push feito!"],
    dialogTexts: ["Configurando pipeline de CI/CD...", "Executando git push para produção...", "Deploy concluído com sucesso! 🎉"],
  },
];

/* Sprite sheet layout:
   Each sheet (row1, row2) has 6 characters in the top half + 6 repeated in bottom
   We use only the top half (row 1 of each sheet).
   Sheet: 1024x1024, 6 chars per row → cellW = 1024/6 ≈ 170px, cellH = 512px
*/
const SHEET_COLS  = 6;
const SHEET_W     = 1024;
const SHEET_H     = 1024;
const CELL_W      = SHEET_W / SHEET_COLS;    // ~170px per character
const CELL_H      = SHEET_H / 2;             // 512px (use top half only)

// Display size — small & authentic, like VS Code pixel agents
const SPRITE_W = 40;
const SPRITE_H = 52;

/* Calculate cropping for a specific character */
function getSpriteStyle(spriteRow, spriteCol) {
  const scaleX = SPRITE_W / CELL_W;
  const scaleY = SPRITE_H / CELL_H;

  const bgX = -(spriteCol * CELL_W * scaleX);
  const bgY = 0; // always use top half of each sheet

  return {
    width:  SPRITE_W,
    height: SPRITE_H,
    backgroundImage: `url('/sprites_row${spriteRow}.png')`,
    backgroundSize: `${SHEET_W * scaleX}px ${SHEET_H * scaleY}px`,
    backgroundPosition: `${bgX}px ${bgY}px`,
    backgroundRepeat: "no-repeat",
    imageRendering: "pixelated",
    // KEY: removes the black background from the sprite sheet
    mixBlendMode: "screen",
    filter: "contrast(1.1) brightness(1.05)",
  };
}

/* ─── AGENT ON MAP ────────────────────────────────────────── */
function AgentOnMap({ agent, isActive, onClick }) {
  const stateClass = isActive ? "state-active" : "state-idle";
  const spriteStyle = getSpriteStyle(agent.spriteRow, agent.spriteCol);

  return (
    <div
      className="agent-on-map"
      style={{ left: `${agent.pos.x}%`, top: `${agent.pos.y}%` }}
      onClick={() => onClick(agent.id)}
    >
      <div className="agent-sprite-wrap">
        {isActive && <div className="agent-ring" />}
        {isActive && (
          <div className="speech-bubble">
            {agent.bubbles[Math.floor(Date.now() / 3000) % agent.bubbles.length]}
          </div>
        )}
        <div className={`${stateClass}`} style={spriteStyle} />
      </div>
      <div className={`agent-name-tag ${isActive ? "active-tag" : ""}`}>
        {agent.name}
      </div>
    </div>
  );
}

/* ─── KANBAN CARD ─────────────────────────────────────────── */
function KanbanCard({ task, status }) {
  const cls = status === "doing" ? "card-doing" : status === "done" ? "card-done" : "";
  return (
    <div className={`kanban-card ${cls}`}>
      <div style={{
        textDecoration: status === "done" ? "line-through" : "none",
        color: status === "done" ? "var(--muted)" : "var(--text)",
        fontSize: "0.73rem"
      }}>{task.text}</div>
      <div className="kanban-card-agent">@{task.agent}</div>
    </div>
  );
}

/* ─── APP ─────────────────────────────────────────────────── */
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

  const consoleRef = useRef(null);

  const addLog = useCallback((msg) => {
    setLogs(prev => prev[prev.length - 1] === msg ? prev : [...prev, msg]);
  }, []);

  /* Load projects */
  useEffect(() => {
    fetch("http://localhost:8124/api/projects")
      .then(r => r.json())
      .then(data => { setProjects(data); if (data[0]) setSelected(data[0]); })
      .catch(() => addLog("❌ Backend offline. Porta 8124 não encontrada."));
  }, [addLog]);

  /* Load project data */
  const loadData = useCallback((proj) => {
    if (!proj) return;
    fetch(`http://localhost:8124/api/projects/${proj}/status`)
      .then(r => r.json()).then(setStatus).catch(() => {});
    fetch(`http://localhost:8124/api/projects/${proj}/tasks`)
      .then(r => r.json())
      .then(data => {
        setTasks(data);
        if (!simActive) {
          const doing = data.find(t => t.status === "doing");
          if (doing) {
            setActiveAgent(doing.agent);
            const ag = AGENTS.find(a => a.id === doing.agent);
            if (ag) { setDialogAgent(ag); setDialogLine(0); }
            addLog(`⚙️ LIVE: @${doing.agent} → "${doing.text}"`);
          } else {
            setActiveAgent(null);
            setDialogAgent(null);
          }
        }
      }).catch(() => {});
  }, [simActive, addLog]);

  useEffect(() => {
    loadData(selected);
    if (simActive) return;
    const iv = setInterval(() => loadData(selected), 5000);
    return () => clearInterval(iv);
  }, [selected, simActive, loadData]);

  /* Load sim steps */
  useEffect(() => {
    fetch("http://localhost:8124/api/simulation/steps")
      .then(r => r.json()).then(setSimSteps).catch(() => {});
  }, []);

  /* Auto-scroll log */
  useEffect(() => { consoleRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  /* Simulation loop */
  useEffect(() => {
    if (!simActive || simStep < 0 || simStep >= simSteps.length) {
      if (simActive && simStep >= simSteps.length) {
        setSimActive(false); setActiveAgent(null); setDialogAgent(null);
        addLog("🎉 CICLO COMPLETO! Todos os agentes concluíram suas tarefas.");
      }
      return;
    }
    const step = simSteps[simStep];
    setActiveAgent(step.agent);
    const ag = AGENTS.find(a => a.id === step.agent);
    if (ag) { setDialogAgent(ag); setDialogLine(0); }
    addLog(step.log);
    setTasks(prev => prev.map(t => t.agent === step.agent ? { ...t, status: "doing" } : t));

    // Cycle through dialog lines
    let lineIdx = 0;
    const lineIv = setInterval(() => {
      lineIdx = (lineIdx + 1) % (ag?.dialogTexts?.length || 1);
      setDialogLine(lineIdx);
    }, 1200);

    const t = setTimeout(() => {
      clearInterval(lineIv);
      setTasks(prev => prev.map(t => t.agent === step.agent ? { ...t, status: "done" } : t));
      setSimStep(s => s + 1);
    }, step.duration);
    return () => { clearTimeout(t); clearInterval(lineIv); };
  }, [simActive, simStep, simSteps, addLog]);

  const startSim = () => {
    if (!simSteps.length) return;
    setSimActive(true); setSimStep(0);
    setTasks(prev => prev.map(t => ({ ...t, status: "todo" })));
    setLogs(["🚀 SIMULAÇÃO INICIADA", "🏢 Todos os agentes tomaram seus postos..."]);
  };
  const stopSim = () => {
    setSimActive(false); setSimStep(-1); setActiveAgent(null); setDialogAgent(null);
    loadData(selected);
    addLog("⏹ Simulação encerrada. Retornando ao monitoramento em tempo real.");
  };

  /* Click agent to inspect */
  const handleAgentClick = (agentId) => {
    const ag = AGENTS.find(a => a.id === agentId);
    if (!ag || simActive) return;
    setDialogAgent(ag);
    setDialogLine(0);
    addLog(`👆 Inspecionando: ${ag.name} — ${ag.role}`);
  };

  // Kanban groups
  const todoTasks  = tasks.filter(t => t.status === "todo");
  const doingTasks = tasks.filter(t => t.status === "doing");
  const doneTasks  = tasks.filter(t => t.status === "done");

  // Log coloring
  const logColor = (log) =>
    log.includes("❌") ? "var(--red)" :
    log.includes("🎉") ? "var(--green)" :
    log.includes("🚀") ? "var(--orange)" :
    log.includes("💻") ? "var(--cyan)" :
    log.includes("⏹")  ? "var(--yellow)" :
    "var(--text)";

  return (
    <div className="app">
      {/* ── HEADER ──────────────────────────────────────── */}
      <header className="header">
        <div>
          <div className="header-title">🏢 AIOS SQUAD COCKPIT</div>
          <div className="header-sub">12-AGENT RPG OFFICE SIMULATOR — PIXEL ART EDITION</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {projectStatus && <>
            <span className="badge badge-cyan">FASE: {projectStatus.phase?.toUpperCase()}</span>
            <span className="badge badge-blue">STATUS: {projectStatus.status?.toUpperCase()}</span>
          </>}
          {simActive
            ? <span className="badge" style={{ color: "var(--green)", borderColor: "var(--green)", background: "rgba(0,255,102,0.1)", animation: "neon-glow 1s infinite" }}>● SIMULANDO</span>
            : <span className="badge" style={{ color: "var(--muted)", borderColor: "var(--border-hi)" }}>○ MONITORANDO</span>
          }
        </div>
      </header>

      {/* ── MAIN ────────────────────────────────────────── */}
      <div className="main">

        {/* LEFT: Game pane */}
        <div className="game-pane">

          {/* Office map */}
          <div className="office-map">
            <img src="/office_bg.png" alt="office" className="office-bg" />

            {/* Agents positioned on the map */}
            {AGENTS.map(agent => (
              <AgentOnMap
                key={agent.id}
                agent={agent}
                isActive={activeAgent === agent.id}
                onClick={handleAgentClick}
              />
            ))}
          </div>

          {/* RPG Dialog Box */}
          <div className="dialog-box">
            {dialogAgent ? (
              <>
                {/* Agent face */}
                <div style={getSpriteStyle(dialogAgent.spriteRow, dialogAgent.spriteCol)}
                  className="dialog-agent-face" />
                <div className="dialog-text-wrap">
                  <div className="dialog-speaker" style={{ color: dialogAgent.color }}>
                    {dialogAgent.name}
                    <span style={{ color: "var(--muted)", fontSize: "0.7rem", marginLeft: 8 }}>
                      [{dialogAgent.role}]
                    </span>
                  </div>
                  <div className="dialog-text">
                    "{dialogAgent.dialogTexts[dialogLine]}"
                    {activeAgent === dialogAgent.id && <span className="dialog-cursor" />}
                  </div>
                </div>
              </>
            ) : (
              <div className="dialog-text" style={{ color: "var(--muted)" }}>
                Clique em um agente para inspecionar ou pressione SIMULAR WORKFLOW...
                <span className="dialog-cursor" />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">

          {/* Kanban */}
          <div className="kanban">
            <div className="kanban-header">📋 SPRINT KANBAN</div>

            {/* TO DO */}
            <div className="kanban-col" style={{ background: "rgba(5,8,20,0.5)" }}>
              <div className="kanban-col-head" style={{ color: "var(--muted)" }}>
                <span>A FAZER</span>
                <span className="kanban-col-count badge">{todoTasks.length}</span>
              </div>
              <div className="kanban-list">
                {todoTasks.map(t => <KanbanCard key={t.id} task={t} status="todo" />)}
                {!todoTasks.length && <div className="kanban-empty">— vazio —</div>}
              </div>
            </div>

            {/* DOING */}
            <div className="kanban-col" style={{ background: "rgba(0,187,249,0.04)", border: "1px solid rgba(0,187,249,0.15)" }}>
              <div className="kanban-col-head" style={{ color: "var(--blue)" }}>
                <span>EM PROGRESSO</span>
                <span className="kanban-col-count badge badge-blue">{doingTasks.length}</span>
              </div>
              <div className="kanban-list">
                {doingTasks.map(t => <KanbanCard key={t.id} task={t} status="doing" />)}
                {!doingTasks.length && <div className="kanban-empty" style={{ color: "var(--blue)" }}>— aguardando —</div>}
              </div>
            </div>

            {/* DONE */}
            <div className="kanban-col" style={{ background: "rgba(0,255,102,0.04)", border: "1px solid rgba(0,255,102,0.15)" }}>
              <div className="kanban-col-head" style={{ color: "var(--green)" }}>
                <span>CONCLUÍDO</span>
                <span className="kanban-col-count badge badge-green">{doneTasks.length}</span>
              </div>
              <div className="kanban-list">
                {doneTasks.map(t => <KanbanCard key={t.id} task={t} status="done" />)}
                {!doneTasks.length && <div className="kanban-empty" style={{ color: "var(--green)" }}>— nenhuma ainda —</div>}
              </div>
            </div>
          </div>

          {/* Terminal log */}
          <div className="terminal">
            <div className="terminal-head">
              <span>🖥 TELEMETRY LOG</span>
              <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
                [{simActive ? "SIMULATING" : "LIVE"}]
              </span>
            </div>
            <div className="terminal-log">
              {logs.map((log, i) => (
                <div key={i} style={{ color: logColor(log), fontFamily: "var(--retro)", fontSize: "0.88rem" }}>
                  {log}
                </div>
              ))}
              <div ref={consoleRef} />
            </div>
          </div>

          {/* Controls */}
          <div className="controls">
            <div>
              <div className="project-label">PROJETO ATIVO</div>
              <select
                className="project-select"
                value={selected}
                onChange={e => setSelected(e.target.value)}
                disabled={simActive}
              >
                {projects.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            {!simActive
              ? <button id="btn-simulate" className="btn-sim btn-start" onClick={startSim}>▶ SIMULAR WORKFLOW</button>
              : <button id="btn-stop"     className="btn-sim btn-stop"  onClick={stopSim}>⏹ PARAR SIMULAÇÃO</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

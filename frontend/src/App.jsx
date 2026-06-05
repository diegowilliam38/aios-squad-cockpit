import React, { useState, useEffect, useRef, useCallback } from "react";

/* ─── AGENT DEFINITIONS ──────────────────────────────────── */
const SQUAD_AGENTS = [
  // Floor 1 — Planning + Architecture
  { id: "analyst",        name: "Analyst",     role: "ROI & Biz",      floor: 1, color: "#f77f00", pants: "#7c3f00", skin: "#f4c178", label: "@analyst" },
  { id: "pm",             name: "PM",          role: "Backlog",        floor: 1, color: "#fee440", pants: "#7a6d00", skin: "#f4c178", label: "@pm" },
  { id: "sm",             name: "Scrum",       role: "Stories",        floor: 1, color: "#00bbf9", pants: "#004f80", skin: "#f9c784", label: "@sm" },
  { id: "architect",      name: "Architect",   role: "Tech Design",    floor: 1, color: "#9b5de5", pants: "#3b1a6b", skin: "#e8b88a", label: "@arch" },
  { id: "ux-design-expert", name: "UX Expert", role: "Design Sys",    floor: 1, color: "#ff0055", pants: "#6b0020", skin: "#f9c784", label: "@ux" },
  // Floor 2 — Dev + Quality & Ops
  { id: "dev",            name: "Developer",   role: "Core Code",      floor: 2, color: "#00ff66", pants: "#004d20", skin: "#f4c178", label: "@dev" },
  { id: "prompt-engineer",name: "Prompt Eng.", role: "AI Guard",       floor: 2, color: "#00f5d4", pants: "#004d44", skin: "#e8b88a", label: "@prompt" },
  { id: "security-auditor",name: "SecAudit",   role: "CVEs",           floor: 2, color: "#d62828", pants: "#4d0000", skin: "#f4c178", label: "@sec" },
  { id: "lint-and-validate",name: "Linter",    role: "Style",          floor: 2, color: "#94a3b8", pants: "#334155", skin: "#f9c784", label: "@lint" },
  { id: "doc-coauthoring",  name: "DocWriter", role: "Docs",           floor: 2, color: "#a2d2ff", pants: "#1e3a5f", skin: "#f4c178", label: "@doc" },
  { id: "qa",             name: "QA Tester",   role: "E2E Tests",      floor: 2, color: "#e2e8f0", pants: "#475569", skin: "#e8b88a", label: "@qa" },
  { id: "devops",         name: "DevOps",      role: "CI/CD",          floor: 2, color: "#ffb703", pants: "#7a5500", skin: "#f9c784", label: "@devops" },
];

const FLOOR_1 = SQUAD_AGENTS.filter(a => a.floor === 1);
const FLOOR_2 = SQUAD_AGENTS.filter(a => a.floor === 2);

/* ─── PIXEL SPRITE COMPONENT ────────────────────────────── */
function PixelSprite({ agent, isActive }) {
  const stateClass = isActive ? "state-working" : "state-idle";
  return (
    <div className={`pixel-character ${stateClass}`} title={agent.id}>
      {/* Head */}
      <div className="sprite-head" style={{ background: agent.skin }}>
        <div className="sprite-eye-l" />
        <div className="sprite-eye-r" />
      </div>
      {/* Body / shirt */}
      <div className="sprite-body" style={{ background: agent.color, opacity: isActive ? 1 : 0.85 }} />
      {/* Arms */}
      <div className="sprite-arm-l" style={{ background: agent.color }} />
      <div className="sprite-arm-r" style={{ background: agent.color }} />
      {/* Legs / pants */}
      <div className="sprite-leg-l" style={{ background: agent.pants }} />
      <div className="sprite-leg-r" style={{ background: agent.pants }} />
    </div>
  );
}

/* ─── WORKSTATION COMPONENT ─────────────────────────────── */
function Workstation({ agent, isActive }) {
  const bubbleText =
    agent.id === "dev"     ? "💻 Coding..." :
    agent.id === "qa"      ? "🧪 Testing..." :
    agent.id === "devops"  ? "🚀 Deploying..." :
    agent.id === "architect" ? "📐 Designing..." :
    agent.id === "security-auditor" ? "🔐 Scanning..." :
    "⚙️ Working...";

  return (
    <div className="workstation" style={{ minWidth: 64 }}>
      {/* Speech bubble when active */}
      {isActive && (
        <div className="speech-bubble">{bubbleText}</div>
      )}

      {/* Pixel sprite */}
      <PixelSprite agent={agent} isActive={isActive} />

      {/* Monitor */}
      <div className={`monitor ${isActive ? "active" : ""}`} />

      {/* Desk */}
      <div className="desk-surface">
        <div className={`desk-led ${isActive ? "active-led" : ""}`} />
      </div>

      {/* Name tag */}
      <div className={`agent-tag ${isActive ? "active-tag" : ""}`}>
        <div>{agent.name}</div>
        <div style={{ color: isActive ? agent.color : "var(--text-secondary)", fontSize: "0.6rem" }}>
          {agent.label}
        </div>
      </div>
    </div>
  );
}

/* ─── OFFICE FLOOR COMPONENT ────────────────────────────── */
function OfficeFloor({ agents, activeAgent, floorNum }) {
  const labels = floorNum === 1
    ? "FLOOR 1 — PLANNING & ARCHITECTURE"
    : "FLOOR 2 — DEVELOPMENT & QUALITY OPS";

  return (
    <div className="office-floor" style={{ justifyContent: "space-around", paddingTop: 56 }}>
      <span className="floor-label">{labels}</span>

      {/* Plant on the left */}
      <div className="office-plant" style={{ alignSelf: "flex-end", marginBottom: 12 }} />

      {agents.map((agent, i) => (
        <React.Fragment key={agent.id}>
          {/* Thin divider between agents (not after last) */}
          {i > 0 && <div className="room-divider" style={{ height: 80, alignSelf: "flex-end", marginBottom: 16 }} />}
          <Workstation agent={agent} isActive={activeAgent === agent.id} />
        </React.Fragment>
      ))}

      {/* Plant on the right */}
      <div className="office-plant" style={{ alignSelf: "flex-end", marginBottom: 12 }} />
    </div>
  );
}

/* ─── KANBAN CARD ────────────────────────────────────────── */
function KanbanCard({ task, isDoing }) {
  return (
    <div
      className={`kanban-card ${isDoing ? "kanban-doing-card" : ""}`}
      style={{ borderLeft: `3px solid ${isDoing ? "var(--accent-cyan)" : "var(--border-color)"}` }}
    >
      <div style={{ fontSize: "0.78rem", color: "var(--text-primary)" }}>{task.text}</div>
      <div className="kanban-card-agent">@{task.agent}</div>
    </div>
  );
}

/* ─── APP ROOT ───────────────────────────────────────────── */
export default function App() {
  const [projects, setProjects]           = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [projectStatus, setProjectStatus] = useState(null);
  const [tasks, setTasks]                 = useState([]);
  const [activeAgent, setActiveAgent]     = useState(null);

  // Simulation
  const [simulationActive, setSimulationActive] = useState(false);
  const [currentSimStep, setCurrentSimStep]     = useState(-1);
  const [simSteps, setSimSteps]                 = useState([]);
  const [logs, setLogs] = useState([
    "▶ Sistema AIOS Squad Cockpit inicializado.",
    "▶ Selecione um projeto ou clique em SIMULAR para ver o squad atuando.",
  ]);

  const consoleEndRef = useRef(null);

  /* Load projects */
  useEffect(() => {
    fetch("http://localhost:8124/api/projects")
      .then(r => r.json())
      .then(data => { setProjects(data); if (data[0]) setSelectedProject(data[0]); })
      .catch(() => addLog("❌ ERRO: Backend offline. Inicie o servidor na porta 8124.", "error"));
  }, []);

  /* Load project data */
  const addLog = useCallback((msg, type = "info") => {
    setLogs(prev => {
      if (prev[prev.length - 1] === msg) return prev;
      return [...prev, msg];
    });
  }, []);

  const loadProjectData = useCallback((proj) => {
    if (!proj) return;
    fetch(`http://localhost:8124/api/projects/${proj}/status`)
      .then(r => r.json()).then(setProjectStatus).catch(() => {});
    fetch(`http://localhost:8124/api/projects/${proj}/tasks`)
      .then(r => r.json())
      .then(data => {
        setTasks(data);
        if (!simulationActive) {
          const doing = data.find(t => t.status === "doing");
          setActiveAgent(doing ? doing.agent : null);
          if (doing) addLog(`⚙️ LIVE: @${doing.agent} → "${doing.text}"`);
        }
      }).catch(() => {});
  }, [simulationActive, addLog]);

  /* Poll workspace */
  useEffect(() => {
    loadProjectData(selectedProject);
    if (simulationActive) return;
    const iv = setInterval(() => loadProjectData(selectedProject), 5000);
    return () => clearInterval(iv);
  }, [selectedProject, simulationActive, loadProjectData]);

  /* Load simulation steps */
  useEffect(() => {
    fetch("http://localhost:8124/api/simulation/steps")
      .then(r => r.json()).then(setSimSteps).catch(() => {});
  }, []);

  /* Auto-scroll terminal */
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  /* Simulation loop */
  useEffect(() => {
    if (!simulationActive || currentSimStep < 0 || currentSimStep >= simSteps.length) {
      if (simulationActive && currentSimStep >= simSteps.length) {
        setSimulationActive(false);
        setActiveAgent(null);
        addLog("🎉 CICLO COMPLETO! Todos os 12 agentes concluíram suas tarefas.");
      }
      return;
    }
    const step = simSteps[currentSimStep];
    setActiveAgent(step.agent);
    addLog(step.log);
    setTasks(prev => prev.map(t => t.agent === step.agent ? { ...t, status: "doing" } : t));

    const t = setTimeout(() => {
      setTasks(prev => prev.map(t => t.agent === step.agent ? { ...t, status: "done" } : t));
      setCurrentSimStep(c => c + 1);
    }, step.duration);
    return () => clearTimeout(t);
  }, [simulationActive, currentSimStep, simSteps, addLog]);

  const startSimulation = () => {
    if (!simSteps.length) return;
    setSimulationActive(true);
    setCurrentSimStep(0);
    setTasks(prev => prev.map(t => ({ ...t, status: "todo" })));
    setLogs([
      "🚀 SIMULAÇÃO INICIADA — Ciclo completo do AIOS Squad",
      "🏢 Todos os agentes tomaram seus postos...",
    ]);
  };
  const stopSimulation = () => {
    setSimulationActive(false);
    setCurrentSimStep(-1);
    setActiveAgent(null);
    loadProjectData(selectedProject);
    addLog("⏹ Simulação interrompida. Retornando ao monitoramento em tempo real.");
  };

  // Kanban groups
  const todoTasks  = tasks.filter(t => t.status === "todo");
  const doingTasks = tasks.filter(t => t.status === "doing");
  const doneTasks  = tasks.filter(t => t.status === "done");

  // Log color mapper
  const logColor = (log) => {
    if (log.includes("❌") || log.includes("ERRO"))  return "var(--accent-red)";
    if (log.includes("🎉") || log.includes("COMPLETO")) return "var(--text-retro)";
    if (log.includes("🚀") || log.includes("devops")) return "var(--accent-orange)";
    if (log.includes("💻") || log.includes("dev"))   return "var(--accent-cyan)";
    if (log.includes("⏹"))  return "var(--accent-yellow)";
    return "var(--text-primary)";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>

      {/* ── HEADER ─────────────────────────────────────── */}
      <header className="cockpit-header">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: "2rem", filter: "drop-shadow(0 0 8px var(--accent-blue))" }}>🏢</span>
          <div>
            <div className="cockpit-title">AIOS SQUAD COCKPIT</div>
            <div className="font-retro" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              12-AGENT VISUAL OFFICE SIMULATOR — PIXEL ART EDITION
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Project badges */}
          {projectStatus && (
            <div style={{ display: "flex", gap: 8 }}>
              <span className="badge badge-cyan">FASE: {projectStatus.phase?.toUpperCase()}</span>
              <span className="badge badge-blue">STATUS: {projectStatus.status?.toUpperCase()}</span>
            </div>
          )}

          {/* Project selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <label className="font-retro" style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>PROJETO</label>
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              disabled={simulationActive}
              style={{
                background: "var(--bg-primary)", color: "#fff",
                border: "2px solid var(--border-color)", padding: "6px 12px",
                fontFamily: "'VT323', monospace", fontSize: "1rem", cursor: "pointer", outline: "none",
              }}
            >
              {projects.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Sim button */}
          {!simulationActive
            ? <button id="btn-simulate" className="btn-sim btn-start" onClick={startSimulation}>▶ SIMULAR WORKFLOW</button>
            : <button id="btn-stop"     className="btn-sim btn-stop"  onClick={stopSimulation}>⏹ PARAR</button>
          }
        </div>
      </header>

      {/* ── MAIN LAYOUT ────────────────────────────────── */}
      <div className="cockpit-layout">

        {/* LEFT: Office Building + Terminal */}
        <div className="cockpit-left">

          {/* Office Building */}
          <section className="office-section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="section-title font-retro" style={{ color: "var(--accent-cyan)" }}>
                🏢 SQUAD OFFICE — SIDE VIEW
              </span>
              <span className="font-retro" style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                {activeAgent ? `ACTIVE: @${activeAgent}` : "ALL IDLE"}
              </span>
            </div>

            <div className="office-building" style={{ flex: 1, overflow: "hidden" }}>
              <OfficeFloor agents={FLOOR_1} activeAgent={activeAgent} floorNum={1} />
              <OfficeFloor agents={FLOOR_2} activeAgent={activeAgent} floorNum={2} />
            </div>
          </section>

          {/* CRT Terminal */}
          <section className="terminal-section crt-overlay">
            <div className="terminal-header">
              <span className="font-retro" style={{ color: "var(--text-retro)", fontSize: "1.2rem" }}>
                🖥 SQUAD TELEMETRY LOG
              </span>
              <span className="font-retro" style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                [{simulationActive ? "SIMULATING..." : "LIVE MONITOR"}]
              </span>
            </div>
            <div className="terminal-log font-retro">
              {logs.map((log, i) => (
                <div key={i} style={{ color: logColor(log) }}>
                  {log}{i === logs.length - 1 && <span className="terminal-cursor" />}
                </div>
              ))}
              <div ref={consoleEndRef} />
            </div>
          </section>
        </div>

        {/* RIGHT: Kanban Board */}
        <aside className="kanban-section">
          <span className="section-title font-retro" style={{ color: "var(--accent-blue)" }}>
            📋 SPRINT KANBAN
          </span>

          {/* TO DO */}
          <div className="kanban-col" style={{ background: "rgba(10,15,30,0.6)" }}>
            <div className="kanban-col-header" style={{ color: "var(--text-secondary)" }}>
              <span>A FAZER</span>
              <span className="kanban-col-count badge">{todoTasks.length}</span>
            </div>
            <div className="kanban-list">
              {todoTasks.map(t => <KanbanCard key={t.id} task={t} isDoing={false} />)}
              {todoTasks.length === 0 && (
                <div className="font-retro" style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textAlign: "center", padding: "8px" }}>
                  — vazio —
                </div>
              )}
            </div>
          </div>

          {/* DOING */}
          <div className="kanban-col" style={{ background: "rgba(0,187,249,0.04)", border: "1px solid rgba(0,187,249,0.2)" }}>
            <div className="kanban-col-header" style={{ color: "var(--accent-blue)" }}>
              <span>EM PROGRESSO</span>
              <span className="kanban-col-count badge badge-blue">{doingTasks.length}</span>
            </div>
            <div className="kanban-list">
              {doingTasks.map(t => <KanbanCard key={t.id} task={t} isDoing={true} />)}
              {doingTasks.length === 0 && (
                <div className="font-retro" style={{ fontSize: "0.8rem", color: "var(--accent-blue)", textAlign: "center", padding: "8px" }}>
                  — aguardando —
                </div>
              )}
            </div>
          </div>

          {/* DONE */}
          <div className="kanban-col" style={{ background: "rgba(0,255,102,0.04)", border: "1px solid rgba(0,255,102,0.2)" }}>
            <div className="kanban-col-header" style={{ color: "var(--text-retro)" }}>
              <span>CONCLUÍDO</span>
              <span className="kanban-col-count badge badge-green">{doneTasks.length}</span>
            </div>
            <div className="kanban-list">
              {doneTasks.map(t => (
                <div key={t.id} className="kanban-card" style={{ borderLeft: "3px solid var(--text-retro)" }}>
                  <div style={{ fontSize: "0.78rem", textDecoration: "line-through", color: "var(--text-secondary)" }}>{t.text}</div>
                  <div className="kanban-card-agent" style={{ color: "var(--text-secondary)" }}>@{t.agent}</div>
                </div>
              ))}
              {doneTasks.length === 0 && (
                <div className="font-retro" style={{ fontSize: "0.8rem", color: "var(--text-retro)", textAlign: "center", padding: "8px" }}>
                  — nenhuma ainda —
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

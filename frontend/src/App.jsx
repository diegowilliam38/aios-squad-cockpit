import React, { useState, useEffect, useRef } from "react";

// The 12 agents definitions and visual positions/rooms in the virtual office
const SQUAD_AGENTS = [
  { id: "analyst", name: "Analyst", role: "Business & ROI", room: "Planning", color: "#f77f00", emoji: "🔍" },
  { id: "pm", name: "Product Manager", role: "Backlog & PRD", room: "Planning", color: "#fee440", emoji: "📝" },
  { id: "sm", name: "Scrum Master", role: "Sprints & Stories", room: "Planning", color: "#00bbf9", emoji: "📋" },
  { id: "architect", name: "Architect", role: "Tech Design", room: "Architecture", color: "#9b5de5", emoji: "📐" },
  { id: "ux-design-expert", name: "UX Expert", role: "Design System", room: "Architecture", color: "#ff0055", emoji: "🎨" },
  { id: "dev", name: "Developer", role: "Coding Core", room: "Development", color: "#00ff66", emoji: "💻" },
  { id: "prompt-engineer", name: "Prompt Eng.", role: "AI Prompt Guard", room: "Development", color: "#00f5d4", emoji: "🛡️" },
  { id: "security-auditor", name: "Security Audit", role: "Code Security", room: "Quality & Ops", color: "#d62828", emoji: "🔐" },
  { id: "lint-and-validate", name: "Lint & Clean", role: "Sintaxe & Estilo", room: "Quality & Ops", color: "#94a3b8", emoji: "🧹" },
  { id: "doc-coauthoring", name: "Doc Writer", role: "Documentation", room: "Quality & Ops", color: "#a2d2ff", emoji: "📚" },
  { id: "qa", name: "QA Tester", role: "Unit & E2E Tests", room: "Quality & Ops", color: "#e2e8f0", emoji: "🧪" },
  { id: "devops", name: "DevOps", role: "CI/CD & Push", room: "Quality & Ops", color: "#ffb703", emoji: "🚀" }
];

export default function App() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [projectStatus, setProjectStatus] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeAgent, setActiveAgent] = useState(null);
  
  // Simulation State
  const [simulationActive, setSimulationActive] = useState(false);
  const [currentSimStep, setCurrentSimStep] = useState(-1);
  const [simSteps, setSimSteps] = useState([]);
  const [logs, setLogs] = useState([
    "💡 Sistema inicializado. Selecione um projeto ou inicie a simulação para ver o Squad atuando."
  ]);
  
  const consoleEndRef = useRef(null);

  // Load project list
  useEffect(() => {
    fetch("http://localhost:8124/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        if (data.length > 0) {
          setSelectedProject(data[0]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch projects list:", err);
        setLogs(prev => [...prev, "❌ Erro: Não foi possível conectar ao backend na porta 8124."]);
      });
  }, []);

  // Load status and tasks for selected project
  const loadProjectData = (projName) => {
    if (!projName) return;
    
    // Fetch Status
    fetch(`http://localhost:8124/api/projects/${projName}/status`)
      .then((res) => res.json())
      .then((data) => setProjectStatus(data))
      .catch((err) => console.error("Failed to fetch status:", err));

    // Fetch Tasks
    fetch(`http://localhost:8124/api/projects/${projName}/tasks`)
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        // Automatically determine active agent from live workspace doing tasks
        if (!simulationActive) {
          const activeTask = data.find((t) => t.status === "doing");
          if (activeTask) {
            setActiveAgent(activeTask.agent);
            setLogs(prev => {
              const newLog = `⚙️ [Live]: Agente @${activeTask.agent} está executando: "${activeTask.text}"`;
              // Prevent duplicates in log panel
              return prev[prev.length - 1] === newLog ? prev : [...prev, newLog];
            });
          } else {
            setActiveAgent(null);
          }
        }
      })
      .catch((err) => console.error("Failed to fetch tasks:", err));
  };

  // Poll workspace changes every 5 seconds (only when simulation is off)
  useEffect(() => {
    loadProjectData(selectedProject);
    
    if (simulationActive) return;
    
    const interval = setInterval(() => {
      loadProjectData(selectedProject);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [selectedProject, simulationActive]);

  // Load simulation steps
  useEffect(() => {
    fetch("http://localhost:8124/api/simulation/steps")
      .then((res) => res.json())
      .then((data) => setSimSteps(data))
      .catch((err) => console.error("Failed to fetch simulation steps:", err));
  }, []);

  // Scroll to bottom of terminal console
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Simulation handler loop
  useEffect(() => {
    if (!simulationActive || currentSimStep < 0 || currentSimStep >= simSteps.length) {
      if (simulationActive && currentSimStep >= simSteps.length) {
        setSimulationActive(false);
        setActiveAgent(null);
        setLogs(prev => [...prev, "🎉 Simulação de ciclo concluída com sucesso! Todos os agentes realizaram suas tarefas."]);
      }
      return;
    }

    const stepInfo = simSteps[currentSimStep];
    setActiveAgent(stepInfo.agent);
    setLogs(prev => [...prev, stepInfo.log]);
    
    // Simulate updating tasks in Kanban for the active agent
    setTasks(prevTasks => {
      return prevTasks.map(t => {
        if (t.agent === stepInfo.agent) {
          return { ...t, status: "doing" };
        }
        return t;
      });
    });

    const timer = setTimeout(() => {
      // Mark task as done before moving to next agent
      setTasks(prevTasks => {
        return prevTasks.map(t => {
          if (t.agent === stepInfo.agent) {
            return { ...t, status: "done" };
          }
          return t;
        });
      });
      setCurrentSimStep(prev => prev + 1);
    }, stepInfo.duration);

    return () => clearTimeout(timer);
  }, [simulationActive, currentSimStep, simSteps]);

  const startSimulation = () => {
    if (simSteps.length === 0) return;
    setSimulationActive(true);
    setCurrentSimStep(0);
    // Reset all tasks to todo/doing for simulation representation
    setTasks(prevTasks => prevTasks.map(t => ({ ...t, status: "todo" })));
    setLogs([
      "🚀 Iniciando ciclo de simulação visual do AIOS Squad...",
      "🏢 Todos os agentes tomaram seus postos. Iniciando planejamento..."
    ]);
  };

  const stopSimulation = () => {
    setSimulationActive(false);
    setCurrentSimStep(-1);
    setActiveAgent(null);
    loadProjectData(selectedProject);
    setLogs(prev => [...prev, "⏹️ Simulação interrompida. Retornando ao monitoramento em tempo real do workspace."]);
  };

  // Group tasks for Kanban columns
  const todoTasks = tasks.filter(t => t.status === "todo");
  const doingTasks = tasks.filter(t => t.status === "doing");
  const doneTasks = tasks.filter(t => t.status === "done");

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "screen", padding: "20px", gap: "20px" }}>
      
      {/* 1. HEADER CONTROL PLANE */}
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "15px 25px", background: "rgba(11, 14, 32, 0.85)", backdropFilter: "blur(12px)",
        borderRadius: "8px", border: "1px solid var(--border-color)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.4)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span style={{ fontSize: "2rem", filter: "drop-shadow(0 0 10px var(--accent-blue))" }}>🏢</span>
          <div>
            <h1 className="font-retro" style={{ fontSize: "2rem", color: "#fff", letterSpacing: "1px" }}>
              AIOS SQUAD COCKPIT
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Monitoramento Visual do Squad de 12 Agentes
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {/* Project Selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600" }}>PROJETO ATIVO</label>
            <select 
              value={selectedProject} 
              onChange={(e) => setSelectedProject(e.target.value)}
              disabled={simulationActive}
              style={{
                background: "var(--bg-primary)", color: "#fff", border: "2px solid var(--border-color)",
                borderRadius: "4px", padding: "8px 15px", fontSize: "0.9rem", cursor: "pointer",
                outline: "none"
              }}
            >
              {projects.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Simulation buttons */}
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            {!simulationActive ? (
              <button 
                onClick={startSimulation}
                className="font-retro"
                style={{
                  background: "var(--accent-blue)", color: "#000", border: "none",
                  borderRadius: "4px", padding: "8px 18px", fontSize: "1.1rem", cursor: "pointer",
                  fontWeight: "bold", boxShadow: "0 0 10px rgba(0, 187, 249, 0.4)",
                  transition: "all 0.2s"
                }}
              >
                🎮 SIMULAR WORKFLOW
              </button>
            ) : (
              <button 
                onClick={stopSimulation}
                className="font-retro"
                style={{
                  background: "var(--accent-red)", color: "#fff", border: "none",
                  borderRadius: "4px", padding: "8px 18px", fontSize: "1.1rem", cursor: "pointer",
                  fontWeight: "bold", boxShadow: "0 0 10px rgba(255, 0, 85, 0.4)",
                  transition: "all 0.2s"
                }}
              >
                ⏹️ PARAR SIMULAÇÃO
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE AREA */}
      <div style={{ display: "grid", gridTemplateColumns: "2.3fr 1fr", gap: "20px" }}>
        
        {/* OFFICE SIMULATOR & AGENTS GRID */}
        <section style={{
          display: "flex", flexDirection: "column", gap: "15px",
          background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-color)",
          padding: "20px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="font-retro" style={{ fontSize: "1.5rem", color: "var(--accent-cyan)" }}>
              🤖 SQUAD OFFICE MAP (VIRTUAL OFFICE)
            </h2>
            {projectStatus && (
              <div style={{ display: "flex", gap: "10px" }}>
                <span className="font-retro" style={{
                  background: "rgba(0, 245, 212, 0.15)", color: "var(--accent-cyan)",
                  padding: "4px 10px", borderRadius: "4px", border: "1px solid rgba(0, 245, 212, 0.3)"
                }}>
                  Fase: {projectStatus.phase.toUpperCase()}
                </span>
                <span className="font-retro" style={{
                  background: "rgba(0, 187, 249, 0.15)", color: "var(--accent-blue)",
                  padding: "4px 10px", borderRadius: "4px", border: "1px solid rgba(0, 187, 249, 0.3)"
                }}>
                  Status: {projectStatus.status.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Virtual Office Grid (grouped in functional Rooms) */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "15px",
            background: "#03050c", border: "4px solid #1a223f", padding: "15px", borderRadius: "4px",
            boxShadow: "inset 0 0 15px rgba(0,0,0,0.8)"
          }}>
            
            {["Planning", "Architecture", "Development", "Quality & Ops"].map(roomName => {
              const roomAgents = SQUAD_AGENTS.filter(a => a.room === roomName);
              
              return (
                <div key={roomName} style={{
                  background: "rgba(20, 25, 45, 0.5)", border: "2px dashed #2a355f",
                  borderRadius: "6px", padding: "15px", display: "flex", flexDirection: "column", gap: "12px",
                  position: "relative"
                }}>
                  <div style={{
                    position: "absolute", top: "-10px", left: "15px", background: "#03050c",
                    padding: "0 8px", fontSize: "0.75rem", color: "var(--text-secondary)",
                    fontWeight: "bold", border: "1px solid #2a355f", borderRadius: "3px"
                  }}>
                    {roomName.toUpperCase()} ROOM
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginTop: "5px" }}>
                    {roomAgents.map(agent => {
                      const isActive = activeAgent === agent.id;
                      
                      return (
                        <div 
                          key={agent.id}
                          className={isActive ? "pixel-border-active" : "pixel-border"}
                          style={{
                            background: isActive ? "rgba(0, 255, 102, 0.08)" : "rgba(10, 12, 22, 0.8)",
                            padding: "10px", borderRadius: "4px", display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center", minHeight: "135px",
                            textAlign: "center", cursor: "pointer", position: "relative",
                            animation: isActive ? "pixel-typing 0.15s infinite linear" : "pixel-idle 3s infinite ease-in-out",
                            transition: "all 0.3s"
                          }}
                        >
                          {/* Animated Speech Bubble */}
                          {isActive && (
                            <div style={{
                              position: "absolute", bottom: "105%", left: "50%",
                              background: "#fff", color: "#000", padding: "4px 8px",
                              borderRadius: "4px", fontSize: "0.7rem", fontWeight: "bold",
                              width: "120px", boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
                              animation: "bubble-float 2s infinite ease-in-out", zIndex: 10
                            }}>
                              {agent.id === "dev" ? "🤖 Coding..." : 
                               agent.id === "qa" ? "🧪 Testing..." : 
                               agent.id === "devops" ? "🚀 Deploying..." : "⚙️ Working..."}
                              <div style={{
                                position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
                                border: "6px solid transparent", borderTopColor: "#fff"
                              }} />
                            </div>
                          )}

                          {/* Sprite Avatar */}
                          <div style={{
                            fontSize: "2rem", marginBottom: "8px",
                            filter: isActive ? `drop-shadow(0 0 8px ${agent.color})` : "none"
                          }}>
                            {agent.emoji}
                          </div>

                          <div style={{
                            fontSize: "0.85rem", fontWeight: "bold", 
                            color: isActive ? agent.color : "#fff"
                          }}>
                            {agent.name}
                          </div>

                          <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                            {agent.role}
                          </div>

                          {/* Status Badge */}
                          <div style={{
                            marginTop: "8px", fontSize: "0.6rem", padding: "2px 6px",
                            borderRadius: "10px", fontWeight: "bold",
                            background: isActive ? "rgba(0, 255, 102, 0.2)" : "rgba(255, 255, 255, 0.05)",
                            color: isActive ? "var(--text-retro)" : "var(--text-secondary)"
                          }}>
                            {isActive ? "ATIVO" : "IDLE"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          </div>
        </section>

        {/* KANBAN BOARD */}
        <section style={{
          display: "flex", flexDirection: "column", gap: "15px",
          background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-color)",
          padding: "20px"
        }}>
          <h2 className="font-retro" style={{ fontSize: "1.5rem", color: "var(--accent-blue)" }}>
            📋 SPRINT BOARD (KANBAN)
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px", height: "500px", overflowY: "auto" }}>
            
            {/* 1. TO DO COLUMN */}
            <div style={{ background: "rgba(10, 15, 30, 0.6)", borderRadius: "6px", padding: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "0.8rem", fontWeight: "bold", color: "var(--text-secondary)" }}>
                <span>A FAZER</span>
                <span style={{ background: "var(--border-color)", padding: "2px 6px", borderRadius: "10px" }}>{todoTasks.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {todoTasks.map(t => (
                  <div key={t.id} style={{ background: "var(--bg-primary)", padding: "10px", borderRadius: "4px", borderLeft: "3px solid var(--text-secondary)" }}>
                    <p style={{ fontSize: "0.8rem" }}>{t.text}</p>
                    <span style={{ fontSize: "0.65rem", color: "var(--accent-purple)" }}>@{t.agent}</span>
                  </div>
                ))}
                {todoTasks.length === 0 && <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center", padding: "5px" }}>Sem tarefas pendentes.</p>}
              </div>
            </div>

            {/* 2. DOING COLUMN */}
            <div style={{ background: "rgba(0, 187, 249, 0.05)", borderRadius: "6px", padding: "12px", border: "1px solid rgba(0, 187, 249, 0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "0.8rem", fontWeight: "bold", color: "var(--accent-blue)" }}>
                <span>EM PROGRESSO</span>
                <span style={{ background: "rgba(0, 187, 249, 0.2)", padding: "2px 6px", borderRadius: "10px" }}>{doingTasks.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {doingTasks.map(t => (
                  <div key={t.id} style={{ background: "var(--bg-primary)", padding: "10px", borderRadius: "4px", borderLeft: "3px solid var(--accent-blue)", animation: "neon-glow 2s infinite ease-in-out" }}>
                    <p style={{ fontSize: "0.8rem" }}>{t.text}</p>
                    <span style={{ fontSize: "0.65rem", color: "var(--accent-cyan)", fontWeight: "bold" }}>@{t.agent}</span>
                  </div>
                ))}
                {doingTasks.length === 0 && <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center", padding: "5px" }}>Aguardando tarefas...</p>}
              </div>
            </div>

            {/* 3. DONE COLUMN */}
            <div style={{ background: "rgba(0, 255, 102, 0.05)", borderRadius: "6px", padding: "12px", border: "1px solid rgba(0, 255, 102, 0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "0.8rem", fontWeight: "bold", color: "var(--text-retro)" }}>
                <span>CONCLUÍDO</span>
                <span style={{ background: "rgba(0, 255, 102, 0.2)", padding: "2px 6px", borderRadius: "10px" }}>{doneTasks.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {doneTasks.map(t => (
                  <div key={t.id} style={{ background: "var(--bg-primary)", padding: "10px", borderRadius: "4px", borderLeft: "3px solid var(--text-retro)" }}>
                    <p style={{ fontSize: "0.8rem", textDecoration: "line-through", color: "var(--text-secondary)" }}>{t.text}</p>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>@{t.agent}</span>
                  </div>
                ))}
                {doneTasks.length === 0 && <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center", padding: "5px" }}>Nenhuma tarefa concluída ainda.</p>}
              </div>
            </div>

          </div>
        </section>

      </div>

      {/* 3. RETRO TERMINAL CONSOLE LOG */}
      <section className="crt-overlay" style={{
        background: "#020408", border: "4px solid #1a223f", borderRadius: "6px",
        padding: "15px", boxShadow: "0 0 20px rgba(0,0,0,0.8)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", borderBottom: "1px solid #1a223f", paddingBottom: "5px" }}>
          <span className="font-retro" style={{ color: "var(--text-retro)", fontSize: "1.2rem" }}>
            🖥️ SQUAD TELEMETRY CONSOLE (CRT LOG)
          </span>
          <span className="font-retro" style={{ color: "var(--text-secondary)" }}>
            [STATUS: CONNECTED]
          </span>
        </div>

        <div style={{
          height: "150px", overflowY: "auto", display: "flex", flexDirection: "column",
          gap: "6px", padding: "5px", fontSize: "1.1rem"
        }} className="font-retro">
          {logs.map((log, index) => {
            let color = "var(--text-primary)";
            if (log.includes("❌")) color = "var(--accent-red)";
            else if (log.includes("✅") || log.includes("🎉") || log.includes("success")) color = "var(--text-retro)";
            else if (log.includes("🔍") || log.includes("pm") || log.includes("pm")) color = "var(--accent-yellow)";
            else if (log.includes("dev") || log.includes("Coding")) color = "var(--accent-cyan)";
            else if (log.includes("deploy") || log.includes("devops")) color = "var(--accent-orange)";
            
            return (
              <div key={index} style={{ color }}>
                {log}
              </div>
            );
          })}
          <div ref={consoleEndRef} />
        </div>
      </section>

    </div>
  );
}

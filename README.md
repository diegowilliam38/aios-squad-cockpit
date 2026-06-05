# AIOS Squad Cockpit

> **Visual office simulator** para o squad de 12 agentes do AIOS — um cockpit pixel art retrô para monitorar tarefas em tempo real ou via simulação de workflow.

---

## 🚀 Como iniciar

### Opção 1 — Script único (Windows)
```bat
run_cockpit.bat
```
Instala dependências e sobe backend + frontend automaticamente.

### Opção 2 — Manual

**Backend (FastAPI, porta 8124):**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

**Frontend (Vite + React, porta 5173):**
```bash
cd frontend
npm install
npm run dev
```

Acesse: `http://localhost:5173`

---

## 🏢 Arquitetura

```
aios-squad-cockpit/
├── backend/
│   ├── main.py          ← FastAPI REST API (porta 8124)
│   ├── parser.py        ← Parseia project-status.yaml e task.md do workspace
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.jsx      ← Componente principal: Mapa de Escritório + Kanban + Terminal
│       └── index.css    ← Design system: Cyberpunk/Pixel Art, CRT, animações CSS
└── run_cockpit.bat      ← Launcher único Windows
```

---

## 🤖 Os 12 Agentes do Squad

| Sala | Agente | Papel |
|---|---|---|
| Planning | `@analyst` | Análise de negócio e ROI |
| Planning | `@pm` | Backlog e PRD |
| Planning | `@sm` | Sprints e Stories |
| Architecture | `@architect` | Design técnico |
| Architecture | `@ux-design-expert` | Design System & UI |
| Development | `@dev` | Implementação de código |
| Development | `@prompt-engineer` | Prompts LangGraph/RAG |
| Quality & Ops | `@security-auditor` | Segurança e CVEs |
| Quality & Ops | `@lint-and-validate` | Sintaxe e estilo |
| Quality & Ops | `@doc-coauthoring` | Documentação |
| Quality & Ops | `@qa` | Testes unitários e E2E |
| Quality & Ops | `@devops` | CI/CD e Git push |

---

## ✨ Funcionalidades

- **Mapa Virtual de Escritório**: 12 desks em 4 salas temáticas
- **Animações CSS**: idle breathing + typing vibration para agentes ativos
- **Speech Bubbles**: balões de fala aparecem quando um agente está trabalhando
- **Kanban em tempo real**: lê `task.md` do projeto ativo (A Fazer / Em Progresso / Concluído)
- **Terminal CRT retrô**: log de telemetria em tempo real com efeito scanline
- **Simulação de Workflow**: reproduz o ciclo completo do squad com animações e logs sequenciais
- **Polling automático**: atualiza dados do workspace a cada 5 segundos

---

## 🔌 Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/projects` | Lista projetos ativos |
| GET | `/api/projects/{name}/status` | Status do projeto (YAML) |
| GET | `/api/projects/{name}/tasks` | Tarefas do projeto (MD) |
| GET | `/api/simulation/steps` | Passos da simulação |

---

*Projeto independente do ecossistema AIOS-WORKSPACE. Vive em `projects/aios-squad-cockpit/`.*

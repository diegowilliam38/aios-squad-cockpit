from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from pydantic import BaseModel
import uvicorn

from parser import get_workspace_projects, parse_project_status, parse_project_tasks

app = FastAPI(title="AIOS Squad Cockpit Backend", version="1.0.0")

# Enable CORS for frontend requests (typically Vite running on port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/projects", response_model=List[str])
def list_projects():
    """Lists all valid projects inside the workspace's projects/ folder."""
    return get_workspace_projects()

@app.get("/api/projects/{name}/status")
def get_project_status(name: str):
    """Returns parsed project status configuration."""
    projects = get_workspace_projects()
    if name not in projects:
        raise HTTPException(status_code=404, detail="Project not found")
    return parse_project_status(name)

@app.get("/api/projects/{name}/tasks")
def get_project_tasks(name: str):
    """Returns structured tasks from the project's task.md."""
    projects = get_workspace_projects()
    if name not in projects:
        raise HTTPException(status_code=404, detail="Project not found")
    return parse_project_tasks(name)

@app.get("/api/simulation/steps")
def get_simulation_steps():
    """Returns sequential workflow steps of the 12 agents to power the simulation mode."""
    return [
        {
            "step": 1,
            "agent": "analyst",
            "title": "Análise de Viabilidade",
            "log": "🔍 [@analyst]: Analisando requisitos do projeto e viabilidade de ROI. Conformidade regulatória verificada.",
            "duration": 3000
        },
        {
            "step": 2,
            "agent": "pm",
            "title": "Definição do PRD",
            "log": "📝 [@pm]: Elaborando o Product Requirements Document (PRD.md). Escopo inicial definido com sucesso.",
            "duration": 3000
        },
        {
            "step": 3,
            "agent": "sm",
            "title": "Criação de Stories",
            "log": "📋 [@sm]: Planejando sprints e criando histórias de usuário hiperdetalhadas em `.agent/stories/`.",
            "duration": 3000
        },
        {
            "step": 4,
            "agent": "architect",
            "title": "Modelagem Arquitetural",
            "log": "📐 [@architect]: Criando plano de execução técnica (`implementation_plan.md`) e definindo a topologia do LangGraph.",
            "duration": 3500
        },
        {
            "step": 5,
            "agent": "ux-design-expert",
            "title": "Design System & CSS",
            "log": "🎨 [@ux-design-expert]: Gerando design tokens consistentes e garantindo acessibilidade WCAG (contraste 4.5:1).",
            "duration": 3000
        },
        {
            "step": 6,
            "agent": "dev",
            "title": "Implementação do Código",
            "log": "💻 [@dev]: Desenvolvendo as funcionalidades principais do projeto. Escrevendo o nó Researcher com RAG.",
            "duration": 5000
        },
        {
            "step": 7,
            "agent": "prompt-engineer",
            "title": "Engenharia de Prompts",
            "log": "🛡️ [@prompt-engineer]: Revisando e blindando prompts de IA contra Prompt Injection e vazamento de regras do sistema.",
            "duration": 3000
        },
        {
            "step": 8,
            "agent": "security-auditor",
            "title": "Auditoria de Segurança",
            "log": "🔐 [@security-auditor]: Executando `audit-skills` v3.0 e escaneando o código por vulnerabilidades e vazamento de segredos.",
            "duration": 3000
        },
        {
            "step": 9,
            "agent": "lint-and-validate",
            "title": "Validação de Sintaxe",
            "log": "🧹 [@lint-and-validate]: Rodando analisadores estáticos, removendo imports inutilizados e padronizando o código.",
            "duration": 2500
        },
        {
            "step": 10,
            "agent": "doc-coauthoring",
            "title": "Documentação Técnica",
            "log": "📚 [@doc-coauthoring]: Escrevendo o arquivo `README.md` detalhado e atualizando a wiki interna de documentação.",
            "duration": 2500
        },
        {
            "step": 11,
            "agent": "qa",
            "title": "Garantia de Qualidade",
            "log": "🧪 [@qa]: Executando a suíte de testes de integração e personas. 100% das asserções aprovadas com sucesso!",
            "duration": 4000
        },
        {
            "step": 12,
            "agent": "devops",
            "title": "Deploy em Produção",
            "log": "🚀 [@devops]: Executando git push, ativando pipelines de CI/CD e publicando o container de produção no Railway.",
            "duration": 4000
        }
    ]

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8124, reload=True)

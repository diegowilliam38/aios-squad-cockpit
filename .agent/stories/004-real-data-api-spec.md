# STORY-004: API de Dados Reais (Workspace Parser)

## Contexto
O Cockpit precisa sair do modo "Simulação Hardcoded" e refletir o estado real dos projetos do ecossistema AIOS-WORKSPACE. Para isso, o Backend (FastAPI) deve fazer o parser dos arquivos reais de controle (Markdown e YAML) e servi-los via API REST para o Frontend React.

## Critérios de Aceite

### 1. Sistema de Varredura de Projetos (Backend)
- [x] O `parser.py` deve subir dois níveis de diretório (`../..`) para acessar a raiz da pasta `projects/` do Workspace.
- [x] Somente diretórios que contenham pelo menos um `project-status.yaml` OU um `task.md` devem ser considerados Projetos Válidos Ativos e expostos na rota `/api/projects`.

### 2. Leitura de Status (YAML Parser)
- [x] O endpoint `/api/projects/{name}/status` deve ler o `project-status.yaml` real usando `PyYAML`.
- [x] Caso o arquivo não exista ou esteja corrompido, deve retornar um payload default (`status: planning`, `phase: init`) sem quebrar a aplicação.

### 3. Leitura de Kanban (Markdown Parser)
- [x] O endpoint `/api/projects/{name}/tasks` deve escanear o `task.md` real linha por linha.
- [x] Deve usar a Regex `^\s*[-*]\s*(?:`|code)?\[([\s/xX])\]` para extrair checkboxes.
- [x] Mapeamento binário obrigatório de status visual:
  - `[ ]` -> `todo`
  - `[/]` -> `doing`
  - `[x]` -> `done`
- [x] A atribuição de agente deve ser mapeada lendo o conteúdo textual da task procurando por tags explícitas (ex: `@dev`, `dev`) em caixa baixa. Se não encontrar tag explícita, o parser tenta deduzir pela palavra-chave (ex: "deploy" -> `devops`).

### 4. Live Polling (Frontend)
- [x] O `App.jsx` deve executar uma função de `fetch` contra a porta local `8124` via `setInterval` a cada **5 segundos**.
- [x] Se a Simulação (`simActive`) estiver desligada, os Agentes devem agir baseados no estado real que o Backend enviou: Agentes que possuírem task no estado `doing` devem ativar a animação `WALK` em direção à sua mesa e entrar no ciclo `TYPE`. Agentes sem task `doing` ficam em `IDLE/Wandering`.

## Checklist de Conformidade Zero-Trust
- [x] Não usar webhooks não autenticados expostos externamente (apenas porta localhost:8124).
- [x] O Backend nunca edita o Workspace (SOMENTE LEITURA), o write é de responsabilidade de subagentes ou do Tech Lead no VSCode.

# Product Requirements Document (PRD) - AIOS Squad Cockpit

## 1. Visão do Produto
Painel de observabilidade gamificado em formato de escritório 2D (estilo 16-bits), onde os 12 agentes de IA do squad ganham "corpos" visuais e reagem em tempo real às tarefas do ecossistema.

## 2. Mecanismo Único
Diferente de dashboards tradicionais com gráficos chatos, o Cockpit materializa a "Caixa Preta" da IA. O usuário consegue VER os agentes andando até as mesas, sentando para trabalhar, e reportando logs no Kanban.

## 3. Requisitos Funcionais (Core)
- **Renderização de Mapa**: O ambiente visual deve ser carregado com perspectiva Top-Down ortogonal.
- **Movimentação Autônoma (Wandering)**: Agentes ociosos devem circular ortogonalmente pelo escritório para dar sensação de vida.
- **Task Execution Flow**:
  - Quando uma tarefa é atribuída a um agente via Kanban/Telemetry Log, o agente visual deve "andar" (Walking) até a sua respectiva mesa.
  - Ao chegar na mesa, a animação do agente deve mudar para "Trabalhando" (Sitting/Typing/Reading).
  - Um balão de fala (Speech Bubble) e Glow de seleção devem destacar o agente ativo.

## 4. Requisitos Não Funcionais
- **Performance**: Nenhuma re-renderização pesada de Canvas/WebGL. Uso exclusivo de Virtual DOM do React + CSS Animations aceleradas via GPU.
- **Identidade Visual**: Uso de paleta de cores de sistema e tipografia retro/pixel (`VT323`).
- **Resolução de Sprites**: Sprites rasterizados sem blur (`image-rendering: pixelated`). O motor de sprite obedece estritamente às proporções 16x32px originais do Pixel Agents.

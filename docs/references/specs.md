# Especificação Operacional (SDD) - AIOS Squad Cockpit

## Visão Geral
O AIOS Squad Cockpit é um painel de observabilidade em tempo real dos fluxos do ecossistema de Inteligência Artificial da agência. 
O principal objetivo do projeto é demonstrar de forma lúdica a orquestração em LangGraph e a passagem de bastão através de um escritório de 16-bits no navegador.

## Componentes Chave

### Map Renderer
Renderiza o escritório como background com tiles de 16x16px baseados nos assets originais do Pixel Agents.
Possui um efeito de sobreposição CRT e controle autônomo de zoom na área central do escritório.

### Agent Sprites
Os 12 agentes do squad interagem com o mapa através de uma matriz de posições (x,y mapeados em colunas e linhas).
A máquina de estados para cada agente engloba 3 fases visuais:
- **IDLE/Wandering**: Perambulam aleatoriamente ortogonalmente pelo escritório.
- **WALKING**: Deslocam-se pelo Grid 2D em direção as suas mesas quando recebem uma Task.
- **WORKING**: Sentam-se no PC e ativam animação cíclica de trabalho na mesa quando o status está ativo.

### Live Telemetry Log & Kanban
Integra via SSE/WebSocket ou simulação as tarefas ativas e exibe o Live Board à direita, sincronizando o status das missões reais dos agentes em Backlog com as animações da tela.

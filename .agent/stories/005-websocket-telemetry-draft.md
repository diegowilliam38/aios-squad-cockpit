# DRAFT / IDEIA FUTURA: Telemetria Real via WebSockets (LangGraph)

Este documento serve como memória institucional para a futura implementação da Opção B do Cockpit, quando decidirmos conectar a telemetria do LangGraph em tempo real.

## O Desafio
Atualmente, o terminal verde de telemetria ("TELEMETRY LOG") no Cockpit roda mensagens estáticas e simuladas. Para obtermos observabilidade real do que o LangGraph está executando (ex: LLM gerando código, ferramentas sendo chamadas), precisamos enviar esses logs do orquestrador Python para a interface React em tempo real.

## Proposta de Arquitetura (V2.0)

### 1. Backend (FastAPI / `main.py`)
- Criar um endpoint de WebSocket (ex: `ws://localhost:8124/ws/telemetry`).
- Implementar um Logger Handler customizado em Python. Sempre que o LangGraph ou o sistema emitir um `logger.info()`, esse handler captura a string e dá um `await websocket.send_json({"log": mensagem, "agent": nome_do_agente})`.

### 2. Frontend (React / `App.jsx`)
- Remover o array de `logs` estáticos.
- Implementar um hook `useWebSocket` que se conecta ao endpoint FastAPI.
- Sempre que receber um log novo, fazer um *append* no array de telemetria e dar *scroll* para baixo automaticamente (o `logRef.current?.scrollIntoView` já está configurado para isso!).

### 3. Integração com o AIOS-WORKSPACE
- Como fazer projetos de fora (ex: `telegram-electoral-agent`) enviarem seus logs para a porta `8124`?
- **Solução:** O backend do Cockpit pode rodar um Redis Pub/Sub leve, ou os projetos do Workspace podem ser configurados para enviar logs via UDP/HTTP POST para a porta `8124` se detectarem que a variável de ambiente `COCKPIT_ENABLED=true` está presente.

---
*Status: Aguardando momento oportuno para virar uma Spec Oficial (Trava SDD).*

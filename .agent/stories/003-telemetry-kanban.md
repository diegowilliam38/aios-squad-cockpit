# STORY-003: Sprint Kanban & Telemetry Terminal

## Contexto
O Cockpit não é apenas visual, mas precisa refletir o estado real (ou simulado) do backend. Para isso, o painel lateral (Right Panel) precisa conter um Kanban de tarefas e um Terminal de Logs em estilo retro.

## Critérios de Aceite

### 1. Painel Kanban (Sprint Kanban)
- [x] Deve exibir 3 colunas padrão: `A Fazer`, `Em Progresso`, e `Concluído`.
- [x] O estado de cada tarefa deve ditar sua cor de borda (ex: `Em Progresso` = cyan neon com animação pulsar).
- [x] Deve extrair os dados lendo o formato base (simulado ou real) que inclui Nome da Tarefa, Status e Agente Responsável.

### 2. Telemetry Terminal (Logs)
- [x] Painel escuro no rodapé da coluna direita para simular um console Hacker/Retro.
- [x] Deve conter sobreposição visual de Scanlines CRT (igual ao escritório).
- [x] Os logs injetados no sistema (`addLog()`) devem aparecer concatenados com um ícone de status ou prefixo.
- [x] O painel deve suportar Scroll-Y e overflow hidden para texto que exceda o tamanho vertical.

### 3. Sincronismo de Estados (Data Flow)
- [x] O loop central (App.jsx) que processa as tarefas ativas (`tasks.filter(t => t.status === "doing")`) deve emitir o evento visual para que os agentes caminhem (`WALK`) até suas mesas correspondentes e entrem no modo `TYPE`.

## Checklist de Implementação (@dev)
- [x] Componente / Estrutura HTML do `.right-panel`.
- [x] Mapeamento de Arrays de `tasks` para as colunas do `.kanban`.
- [x] Hook de estado para `logs` no terminal.
- [x] Lógica de transição condicional (Se agente == task ativo -> sentar na cadeira).

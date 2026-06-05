# STORY-002: Renderização do Mapa e Ambiente (Office Map)

## Contexto
O mapa do escritório é o palco principal do Cockpit. Ele deve prover o plano de fundo isométrico/top-down onde os agentes vão atuar.

## Critérios de Aceite

### 1. Sistema de Fundo (Background Image)
- [x] O cenário base deve ser composto por uma imagem estática (`office_map_rooms.png`) pré-renderizada para poupar ciclos de CPU/GPU do Virtual DOM.
- [x] A imagem de fundo deve ter renderização em pixels brutos (sem anti-aliasing) garantida pela propriedade CSS `image-rendering: pixelated`.
- [x] O cenário deve ser escurecido levemente (`filter: brightness(0.85)`) para contrastar e dar destaque aos agentes luminosos.

### 2. Filtro CRT Retro (Scanlines)
- [x] Uma camada `.office-map::after` deve ser criada utilizando `repeating-linear-gradient`.
- [x] O gradiente deve alternar pixels transparentes e linhas de `rgba(0,0,0,0.08)` a cada 2px para simular monitores de tubo CRT antigos.
- [x] O filtro deve obrigatoriamente possuir `pointer-events: none` para não bloquear os cliques (inspeção) nos agentes.

### 3. Matriz de Colisão e Navegação
- [x] A matriz oficial do chão caminhável corresponde às Colunas (X): `1` a `18` e Linhas (Y): `10` a `19`.
- [x] Os agentes devem ter as coordenadas absolutas multiplicadas por `16px` (tamanho exato do Tile na imagem de fundo) para gerar o valor em pixels na tela (`left` e `top`).

## Checklist de Implementação
- [x] Div container `.office-map`
- [x] CSS `repeating-linear-gradient` para CRT
- [x] Math.min/Math.max nas posições (X, Y) para limitar bounds.

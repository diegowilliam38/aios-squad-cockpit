# ADR-001: Frontend Architecture - AIOS Squad Cockpit

## Status
Aceito

## Contexto
O AIOS Squad Cockpit precisa renderizar um mapa 2D isométrico/top-down de um escritório, contendo 12 agentes simultâneos e animando seus ciclos de caminhada e trabalho baseados em spritesheets estilo retro/pixel-art.

## Decisão
Optamos por utilizar React com Vite para gerenciamento de estado e DOM virtual. 
- A renderização do mapa (paredes, chão, móveis) foi assada em um único background image estático (`office_map_rooms.png`) gerado via Python Script, o que remove qualquer complexidade de re-renderização do grid.
- Os agentes são componentes React posicionados usando Absolute Positioning (`left`/`top`) com transições de CSS interpoladas para movimento espacial fluído.
- A animação do sprite dos agentes (walking/typing) é delegada inteiramente ao CSS Animations usando `background-position` para trocar quadros dentro do spritesheet sem sobrecarregar a thread principal de Javascript. A largura base fixada em `SPRITE_W = 16px` foi corrigida na refatoração para garantir total alinhamento no CSS raster (`image-rendering: pixelated`).

## Consequências
- A lógica do motor é super leve, rodando a 60 FPS fáceis em navegadores.
- Não foi necessário adicionar biblioteca pesada de WebGL (como Phaser.js ou Three.js), tornando o código fácil de iterar e perfeitamente manutenível dentro dos padrões React e CSS Vanilla exigidos pelo Tech Lead.

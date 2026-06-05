# STORY-001: Implementação Visual dos Agentes (Sprite Engine)

## Status
Implementado / Revisado

## Descrição
Como um observador do Cockpit, eu quero ver os agentes do squad renderizados em 16-bits caminhando pelo mapa e sentando em suas mesas, para que eu possa acompanhar de forma lúdica quem está trabalhando no projeto atual.

## Critérios de Aceite (Passa/Falha)
- [x] O Sprite Engine deve suportar personagens do tamanho 16x32px (3 linhas: Down, Right, Up).
- [x] O CSS não pode interpolar entre quadros (obrigatório uso de marcações exatas de porcentagem nos keyframes para evitar bleeding horizontal).
- [x] Agentes devem andar de forma ortogonal (Up/Down/Left/Right).
- [x] Quando um agente andar para a esquerda, a linha Right (1) deve ser espelhada com `transform: scaleX(-1)`.
- [x] Ao receber uma tarefa ativa, o agente deve caminhar até sua mesa definida pelas variáveis `seatCol` e `seatRow`.
- [x] Ao chegar na mesa, a animação do agente deve alternar de Walk (Caminhada) para Type (Digitação/Trabalhando).

## Notas Técnicas (@dev / @architect)
Houve um desvio inicial da spec por um erro matemático na interpretação do tamanho da janela dos spritesheets (`SPRITE_W: 14` e `SPRITE_H: 24`). O erro foi completamente refatorado para as especificações rigorosas do Pixel Agents originais: `SPRITE_W: 16` e `SPRITE_H: 32` em um canvas CSS com Width de 112px.
A refatoração provou o benefício do TDD/Spec Driven: não é possível iterar o front-end sem alinhamento absoluto dos assets.

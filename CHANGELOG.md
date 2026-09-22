# Changelog

## v1.1.1 — correções de movimento e rotas

- Corrigido o padrão de velocidade dos novos inimigos: a última velocidade aplicada no Inspector passa a ser usada como velocidade padrão ao criar os próximos.
- Corrigido movimento em alta velocidade: inimigos guiados e patrulhas agora preservam o deslocamento restante ao cruzar nós/pontos da rota, evitando perda aparente de velocidade em loops rápidos.
- Corrigida a remoção de inimigos guiados: a linha/rota deixou de contar como ocupação de célula. Inimigos podem cruzar ou compartilhar trajetórias sem serem apagados ao editar objetos no caminho.
- Formato SAN Map permanece na versão 7; nenhuma fase antiga precisa ser convertida novamente.

## v1.1 — reorganização da base

- Reorganização do projeto em pastas de código-fonte.
- `index.html` mantido como ponto de entrada.
- CSS extraído para `styles/main.css`.
- Ícone movido para `assets/icons/`.
- Lógica de inimigos separada em `src/game/enemies.js`.
- Jogador, colisões e runtime separados.
- Ferramentas do editor, seleção, clipboard, viewport, templates e validação separados.
- Renderização isolada em `src/render/renderer.js`.
- Interface e Inspector separados da engine.
- Compatibilidade preservada com SAN Map v7.
- Novo namespace de armazenamento local da v1.1, com importação dos rascunhos antigos.

### Objetivo

Nenhuma mecânica nova é o foco desta versão. O trabalho da v1.1 é reduzir dívida técnica e preparar a base para as próximas etapas do editor.

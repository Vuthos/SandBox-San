# Changelog

## v1.1.6 — seleção por área e movimento em grupo

- Seleção retangular (marquee) de múltiplos objetos.
- Arrastar seleção inteira como um bloco.
- Ctrl/Shift+clique adiciona/remove itens da seleção.
- Seleção inclui paredes, inimigos, moedas, checkpoints, portais, chave/porta, botões, início e chegada.
- Snap de 1–32 px para inimigos/rotas; objetos de grade permanecem em 32 px.
- Setas do teclado movem a seleção; Shift acelera o deslocamento.
- Duplicar/copiar foi ampliado para os objetos selecionáveis compatíveis.

## v1.1.5 — runtime standalone

- Runtime JavaScript embutido no `index.html`.
- Corrigido o canvas vazio ao abrir somente o arquivo HTML fora da árvore completa do projeto.
- `index.html` agora não depende de `<script src>` externos para funcionar offline.
- Estrutura modular em `src/` continua preservada como código-fonte.

## v1.1.4 — correção visual e distribuição

- CSS principal embutido no `index.html` para evitar abertura sem estilos.
- Ícone embutido no `index.html` para evitar imagem quebrada quando o arquivo é aberto isoladamente.
- Estrutura modular continua preservada em `styles/`, `assets/` e `src/`.

## v1.1.3 — hardening e publicação modular

- Adicionado `src/core/security.js`.
- Importação recusa JSON acima de 2,5 MB e volume abusivo de objetos/rotas.
- `core/model.js` reconstrói explicitamente o esquema SAN Map e descarta campos desconhecidos.
- Números, IDs, coordenadas, velocidades e textos importados são normalizados.
- Templates deixaram de usar `innerHTML` para nomes controlados pelo usuário.
- Rascunhos, templates, criação, duplicação e rotas respeitam limites defensivos.
- Adicionado `SECURITY.md`.
- Repositório passa a publicar a árvore modular completa.
- Formato SAN Map permanece v7.

## v1.1.2 — correção do nome da fase

- Campo Nome da fase sincroniza em tempo real com `map.meta.name`.

## v1.1.1 — movimento e rotas

- Velocidade padrão, movimento em alta velocidade e rotas compartilhadas corrigidos.

## v1.1 — reorganização da base

- Código separado em `core`, `editor`, `game`, `render` e `ui`.

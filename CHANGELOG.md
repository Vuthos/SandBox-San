# Changelog

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

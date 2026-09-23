# Changelog

## v1.3.1 — correção de sincronização

- Todos os inimigos ativos são atualizados antes de processar o respawn por colisão.
- Remove a perda de um frame dos inimigos que vinham depois daquele que colidiu com o jogador.
- Patrulhas com mesma velocidade permanecem sincronizadas após mortes repetidas.

## v1.3.1 — sincronização de inimigos

- Todos os inimigos agora recebem o mesmo frame de atualização antes do respawn por colisão.
- Corrigido descompasso acumulado entre inimigos de mesma velocidade após mortes sucessivas.
- O respawn ocorre somente depois da atualização do conjunto de inimigos naquele frame.

## v1.3.0 — Cenários e Superfícies

- Cenário em xadrez: branco + cor hexadecimal personalizável.
- Piso de gelo com deslizamento leve.
- Piso de água com redução de velocidade.
- Setas de impulso para cima, baixo, esquerda e direita.
- Nova coleção compacta `floorTiles` com limite de segurança.
- Renderização do xadrez usa padrão em cache para evitar peso desnecessário.
- Compatibilidade mantida com SAN Map v7; mapas antigos continuam abrindo com fundo padrão.

## v1.2.2 — Security Hardening

- Catálogo aceita apenas links oficiais de `https://vuthos.github.io/SandBox-San/`.
- Limite aplicado durante a descompressão de fases compartilhadas.
- CSP adicionada ao editor e ao catálogo.
- GitHub Actions de Pages fixadas por commit SHA.
- `actions/checkout` atualizado para v5 e `upload-pages-artifact` para v4.
- Timeout de 10 minutos no job de deploy.

## v1.2.1 — acesso direto pelo GitHub Pages

- Link principal do README agora abre o editor publicado, sem download.
- Link direto para o catálogo da comunidade.
- Instruções de uso priorizam a versão online; o `index.html` standalone continua disponível para uso offline.

## v1.2.0 — SandBox Online Foundation

- Links jogáveis com fase compactada dentro da URL.
- Abertura automática de fase compartilhada por link.
- Painel **SandBox Online** no editor.
- Catálogo público em `community/`.
- Publicação comunitária assistida via GitHub Issues.
- Preparação de deploy via GitHub Pages.
- Validação e limites de segurança continuam sendo aplicados ao conteúdo compartilhado.
- Nova camada modular em `src/online/`.

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

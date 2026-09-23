# Arquitetura — SandBox v1.3.2

O SandBox separa autoria, simulação, renderização, segurança e distribuição. O formato **SAN Map v7** continua sendo o contrato de dados das fases.

## Camadas

- `core/`: configuração, segurança, DOM, modelo, estado, histórico e armazenamento local.
- `editor/`: ferramentas, seleção, clipboard, viewport, templates e validação.
- `game/`: colisões, inimigos, jogador, atualização determinística de frames e runtime.
- `render/`: desenho em Canvas, cenário xadrez e cache visual dos pisos especiais.
- `ui/`: ações globais e Inspector.
- `online/`: links SAN, publicação comunitária e integração com o catálogo.
- `community/`: catálogo público inicial.
- `scripts/`: automação de build do standalone.
- `tests/`: regressões automatizadas da simulação.

## Fonte de verdade

Os arquivos em `src/` e `styles/main.css` são a fonte de verdade do runtime e do visual. O `index.html` contém uma versão standalone para distribuição, mas é **gerado automaticamente** por `scripts/build-standalone.mjs`.

Fluxo:

```text
src/ + styles/main.css
        ↓
npm run build
        ↓
index.html standalone
        ↓
GitHub Pages
```

O workflow de Pages executa testes e o build antes do deploy. A CI regenera e valida sintaticamente o standalone a partir das fontes antes do merge.

## Pisos especiais

`floorTiles` continua sendo uma coleção compacta no SAN Map. Em runtime, `floorTileIndex` cria um índice por chave `c,r`, evitando busca linear a cada frame. A camada visual dos pisos usa um canvas auxiliar em cache e só é reconstruída quando `floorVisualRevision` muda.

Isso mantém o arquivo serializado simples sem sacrificar lookup e renderização no runtime.

## Histórico de pintura

Durante um gesto de pintura, as células mudam visualmente em tempo real, mas `commit()` é chamado apenas no fim do gesto. Assim uma pincelada longa corresponde a uma única ação de undo/redo.

## Determinismo

A atualização dos inimigos é centralizada em `game/tick.js`. Todos os inimigos ativos recebem o mesmo `dt` antes de um respawn causado por colisão. Testes automatizados cobrem esse comportamento e verificam que patrulhas idênticas permanecem sincronizadas.

## Segurança

Toda entrada externa deve passar pela fronteira de segurança e pela normalização do modelo. Toda mecânica que possa crescer em quantidade precisa de limite explícito. A camada online continua sem segredos embutidos no frontend.

## Evolução comercial

GitHub Pages e GitHub Issues continuam adequados para o beta de baixo custo. Contas, rankings persistentes, monetização, moderação em escala e dados privados exigirão infraestrutura própria. Veja `docs/COMMERCIAL-READINESS.md`.

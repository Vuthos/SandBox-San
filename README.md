# Editor de Mapas San — v1.1.1

A v1.1.1 mantém a reorganização arquitetural da v1.1 e adiciona correções de estabilidade em velocidade e rotas. O objetivo desta versão é consolidar a base de código antes de adicionar novas mecânicas.

A interface continua partindo de `index.html`, mas a lógica deixou de ficar concentrada em um único arquivo. O projeto agora separa modelo, editor, jogo, renderização e interface em pastas próprias.

## Estrutura

```text
Editor_de_Mapas_San_v1.1/
├── index.html
├── assets/
│   └── icons/
│       └── san-icon.png
├── styles/
│   └── main.css
├── src/
│   ├── app.js
│   ├── core/
│   │   ├── config.js
│   │   ├── dom.js
│   │   ├── history.js
│   │   ├── model.js
│   │   ├── state.js
│   │   └── storage.js
│   ├── editor/
│   │   ├── clipboard.js
│   │   ├── selection.js
│   │   ├── templates.js
│   │   ├── tools.js
│   │   ├── validation.js
│   │   └── viewport.js
│   ├── game/
│   │   ├── collision.js
│   │   ├── enemies.js
│   │   ├── player.js
│   │   └── runtime.js
│   ├── render/
│   │   └── renderer.js
│   └── ui/
│       ├── actions.js
│       └── inspector.js
└── docs/
    └── ARCHITECTURE.md
```

## O que cada área faz

- `core/`: estado, modelo do mapa, histórico, armazenamento e referências principais.
- `editor/`: ferramentas de criação, seleção, copiar/colar, zoom/pan, templates e validação.
- `game/`: regras executadas durante o teste da fase: jogador, inimigos, colisões e loop.
- `render/`: desenho do mapa e dos objetos no Canvas.
- `ui/`: botões e Inspector.
- `app.js`: inicialização final da aplicação.

## Versão do editor x versão do mapa

O aplicativo foi reorganizado como **v1.1**, mas o formato de arquivo continua sendo **SAN Map v7** para preservar compatibilidade com mapas criados anteriormente.

A v1.1 consegue importar rascunhos das versões v5, v6 e v7 e passa a salvar seu próprio rascunho local.

## Executar

Abra `index.html` em um navegador moderno. Para desenvolvimento no GitHub Pages ou em servidor local, basta publicar a pasta mantendo a mesma estrutura.

Não existe etapa de build nem dependência externa nesta versão.

## Filosofia da v1.1

Esta versão não existe para adicionar mais conteúdo. Ela existe para tornar o projeto mais fácil de ler, manter, testar e expandir. A próxima mecânica deve entrar em um módulo adequado em vez de aumentar um único arquivo monolítico.

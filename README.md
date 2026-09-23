# SandBox / Editor de Mapas San — v1.3.2

**▶ [Abrir o Editor Online](https://vuthos.github.io/SandBox-San/)**  
**🌐 [Explorar fases da comunidade](https://vuthos.github.io/SandBox-San/community/)**

> Para usar o SandBox, não é necessário baixar o `index.html`. O link acima abre diretamente a versão publicada pelo GitHub Pages.

Editor visual de fases 2D em HTML5 Canvas. A v1.3.2 consolida a base para crescimento comercial: otimiza pisos especiais, adiciona testes automatizados e passa a gerar o standalone a partir do código modular.

## Estrutura

```text
SandBox-San/
├── index.html
├── assets/icons/san-icon.png
├── styles/main.css
├── src/
│   ├── core/
│   ├── editor/
│   ├── game/
│   ├── render/
│   └── ui/
├── docs/ARCHITECTURE.md
└── SECURITY.md
```

## Hardening da v1.1.3

- limite de tamanho para JSON importado;
- limites de objetos e pontos de rota;
- reconstrução explícita do esquema SAN Map;
- normalização de números, IDs, coordenadas, velocidades e textos;
- templates renderizados com APIs DOM seguras (`textContent`), sem `innerHTML`;
- rascunhos e templates locais passam pelos mesmos limites defensivos.

Leia `SECURITY.md` para os limites atuais.

## Executar

### Online — recomendado
Acesse **https://vuthos.github.io/SandBox-San/**. O editor abre direto no navegador pelo GitHub Pages, sem download.

### Offline
Se quiser usar sem internet, aí sim baixe o projeto ou o `index.html` standalone e abra em um navegador moderno. Não há etapa de build nem dependência externa.

## Filosofia

A série v1.1.x prioriza estabilidade, segurança e manutenção antes de novas mecânicas.


## v1.1.4

O CSS principal e o ícone também ficam embutidos no `index.html`, então o visual continua carregando mesmo quando o HTML é aberto isoladamente. A árvore modular permanece disponível em `styles/`, `assets/` e `src/`.

## v1.1.5

O `index.html` agora é totalmente standalone: CSS, ícone e runtime JavaScript ficam embutidos. As pastas modulares continuam no repositório como código-fonte, mas abrir somente o `index.html` localmente já carrega o editor completo.

## v1.1.6

A ferramenta **Selecionar / editar** agora permite demarcar uma área para seleção múltipla e arrastar a seleção como um bloco. Ctrl/Shift+clique ajusta a seleção. Inimigos e rotas podem usar snap de movimento de 1–32 px; objetos presos à grade mantêm snap de 32 px para preservar o formato SAN Map v7.

## 🌐 SandBox Online — v1.2.0

A primeira camada comunitária está em `src/online/`. O editor pode gerar links jogáveis contendo uma cópia compactada da fase, abrir mapas recebidos por URL e encaminhar fases para um catálogo público em `community/`. Nesta etapa, o catálogo usa GitHub Issues como armazenamento público e moderável; contas próprias e backend dedicado ficam para uma etapa posterior.

Veja `docs/ONLINE.md` para arquitetura, limites e segurança.

## 🔒 v1.2.2 — Security Hardening

A camada online agora restringe links comunitários ao Pages oficial, limita a descompressão de mapas compartilhados, aplica CSP e fixa as GitHub Actions de deploy por SHA imutável. Consulte `SECURITY.md`.

## 🎨 v1.3.0 — Cenários e Superfícies

- fundo em xadrez com branco + uma cor hexadecimal escolhida pelo criador;
- piso de gelo com inércia leve;
- piso de água que reduz a velocidade;
- blocos de seta nas quatro direções para impulsionar o jogador;
- superfícies usam uma única coleção `floorTiles`, mantendo o modelo simples;
- fundo visual não cria milhares de objetos: ele é renderizado como padrão repetido.


## ⚙️ v1.3.2 — Product Foundation

- lookup de pisos especiais por célula em tempo constante com índice `Map`;
- camada visual de pisos renderizada em cache e reconstruída apenas quando muda;
- pincel de pisos gera um único item de histórico por gesto;
- testes automatizados de determinismo e regressão da sincronização de inimigos;
- `index.html` standalone gerado automaticamente a partir de `src/` e `styles/main.css`;
- CI executa testes e regenera/valida o standalone antes do merge;
- deploy do GitHub Pages testa e gera o standalone antes de publicar.

### Desenvolvimento

`npm test` executa a suíte de regressão.  
`npm run build` regenera o standalone.  
`npm run check` executa testes + geração/validação do standalone.

A política de licenciamento comercial ainda deve ser escolhida conscientemente antes de um lançamento maior; o projeto continua sem arquivo `LICENSE` nesta etapa.

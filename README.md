# SandBox / Editor de Mapas San — v1.2.1

**▶ [Abrir o Editor Online](https://vuthos.github.io/SandBox-San/)**  
**🌐 [Explorar fases da comunidade](https://vuthos.github.io/SandBox-San/community/)**

> Para usar o SandBox, não é necessário baixar o `index.html`. O link acima abre diretamente a versão publicada pelo GitHub Pages.

Editor visual de fases 2D em HTML5 Canvas. A v1.2.1 mantém a primeira camada comunitária online e melhora o acesso direto pelo GitHub Pages sem abandonar o formato **SAN Map v7**, o modo standalone e o hardening de mapas JSON.

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

# SandBox / Editor de Mapas San — v1.1.3

Editor visual de fases 2D em HTML5 Canvas. A v1.1.3 adiciona hardening para tratar mapas JSON de terceiros como entrada não confiável, mantendo o formato **SAN Map v7**.

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

Abra `index.html` em um navegador moderno ou publique a raiz no GitHub Pages. Não há etapa de build nem dependência externa.

## Filosofia

A série v1.1.x prioriza estabilidade, segurança e manutenção antes de novas mecânicas.

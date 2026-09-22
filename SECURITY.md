# Segurança do SandBox Editor

A versão offline não possui backend, autenticação, banco remoto, tokens ou execução de código recebido por mapa. O principal risco atual é abrir JSON de terceiros com conteúdo inesperado ou volume suficiente para travar o navegador.

## Proteções da v1.1.3

- JSON importado: máximo de 2,5 MB.
- Nome de fase/template: máximo de 80 caracteres.
- Máximo de 500 inimigos.
- Máximo de 512 pontos por rota e 10.000 pontos de rota no total.
- Máximo de 12.000 objetos lógicos.
- Velocidades normalizadas para 1–1000 px/s.
- Grade limitada a 10–120 colunas e 8–80 linhas.
- Coordenadas convertidas para números finitos e ajustadas ao Canvas.
- IDs duplicados recebem novo valor interno.
- Campos desconhecidos do JSON são descartados.
- Templates usam `textContent`, sem `innerHTML`.
- Rascunhos/templates do `localStorage` passam pelos mesmos limites.

Uma futura versão online precisará também de validação no servidor, autenticação, autorização, rate limiting e moderação.

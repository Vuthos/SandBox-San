# SandBox Online — v1.3.2

A v1.3.0 preserva a camada comunitária do SandBox e passa a compartilhar também os novos cenários e pisos por meio do mesmo payload SAN Map.

## O que funciona

- O editor gera um link que carrega uma cópia compactada da fase.
- Quem recebe o link pode abrir a fase no navegador e testá-la.
- O botão **Enviar à comunidade** abre um issue pré-preenchido no repositório.
- A página `community/` lê os envios públicos pela API pública do GitHub e monta um catálogo.
- O catálogo trata dados comunitários como texto, sem injetar HTML enviado por usuários.

## Limites desta primeira camada

O GitHub Issues funciona como catálogo moderável, não como banco de dados definitivo. Para enviar ao catálogo, o criador precisa concluir a publicação pelo GitHub. A API pública também tem limites de requisição.

Contas próprias do SandBox, IDs curtos, favoritos, estatísticas globais, recordes e publicação sem GitHub ficam reservados para uma futura camada com backend dedicado.

## Segurança

Links compartilhados passam por `assertMapInputLimits`, parsing limitado e `normalizeMap` antes de entrar no editor. O catálogo exige o marcador `SAN-COMMUNITY-LEVEL` e um link contendo payload SAN.

## GitHub Pages

O workflow em `.github/workflows/pages.yml` prepara deploy por GitHub Pages. Nas configurações do repositório, Pages deve usar **GitHub Actions** como fonte.

URL planejada:

`https://vuthos.github.io/SandBox-San/`

## Hardening da v1.2.2

A URL de uma fase pública precisa pertencer ao Pages oficial do projeto. O payload compartilhado também é limitado enquanto é descompactado, antes do parsing do JSON. O deploy usa dependências do GitHub Actions fixadas por SHA.


## Pipeline da v1.3.2

Antes de publicar no GitHub Pages, o workflow executa a suíte automatizada e regenera o `index.html` standalone a partir dos módulos. A camada online, o catálogo e o formato SAN Map permanecem compatíveis com a v1.3.x.

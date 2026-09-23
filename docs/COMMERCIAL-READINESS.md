# Preparação comercial do SandBox

A v1.3.2 trata o SandBox como um produto em formação, não apenas como um protótipo. Este documento separa o que já existe do que precisa ser decidido antes de uma operação comercial maior.

## Já existe

- editor e runtime próprios;
- formato SAN Map com validação e limites;
- compartilhamento por link;
- catálogo comunitário inicial;
- GitHub Pages para distribuição beta;
- hardening do frontend;
- testes automatizados de regressão da física;
- geração automática do standalone a partir do código modular.

## Antes de monetizar em escala

1. Definir conscientemente a política de licenciamento do código. O repositório não possui arquivo LICENSE nesta etapa.
2. Registrar domínio próprio e mover a experiência comercial principal para hospedagem apropriada.
3. Criar Termos de Uso e Política de Privacidade adequados ao funcionamento real do produto.
4. Se houver anúncios ou analytics, implementar consentimento e tratamento de dados compatíveis com as regiões atendidas.
5. Definir regras para conteúdo criado por usuários, denúncia, remoção e reincidência.
6. Se houver contas, recordes ou pagamentos, usar backend com autenticação, autorização, validação no servidor, rate limiting e logs.
7. Revisar nome, identidade visual, artes, sons e outros ativos antes de uma campanha comercial ampla.
8. Manter backups e um processo de releases/rollback.

## Princípio de produto

O GitHub continua adequado para código, CI/CD, releases e documentação. Ele não deve ser tratado como banco de dados definitivo para uma comunidade grande. A camada de GitHub Issues da v1.2/v1.3 é uma ponte de baixo custo até existir necessidade real de backend próprio.

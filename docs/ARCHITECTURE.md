# Arquitetura — SandBox v1.1.3

`index.html` carrega módulos por responsabilidade. Entradas JSON, caixa avançada e dados do armazenamento local passam por `core/security.js` antes de chegar ao modelo. `core/model.js` reconstrói apenas os campos reconhecidos pelo SAN Map.

## Responsabilidades

- `core/`: segurança, modelo, estado, histórico e armazenamento.
- `editor/`: criação, seleção, clipboard, viewport, templates e validação.
- `game/`: jogador, inimigos, colisões e runtime.
- `render/`: desenho em Canvas.
- `ui/`: ações globais e Inspector.

Toda nova entrada externa deve passar pela fronteira de segurança. Toda mecânica que possa crescer em quantidade deve ter limites explícitos.

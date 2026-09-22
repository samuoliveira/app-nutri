# White-label

## O que muda entre marcas

Cor, tipografia (Figtree × Lexend), raios, forma do botão (arredondado × pílula),
cor do gráfico, nome comercial, nome do assistente, ícone e bundle id.

## O que nunca muda

Telas, regras de negócio, contratos de API, navegação e chaves de query.

## Como isso é garantido

- `core/designsystem/brands/<marca>` é o único lugar com literal de marca.
- `theme` chega às telas por `useTheme()`; nenhuma tela lê `brandId`.
- `src/architecture.test.ts` falha se "Tecsa" ou "Vitta" aparecer fora de
  `brands/`, e `tools/rules.mjs` barra cor literal em feature.
- A marca é estado de sessão (`core/state/brand-store`, persistido): trocar em
  runtime pela tela Mais reestiliza o app inteiro, header incluído.

## Marca nova: o passo a passo

1. Copiar `brands/tecsa` para `brands/<nova>` e trocar paleta, forma e fontes.
2. Registrar em `brands/index.ts`.
3. Rodar `npm test` — `screen-options` já cobre header com a marca nova.
4. Ícone e bundle id entram no perfil de build, não no código.

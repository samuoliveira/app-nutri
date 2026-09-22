# tecsa-nutri

App do nutricionista, white-label (Tecsa / Vitta). React Native + Expo, TypeScript.

O padrão de código não mora aqui: mora em `tools/rules.mjs`, que é executável, e
em `src/architecture.test.ts`, que roda no CI. Este arquivo só tem o que nenhum
checker consegue cobrar.

## Proibido
- Acoplar marca ao core. Cor, fonte, forma, nome comercial e nome do assistente
  saem de `theme` — nunca de literal na tela.
- Regra de negócio dentro de componente: conta, classificação e decisão moram em
  `feature/<nome>/domain/`.
- Chave de LLM no bundle. A IA é chamada pelo backend; o app manda perfil
  anonimizado (`feature/insight/domain/anonymize-patient`).
- `git add -A` / `git add .` — barrado por `tools/git-add-guard.mjs`.

## Como o padrão chega até você
- `tools/agent-guard.mjs` roda a cada Write/Edit (hook `PostToolUse`) e devolve
  as violações do arquivo que você acabou de escrever. Conserte na hora.
- O que ele marca como DÍVIDA (arquivo gordo, useEffect antigo) não é seu
  problema se você só passou pelo arquivo.

## Comandos que definem o padrão
| comando | quando |
|---|---|
| `npm run new:screen <feature>/<Nome>` | tela nova — nunca monte a estrutura à mão |
| `npm run new:usecase <feature>/<nome>` | regra nova (use case + teste) |
| `npm run check:code <arquivo...>` | antes de fechar trabalho (`--staged`, `--all`, `--all --debt`) |
| `npm run check:keys` | invalidação de query sem chave registrada |
| `npm run check:arch` | fronteiras entre camadas e features |
| `npm test` · `npm run typecheck` | sempre, antes de dizer que terminou |

O que o checker não pega, não é regra. Caso legítimo se justifica com o escape
na linha acima (`// style-ok:`, `// cor-ok:`, `// any-ok:`, `// platform-ok:`,
`// useEffect-ok:`, `// key-externa-ok:`, `// fetch-ok:`, `// lista-ok:`) e um
motivo real. Mudou o padrão? Muda em `tools/rules.mjs`, não em prosa.

## Estrutura (resumo; o mapa completo está em AGENTS.md)
- Pasta é o nome do componente; o arquivo é `index.tsx`; a tipagem é `types.ts`
  ao lado. Isso vale também para módulo de lógica (`index.ts` + `types.ts`).
- Feature é fatia vertical: `domain/`, `data/`, `presentation/` e as duas portas
  públicas — `index.ts` (tudo) e `domain/index.ts` (só regra pura).
- Import entre pastas usa `@/`. Relativo só dentro da própria pasta.

## Git
- Branch (`fix/`, `feat/`) a partir da `main` atualizada com o remoto.
- `git push` só quando solicitado, sempre em primeiro plano.

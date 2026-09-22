# tecsa-nutri — contexto global

App móvel do nutricionista, multimarca (Tecsa e Vitta na mesma base).
React Native + Expo, TypeScript. Backend e Docker ficam fora deste repositório
por enquanto: o app fala com um transporte simulado em `core/network`, com a
mesma forma da API que o backend vai expor.

## Meta do produto

    APP NATIVO DE VERDADE → MESMO CORE PARA QUALQUER MARCA → OPERÁVEL SEM RELEASE

"Operável sem release" é o que flag remota, kill switch e OTA compram: dá para
desligar a IA, esconder uma aba e corrigir JS sem esperar revisão de loja.

## Regra de dependência

Antes de instalar biblioteca para navegação, estado, animação, storage ou UI:
verificar se a plataforma (React Native + Expo SDK) já entrega a capacidade.
Se entrega, usar a API padrão. Biblioteca entra quando resolve um problema que
a plataforma não resolve — e entra confinada numa pasta de `core/`.

## Onde está o padrão

`tools/rules.mjs` (executável) + `src/architecture.test.ts` (fronteiras) +
`CLAUDE.md` e `AGENTS.md`. Esta pasta `.ai/` descreve EXPERIÊNCIA e ESTRATÉGIA,
não substitui os checkers.

## Docs por tema (carregar só o relevante)

- `.ai/STANDARDS.md` — regras transversais de implementação
- `.ai/docs/native-experience.md` — o que faz o app parecer nativo
- `.ai/docs/white-label.md` — o que muda e o que nunca muda entre marcas
- `.ai/docs/offline-sync.md` — cache, banco local e update otimista
- `.ai/docs/platform-release.md` — flags, kill switch, OTA e biometria
- `.ai/docs/ai-product.md` — o que a IA recebe, devolve e quando ela cala

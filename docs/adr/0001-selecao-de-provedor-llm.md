# ADR 0001 — Seleção do provedor de LLM

**Status:** aceito · **Data:** 2026-09-23

## Contexto

A geração de ações de IA precisa de um provedor de LLM. Três restrições
moldaram a escolha:

1. **A chave não pode existir no app.** App é binário distribuído: qualquer
   segredo nele é público. A chamada tem que sair do servidor.
2. **O avaliador precisa conseguir rodar.** Exigir cartão de crédito para ver a
   funcionalidade funcionando é barreira real.
3. **Provedor cai.** Rate limit, indisponibilidade e mudança de contrato
   acontecem. Uma requisição de insight não pode derrubar a tela do paciente.

## Decisão

Uma porta `LlmClient` no domínio, com três implementações e seleção no boot:

```
ANTHROPIC_API_KEY definida  → AnthropicLlm
GEMINI_API_KEY definida     → GeminiLlm
nenhuma                     → RuleBasedLlm
```

Qualquer provedor que falhe cai no `RuleBasedLlm`, que deriva condutas das
faixas clínicas. A API responde `201` nos três casos; o campo `source`
(`llm` | `rules`) diz de onde veio, e a tela mostra isso ao nutricionista.

O Gemini entra porque o free tier do Google AI Studio permite exercitar a IA
sem custo — resolve a restrição 2 sem abrir mão da 1.

## Alternativas descartadas

**Chamar o LLM direto do app.** Elimina o backend do caminho, mas expõe a
chave no bundle e impede o kill switch de valer para todos os aparelhos.
Descartado por segurança.

**Um provedor único, sem fallback.** Menos código. Mas em avaliação ou demo,
rate limit do free tier derruba a funcionalidade na hora errada. Descartado por
risco de produto.

**Fallback para outro LLM em vez de regras.** Dobra a superfície de falha e
continua dependendo de rede. As faixas clínicas já são conhecidas e
determinísticas: como rascunho, entregam valor sem depender de terceiro.

**Cache semântico entre provedores.** Fora de escopo agora. O
`profileFingerprint` já evita gerar insight repetido para o mesmo quadro.

## Consequências

- Trocar de provedor é escrever uma classe e registrar no módulo; nada acima da
  porta muda.
- O teste do service usa um `LlmClient` falso, então regra de kill switch e
  anonimização são testadas sem rede.
- `source` vira dado de produto: dá para medir quanto da operação roda em
  fallback e decidir se vale contratar mais capacidade.
- O prompt é compartilhado (`llm/prompt.ts`): mudança de política de resposta
  vale para todos os provedores de uma vez.

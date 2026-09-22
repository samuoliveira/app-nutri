# Standards de implementação

## Ordem de decisão (sempre)

1. Capacidade da plataforma (RN / Expo SDK)
2. Componente do design system (`core/designsystem/native`)
3. Componente novo no design system
4. Biblioteca — confinada numa pasta de `core/`, com justificativa no PR
5. Workaround por plataforma — só em `.ios.tsx` / `.android.tsx`, com comentário
   dizendo qual limitação, em qual versão, e quando pode sair

## Proibido

- Cor, fonte, raio ou nome comercial literal fora de `designsystem/brands`.
- Regra de negócio dentro de componente ou de hook de tela.
- Lista longa sem virtualização.
- Tela vazia ou botão sem resposta quando falta capacidade ou dado.
- Comunicar estado só por cor (atenção sempre tem rótulo em texto).
- Duplicar componente (`XMobile`, `XV2`, `XNew`) em vez de reutilizar.
- Animação puramente estética: toda animação melhora compreensão ou percepção
  de resposta.

## Obrigatório

- Alvo de toque >= 44x44 pt (`MIN_TOUCH_TARGET`).
- Os quatro estados em toda tela: carregando (skeleton com a silhueta real),
  vazio (com saída), erro (com retry quando faz sentido) e sucesso.
- `accessibilityRole`, `accessibilityLabel` e `accessibilityState` em controle
  sem texto; ordem de foco previsível.
- Área segura por `Screen`; nenhuma tela lê insets sozinha.
- Lógica pura fora do componente (`avatarInitials`, `progressClamp`,
  `sparklinePath`, `*-format`), para testar sem render.
- Pasta com o nome do componente, `index.tsx` e `types.ts` ao lado.

## Antes de fechar qualquer fase

1. `npm run typecheck`
2. `npm test`
3. `npm run check:code -- --all`
4. `npm run check:keys`
5. rodar nos dois simuladores (iOS e Android) e olhar a tela
6. atualizar a doc `.ai/` correspondente

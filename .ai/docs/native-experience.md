# Experiência nativa

O alvo é um app que um usuário de iPhone e um de Android reconheçam como
app da plataforma dele — não uma tela web dentro de um shell.

## O que compramos com isso

- **Barra de abas flutuante em vidro**: `GlassSurface` usa `expo-blur` no iOS
  (é o material do sistema) e superfície opaca com elevação no Android, que é o
  que o Material entrega de verdade. Não existe blur falso no Android.
- **Pilha nativa**: `@react-navigation/native-stack` monta `UINavigationController`
  e `Fragment` de verdade — gesto de voltar, transição e header são do sistema.
- **Large title**: declarado por `useScreenHeader({ largeTitle: true })`, traduzido
  em `screen-options`. Recolher no scroll é trabalho do sistema, não nosso.
- **Haptics**: toque em aba, troca de filtro e fixar paciente. Feedback curto,
  nunca decorativo.
- **Ações rápidas**: o botão gira o `+` em `×` com mola; os atalhos apontam só
  para o que já existe no app.

## Divergência entre plataformas

Vive em arquivo `.ios.tsx` / `.android.tsx`, nunca em `if (Platform.OS === …)`
espalhado pela tela — `tools/rules.mjs` barra isso na feature. Arquivo-ponte só
reexporta: lógica pura vai em módulo próprio, porque Metro e jest resolvem
direto para a variante da plataforma.

## O que o simulador prova e o teste não

Render nativo não é testável em jest. A prova de layout, blur, header e gesto é
captura no simulador — e ela não substitui o teste da lógica por trás.

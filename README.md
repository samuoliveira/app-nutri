# tecsa-nutri

App do nutricionista: **core único, white-label**, atendendo duas marcas do grupo
(Tecsa e Vitta) a partir da mesma base. Sobre esse core, uma fatia vertical —
carteira de pacientes, ficha com biomarcadores e ações geradas por IA.

React Native + Expo (TypeScript) no mobile, NestJS + PostgreSQL no backend.

---

## Subir o projeto

```bash
# 1. backend + banco (API em http://localhost:9000)
cd backend
docker compose up --build
docker compose exec backend npm run seed     # 120 pacientes + agenda do dia

# 2. app
cd ..
npm install
cp .env.example .env        # iOS: localhost · Android: 10.0.2.2
npx expo prebuild           # gera ios/ e android/
npm run ios                 # ou npm run android
```

Sem `EXPO_PUBLIC_API_URL` o app roda num catálogo simulado de 2.000 pacientes —
mesmo binário, sem backend. Com a variável, fala com a API.

Verificação rápida: **120 pacientes com id UUID** = veio do Postgres;
**2.000 com id `p-N`** = catálogo simulado.

---

## Decisões e defesa

### Marca é dado, não código

`core/designsystem/brands/<marca>` declara paleta, tipografia, forma, nome
comercial e nome do assistente. `ThemeProvider` resolve a marca ativa e
`useTheme()` é a única porta de cor e fonte. Trocar de marca em runtime muda
cor, fonte, raio e textos sem tocar em tela, regra ou API.

Isso não depende de disciplina: `src/architecture.test.ts` **falha o build** se
o nome de uma marca aparecer fora de `brands/`.

### Estado: quatro tecnologias, papéis fixos

| dado | dono | por quê |
|---|---|---|
| resposta do servidor | TanStack Query | cache com prazo, revalidação e retry num lugar só |
| carteira e fichas abertas | SQLite | abre offline, sobrevive ao app fechado (7 dias) |
| filtro, busca, marca | Zustand | intenção do usuário agora, não é dado de servidor |
| flags remotas | Query com refetch de 1 min | kill switch precisa propagar sem release |

Escolhi **não** usar Redux: não há estado global compartilhado o bastante para
pagar o boilerplate. O que parecia global (carteira) é cache de servidor, e
cache de servidor é problema do Query.

Tela com mutação usa **ViewModel** — classe com `subscribe`/`getSnapshot`,
ligada ao React por `useSyncExternalStore`. Não é React, então testa sem
renderizar tela. Tela de leitura pura usa `useQueries` + `toUiState`.

### Navegação

Tab controller na raiz, pilha nativa por cima (`react-navigation`). **Nenhuma
feature importa a biblioteca**: a tela pede destino ao `useCoordinator()`
(`coordinator.showPatientDetail(id)`) e declara header por `useScreenHeader`.
Os destinos são um union tipado. Trocar de biblioteca mexe numa pasta só — e o
teste de arquitetura trava quem tentar importar direto.

### Camada de API tipada

`core/network/api` fala HTTP de um lado e devolve **modelo de domínio** do
outro. `core/network/http-client` é o único `fetch` do app e traduz a resposta
antes de cruzar a fronteira:

| HTTP | vira | efeito na tela |
|---|---|---|
| 404 | `not-found` | estado vazio |
| 400 · 422 | `invalid-input` | erro sem retry |
| 503 | `feature-disabled` | IA indisponível (kill switch) |
| `AbortError` | `timeout` | erro com retry |
| `TypeError` | `offline` | modo offline, cache local assume |

Vocabulário também é traduzido: `weight|glucose|pressure` do backend viram
`peso|glicemia|pressao` do domínio.

### OTA: por que expo-updates

O projeto já é Expo com prebuild, então `expo-updates` usa o mesmo runtime,
canal e política de versão que o build já tem — sem servidor próprio de bundle
e sem SDK extra. CodePush exigiria conta e pipeline paralelos para o mesmo
resultado. `runtimeVersion` por `appVersion`: correção de JS sai sem loja,
mudança nativa continua exigindo release.

### Capacidade nativa

Biometria (`expo-local-authentication`): trava no cold start e depois de 1 min
em segundo plano, via `AppState`. Sem digital cadastrada cai no código do
aparelho — nunca deixa o app inacessível.

### Offline e update otimista

Carteira em SQLite + cache do Query persistido por 7 dias. Fixar paciente
escreve no banco local na hora; se o servidor recusar (4xx), o banco local e o
ViewModel voltam ao estado anterior; se a rede cair (offline, timeout, 5xx), a
mutação vai para `pending_mutation`. A fila é reenviada em ordem ao abrir o
app, ao reconectar e ao voltar do background (`usePendingSync`); recusa no
reenvio desfaz o local e sai da fila. Conflito é "vence a última escrita" —
sem versão por registro, escolha consciente para o MVP.
IA exige conexão e **não** enfileira — rascunho clínico velho é pior que ausente.

### Backend em camadas

```
Controller   valida entrada (DTO + class-validator), traduz para HTTP
    ↓
Service      regra de negócio, orquestração e LLM
    ↓
Repository   TypeORM. Nenhuma regra aqui.
```

Regra pura (classificação clínica, IMC, janela do dia) vive fora das três, em
funções sem dependência — testável sem banco.

A chave do LLM **só existe no servidor**. O service checa a flag `ai_insights`
(kill switch: responde `503` sem tocar no provedor), anonimiza o perfil e chama
a porta `LlmClient`. Com `ANTHROPIC_API_KEY` injeta `AnthropicLlm`; sem chave,
`RuleBasedLlm` determinístico. A API funciona nos dois modos — e se o provedor
falhar, cai no fallback em vez de derrubar a requisição.

---

## Testes

```bash
npm test && npm run typecheck        # app: 41 testes
npm run check:arch                   # fronteiras entre camadas
npm run check:code --all             # padrão de código
npm run check:keys                   # chaves de query registradas

cd backend && npm test && npm run test:cov   # 35 testes, 94,8% dos services
```

O teste de arquitetura lê o código-fonte e falha quando uma fronteira é
cruzada: domínio isolado, feature só pela porta pública, core sem depender de
feature, `@react-navigation` confinado, marca fora do core, chave de query
centralizada.

Arquitetura completa: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) ·
API: [`backend/README.md`](backend/README.md)

---

## Relatório de uso de IA

### No produto

A IA gera **rascunho** de conduta a partir dos biomarcadores do paciente. Três
decisões de produto moldaram a implementação:

1. **O paciente nunca é identificado.** `insights/llm/anonymous-profile.ts` é o
   único caminho de saída: idade, sexo, IMC e medições — sem nome, sem id. Um
   teste falha se o payload contiver nome ou identificador.
2. **Rascunho, nunca laudo.** O prompt proíbe diagnóstico e limita a 3 condutas.
   A resposta chega marcada com a origem (`llm` ou `rules`) e a tela mostra isso
   — o nutricionista precisa saber o que está lendo.
3. **Kill switch de verdade.** Com `ai_insights` desligada o use case não chega
   a bater no serviço. Propagação máxima de 1 minuto, sem release.

Degradação: sem chave, ou com o provedor fora, o insight vem de regras clínicas
determinísticas. A tela não muda; só o selo de origem.

### No desenvolvimento

O projeto foi construído com assistência de IA (Claude), com três regras:

- **O padrão é executável, não prosa.** `tools/rules.mjs` e
  `src/architecture.test.ts` cobram as fronteiras a cada Write/Edit e no CI.
  Sugestão que viola a regra falha na hora, sem depender de revisão humana.
- **Nada entra sem verificação.** Cada etapa fechou com `typecheck`, testes e
  checkers. O backend foi exercitado por `curl` contra o Postgres real — foi
  assim que apareceram dois bugs que os testes unitários não pegavam: query
  param chegando como string e relação `@ManyToOne` sem `@JoinColumn`, que
  deixava o nome do paciente vazio na agenda.
- **Decisão de arquitetura é humana.** A IA propôs e implementou; a escolha de
  Query + Zustand + SQLite, do ViewModel sem React e do coordinator de navegação
  está defendida acima e travada por teste.

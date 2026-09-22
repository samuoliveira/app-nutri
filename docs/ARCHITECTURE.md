# Arquitetura do tecsa-nutri

App React Native (Expo, TypeScript) de acompanhamento nutricional, white-label
entre as marcas **Tecsa** e **Vitta**.

Este documento explica *por que* o código está organizado assim e como navegar
nele. A fonte de verdade normativa continua sendo [`AGENTS.md`](../AGENTS.md)
(mapa canônico), [`CLAUDE.md`](../CLAUDE.md) (o que nenhum checker cobra) e,
acima de prosa, o código executável: `tools/rules.mjs` e
`src/architecture.test.ts`. Se este arquivo discordar deles, eles ganham.

---

## 1. Ideia central

Três invariantes explicam quase toda decisão do repositório:

1. **A dependência aponta para dentro** — `presentation → domain ← data`.
   O domínio não conhece React, navegação, SQLite nem design system.
2. **Cada dado tem um dono só** — servidor, cache, banco local e intenção do
   usuário são quatro tecnologias com papéis fixos.
3. **Teste antes de prosa** — regra que importa vira teste; fronteira que
   importa vira `src/architecture.test.ts`.

O efeito prático: a regra clínica (faixa de glicemia, IMC, classificação de
paciente) roda em Node puro, sem simulador, sem tela e sem rede.

---

## 2. Mapa de pastas

```
src/
├── core/            infraestrutura compartilhada — sem marca, sem produto
│   ├── data/        fontes concretas (remota/local) e repositórios genéricos
│   ├── database/    porta do SQLite + migrations versionadas
│   ├── designsystem/ tokens, theme, brands/ e a UI em native/
│   ├── di/          container: monta tudo uma vez e injeta por contexto
│   ├── domain/      Result, DomainError, modelo e portas de repositório
│   ├── flags/       catálogo de flags remotas + hook de leitura
│   ├── navigation/  coordinator, rotas e header (lib só em reactnavigation/)
│   ├── network/     transporte simulado com latência, erro e timeout
│   ├── platform/    OTA, biometria e conectividade
│   ├── presentation/ ViewModel, UiState e a ponte useViewModel
│   ├── query/       QueryClient, persistência offline e TODAS as chaves
│   └── state/       stores zustand: sessão e marca
├── feature/         uma pasta por fatia vertical do produto
│   ├── biomarkers/  faixas clínicas, IMC, tendência e indicadores
│   ├── home/        Início
│   ├── insight/     assistente de IA (anonimização, kill switch, rascunho)
│   ├── patientdetail/ ficha do paciente
│   ├── patients/    carteira
│   ├── schedule/    agenda do dia
│   └── settings/    Mais: marca, flags, offline, OTA
├── App/             abre o banco, migra, monta o container, sobe o navigator
└── architecture.test.ts
```

Convenções de arquivo (também travadas por checker):

- pasta é o nome do componente/módulo; o arquivo é `index.tsx` (ou `index.ts`);
  a tipagem é `types.ts` ao lado;
- import entre pastas usa `@/`; relativo só dentro da própria pasta;
- feature é fatia vertical com duas portas públicas: `index.ts` (tudo) e
  `domain/index.ts` (só regra pura).

---

## 3. As camadas

### 3.1 `domain/` — a regra

Contém use cases (classes com `execute`) e funções puras. Declara as **portas**
de repositório (`src/core/domain/repository/types.ts`) que a camada `data`
implementa: o domínio diz o que precisa, nunca como é buscado.

Erro nunca vaza como exceção crua: tudo cruza a fronteira como
`Result<T>` (`ok` / `fail`) carregando um `DomainError`
(`src/core/domain/result/index.ts`, `src/core/domain/domain-error/index.ts`).

```ts
// feature/insight/domain/request-insight/index.ts
execute(patientId: string, aiEnabled: boolean): Promise<Result<Insight>> {
  if (!aiEnabled) return Promise.resolve(fail(DomainError.featureDisabled('ai_insights')));
  return this.insights.create(patientId);
}
```

O kill switch da IA mora no use case, não na tela: com a flag desligada o
serviço nem chega a ser chamado.

### 3.2 `data/` — a implementação das portas

Traduz falha de rede e de SQL em `DomainError` antes de cruzar a fronteira e
decide a estratégia remoto/local. Exemplo real em
`src/feature/patients/data/patient-repository/index.ts`:

- `list()` busca no remoto, popula o cache local em background e cai para o
  SQLite se o servidor falhar;
- `setPinned()` escreve no banco local primeiro; se o servidor recusar,
  enfileira em `pending_mutation` e mantém o estado otimista.

### 3.3 `presentation/` — tela e estado de tela

Dois formatos, escolhidos pela natureza da tela:

| tela | padrão |
|---|---|
| com interação e mutação (carteira) | `ViewModel` + `useViewModel` |
| leitura pura (Início, ficha, biomarcadores) | `useQueries` + `toUiState` |

O **ViewModel não é React**: é uma classe observável com `subscribe` /
`getSnapshot` (`src/core/presentation/view-model/index.ts`), o mesmo papel do
ViewModel do Android e do `ObservableObject` do iOS. A única ponte com React é
`useViewModel`, via `useSyncExternalStore`
(`src/core/presentation/use-view-model/index.ts`). Por isso o teste do ViewModel
não renderiza tela nenhuma.

Todo estado visível é um `UiState<T>` de quatro casos —
`loading | error | empty | data` (`src/core/presentation/ui-state/index.ts`) —
então a tela é um `switch`, não uma pilha de ternários com `isLoading`.

---

## 4. Um toque na tela, do começo ao fim

"Fixar paciente" na carteira:

```
PatientListRow (onLongPress)
  → PatientsViewModel.togglePinned        pinta o estado otimista na hora
  → TogglePin (use case)                  diz o que "fixar" significa
  → PatientRepository.setPinned           SQLite primeiro, servidor depois
      falhou?  enfileira em pending_mutation e mantém o otimista
      recusou? o ViewModel devolve o snapshot anterior
  → invalida queryKeys.patients.counts    o Início recalcula sozinho
```

Nenhuma etapa conhece a seguinte por implementação concreta: a tela conhece o
ViewModel, o ViewModel conhece o use case, o use case conhece a porta.

---

## 5. Quem é dono de qual dado

| dado | dono | por quê |
|---|---|---|
| resposta do servidor | TanStack Query | cache com prazo, revalidação e retry num lugar só |
| carteira e fichas abertas | SQLite (`core/database`) | abre offline, sobrevive ao app fechado (7 dias) |
| filtro, busca, faixa, marca | Zustand (`core/state`) | intenção do usuário agora, não é dado de servidor |
| flags remotas | Query, refetch de 1 min | kill switch precisa propagar sem release |

**Chave de query é contrato compartilhado.** Todas moram em
`src/core/query/query-keys/index.ts` — quem invalida e quem registra leem o
mesmo arquivo. Feature não declara `queryKey` própria (travado pelo teste de
arquitetura e por `npm run check:keys`).

Política de cache (`src/core/query/query-client/index.ts`): `staleTime` de 30s,
`gcTime` e persistência em AsyncStorage por 7 dias, retry só para
`DomainError.retryable` e no máximo 2 vezes; mutação não tem retry.

---

## 6. Composição e injeção

`src/App/index.tsx` é a raiz: abre o banco → roda migrations → monta o container
→ sobe os providers.

```
GestureHandlerRootView
└── SafeAreaProvider
    └── PersistQueryClientProvider     cache + persistência offline
        └── ContainerProvider          repositórios já construídos
            └── ThemeProvider          marca ativa (cor, fonte, forma)
                └── BiometricGate      trava condicionada à flag
                    └── RootNavigator
```

`createContainer(database)` (`src/core/di/container/index.tsx`) instancia as
fontes e os repositórios uma única vez e os injeta por contexto; a tela consome
via `useContainer()` e enxerga apenas as **interfaces** declaradas em
`core/domain/repository`.

`core/di/` e `RootNavigator/` são as duas únicas raízes de composição
autorizadas a importar implementação de feature — o restante do `core` não
conhece feature alguma.

---

## 7. Banco local e migrations

`src/core/database/database/index.ts` abre `tecsa.db` em modo WAL e aplica as
migrations pendentes comparando `PRAGMA user_version`.

`src/core/database/migrations/index.ts` é um array versionado: **versão nova
entra no fim; versão publicada nunca é editada** — o aparelho do usuário já
rodou a anterior. Tabelas atuais: `patient`, `measurement` e `pending_mutation`
(a fila de mutações offline).

---

## 8. Rede

Não há backend real no repositório: `src/core/network/transport/index.ts`
simula um servidor com latência, jitter, taxa de falha, timeout e um modo
offline forçado, configuráveis em `core/network/network-config` e ajustáveis
pela tela Mais. Toda falha vira `DomainError` na origem, então as camadas de
cima não lidam com exceção de rede.

Consequência de projeto: os caminhos de erro e offline são exercitáveis no
simulador, sem derrubar nada.

---

## 9. Navegação

Tab controller na raiz, pilha nativa por cima. **Nenhuma feature importa
`@react-navigation`** (travado por teste). A tela pede destino em linguagem de
domínio:

```ts
const coordinator = useCoordinator();
coordinator.showPatientDetail(patient.id);
```

Os destinos são um union tipado em `core/navigation/app-route/types.ts`; a
tradução para a biblioteca vive só em `core/navigation/reactnavigation/`.
Header é declarado por `useScreenHeader` e convertido em
`reactnavigation/screen-options`, cuja regressão visual tem teste próprio.

---

## 10. White-label

Marca é dado, não `if`. `core/designsystem/brands/<marca>` declara paleta,
forma, tipografia, nome comercial e nome do assistente; `ThemeProvider` resolve
a marca ativa da store Zustand e `useTheme()` é a única porta de cor, forma e
fonte para qualquer tela.

`core/designsystem/tokens` guarda o que é igual em toda marca (espaçamento,
escala tipográfica, durações, alvo mínimo de toque de 44pt); cor e família de
fonte vêm sempre da marca.

Trocar de marca em runtime (tela Mais) troca cor, fonte, raio e textos sem tocar
em tela, regra ou API. `architecture.test.ts` falha se o nome comercial de uma
marca aparecer fora de `brands/`.

---

## 11. Plataforma

- **Feature flags remotas** (`core/flags`): `ai_insights` (kill switch da IA),
  `agenda_tab`, `biometric_lock`. Refetch de 60s ⇒ propagação máxima de 1 min,
  com fallback para `defaultFlags` enquanto não há resposta.
- **IA**: o app nunca carrega chave de LLM. O serviço é chamado pelo backend e
  recebe apenas o perfil anonimizado de
  `feature/insight/domain/anonymize-patient` — sem nome, sem identificador. O
  `profileFingerprint` faz insight repetido não gerar nova cobrança.
- **OTA** (`core/platform/ota`, expo-updates): correção de JS sai sem passar
  pela loja; mudança nativa continua exigindo release.
- **Biometria** (`core/platform/biometric-gate`): trava ao abrir e após 1 min em
  segundo plano; sem biometria cadastrada cai no código do aparelho — nunca
  deixa o app inacessível.
- **Offline**: cache persistido (7 dias) + carteira em SQLite + fila de
  mutações. Fixar funciona sem rede; IA exige conexão e não enfileira.
- **Listas**: carteira de 2.000 pacientes em `FlashList`, paginação por cursor
  de 40 itens.

---

## 12. Onde mexer

| pergunta | arquivo |
|---|---|
| Quando um paciente é Novo / Atenção / Em dia | `feature/patients/domain/classify-patient-status` |
| Faixa de glicemia, pressão e IMC | `feature/biomarkers/domain/clinical-bands` |
| O que a IA recebe e o que ela nunca recebe | `feature/insight/domain/anonymize-patient` |
| Kill switch da IA | `feature/insight/domain/request-insight` + `core/flags` |
| Cor, fonte, raio, nome da marca | `core/designsystem/brands/<marca>` |
| Latência, erro e timeout do "servidor" | `core/network/network-config` |
| Tabela ou coluna nova | `core/database/migrations` (versão nova no fim) |
| Tela não atualizou depois de salvar | invalidação no ViewModel + `core/query/query-keys` |

---

## 13. Como o padrão é cobrado

Nada do que está acima depende de alguém lembrar:

| comando | o que trava |
|---|---|
| `npm run check:arch` | fronteiras entre camadas e features |
| `npm run check:code <arquivo...>` | regras de estilo e estrutura (`--staged`, `--all`) |
| `npm run check:keys` | invalidação de query sem chave registrada |
| `npm test` · `npm run typecheck` | regra clínica, ViewModel, IA, header, tipos |

Scaffolding: `npm run new:screen <feature>/<Nome>` e
`npm run new:usecase <feature>/<nome>` — estrutura nova nunca é montada à mão.

`src/architecture.test.ts` lê o código-fonte e falha quando uma fronteira é
cruzada: domínio isolado, feature só pela porta pública, core sem depender de
feature, `@react-navigation` confinado, marca fora do core e chave de query
centralizada. Além dele, testes de regra: `clinical-bands`,
`classify-patient-status`, `PatientsViewModel` (estados e update otimista),
`anonymize-patient` e `request-insight`.

Caso legítimo que o checker reprova se justifica com o escape na linha acima
(`// style-ok:`, `// cor-ok:`, `// any-ok:`, `// useEffect-ok:`, …) e um motivo
real. Mudou o padrão? Muda em `tools/rules.mjs` — não em prosa.

---

## 14. Backend e integração

O backend vive em [`backend/`](../backend/README.md): NestJS + PostgreSQL em
três camadas — Controller (valida), Service (regra + LLM), Repository (banco).
`docker compose up` sobe API na porta 9000 e o Postgres.

### Como o app escolhe a fonte

```
EXPO_PUBLIC_API_URL definida  →  core/network/api  →  backend NestJS
EXPO_PUBLIC_API_URL vazia     →  core/network/fixtures  →  catálogo simulado
```

A decisão mora em `core/network/api-config` e é lida só por
`PatientRemoteSource`. Nenhuma camada acima muda: repositório, use case,
ViewModel e tela não sabem qual fonte respondeu — o mesmo binário roda nos dois
modos, o que mantém o app demonstrável sem subir nada.

### Peças novas em `core/network`

| pasta | papel |
|---|---|
| `api-config/` | base URL (do ambiente, nunca literal) e timeout |
| `http-client/` | único `fetch` do app; traduz status e falha em `DomainError` |
| `api/` | camada tipada: DTO do backend → modelo de domínio |
| `flag-sync/` | kill switch da tela Mais: escreve no servidor ou no catálogo |

Tradução de erro que o `http-client` garante — é o que permite as telas
tratarem estado sem conhecer HTTP:

| HTTP | `DomainError` | efeito na tela |
|---|---|---|
| 404 | `not-found` | estado vazio / voltar |
| 400 · 422 | `invalid-input` | erro sem retry |
| 503 | `feature-disabled` | IA indisponível (kill switch) |
| outros | `network` | erro com retry |
| `AbortError` | `timeout` | erro com retry |
| `TypeError` | `offline` | modo offline, cache local assume |

Vocabulário também é traduzido na fronteira: `weight|glucose|pressure` do
backend viram `peso|glicemia|pressao` do domínio. `core/network/api/index.test.ts`
trava esse mapeamento e a tabela de erros acima.

### IA ponta a ponta

```
InsightSheet → InsightViewModel → RequestInsight (flag local)
  → InsightRepositoryImpl → POST /api/patients/:id/insights
      backend: flag ai_insights? → anonimiza → LLM → persiste
```

A anonimização acontece **no backend**, antes do provedor, e o app nunca carrega
chave. Com `ai_insights` desligada o backend responde `503` e o app mostra IA
indisponível sem chamar o provedor — kill switch nas duas pontas.

### Agenda

`GET /api/schedule/today?date=<iso>` devolve as consultas do dia já ordenadas e
com o nome do paciente. A janela do dia é regra pura (`schedule/day-window.ts`),
fora do service — é o que impede consulta sumir por fuso horário. Marcar usa
`POST /api/schedule`, que responde `404` para paciente inexistente e `409` para
horário ocupado.

O app manda o dia que está exibindo (`nowISO`), e `core/network/api` traduz
`first|return|consultation` para `primeira|retorno|consulta` do domínio.

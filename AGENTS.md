# Arquitetura — tecsa-nutri

App React Native que se comporta como app nativo, com uma base multimarca.
Este arquivo é a fonte de verdade. Se um desenho ou uma doc discordar daqui,
este arquivo ganha.

## 1. As três regras que explicam quase toda decisão

1. **A dependência aponta para dentro.** `presentation → domain ← data`.
   O domínio não importa React, navegação, banco nem design system. É isso que
   deixa a regra clínica testável sem simulador, sem tela e sem rede.
2. **Cada dado tem um dono só.** Servidor (transporte), cache (TanStack Query),
   banco local (SQLite) e intenção do usuário (Zustand) são quatro tecnologias
   com papéis fixos. Dado sem dono vira duas telas dizendo coisas diferentes.
3. **Teste antes de prosa.** Regra que importa vira teste; fronteira que importa
   vira `src/architecture.test.ts`.

## 2. Camadas

```
src/
├── core/                      infraestrutura compartilhada, sem marca e sem produto
│   ├── data/                  fontes concretas (remota e local) e repositórios genéricos
│   ├── database/              porta do SQLite + migrations versionadas
│   ├── designsystem/          tokens, theme, brands/ e a UI em native/
│   ├── di/                    container: monta tudo uma vez e injeta por contexto
│   ├── domain/                Result, DomainError, modelo e portas de repositório
│   ├── flags/                 catálogo de flags remotas e o hook de leitura
│   ├── navigation/            AppCoordinator, rotas e header; a lib fica só em reactnavigation/
│   ├── network/               transporte simulado com latência, erro e timeout
│   ├── platform/              OTA, biometria e conectividade
│   ├── presentation/          ViewModel, UiState e a ponte useViewModel
│   ├── query/                 QueryClient, persistência offline e TODAS as chaves
│   └── state/                 stores zustand: sessão e marca
├── feature/                   uma pasta por fatia vertical do produto
│   ├── biomarkers/            faixas clínicas, IMC, tendência e indicadores
│   ├── home/                  Início
│   ├── insight/               assistente de IA (anonimização, kill switch, rascunho)
│   ├── patientdetail/         ficha do paciente
│   ├── patients/              carteira
│   ├── schedule/              agenda do dia
│   └── settings/              Mais: marca, flags, offline, OTA
├── App/                       abre o banco, migra, monta o container e sobe o navigator
└── architecture.test.ts       o teste que trava as fronteiras acima
```

Uma feature só enxerga outra por `@/feature/<nome>` (tudo) ou
`@/feature/<nome>/domain` (só regra pura — é por aí que domínio fala com
domínio, sem arrastar tela junto).

## 3. Um toque na tela, do começo ao fim

"Fixar paciente" na carteira:

```
PatientListRow (onLongPress)
  → PatientsViewModel.togglePinned      pinta o estado otimista na hora
  → TogglePin (use case)                diz o que fixar significa
  → PatientRepository.setPinned         SQLite primeiro, servidor depois
      falhou?  enfileira em pending_mutation e mantém o otimista
      recusou? o ViewModel devolve o estado anterior
  → invalida queryKeys.patients.counts  o Início recalcula sozinho
```

O ViewModel **não é React**: é uma classe com `subscribe` e `getSnapshot`, o
mesmo papel do ViewModel do Android e do ObservableObject do iOS. Quem liga isso
ao React é `useViewModel`, via `useSyncExternalStore`. Por isso o teste do
ViewModel não renderiza tela nenhuma.

Tela de leitura pura (Início, ficha, biomarcadores) não precisa de ViewModel:
usa `useQueries` + `toUiState`, e a regra continua no `domain/`.

## 4. Quem é dono de qual dado

| dado | dono | por quê |
|---|---|---|
| resposta do servidor | TanStack Query | cache com prazo, revalidação e retry num lugar só |
| carteira e fichas abertas | SQLite (`core/database`) | abre offline, sobrevive ao app fechado (7 dias) |
| filtro, busca, faixa, marca | Zustand (`core/state`) | intenção do usuário agora, não é dado de servidor |
| flags remotas | Query, com refetch de 1 min | kill switch precisa propagar sem release |

Chave de query é contrato compartilhado: todas moram em
`core/query/query-keys`, nunca na porta pública de uma feature.
`npm run check:keys` trava chave órfã.

## 5. Navegação

Tab controller na raiz, pilha nativa por cima. Nenhuma feature importa
`@react-navigation`: a tela pede destino ao `useCoordinator()`
(`coordinator.showPatientDetail(id)`) e declara header por `useScreenHeader`.
Quem traduz para opções da biblioteca é `reactnavigation/screen-options`, e a
regressão visual do header é travada por `screen-options/index.test.ts`.

## 6. White-label

Marca é dado: `core/designsystem/brands/<marca>` declara paleta, forma,
tipografia, nome comercial e nome do assistente. Trocar de marca em runtime
(tela Mais) troca cor, fonte, raio e textos — sem tocar em tela, regra ou API.
`architecture.test.ts` falha se o nome de uma marca aparecer fora de `brands/`.

## 7. Plataforma

- **Feature flag remota** (`core/flags`): `ai_insights` (kill switch da IA),
  `agenda_tab`, `biometric_lock`. Refetch de 1 min = propagação máxima de 1 min.
  Com `ai_insights` desligada o use case nem chega a bater no serviço.
- **OTA** (`core/platform/ota`, expo-updates): mesmo runtime que o Expo já usa
  para canal e build; correção de JS sai sem passar pela loja, mudança nativa
  continua exigindo release.
- **Biometria** (`core/platform/biometric-gate`): trava ao abrir e depois de
  1 min em segundo plano; sem biometria cadastrada cai no código do aparelho,
  nunca deixa o app inacessível.
- **Offline**: cache persistido por 7 dias + carteira em SQLite + fila de
  mutações pendentes. Fixar funciona sem rede; IA exige conexão e não enfileira.
- **Lista virtualizada**: carteira de 2.000 pacientes em `FlashList`, com
  paginação por cursor de 40.

## 8. Regras de produto (onde mexer)

| pergunta | arquivo |
|---|---|
| Quando um paciente é Novo / Atenção / Em dia | `feature/patients/domain/classify-patient-status` |
| Faixa de glicemia, pressão e IMC | `feature/biomarkers/domain/clinical-bands` |
| O que a IA recebe e o que ela nunca recebe | `feature/insight/domain/anonymize-patient` |
| Kill switch da IA | `feature/insight/domain/request-insight` + `core/flags` |
| Cor, fonte, raio, nome da marca | `core/designsystem/brands/<marca>` |
| Latência, erro e timeout do "servidor" | `core/network/network-config` |
| Tabela ou coluna nova | `core/database/migrations` (versão nova no fim do array) |
| Tela não atualizou depois de salvar | invalidação no ViewModel + `core/query/query-keys` |

## 9. O que o teste trava por você

`src/architecture.test.ts` lê o código e falha quando uma fronteira é cruzada:
domínio isolado, feature só pela porta pública, core sem depender de feature,
`@react-navigation` confinado, marca fora do core e chave de query centralizada.
Ao lado dele: `screen-options` (header), `clinical-bands` e
`classify-patient-status` (regra clínica), `PatientsViewModel` (estados e update
otimista), `anonymize-patient` e `request-insight` (IA).

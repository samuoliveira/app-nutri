# Plataforma e release

## Feature flags

`core/flags/flags` lista as chaves; `useFlags()` lê com refetch de 1 minuto —
esse é o teto de propagação. Flag nova entra no catálogo, nunca como string
solta na tela.

| flag | efeito |
|---|---|
| `ai_insights` | kill switch da IA: o card some e o use case recusa antes de chamar |
| `agenda_tab` | esconde a aba Agenda da barra |
| `biometric_lock` | liga o bloqueio biométrico |

O kill switch é decidido no use case (`RequestInsight`), não na tela: desligar a
flag corta a chamada, não só o botão.

## OTA

`expo-updates`, canal por perfil de build, `runtimeVersion` por `appVersion`.
Escolha justificada: é o mesmo runtime que o Expo já usa para build e canal,
sem servidor próprio de bundle nem SDK extra. Correção de JS sai sem loja;
mudança de código nativo continua exigindo release — e a política de
`runtimeVersion` impede entregar bundle novo para binário velho.

## Biometria

`expo-local-authentication` no `BiometricGate`: pede ao abrir e depois de 1
minuto em segundo plano. Sem biometria cadastrada, cai no código do aparelho —
o app nunca fica inacessível por falta de Face ID.

## Rede simulada

`core/network/network-config` controla latência, taxa de falha, taxa de timeout
e offline forçado. A tela Mais liga o offline para demonstrar o caminho de erro
sem precisar do modo avião.

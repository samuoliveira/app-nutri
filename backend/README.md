# nutri-backend

API do app do nutricionista. NestJS + TypeScript + PostgreSQL, em camadas.

## Subir

```bash
cd backend
docker compose up --build        # backend em http://localhost:9000, Postgres em 5432
docker compose exec backend npm run seed   # 120 pacientes de exemplo
```

Sem Docker:

```bash
npm install
cp .env.example .env             # ajuste DATABASE_HOST=localhost
npm run start:dev
```

## Camadas

```
Controller   valida entrada (DTO + class-validator) e traduz para HTTP
    ↓
Service      regra de negócio, orquestração e chamada de LLM
    ↓
Repository   acesso ao banco (TypeORM). Nenhuma regra aqui.
```

Regra pura (classificação de status, IMC) vive fora das três camadas, em
`patients/patient-status.ts` — testável sem banco e reaproveitável.

## Endpoints

| verbo | rota | resposta |
|---|---|---|
| `GET` | `/api/health` | 200 |
| `GET` | `/api/patients?status=&search=&limit=&offset=` | 200 — página com `items`, `total`, `nextOffset` |
| `GET` | `/api/patients/:id` | 200 · 404 |
| `POST` | `/api/patients` | 201 · 400 |
| `PATCH` | `/api/patients/:id/pin` | 200 · 404 |
| `GET` | `/api/patients/:id/measurements` | 200 |
| `POST` | `/api/patients/:id/insights` | 201 · 404 · 503 (flag desligada) |
| `PATCH` | `/api/patients/:id/insights/:insightId/approve` | 200 · 404 · 409 (já aprovado) |
| `GET` | `/api/patients/:id/insights/latest` | 200 · 404 |
| `GET` | `/api/schedule/today?date=` | 200 — consultas do dia, em ordem |
| `POST` | `/api/schedule` | 201 · 404 (paciente) · 409 (horário ocupado) |
| `DELETE` | `/api/schedule/:id` | 204 · 404 |
| `GET` | `/api/flags` | 200 |
| `PUT` | `/api/flags/:key` | 200 · 404 |

## IA

A chave do LLM só existe no servidor. O fluxo é:

```
flag ai_insights → anonymizePatient() → LlmClient → persistência
```

- **Kill switch**: `PUT /api/flags/ai_insights {"enabled": false}` faz o endpoint
  responder `503` sem tocar no provedor. O app faz polling de 1 min.
- **Anonimização**: `insights/llm/anonymous-profile.ts` é o único caminho de
  saída de dado de paciente. Nome e id nunca saem — teste cobre isso.
- **Porta `LlmClient`** (DIP): o service depende da interface. O módulo escolhe
  no boot — `AnthropicLlm` se houver `ANTHROPIC_API_KEY`, `GeminiLlm` se houver
  `GEMINI_API_KEY` (free tier do Google AI Studio), `RuleBasedLlm` se não houver
  nenhuma. Provedor que falha cai no gerador por regras, então a API responde
  nos três casos.

## Testes

```bash
npm test          # 45 testes
npm run test:cov
```

Cobrem o que decide comportamento: classificação clínica e IMC, kill switch,
anonimização do payload, persistência com origem da resposta, janela do dia da
agenda e conflito de horário.

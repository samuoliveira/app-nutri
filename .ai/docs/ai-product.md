# IA e pensamento de produto

## O que a IA recebe

Só idade, sexo e medições (`anonymizePatient`). Nome e id nunca saem do
aparelho — tem teste provando isso.

## Onde a chave mora

No backend. O app manda o perfil anonimizado e recebe o rascunho; nenhuma chave
de provedor existe no bundle. Enquanto o backend não sobe, o rascunho vem das
regras clínicas (`buildRuleInsight`), marcado como tal na tela.

## Como o resultado chega

Como **rascunho**. A nutricionista revisa e aprova antes de qualquer coisa
chegar à paciente. A tela diz a origem (IA ou regras) e o aviso de revisão.

## Custo

Mesmos dados geram a mesma chave (`profileFingerprint`) e o insight volta do
cache — pedir duas vezes não cobra duas vezes.

## Quando a IA cala

- Flag `ai_insights` desligada: o card some e a tela explica.
- Falha do serviço: cai para o insight por regras, avisando.
- Sem conexão: não enfileira, pede conexão.

## Perguntas abertas (do desenho do produto)

- O rascunho aprovado vai para onde: prontuário, WhatsApp, app da paciente?
- Paciente com IMC alto entra sempre em Atenção?
- 30 e 60 dias são os limites certos para Novo e para consulta vencida?

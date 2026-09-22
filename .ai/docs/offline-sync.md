# Offline e sincronização

## O que fica no aparelho

- **Cache de servidor**: TanStack Query persistido em AsyncStorage por 7 dias
  (`OFFLINE_CACHE_MAX_AGE_MS`). É o que faz o app abrir com conteúdo.
- **Carteira**: SQLite (`core/database`), gravada a cada listagem bem-sucedida.
  É o fallback quando a rede falha e o cache expirou.
- **Fila de pendências**: tabela `pending_mutation` guarda o que o servidor
  ainda não confirmou.

## Update otimista

Fixar paciente muda o banco local e a tela na hora. Se o servidor recusar:
- na carteira, o `PatientsViewModel` devolve o estado anterior;
- na ficha, `onError` da mutation restaura o cache anterior.

Em falha de rede (não de regra) a intenção fica na fila e o otimista permanece:
o usuário não perde o gesto por causa de sinal ruim.

## O que não funciona offline

A IA. Ela exige conexão e não enfileira — rascunho gerado com dado velho é pior
que nenhum rascunho. A tela diz isso em vez de ficar girando.

## Conflito

Hoje vale a última escrita. Se duas pessoas editarem a mesma ficha, a segunda
grava por cima — está registrado como pergunta aberta no desenho do produto.

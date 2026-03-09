# Governanca da Fabrica de Jogos

## Objetivo

Evitar buracos de producao e garantir cadencia sustentavel da linha de jogos da campanha.

## Regra estrutural (hard cap)

- no maximo 1 jogo em validacao forte;
- no maximo 1 jogo em implementacao ativa;
- 1 a 2 jogos em pre-producao;
- restante em backlog frio.

## Definicoes operacionais

- validacao forte: jogo jogavel com leitura semanal de sinais (T37/T38/T39 quando arcade).
- implementacao ativa: jogo com codificacao aberta no runtime principal.
- pre-producao: concept + systems + art direction minimos concluídos.
- backlog frio: ideia mapeada sem compromisso de codificacao no ciclo corrente.

## Critico para subir de etapa

Pre-producao -> implementacao:
- matriz de priorizacao no top 2;
- risco de producao >= 3/5;
- escopo minimo cabendo no ciclo;
- nao quebrar limite de 1 implementacao ativa.

Implementacao -> validacao forte:
- gates tecnicos verdes;
- jogabilidade minima estavel mobile/PC;
- telemetria principal instrumentada.

Validacao forte -> live estavel:
- janela minima de coleta sem bloqueadores criticos;
- decisao operacional explicita (seguir, manter dual, ou despriorizar);
- documentacao e runbook atualizados.

## Aplicacao imediata no T43

- validacao forte atual: `mutirao-do-bairro`.
- implementacao ativa atual: `cooperativa-na-pressao` (em janela de observacao pos-T42B).
- pre-producao forte: `bairro-resiste`.
- backlog frio maduro: `orcamento-do-comum`.
- conceito futuro: `rj-do-comum`.

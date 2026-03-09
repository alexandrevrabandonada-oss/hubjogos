# Orcamento do Comum - Systems Design (T43)

## Objetivo do sistema

Criar uma simulacao media de disputa orcamentaria com onboarding simples, sem perder densidade politica.

## Estrutura de partida

- duracao: 3-6 min.
- formato: 5 rodadas.
- em cada rodada o jogador distribui um orcamento fixo entre politicas do comum.

## Eixos de estado (max 3 para P0)

- `bem_estar_coletivo` (0-100)
- `legitimidade_popular` (0-100)
- `sustentabilidade_social` (0-100)

## Areas de alocacao

- transporte comum
- saude de base
- moradia digna
- educacao e cultura
- trabalho/cooperativismo

## Loop por rodada

1. receber contexto politico e fiscal da rodada.
2. alocar pontos de orcamento nas areas.
3. resolver evento de conflito (lobby, corte, emergencia, mobilizacao).
4. aplicar impacto nos 3 eixos.
5. mostrar micro-feedback e preparar proxima rodada.

## Eventos (pool inicial)

- lobby-de-concessao
- corte-de-receita
- crise-de-mobilidade
- ocupacao-por-moradia
- greve-de-base
- mutirao-de-cuidado (evento positivo)

## Regras de impacto

- cada area tem retorno principal e custo de oportunidade.
- eventos alteram coeficientes por 1 rodada.
- escolhas muito concentradas geram penalidade de fragilidade sistemica.

## Finais de partida

- `gestao-do-comum-forte`
- `gestao-em-disputa`
- `captura-mercantil`
- `colapso-de-legitimidade`

## UX constraints para P0

- primeira decisao em menos de 20s.
- no maximo 5 informacoes simultaneas por tela.
- feedback de cada escolha em texto curto + indicador visual.

## Telemetria minima planejada

- `orcamento_comum_run_start`
- `orcamento_comum_round_resolved`
- `orcamento_comum_budget_allocated`
- `orcamento_comum_event_triggered`
- `orcamento_comum_run_end`
- `orcamento_comum_final_type`

## Riscos de sistema e mitigacao

- risco: estrategia dominante de alocacao unica.
  mitigacao: custo de concentracao + eventos com contrapeso.
- risco: curva de aprendizado pesada.
  mitigacao: 3 eixos fixos e tutorial de uma tela.
- risco: baixa variacao de run.
  mitigacao: embaralhamento de eventos e modificadores de rodada.

## Escopo minimo pensavel (futuro)

- 5 rodadas.
- 5 areas de alocacao.
- 6 eventos base.
- 4 finais.
- sem camada meta persistente no primeiro slice.

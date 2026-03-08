# Matriz de Priorizacao de Proximos Jogos

## Objetivo

Escolher proximos jogos de forma rastreavel, sem improviso e sem abrir implementacao antes de pre-producao minima.

## Criterios

Escala: 1 (baixo) a 5 (alto).

- potencia de campanha
- clareza politica
- diversao
- contraste com jogos existentes
- risco de producao (5 = risco baixo)
- potencial mobile/PC
- compartilhamento
- reutilizacao de pipeline

## Candidatos avaliados

| candidato | campanha | clareza politica | diversao | contraste | risco (baixo=5) | mobile/PC | compartilhamento | reutilizacao | total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| cooperativa-na-pressao | 5 | 5 | 4 | 5 | 4 | 5 | 4 | 5 | 37 |
| bairro-resiste | 5 | 4 | 5 | 4 | 3 | 5 | 5 | 4 | 35 |
| orcamento-do-comum | 5 | 5 | 3 | 4 | 2 | 4 | 3 | 3 | 29 |

## Leitura estrategica

- `cooperativa-na-pressao` vence por equilibrio entre potencia politica, contraste mecanico e risco controlavel.
- `bairro-resiste` e muito forte para distribuicao territorial e compartilhamento, mas precisa reduzir risco de escopo antes de implementacao.
- `orcamento-do-comum` tem potencia politica alta, porem risco de UX/sistemas ainda elevado para o momento.

## Shortlist oficial T41

1. `cooperativa-na-pressao` - pre-producao ativa, candidato prioritario para T42.
2. `bairro-resiste` - pre-producao ativa, candidato de sequencia apos validacao de escopo.
3. `orcamento-do-comum` - manter no backlog frio com refinamento conceitual.

## Regra de promocao para implementacao

Um candidato sobe para implementacao ativa apenas se:
- ficar no top-2 da matriz por 2 revisoes seguidas;
- tiver risco de producao >= 3;
- tiver concept/systems/art em versao minima aprovadas.

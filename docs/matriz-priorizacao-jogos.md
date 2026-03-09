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
| rj-do-comum | 5 | 5 | 4 | 5 | 1 | 3 | 4 | 2 | 29 |

## Leitura estrategica

- `cooperativa-na-pressao` permanece como referencia de equilibrio, mas esta bloqueado para novas expansoes ate fechar janela T42B.
- `bairro-resiste` e o proximo candidato real de subida, com bom contraste territorial e risco ainda administravel.
- `orcamento-do-comum` segue forte politicamente, mas ainda com risco alto de UX/sistemas.
- `rj-do-comum` amplia horizonte estadual e diversidade, porem com risco de escopo muito alto para curto prazo.

## Shortlist oficial T43

1. `cooperativa-na-pressao` - implementacao ativa observada (nao abrir novo jogo enquanto janela T42B estiver em curso).
2. `bairro-resiste` - pre-producao forte, primeiro candidato para subir quando houver capacidade.
3. `orcamento-do-comum` - backlog frio maduro, sobe so apos reduzir risco UX/sistemas.
4. `rj-do-comum` - conceito estadual futuro, manter como horizonte sem promocao imediata.

## Regra de promocao para implementacao

Um candidato sobe para implementacao ativa apenas se:
- ficar no top-2 da matriz por 2 revisoes seguidas;
- tiver risco de producao >= 3;
- tiver concept/systems/art em versao minima aprovadas.
- nao romper hard cap da fabrica no ciclo corrente.

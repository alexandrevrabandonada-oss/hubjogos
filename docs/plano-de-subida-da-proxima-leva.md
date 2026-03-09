# Plano de Subida da Proxima Leva (T51)

## Objetivo

Definir regras claras de promocao dos proximos candidatos sem quebrar governanca da fabrica e sem abrir implementacao antes da hora.

## Estado atual de capacidade

- validacao forte: `mutirao-do-bairro`.
- implementacao ativa observada: `cooperativa-na-pressao` (T50, ate 16/03/2026).
- pre-producao forte pronta para subida condicional: `bairro-resiste`.
- backlog frio maduro: `orcamento-do-comum`.
- conceito futuro: `rj-do-comum`.

## Ordem recomendada de subida

1. `bairro-resiste` (proximo candidato real)
2. `orcamento-do-comum` (apenas apos reduzir risco UX/sistemas)
3. `rj-do-comum` (apenas apos maturidade da linha media/session)

## Condicoes para `bairro-resiste` subir

- `cooperativa-na-pressao` encerra T50 com decisao oficial (promocao, tuning ou arquivo).
- hard cap preservado: nao pode existir outro jogo em implementacao ativa.
- docs minimas aprovadas: concept + systems + art direction + vertical slice contract.
- pipeline pronto: `public/arcade/bairro-resiste/` + `manifest.json` inicial.
- checklist de subida aprovado: `docs/bairro-resiste-go-live-checklist.md`.
- risco de producao >= 3 na matriz (escopo cortado para slice de 90s).

## Condicoes para `orcamento-do-comum` sair de backlog frio

- onboarding validado em prototipo (primeira decisao <20s).
- systems simplificado em 3 eixos core.
- risco sobe de 2 para >=3 na matriz.
- fabrica sem conflito de capacidade.

## Condicoes para `rj-do-comum` virar pre-producao forte

- `bairro-resiste` ja promovido para implementacao ou validacao estavel.
- linha media/session ganha slot real de capacidade.
- matriz de diversidade aponta necessidade de horizonte estadual.
- recorte minimo definido para evitar escopo de "simulador total".

## Gatilhos de bloqueio

- qualquer regressao critica em quick line ou arcades live/validando.
- queda de sinais essenciais em `cooperativa-na-pressao` durante janela de observacao.
- rompimento do hard cap (mais de 1 implementando ou mais de 1 validando forte).
- perda de escopo do slice (tentativa de abrir feature fora do contract).

## Decisao operacional T51

- nao abrir codigo de novo jogo.
- consolidar pre-producao forte de `bairro-resiste`.
- preparar decisao pos-T50 para subida rapida e organizada.

## O que fica para T52

- decisao formal de subida de `bairro-resiste` apos fechamento do T50.
- abertura de implementacao do slice (T52/T52A) se capacidade for liberada.
- telemetria baseline e smoke/e2e minimo do novo arcade.

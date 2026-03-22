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


---
## Atualização T53: Hub de Jogos como Game Studio (Readiness & Modulos)
* **Catálogo de Mecânicas**: Documentado em `docs/catalogo-de-mecanicas-arcade.md`. Mecânicas como Hotspot Pressure e Lane Runner catalogadas para reuso.
* **Matriz de Reutilização**: Utilitários de HUD, Timer (`useArcadeSession`) e Telemetry mapeados em `docs/matriz-reutilizacao-arcade.md` visando extração para *shared modules*.
* **Bairro Resiste Readiness**: Validação do status de `preproduction-strong`. Restrição explícita de subida de código até liberação de slot e P0 Asset Pack completo. Detalhes no relatório de readiness.
* **Governança Estrita**: Instituído `docs/regra-de-subida-de-jogos.md` proibindo inícios paralelos não autorizados.
* **O que fica para T54**: Início de código do `bairro-resiste` APENAS se slot for liberado; se não for, criação física dos *shared packages/modules*.
---


---
## Atualização T55: Bairro Resiste (Gate de Subida)
* **Status de Implementação**: **NO-GO [Abortado]**. O primeiro commit estrutural do `bairro-resiste` não foi autorizado e a criação do código base foi suspensa.
* **Bloqueios Identificados**: 
  1. Ausência do Inventário P0 na pasta do asset pack (`manifest.json` foi criado, porém `public/arcade/bairro-resiste/bg` e demais assets contêm placeholders inexistentes que quebram o manifesto).
  2. Slot de Produção indisponível segundo governança oficial.
* **Governança Respeitada**: Nenhum código fantasma (feature parcial baseada em canvas opaco) foi deixado no hub. O jogo se mantém rigidamente como `preproduction-strong`.
* **Próximões Passos para T56**: Finalizar merge da arte P0 na pasta `public/`, acionar script de capacidade, e somente então rodar a subida de código do slice.
---

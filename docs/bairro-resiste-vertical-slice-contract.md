# Bairro Resiste - Vertical Slice Contract (T52/T52A)

## Objetivo

Definir o contrato minimo de implementacao para o primeiro build jogavel de `bairro-resiste`, com escopo enxuto, risco controlado e criterios objetivos de sucesso.

Status atual:
- jogo em pre-producao forte
- implementacao bloqueada ate fechamento do T50
- contrato pronto para subida rapida quando houver slot de capacidade

## Escopo minimo do slice (entra)

- 1 mapa unico de bairro (canvas) com 4 hotspots fixos:
  - agua
  - moradia
  - mobilidade
  - saude
- 1 run de 90s com 4 fases (arranque, pressao, cerco, limite)
- 4 acoes jogaveis:
  - `defender`
  - `reparar`
  - `cuidar`
  - `mobilizar`
- 6 eventos de fase:
  - 5 negativos
  - 1 positivo de virada comunitaria
- HUD minima operacional:
  - integridade
  - rede solidaria
  - pressao externa
  - carga de mutirao
  - fase atual
- outcome final com:
  - resultado da run (sobreviveu/colapsou)
  - leitura territorial curta
  - CTA de replay e campanha

## O que precisa estar jogavel

- entrada na run em ate 3 cliques na superficie publica
- primeira acao significativa em ate 8s apos iniciar
- leitura de hotspot critico em menos de 1s
- transicao de fase sem travar input
- colapso com razao explicita na tela final
- replay em 1 clique

## Fora de escopo do slice (nao entra)

- mapa procedural ou multiplos mapas
- progressao persistente entre runs
- multiplayer/co-op real
- missao longa ou meta-campanha
- assets premium finais (audio autoral, fx pesados)
- qualquer novo modo paralelo

## Criterios de sucesso do primeiro build

Criterios de gameplay:
- loop completo de 90s executa sem crash
- todas as 4 acoes alteram estado de forma perceptivel
- ao menos 2 caminhos validos de sobrevivencia (nao 1 script unico)
- derrota nao parece aleatoria (causa rastreavel)

Criterios de UX:
- HUD legivel desktop/mobile
- feedback de evento visivel e curto
- tela final compreensivel em menos de 5s

Criterios tecnicos:
- lint/type-check/build/verify verdes
- sem regressao dos arcades live
- fallback visual funcional quando asset faltar

## Metricas minimas a coletar

Eventos baseline obrigatorios:
- `bairro_resiste_run_start`
- `bairro_resiste_run_end`
- `bairro_resiste_action_used`
- `bairro_resiste_phase_reached`
- `bairro_resiste_hotspot_overload`
- `bairro_resiste_collapse_reason`
- `bairro_resiste_mutirao_activated`
- `bairro_resiste_replay_click`
- `bairro_resiste_campaign_cta_click`

Leituras minimas para decisao pos-slice:
- runs iniciadas e finalizadas
- survival rate
- principal razao de colapso
- distribuicao de uso das acoes
- replay rate
- CTA pos-run rate

## Riscos tecnicos do slice

- risco de legibilidade: 4 hotspots em alerta simultaneo viram ruido.
  - mitigacao: alerta dominante unico + prioridade visual por severidade.

- risco de tuning punitivo: colapso cedo demais sem chance de recuperacao.
  - mitigacao: grace window e teto de escalada na fase final.

- risco de performance mobile: update/render com efeitos demais.
  - mitigacao: limites estritos de efeitos simultaneos e assets leves.

- risco de escopo: tentar incluir features de premium no slice inicial.
  - mitigacao: checklist de exclusao e freeze de escopo antes de codar.

## Gate de promocao pre-producao -> implementacao

Para abrir implementacao, todos os itens abaixo devem estar verdadeiros:
- T50 encerrado e governanca de capacidade liberada
- concept/systems/art direction fechados
- pipeline de assets criado + manifest inicial validado
- checklist de go-live com todos P0 marcados
- aprovacao editorial de portfolio (status: pre-producao forte pronta para subida)

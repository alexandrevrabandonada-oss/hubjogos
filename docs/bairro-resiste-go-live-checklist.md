# Bairro Resiste - Go Live Checklist (Pre-producao -> Implementacao)

## Objetivo

Checklist oficial para promover `bairro-resiste` de pre-producao forte para implementacao ativa sem quebrar governanca nem estabilidade do hub.

## 1) Docs minimas fechadas

- [x] `docs/bairro-resiste-concept.md` fechado (T51)
- [x] `docs/bairro-resiste-systems-design.md` fechado (T51)
- [x] `docs/bairro-resiste-art-direction.md` fechado (T51)
- [x] `docs/bairro-resiste-vertical-slice-contract.md` criado (T51)
- [x] plano de subida atualizado com dependencia explicita do T50

## 2) Assets P0 obrigatorios

Estrutura criada em `public/arcade/bairro-resiste/`:
- [x] `bg/`
- [x] `player/`
- [x] `entities/`
- [x] `ui/`
- [x] `fx/`
- [x] `README.md`
- [x] `manifest.json`

Pacote P0 antes de codar runtime:
- [ ] 1 background base de bairro
- [ ] 1 player placeholder
- [ ] 4 icones/entidades de hotspot
- [ ] 4 icones de acao de HUD
- [ ] 1 moldura de barra principal
- [ ] 1 sinal visual de alerta critico

## 3) HUD minima definida

- [x] integridade do bairro
- [x] rede solidaria
- [x] pressao externa
- [x] carga de mutirao
- [x] fase atual
- [ ] validacao de legibilidade mobile (smoke manual)

## 4) Telemetria baseline

- [ ] `bairro_resiste_run_start`
- [ ] `bairro_resiste_run_end`
- [ ] `bairro_resiste_action_used`
- [ ] `bairro_resiste_phase_reached`
- [ ] `bairro_resiste_hotspot_overload`
- [ ] `bairro_resiste_collapse_reason`
- [ ] `bairro_resiste_mutirao_activated`
- [ ] `bairro_resiste_replay_click`
- [ ] `bairro_resiste_campaign_cta_click`

## 5) Smoke/E2E minimo

- [ ] smoke de carregamento em `/arcade/bairro-resiste`
- [ ] run curta completa com finalizacao sem crash
- [ ] replay em 1 clique
- [ ] fallback de asset faltante sem quebrar runtime
- [ ] viewport mobile valida (sem sobreposicao critica no HUD)

## 6) Criterios de promocao para implementacao ativa

Todos obrigatorios:
- [ ] T50 finalizado com decisao oficial e capacidade liberada
- [ ] sem regressao critica em quick line e arcades live
- [ ] escopo travado no vertical slice contract
- [ ] risco de producao classificado como controlado (>= 3 na matriz)
- [ ] gate tecnico baseline do projeto verde

## Decisao

- `READY_TO_IMPLEMENT`: apenas quando todos obrigatorios acima estiverem completos.
- `HOLD_PREPRODUCTION`: se qualquer bloqueador de governanca/estabilidade permanecer.

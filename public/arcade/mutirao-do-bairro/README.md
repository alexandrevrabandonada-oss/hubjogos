# Mutirao do Bairro - Asset Pipeline (T36C)

Status: premium integrado e em validacao operacional.
Escopo: manter inventario de assets ativos do runtime, fallback e checklist de validacao.

## Estrutura

- `bg/`: fundos do territorio.
- `player/`: coordenador e avatar de run.
- `entities/`: hotspots territoriais.
- `ui/`: botoes de acao, HUD e overlays de evento.

## Inventario premium ativo (14)

Pacote principal conectado ao runtime (`lib/games/arcade/mutirao-do-bairro.ts`):

1. `bg/bg-bairro-premium-v1.svg`
2. `player/player-coordenador-premium-v1.svg`
3. `entities/entity-hotspot-agua-v1.svg`
4. `entities/entity-hotspot-energia-v1.svg`
5. `entities/entity-hotspot-mobilidade-v1.svg`
6. `ui/ui-action-reparar-v2.svg`
7. `ui/ui-action-defender-v2.svg`
8. `ui/ui-action-mobilizar-v2.svg`
9. `ui/ui-action-mutirao-v2.svg`
10. `ui/ui-hud-pressure-bar-v2.svg`
11. `ui/ui-hud-mutirao-charge-v2.svg`
12. `ui/ui-event-chuva-forte-v2.svg`
13. `ui/ui-event-boato-panico-v2.svg`
14. `ui/ui-event-onda-solidaria-v2.svg`

Observacao:
- `ui/ui-event-tranco-sabotagem-v2.svg` e `entities/entity-hotspot-premium-v1.svg` existem como suporte complementar no pack local.

## Fallback e resiliencia

- O runtime segue politica de fallback canvas-first: ausencia de SVG nao interrompe gameplay.
- `tryLoadImage` faz carga defensiva e reaproveita `imageCache`.
- Se um asset falhar, o render usa formas/cores base para preservar leitura de estado.
- Guardrail: nunca acoplar logica de jogo ao carregamento de imagem.

## HUD e overlays

- HUD principal de run: tempo, estabilidade, confianca, pressao e carga de mutirao.
- Overlay de evento com badges de crise (`chuva`, `boato`, `onda`, `tranco`).
- Tela final premium via `FinalShareCard` com tema `mutirao-bairro-premium`.

## Smoke e validacao

- Unit tests: `tests/unit/mutirao-do-bairro.test.ts` (28 casos de logica).
- E2E: `tests/e2e/mutirao-do-bairro-slice.spec.ts`:
	- smoke desktop
	- smoke mobile
	- validacao premium de assets
	- validacao de tela final premium

Suite final do ciclo:
- `npm run test:unit` -> 43/43
- `npm run test:e2e` -> 25/25

## Proximos passos (T37)

1. manter coleta de 7-14 dias para leitura de efetividade em producao.
2. revisar assets complementares nao conectados ao pack principal (limpeza/rotina de curadoria).
3. avaliar A/B de onboarding/controles apenas com amostra minima atingida.

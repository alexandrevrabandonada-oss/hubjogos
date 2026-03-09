# Asset Pack - Mutirao do Bairro

Local: `public/arcade/mutirao-do-bairro/`

Manifest oficial: `public/arcade/mutirao-do-bairro/manifest.json`

## Estado atual

- visualVersion: `T36C-premium-v1`
- assetSet: `mutirao-bairro-premium`
- loader: `lib/games/arcade/mutirao-assets.ts` + `lib/games/assets/asset-pack-loader.ts`
- fallback de runtime: canvas-first

## Estrutura padrao do pack

```
public/arcade/mutirao-do-bairro/
├── bg/
├── player/
├── entities/
├── pickups/
├── obstacles/
├── ui/
├── fx/
├── audio/
├── manifest.json
└── README.md
```

## Convencao de nomes

Formato obrigatorio:

`<categoria>-<nome>-v<versao>.<ext>`

Exemplos:
- `entity-hotspot-agua-v1.svg`
- `ui-event-chuva-forte-v2.svg`
- `player-coordenador-premium-v1.svg`
- `sfx-alerta-pressao-v1.ogg`

## Inventario por prioridade

P0 (obrigatorio para runtime atual):
- `bg/bg-bairro-premium-v1.svg`
- `player/player-coordenador-premium-v1.svg`
- `entities/entity-hotspot-*.svg`
- `ui/ui-action-*.svg`
- `ui/ui-hud-*.svg`
- `ui/ui-event-*.svg`

P1 (consistencia visual):
- `bg/bg-bairro-base-v1.svg`
- `player/player-coordenador-active.svg`
- `entities/entity-hotspot-base-v1.svg`

P2 (expansao futura):
- `pickups/*`
- `obstacles/*`
- `fx/*`
- `audio/*`

## Formatos aceitos

- vetorial: `.svg` (preferencial)
- raster: `.png` (fallback quando necessario)
- audio: `.ogg`/`.mp3` (quando pass de audio for liberado)

## Fallback atual

- loader resolve caminho do manifest e fallback por chave/default.
- se o asset premium falhar, o runtime usa asset base ou render canvas.
- jogo segue jogavel sem dependencia de carregamento perfeito.

## Checklist de QA visual

- [ ] desktop: intro, run e outcome carregam sem distorcao
- [ ] mobile: hotspots e HUD legiveis
- [ ] overlays de evento aparecem sem quebrar layout
- [ ] manifest cobre todos assets usados no runtime
- [ ] fallback de `bg` e `player` funciona sem crash
- [ ] sem regressao de performance em eventos de pico

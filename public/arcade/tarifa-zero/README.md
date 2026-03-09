# Asset Pack - Tarifa Zero RJ

Local: `public/arcade/tarifa-zero/`

Manifest oficial: `public/arcade/tarifa-zero/manifest.json`

## Estado atual

- visualVersion: `T35E-premium-v7`
- assetSet: `corredor-do-povo-v6`
- loader: `lib/games/arcade/tarifa-zero-assets.ts` + `lib/games/assets/asset-pack-loader.ts`
- fallback de runtime: canvas-first

## Estrutura padrao do pack

```
public/arcade/tarifa-zero/
├── bg/
├── player/
├── entities/
├── pickups/
├── obstacles/
├── ui/
├── fx/
├── audio/
├── transport/
├── manifest.json
└── README.md
```

Observacao: `transport/` e legado util do jogo atual. O padrao global prioriza `entities/`, `pickups` e `obstacles`.

## Convencao de nomes

Formato obrigatorio:

`<categoria>-<nome>-v<versao>.<ext>`

Exemplos:
- `bg-skyline-far-v1.svg`
- `pickup-apoio-territorial-v2.svg`
- `ui-hud-progress-frame-v2.svg`
- `sfx-mutirao-boost-v1.ogg`

Regras:
- minusculas
- hifen como separador
- sem espacos
- versao explicita no nome

## Inventario por prioridade

P0 (obrigatorio para runtime atual):
- `bg/*`
- `player/player-bus-default.svg`
- `pickups/*`
- `obstacles/*`
- `ui/ui-hud-*`, `ui/ui-icon-*`, `ui/ui-badge-*`

P1 (qualidade visual):
- `ui/ui-final-card-premium.svg`
- `ui/ui-qr-frame.svg`
- variantes de pickup/evento por fase

P2 (expansao futura):
- `fx/*`
- `audio/*`
- `entities/*` dedicados

## Formatos aceitos

- vetorial: `.svg` (preferencial)
- raster: `.png` (fallback quando SVG nao for viavel)
- audio: `.ogg`/`.mp3` (quando o pass de audio for liberado)

## Fallback atual

- ausencia de asset nao interrompe gameplay.
- loader tenta caminho do manifest e fallback por chave/default.
- se imagem nao carregar, render canvas continua responsavel por leitura do jogo.

## Checklist de QA visual

- [ ] desktop: intro, run e outcome sem quebra de layout
- [ ] mobile: HUD e entidades legiveis em viewport estreito
- [ ] todos os assets do manifest resolvem caminho valido
- [ ] fallback funciona com arquivo faltante (sem crash)
- [ ] sem regressao de FPS por assets pesados
- [ ] sem acoplamento de logica de gameplay ao carregamento de asset

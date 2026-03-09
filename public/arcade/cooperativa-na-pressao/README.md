# Asset Pack - Cooperativa na Pressao

Local: `public/arcade/cooperativa-na-pressao/`

Manifest oficial: `public/arcade/cooperativa-na-pressao/manifest.json`

## Estado atual

- visualVersion: `T42B-tuned`
- assetSet: `cooperativa-p0`
- fallback de runtime: canvas-first

## Estrutura padrao do pack

```
public/arcade/cooperativa-na-pressao/
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
- `bg-cooperativa-base-v1.svg`
- `entity-estacao-coop-v1.svg`
- `ui-hud-pressao-v1.svg`

## Inventario por prioridade

P0 (ativo hoje):
- `bg/bg-cooperativa-base-v1.svg`
- `player/player-coordenador-coop-v1.svg`
- `entities/entity-estacao-coop-v1.svg`
- `ui/ui-hud-estabilidade-v1.svg`
- `ui/ui-hud-pressao-v1.svg`
- `ui/ui-badge-operacional-v1.svg` (T47 validacao end-to-end do fluxo)

P1 (proximo pass visual):
- variacoes por estacao e fase
- icones de evento/colapso dedicados

P2 (bloqueado ate liberar premium):
- `pickups/*`
- `obstacles/*`
- `fx/*`
- `audio/*`

## Fallback atual

- se asset faltar, gameplay continua via render canvas.
- sem acoplamento de logica de jogo a carregamento de imagem.

## Checklist de QA visual

- [ ] desktop e mobile com HUD legivel
- [ ] estados criticos visiveis mesmo sem asset premium
- [ ] manifest sincronizado com pack P0
- [ ] sem regressao de performance

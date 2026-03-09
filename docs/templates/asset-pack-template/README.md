# Asset Pack Template

Template oficial para criar novos packs de assets com padrao do hub.

## Estrutura minima

```
public/<line>/<slug>/
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

`<categoria>-<nome>-v<versao>.<ext>`

Exemplos:
- `bg-bairro-base-v1.svg`
- `entity-hotspot-agua-v1.svg`
- `ui-hud-pressure-v2.svg`

## Placeholders minimos

- `fx/.gitkeep`
- `audio/.gitkeep`
- `pickups/.gitkeep` (se nao houver pickups no P0)
- `obstacles/.gitkeep` (se nao houver obstacles no P0)

## Contrato operacional

1. Criar pasta do pack.
2. Adicionar assets P0.
3. Atualizar manifest.
4. Rodar `npm run assets:audit`.
5. Rodar `npm run test:assets-smoke`.
6. Integrar no runtime.

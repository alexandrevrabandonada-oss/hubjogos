# Asset Pack - Bairro Resiste

Local: `public/arcade/bairro-resiste/`

Manifest oficial: `public/arcade/bairro-resiste/manifest.json`

## Estado atual

- visualVersion: `T51-preproducao-v1`
- assetSet: `bairro-resiste-p0-placeholders`
- integracao runtime: ainda nao iniciada (pre-producao forte)
- fallback planejado: canvas-first

## Estrutura padrao do pack

```
public/arcade/bairro-resiste/
├── bg/
├── player/
├── entities/
├── ui/
├── fx/
├── manifest.json
└── README.md
```

## Convencao de nomes

Formato obrigatorio:

`<categoria>-<nome>-v<versao>.<ext>`

Exemplos:
- `bg-bairro-base-v1.svg`
- `player-brigada-base-v1.svg`
- `entity-hotspot-agua-v1.svg`
- `ui-action-defender-v1.svg`

Regras:
- minusculas
- hifen como separador
- sem espacos
- versao explicita no nome

## Inventario minimo P0 (pre-implementacao)

- `bg/bg-bairro-base-v1.svg`
- `player/player-brigada-base-v1.svg`
- `entities/entity-hotspot-agua-v1.svg`
- `entities/entity-hotspot-moradia-v1.svg`
- `entities/entity-hotspot-mobilidade-v1.svg`
- `entities/entity-hotspot-saude-v1.svg`
- `ui/ui-hud-integridade-v1.svg`
- `ui/ui-hud-rede-v1.svg`
- `ui/ui-hud-pressao-v1.svg`
- `ui/ui-hud-mutirao-v1.svg`
- `ui/ui-alerta-critico-v1.svg`

## Formatos aceitos

- vetorial: `.svg` (preferencial)
- raster: `.png` (fallback quando necessario)

## Politica de fallback

- ausencia de asset nao pode travar jogo.
- manifest deve apontar fallback por chave e fallback default.
- runtime futuro deve continuar funcional com render canvas caso asset falhe.

## Checklist de QA do pack (pre-runtime)

- [x] estrutura de pastas completa
- [x] manifest com chaves e fallback mapeados
- [x] naming padronizado
- [x] placeholders P0 prontos para drop-in
- [x] tamanho de assets adequado para mobile (SVGs)


## Atualização T56
Os SVGs placeholders P0 foram gerados fisicamente para cumprir a validação P0 e remover o bloqueio estrutural.
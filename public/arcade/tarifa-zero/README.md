# Pipeline de Assets - Tarifa Zero RJ

Localizacao: `public/arcade/tarifa-zero/`

Criado em: T35A (2026-03-07)

Atualizado em: T35E (2026-03-07)

Proposito: organizar, versionar e integrar os assets reais do arcade sem quebrar gameplay, performance ou fallback.

## Versao ativa

- `visualVersion`: `T35E-premium-v7`
- `assetSet`: `corredor-do-povo-v1`
- Runtime: asset-first com fallback canvas

## Estrutura de diretorios

```
public/arcade/tarifa-zero/
├── bg/
├── player/
├── transport/
├── obstacles/
├── pickups/
├── ui/
└── README.md
```

## Convencao de nomes

Formato geral:

`{categoria}-{nome}-{variante}.{ext}`

Regras:
- minusculas sempre
- hifen como separador
- sem espacos
- nomes funcionais e descritivos
- variantes claras quando houver (`default`, `main`, `compact`, `event`)

## Assets produzidos neste pass

### Linha A - Skyline/Corredor

- `bg/bg-skyline-far.svg`
- `bg/bg-skyline-mid.svg`
- `bg/bg-corredor-road.svg`

Uso:
- fundo distante industrial/urbano
- camada media popular/urbana
- corredor vertical com leitura clara de lanes

### Linha B - Transporte

- `player/player-bus-default.svg`
- `transport/transport-bus-main.svg`
- `transport/transport-bus-compact.svg`
- `transport/transport-bus-event.svg`

Uso:
- player principal do runtime
- variantes para materiais, estados futuros e cards

### Linha C - Obstaculos e pickups

Obstaculos:
- `obstacles/obstacle-catraca.svg`
- `obstacles/obstacle-barreira-pesada.svg`
- `obstacles/obstacle-bloqueio-sequencia.svg` (T35E - variante dedicada)
- `obstacles/obstacle-zona-pressao.svg`

Pickups:
- `pickups/pickup-apoio.svg`
- `pickups/pickup-apoio-cadeia.svg`
- `pickups/pickup-apoio-territorial.svg` (variante)
- `pickups/pickup-mutirao.svg`
- `pickups/pickup-mutirao-bairro.svg` (variante)
- `pickups/pickup-mutirao-sindical.svg` (variante)
- `pickups/pickup-individualismo.svg`
- `pickups/pickup-individualismo-tentador.svg` (variante)
- `pickups/pickup-individualismo-cluster.svg` (T35E - variante dedicada)
- `pickups/pickup-chance-rara.svg`
- `pickups/pickup-chance-abertura.svg` (variante)
- `pickups/pickup-chance-virada.svg`

### Linha D - HUD e final card

- `ui/ui-hud-progress-frame.svg`
- `ui/ui-hud-progress-fill.svg`
- `ui/ui-hud-meter-frame.svg`
- `ui/ui-icon-combo.svg`
- `ui/ui-icon-score.svg`
- `ui/ui-badge-phase.svg`
- `ui/ui-badge-event.svg`
- `ui/ui-final-card-premium.svg`
- `ui/ui-qr-frame.svg`
- `ui/ui-button-replay.svg`
- `ui/ui-button-next.svg`

## Integracao atual no runtime

Ativo via `drawImage` com cache:
- background
- player
- todas as entidades (pickup e obstáculos)
- ui/hud elements
- variantes dedicadas implementadas no T35E

## Linha T35E - Premium coeso

Objetivo: transformar o jogo em experiência visualmente mais coesa e premium.

### Variantes dedicadas criadas

1. **obstacle-bloqueio-sequencia.svg**
	- Substitui composição de 2x barreira-pesada + linha pontilhada
	- Visual coeso de bloqueio sequencial vertical
	- Melhor leitura em movimento

2. **pickup-individualismo-cluster.svg**
	- Substitui composição de 3x individualismo base
	- Cluster visualmente unificado
	- Identidade distinta de individualismo coletivo

### Melhorias visuais T35E

- **Transição de fase**: já implementada no T35D, validada funcionando
- **Final premium integrado**: card de resultado com asset premium, scoreboards detalhados
- **CTAs refinados**: ordem clara (replay → próximo jogo → compartilhar → participar)
- **Visual version bump**: T35E-premium-v7 exposto no HUD e /estado

### Smoke test

Criado em `tests/e2e/tarifa-zero-t35e-premium.spec.ts`:
- Validação de carregamento e assets
- Validação de variantes dedicadas
- Validação de final premium e CTAs
- Teste completo de run (55s)
- pickups
- obstaculos
- HUD principal

Ativo no pos-run:
- frame premium
- score/fase/combo cards
- CTA premium de replay
- CTA premium de proximo jogo

## Fallback

Se um asset nao carregar:
- o runtime continua renderizando com desenho em canvas
- gameplay nao deve quebrar
- a integracao e gradual e tolerante a falha

## Tamanhos de referencia

- player: `64-72px` no canvas
- pickups comuns: `48-56px`
- pickups raros: `56-60px`
- obstaculos comuns: `56px`
- obstaculos pesados: `60-68px`
- badges HUD: largura proporcional ao viewport

## Prioridade para proximos passes

1. animacoes dedicadas por lane e impacto
2. variantes por fase e por evento
3. refinamento do final card com QR frame interno no proprio componente
4. sprites alternativos para dano, troca de lane e power states

## Checklist operacional

- asset novo precisa seguir nomenclatura
- manter SVG leve e sem metadata inutil
- validar leitura em mobile e desktop
- preservar fallback canvas
- documentar aqui quando o asset entrar no runtime

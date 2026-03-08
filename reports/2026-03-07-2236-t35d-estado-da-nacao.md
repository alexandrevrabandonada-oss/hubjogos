# T35D - Estado da Nacao

Data: 2026-03-07 22:36

Escopo: Tarifa Zero RJ - Corredor do Povo

## Diagnostico inicial

Estado de entrada identificado:
- o runtime do Tarifa Zero estava concentrado em `lib/games/arcade/tarifa-zero-corredor.ts`
- a renderizacao do jogo era canvas puro, com shapes e gradientes desenhados manualmente para:
  - background
  - player
  - pickups
  - obstaculos
  - HUD interno
- o componente `ArcadeCanvasRuntime` tinha HUD externo simples e sem metadados de versao visual
- o pipeline local `public/arcade/tarifa-zero/` existia, mas estava essencialmente vazio e ainda descrevia um plano futuro
- o pos-run usava `FinalShareCard` universal, sem frame premium especifico do Tarifa Zero

Pontos de integracao mais urgentes mapeados:
1. background em camadas para tirar o mundo do estado de placeholder
2. player mais reconhecivel e alinhado com a linha de transporte
3. pickups e obstaculos com silhueta clara em escala pequena
4. HUD com identidade propria e mais leitura de fase/evento
5. pos-run premium para consolidar a Linha D

## Assets produzidos por linha

### Linha A - Skyline/Corredor

Produzidos:
- `public/arcade/tarifa-zero/bg/bg-skyline-far.svg`
- `public/arcade/tarifa-zero/bg/bg-skyline-mid.svg`
- `public/arcade/tarifa-zero/bg/bg-corredor-road.svg`

Objetivo entregue:
- fundo territorializado com leitura industrial/urbana
- corredor vertical com pista clara e separacao de lanes

### Linha B - Transporte

Produzidos:
- `public/arcade/tarifa-zero/player/player-bus-default.svg`
- `public/arcade/tarifa-zero/transport/transport-bus-main.svg`
- `public/arcade/tarifa-zero/transport/transport-bus-compact.svg`
- `public/arcade/tarifa-zero/transport/transport-bus-event.svg`

Objetivo entregue:
- player migrado para onibus amarelo estilizado
- base pronta para eventos, cards e futuras variantes

### Linha C - Obstaculos e Pickups

Produzidos:
- `public/arcade/tarifa-zero/obstacles/obstacle-catraca.svg`
- `public/arcade/tarifa-zero/obstacles/obstacle-barreira-pesada.svg`
- `public/arcade/tarifa-zero/obstacles/obstacle-zona-pressao.svg`
- `public/arcade/tarifa-zero/pickups/pickup-apoio.svg`
- `public/arcade/tarifa-zero/pickups/pickup-apoio-cadeia.svg`
- `public/arcade/tarifa-zero/pickups/pickup-mutirao.svg`
- `public/arcade/tarifa-zero/pickups/pickup-individualismo.svg`
- `public/arcade/tarifa-zero/pickups/pickup-chance-rara.svg`
- `public/arcade/tarifa-zero/pickups/pickup-chance-virada.svg`

Objetivo entregue:
- silhueta mais clara em movimento
- familias visuais coerentes por categoria
- leitura forte em tamanhos pequenos

### Linha D - HUD e Final Card

Produzidos:
- `public/arcade/tarifa-zero/ui/ui-hud-progress-frame.svg`
- `public/arcade/tarifa-zero/ui/ui-hud-progress-fill.svg`
- `public/arcade/tarifa-zero/ui/ui-hud-meter-frame.svg`
- `public/arcade/tarifa-zero/ui/ui-icon-combo.svg`
- `public/arcade/tarifa-zero/ui/ui-icon-score.svg`
- `public/arcade/tarifa-zero/ui/ui-badge-phase.svg`
- `public/arcade/tarifa-zero/ui/ui-badge-event.svg`
- `public/arcade/tarifa-zero/ui/ui-final-card-premium.svg`
- `public/arcade/tarifa-zero/ui/ui-qr-frame.svg`
- `public/arcade/tarifa-zero/ui/ui-button-replay.svg`
- `public/arcade/tarifa-zero/ui/ui-button-next.svg`

Objetivo entregue:
- HUD principal com placas e badges reais
- pos-run premium com score, fase, combo, frame e CTA tematico

## Assets integrados no jogo

Integrados no runtime arcade:
- background em layers
- player principal
- pickups principais
- obstaculos principais
- HUD interno do canvas
- badge de fase
- badge de evento

Integrados fora do canvas:
- HUD externo com `visualVersion` e `assetSet`
- pos-run premium em `TarifaZeroArcadeGame.tsx`
- indicador simples de versao visual em `/estado`

Infra criada:
- `lib/games/arcade/tarifa-zero-assets.ts` com cache de imagens e draw asset-first
- `Game.visualVersion` e `Game.assetSet` para expor o estado visual do arcade

## Fallback ainda existente

Fallback canvas preservado para:
- todos os assets do runtime, caso a imagem nao carregue
- background base e overlays de lane
- player
- pickups
- obstaculos
- HUD principal

Fallback/composicao ainda usados mesmo com assets:
- `apoio-territorial` usa base de apoio com overlay textual
- `mutirao-bairro` e `mutirao-sindical` usam base de mutirao com marcador leve
- `bloqueio-sequencia` compoe duas barreiras pesadas
- `individualismo-cluster` compoe multiplos assets/base shapes
- `chance-abertura` reaproveita asset de chance rara com overlay

## Tuning de escala e leitura

Ajustes aplicados:
- player em faixa de `68px` para dar leitura de protagonista/veiculo sem invadir a lane vizinha
- pickups comuns entre `48px` e `56px`
- pickups raros em `60px`
- obstaculos pesados acima de `60px`
- meter lateral mantido estreito com frame dedicado para nao roubar area jogavel
- cards de stats e combo deslocados para placas mais opacas e com melhor contraste
- flash de dano agora prioriza a lane atingida, reduzindo ruido full-screen

## Resultado de lint, type-check, test, build e verify

`npm run lint`
- passou sem warnings ou erros

`npm run type-check`
- passou

`npm run test:unit`
- 6 arquivos de teste passaram
- 15 testes passaram

`npm run build`
- passou
- avisos de Sentry/instrumentation continuaram aparecendo no build, mas sao preexistentes e nao foram introduzidos por este tijolo

`npm run verify`
- passou
- 52 checks / 52 aprovados

## Riscos restantes

- nao houve smoke visual manual automatizado do gameplay em browser neste ciclo; a garantia principal aqui veio de compilacao, testes e preservacao do fallback
- o frame de QR premium ainda envolve o card final por fora; o QR interno do `FinalShareCard` universal nao foi refeito neste tijolo
- algumas variantes de entidade ainda reutilizam um asset base com overlay, em vez de possuir sprite dedicado
- os avisos de configuracao do Sentry no build continuam abertos e podem virar manutencao futura

## Proximos passos recomendados

1. criar variantes dedicadas para `apoio-territorial`, `mutirao-bairro`, `mutirao-sindical`, `bloqueio-sequencia` e `chance-abertura`
2. adicionar transicao visual explicita entre fases usando a infraestrutura de badge e fase ja ativa
3. levar o frame premium para dentro do `FinalShareCard` se essa identidade for desejada em outros arcades
4. executar smoke visual/e2e focado em `/arcade/tarifa-zero-corredor` para validar leitura real em viewport mobile e desktop
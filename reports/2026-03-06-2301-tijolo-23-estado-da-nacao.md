# Estado da Nação - Tijolo 23

Data: 2026-03-06 23:01
Status: concluído

## Diagnóstico do estado anterior (Tijolo 22)

- Avatar oficial existia como V1 placeholder técnico (`public/campaign/avatar/base.svg`).
- Card final universal já estava ativo, mas sem QR de reentrada.
- Pipeline de assets já estruturado, porém sem variantes de expressão operacionais.
- Share pages funcionavam bem, com espaço para reforço de conversão e identidade.

Limitações atacadas neste tijolo:
- baixa reconhecibilidade visual do avatar V1
- ausência de QR no card final
- falta de minigame quick novo para validar throughput
- lacunas de tracking para QR e variantes de avatar

## Avatar V2 criado

Assets novos em `public/campaign/avatar/v2/`:
- `portrait-neutral.svg`
- `portrait-smile.svg`
- `portrait-determined.svg`
- `portrait-glasses.svg`

Componente atualizado:
- `components/campaign/CampaignAvatar.tsx`
- suporte a `expression: neutral | smile | determined`
- suporte a `glasses: auto | on | off`
- contrato `fullBody` preparado para evolução futura (sem uso ativo ainda)

## Card final com QR criado

Componente evoluído:
- `components/campaign/FinalShareCard.tsx`
- QR integrado via `components/campaign/GameQRCode.tsx`
- CTA reforçado com mensagem de pré-campanha

Comportamento:
- QR aponta para reentrada (`/share/[game]/[result]` ou `/play/[slug]`)
- clique no QR gera tracking de proxy de scan
- layout mobile-first preservado

## Minigame quick real criado

Novo jogo:
- slug: `custo-de-viver`
- engine: quiz real
- tempo: 1-2 min
- perfil: quick, rejogável, compartilhável

Arquivos principais:
- `lib/games/quiz/data/custo-de-viver.ts`
- `lib/games/quiz/registry.ts`
- `lib/games/catalog.ts`
- `lib/games/quiz/types.ts`
- `lib/games/quiz/engine.ts`

## Integrações (catálogo/share/estado)

- Catálogo: minigame integrado com taxonomia editorial (`pace=quick`, série, território, linha temática).
- Share pages: usam avatar V2 + card com QR.
- Estado (`/estado`): seção de card/avatar ampliada com novos eventos de QR, avatar V2 e quick game.

## Tracking adicionado/refinado

Novos eventos:
- `final_card_qr_view`
- `final_card_qr_click`
- `avatar_v2_rendered`
- `avatar_expression_rendered`
- `quick_minigame_completion`
- `quick_minigame_replay`

Arquivos:
- `lib/analytics/events.ts`
- `lib/analytics/track.ts`
- `app/share/[game]/[result]/SharePageClient.tsx`
- `components/games/quiz/QuizEngine.tsx`

## Validação técnica

Resultados dos gates:
- `npm run lint`: OK
- `npm run type-check`: OK
- `npm run test:unit`: OK (15/15)
- `npm run build`: OK
- `npm run verify`: OK (52/52)
- `npm run test:e2e`: OK (15 passed)

Observações:
- Warnings do Sentry/Next já existentes, sem bloquear build/testes.

## Limitações restantes

- Avatar V2 já funcional e reconhecível, mas ainda passível de refinamento artístico profissional.
- Full-body está só no contrato de componente, sem pack visual dedicado.
- QR click é proxy de scan; leitura de scan real depende de camada externa (analytics de destino).
- A/B com/sem QR ainda não foi ativado como experimento formal.

## Próximos passos recomendados (Tijolo 24)

1. Refinamento artístico profissional do avatar V2 e kit de poses full-body.
2. Ativar experimento A/B de card com/sem QR.
3. Criar segundo minigame quick para comparar throughput.
4. Evoluir leitura de conversão por série/território no `/estado`.

## Resumo explícito solicitado

1. avatar V2 real criado:
- sim. 4 assets V2 entregues e componente atualizado.

2. card final com QR real criado:
- sim. QR integrado no card final universal com tracking.

3. minigame quick real criado:
- sim. `custo-de-viver` integrado no runtime real de quiz.

4. o que fica para o Tijolo 24:
- refinamento artístico profissional, full-body visual, A/B de QR e ampliação da linha quick.

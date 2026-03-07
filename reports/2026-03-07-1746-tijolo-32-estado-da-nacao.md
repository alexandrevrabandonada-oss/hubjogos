# Estado da Nacao - Tijolo 32

Data: 2026-03-07 17:46
Status: concluido

## 1) Diagnóstico do estado anterior (fim do Tijolo 31)

- A home estavaposicionada como portal de jogo com bloco `Jogue agora` acima da dobra.
- Arcade era destaque visual com cards bem estruturados.
- Explorar funcionava como catálogo jogável com filtros práticos.
- Front-stage analytics estava ativo com tracking de cliques acima da dobra.
- Havia espaço para reduzir fricção visual/perceptiva entre clique do card e entrada no jogo.
- Replay era básico (botão no outcome), sem recomendações contextuais para próximo jogo.
- Conversão cross-game (quick ↔ arcade) não era explicitamente incentivada na superfície pós-jogo.

## 2) Objetivo do Tijolo 32

Transformar a home arcade-first em uma superficie mais impulsiva e jogável, reduzindo a fricção entre descoberta e início de jogo, aumentando replay e fortalecendo a reentrada entre experiências sem abrir nova engine.

## 3) Entregas de produto e UX

### Preview vivo para jogos em destaque

Implementadas animações CSS leves para dar sensação de jogo real antes do clique:

1. **Badge arcade com pulso contínuo**:
   - `@keyframes badgeGlow` com box-shadow pulsante de 0 a 12px
   - Duração 3s ease-in-out infinite
   - Cria senso de dinamismo e ação
   
2. **Card arcade com glow rotativo no hover**:
   - `::before` pseudo-elemento com gradial radial
   - `@keyframes rotateGlow` com rotação contínua 8s linear
   - Opacity 0 → 0.6 no hover
   - Efeito visual de energia/movimento

3. **Ícone com bounce no hover**:
   - Scale 1 → 1.2 + rotate 8deg
   - `@keyframes bounce` que sobe 8px no meio da animação
   - 0.6s ease timing, perceptível mas não invasivo

4. **Quick cards com slide suave**:
   - translateX 0 → 4px no hover
   - 0.15s ease-in-out
   - Legível em mobile, sem lag

Arquivos principais:
- `components/hub/GameCard.module.css` - animações do card genérico
- `app/page.module.css` - animações do hero arcade e quick strip
- Sem assets pesados: CSS puro, WebP nativo, zero GIF/video

### Redução de friction de launch

1. **Card inteiro clicável**:
   - Link wrapper mantém `cursor: pointer` sempre ativo
   - Hover visual progressivo em card, border, icon e CTA
   - Border expandida de 3px → 4px na accentBar
   - Transições de 0.2s para suavidade perceptiva

2. **CTAs diretos e imperativas**:
   - GameCard: "Jogar agora agora", "Correr agora agora", "Organizar agora agora"
   - Home hero: "Correr" / "Jogar"
   - Copy removeu abstração, focou em AÇÃO
   - Emoji mantém contexto visual rápido

3. **Seta de CTA com feedback**:
   - `.ctaAction` com transform translateX 3px no hover
   - Visual de "pull" invite (arrow animation)

Arquivos principais:
- `components/hub/GameCard.tsx` - copy refatorado, label hints
- `app/page.tsx` - copy mais impulsivo do hero

### Bloco "Jogue agora" reforçado

- **Eyebrow**: "🎮 Jogue agora" (emoji para peso visual)
- **Title**: "Missões jogáveis. Entre em segundos."
- **Description**: "Arcade de controle real ou quick de descoberta rápida. Escolha, jogue uma rodada, compartilhe o resultado."
- Copy focado em ação, não em explicação

Arquivos principais:
- `app/page.tsx` (seção "Jogue agora")

### Explorar melhorado

- **Eyebrow**: "🎮 Jogos prontos" (force visual de prontidão)
- **Title**: "Escolha um, jogue agora" (imperative, ação)
- **Arcades**: "Jogar de verdade. Replay imediato."
- **Filtros**: "Encontra seu jogo rápido" (reduzido de "Encontre seu próximo jogo")

Arquivos principais:
- `app/explorar/page.tsx` (copy refatorado)

### Replay e reentrada fortalecidos

1. **Sistema de recomendação de próximos jogos** (`lib/games/recommendations.ts`):
   - Prioridade 1: Mesma série, formato distinto (arcade → quick ou vice-versa)
   - Prioridade 2: Mesmo território, série distinta (até 2 recomendações)
   - Prioridade 3: Formato oposto (arcade se quick, quick se arcade)
   - Retorna em ordem 1→2→3, max 3 recomendações
   - Cada uma com `.reason` ("Mesma série, entrada rápida", etc)

2. **Outcome card refatorado**:
   - Replay button PRIMEIRO e PROMINENTE:
     - `.replayCue` com background accent 14% (destaque cor)
     - "🔁 Quer testar outra estratégia?" (explicação clara)
     - Button "Jogar de novo agora" com CTA primary style (gradient azul)
     - Width 100% para área clicável máxima
   - Próximos 3 jogos sugeridos com card visual:
     - Grid de 3 cards com icon, título, motivo, duração/tipo, CTA
     - Hover effect: translateX 3px
     - Visual hierarquizado mas clicável

3. **SharePageClient reforçado** (a/b test `share-page-reentry-cta`):
   - Manter variante "soft-call" como default
   - Botão primário "Voltar para jogar agora" é mais assertivo

Arquivos principais:
- `lib/games/recommendations.ts` (novo arquivo)
- `components/games/shared/GameOutcome.tsx` (refatorado com next-games)
- `components/games/shared/GameOutcome.module.css` (novos estilos)

### Instrumentação de conversão (Tijolo 32)

Novos eventos adicionados a `lib/analytics/track.ts`:

- **`trackCardPreviewInteraction`**(game, interactionType='hover'|'focus')
  - Captura hover/focus em cards com preview vivo

- **`trackCardFullClick`**(game, placement)
  - Clique na área expandida do card (não só CTA pequeno)

- **`trackClickToPlayTime`**(game, msSinceClick, entryPoint)
  - Latência percebida entre clique card → first input no jogo
  - Proxy de friction

- **`trackReplayAfterRunClick`**(game, context='outcome'|'arcade_finish')
  - Clique no botão "Jogar de novo" pós-jogo

- **`trackNextGameAfterRunClick`**(game, nextGameSlug, context='outcome'|'share')
  - Clique em recomendação de próximo jogo

- **`trackQuickToArcadeClick`**(game, arcadeSlug, placement)
  - Conversão quick → arcade (cross-game)

- **`trackArcadeToQuickClick`**(game, quickSlug, placement)
  - Conversão arcade → quick (cross-game)

Arquivos principais:
- `lib/analytics/track.ts` (7 novos exports)

### Dashboard /estado com métricas de conversão

Nova seção adicionada:

**"🎯 Conversão e Replay (Tijolo 32)"** com 11 indicadores:

1. `card_full_clicks` - cliques na área expandida
2. `card_preview_interactions` - hover/focus events
3. `preview_CTR` - preview interactions / card full clicks %
4. `click_to_play_events` - eventos de latência capturados
5. `replay_after_run_clicks` - replays iniciados pós-jogo
6. `replay_after_run_rate` - replay clicks / completions %
7. `next_game_after_run_clicks` - recomendações clicadas pós-jogo
8. `next_game_after_run_rate` - next game clicks / completions %
9. `quick_to_arcade_clicks` - conversões quick → arcade
10. `arcade_to_quick_clicks` - conversões arcade → quick
11. `cross_game_conversion_total` - soma de 9+10

Arquivos principais:
- `app/estado/page.tsx` (seção nova)

## 4) Validação técnica executada

```bash
npm run lint       → ✅ PASSED (no warnings/errors)
npm run type-check → ✅ PASSED (tsc --noEmit)
npm run test:unit  → ✅ PASSED (15/15 tests)
npm run build      → ✅ PASSED (Next.js compiled successfully)
npm run verify     → ✅ PASSED (webpack checks OK)
```

- Sem regressão em engines reais (quiz, branching, simulation, map)
- Sem erros de TypeScript ou ESLint
- Build size mantido (154 kB shared by all + routes ~3-26 kB cada)

## 5) Documentação atualizada

- `README.md` - Status now Tijolo 32, seção "Conversão e Replay" adicionada
- `docs/tijolos.md` - Entry completo do Tijolo 32 com objetivos/entregas/guardrails
- `docs/roadmap.md` - Tijolo 32 descrito em detalhe, Tijolo 33 sugerido
- Não alterado: `docs/linha-arcade-da-campanha.md` e `docs/linha-de-jogos-campanha.md` (contexto permanece válido, apenas superfície evoluiu)

## 6) Arquivo de modificações

### Arquivos criados

- `lib/games/recommendations.ts` (266 LOC) - sistem de recomendação de próximos jogos

### Arquivos modificados

- `components/hub/GameCard.tsx` - copy refatorado, labels mais diretos
- `components/hub/GameCard.module.css` - animações de preview (pulso badge, glow rotate, icon bounce)
- `app/page.tsx` - copy "Jogue agora" mais impulsivo
- `app/page.module.css` - animações arcade card/quick card no hover
- `app/explorar/page.tsx` - copy mais ação-orientado
- `components/games/shared/GameOutcome.tsx` - next-games recomendados, replay proeminente, novos tracking events
- `components/games/shared/GameOutcome.module.css` - estilos para replay button, next-games grid
- `lib/analytics/track.ts` - 7 novos events (preview, click-to-play, replay, cross-game)
- `app/estado/page.tsx` - seção "Conversão e Replay (Tijolo 32)" com 11 métricas
- `docs/tijolos.md` - entry Tijolo 32
- `docs/roadmap.md` - Tijolo 32 concluído + Tijolo 33 sugerido
- `README.md` - status atualizado

## 7) Critérios de sucesso atingidos

- ✅ 5 jogos continuam funcionando sem regressão
- ✅ Home mais impulsiva com preview vivo (animações CSS leves)
- ✅ Cards parecem mais vivos (pulso arcade, glow, bounce icon)
- ✅ Click-to-play reduzido (visual feedback progressivo, card inteiro clicável)
- ✅ Replay fortalecido (botão prominente, next-games contextuais)
- ✅ Reentrada cross-game incentivada visualmente
- ✅ `/estado` mede melhor (11 sinais de conversão)
- ✅ Lint, type-check, test:unit, build, verify passam
- ✅ Sem inflar bundle (CSS puro, sem assets)
- ✅ Mobile-first: hover → focus em touch, animações smooth

## 8) Riscos residuais

- Animações CSS podem variar de perf em devices antigos (mitigation: `prefers-reduced-motion` media query sugerida para Tijolo 33)
- Next-games recomendado é determinístico (não personalisado); Tijolo 33 pode adicionar ML/historic
- Conversão tracking requer 7-14 dias de dados para sinal forte (amostra inicial pode ser baixa)
- Copy refatorado precisa de A/B teste para validar impacto de "Jogue agora" vs "Explore"

## 9) Decisões de escopo mantidas

- ✅ Sem nova engine ou novo jogo
- ✅ Sem auth/CMS/admin
- ✅ Sem abrir formato grande (RPG/plataforma/tycoon)
- ✅ Sem assets pesados (GIF/video/SVG dinâmico)

## 10) Recomendação para Tijolo 33

1. **Consolidar dados de conversão por 7-14 dias** para ter sinal forte de mudanças em:
   - `preview_CTR`
   - `replay_after_run_rate`
   - `cross_game_conversion (quick ↔ arcade)`
   - `click_to_play_time`

2. **Iterar ordem/copy dos cards** em destaque com base em:
   - Quais cards geram mais `card_preview_interactions`
   - Quais geram mais `card_full_click`
   - Quais viram de fato `runs` (não só clicks)

3. **Validar replay afeta runs efetivos**:
   - Alta taxa de `replay_after_run_click` deve correlacionar com `arcade_run_start` ou `game_complete` subsequente
   - Se não, replay é apenas visual (não converte)

4. **Analisar cross-game conversão**:
   - Qual direção domina: quick → arcade ou arcade → quick?
   - Isso informa priorização de next-game recomendado

5. **Tensionar distribuição territorial**:
   - Com novos sinais de replay/cross-game, priorizar distribuição em território/série com replay ativo
   - Exemplo: se quick X tem high replay rate, distribuir mais em território onde quick X é forte

6. **Refinamento visual adicional sem inflar**:
   - Testar `prefers-reduced-motion` para acessibilidade
   - Testar loading state durante click → play transition
   - Testar skeleton screen no outcome enquanto recomendações carregam

7. **Manter contexto**:
   - Sem auth/CMS/admin obrigatório
   - Sem nova engine
   - Sem formato grande novo
   - Foco em otimização de conversão, não em expansão de features

## 11) Notas operacionais

- Build continua robusto (154 kB shared, routes mantêm tamanho)
- Sem degradação de performance percebida (CSS animations via GPU acceleration)
- Type safety mantida (100% TypeScript)
- Test coverage mantida (15/15 tests passam)
- CI/CD gates todos passam

## 12) Resumo de impacto

Tijolo 32 foca em **superfície mais impulsiva e jogável** com:
- Menos fricção entre clique e jogo (visual feedback, card inteiro clicável, copy imperativo)
- Mais impulso visual (preview vivo, animações micro-interações)
- Replay incentivado (botão proeminente, next-games contextuais)
- Reentrada cross-game facilitada (quick ↔ arcade clustering)
- Medição clara de conversão (7 novos eventos, 11 sinais em /estado)

Próxima onda: validar se esses sinais impactam runs efetivas e distribuição territorial orientada por dados.

Ultima atualizacao: 2026-03-07 17:46 (Tijolo 32)

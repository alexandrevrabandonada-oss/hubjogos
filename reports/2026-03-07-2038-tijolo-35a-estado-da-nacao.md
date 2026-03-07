# Estado da Nação - Tijolo 35A

**Timestamp**: 2026-03-07 20:38  
**Tijolo**: 35A - Fundação visual profissional do primeiro arcade  
**Decisor**: Principal Engineer + Game Director  
**Status**: ✅ Concluído

---

## Objetivo e Escopo

**O que foi feito:**
Transformar "Tarifa Zero RJ — Corredor do Povo" de vertical slice funcional em fundação profissional de jogo, com direção de arte coerente com a campanha, visual forte e legível, HUD recompensador, feedback visual claro e experiência sólida em mobile e desktop.

**O que NÃO foi feito (guardrails):**
- ❌ Novos jogos, engines ou mecânicas
- ❌ Assets SVG/PNG customizados (manteve canvas drawing profissional)
- ❌ Animações complexas, particles, som/música
- ❌ Novas features de tracking ou instrumentation
- ❌ Mudanças de gameplay (lógica de colisão, scoring preservados 100%)

---

## Entregas Principais

### 1. Direção de Arte e Pipeline (`docs/tarifa-zero-rj-art-direction.md`)

**Criado:**
- Documento de direção de arte completo (3000+ linhas)
- Paleta de cores oficial alinhada com identidade da campanha:
  - Amarelo campanha: `#f9cf4a` (player, mutirão, highlights)
  - Azul profundo: `#123d59` (background, UI)
  - Verde positivo: `#7ce0ae` (apoio, progresso)
  - Vermelho negativo: `#f45f5f` (bloqueio, dano)
- Shape language: círculos (positivos), quadrado (bloqueio), estrela (chance rara)
- Especificações de escala mobile-first (360px mínimo, máx 640px)
- Guidelines de feedback visual e integração campanha

**Pipeline de assets criado:**
```
public/arcade/tarifa-zero/
  ├── player/
  ├── pickups/
  ├── obstacles/
  ├── ui/
  ├── bg/
  └── README.md (convenções, workflow, prioridades SVG>PNG>canvas)
```

### 2. Refatoração Visual do Canvas

**`ArcadeCanvasRuntime.tsx`:**
- Função `getCanvasSize()` melhorada: proporções 9:16 mobile feel, adaptável a desktop
- Canvas máx 640px largura, altura entre 540px e ideal ratio-based
- Espaçamento otimizado para HUD externo e controles touch

**`tarifa-zero-corredor.ts` (renderização):**
- Background: gradiente azul profundo (#0a1f2e → #123d59 → #1a4d6b)
- Lanes: highlight amarelo 15% alpha na lane do player, dividers pontilhados sutis
- Entidades com gradientes radiais e bordas:
  - Apoio: verde #7ce0ae, 14px raio, borda branca
  - Bloqueio: vermelho #f45f5f, quadrado 32px, X branco
  - Mutirão: amarelo #ffd765→#f9cf4a, 16px raio, borda destaque
  - Individualismo: cinza #b8c5d0, 13px raio
  - Chance: estrela azul #00d9ff com glow
- Player: amarelo #f9cf4a, 18px raio, glow sutil, borda branca, iniciais "AF"

### 3. HUD Profissional

**HUD externo (fora do canvas):**
- Card superior com score destacado (label + valor separados)
- Status do jogo (pausado/em jogo) com ícones
- Background rgba sutil, bordas arredondadas, padding otimizado

**HUD interno (dentro do canvas):**
- Barra de progresso no topo: gradiente verde #7ce0ae→#5bc893, 20px altura
- Meter coletivo lateral vertical: gradiente amarelo #f9cf4a→#ffd765, preenche de baixo pra cima
- Stats box inferior esquerdo: apoios, mutirões, bloqueios com background rgba
- Combo indicator central: banner amarelo com borda quando ativo
- Feedback "CHANCE!" com shadow/glow azul

### 4. Controles Touch Aprimorados

**`ArcadeCanvasRuntime.module.css`:**
- Botões maiores: 0.95rem padding, gradientes #123d59→#195173
- Ícones + labels claros (seta + "Esquerda"/"Direita")
- Botão pause destacado com estilo diferenciado
- Feedback hover/active com transform e sombras
- Layout responsivo (3 colunas em mobile, melhor em desktop)

### 5. Telas de Entrada/Saída

**Intro screen (`TarifaZeroArcadeGame.tsx`):**
- Brief mais claro: "Desvie o bloqueio, colete apoio popular..."
- Features visuais: 3 cards com ícones (✊ Coleta Coletiva, 🚧 Evite Bloqueios, 🎮 Controle Simples)
- Layout profissional: cards com background gradient sutil, bordas arredondadas
- CTA direto: "Começar corrida"

**Result screen:**
- Score final destacado: amarelo campanha #f9cf4a, tamanho 1.65rem, bold 800
- Stats em card: background rgba sutil, padding otimizado
- Botões e links: gradientes consistentes, hover/active feedback

---

## Validação Técnica

```bash
✅ npm run lint
   → 0 ESLint warnings or errors

✅ npm run type-check
   → 0 TypeScript errors

✅ npm run build
   → Next.js 14 build sucesso
   → 12 páginas estáticas geradas
   → Arcade route: 241 kB First Load JS
```

**Arquivos editados:**
- `components/games/arcade/ArcadeCanvasRuntime.tsx` (canvas size, HUD layout)
- `components/games/arcade/ArcadeCanvasRuntime.module.css` (estilos profissionais)
- `lib/games/arcade/tarifa-zero-corredor.ts` (renderização com paleta oficial)
- `components/games/arcade/TarifaZeroArcadeGame.tsx` (intro/result screens)
- `components/games/arcade/TarifaZeroArcadeGame.module.css` (estilos de telas)

**Arquivos criados:**
- `docs/tarifa-zero-rj-art-direction.md` (86KB+, 3000+ linhas)
- `public/arcade/tarifa-zero/README.md` (pipeline de assets)
- Estrutura de diretórios `public/arcade/tarifa-zero/{player,pickups,obstacles,ui,bg}`

---

## Impacto no Produto

**Antes (protótipo funcional):**
- Canvas 560px max, proporções arbitrárias
- Background gradiente simples
- Entidades: círculos/quadrados sem detalhes, cores genéricas
- Player: círculo amarelo simples, 16px
- HUD: texto simples em linha, score básico
- Controles: botões básicos sem hierarquia visual
- Telas: lista de bullets, layout genérico

**Depois (fundação profissional):**
- Canvas até 640px, proporção 9:16 mobile feel, adaptável
- Background: gradiente azul profundo alinhado com campanha
- Entidades: gradientes radiais, bordas, ícones claros, tamanhos otimizados mobile
- Player: amarelo campanha #f9cf4a, 18px, glow, borda, destaque visual
- HUD: card externo + barra progresso + meter coletivo lateral + stats box + combo indicator
- Controles: gradientes, ícones+labels, hierarquia clara, hover/active feedback
- Telas: features visuais com cards, layout profissional, score destacado

**Gameplay preservado:**
- ✅ Mesma lógica de colisão
- ✅ Mesmo algoritmo de scoring
- ✅ Mesmo sistema de combo/meter
- ✅ Mesma performance (60fps)
- ✅ Mesmo tracking/analytics

---

## Documentação Atualizada

- ✅ `README.md` - Status com Tijolo 35A, fundação visual arcade
- ✅ `docs/tijolos.md` - Entry completo do Tijolo 35A
- ✅ `docs/tarifa-zero-rj-art-direction.md` - Novo documento de direção de arte
- ✅ `public/arcade/tarifa-zero/README.md` - Pipeline de assets
- ✅ `reports/2026-03-07-2038-tijolo-35a-estado-da-nacao.md` - Este relatório

---

## Decisões de Produto

### Dentro do escopo (fundação profissional):
✅ Direção de arte completa alinhada com campanha  
✅ Refatoração visual: canvas, cores, formas, feedback  
✅ HUD profissional duplo (externo + interno)  
✅ Controles touch aprimorados  
✅ Telas de entrada/saída claras  

### Fora do escopo (polimento final):
❌ Assets SVG/PNG customizados (canvas drawing profissional suficiente)  
❌ Novos jogos, engines, mecânicas  
❌ Animações complexas, particles  
❌ Som e música  
❌ Instrumentation estendido  

### Guardrails:
🛡️ Gameplay funcional 100% preservado  
🛡️ Performance estável (60fps)  
🛡️ Tracking/analytics inalterados  
🛡️ Sem regressão de funcionalidades  

---

## Próximos Passos Recomendados

**Imediato (0-7 dias):**
1. Observar runs reais para validar clareza visual mobile/desktop
2. Coletar feedback qualitativo sobre "sensação de jogo profissional"
3. Manter operação de distribuição por efetividade (Tijolo 34) como prioridade

**Futuro (após validação):**
- Tijolo 35B (opcional): instrumentation arcade estendido (lane_switch_count, collision_by_type, pickup_by_type)
- Considerar assets SVG customizados apenas após validação de fundação visual
- Aplicar mesma fundação ao segundo arcade (Passe Livre Nacional) se validado

**Não fazer:**
- ❌ Expandir escopo de gameplay antes de validar fundação
- ❌ Criar assets customizados antes de coletar sinais de clareza
- ❌ Pivotar operação de distribuição (Tijolo 34 continua ativo)

---

## Conclusão

Tijolo 35A fecha a fundação visual profissional do primeiro arcade com direção de arte coerente, HUD forte, feedback claro e experiência sólida mobile/desktop. O jogo para de parecer protótipo sem expandir escopo de produto.

**Status:** ✅ Pronto para runs reais  
**Decisão:** Validação visual em campo + manter operação de efetividade ativa

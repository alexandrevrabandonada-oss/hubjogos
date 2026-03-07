# Estado da Nação — Tijolo 22

**Data:** 2026-03-06 22:15  
**Tijolo:** 22 — Avatar oficial e card final universal  
**Status:** ✅ Concluído  

---

## Resumo Executivo

Tijolo 22 estabeleceu a **base visual reutilizável** que sustenta o crescimento organizado do hub de jogos da pré-campanha de Alexandre Fonseca para Deputado Estadual RJ.

**Três pilares executados:**
1. **Avatar oficial estilizado** de Alexandre Fonseca como personagem principal recorrente
2. **Card final universal compartilhável** para todos os jogos
3. **Pipeline de assets coerente** para campanha e futuros jogos

**Resultado:** Todo jogo agora termina com card consistente carregando marca e chamada da pré-campanha, com avatar oficial presente e rastreamento completo de engajamento.

---

## Entregas Realizadas

### 1. Avatar Oficial de Alexandre Fonseca

**Documento mestre:**
- `docs/avatar-oficial-alexandre-fonseca.md` — Governança, variantes, uso, versioning
- Define personagem principal: rosto de Alexandre Fonseca estilizado/gameficado
- Documenta limitação atual: V1 é placeholder técnico SVG
- Estabelece roteiro para refinamento profissional V2

**Asset base:**
- `public/campaign/avatar/base.svg` — SVG 400x400 com retrato estilizado
- Representa conceito e estrutura, não asset final
- Inclui badge "AF" e estética consistente com identidade visual
- Pronto para substituição sem alteração de código

**Componente reutilizável:**
- `components/campaign/CampaignAvatar.tsx` + `.module.css`
- Props: `size` (small, medium, large, hero) e `variant` (portrait, icon, busto)
- Hover states, acessibilidade, responsivo
- Fácil integração em qualquer contexto

### 2. Card Final Universal

**Componente:**
- `components/campaign/FinalShareCard.tsx` + `.module.css`
- Estrutura: avatar + info do jogo + resultado + mensagem + meta + marca campanha
- Props parametrizados para reutilização em todas as engines
- Mobile-first, responsivo, preparado para download/share

**Frame base:**
- `public/campaign/share/frame-base.svg` — Frame 1200x630 para OG/share
- Branding de campanha consistente
- Placeholder para refinamento profissional

**Integração:**
- `components/games/share/ResultCard.tsx` agora wraps `FinalShareCard`
- Todas as 4 engines (quiz, branching, simulation, map) terminam com card universal
- Share pages (`/share/[game]/[result]`) exibem card final com tracking

### 3. Pipeline de Assets

**Estrutura:**
- `public/campaign/avatar/` — avatares e variações
- `public/campaign/share/` — frames, badges, elementos de share
- Convenções documentadas em `docs/assets/README.md`

**Governança:**
- Nomenclatura clara: `{categoria}-{descritor}-{variante}.{ext}`
- Checklist de qualidade: SVG otimizado, PNG @2x, responsividade
- Processo de refinement V1→V2 documentado

### 4. Tracking e Leitura

**Novos eventos (5) em `lib/analytics/events.ts`:**
- `final_card_view` — card exibido em share page
- `final_card_download` — usuário baixa card
- `final_card_share_click` — usuário clica em share
- `campaign_avatar_view` — avatar renderizado (tracking futuro)
- `campaign_cta_click_after_game` — CTA de campanha clicado após jogo

**Funções de tracking em `lib/analytics/track.ts`:**
- `trackFinalCardView(game, resultId)`
- `trackFinalCardDownload(game, resultId)`
- `trackFinalCardShareClick(game, resultId)`
- `trackCampaignAvatarView(game, variant, size)`
- `trackCampaignCtaClickAfterGame(game, ctaId, placement)`

**Dashboard Estado:**
- Nova seção "Card Final e Presença de Campanha" em `/estado`
- Exibe contadores dos 5 novos eventos
- Tech notes sobre valores baixos iniciais sendo normais

### 5. Documentação Atualizada

**README.md:**
- Status: Tijolo 22
- Seção "Linha de Jogos da Campanha" documentando avatar, card, pipeline
- Referências a componentes e docs de assets

**docs/arquitetura.md:**
- Nova seção ~100 linhas documentando:
  - Avatar oficial (componente, tamanhos, variantes)
  - Card final universal (estrutura, integração, tracking)
  - Pipeline de assets (estrutura, convenções)
  - Limitações V1 (placeholder status)

**docs/roadmap.md:**
- Tijolo 22 marcado como concluído
- Tijolos 23 sugeridos: refinamento profissional, variações de expressão, QR code

**docs/tijolos.md:**
- Tijolo 22 adicionado ao protocolo
- Objetivos, entregas, limitações e não-inclui documentados

---

## Validação Técnica

### Gates de Qualidade (100% aprovado)

```
✅ ESLint:        0 erros, 0 warnings
✅ TypeScript:    0 erros de tipo
✅ Testes Unit:   15/15 passados (6 suítes)
✅ Build Prod:    Compilado com sucesso
✅ Verify Script: 52/52 checks passados
```

**Problemas encontrados e resolvidos:**
1. Funções de tracking não exportadas → Adicionadas em `track.ts`
2. Propriedade `events` vs `eventsByType` → Corrigido em `estado/page.tsx`
3. Chamada incorreta com 3 args → Corrigido para 2 args em `SharePageClient.tsx`

### Estado das 4 Engines

Todas as engines continuam funcionando corretamente:
- ✅ Quiz engine
- ✅ Branching engine
- ✅ Simulation engine
- ✅ Map engine

Todas integradas com card final universal através de `ResultCard`.

---

## Escopo Cumprido

### ✅ Incluído

- Avatar oficial estilizado como personagem recorrente
- Card final universal compartilhável
- Pipeline de assets organizado e documentado
- Tracking completo de card/avatar
- Dashboard /estado melhorado
- Integração com 4 engines existentes
- Componentes reutilizáveis prontos para evolução
- Documentação arquitetural completa
- V1 placeholder técnico funcional

### ❌ Não Incluído (conforme escopo)

- Nova engine (RPG/plataforma/tycoon)
- Sistema de auth/CMS/admin
- Asset final profissional refinado (fica para V2)
- Variações de expressão do avatar (Tijolo 23)
- QR code dinâmico no card (Tijolo 23)

---

## Limitações e Próximos Passos

### Limitações Conhecidas (V1)

1. **Asset placeholder técnico:**
   - SVG atual é estrutural, não é arte final
   - Precisa refinamento profissional de designer
   - Conceito e arquitetura estão corretos

2. **Avatar sem variações:**
   - Apenas 1 expressão/pose
   - Variantes (icon/busto) são recortes do portrait
   - Tijolo 23 pode adicionar expressões (feliz/pensativo/determinado)

3. **Card sem QR code:**
   - Marca de campanha estática
   - QR dinâmico pode aumentar conversão (Tijolo 23)

### Recomendações para Tijolo 23

1. **Refinamento profissional do avatar:**
   - Contratar designer/ilustrador
   - Criar versão estilizada mantendo reconhecimento facial
   - 3-5 variações de expressão (neutro, sorrindo, determinado, pensativo, falando)
   - Exportar em múltiplas resoluções

2. **Primeiro minigame novo validando throughput:**
   - Criar minigame quick novo (~3-5 min) usando avatar oficial
   - Validar se pipeline de assets + componentes acelera desenvolvimento
   - Medir tempo de criação vs jogos anteriores

3. **QR code no card final:**
   - QR dinâmico apontando para `/play/[slug]` ou `/explorar`
   - A/B test com/sem QR para medir impacto em conversão
   - Tracking de scans via analytics

4. **Expansão de variantes:**
   - Avatar em contextos específicos (liderando, ouvindo, apontando)
   - Badges/emblemas territoriais (RJ, municípios)
   - Elementos visuais para séries temáticas

---

## Circulação e Impacto

### Situação Atual

**Baseline:** Valores zerados ou baixos são esperados.
- `final_card_view`: 0 (card acabou de ser implementado)
- `final_card_download`: 0 (feature recém-lançada)
- `final_card_share_click`: 0 (aguardando primeiros testes)

### Hipóteses de Sucesso (Tijolo 23+)

1. **Card final aumenta sharing:**
   - Expectativa: +30% em `link_copy` vs baseline sem card
   - Métrica: `final_card_download` + `final_card_share_click` > 10% das completions

2. **Avatar aumenta reconhecimento:**
   - Expectativa: usuários associam jogos a Alexandre Fonseca
   - Métrica qualitativa: menções em feedback/comentários

3. **Pipeline acelera desenvolvimento:**
   - Expectativa: Tijolo 23 (novo minigame) leva 30-40% menos tempo que Tijolo 14-15
   - Métrica: dias de dev Tijolo 23 < média Tijolos 14-15

---

## Conclusão

Tijolo 22 cumpriu missão de **criar base visual reutilizável** para crescimento organizado do hub.

**Fundação estabelecida:**
- ✅ Avatar oficial como personagem recorrente
- ✅ Card final universal em todos os jogos
- ✅ Pipeline de assets documentado e organizado
- ✅ Tracking completo de engajamento
- ✅ Componentes reutilizáveis prontos

**Próxima fronteira (Tijolo 23):**
- Refinamento profissional de assets V1→V2
- Validar throughput com novo minigame usando avatar
- QR code para conversão otimizada
- Variações de expressão para contextos específicos

**Posicionamento estratégico:**
Hub deixa de ser coleção de jogos isolados e passa a ter **identidade visual coerente** ancorada em Alexandre Fonseca como personagem principal. Card final universal transforma cada conclusão de jogo em oportunidade de sharing e conversão para a pré-campanha.

---

**Relatório gerado:** 2026-03-06 22:15  
**Verificação:** `npm run verify` — 52/52 checks ✅  
**Próximo tijolo:** Tijolo 23 — Refinamento visual e validação de throughput

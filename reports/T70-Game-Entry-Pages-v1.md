# T70: Game Entry Pages v1 (Premium Pre-Play Layer)

**Data:** 24 de Março de 2026  
**Versão:** v1.0  
**Status:** ✅ Concluído

---

## 1. Diagnóstico do Problema

### O Gargalo Atual

Após T67 (arquitetura), T68 (visual shell) e T69 (progressão), o próximo desafio é a **qualidade e consistência da introdução de cada jogo antes do play**.

O Hub está crescendo em um ecossistema multi-gênero:
- arcade
- platformers
- simulação
- gestão/tycoon
- estratégia
- RPG/narrativa

Para parecer profissional, escalável e premium, cada jogo precisa de uma **camada de entrada forte** que:
- Explica o jogo rapidamente
- Define expectativas claras
- Enquadra o porquê político
- Funciona bem em mobile e desktop
- Suporta experiências rápidas e profundas

### O Problema do "Jump Direto"

O sistema anterior direcionava usuários diretamente para o jogo sem:
- Contexto político/social
- Expectativas de sessão
- Explicação do gênero
- Descoberta relacionada

Isso resultava em:
- Altos bounce rates
- Expectativas não alinhadas
- Perda de oportunidade de engajamento político
- Sensação de "catálogo" em vez de "experiência"

---

## 2. Solução: Template Unificado de Entry Page

### Arquitetura Component-Driven

Criamos um sistema flexível baseado em slots opcionais:

```
GameEntryPage (wrapper)
├── HeroSection (obrigatório)
├── TrustRow (obrigatório)
├── WhyItMattersSection (opcional)
├── GenreOnboarding (obrigatório)
├── HowItWorksSection (opcional - jogos ricos)
├── RelatedDiscoverySection (opcional)
├── ShareSection (opcional)
└── BackSection (obrigatório)
```

### Props Interface

```typescript
interface GameEntryPageProps {
  game: Game;                           // Dados do jogo
  heroMedia?: { type, src, alt };      // Imagem/vídeo do hero
  secondaryCta?: { label, href };     // CTA secundário
  relatedGames?: Game[];               // Jogos relacionados
  whyItMatters?: WhyItMattersContent;  // Contexto político
  howItWorks?: HowItWorksContent;      // Mecânicas/controles
  shareData?: { title, description, url }; // Dados de compartilhamento
}
```

---

## 3. Estrutura da Entry Page

### 3.1 Premium Top Section (Hero)

**Elementos:**
- Título + Premissa (one-liner)
- Área de mídia visual (imagem/vídeo/placeholder)
- CTA primário (Play)
- CTA secundário (opcional)
- Metadata row rápida (gênero, duração, dificuldade)
- Framing "por que isso existe"

**Design:**
- Full-bleed hero com gradiente overlay
- Legibilidade premium em todas as telas
- CTA grande e visível
- Ícone fallback quando sem imagem
- Responsivo: 70vh desktop, 80vh mobile

### 3.2 Trust / Expectation Row

**Indicadores (5 colunas):**
| Ícone | Label | Valor |
|-------|-------|-------|
| ⏱️ | Duração | Curto/Médio/Profundo |
| 📱 | Dispositivo | Mobile/Desktop/Ambos |
| 👤 | Jogadores | Solo |
| ✨ | Status | Novo/Destaque/Disponível |
| 🔓 | Acesso | Sem cadastro |

**Propsósito:**
- Alinhar expectativas antes do play
- Reduzir bounce por mismatch de dispositivo
- Destacar vantagens (sem cadastro, solo)

### 3.3 "Why It Matters" Section

**Estrutura em 3 blocos:**
1. **A luta** — Qual conflito social este jogo conecta
2. **Por que agora** — Relevância política atual
3. **O convite** — Que tipo de pensamento/sentimento o jogo convida

**Chips de Temas:**
- Tags políticas clicáveis
- Conectam ao ecossistema temático do Hub

**Tom:**
- Elegante e humano
- Sem propaganda excessiva
- Foco em convite, não imposição

### 3.4 Genre-Aware Onboarding

**Cues por Gênero:**

| Gênero | Cues (3) | Expectativa |
|--------|----------|-------------|
| **Arcade** | Ação imediata, Sessões curtas, Reflexos | Ideal para momentos rápidos |
| **Plataforma** | Movimento preciso, Desafios de navegação, Superar obstáculos | Cada movimento conta |
| **Simulação** | Pensamento sistêmico, Causa e efeito, Explorar dinâmicas | Entenda como as partes se conectam |
| **Gestão** | Trade-offs de recursos, Planejamento estratégico, Tomada de decisão | Cada escolha tem custo |
| **Estratégia** | Consequências de longo prazo, Sequenciamento, Posicionamento | Ações hoje moldam amanhã |
| **Narrativa** | Escolhas significativas, Imersão, Tempo de leitura | Entre na história |
| **Quiz** | Reflexão rápida, Descoberta pessoal, Aprendizado | Responda com sinceridade |

**Propsósito:**
- Usuário entende o "tipo de play" antes de entrar
- Reduz frustração por mismatch de expectativa
- Educa sobre diferentes gêneros

### 3.5 How It Works (para jogos ricos)

**Seções opcionais:**
- **Mecânicas principais** — Lista de sistemas do jogo
- **Controles** — Como jogar (touch/keyboard/mouse)
- **Objetivo** — O que o jogador deve alcançar
- **Antes de jogar** — Checklist de preparação
- **Screenshots** — Grid de imagens

**Condição:** Apenas jogos com `pace: 'deep'` ou explicitamente configurados.

### 3.6 Related Discovery

**Lógica de relacionamento:**
1. Mesmo gênero → "Mesmo gênero: [tipo]"
2. Mesmo território → "Mesmo território: [nome]"
3. Tema compartilhado → "Tema: [tema]"
4. Diferente duração → "Alternativa mais curta/profunda"
5. Fallback → "Você pode gostar"

**Integração T69:**
- Usa `getContinuePlaying()`, `getVocêPodeGostar()`
- Analytics: `trackRelatedGamesClick()`
- Conecta ao sistema de recomendação existente

### 3.7 Share Section

**Funcionalidades:**
- Web Share API (mobile)
- Clipboard fallback (desktop)
- Mensagem contextualizada ao jogo
- Conexão com campanha

**Readiness:**
- Estrutura preparada para futuros "share packs"
- OG tags configuráveis
- Tracking: `trackEntryShareClick()`

---

## 4. Arquivos Criados

| Arquivo | Linhas | Propósito |
|---------|--------|-----------|
| `components/entry/GameEntryPage.tsx` | ~450 | Template unificado de entry page |
| `components/entry/GameEntryPage.module.css` | ~550 | Estilos responsivos premium |
| `lib/hub/analytics.ts` (atualizado) | +70 | 6 eventos de entry page |

**Total:** ~1.070 linhas de código

---

## 5. Analytics Events

### Eventos T70 (6 novos)

| Evento | Trigger | Metadados |
|--------|---------|-----------|
| `entry_page_view` | Mount do componente | game_slug, genre, territory, political_theme |
| `entry_primary_play_click` | Clicar em "Jogar" | game_slug, genre, territory, political_theme |
| `entry_secondary_cta_click` | Clicar em CTA secundário | game_slug, source_surface, genre, cta_label |
| `why_it_matters_seen` | Scroll até seção | game_slug, political_theme |
| `related_games_click` | Clicar em jogo relacionado | game_slug, target_game_slug, genre, reason |
| `entry_share_click` | Clicar em compartilhar | game_slug, source_surface, genre, political_theme |

### Metadata Padrão
```typescript
{
  game_slug: string;
  genre: GameGenre;
  territory: TerritoryScope;
  political_theme: PoliticalTheme;
  source_surface?: string;
  target_game_slug?: string;
  recommendation_reason?: string;
  cta_label?: string;
}
```

---

## 6. Responsividade

### Breakpoints

| Breakpoint | Ajustes |
|------------|---------|
| **Mobile Portrait** (<480px) | Hero 80vh, título 1.5rem, trust 3 colunas, cues 1 coluna |
| **Mobile Landscape** (481-767px) | Hero 60vh, CTAs lado a lado |
| **Tablet** (768-1023px) | Hero 60vh, título 2.5rem, cues 3 colunas |
| **Desktop** (>1024px) | Hero 65vh max 800px, título 3rem, layout expandido |

### Foco Premium
- Above-the-fold sempre visível
- CTA nunca abaixo da dobra
- Imagens com object-fit cover
- Spacing generoso sem excesso
- Dark mode completo
- Reduced motion respeitado

---

## 7. Uso

### Exemplo Básico
```tsx
import { GameEntryPage } from '@/components/entry/GameEntryPage';
import { getGameBySlug } from '@/lib/games/catalog';

const game = getGameBySlug('cidade-real');

return (
  <GameEntryPage
    game={game}
    whyItMatters={{
      struggle: 'A luta pelo orçamento municipal',
      relevance: 'Decisões locais afetam milhões',
      invitation: 'Experimente as escolhas difíceis',
    }}
  />
);
```

### Exemplo Completo
```tsx
<GameEntryPage
  game={game}
  heroMedia={{
    type: 'image',
    src: '/games/hero-cidade-real.jpg',
    alt: 'Cidade Real gameplay',
  }}
  secondaryCta={{
    label: 'Como funciona',
    href: '#how-it-works',
  }}
  whyItMatters={{
    struggle: 'A luta pelo orçamento municipal',
    relevance: 'Decisões locais afetam milhões',
    invitation: 'Experimente as escolhas difíceis',
  }}
  howItWorks={{
    mechanics: ['Alocar recursos', 'Balancear demandas', 'Sobreviver à crise'],
    controls: 'Mouse/touch para arrastar sliders',
    objectives: 'Equilibre saúde, educação e infraestrutura',
    beforeYouPlay: ['Leia sobre orçamento municipal', 'Pense em suas prioridades'],
    screenshots: [
      { src: '/screens/1.jpg', alt: 'Tela principal' },
      { src: '/screens/2.jpg', alt: 'Decisão difícil' },
    ],
  }}
  relatedGames={relatedGames}
  shareData={{
    title: `Jogue ${game.title}`,
    description: game.shortDescription,
    url: `https://hub.deveresistir.com/games/${game.slug}`,
  }}
/>
```

---

## 8. Estratégia de Gênero

### Mapeamento de Expectativas

Cada gênero tem um "contrato implícito" com o jogador:

**Arcade:** "Entre, jogue, sinta. Não pense muito."
**Plataforma:** "Pratique. Falhar é parte do processo."
**Simulação:** "Observe padrões. Cause efeitos."
**Gestão:** "Trade-offs são reais. Não dá para ter tudo."
**Estratégia:** "Decisões importam. Pense à frente."
**Narrativa:** "Imersão profunda. Escolhas têm peso."
**Quiz:** "Descoberta pessoal. Sem respostas certas."

### Cues Visuais
- Números grandes (1, 2, 3) para sequência
- Ícones específicos por gênero
- Cores diferenciadas por tipo
- Expectativa em destaque ao final

---

## 9. Estratégia Política

### Framing "Why It Matters"

**Estrutura:**
1. **Conectar** — Qual luta real este jogo toca?
2. **Contextualizar** — Por que isso importa agora?
3. **Convidar** — Que experiência o jogador terá?

**Tom:**
- Humano, não institucional
- Convite, não instrução
- Honesto sobre complexidade
- Esperançoso sem ser ingênuo

**Exemplo:**
> **A luta:** Orçamento municipal é onde a política real acontece.
> **Por que agora:** Cidades estão quebradas e precisam de escolhas difíceis.
> **O convite:** Sinta o peso de alocar recursos escassos.

---

## 10. Expansão Futura

### v2 Possível
1. **Video Hero** — Vídeos de gameplay auto-play
2. **Social Proof** — "X pessoas jogaram esta semana"
3. **Result Preview** — Cards de resultados possíveis
4. **Reviews** — Depoimentos de jogadores
5. **Dev Notes** — Mensagem da equipe de desenvolvimento
6. **A/B Testing** — Testar diferentes CTAs
7. **Localization** — Suporte a múltiplos idiomas

### Integrações Planejadas
- T69 progression (já integrado)
- T71+ share packs (estrutura pronta)
- T72 result cards (estrutura pronta)
- T73 territory maps (link pronto)

---

## 11. Checklist de Qualidade

- [x] Template unificado funciona para todos os gêneros
- [x] Hero section premium em todas as telas
- [x] "Why it matters" humano e não-propagandístico
- [x] Genre cues claros e úteis
- [x] Trust row compacto e informativo
- [x] Related discovery integrado ao T69
- [x] Jogos ricos suportam seções adicionais
- [x] Share readiness implementado
- [x] 6 eventos de analytics adicionados
- [x] Responsivo em todos os breakpoints
- [x] Dark mode completo
- [x] Reduced motion respeitado
- [x] Sem one-off pages — tudo component-driven
- [x] Código limpo e documentado

---

## 12. Conclusão

O T70 entrega uma **camada de entrada premium** que:

1. ✅ **Padroniza** a introdução de todos os jogos
2. ✅ **Contextualiza** politicamente sem ser pesado
3. ✅ **Alinha expectativas** por gênero
4. ✅ **Promove descoberta** de jogos relacionados
5. ✅ **Suporta escalabilidade** — funciona para arcade e simulações profundas
6. ✅ **Mantém premium feel** sem excesso visual
7. ✅ **Integra perfeitamente** com T69 progression

**Resultado:** O Hub agora tem um **sistema de entrada profissional** que transforma cada jogo em uma experiência intencional e compreensível.

---

## Anexos

### A. Exports Disponíveis
```typescript
// Componente principal
export { GameEntryPage, type GameEntryPageProps } from '@/components/entry/GameEntryPage';

// Analytics
export {
  trackEntryPageView,
  trackEntryPrimaryPlayClick,
  trackEntrySecondaryCtaClick,
  trackWhyItMattersSeen,
  trackRelatedGamesClick,
  trackEntryShareClick,
} from '@/lib/hub/analytics';
```

### B. Padrão de Metadata para OG
```html
<title>{game.title} | Hub de Jogos</title>
<meta name="description" content={game.shortDescription} />
<meta property="og:title" content={`Jogue ${game.title}`} />
<meta property="og:description" content={game.campaignRole} />
<meta property="og:image" content={game.cover} />
```

---

*Relatório T70 — Game Entry Pages v1*  
*Sistema: Hub de Jogos — Pré Campanha*

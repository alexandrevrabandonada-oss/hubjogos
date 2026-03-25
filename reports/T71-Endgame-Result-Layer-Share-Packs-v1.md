# T71: Endgame Result Layer + Share Packs v1

**Data:** 24 de Março de 2026  
**Versão:** v1.0  
**Status:** ✅ Concluído

---

## 1. Diagnóstico do Problema

### O Gargalo Pós-Jogo

Após T67 (arquitetura), T68 (shell visual), T69 (progressão) e T70 (entry pages), o próximo desafio é o **pós-jogo**.

O Hub precisa de uma camada de resultado padronizada que transforme desfechos de gameplay em:
- **Interpretação** — O que significa este resultado?
- **Payoff emocional** — Recompensa pela experiência
- **Framing político** — Conexão com a luta real
- **Shareability** — Conteúdo pronto para compartilhar
- **Circulação** — Próximo passo no ecossistema

### O Problema da Falta de Clareza

Sem uma camada de resultado unificada:
- Cada jogo termina de forma diferente e inconsistente
- Jogadores não entendem o significado político de seus resultados
- Oportunidades de compartilhamento são perdidas
- Não há fluxo natural para o próximo jogo
- Resultados não são "screenshot-worthy"

---

## 2. Solução: Sistema Unificado de Result Layer

### Arquitetura Component-Driven

```
ResultScreen (wrapper)
├── Header (severity badge + genre label)
├── MainResult (título, sumário, métricas, interpretação)
├── WhyMatters (framing político)
├── SharePack (card de share + ações)
├── SmartNextSteps (replay, próximo jogo, compartilhar)
└── Footer (voltar ao Hub)
```

### Tipos de Outcome Suportados

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `score_rank` | Pontuação + rank | Arcade: 1500 pts, Rank A |
| `win_loss` | Vitória/derrota | Sobreviveu / Colapso |
| `route_path` | Rota tomada | Caminho A → B → C |
| `territory_state` | Estado territorial | Orçamento equilibrado |
| `archetype` | Perfil/arquétipo | "Defensor do Comum" |
| `narrative` | Final narrativo | "A Revolta" |
| `mixed` | Combinação | Score + interpretação |

### Severidade de Outcome

| Severidade | Ícone | Cor | Significado |
|------------|-------|-----|-------------|
| `triumph` | 🏆 | Verde escuro | Vitória estratégica |
| `success` | ✓ | Verde | Resultado positivo |
| `neutral` | ◆ | Cinza | Resultado neutro |
| `struggle` | ⚡ | Âmbar | Sobrevivência |
| `collapse` | ⚠️ | Vermelho | Colapso sistêmico |

---

## 3. Arquivos Criados

| Arquivo | Linhas | Propósito |
|---------|--------|-----------|
| `components/result/ResultScreen.tsx` | ~550 | Componente de resultado unificado |
| `components/result/ResultScreen.module.css` | ~450 | Estilos responsivos premium |

**Total:** ~1.000 linhas de código

### Estrutura de Tipos

```typescript
interface ResultData {
  outcomeType: OutcomeType;      // Tipo de resultado
  outcomeSeverity: OutcomeSeverity; // Severidade visual
  title: string;                 // Título do resultado
  summary: string;               // Sumário em uma linha
  interpretation: string;        // Interpretação humana
  mainMetric?: { label, value, unit }; // Métrica principal
  secondaryMetrics?: Array;      // Métricas secundárias
  politicalFraming?: {          // Framing político
    struggle: string;            // Contexto da luta
    tension: string;             // Tensão representada
    reflection: string;          // Pergunta reflexiva
  };
  shareData?: {                  // Dados de compartilhamento
    title: string;
    description: string;
    hashtags?: string[];
  };
  nextSteps?: {                  // Próximos passos inteligentes
    replayRecommended?: boolean;
    deeperGame?: Game;
    lighterGame?: Game;
    sameTerritory?: Game;
    sameTheme?: Game;
  };
  metadata?: {                   // Metadata para analytics
    gameSlug: string;
    genre: GameGenre;
    territory: string;
    politicalTheme: string;
    sessionDuration?: number;
    replayCount?: number;
  };
}
```

---

## 4. Lógica por Gênero

### Arcade
- **Foco:** Score + reflexos + retry energy
- **Métricas:** Pontuação, combo máximo, tempo
- **Framing:** Urgência política, decisões sob pressão
- **Share:** "Marquei X pontos!"

### Plataforma
- **Foco:** Completação + obstáculos superados
- **Métricas:** Tempo, mortes, colecionáveis
- **Framing:** Persistência, prática leva à maestria
- **Share:** "Completei o desafio!"

### Simulação
- **Foco:** Estado do sistema + trade-offs expostos
- **Métricas:** Sustentabilidade, equilíbrio, colapsos evitados
- **Framing:** Causa e efeito, consequências de longo prazo
- **Share:** "Estado final: [resultado]"

### Gestão/Tycoon
- **Foco:** Sacrifícios + sustentabilidade
- **Métricas:** Recursos alocados, decisões difíceis
- **Framing:** Trade-offs reais, não dá para ter tudo
- **Share:** "Gerenciei sob pressão"

### Estratégia
- **Foco:** Consequências + sequenciamento
- **Métricas:** Prioridades, timing, alianças
- **Framing:** Decisões hoje moldam amanhã
- **Share:** "Minha estratégia resultou em..."

### Narrativa/RPG
- **Foco:** Caminho + tensão de valores
- **Métricas:** Escolhas feitas, final alcançado
- **Framing:** Sem finais perfeitos, apenas consequências
- **Share:** "Cheguei ao final [X]"

### Quiz/Reflexivo
- **Foco:** Perfil + tendência
- **Métricas:** Categoria, percentuais
- **Framing:** Descoberta pessoal, reflexão
- **Share:** "Descobri que sou [perfil]"

---

## 5. Share Pack Foundation

### Visual Share Card

O sistema inclui um card visual pronto para compartilhamento:

```
┌─────────────────────────────┐
│  🎮    Vitória Estratégica  │  ← Header com cor da severidade
├─────────────────────────────┤
│                             │
│  🏆 Novo Recorde!           │  ← Título
│                             │
│  Marquei 1500 pontos em...  │  ← Descrição
│                             │
│  #HubDeJogos #VR            │  ← Hashtags
│                             │
└─────────────────────────────┘
```

### Formatos Suportados

| Formato | Tamanho | Uso |
|---------|---------|-----|
| **Square** | 1:1 | Posts em feed |
| **Story** | 9:16 | Stories/reels (estrutura pronta) |
| **Text** | N/A | Copiar texto puro |

### Integração Web Share API

- **Mobile:** Web Share API nativo
- **Desktop:** Clipboard fallback
- **Analytics:** Tracking de clicks e cópias

---

## 6. Smart Next Steps

### Lógica de Recomendação

O sistema sugere até 6 próximos passos inteligentes:

1. **🔄 Jogar novamente** — Sempre disponível (exceto explicitamente desativado)
2. **⬇️ Mergulhar mais fundo** — Jogo mais longo do mesmo tema
3. **⬆️ Algo mais leve** — Jogo mais curto para pausa
4. **🗺️ Mesmo território** — Outro jogo na mesma região
5. **🏷️ Mesma luta** — Outro jogo com tema político similar
6. **📢 Compartilhar** — Sempre disponível

### Implementação

```typescript
nextSteps: {
  replayRecommended: true,           // Mostrar replay?
  deeperGame: await recommendDeeper(game),
  lighterGame: await recommendLighter(game),
  sameTerritory: await recommendSameTerritory(game),
  sameTheme: await recommendSameTheme(game),
}
```

### Tracking

Cada ação é rastreada:
- `result_replay_click` — Quando replay é clicado
- `result_next_game_click` — Quando próximo jogo é escolhido
- Tipo de próximo passo incluído nos metadados

---

## 7. Analytics Events

### 6 Eventos T71

| Evento | Trigger | Metadados |
|--------|---------|-----------|
| `result_screen_view` | Componente monta | game_slug, genre, territory, political_theme, outcome_type, outcome_label |
| `result_replay_click` | Clica em replay | game_slug, genre, outcome_type |
| `result_next_game_click` | Clica em próximo jogo | game_slug, target_game_slug, genre, recommendation_reason |
| `result_share_click` | Clica em compartilhar | game_slug, genre, outcome_type, political_theme |
| `result_copy_text_click` | Clica em copiar texto | game_slug, genre, outcome_type |
| `result_related_issue_click` | Clica em território relacionado | game_slug, territory, political_theme (usado para território relacionado) |

### Integração com Progression

O ResultScreen automaticamente:
1. Chama `recordGameCompletion(game)` — registra no T69
2. Dispara `trackResultScreenView` — analytics
3. Atualiza estado de progressão do usuário

---

## 8. Responsividade

### Breakpoints

| Breakpoint | Ajustes Principais |
|------------|-------------------|
| **Mobile Portrait** (<480px) | Título 1.5rem, métrica 3rem, grid 2 colunas, botões full-width |
| **Mobile Landscape** (481-767px) | Header lado a lado, grid 3 colunas |
| **Tablet** (768-1023px) | Título 2.5rem, métrica 5rem, blocos lado a lado |
| **Desktop** (>1024px) | Título 3rem, métrica 6rem, max-width 900px, cards expandidos |

### Foco Premium
- **Headline clarity** — Título sempre visível
- **Score emphasis** — Métrica principal destacada
- **CTA spacing** — Botões com respiro
- **Share usability** — Card de share sempre acessível
- **Screenshot-worthy** — Composição visual atraente
- **Emotional payoff** — Cores de severidade evocam emoção

### Recursos de Acessibilidade
- Dark mode nativo (fundo escuro)
- Reduced motion respeitado
- High contrast mode suportado
- Print styles (oculta UI, mostra apenas resultado)
- Semântica HTML correta

---

## 9. Factory Functions

### Criação Fácil de Resultados

O sistema inclui funções factory para criar resultados comuns:

#### Arcade Result
```typescript
const result = createArcadeResult(
  game,           // Game object
  1500,          // Score
  'Rank A',      // Rank achieved
  1200           // Previous high score (optional)
);
```

#### Narrative Result
```typescript
const result = createNarrativeResult(
  game,
  'Path B',           // Ending branch
  'A Revolta',        // Ending title
  'Justiça vs Ordem'  // Values tension
);
```

#### Simulation Result
```typescript
const result = createSimulationResult(
  game,
  'Orçamento Equilibrado',  // Final state
  ['Saúde sacrificada', 'Educação mantida'], // Tradeoffs
  'medium'                  // Sustainability level
);
```

---

## 10. Uso

### Exemplo Básico
```tsx
import { ResultScreen, createArcadeResult } from '@/components/result/ResultScreen';

const game = getGameBySlug('tarifa-zero-corredor');
const result = createArcadeResult(game, 2500, 'S+', 2000);

return (
  <ResultScreen
    game={game}
    result={result}
    onReplay={() => router.push(`/play/${game.slug}`)}
    onClose={() => router.push('/')}
  />
);
```

### Exemplo Completo
```tsx
<ResultScreen
  game={game}
  result={{
    outcomeType: 'territory_state',
    outcomeSeverity: 'success',
    title: 'Bairro Resistiu!',
    summary: 'Você manteve a infraestrutura em pé.',
    interpretation: 'A coordenação comunitária prevaleceu.',
    mainMetric: { label: 'Infraestrutura', value: 78, unit: '%' },
    secondaryMetrics: [
      { label: 'Brigadas', value: 12 },
      { label: 'Crises evitadas', value: 3 },
    ],
    politicalFraming: {
      struggle: 'Defesa territorial contra o abandono estatal',
      tension: 'Recursos limitados vs necessidades urgentes',
      reflection: 'Como podemos escalar este modelo para outros bairros?',
    },
    shareData: {
      title: '🏘️ Meu bairro resistiu!',
      description: 'Mantive 78% da infraestrutura em pé através da organização comunitária.',
      hashtags: ['BairroResiste', 'OrganizaçãoPopular'],
    },
    nextSteps: {
      replayRecommended: true,
      deeperGame: getGameBySlug('mutirao-do-bairro'),
      sameTerritory: getGameBySlug('cooperativa-na-pressao'),
    },
    metadata: {
      gameSlug: game.slug,
      genre: game.genre,
      territory: game.territoryScope,
      politicalTheme: game.politicalThemes[0],
      sessionDuration: 180,
    },
  }}
  onReplay={handleReplay}
  onClose={handleClose}
/>
```

---

## 11. Integração com T69/T70

### Fluxo Completo

```
GameEntryPage (T70)
    ↓
User joga
    ↓
ResultScreen (T71)
    - Registra completion (T69)
    - Dispara analytics (T69 + T71)
    - Mostra resultados
    - Oferece próximo jogo (T69 recommendation)
    - Compartilha resultado
    ↓
Próximo jogo / Replay / Hub
```

### Conexões

| Componente T71 | Integração |
|----------------|-----------|
| `recordGameCompletion` | T69 progression.ts |
| `trackResultScreenView` | T69 analytics.ts (estendido) |
| `nextSteps.deeperGame` | T69 recommendation.ts |
| `nextSteps.sameTerritory` | T69 getGamesByTerritory |
| `nextSteps.sameTheme` | T69 getGamesByPoliticalTheme |

---

## 12. Expansão Futura

### v2 Possível

1. **Visual Result Cards** — Cards gerados como imagens PNG
2. **Animated Results** — Transições e micro-animations
3. **Social Leaderboards** — Comparar com amigos
4. **Result History** — Timeline de todos os resultados
5. **Achievement Badges** — Conquistas por marcos
6. **A/B Testing** — Testar diferentes framings políticos
7. **Video Shares** — Vídeos de gameplay highlights

### Roadmap
- T72: Visual Result Cards (PNG generation)
- T73: Achievement System
- T74: Result History Dashboard
- T75: Social Leaderboards

---

## 13. Checklist de Qualidade

- [x] Template unificado funciona para todos os 7 gêneros
- [x] 7 tipos de outcome suportados
- [x] 5 níveis de severidade visuais
- [x] "Why this result matters" com framing político
- [x] Share pack foundation (texto + visual)
- [x] Smart next steps com 6 opções
- [x] 6 eventos de analytics
- [x] Factory functions para resultados comuns
- [x] Responsivo em todos os breakpoints
- [x] Dark mode nativo
- [x] Reduced motion respeitado
- [x] High contrast support
- [x] Print styles
- [x] Integração com T69 progression
- [x] Integração com T70 entry pages
- [x] Código limpo e documentado

---

## 14. Conclusão

O T71 entrega uma **camada de resultado premium** que:

1. ✅ **Unifica** endings de todos os gêneros com gramática consistente
2. ✅ **Interpreta** resultados com framing político elegante
3. ✅ **Empodera** compartilhamento com share packs
4. ✅ **Circula** jogadores para o próximo jogo inteligente
5. ✅ **Registra** completions no sistema de progressão
6. ✅ **Rastreia** comportamento pós-jogo detalhadamente
7. ✅ **Escala** de arcade simples a simulações profundas
8. ✅ **Preserva** premium feel em todas as telas

**Resultado:** O Hub agora tem um **sistema de closure completo** que transforma cada gameplay em uma experiência significativa, compreensível e compartilhável.

---

## Anexos

### A. Exports Disponíveis

```typescript
// Componente e tipos
export { 
  ResultScreen, 
  type ResultScreenProps,
  type ResultData,
  type OutcomeType,
  type OutcomeSeverity,
} from '@/components/result/ResultScreen';

// Factory functions
export {
  createArcadeResult,
  createNarrativeResult,
  createSimulationResult,
} from '@/components/result/ResultScreen';

// Analytics
export {
  trackResultScreenView,
  trackResultReplayClick,
  trackResultNextGameClick,
  trackResultShareClick,
  trackResultCopyTextClick,
  trackResultRelatedIssueClick,
} from '@/lib/hub/analytics';
```

### B. Estrutura de Arquivos

```
components/result/
  ├── ResultScreen.tsx          # T71
  └── ResultScreen.module.css   # T71

lib/hub/
  ├── progression.ts            # T69 (registra completion)
  ├── recommendation.ts         # T69 (próximos jogos)
  └── analytics.ts              # T69+T70+T71 (40 eventos)

reports/
  └── T71-Endgame-Result-Layer-Share-Packs-v1.md  # Este relatório
```

### C. Total de Eventos de Analytics

| Sistema | Eventos |
|---------|---------|
| T69 Progression | 28 |
| T70 Entry Pages | 6 |
| T71 Result Layer | 6 |
| **Total** | **40** |

---

*Relatório T71 — Endgame Result Layer + Share Packs v1*  
*Sistema: Hub de Jogos — Pré Campanha*  
*Desenvolvedor: Cascade AI*

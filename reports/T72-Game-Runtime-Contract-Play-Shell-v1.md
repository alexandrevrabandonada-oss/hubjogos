# T72: Game Runtime Contract + Play Shell v1

**Data:** 24 de Março de 2026  
**Versão:** v1.0  
**Status:** ✅ Concluído

---

## 1. Diagnóstico do Problema

### O Gargalo do Runtime

Após T69 (progressão), T70 (entry pages), e T71 (result layer), o próximo desafio é a **execução do gameplay em si**.

O Hub está ficando forte em:
- Antes do play (entry)
- Depois do play (resultados)
- Descoberta e circulação
- Framing editorial

Mas ainda há risco de **execução inconsistente** entre diferentes jogos e gêneros.

### O Perigo da Inconsistência

Sem um runtime unificado:
- Cada jogo inventa seu próprio sistema de pause/save
- Input methods variam drasticamente
- Lifecycle hooks são implementados ad-hoc
- Resultados são emitidos de formas diferentes
- Analytics são perdidos ou inconsistentes

Isso é perigoso porque o Hub precisa suportar muitos gêneros:
- arcade, platformers, simuladores, tycoon, estratégia, RPG, quiz

---

## 2. Solução: Contrato de Runtime Unificado

### Game Runtime Contract

Criamos um contrato formal que todos os jogos no Hub devem seguir:

```typescript
interface GameRuntimeConfig {
  // Identificação
  gameSlug: string;
  genre: GameGenre;
  runtimeType: RuntimeType;
  
  // Capacidades
  supportedInputs: InputMode[];
  supportedDevices: DeviceSupport[];
  performanceTier: PerformanceTier;
  
  // Save/Checkpoint
  supportsSave: boolean;
  supportsCheckpoint: boolean;
  maxCheckpoints?: number;
  autoSaveInterval?: number;
  
  // Lifecycle
  hasPause: boolean;
  hasRestart: boolean;
  hasExit: boolean;
  
  // Result emission
  resultType: ResultData['outcomeType'];
  
  // Audio
  hasAudio: boolean;
  audioEssential: boolean;
  
  // HUD
  hudZones: HudZoneConfig;
  
  // Accessibility
  supportsReducedMotion: boolean;
  supportsHighContrast: boolean;
  scalableText: boolean;
}
```

### 6 Tipos de Runtime

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `arcade_instant` | Sem save, play instantâneo | Jogos arcade rápidos |
| `session_based` | Run-in-progress | Quiz, sessões curtas |
| `checkpoint_based` | Progressão por checkpoint | Plataformas |
| `branching_narrative` | Estado narrativo | Jogos de escolha |
| `simulation_snapshot` | Snapshot de simulação | Cidade Real |
| `stateful_session` | Sessão persistente | Tycoon, gestão |

---

## 3. Arquitetura Play Shell

### Componente PlayShell

```
PlayShell (wrapper)
├── Header Bar
│   ├── Exit button
│   ├── Game info (title, genre)
│   ├── Pause/Resume button
│   ├── Restart button
│   └── Mute toggle
├── Main Game Area
│   ├── Game Content (children)
│   ├── Pause Overlay
│   └── Result Overlay (T71)
├── HUD Zones (optional)
│   ├── Top Bar
│   ├── Left/Right Rails
│   └── Bottom Controls
└── Input Hints
```

### Props Interface

```typescript
interface PlayShellProps {
  game: Game;
  config?: Partial<GameRuntimeConfig>; // Overrides
  children: (props: {
    runtimeState: RuntimeState;
    lifecycle: UseGameLifecycleReturn;
    save: UseSaveSystemReturn;
    input: UseInputManagerReturn;
  }) => React.ReactNode;
  onComplete?: (result: any) => void;
  onFail?: (reason: string) => void;
  onExit?: () => void;
}
```

---

## 4. Arquivos Criados

| Arquivo | Linhas | Descrição |
|---------|--------|-----------|
| `lib/runtime/types.ts` | ~500 | Contrato de runtime, tipos, configs padrão |
| `lib/runtime/hooks.ts` | ~400 | Lifecycle hooks (useGameLifecycle, etc.) |
| `lib/runtime/save.ts` | ~80 | Sistema de save/checkpoint |
| `lib/runtime/input.ts` | ~200 | Modelo de input, detecção, config builders |
| `components/play/PlayShell.tsx` | ~250 | Componente shell principal |
| `components/play/PlayShell.module.css` | ~350 | Estilos responsivos |

**Total T72:** ~1.780 linhas de código

---

## 5. Lifecycle Hooks

### 11 Eventos de Lifecycle

```typescript
useGameLifecycle({
  game,
  config,
  onComplete: (result) => {},
  onFail: (reason) => {},
  onExit: () => {},
});
```

**Retorno:**
- `runtimeState` — Estado atual
- `sessionStatus` — Status da sessão
- `startGame()` — Iniciar
- `pauseGame()` — Pausar
- `resumeGame()` — Retomar
- `restartGame()` — Reiniciar
- `exitGame()` — Sair
- `recordInteraction()` — Registrar interação
- `recordCheckpoint(id, label, state)` — Checkpoint
- `emitComplete(result)` — Emitir completion
- `emitFail(reason)` — Emitir falha
- `setInputMode(mode)` — Mudar input
- `events[]` — Histórico de eventos

### Sessão automática de:
- Analytics tracking
- Progressão (T69)
- Save/checkpoint
- Result emission (T71)

---

## 6. Sistema de Save

### 5 Níveis de Save

| Nível | Tipo | Persistência |
|-------|------|--------------|
| 1 | No save | Apenas memória | `arcade_instant`
| 2 | Run-in-progress | localStorage | `session_based`
| 3 | Checkpoint | localStorage + metadata | `checkpoint_based`
| 4 | Narrative state | localStorage + branching | `branching_narrative`
| 5 | Simulation snapshot | localStorage + full state | `simulation_snapshot`, `stateful_session`

### API

```typescript
// Save system
saveToLocal(gameSlug, payload);
loadFromLocal(gameSlug): SavePayload | null;
clearFromLocal(gameSlug);
listAllSaves(): Saves[];
clearAllSaves();
```

**Privacy-first:** Tudo em localStorage, sem servidor.

---

## 7. Modelo de Input

### 8 Modos de Input

| Modo | Dispositivo | Uso |
|------|-------------|-----|
| `touch_simple` | Mobile | Toque simples |
| `touch_drag` | Mobile | Arrastar |
| `touch_directional` | Mobile | D-pad virtual |
| `touch_action` | Mobile | Botões de ação |
| `keyboard` | Desktop | Teclado |
| `mouse` | Desktop | Mouse |
| `mixed_pointer` | Desktop | Mouse + teclado |
| `turn_based` | Ambos | Seleção por turnos |

### Detecção Automática

```typescript
// Detecta automaticamente
const input = useInputManager({
  config,
  onInputChange: (mode) => {},
});

// Propriedades
input.currentInput    // Modo atual
input.inputHints      // Dicas de input
input.isTouch         // Boolean
input.isKeyboard      // Boolean
input.isMouse         // Boolean
```

### Configurações por Gênero

- `buildArcadeInputConfig()`
- `buildNarrativeInputConfig()`
- `buildSimulationInputConfig()`
- `buildQuizInputConfig()`

---

## 8. HUD Zones

### 7 Zonas de HUD

```typescript
interface HudZoneConfig {
  topBar?: boolean;        // Barra de status superior
  leftRail?: boolean;      // Rail esquerdo
  rightRail?: boolean;     // Rail direito
  bottomControls?: boolean; // Controles inferiores
  pauseOverlay?: boolean;  // Overlay de pausa
  helpOverlay?: boolean;   // Overlay de ajuda
  missionText?: boolean;   // Texto de missão
  criticalAlerts?: boolean; // Alertas críticos
}
```

### Uso por Gênero

| Gênero | Zonas Ativas |
|--------|-------------|
| Arcade | topBar, bottomControls, pauseOverlay |
| Plataforma | Todas |
| Simulação | Todas |
| Narrativa | bottomControls, pauseOverlay |
| Quiz | topBar, bottomControls, pauseOverlay |

---

## 9. Analytics de Runtime

### 11 Eventos T72

| Evento | Trigger | Metadados |
|--------|---------|-----------|
| `play_shell_view` | PlayShell monta | game_slug, genre, runtime_type |
| `game_start` | Jogo inicia | game_slug, genre, runtime_type |
| `first_interaction` | Primeira interação | game_slug, genre, input_mode |
| `pause_click` | Pausa clicada | game_slug, genre |
| `resume_click` | Resume clicado | game_slug, genre |
| `restart_click` | Restart clicado | game_slug, genre |
| `exit_click` | Exit clicado | game_slug, genre |
| `checkpoint_reached` | Checkpoint alcançado | game_slug, genre, checkpoint_id |
| `save_written` | Save escrito | game_slug, genre |
| `fail_state_seen` | Falha vista | game_slug, genre, failure_reason |
| `completion_emitted` | Completion emitido | game_slug, genre, outcome_type |

### Total de Eventos

| Sistema | Eventos |
|---------|---------|
| T69 | 28 |
| T70 | 6 |
| T71 | 6 |
| T72 | 11 |
| **Total** | **51** |

---

## 10. Responsividade

### Breakpoints

| Breakpoint | Ajustes |
|------------|---------|
| Mobile Portrait (<480px) | Header compacto, HUD reduzido, hints flex-wrap |
| Mobile Landscape (481-767px) | Pause content horizontal |
| Tablet (768-1023px) | HUD expandido, spacing maior |
| Desktop (>1024px) | Tamanhos maiores, max-width para conteúdo |

### Recursos de Acessibilidade

- ✅ Reduced motion respeitado
- ✅ High contrast support
- ✅ Scalable text zones
- ✅ Non-audio critical feedback
- ✅ Pause/help sempre acessível
- ✅ Input hints visíveis
- ✅ Auto-pause em visibility change
- ✅ Orientação monitoring

---

## 11. Uso

### Exemplo Básico

```tsx
import { PlayShell } from '@/components/play/PlayShell';
import { createRuntimeConfig } from '@/lib/runtime/types';

const game = getGameBySlug('tarifa-zero-corredor');
const config = createRuntimeConfig(game);

return (
  <PlayShell
    game={game}
    config={config}
    onComplete={(result) => router.push(`/result/${game.slug}`)}
    onExit={() => router.push('/')}
  >
    {({ lifecycle, runtimeState, input }) => (
      <YourGameComponent
        onScore={(score) => lifecycle.emitComplete({ score })}
        inputMode={input.currentInput}
      />
    )}
  </PlayShell>
);
```

### Exemplo com Save

```tsx
<PlayShell game={game}>
  {({ lifecycle, save }) => (
    <SimulationGame
      onStateChange={(state) => {
        if (config.supportsSave) {
          save.saveGame(state, 'Auto-save');
        }
      }}
    />
  )}
</PlayShell>
```

---

## 12. Integração com T69/T70/T71

### Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ T70: GameEntryPage                                          │
│  • Usuário vê contexto e clica "Jogar"                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ T72: PlayShell                                              │
│  • trackPlayShellView()                                     │
│  • lifecycle.startGame() → trackGameStart()                 │
│  • Game roda com hooks integrados                          │
│  • lifecycle.emitComplete() → T71 ResultScreen             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ T71: ResultScreen                                           │
│  • Mostra resultado                                          │
│  • recordGameCompletion() → T69                            │
│  • Próximo jogo (T69 recommendation)                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ T69: Progression Update                                     │
│  • Update affinities                                        │
│  • Update recentlyPlayed                                    │
│  • Return surfaces atualizadas                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 13. Configurações por Gênero

### Arcade

```typescript
{
  runtimeType: 'arcade_instant',
  supportsSave: false,
  hasPause: true,
  hasRestart: true,
  resultType: 'score_rank',
  performanceTier: 'standard',
  hudZones: {
    topBar: true,
    bottomControls: true,
    pauseOverlay: true,
    criticalAlerts: true,
  },
}
```

### Simulação

```typescript
{
  runtimeType: 'simulation_snapshot',
  supportsSave: true,
  supportsCheckpoint: true,
  autoSaveInterval: 30,
  hasPause: true,
  resultType: 'territory_state',
  performanceTier: 'high_fidelity',
  hudZones: {
    topBar: true,
    leftRail: true,
    rightRail: true,
    bottomControls: true,
    pauseOverlay: true,
    helpOverlay: true,
    missionText: true,
  },
}
```

### Narrativa

```typescript
{
  runtimeType: 'branching_narrative',
  supportsSave: true,
  supportsCheckpoint: true,
  maxCheckpoints: 10,
  hasPause: true,
  resultType: 'narrative',
  performanceTier: 'lightweight',
  hudZones: {
    bottomControls: true,
    pauseOverlay: true,
    helpOverlay: true,
  },
}
```

---

## 14. Checklist de Qualidade

- [x] Contrato de runtime definido (6 tipos)
- [x] PlayShell component criado
- [x] 11 lifecycle hooks implementados
- [x] Result emission compatível com T71
- [x] Save/checkpoint strategy (5 níveis)
- [x] Input model (8 modos)
- [x] HUD zones (7 zonas)
- [x] Accessibility baseline
- [x] 11 analytics events
- [x] Responsive em 4 breakpoints
- [x] Integração com T69/T70/T71
- [x] Código limpo e tipado

---

## 15. Expansão Futura

### v2 Possível

1. **Audio Manager** — Sistema de áudio unificado
2. **Asset Preloader** — Carregamento de assets
3. **Error Boundaries** — Tratamento de erros
4. **Performance Monitor** — FPS, métricas
5. **Multiplayer Runtime** — Jogos colaborativos
6. **VR/AR Runtime** — Realidade virtual/aumentada
7. **Modding API** — Suporte a mods

---

## 16. Conclusão

O T72 entrega uma **infraestrutura de runtime completa** que:

1. ✅ **Unifica** execução de jogos de todos os gêneros
2. ✅ **Padroniza** lifecycle, save, input, HUD
3. ✅ **Integra** perfeitamente com T69/T70/T71
4. ✅ **Rastreia** 11 eventos de analytics
5. ✅ **Suporta** mobile e desktop igualmente
6. ✅ **Prioriza** acessibilidade
7. ✅ **Escala** para futuros jogos

**O Hub agora tem um ciclo completo:**
- T70: Entrada contextualizada
- T72: Execução consistente
- T71: Resultados significativos
- T69: Progressão e retorno

**O Hub é agora uma plataforma política gamificada profissional.**

---

## Anexos

### A. Exports Principais

```typescript
// Types
export {
  GameRuntimeConfig,
  RuntimeState,
  SessionStatus,
  InputMode,
  createRuntimeConfig,
  createInitialRuntimeState,
} from '@/lib/runtime/types';

// Hooks
export {
  useGameLifecycle,
  useSaveSystem,
  useInputManager,
  useVisibilityMonitor,
  useOrientationMonitor,
} from '@/lib/runtime/hooks';

// Save
export {
  saveToLocal,
  loadFromLocal,
  clearFromLocal,
} from '@/lib/runtime/save';

// Input
export {
  buildArcadeInputConfig,
  buildNarrativeInputConfig,
  detectInputMode,
} from '@/lib/runtime/input';

// Component
export { PlayShell } from '@/components/play/PlayShell';
```

### B. Estrutura de Runtime

```
lib/runtime/
  ├── types.ts    # Contrato e configurações
  ├── hooks.ts    # Lifecycle hooks
  ├── save.ts     # Sistema de save
  └── input.ts    # Modelo de input

components/play/
  ├── PlayShell.tsx      # Componente principal
  └── PlayShell.module.css # Estilos
```

---

*Relatório T72 — Game Runtime Contract + Play Shell v1*  
*Sistema: Hub de Jogos — Pré Campanha*  
*Desenvolvedor: Cascade AI*

# Matriz de Reutilização Arcade

O T53 consolida o esforço de converter assets técnicos presos em jogos isolados para um sistema de componentes modulares (`shared packages/modules`), para que os próximos arcades (como `bairro-resiste`) não reconstruam HUD, Telemetria ou Gestão de Tempo.

## 1. Padrões de Interface (HUD & Menus)

| Componente | Exemplo de Jogo Atual | Viabilidade de Abstração | Destino / Nomeação |
|---|---|---|---|
| **Barra de Progresso (HP/Distância)** | `tarifa-zero-corredor` | **Alta**. Essencial. | `SharedProgressBar` (Componente UI) |
| **Aviso de Dano/Acerto (Screen Flash)** | Todos | **Alta**. Comportamento padrão. | `ScreenFlashOverlay` (Wrapper UI) |
| **Painel de Score/Fim de Jogo** | Todos | **Pronto**. Já unificado via React/Next. | `FinalShareCard` |
| **Modais de Tutorial Rápido** | `cooperativa-na-pressao` | **Média**. Contextual demais. | Padronizar como `ArcadeIntroSheet` |

## 2. Subsistemas Sistêmicos (Lógica/Engines)

| Sistema | O que Faz | Abstração |
|---|---|---|
| **Timer / Degradation Engine** | Tick global loop de contagem (ex: 60fps countdown decay) | `lib/arcade/useGameLoopTick` - Hook Padrão Universal. **[MUST HAVE]** |
| **Risk / Spawner Logic** | Controla quando hotspots ou lixos surgem baseado na progressão | `lib/arcade/EventSpawner` - Reutilizável por parâmetros (chance, tempo, limite). |
| **Telemetry Aggregator** | Une as métricas in-game (mortes, cliques, tempo até falha) antes de mandar para API | `lib/arcade/ArcadeTelemetry` - Já existente, mas precisa encapsular auto-flush de perdas críticas |
| **Audio Manager** | Toca e faz merge de sfx simultâneos e gerencia volume de feedback. | `lib/shared/AudioPlayerSystem` - Fazer lazy load para prevenir gargalos de mobile browser. |

## 3. Comportamentos Acoplados (Não Reutilizar Neste Ciclo)

Ainda não faz sentido tentar componentizar ou criar "Lego Bricks" completos com os seguintes sistemas, dada alta especificidade:
- Motor de renderização baseada em Lanes 3D ou Pseudo-3D (`tarifa-zero-corredor` só atende runner).
- Lógica de arrastar/drag-and-drop de blocos pesados se não houver pacote de physics unificado.
- Arte e assets de background (deixe separados nas pastas de art packs por tijolo).

## 4. Candidatos Oficiais a *Shared Module* (T54)
1. `useArcadeSession()`: Um hook que empacota start, pause, resume, submit score e end game state.
2. `ArcadeHUDContainer`: Componente grid fixo onde desenvolvedor só injeta os medidores nos slots laterais.
3. `ArcadeFeedbackEmitter`: Sistema pub/sub global de partículas simples (1UP, +10 points). 

*Recomendação:* Implementar a abstração real somente sob demanda no momento em que a implementação do próximo título (`bairro-resiste`) começar, seguindo o princípio YAGNI (You Aren't Gonna Need It). A matriz foca as intenções de design.

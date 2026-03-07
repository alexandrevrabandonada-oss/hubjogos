import { generateId } from '@/lib/storage/local-session';
import type {
  ArcadeGameLogic,
  ArcadeInputSnapshot,
  ArcadeRunResult,
  ArcadeTickResult,
} from './types';

type TarifaEntityType = 'apoio' | 'bloqueio' | 'mutirao' | 'individualismo' | 'chance';

interface TarifaEntity {
  id: string;
  lane: number;
  y: number;
  speed: number;
  type: TarifaEntityType;
}

interface RecentFeedback {
  id: string;
  type: TarifaEntityType;
  ageMs: number;
}

export interface TarifaZeroState {
  playerLane: number;
  entities: TarifaEntity[];
  spawnCooldownMs: number;
  score: number;
  apoio: number;
  mutiroes: number;
  bloqueios: number;
  individualismos: number;
  chances: number;
  collectiveMeter: number;
  collectiveMeterTarget: number;
  comboTimerMs: number;
  elapsedMs: number;
  laneFlashMs: number;
  recentFeedback: RecentFeedback[];
}

const LANE_COUNT = 3;
const RUN_DURATION_MS = 55_000;
const PLAYER_COLLISION_Y_RATIO = 0.83;
const BASE_SPAWN_MS = 550;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function laneCenterX(lane: number, width: number) {
  const laneWidth = width / LANE_COUNT;
  return laneWidth * lane + laneWidth / 2;
}

function normalizeLane(pointerLane: number | null) {
  if (pointerLane === null) {
    return null;
  }
  return clamp(pointerLane, 0, LANE_COUNT - 1);
}

function randomLane() {
  return Math.floor(Math.random() * LANE_COUNT);
}

function rollEntityType(elapsedMs: number): TarifaEntityType {
  const progress = elapsedMs / RUN_DURATION_MS;
  const remainingMs = RUN_DURATION_MS - elapsedMs;
  const value = Math.random();

  // Chance only appears in last 15 seconds, rare (5% chance)
  if (remainingMs < 15_000 && value < 0.05) {
    return 'chance';
  }

  if (value < 0.5 - progress * 0.12) {
    return 'apoio';
  }
  if (value < 0.72 - progress * 0.05) {
    return 'bloqueio';
  }
  if (value < 0.88) {
    return 'mutirao';
  }
  return 'individualismo';
}

function spawnEntity(state: TarifaZeroState): TarifaEntity {
  const progress = state.elapsedMs / RUN_DURATION_MS;
  const speed = 180 + progress * 120 + Math.random() * 40;

  return {
    id: generateId('arcade-entidade'),
    lane: randomLane(),
    y: -40,
    speed,
    type: rollEntityType(state.elapsedMs),
  };
}

function applyInput(state: TarifaZeroState, input: ArcadeInputSnapshot) {
  let nextLane = state.playerLane;

  if (input.pointerLane !== null) {
    nextLane = input.pointerLane;
  }
  if (input.moveLeftPressed) {
    nextLane -= 1;
  }
  if (input.moveRightPressed) {
    nextLane += 1;
  }

  return clamp(nextLane, 0, LANE_COUNT - 1);
}

function resolveCollectiveRate(state: TarifaZeroState) {
  const positive = state.apoio + state.mutiroes * 2 + state.chances * 3;
  const negative = state.individualismos + state.bloqueios;
  const total = positive + negative;
  if (total === 0) {
    return 0;
  }
  return Math.round((positive / total) * 100);
}

function buildResult(state: TarifaZeroState): ArcadeRunResult {
  const collectiveRate = resolveCollectiveRate(state);
  const resultScore = Math.max(
    0,
    Math.round(
      state.score +
        state.apoio * 6 +
        state.mutiroes * 32 +
        state.chances * 50 +
        state.collectiveMeter * 1.3 -
        state.bloqueios * 14 -
        state.individualismos * 20,
    ),
  );

  const title =
    collectiveRate >= 72
      ? 'Corredor do Povo Liberado'
      : collectiveRate >= 45
      ? 'Corredor em Disputa'
      : 'Corredor Travado pela Tarifa';

  const summary =
    collectiveRate >= 72
      ? 'A estratégia coletiva venceu: mutirão, apoio e tarifa zero abriram passagem para todo mundo.'
      : collectiveRate >= 45
      ? 'Você segurou a rota, mas ainda cedeu espaço à lógica individual. Mais cooperação libera o corredor.'
      : 'A corrida individual fez a catraca vencer. Sem ação coletiva, o corredor do povo não abre.';

  return {
    resultId: generateId('arcade-resultado'),
    score: resultScore,
    title,
    summary,
    campaignLine: 'Tarifa zero e organização popular: mobilidade é direito, não mercadoria.',
    stats: {
      apoio: state.apoio,
      mutiroes: state.mutiroes,
      bloqueios: state.bloqueios,
      individualismos: state.individualismos,
      collectiveRate,
      durationMs: state.elapsedMs,
    },
  };
}

export const tarifaZeroCorredorLogic: ArcadeGameLogic<TarifaZeroState> = {
  createInitialState() {
    return {
      playerLane: 1,
      entities: [],
      spawnCooldownMs: BASE_SPAWN_MS,
      score: 0,
      apoio: 0,
      mutiroes: 0,
      bloqueios: 0,
      individualismos: 0,
      chances: 0,
      collectiveMeter: 46,
      collectiveMeterTarget: 46,
      comboTimerMs: 0,
      elapsedMs: 0,
      laneFlashMs: 0,
      recentFeedback: [],
    };
  },

  update(state, input, ctx): ArcadeTickResult<TarifaZeroState> {
    const next: TarifaZeroState = {
      ...state,
      elapsedMs: state.elapsedMs + ctx.dtMs,
      playerLane: applyInput(state, {
        ...input,
        pointerLane: normalizeLane(input.pointerLane),
      }),
      laneFlashMs: Math.max(0, state.laneFlashMs - ctx.dtMs),
      comboTimerMs: Math.max(0, state.comboTimerMs - ctx.dtMs),
    };

    // Smooth meter transition (interpolate toward target)
    const meterDiff = next.collectiveMeterTarget - next.collectiveMeter;
    if (Math.abs(meterDiff) > 0.1) {
      next.collectiveMeter += meterDiff * 0.15; // 15% interpolation per frame
    } else {
      next.collectiveMeter = next.collectiveMeterTarget;
    }

    // Age recent feedback
    next.recentFeedback = state.recentFeedback
      .map((f) => ({ ...f, ageMs: f.ageMs + ctx.dtMs }))
      .filter((f) => f.ageMs < 500);

    const events: ArcadeTickResult<TarifaZeroState>['events'] = [];

    next.spawnCooldownMs -= ctx.dtMs;
    if (next.spawnCooldownMs <= 0) {
      next.entities = [...next.entities, spawnEntity(next)];
      const paceFactor = clamp(next.elapsedMs / RUN_DURATION_MS, 0, 1);
      next.spawnCooldownMs = BASE_SPAWN_MS - paceFactor * 170 + Math.random() * 140;
    }

    const collisionY = ctx.height * PLAYER_COLLISION_Y_RATIO;
    const laneWidth = ctx.width / LANE_COUNT;
    const entitySize = Math.max(16, laneWidth * 0.25);

    const survivors: TarifaEntity[] = [];

    for (const entity of next.entities) {
      const advanced = {
        ...entity,
        y: entity.y + entity.speed * (ctx.dtMs / 1000),
      };

      const sameLane = advanced.lane === next.playerLane;
      const colliding = sameLane && Math.abs(advanced.y - collisionY) < entitySize;

      if (colliding) {
        const feedback: RecentFeedback = {
          id: generateId('feedback'),
          type: advanced.type,
          ageMs: 0,
        };

        if (advanced.type === 'apoio') {
          next.apoio += 1;
          next.collectiveMeterTarget = clamp(next.collectiveMeterTarget + 8, 0, 100);
          const comboMultiplier = next.comboTimerMs > 0 ? 1.75 : 1;
          next.score += Math.round((14 + (next.collectiveMeterTarget * 0.12)) * comboMultiplier);
          next.recentFeedback.push(feedback);
        }

        if (advanced.type === 'bloqueio') {
          next.bloqueios += 1;
          next.collectiveMeterTarget = clamp(next.collectiveMeterTarget - 14, 0, 100);
          next.score = Math.max(0, next.score - 18);
          next.laneFlashMs = 260;
          next.recentFeedback.push(feedback);
        }

        if (advanced.type === 'mutirao') {
          next.mutiroes += 1;
          next.collectiveMeterTarget = clamp(next.collectiveMeterTarget + 20, 0, 100);
          next.comboTimerMs = 6_500;
          next.score += 28;
          events.push({ type: 'powerup_collect', powerupId: 'mutirao-popular' });
          next.recentFeedback.push(feedback);
        }

        if (advanced.type === 'individualismo') {
          next.individualismos += 1;
          next.collectiveMeterTarget = clamp(next.collectiveMeterTarget - 22, 0, 100);
          next.score += 10;
          next.recentFeedback.push(feedback);
        }

        if (advanced.type === 'chance') {
          next.chances += 1;
          next.collectiveMeterTarget = clamp(next.collectiveMeterTarget + 30, 0, 100);
          next.score += 50;
          next.comboTimerMs = 8_000;
          events.push({ type: 'powerup_collect', powerupId: 'chance-coletiva' });
          next.recentFeedback.push(feedback);
        }

        continue;
      }

      if (advanced.y > ctx.height + 50) {
        continue;
      }

      survivors.push(advanced);
    }

    next.entities = survivors;

    return {
      state: next,
      events,
    };
  },

  render(canvasCtx, state, view) {
    const { width, height } = view;
    const laneWidth = width / LANE_COUNT;
    const playerY = height * PLAYER_COLLISION_Y_RATIO;

    canvasCtx.clearRect(0, 0, width, height);

    const background = canvasCtx.createLinearGradient(0, 0, 0, height);
    background.addColorStop(0, '#0f2a3d');
    background.addColorStop(1, '#123d59');
    canvasCtx.fillStyle = background;
    canvasCtx.fillRect(0, 0, width, height);

    for (let lane = 0; lane < LANE_COUNT; lane += 1) {
      const x = lane * laneWidth;
      canvasCtx.fillStyle = lane === state.playerLane ? 'rgba(250, 211, 87, 0.12)' : 'rgba(255, 255, 255, 0.06)';
      canvasCtx.fillRect(x + 2, 0, laneWidth - 4, height);

      canvasCtx.strokeStyle = 'rgba(255,255,255,0.12)';
      canvasCtx.lineWidth = 2;
      canvasCtx.beginPath();
      canvasCtx.moveTo(x, 0);
      canvasCtx.lineTo(x, height);
      canvasCtx.stroke();
    }

    for (const entity of state.entities) {
      const x = laneCenterX(entity.lane, width);

      if (entity.type === 'apoio') {
        canvasCtx.fillStyle = '#7ce0ae';
        canvasCtx.beginPath();
        canvasCtx.arc(x, entity.y, 13, 0, Math.PI * 2);
        canvasCtx.fill();
        canvasCtx.fillStyle = '#0f2a3d';
        canvasCtx.font = 'bold 11px sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.fillText('+' , x, entity.y + 4);
      }

      if (entity.type === 'bloqueio') {
        canvasCtx.fillStyle = '#f45f5f';
        canvasCtx.fillRect(x - 15, entity.y - 15, 30, 30);
        canvasCtx.strokeStyle = '#ffe2e2';
        canvasCtx.lineWidth = 2;
        canvasCtx.beginPath();
        canvasCtx.moveTo(x - 10, entity.y - 10);
        canvasCtx.lineTo(x + 10, entity.y + 10);
        canvasCtx.moveTo(x + 10, entity.y - 10);
        canvasCtx.lineTo(x - 10, entity.y + 10);
        canvasCtx.stroke();
      }

      if (entity.type === 'mutirao') {
        canvasCtx.fillStyle = '#ffd765';
        canvasCtx.beginPath();
        canvasCtx.arc(x, entity.y, 15, 0, Math.PI * 2);
        canvasCtx.fill();
        canvasCtx.fillStyle = '#0f2a3d';
        canvasCtx.font = 'bold 10px sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.fillText('M', x, entity.y + 4);
      }

      if (entity.type === 'individualismo') {
        canvasCtx.fillStyle = '#d3d3d3';
        canvasCtx.beginPath();
        canvasCtx.arc(x, entity.y, 12, 0, Math.PI * 2);
        canvasCtx.fill();
        canvasCtx.fillStyle = '#3b3b3b';
        canvasCtx.font = 'bold 10px sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.fillText('$', x, entity.y + 3);
      }

      if (entity.type === 'chance') {
        // Large blue/cyan star-like chance entity
        canvasCtx.fillStyle = '#00d9ff';
        canvasCtx.beginPath();
        const size = 16;
        for (let i = 0; i < 5; i += 1) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const px = x + size * Math.cos(angle);
          const py = entity.y + size * Math.sin(angle);
          if (i === 0) {
            canvasCtx.moveTo(px, py);
          } else {
            canvasCtx.lineTo(px, py);
          }
        }
        canvasCtx.closePath();
        canvasCtx.fill();
        canvasCtx.fillStyle = '#0f2a3d';
        canvasCtx.font = 'bold 10px sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.fillText('?', x, entity.y + 4);
      }
    }

    const flash = state.laneFlashMs > 0 ? state.laneFlashMs / 260 : 0;
    canvasCtx.fillStyle = `rgba(255, 80, 80, ${flash * 0.18})`;
    canvasCtx.fillRect(0, 0, width, height);

    const playerX = laneCenterX(state.playerLane, width);
    canvasCtx.fillStyle = '#f9cf4a';
    canvasCtx.beginPath();
    canvasCtx.arc(playerX, playerY, 16, 0, Math.PI * 2);
    canvasCtx.fill();
    canvasCtx.fillStyle = '#0f2a3d';
    canvasCtx.font = 'bold 11px sans-serif';
    canvasCtx.textAlign = 'center';
    canvasCtx.fillText('AF', playerX, playerY + 4);

    const progress = clamp(state.elapsedMs / RUN_DURATION_MS, 0, 1);
    canvasCtx.fillStyle = 'rgba(9, 20, 30, 0.9)';
    canvasCtx.fillRect(12, 10, width - 24, 18);
    canvasCtx.fillStyle = '#7ce0ae';
    canvasCtx.fillRect(12, 10, (width - 24) * progress, 18);

    canvasCtx.fillStyle = '#f0f5ff';
    canvasCtx.font = 'bold 13px sans-serif';
    canvasCtx.textAlign = 'left';
    canvasCtx.fillText(`Score ${Math.max(0, Math.round(state.score))}`, 14, 48);

    const meterPercent = Math.round(state.collectiveMeter);
    canvasCtx.fillText(`Comum ${meterPercent}%`, 14, 68);

    // Combo indicator
    if (state.comboTimerMs > 0) {
      const comboIntensity = Math.min(1, state.comboTimerMs / 2000);
      canvasCtx.fillStyle = `rgba(250, 211, 87, ${0.4 + comboIntensity * 0.6})`;
      canvasCtx.font = 'bold 11px sans-serif';
      canvasCtx.fillText(`🔥 Combo ativ`, 14, 88);
    } else {
      canvasCtx.fillText(`Apoios ${state.apoio} | Mutiroes ${state.mutiroes}`, 14, 88);
    }

    // Recent feedback flash
    for (const feedback of state.recentFeedback) {
      const alpha = 1 - feedback.ageMs / 500;
      if (feedback.type === 'chance') {
        canvasCtx.fillStyle = `rgba(0, 217, 255, ${alpha * 0.8})`;
        canvasCtx.font = 'bold 16px sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.fillText('!!', width / 2, height / 3);
      }
    }

    if (state.comboTimerMs > 0) {
      canvasCtx.fillStyle = '#ffd765';
      canvasCtx.fillText('Mutirao ativo: bonus coletivo', 14, 108);
    }
  },

  isFinished(state) {
    return state.elapsedMs >= RUN_DURATION_MS;
  },

  buildResult,

  getScore(state) {
    return Math.max(0, Math.round(state.score));
  },
};

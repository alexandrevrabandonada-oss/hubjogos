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

    // Background: azul profundo da direção de arte
    const background = canvasCtx.createLinearGradient(0, 0, 0, height);
    background.addColorStop(0, '#0a1f2e');
    background.addColorStop(0.5, '#123d59');
    background.addColorStop(1, '#1a4d6b');
    canvasCtx.fillStyle = background;
    canvasCtx.fillRect(0, 0, width, height);

    // Lanes com melhor contraste
    for (let lane = 0; lane < LANE_COUNT; lane += 1) {
      const x = lane * laneWidth;
      const isPlayerLane = lane === state.playerLane;
      
      // Highlight player lane com amarelo campanha
      canvasCtx.fillStyle = isPlayerLane 
        ? 'rgba(249, 207, 74, 0.15)' 
        : 'rgba(255, 255, 255, 0.04)';
      canvasCtx.fillRect(x + 3, 0, laneWidth - 6, height);

      // Lane dividers
      if (lane > 0) {
        canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        canvasCtx.lineWidth = 2;
        canvasCtx.setLineDash([8, 12]);
        canvasCtx.beginPath();
        canvasCtx.moveTo(x, 0);
        canvasCtx.lineTo(x, height);
        canvasCtx.stroke();
        canvasCtx.setLineDash([]);
      }
    }

    // Render entities com visual profissional
    for (const entity of state.entities) {
      const x = laneCenterX(entity.lane, width);

      if (entity.type === 'apoio') {
        // Verde positivo círcular
        const gradient = canvasCtx.createRadialGradient(x, entity.y, 0, x, entity.y, 15);
        gradient.addColorStop(0, '#7ce0ae');
        gradient.addColorStop(1, '#5bc893');
        canvasCtx.fillStyle = gradient;
        canvasCtx.beginPath();
        canvasCtx.arc(x, entity.y, 14, 0, Math.PI * 2);
        canvasCtx.fill();
        
        // Borda sutil
        canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        canvasCtx.lineWidth = 2;
        canvasCtx.stroke();
        
        // Ícone +
        canvasCtx.fillStyle = '#0a1f2e';
        canvasCtx.font = 'bold 13px sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.textBaseline = 'middle';
        canvasCtx.fillText('+', x, entity.y);
      }

      if (entity.type === 'bloqueio') {
        // Vermelho negativo quadrado com X
        canvasCtx.fillStyle = '#f45f5f';
        canvasCtx.fillRect(x - 16, entity.y - 16, 32, 32);
        
        // Borda escura
        canvasCtx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeRect(x - 16, entity.y - 16, 32, 32);
        
        // X branco
        canvasCtx.strokeStyle = '#ffe2e2';
        canvasCtx.lineWidth = 3;
        canvasCtx.lineCap = 'round';
        canvasCtx.beginPath();
        canvasCtx.moveTo(x - 10, entity.y - 10);
        canvasCtx.lineTo(x + 10, entity.y + 10);
        canvasCtx.moveTo(x + 10, entity.y - 10);
        canvasCtx.lineTo(x - 10, entity.y + 10);
        canvasCtx.stroke();
      }

      if (entity.type === 'mutirao') {
        // Amarelo grande círcular (mutirão = coletivo)
        const gradient = canvasCtx.createRadialGradient(x, entity.y, 0, x, entity.y, 17);
        gradient.addColorStop(0, '#ffd765');
        gradient.addColorStop(1, '#f9cf4a');
        canvasCtx.fillStyle = gradient;
        canvasCtx.beginPath();
        canvasCtx.arc(x, entity.y, 16, 0, Math.PI * 2);
        canvasCtx.fill();
        
        // Borda destaque
        canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        canvasCtx.lineWidth = 2.5;
        canvasCtx.stroke();
        
        // M de mutirão
        canvasCtx.fillStyle = '#0a1f2e';
        canvasCtx.font = 'bold 13px sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.textBaseline = 'middle';
        canvasCtx.fillText('M', x, entity.y);
      }

      if (entity.type === 'individualismo') {
        // Cinza neutro círcular
        canvasCtx.fillStyle = '#b8c5d0';
        canvasCtx.beginPath();
        canvasCtx.arc(x, entity.y, 13, 0, Math.PI * 2);
        canvasCtx.fill();
        
        // Borda escura
        canvasCtx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        canvasCtx.lineWidth = 2;
        canvasCtx.stroke();
        
        // $ de individualismo
        canvasCtx.fillStyle = '#2a3d4d';
        canvasCtx.font = 'bold 12px sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.textBaseline = 'middle';
        canvasCtx.fillText('$', x, entity.y);
      }

      if (entity.type === 'chance') {
        // Estrela azul vibrante (rara)
        canvasCtx.fillStyle = '#00d9ff';
        canvasCtx.shadowColor = '#00d9ff';
        canvasCtx.shadowBlur = 8;
        canvasCtx.beginPath();
        const size = 17;
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
        canvasCtx.shadowBlur = 0;
        
        // ? no centro
        canvasCtx.fillStyle = '#0a1f2e';
        canvasCtx.font = 'bold 12px sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.textBaseline = 'middle';
        canvasCtx.fillText('?', x, entity.y);
      }
    }

    // Flash de dano
    const flash = state.laneFlashMs > 0 ? state.laneFlashMs / 260 : 0;
    if (flash > 0) {
      canvasCtx.fillStyle = `rgba(244, 95, 95, ${flash * 0.22})`;
      canvasCtx.fillRect(0, 0, width, height);
    }

    // Player: amarelo campanha, maior e mais visível
    const playerX = laneCenterX(state.playerLane, width);
    
    // Sombra/glow do player
    canvasCtx.shadowColor = '#f9cf4a';
    canvasCtx.shadowBlur = 12;
    
    const playerGradient = canvasCtx.createRadialGradient(playerX, playerY, 0, playerX, playerY, 20);
    playerGradient.addColorStop(0, '#f9cf4a');
    playerGradient.addColorStop(1, '#f0ba38');
    canvasCtx.fillStyle = playerGradient;
    canvasCtx.beginPath();
    canvasCtx.arc(playerX, playerY, 18, 0, Math.PI * 2);
    canvasCtx.fill();
    
    canvasCtx.shadowBlur = 0;
    
    // Borda branca
    canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    canvasCtx.lineWidth = 3;
    canvasCtx.stroke();
    
    // Iniciais AF
    canvasCtx.fillStyle = '#0a1f2e';
    canvasCtx.font = 'bold 13px sans-serif';
    canvasCtx.textAlign = 'center';
    canvasCtx.textBaseline = 'middle';
    canvasCtx.fillText('AF', playerX, playerY);

    // Progress bar: barra de tempo no topo
    const progress = clamp(state.elapsedMs / RUN_DURATION_MS, 0, 1);
    const barHeight = 20;
    const barMargin = 14;
    
    // Background da barra
    canvasCtx.fillStyle = 'rgba(10, 31, 46, 0.85)';
    canvasCtx.fillRect(barMargin, 12, width - 2 * barMargin, barHeight);
    
    // Progresso verde
    const progressGradient = canvasCtx.createLinearGradient(
      barMargin, 12, 
      barMargin + (width - 2 * barMargin) * progress, 12
    );
    progressGradient.addColorStop(0, '#7ce0ae');
    progressGradient.addColorStop(1, '#5bc893');
    canvasCtx.fillStyle = progressGradient;
    canvasCtx.fillRect(barMargin, 12, (width - 2 * barMargin) * progress, barHeight);
    
    // Borda da barra
    canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeRect(barMargin, 12, width - 2 * barMargin, barHeight);

    // Meter coletivo: barra lateral
    const meterHeight = height * 0.3;
    const meterWidth = 24;
    const meterX = width - meterWidth - 12;
    const meterY = height * 0.35;
    const meterFill = clamp(state.collectiveMeter / 100, 0, 1);
    
    // Background do meter
    canvasCtx.fillStyle = 'rgba(10, 31, 46, 0.7)';
    canvasCtx.fillRect(meterX, meterY, meterWidth, meterHeight);
    
    // Fill do meter (de baixo para cima)
    const fillHeight = meterHeight * meterFill;
    const meterGradient = canvasCtx.createLinearGradient(0, meterY + meterHeight, 0, meterY + meterHeight - fillHeight);
    meterGradient.addColorStop(0, '#f9cf4a');
    meterGradient.addColorStop(1, '#ffd765');
    canvasCtx.fillStyle = meterGradient;
    canvasCtx.fillRect(meterX, meterY + meterHeight - fillHeight, meterWidth, fillHeight);
    
    // Borda do meter
    canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeRect(meterX, meterY, meterWidth, meterHeight);
    
    // Label do meter
    canvasCtx.save();
    canvasCtx.translate(meterX + meterWidth / 2, meterY - 10);
    canvasCtx.fillStyle = '#f0f5ff';
    canvasCtx.font = 'bold 9px sans-serif';
    canvasCtx.textAlign = 'center';
    canvasCtx.textBaseline = 'bottom';
    canvasCtx.fillText('COMUM', 0, 0);
    canvasCtx.restore();
    
    // Porcentagem do meter
    canvasCtx.fillStyle = '#f0f5ff';
    canvasCtx.font = 'bold 11px sans-serif';
    canvasCtx.textAlign = 'center';
    canvasCtx.textBaseline = 'top';
    canvasCtx.fillText(`${Math.round(state.collectiveMeter)}%`, meterX + meterWidth / 2, meterY + meterHeight + 6);

    // Stats info (canto inferior esquerdo)
    const statsY = height - 45;
    canvasCtx.fillStyle = 'rgba(10, 31, 46, 0.75)';
    canvasCtx.fillRect(10, statsY, 180, 38);
    
    canvasCtx.fillStyle = '#f0f5ff';
    canvasCtx.font = 'bold 10px sans-serif';
    canvasCtx.textAlign = 'left';
    canvasCtx.textBaseline = 'top';
    canvasCtx.fillText(`Apoios ${state.apoio} • Mutirões ${state.mutiroes}`, 16, statsY + 6);
    canvasCtx.fillText(`Bloqueios ${state.bloqueios}`, 16, statsY + 22);

    // Combo indicator (destaque quando ativo)
    if (state.comboTimerMs > 0) {
      const comboIntensity = Math.min(1, state.comboTimerMs / 2000);
      const comboAlpha = 0.5 + comboIntensity * 0.5;
      
      canvasCtx.fillStyle = `rgba(249, 207, 74, ${comboAlpha})`;
      canvasCtx.fillRect(width / 2 - 90, height - 90, 180, 32);
      
      canvasCtx.strokeStyle = '#f9cf4a';
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeRect(width / 2 - 90, height - 90, 180, 32);
      
      canvasCtx.fillStyle = '#0a1f2e';
      canvasCtx.font = 'bold 14px sans-serif';
      canvasCtx.textAlign = 'center';
      canvasCtx.textBaseline = 'middle';
      canvasCtx.fillText('🔥 COMBO ATIVO', width / 2, height - 74);
    }

    // Recent feedback flash
    for (const feedback of state.recentFeedback) {
      const alpha = 1 - feedback.ageMs / 500;
      if (feedback.type === 'chance') {
        canvasCtx.save();
        canvasCtx.shadowColor = '#00d9ff';
        canvasCtx.shadowBlur = 20;
        canvasCtx.fillStyle = `rgba(0, 217, 255, ${alpha})`;
        canvasCtx.font = 'bold 24px sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.textBaseline = 'middle';
        canvasCtx.fillText('CHANCE!', width / 2, height / 3);
        canvasCtx.restore();
      }
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

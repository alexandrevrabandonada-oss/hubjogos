import { generateId } from '@/lib/storage/local-session';
import type {
  ArcadeGameLogic,
  ArcadeInputSnapshot,
  ArcadeRunResult,
  ArcadeTickResult,
} from './types';

interface Passageiro {
  id: string;
  stop: number;
  waiting: boolean;
  destination: number;
  ageMs: number;
}

interface PasseLivreState {
  playerStop: number;
  passageiros: Passageiro[];
  spawnCooldownMs: number;
  transportedCount: number;
  missedCount: number;
  score: number;
  coverageMeter: number;
  coverageMeterTarget: number;
  defenseMeterMs: number;
  elapsedMs: number;
  privatizacaoArming: number;
  sindicatoActive: boolean;
}

const STOP_COUNT = 4;
const RUN_DURATION_MS = 90_000;
const BASE_SPAWN_MS = 2_200;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function stopX(stop: number, width: number) {
  const stopWidth = width / STOP_COUNT;
  return stopWidth * stop + stopWidth / 2;
}

function normalizeStop(pointerStop: number | null) {
  if (pointerStop === null) {
    return null;
  }
  return clamp(pointerStop, 0, STOP_COUNT - 1);
}

function randomStop() {
  return Math.floor(Math.random() * STOP_COUNT);
}

function spawnPassageiro(): Passageiro {
  const origin = randomStop();
  let destination = randomStop();
  while (destination === origin) {
    destination = randomStop();
  }

  return {
    id: generateId('passe-passageiro'),
    stop: origin,
    waiting: true,
    destination,
    ageMs: 0,
  };
}

function applyInput(state: PasseLivreState, input: ArcadeInputSnapshot) {
  let nextStop = state.playerStop;

  if (input.pointerLane !== null) {
    nextStop = Math.min(STOP_COUNT - 1, input.pointerLane);
  }
  if (input.moveLeftPressed) {
    nextStop -= 1;
  }
  if (input.moveRightPressed) {
    nextStop += 1;
  }

  return clamp(nextStop, 0, STOP_COUNT - 1);
}

function calculateCoverage(state: PasseLivreState): number {
  // Calculate coverage as percentage based on transported/missed balance
  const coverageScore = Math.min(100, Math.max(20, 40 + (state.transportedCount - state.missedCount) * 2 - state.privatizacaoArming * 15));
  return Math.round(coverageScore);
}

function resolveCoverageRate(state: PasseLivreState) {
  return calculateCoverage(state);
}

function buildResult(state: PasseLivreState): ArcadeRunResult {
  const coverageRate = resolveCoverageRate(state);
  const resultScore = Math.max(
    0,
    Math.round(
      state.score +
        state.transportedCount * 45 +
        Math.max(0, state.coverageMeter - 50) * 1.8 -
        state.missedCount * 30 -
        state.privatizacaoArming * 50,
    ),
  );

  const title =
    coverageRate >= 72
      ? 'Passe Livre Consolidado'
      : coverageRate >= 45
      ? 'Passe Livre em Avanço'
      : 'Passe Livre sob Ameaça';

  const summary =
    coverageRate >= 72
      ? 'Você expandiu a mobilidade gratuita por toda a cidade. Dinheiro público para transporte público, sem lucro privado.'
      : coverageRate >= 45
      ? 'Você avançou o passe livre, mas ainda há pressão da privatização. Mantenha a luta coletiva.'
      : 'A pressão privatista travou a expansão. Sem sindicato organizado, a tarifa vence.';

  return {
    resultId: generateId('arcade-resultado'),
    score: resultScore,
    title,
    summary,
    campaignLine: 'Passe livre nacional: mobilidade para todas as pessoas, organização de base em cada parada.',
    stats: {
      apoio: state.transportedCount,
      mutiroes: 0,
      bloqueios: state.privatizacaoArming,
      individualismos: state.missedCount,
      collectiveRate: coverageRate,
      durationMs: state.elapsedMs,
    },
  };
}

export const passeLivreNacionalLogic: ArcadeGameLogic<PasseLivreState> = {
  createInitialState() {
    return {
      playerStop: 1,
      passageiros: [],
      spawnCooldownMs: BASE_SPAWN_MS,
      transportedCount: 0,
      missedCount: 0,
      score: 0,
      coverageMeter: 50,
      coverageMeterTarget: 50,
      defenseMeterMs: 0,
      elapsedMs: 0,
      privatizacaoArming: 0,
      sindicatoActive: false,
    };
  },

  update(state, input, ctx): ArcadeTickResult<PasseLivreState> {
    const next: PasseLivreState = {
      ...state,
      elapsedMs: state.elapsedMs + ctx.dtMs,
      playerStop: applyInput(state, {
        ...input,
        pointerLane: normalizeStop(input.pointerLane),
      }),
      defenseMeterMs: Math.max(0, state.defenseMeterMs - ctx.dtMs),
    };

    // Smooth coverage meter
    const coverageDiff = next.coverageMeterTarget - next.coverageMeter;
    if (Math.abs(coverageDiff) > 0.1) {
      next.coverageMeter += coverageDiff * 0.12;
    } else {
      next.coverageMeter = next.coverageMeterTarget;
    }

    // Aging passageiros and detecting misses
    const updated: Passageiro[] = [];
    for (const p of next.passageiros) {
      const aged = { ...p, ageMs: p.ageMs + ctx.dtMs };

      // Passageiro leaves after 8 seconds if not picked up
      if (aged.ageMs > 8_000 && aged.waiting) {
        next.missedCount += 1;
        next.coverageMeterTarget = clamp(next.coverageMeterTarget - 15, 0, 100);
        continue;
      }

      updated.push(aged);
    }
    next.passageiros = updated;

    // Spawn new passageiros
    const events: ArcadeTickResult<PasseLivreState>['events'] = [];

    next.spawnCooldownMs -= ctx.dtMs;
    if (next.spawnCooldownMs <= 0) {
      next.passageiros = [...next.passageiros, spawnPassageiro()];
      const paceFactor = clamp(next.elapsedMs / RUN_DURATION_MS, 0, 1);
      next.spawnCooldownMs = BASE_SPAWN_MS - paceFactor * 1_000 + Math.random() * 600;
    }

    // Privatization threat (grows with time, decreases with coverage)
    const threatProgression = Math.pow(next.elapsedMs / RUN_DURATION_MS, 1.5);
    next.privatizacaoArming = Math.round(
      Math.max(0, threatProgression * 80 - next.defenseMeterMs / 100 - next.coverageMeter * 0.3),
    );

    // Check pickup at current stop
    const atStop: Passageiro[] = [];
    const elsewhere: Passageiro[] = [];

    for (const p of next.passageiros) {
      if (p.stop === next.playerStop && p.waiting) {
        // Picked up!
        next.transportedCount += 1;
        next.score += 18;
        next.coverageMeterTarget = clamp(next.coverageMeterTarget + 12, 0, 100);
        next.defenseMeterMs = 3_000; // Short defense boost
        events.push({ type: 'powerup_collect', powerupId: 'sindicato-defesa' });

        // Continue to destination
        atStop.push({ ...p, stop: p.destination, waiting: false });
      } else if (p.stop === p.destination && !p.waiting) {
        // Delivered!
        next.score += 8;
        next.coverageMeterTarget = clamp(next.coverageMeterTarget + 5, 0, 100);
        // Gone (success)
      } else {
        elsewhere.push(p);
      }
    }

    next.passageiros = [...atStop, ...elsewhere];

    // Sindicato activation (rare chance when coverage high)
    if (Math.random() < 0.015 && next.coverageMeter > 60) {
      next.sindicatoActive = true;
      next.defenseMeterMs = 12_000;
      next.coverageMeterTarget = clamp(next.coverageMeterTarget + 20, 0, 100);
      events.push({ type: 'powerup_collect', powerupId: 'sindicato-nacional' });
    }

    return {
      state: next,
      events,
    };
  },

  render(canvasCtx, state, view) {
    const { width, height } = view;
    const stopWidth = width / STOP_COUNT;

    canvasCtx.clearRect(0, 0, width, height);

    // Background with gradient
    const background = canvasCtx.createLinearGradient(0, 0, 0, height);
    background.addColorStop(0, '#1a4d3d');
    background.addColorStop(1, '#0d3d2d');
    canvasCtx.fillStyle = background;
    canvasCtx.fillRect(0, 0, width, height);

    // Draw stops
    const stopY = height * 0.65;
    for (let i = 0; i < STOP_COUNT; i += 1) {
      const x = stopX(i, width);

      // Stop base
      canvasCtx.fillStyle = i === state.playerStop ? 'rgba(124, 224, 174, 0.25)' : 'rgba(255, 255, 255, 0.08)';
      canvasCtx.fillRect(x - stopWidth / 2 + 4, stopY - 24, stopWidth - 8, 48);

      // Stop label
      canvasCtx.fillStyle = '#f0f5ff';
      canvasCtx.font = '11px sans-serif';
      canvasCtx.textAlign = 'center';
      canvasCtx.fillText(`Parada ${i + 1}`, x, stopY + 32);
    }

    // Draw passageiros
    for (const p of state.passageiros) {
      const x = stopX(p.stop, width);
      const yVariance = Math.sin((p.id.charCodeAt(5) || 0) / 256 * Math.PI) * 8;

      if (p.waiting) {
        canvasCtx.fillStyle = '#5fa5ff';
        canvasCtx.beginPath();
        canvasCtx.arc(x, stopY - 50 + yVariance, 8, 0, Math.PI * 2);
        canvasCtx.fill();
      } else {
        // In transit (smaller, lighter)
        canvasCtx.fillStyle = 'rgba(95, 165, 255, 0.5)';
        canvasCtx.beginPath();
        canvasCtx.arc(x, stopY - 100 + yVariance, 5, 0, Math.PI * 2);
        canvasCtx.fill();
      }
    }

    // Draw player shuttle
    const playerX = stopX(state.playerStop, width);
    canvasCtx.fillStyle = '#7ce0ae';
    canvasCtx.beginPath();
    canvasCtx.moveTo(playerX - 14, stopY - 8);
    canvasCtx.lineTo(playerX + 14, stopY - 8);
    canvasCtx.lineTo(playerX + 12, stopY + 8);
    canvasCtx.lineTo(playerX - 12, stopY + 8);
    canvasCtx.closePath();
    canvasCtx.fill();
    canvasCtx.fillStyle = '#0d3d2d';
    canvasCtx.font = 'bold 10px sans-serif';
    canvasCtx.textAlign = 'center';
    canvasCtx.fillText('TT', playerX, stopY + 2);

    // Progress bar
    const progress = clamp(state.elapsedMs / RUN_DURATION_MS, 0, 1);
    canvasCtx.fillStyle = 'rgba(9, 20, 30, 0.9)';
    canvasCtx.fillRect(12, 10, width - 24, 16);
    canvasCtx.fillStyle = '#7ce0ae';
    canvasCtx.fillRect(12, 10, (width - 24) * progress, 16);

    // HUD
    canvasCtx.fillStyle = '#f0f5ff';
    canvasCtx.font = 'bold 13px sans-serif';
    canvasCtx.textAlign = 'left';
    canvasCtx.fillText(`Score ${Math.max(0, Math.round(state.score))}`, 14, 46);

    const coveragePercent = Math.round(state.coverageMeter);
    canvasCtx.fillText(`Cobertura ${coveragePercent}%`, 14, 66);

    if (state.defenseMeterMs > 0) {
      canvasCtx.fillStyle = `rgba(92, 245, 147, 0.8)`;
      canvasCtx.font = 'bold 11px sans-serif';
      canvasCtx.fillText(`🛡️ Sindicato ativo`, 14, 86);
    } else {
      canvasCtx.fillText(`Transportado ${state.transportedCount} | Perdido ${state.missedCount}`, 14, 86);
    }

    // Privatization warning
    if (state.privatizacaoArming > 50) {
      canvasCtx.fillStyle = `rgba(244, 95, 95, ${Math.min(1, state.privatizacaoArming / 80)})`;
      canvasCtx.font = 'bold 28px sans-serif';
      canvasCtx.textAlign = 'center';
      canvasCtx.fillText('⚠️', width / 2, height / 3);
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

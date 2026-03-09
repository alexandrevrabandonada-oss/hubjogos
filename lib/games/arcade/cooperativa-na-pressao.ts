import { generateId } from '@/lib/storage/local-session';
import type { ArcadeGameLogic, ArcadeRunResult, ArcadeRuntimeEvent, ArcadeTickResult } from './types';

type CooperativaPhase = 'abertura' | 'ritmo' | 'pressao' | 'fechamento';
type CooperativaEventId = 'queda-fornecedor' | 'pane-maquina' | 'onda-solidaria';
type StationId = 'montagem' | 'logistica' | 'cuidado';

interface StationState {
  id: StationId;
  label: string;
  backlog: number;
  burnout: number;
}

interface CooperativaState {
  elapsedMs: number;
  selectedStation: number;
  stations: StationState[];
  estabilidade: number;
  solidariedade: number;
  mutiraoCharge: number;
  mutiraoActiveMs: number;
  pressurePeak: number;
  score: number;
  demandsResolved: number;
  collectiveActions: number;
  individualActions: number;
  eventsTriggered: number;
  actionsUsed: number;
  burnoutWarningMs: number;
  failedByCollapse: boolean;
  currentPhase: CooperativaPhase;
  phaseTransitionMs: number;
  activeEvent: CooperativaEventId | null;
  eventTimeLeftMs: number;
  eventCooldownMs: number;
  lastActionLabel: string;
  actionFeedbackMs: number;
}

const RUN_DURATION_MS = 85_000;
const COLLAPSE_GRACE_MS = 9_000;
const STATION_COUNT = 3;

const STATION_BASE: Array<Pick<StationState, 'id' | 'label'>> = [
  { id: 'montagem', label: 'Montagem' },
  { id: 'logistica', label: 'Logistica' },
  { id: 'cuidado', label: 'Cuidado' },
];

const EVENT_DURATION_MS: Record<CooperativaEventId, number> = {
  'queda-fornecedor': 7_000,
  'pane-maquina': 6_500,
  'onda-solidaria': 6_000,
};

const ASSET_PATHS = {
  bg: '/arcade/cooperativa-na-pressao/bg/bg-cooperativa-base-v1.svg',
  player: '/arcade/cooperativa-na-pressao/player/player-coordenador-coop-v1.svg',
  station: '/arcade/cooperativa-na-pressao/entities/entity-estacao-coop-v1.svg',
  hudEstabilidade: '/arcade/cooperativa-na-pressao/ui/ui-hud-estabilidade-v1.svg',
  hudPressao: '/arcade/cooperativa-na-pressao/ui/ui-hud-pressao-v1.svg',
};

const imageCache = new Map<string, HTMLImageElement>();

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function tryLoadImage(path: string) {
  if (typeof window === 'undefined') {
    return null;
  }
  if (imageCache.has(path)) {
    return imageCache.get(path) || null;
  }
  const image = new Image();
  image.src = path;
  imageCache.set(path, image);
  return image;
}

function getPhase(elapsedMs: number): CooperativaPhase {
  if (elapsedMs < 20_000) return 'abertura';
  if (elapsedMs < 55_000) return 'ritmo';
  if (elapsedMs < 75_000) return 'pressao';
  return 'fechamento';
}

function getPressure(stations: StationState[]) {
  const total = stations.reduce((sum, station) => sum + station.backlog + station.burnout, 0);
  return Math.round(total / stations.length / 2);
}

function eventMultiplier(eventId: CooperativaEventId | null, station: StationState) {
  if (!eventId) return 1;
  if (eventId === 'queda-fornecedor') {
    return station.id === 'montagem' ? 1.45 : 1.15;
  }
  if (eventId === 'pane-maquina') {
    return station.id === 'logistica' ? 1.35 : 1.10;
  }
  if (eventId === 'onda-solidaria') {
    return 0.72;
  }
  return 1;
}

function maybeTriggerEvent(state: CooperativaState): CooperativaEventId | null {
  if (state.eventTimeLeftMs > 0 || state.eventCooldownMs > 0) {
    return null;
  }

  const elapsed = state.elapsedMs;
  const rnd = Math.random();

  if (elapsed > 14_000 && elapsed < 62_000 && rnd < 0.013) {
    return 'queda-fornecedor';
  }
  if (elapsed > 26_000 && elapsed < 78_000 && rnd < 0.013) {
    return 'pane-maquina';
  }
  if (elapsed > 34_000 && elapsed < 84_000 && rnd < 0.012) {
    return 'onda-solidaria';
  }

  return null;
}

function applyAction(
  state: CooperativaState,
  action: 'organizar-turno' | 'redistribuir-esforco' | 'cuidar-equipe' | 'mutirao-cooperativo',
): ArcadeRuntimeEvent[] {
  const events: ArcadeRuntimeEvent[] = [];
  const selected = state.stations[state.selectedStation];
  const mutiraoBoost = state.mutiraoActiveMs > 0 ? 1.5 : 1;

  if (action === 'organizar-turno') {
    const before = selected.backlog;
    selected.backlog = clamp(selected.backlog - 22 * mutiraoBoost, 0, 100);
    selected.burnout = clamp(selected.burnout - 8 * mutiraoBoost, 0, 100);
    const resolved = Math.max(0, before - selected.backlog);
    state.demandsResolved += Math.round(resolved / 3);
    state.estabilidade = clamp(state.estabilidade + 4, 0, 100);
    state.mutiraoCharge = clamp(state.mutiraoCharge + 13, 0, 100);
    state.score += Math.round(45 * mutiraoBoost);
    state.collectiveActions += 1;
    state.actionFeedbackMs = 800;
    state.lastActionLabel = `${selected.label}: turno coletivo organizado`;
    events.push({ type: 'action_used', actionId: 'organizar-turno', hotspotId: selected.id });
  }

  if (action === 'redistribuir-esforco') {
    const avgBacklog = state.stations.reduce((sum, station) => sum + station.backlog, 0) / state.stations.length;
    for (const station of state.stations) {
      if (station.backlog > avgBacklog) {
        station.backlog = clamp(station.backlog - 12 * mutiraoBoost, 0, 100);
      } else {
        station.backlog = clamp(station.backlog - 5 * mutiraoBoost, 0, 100);
      }
      station.burnout = clamp(station.burnout - 4 * mutiraoBoost, 0, 100);
    }
    state.solidariedade = clamp(state.solidariedade + 5, 0, 100);
    state.mutiraoCharge = clamp(state.mutiraoCharge + 15, 0, 100);
    state.score += Math.round(38 * mutiraoBoost);
    state.collectiveActions += 1;
    state.actionFeedbackMs = 800;
    state.lastActionLabel = 'Esforco redistribuido entre estacoes';
    events.push({ type: 'action_used', actionId: 'redistribuir-esforco' });
  }

  if (action === 'cuidar-equipe') {
    for (const station of state.stations) {
      station.burnout = clamp(station.burnout - 15 * mutiraoBoost, 0, 100);
      station.backlog = clamp(station.backlog - 5 * mutiraoBoost, 0, 100);
    }
    state.solidariedade = clamp(state.solidariedade + 8, 0, 100);
    state.estabilidade = clamp(state.estabilidade + 3, 0, 100);
    state.mutiraoCharge = clamp(state.mutiraoCharge + 12, 0, 100);
    state.score += Math.round(32 * mutiraoBoost);
    state.collectiveActions += 1;
    state.actionFeedbackMs = 800;
    state.lastActionLabel = 'Cuidado coletivo reduziu exaustao';
    events.push({ type: 'action_used', actionId: 'cuidar-equipe' });
  }

  if (action === 'mutirao-cooperativo' && state.mutiraoCharge >= 85) {
    state.mutiraoCharge = 0;
    state.mutiraoActiveMs = 10_000;
    state.score += 120;
    state.actionFeedbackMs = 1200;
    state.lastActionLabel = 'Mutirao cooperativo ativado';
    events.push({ type: 'special_event', eventId: 'mutirao-cooperativo' });
    events.push({ type: 'action_used', actionId: 'mutirao-cooperativo' });
  }

  state.actionsUsed += 1;
  return events;
}

function buildResult(state: CooperativaState): ArcadeRunResult {
  const survived = !state.failedByCollapse;
  const pressure = getPressure(state.stations);
  const collectiveRate = clamp(
    Math.round((state.collectiveActions / Math.max(1, state.actionsUsed)) * 100),
    0,
    100,
  );

  return {
    score: Math.max(0, Math.round(state.score)),
    title: survived ? 'Cooperativa segurou a producao' : 'Operacao colapsou sob pressao',
    summary: survived
      ? `Voce sustentou demanda e cuidado com pressao final em ${pressure}%. Solidariedade em ${Math.round(
          state.solidariedade,
        )}%.`
      : `A exaustao passou do limite e a fila explodiu. Pressao de pico ${Math.round(state.pressurePeak)}%.`,
    campaignLine:
      'Alexandre Fonseca para Deputado: trabalho digno, cooperativismo e autogestao para reorganizar a economia popular.',
    resultId: generateId('arcade-cooperativa-resultado'),
    stats: {
      apoio: state.collectiveActions,
      mutiroes: state.mutiraoActiveMs > 0 ? 1 : 0,
      bloqueios: state.eventsTriggered,
      individualismos: state.individualActions,
      collectiveRate,
      durationMs: state.elapsedMs,
    },
  };
}

export const cooperativaNaPressaoLogic: ArcadeGameLogic<CooperativaState> = {
  createInitialState() {
    return {
      elapsedMs: 0,
      selectedStation: 0,
      stations: STATION_BASE.map((station) => ({ ...station, backlog: 26, burnout: 24 })),
      estabilidade: 74,
      solidariedade: 67,
      mutiraoCharge: 0,
      mutiraoActiveMs: 0,
      pressurePeak: 0,
      score: 0,
      demandsResolved: 0,
      collectiveActions: 0,
      individualActions: 0,
      eventsTriggered: 0,
      actionsUsed: 0,
      burnoutWarningMs: 0,
      failedByCollapse: false,
      currentPhase: 'abertura',
      phaseTransitionMs: 0,
      activeEvent: null,
      eventTimeLeftMs: 0,
      eventCooldownMs: 4_500,
      lastActionLabel: 'Escolha uma estacao e coordene o coletivo',
      actionFeedbackMs: 0,
    };
  },

  update(state, input, ctx): ArcadeTickResult<CooperativaState> {
    const next: CooperativaState = {
      ...state,
      elapsedMs: state.elapsedMs + ctx.dtMs,
      stations: state.stations.map((station) => ({ ...station })),
      mutiraoActiveMs: Math.max(0, state.mutiraoActiveMs - ctx.dtMs),
      phaseTransitionMs: Math.max(0, state.phaseTransitionMs - ctx.dtMs),
      eventTimeLeftMs: Math.max(0, state.eventTimeLeftMs - ctx.dtMs),
      eventCooldownMs: Math.max(0, state.eventCooldownMs - ctx.dtMs),
      actionFeedbackMs: Math.max(0, state.actionFeedbackMs - ctx.dtMs),
    };

    const events: ArcadeRuntimeEvent[] = [];

    const nextPhase = getPhase(next.elapsedMs);
    if (nextPhase !== next.currentPhase) {
      next.currentPhase = nextPhase;
      next.phaseTransitionMs = 1_500;
      events.push({
        type: 'phase_transition',
        phase:
          nextPhase === 'abertura'
            ? 'abertura'
            : nextPhase === 'ritmo'
            ? 'escalada'
            : nextPhase === 'pressao'
            ? 'pressao'
            : 'final',
      });
    }

    if (input.pointerLane !== null) {
      const newStation = clamp(input.pointerLane, 0, STATION_COUNT - 1);
      if (newStation !== next.selectedStation) {
        events.push({ type: 'station_select', stationId: next.stations[newStation].id });
      }
      next.selectedStation = newStation;
    }
    if (input.moveLeftPressed) {
      const newStation = clamp(next.selectedStation - 1, 0, STATION_COUNT - 1);
      if (newStation !== next.selectedStation) {
        events.push({ type: 'station_select', stationId: next.stations[newStation].id });
      }
      next.selectedStation = newStation;
    }
    if (input.moveRightPressed) {
      const newStation = clamp(next.selectedStation + 1, 0, STATION_COUNT - 1);
      if (newStation !== next.selectedStation) {
        events.push({ type: 'station_select', stationId: next.stations[newStation].id });
      }
      next.selectedStation = newStation;
    }

    if (input.actionOnePressed) {
      events.push(...applyAction(next, 'organizar-turno'));
    }
    if (input.actionTwoPressed) {
      events.push(...applyAction(next, 'redistribuir-esforco'));
    }
    if (input.actionThreePressed) {
      events.push(...applyAction(next, 'cuidar-equipe'));
    }
    if (input.specialPressed) {
      const before = next.mutiraoActiveMs;
      events.push(...applyAction(next, 'mutirao-cooperativo'));
      if (before === next.mutiraoActiveMs && next.mutiraoCharge < 85) {
        next.lastActionLabel = 'Mutirao ainda sem carga suficiente';
      }
    }

    if (next.eventTimeLeftMs === 0 && next.activeEvent) {
      next.activeEvent = null;
      next.eventCooldownMs = 7_000;
    }

    const eventId = maybeTriggerEvent(next);
    if (eventId) {
      next.activeEvent = eventId;
      next.eventTimeLeftMs = EVENT_DURATION_MS[eventId];
      next.eventsTriggered += 1;
      next.lastActionLabel = `Evento: ${eventId.replace('-', ' ')}`;
      events.push({ type: 'special_event', eventId });
    }

    const phasePressure =
      next.currentPhase === 'abertura'
        ? 0.005
        : next.currentPhase === 'ritmo'
        ? 0.009
        : next.currentPhase === 'pressao'
        ? 0.013
        : 0.016;

    for (const station of next.stations) {
      const pressure = (ctx.dtMs * phasePressure * eventMultiplier(next.activeEvent, station)) / 16;
      station.backlog = clamp(station.backlog + pressure * 1.25, 0, 100);
      station.burnout = clamp(station.burnout + pressure * 0.95, 0, 100);

      if (next.mutiraoActiveMs > 0) {
        station.backlog = clamp(station.backlog - 0.32 * (ctx.dtMs / 16), 0, 100);
        station.burnout = clamp(station.burnout - 0.24 * (ctx.dtMs / 16), 0, 100);
      }

      if ((station.backlog > 80 || station.burnout > 80) && Math.random() < 0.03) {
        events.push({ type: 'station_overload', stationId: station.id });
      }
    }

    const pressureNow = getPressure(next.stations);
    next.pressurePeak = Math.max(next.pressurePeak, pressureNow);
    if (pressureNow > 74 && next.pressurePeak === pressureNow) {
      events.push({ type: 'powerup_collect', powerupId: 'pressure-peak' });
    }

    const pressureFactor = (pressureNow / 100) * (ctx.dtMs / 16);
    next.estabilidade = clamp(next.estabilidade - pressureFactor * 0.09, 0, 100);
    next.solidariedade = clamp(next.solidariedade - pressureFactor * 0.07, 0, 100);

    if (next.activeEvent === 'onda-solidaria') {
      next.solidariedade = clamp(next.solidariedade + 0.10 * (ctx.dtMs / 16), 0, 100);
      next.estabilidade = clamp(next.estabilidade + 0.05 * (ctx.dtMs / 16), 0, 100);
    }

    if (next.estabilidade < 22 || next.solidariedade < 20 || pressureNow > 94) {
      next.burnoutWarningMs += ctx.dtMs;
    } else {
      next.burnoutWarningMs = 0;
    }

    if (next.burnoutWarningMs >= COLLAPSE_GRACE_MS && !next.failedByCollapse) {
      next.failedByCollapse = true;
      const collapseReason =
        next.estabilidade < 22
          ? 'estabilidade'
          : next.solidariedade < 20
          ? 'solidariedade'
          : 'pressao';
      events.push({ type: 'collapse', reason: collapseReason });
    }

    next.score += Math.round(Math.max(0, (100 - pressureNow) * 0.08));

    return { state: next, events };
  },

  render(canvasCtx, state, view) {
    const { width, height } = view;
    canvasCtx.clearRect(0, 0, width, height);

    const gradient = canvasCtx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#10232f');
    gradient.addColorStop(0.55, '#1f3f4d');
    gradient.addColorStop(1, '#162832');
    canvasCtx.fillStyle = gradient;
    canvasCtx.fillRect(0, 0, width, height);

    const bgImage = tryLoadImage(ASSET_PATHS.bg);
    if (bgImage && bgImage.complete) {
      canvasCtx.globalAlpha = 0.2;
      canvasCtx.drawImage(bgImage, 0, 0, width, height);
      canvasCtx.globalAlpha = 1;
    }

    canvasCtx.fillStyle = '#eff5ff';
    canvasCtx.font = 'bold 16px sans-serif';
    canvasCtx.fillText('Cooperativa na Pressao', 16, 30);
    canvasCtx.font = '12px sans-serif';
    canvasCtx.fillStyle = '#c9d8e6';
    canvasCtx.fillText(`Fase: ${state.currentPhase}`, 16, 48);
    const remainingSec = Math.max(0, Math.ceil((RUN_DURATION_MS - state.elapsedMs) / 1000));
    canvasCtx.fillText(`Tempo: ${remainingSec}s`, width - 92, 30);

    const renderBar = (
      label: string,
      value: number,
      color: string,
      y: number,
      height = 10,
      iconPath?: string,
      highlight = false,
    ) => {
      const icon = iconPath ? tryLoadImage(iconPath) : null;
      if (icon && icon.complete) {
        canvasCtx.drawImage(icon, 16, y - 13, 14, 14);
      }
      canvasCtx.fillStyle = highlight ? '#fffef7' : '#dbe7ef';
      canvasCtx.font = highlight ? 'bold 12px sans-serif' : '11px sans-serif';
      canvasCtx.fillText(label, 34, y);
      canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      canvasCtx.fillRect(122, y - height / 2 - 1, width - 138, height);
      canvasCtx.fillStyle = color;
      canvasCtx.fillRect(122, y - height / 2 - 1, ((width - 138) * clamp(value, 0, 100)) / 100, height);
      if (highlight) {
        canvasCtx.strokeStyle = color;
        canvasCtx.lineWidth = 1.5;
        canvasCtx.strokeRect(122, y - height / 2 - 1, width - 138, height);
      }
    };

    const mutiraoReady = state.mutiraoCharge >= 85;
    const collapseWarning = state.burnoutWarningMs > 3_000;

    renderBar('Estabilidade', state.estabilidade, '#7fd36e', 72, 12, ASSET_PATHS.hudEstabilidade, collapseWarning);
    renderBar('Solidariedade', state.solidariedade, '#c9f27b', 95, 10);
    renderBar('Pressao', getPressure(state.stations), '#f18f4e', 116, 12, ASSET_PATHS.hudPressao, collapseWarning);
    renderBar('Mutirao', state.mutiraoCharge, '#f9cf4a', 139, 11, undefined, mutiraoReady);

    const cardWidth = width * 0.29;
    const gap = width * 0.035;
    const stationY = height * 0.36;
    const stationImage = tryLoadImage(ASSET_PATHS.station);

    for (let i = 0; i < state.stations.length; i += 1) {
      const station = state.stations[i];
      const x = width * 0.07 + i * (cardWidth + gap);
      const selected = i === state.selectedStation;
      const criticalBacklog = station.backlog > 75;
      const criticalBurnout = station.burnout > 75;
      const isCritical = criticalBacklog || criticalBurnout;

      if (selected && !isCritical) {
        canvasCtx.shadowColor = '#c9f27b';
        canvasCtx.shadowBlur = 18;
        canvasCtx.strokeStyle = '#c9f27b';
        canvasCtx.lineWidth = 3.5;
        canvasCtx.beginPath();
        canvasCtx.roundRect(x, stationY, cardWidth, height * 0.3, 14);
        canvasCtx.stroke();
        canvasCtx.shadowBlur = 0;
      }

      if (isCritical) {
        canvasCtx.fillStyle = selected ? 'rgba(241, 143, 78, 0.25)' : 'rgba(241, 143, 78, 0.15)';
        canvasCtx.strokeStyle = selected ? '#f18f4e' : 'rgba(241, 143, 78, 0.6)';
        canvasCtx.lineWidth = selected ? 3.5 : 2.0;
        if (selected) {
          canvasCtx.shadowColor = '#f18f4e';
          canvasCtx.shadowBlur = 16;
        }
      } else {
        canvasCtx.fillStyle = selected ? 'rgba(201, 242, 123, 0.25)' : 'rgba(11, 24, 36, 0.88)';
        canvasCtx.strokeStyle = selected ? '#c9f27b' : 'rgba(134, 177, 199, 0.4)';
        canvasCtx.lineWidth = selected ? 3.5 : 1.2;
      }

      canvasCtx.beginPath();
      canvasCtx.roundRect(x, stationY, cardWidth, height * 0.3, 14);
      canvasCtx.fill();
      canvasCtx.stroke();
      canvasCtx.shadowBlur = 0;

      if (stationImage && stationImage.complete) {
        canvasCtx.drawImage(stationImage, x + 10, stationY + 10, 48, 48);
      } else {
        canvasCtx.fillStyle = '#2f5d50';
        canvasCtx.fillRect(x + 12, stationY + 12, 42, 42);
      }

      canvasCtx.fillStyle = selected ? '#fffef7' : '#eff5ff';
      canvasCtx.font = selected ? 'bold 14px sans-serif' : 'bold 13px sans-serif';
      canvasCtx.fillText(station.label, x + 62, stationY + 30);
      canvasCtx.font = '11px sans-serif';
      canvasCtx.fillStyle = criticalBacklog ? '#ff9966' : '#f6cb73';
      canvasCtx.fillText(`Fila ${Math.round(station.backlog)}%`, x + 12, stationY + 72);
      canvasCtx.fillStyle = criticalBurnout ? '#ff6666' : '#f38b86';
      canvasCtx.fillText(`Exaustao ${Math.round(station.burnout)}%`, x + 12, stationY + 90);
    }

    const player = tryLoadImage(ASSET_PATHS.player);
    const playerX = 18 + state.selectedStation * ((width - 68) / 3);
    const playerY = height * 0.75;
    if (player && player.complete) {
      canvasCtx.drawImage(player, playerX, playerY, 52, 52);
    } else {
      canvasCtx.fillStyle = '#f9cf4a';
      canvasCtx.beginPath();
      canvasCtx.arc(playerX + 26, playerY + 24, 16, 0, Math.PI * 2);
      canvasCtx.fill();
    }

    if (collapseWarning) {
      canvasCtx.fillStyle = 'rgba(241, 95, 95, 0.15)';
      canvasCtx.fillRect(0, 0, width, height);
      canvasCtx.fillStyle = '#ff6666';
      canvasCtx.font = 'bold 14px sans-serif';
      canvasCtx.fillText('⚠ COLAPSO IMINENTE', width - 200, height - 16);
    }

    if (state.actionFeedbackMs > 0) {
      const pulseAlpha = Math.min(0.25, state.actionFeedbackMs / 800);
      canvasCtx.fillStyle = `rgba(201, 242, 123, ${pulseAlpha.toFixed(3)})`;
      canvasCtx.fillRect(0, height - 50, width, 2);
    }

    canvasCtx.fillStyle = state.actionFeedbackMs > 0 ? '#c9f27b' : '#dbe7ef';
    canvasCtx.font = state.actionFeedbackMs > 0 ? 'bold 13px sans-serif' : '12px sans-serif';
    canvasCtx.fillText(state.lastActionLabel, 16, height - 34);
    canvasCtx.fillStyle = '#f18f4e';
    canvasCtx.font = 'bold 12px sans-serif';
    canvasCtx.fillText(`Pico: ${Math.round(state.pressurePeak)}%`, 16, height - 16);

    if (state.activeEvent && state.eventTimeLeftMs > 0) {
      canvasCtx.fillStyle = 'rgba(244, 95, 95, 0.82)';
      canvasCtx.beginPath();
      canvasCtx.roundRect(width * 0.23, height * 0.15, width * 0.54, 44, 12);
      canvasCtx.fill();
      canvasCtx.fillStyle = '#fff7f7';
      canvasCtx.font = 'bold 13px sans-serif';
      canvasCtx.textAlign = 'center';
      canvasCtx.fillText(state.activeEvent.toUpperCase().replace('-', ' '), width / 2, height * 0.15 + 27);
      canvasCtx.textAlign = 'left';
    }

    if (state.phaseTransitionMs > 0) {
      const alpha = Math.min(0.4, state.phaseTransitionMs / 1700);
      canvasCtx.fillStyle = `rgba(249, 207, 74, ${alpha.toFixed(3)})`;
      canvasCtx.fillRect(0, 0, width, height);
    }
  },

  isFinished(state) {
    return state.failedByCollapse || state.elapsedMs >= RUN_DURATION_MS;
  },

  buildResult,

  getScore(state) {
    return Math.max(0, Math.round(state.score));
  },
};

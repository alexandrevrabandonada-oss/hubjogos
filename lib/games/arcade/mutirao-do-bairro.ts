import { generateId } from '@/lib/storage/local-session';
import type {
  ArcadeGameLogic,
  ArcadeRunResult,
  ArcadeRuntimeEvent,
  ArcadeTickResult,
} from './types';

type MutiraoPhase = 'arranque' | 'pressao' | 'virada' | 'fechamento';
type MutiraoEventId = 'chuva-forte' | 'boato-de-panico' | 'onda-solidaria' | 'tranco-de-sabotagem';
type HotspotId = 'agua' | 'energia' | 'mobilidade';

type HotspotKind = 'infra-agua' | 'infra-energia' | 'mobilidade-local';

interface HotspotState {
  id: HotspotId;
  kind: HotspotKind;
  label: string;
  danger: number;
  integrity: number;
}

interface MutiraoState {
  elapsedMs: number;
  selectedHotspot: number;
  hotspots: HotspotState[];
  stability: number;
  trust: number;
  mutiraoCharge: number;
  mutiraoActiveMs: number;
  pressurePeak: number;
  pressureMilestone: number;
  score: number;
  eventsTriggered: number;
  actionsUsed: number;
  collectiveActions: number;
  individualActions: number;
  mutiraoUses: number;
  collapsesPrevented: number;
  collapseWarningMs: number;
  finishedByCollapse: boolean;
  currentPhase: MutiraoPhase;
  phaseTransitionMs: number;
  activeEvent: MutiraoEventId | null;
  eventTimeLeftMs: number;
  eventCooldownMs: number;
  lastActionLabel: string;
  lastActionMs: number;
}

const RUN_DURATION_MS = 90_000;
const COLLAPSE_GRACE_MS = 6_000;
const HOTSPOT_COUNT = 3;

const HOTSPOT_BASE: Array<Pick<HotspotState, 'id' | 'kind' | 'label'>> = [
  { id: 'agua', kind: 'infra-agua', label: 'Agua' },
  { id: 'energia', kind: 'infra-energia', label: 'Energia' },
  { id: 'mobilidade', kind: 'mobilidade-local', label: 'Mobilidade' },
];

const EVENT_DURATION_MS: Record<MutiraoEventId, number> = {
  'chuva-forte': 7_000,
  'boato-de-panico': 6_500,
  'onda-solidaria': 6_000,
  'tranco-de-sabotagem': 5_500,
};

const ASSET_PATHS = {
  bg: '/arcade/mutirao-do-bairro/bg/bg-bairro-premium-v1.svg',
  player: '/arcade/mutirao-do-bairro/player/player-coordenador-premium-v1.svg',
  hotspotGeneric: '/arcade/mutirao-do-bairro/entities/entity-hotspot-premium-v1.svg',
  hotspotAgua: '/arcade/mutirao-do-bairro/entities/entity-hotspot-agua-v1.svg',
  hotspotEnergia: '/arcade/mutirao-do-bairro/entities/entity-hotspot-energia-v1.svg',
  hotspotMobilidade: '/arcade/mutirao-do-bairro/entities/entity-hotspot-mobilidade-v1.svg',
  repair: '/arcade/mutirao-do-bairro/ui/ui-action-reparar-v2.svg',
  defend: '/arcade/mutirao-do-bairro/ui/ui-action-defender-v2.svg',
  mobilize: '/arcade/mutirao-do-bairro/ui/ui-action-mobilizar-v2.svg',
  mutirao: '/arcade/mutirao-do-bairro/ui/ui-action-mutirao-v2.svg',
  pressureBar: '/arcade/mutirao-do-bairro/ui/ui-hud-pressure-bar-v2.svg',
  mutiraoCharge: '/arcade/mutirao-do-bairro/ui/ui-hud-mutirao-charge-v2.svg',
  eventChuvaForte: '/arcade/mutirao-do-bairro/ui/ui-event-chuva-forte-v2.svg',
  eventBoatoPanico: '/arcade/mutirao-do-bairro/ui/ui-event-boato-panico-v2.svg',
  eventOndaSolidaria: '/arcade/mutirao-do-bairro/ui/ui-event-onda-solidaria-v2.svg',
  eventTrancoSabotagem: '/arcade/mutirao-do-bairro/ui/ui-event-tranco-sabotagem-v2.svg',
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

function getHotspotAssetPath(hotspotId: HotspotId): string {
  switch (hotspotId) {
    case 'agua':
      return ASSET_PATHS.hotspotAgua;
    case 'energia':
      return ASSET_PATHS.hotspotEnergia;
    case 'mobilidade':
      return ASSET_PATHS.hotspotMobilidade;
    default:
      return ASSET_PATHS.hotspotGeneric;
  }
}

function getEventAssetPath(eventId: MutiraoEventId | null): string | null {
  if (!eventId) return null;
  switch (eventId) {
    case 'chuva-forte':
      return ASSET_PATHS.eventChuvaForte;
    case 'boato-de-panico':
      return ASSET_PATHS.eventBoatoPanico;
    case 'onda-solidaria':
      return ASSET_PATHS.eventOndaSolidaria;
    case 'tranco-de-sabotagem':
      return ASSET_PATHS.eventTrancoSabotagem;
    default:
      return null;
  }
}

function getPhase(elapsedMs: number): MutiraoPhase {
  if (elapsedMs < 20_000) return 'arranque';
  if (elapsedMs < 55_000) return 'pressao';
  if (elapsedMs < 78_000) return 'virada';
  return 'fechamento';
}

function getPressure(hotspots: HotspotState[]) {
  const total = hotspots.reduce((sum, hotspot) => sum + hotspot.danger + (100 - hotspot.integrity), 0);
  return Math.round(total / hotspots.length / 2);
}

function eventMultiplier(eventId: MutiraoEventId | null, hotspot: HotspotState) {
  if (!eventId) return 1;

  if (eventId === 'chuva-forte') {
    return hotspot.id === 'energia' || hotspot.id === 'mobilidade' ? 1.45 : 1.2;
  }
  if (eventId === 'boato-de-panico') {
    return 1.1;
  }
  if (eventId === 'onda-solidaria') {
    return 0.75;
  }
  if (eventId === 'tranco-de-sabotagem') {
    return 1.7;
  }
  return 1;
}

function maybeTriggerEvent(state: MutiraoState): MutiraoEventId | null {
  if (state.eventTimeLeftMs > 0 || state.eventCooldownMs > 0) {
    return null;
  }

  const elapsed = state.elapsedMs;
  const rnd = Math.random();

  if (elapsed > 15_000 && elapsed < 60_000 && rnd < 0.011) {
    return 'chuva-forte';
  }
  if (elapsed > 25_000 && elapsed < 80_000 && rnd < 0.011) {
    return 'boato-de-panico';
  }
  if (elapsed > 30_000 && elapsed < 85_000 && rnd < 0.01) {
    return 'onda-solidaria';
  }
  if (elapsed > 45_000 && rnd < 0.01) {
    return 'tranco-de-sabotagem';
  }

  return null;
}

function applyAction(
  state: MutiraoState,
  action: 'reparar' | 'defender' | 'mobilizar' | 'mutirao',
): ArcadeRuntimeEvent[] {
  const events: ArcadeRuntimeEvent[] = [];
  const selectedIndex = state.selectedHotspot;
  const selected = state.hotspots[selectedIndex];
  const mutiraoBoost = state.mutiraoActiveMs > 0 ? 1.35 : 1;

  if (action === 'reparar') {
    selected.integrity = clamp(selected.integrity + 16 * mutiraoBoost, 0, 100);
    selected.danger = clamp(selected.danger - 14 * mutiraoBoost, 0, 100);
    state.stability = clamp(state.stability + 4, 0, 100);
    state.mutiraoCharge = clamp(state.mutiraoCharge + 11, 0, 100);
    state.score += Math.round(42 * mutiraoBoost);
    state.collectiveActions += 1;
    state.lastActionLabel = `${selected.label}: reparo aplicado`;
    events.push({ type: 'action_used', actionId: 'reparar', hotspotId: selected.id });
  }

  if (action === 'defender') {
    selected.danger = clamp(selected.danger - 20 * mutiraoBoost, 0, 100);
    state.trust = clamp(state.trust + 5, 0, 100);
    state.mutiraoCharge = clamp(state.mutiraoCharge + 8, 0, 100);
    state.score += Math.round(36 * mutiraoBoost);
    state.collectiveActions += 1;
    state.lastActionLabel = `${selected.label}: defesa comunitaria`;
    events.push({ type: 'action_used', actionId: 'defender', hotspotId: selected.id });
  }

  if (action === 'mobilizar') {
    for (const hotspot of state.hotspots) {
      hotspot.danger = clamp(hotspot.danger - 6 * mutiraoBoost, 0, 100);
    }
    state.trust = clamp(state.trust + 3, 0, 100);
    state.mutiraoCharge = clamp(state.mutiraoCharge + 16, 0, 100);
    state.score += Math.round(30 * mutiraoBoost);
    state.collectiveActions += 1;
    state.lastActionLabel = 'Rede de vizinhanca mobilizada';
    events.push({ type: 'action_used', actionId: 'mobilizar' });
  }

  if (action === 'mutirao' && state.mutiraoCharge >= 100) {
    state.mutiraoCharge = 0;
    state.mutiraoActiveMs = 7_000;
    state.mutiraoUses += 1;
    state.score += 80;
    state.lastActionLabel = 'Janela de mutirao ativada';
    events.push({ type: 'special_event', eventId: 'mutirao-window' });
    events.push({ type: 'action_used', actionId: 'ativar-mutirao' });
  }

  state.actionsUsed += 1;
  state.lastActionMs = state.elapsedMs;

  return events;
}

function renderHotspot(
  ctx: CanvasRenderingContext2D,
  hotspot: HotspotState,
  index: number,
  selectedIndex: number,
  width: number,
  height: number,
) {
  const cardWidth = width * 0.29;
  const gap = width * 0.035;
  const x = width * 0.07 + index * (cardWidth + gap);
  const y = height * 0.36;
  const isSelected = index === selectedIndex;
  const isCritical = hotspot.integrity < 20;

  const hotspotImagePath = getHotspotAssetPath(hotspot.id);
  const hotspotImage = tryLoadImage(hotspotImagePath);

  ctx.save();
  
  // Usa o asset premium do hotspot se disponível, senão fallback
  if (hotspotImage && hotspotImage.complete && hotspotImage.naturalWidth > 0) {
    // Renderiza o hotspot card completo premium
    const cardScale = cardWidth / 120; // asset tem 120px de largura
    ctx.drawImage(hotspotImage, x, y, 120 * cardScale, 145 * cardScale);
    
    // Overlay de seleção se ativo
    if (isSelected) {
      ctx.strokeStyle = '#c9f27b';
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.roundRect(x, y, cardWidth, height * 0.34, 14);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    
    // Pulso visual se crítico
    if (isCritical) {
      ctx.strokeStyle = '#D74B4B';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 300) * 0.3;
      ctx.beginPath();
      ctx.roundRect(x - 2, y - 2, cardWidth + 4, height * 0.34 + 4, 14);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  } else {
    // Fallback canvas rendering
    ctx.fillStyle = isSelected ? 'rgba(201, 242, 123, 0.2)' : 'rgba(14, 36, 48, 0.9)';
    ctx.strokeStyle = isSelected ? '#c9f27b' : 'rgba(143, 187, 209, 0.4)';
    ctx.lineWidth = isSelected ? 3 : 1;
    ctx.beginPath();
    ctx.roundRect(x, y, cardWidth, height * 0.34, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#2f5d50';
    ctx.fillRect(x + 12, y + 12, 40, 40);

    ctx.fillStyle = '#f0f5ff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(hotspot.label, x + 60, y + 28);

    const dangerPct = clamp(Math.round(hotspot.danger), 0, 100);
    const integrityPct = clamp(Math.round(hotspot.integrity), 0, 100);

    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#f18f4e';
    ctx.fillText(`Risco ${dangerPct}%`, x + 12, y + 66);

    ctx.fillStyle = '#7fd36e';
    ctx.fillText(`Estrutura ${integrityPct}%`, x + 12, y + 86);

    const barW = cardWidth - 24;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(x + 12, y + 96, barW, 8);
    ctx.fillStyle = '#d74b4b';
    ctx.fillRect(x + 12, y + 96, (barW * dangerPct) / 100, 8);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(x + 12, y + 112, barW, 8);
    ctx.fillStyle = '#7fd36e';
    ctx.fillRect(x + 12, y + 112, (barW * integrityPct) / 100, 8);
  }

  ctx.restore();
}

function buildResult(state: MutiraoState): ArcadeRunResult {
  const survived = !state.finishedByCollapse;
  const averageDanger = state.hotspots.reduce((sum, hotspot) => sum + hotspot.danger, 0) / HOTSPOT_COUNT;
  const collectiveRate = Math.round(
    clamp((state.collectiveActions / Math.max(1, state.actionsUsed)) * 100, 0, 100),
  );

  const title = survived
    ? 'Mutirao segurou o bairro'
    : 'Colapso parcial no bairro';

  const summary = survived
    ? 'Voce coordenou reparo, defesa e mobilizacao para proteger o comum sob pressao.'
    : 'A pressao venceu antes do fechamento. Replaneje prioridades coletivas e tente outra run.';

  const riskPenalty = Math.round(averageDanger * 4);
  const score = Math.max(0, state.score + state.collapsesPrevented * 40 + state.mutiraoUses * 60 - riskPenalty);

  return {
    score,
    title,
    summary,
    campaignLine:
      'Alexandre Fonseca para Deputado: mandato de territorio, ajuda mutua e defesa do comum no Estado do RJ.',
    resultId: generateId('arcade-mutirao-resultado'),
    stats: {
      apoio: state.collectiveActions,
      mutiroes: state.mutiraoUses,
      bloqueios: state.eventsTriggered,
      individualismos: state.individualActions,
      collectiveRate,
      durationMs: state.elapsedMs,
    },
  };
}

export const mutiraoDoBairroLogic: ArcadeGameLogic<MutiraoState> = {
  createInitialState() {
    return {
      elapsedMs: 0,
      selectedHotspot: 0,
      hotspots: HOTSPOT_BASE.map((hotspot) => ({ ...hotspot, danger: 22, integrity: 82 })),
      stability: 72,
      trust: 68,
      mutiraoCharge: 0,
      mutiraoActiveMs: 0,
      pressurePeak: 0,
      pressureMilestone: 0,
      score: 0,
      eventsTriggered: 0,
      actionsUsed: 0,
      collectiveActions: 0,
      individualActions: 0,
      mutiraoUses: 0,
      collapsesPrevented: 0,
      collapseWarningMs: 0,
      finishedByCollapse: false,
      currentPhase: 'arranque',
      phaseTransitionMs: 0,
      activeEvent: null,
      eventTimeLeftMs: 0,
      eventCooldownMs: 5_000,
      lastActionLabel: 'Selecione um hotspot e aja',
      lastActionMs: 0,
    };
  },

  update(state, input, ctx): ArcadeTickResult<MutiraoState> {
    const next: MutiraoState = {
      ...state,
      elapsedMs: state.elapsedMs + ctx.dtMs,
      hotspots: state.hotspots.map((hotspot) => ({ ...hotspot })),
      mutiraoActiveMs: Math.max(0, state.mutiraoActiveMs - ctx.dtMs),
      phaseTransitionMs: Math.max(0, state.phaseTransitionMs - ctx.dtMs),
      eventTimeLeftMs: Math.max(0, state.eventTimeLeftMs - ctx.dtMs),
      eventCooldownMs: Math.max(0, state.eventCooldownMs - ctx.dtMs),
      lastActionMs: state.lastActionMs,
    };

    const events: ArcadeRuntimeEvent[] = [];

    const nextPhase = getPhase(next.elapsedMs);
    if (nextPhase !== next.currentPhase) {
      next.currentPhase = nextPhase;
      next.phaseTransitionMs = 1_600;
      events.push({
        type: 'phase_transition',
        phase: nextPhase === 'arranque' ? 'abertura' : nextPhase === 'pressao' ? 'escalada' : nextPhase === 'virada' ? 'pressao' : 'final',
      });
    }

    if (input.pointerLane !== null) {
      next.selectedHotspot = clamp(input.pointerLane, 0, HOTSPOT_COUNT - 1);
    }
    if (input.moveLeftPressed) {
      next.selectedHotspot = clamp(next.selectedHotspot - 1, 0, HOTSPOT_COUNT - 1);
    }
    if (input.moveRightPressed) {
      next.selectedHotspot = clamp(next.selectedHotspot + 1, 0, HOTSPOT_COUNT - 1);
    }

    if (input.actionOnePressed) {
      events.push(...applyAction(next, 'reparar'));
    }
    if (input.actionTwoPressed) {
      events.push(...applyAction(next, 'defender'));
    }
    if (input.actionThreePressed) {
      events.push(...applyAction(next, 'mobilizar'));
    }
    if (input.specialPressed) {
      const before = next.mutiraoUses;
      events.push(...applyAction(next, 'mutirao'));
      if (next.mutiraoUses === before && next.mutiraoCharge < 100) {
        next.lastActionLabel = 'Mutirao ainda carregando';
      }
    }

    if (next.eventTimeLeftMs === 0 && next.activeEvent) {
      next.activeEvent = null;
      next.eventCooldownMs = 7_500;
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
      next.currentPhase === 'arranque'
        ? 0.006
        : next.currentPhase === 'pressao'
        ? 0.011
        : next.currentPhase === 'virada'
        ? 0.016
        : 0.021;

    for (const hotspot of next.hotspots) {
      const pressure = (ctx.dtMs * phasePressure * eventMultiplier(next.activeEvent, hotspot)) / 16;
      hotspot.danger = clamp(hotspot.danger + pressure * 1.2, 0, 100);
      hotspot.integrity = clamp(hotspot.integrity - pressure * 0.7, 0, 100);

      if (hotspot.danger > 90 && hotspot.integrity < 35) {
        next.trust = clamp(next.trust - 0.075 * (ctx.dtMs / 16), 0, 100);
      }
    }

    const pressureNow = getPressure(next.hotspots);
    next.pressurePeak = Math.max(next.pressurePeak, pressureNow);

    const nextMilestone = pressureNow >= 85 ? 3 : pressureNow >= 70 ? 2 : pressureNow >= 55 ? 1 : 0;
    if (nextMilestone > next.pressureMilestone) {
      next.pressureMilestone = nextMilestone;
      events.push({ type: 'powerup_collect', powerupId: 'pressure-peak' });
    }

    const mutiraoMitigation = next.mutiraoActiveMs > 0 ? 0.04 : 0;
    next.stability = clamp(next.stability - (pressureNow / 100) * 0.09 * (ctx.dtMs / 16) + mutiraoMitigation, 0, 100);
    next.trust = clamp(next.trust - (pressureNow / 100) * 0.06 * (ctx.dtMs / 16) + mutiraoMitigation * 0.7, 0, 100);

    if (next.activeEvent === 'onda-solidaria') {
      next.trust = clamp(next.trust + 0.05 * (ctx.dtMs / 16), 0, 100);
      next.stability = clamp(next.stability + 0.05 * (ctx.dtMs / 16), 0, 100);
    }

    if (next.activeEvent === 'boato-de-panico') {
      next.trust = clamp(next.trust - 0.08 * (ctx.dtMs / 16), 0, 100);
    }

    if (pressureNow > 82 && next.stability > 30 && next.trust > 25) {
      next.collapsesPrevented += 1;
    }

    if (next.stability < 30 || next.trust < 25) {
      next.collapseWarningMs += ctx.dtMs;
    } else {
      next.collapseWarningMs = 0;
    }

    if (next.collapseWarningMs >= COLLAPSE_GRACE_MS) {
      next.finishedByCollapse = true;
    }

    return {
      state: next,
      events,
    };
  },

  render(canvasCtx, state, view) {
    const { width, height } = view;

    canvasCtx.clearRect(0, 0, width, height);

    const bgGradient = canvasCtx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#0f1e2b');
    bgGradient.addColorStop(0.55, '#1e3a4c');
    bgGradient.addColorStop(1, '#102430');
    canvasCtx.fillStyle = bgGradient;
    canvasCtx.fillRect(0, 0, width, height);

    const bgImage = tryLoadImage(ASSET_PATHS.bg);
    if (bgImage && bgImage.complete) {
      canvasCtx.globalAlpha = 0.2;
      canvasCtx.drawImage(bgImage, 0, 0, width, height);
      canvasCtx.globalAlpha = 1;
    }

    canvasCtx.fillStyle = '#f0f5ff';
    canvasCtx.font = 'bold 16px sans-serif';
    canvasCtx.textAlign = 'left';
    canvasCtx.fillText('Mutirao do Bairro', 18, 30);

    canvasCtx.font = '12px sans-serif';
    canvasCtx.fillStyle = '#c7d9e6';
    canvasCtx.fillText(`Fase: ${state.currentPhase}`, 18, 50);

    const remainingSec = Math.max(0, Math.ceil((RUN_DURATION_MS - state.elapsedMs) / 1000));
    canvasCtx.fillText(`Tempo: ${remainingSec}s`, width - 94, 30);

    const renderBar = (label: string, value: number, color: string, y: number) => {
      canvasCtx.fillStyle = '#dbe7ef';
      canvasCtx.font = '11px sans-serif';
      canvasCtx.fillText(label, 18, y);
      canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      canvasCtx.fillRect(92, y - 9, width - 112, 10);
      canvasCtx.fillStyle = color;
      canvasCtx.fillRect(92, y - 9, ((width - 112) * clamp(value, 0, 100)) / 100, 10);
    };

    renderBar('Estabilidade', state.stability, '#7fd36e', 74);
    renderBar('Confianca', state.trust, '#c9f27b', 94);
    renderBar('Folego mutirao', state.mutiraoCharge, '#f9cf4a', 114);

    if (state.mutiraoActiveMs > 0) {
      canvasCtx.fillStyle = 'rgba(201, 242, 123, 0.2)';
      canvasCtx.fillRect(12, 124, width - 24, 24);
      canvasCtx.fillStyle = '#c9f27b';
      canvasCtx.font = 'bold 12px sans-serif';
      canvasCtx.fillText(`Janela de mutirao ativa (${Math.ceil(state.mutiraoActiveMs / 1000)}s)`, 18, 140);
    }

    for (let i = 0; i < state.hotspots.length; i += 1) {
      renderHotspot(canvasCtx, state.hotspots[i], i, state.selectedHotspot, width, height);
    }

    const playerImage = tryLoadImage(ASSET_PATHS.player);
    const playerX = 20 + state.selectedHotspot * ((width - 70) / 3);
    const playerY = height * 0.75;
    if (playerImage && playerImage.complete) {
      canvasCtx.drawImage(playerImage, playerX, playerY, 52, 52);
    } else {
      canvasCtx.fillStyle = '#f9cf4a';
      canvasCtx.beginPath();
      canvasCtx.arc(playerX + 26, playerY + 24, 16, 0, Math.PI * 2);
      canvasCtx.fill();
    }

    canvasCtx.fillStyle = '#f0f5ff';
    canvasCtx.font = '12px sans-serif';
    canvasCtx.fillText(state.lastActionLabel, 18, height - 34);

    const pressure = getPressure(state.hotspots);
    canvasCtx.fillStyle = pressure > 70 ? '#d74b4b' : '#f18f4e';
    canvasCtx.font = 'bold 12px sans-serif';
    canvasCtx.fillText(`Pressao: ${pressure}% (pico ${Math.round(state.pressurePeak)}%)`, 18, height - 16);

    // Overlay de evento ativo (assets premium)
    if (state.activeEvent && state.eventTimeLeftMs > 0) {
      const eventAssetPath = getEventAssetPath(state.activeEvent);
      const eventImage = eventAssetPath ? tryLoadImage(eventAssetPath) : null;
      
      if (eventImage && eventImage.complete && eventImage.naturalWidth > 0) {
        const eventScale = width * 0.5 / 320; // asset tem 320px de largura
        const eventW = 320 * eventScale;
        const eventH = 100 * eventScale;
        const eventX = (width - eventW) / 2;
        const eventY = height * 0.12;
        
        canvasCtx.globalAlpha = Math.min(1, state.eventTimeLeftMs / 1200);
        canvasCtx.drawImage(eventImage, eventX, eventY, eventW, eventH);
        canvasCtx.globalAlpha = 1;
      } else {
        // Fallback banner de evento
        const bannerW = width * 0.6;
        const bannerX = (width - bannerW) / 2;
        const bannerY = height * 0.12;
        
        canvasCtx.fillStyle = 'rgba(241, 143, 78, 0.85)';
        canvasCtx.beginPath();
        canvasCtx.roundRect(bannerX, bannerY, bannerW, 50, 12);
        canvasCtx.fill();
        
        canvasCtx.fillStyle = '#0f1e2b';
        canvasCtx.font = 'bold 14px sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.fillText(state.activeEvent.toUpperCase().replace('-', ' '), width / 2, bannerY + 30);
        canvasCtx.textAlign = 'left';
      }
    }

    if (state.collapseWarningMs > 0) {
      const alpha = 0.22 + Math.sin(state.elapsedMs / 120) * 0.12;
      canvasCtx.fillStyle = `rgba(215, 75, 75, ${alpha.toFixed(3)})`;
      canvasCtx.fillRect(0, 0, width, height);
      canvasCtx.fillStyle = '#fff3f3';
      canvasCtx.font = 'bold 20px sans-serif';
      canvasCtx.textAlign = 'center';
      canvasCtx.fillText('Alerta de colapso', width / 2, height * 0.26);
      canvasCtx.textAlign = 'left';
    }

    if (state.phaseTransitionMs > 0) {
      const alpha = Math.min(0.45, state.phaseTransitionMs / 1800);
      canvasCtx.fillStyle = `rgba(249, 207, 74, ${alpha.toFixed(3)})`;
      canvasCtx.fillRect(0, 0, width, height);
    }
  },

  isFinished(state) {
    return state.finishedByCollapse || state.elapsedMs >= RUN_DURATION_MS;
  },

  buildResult,

  getScore(state) {
    return Math.max(0, Math.round(state.score));
  },
};

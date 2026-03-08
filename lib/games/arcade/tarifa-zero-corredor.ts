import { generateId } from '@/lib/storage/local-session';
import type {
  ArcadeGameLogic,
  ArcadeInputSnapshot,
  ArcadeRunResult,
  ArcadeTickResult,
} from './types';

type TarifaEntityType = 
  | 'apoio' | 'apoio-cadeia' | 'apoio-territorial'
  | 'bloqueio' | 'bloqueio-pesado' | 'bloqueio-sequencia' | 'zona-pressao'
  | 'mutirao' | 'mutirao-bairro' | 'mutirao-sindical'
  | 'individualismo' | 'individualismo-tentador' | 'individualismo-cluster'
  | 'chance' | 'chance-virada' | 'chance-abertura';

type RunPhase = 'abertura' | 'escalada' | 'pressao' | 'final';
type RunEvent = 'mutirao-ativo' | 'onda-bloqueio' | 'corredor-livre' | 'janela-chance' | 'forca-coletiva' | 'catraca-fechando' | null;

interface TarifaEntity {
  id: string;
  lane: number;
  y: number;
  speed: number;
  type: TarifaEntityType;
  chainIndex?: number; // For apoio-cadeia
  height?: number; // For zona-pressao
}

interface RecentFeedback {
  id: string;
  type: TarifaEntityType;
  ageMs: number;
  value?: number; // Score/meter change
  x?: number; // Particle origin X
  y?: number; // Particle origin Y
}

interface RunEventState {
  active: RunEvent;
  timeLeftMs: number;
  triggered: boolean;
}

export interface TarifaZeroState {
  playerLane: number;
  entities: TarifaEntity[];
  spawnCooldownMs: number;
  score: number;
  
  // Entity counts (detailed)
  apoio: number;
  apoioChain: number;
  apoioTerritorial: number;
  mutiroes: number;
  mutiroesBairro: number;
  mutiroesSindical: number;
  bloqueios: number;
  bloqueiosPesado: number;
  bloqueiosSequencia: number;
  zonaPressaoHits: number;
  individualismos: number;
  individualismosTentador: number;
  individualismosCluster: number;
  chances: number;
  chancesVirada: number;
  chancesAbertura: number;
  
  // Meter & combo
  collectiveMeter: number;
  collectiveMeterTarget: number;
  collectiveMeterPeak: number;
  collectiveMeterLow: number;
  comboTimerMs: number;
  comboMultiplier: number;
  
  // Depth mechanics
  apoioSequenceCount: number; // Consecutive apoios
  perfectStreakMs: number; // Time without collision
  lastCollectLane: number | null;
  
  // Run context
  elapsedMs: number;
  currentPhase: RunPhase;
  activeEvent: RunEventState;
  eventsTriggered: RunEvent[];
  
  // Depth tracking (for analytics)
  comboMultiplierPeak: number; // Highest multiplier reached
  perfectStreakPeak: number; // Longest perfect streak
  apoioSequencePeak: number; // Longest apoio sequence
  totalCollisionsThisRun: number; // Counter
  
  // Visual feedback
  laneFlashMs: number;
  lastFlashLane: number | null; // Which lane had the collision (for lane-specific flash)
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

// === PHASE & EVENT SYSTEM ===

function getCurrentPhase(elapsedMs: number): RunPhase {
  if (elapsedMs < 12_000) return 'abertura';
  if (elapsedMs < 28_000) return 'escalada';
  if (elapsedMs < 42_000) return 'pressao';
  return 'final';
}

function checkAndTriggerEvent(state: TarifaZeroState): RunEvent {
  const { elapsedMs, collectiveMeter, activeEvent } = state;
  
  // Don't trigger if event already active
  if (activeEvent.active) return null;
  
  const rnd = Math.random();
  
  // Mutirão Ativo (12-38s, prob 2.5%, meter >50%)
  // Rewards good coletivo performance
  if (elapsedMs >= 12_000 && elapsedMs <= 38_000 && collectiveMeter > 50 && rnd < 0.025) {
    return 'mutirao-ativo';
  }
  
  // Onda de Bloqueio (20-42s, prob 2.8%, responds to pressure building)
  // Removed bloqueios>5 blocker: shouldn't require enemies to spawn more enemies
  if (elapsedMs >= 20_000 && elapsedMs <= 42_000 && rnd < 0.028) {
    return 'onda-bloqueio';
  }
  
  // Corredor Livre (18-40s, prob 2.2%, meter <40%)
  // Changed to trigger when meter low (opportunity, not penalty)
  if (elapsedMs >= 18_000 && elapsedMs <= 40_000 && collectiveMeter < 40 && rnd < 0.022) {
    return 'corredor-livre';
  }
  
  // Janela de Chance (32-50s, prob 2.0%)
  if (elapsedMs >= 32_000 && elapsedMs <= 50_000 && rnd < 0.020) {
    return 'janela-chance';
  }
  
  // Força Coletiva (15-55s, prob 3.2%, meter >60%)
  // Higher prob: happens when coletivo is strong, rewards it
  if (elapsedMs >= 15_000 && collectiveMeter > 60 && rnd < 0.032) {
    return 'forca-coletiva';
  }
  
  // Catraca Fechando (40-55s, prob 2.6%, meter <40%)
  if (elapsedMs >= 40_000 && collectiveMeter < 40 && rnd < 0.026) {
    return 'catraca-fechando';
  }
  
  return null;
}

function getEventDuration(event: RunEvent): number {
  switch (event) {
    case 'mutirao-ativo': return 8_000;
    case 'onda-bloqueio': return 6_000;
    case 'corredor-livre': return 5_000;
    case 'janela-chance': return 4_000;
    case 'forca-coletiva': return 7_000;
    case 'catraca-fechando': return 6_000;
    default: return 0;
  }
}

// === ENTITY TYPE SYSTEM ===

function rollEntityType(elapsedMs: number, phase: RunPhase, event: RunEventState): TarifaEntityType {
  const value = Math.random();
  
  // Event influences
  if (event.active === 'corredor-livre') {
    // No bloqueios, more apoio
    if (value < 0.70) return rollApoioSubtype(phase);
    if (value < 0.85) return rollMutiraoSubtype(phase);
    if (value < 0.95) return 'individualismo';
    return 'chance-abertura';
  }
  
  if (event.active === 'onda-bloqueio') {
    // More bloqueios, faster
    if (value < 0.60) return rollBloqueioSubtype(phase);
    if (value < 0.75) return rollApoioSubtype(phase);
    return rollIndividualismoSubtype(phase);
  }
  
  if (event.active === 'janela-chance') {
    // More chance spawns
    if (value < 0.25) return rollChanceSubtype(elapsedMs);
    if (value < 0.55) return rollApoioSubtype(phase);
    return rollBloqueioSubtype(phase);
  }
  
  if (event.active === 'catraca-fechando') {
    // More individualismo, more bloqueio
    if (value < 0.40) return rollBloqueioSubtype(phase);
    if (value < 0.70) return rollIndividualismoSubtype(phase);
    return rollApoioSubtype(phase);
  }
  
  // Phase-based spawning
  switch (phase) {
    case 'abertura':
      if (value < 0.60) return 'apoio';
      if (value < 0.85) return 'bloqueio';
      return 'individualismo';
      
    case 'escalada':
      if (value < 0.40) return rollApoioSubtype(phase);
      if (value < 0.55) return 'bloqueio';
      if (value < 0.70) return rollMutiraoSubtype(phase);
      return 'individualismo';
      
    case 'pressao':
      if (value < 0.30) return rollApoioSubtype(phase);
      if (value < 0.65) return rollBloqueioSubtype(phase);
      if (value < 0.75) return rollMutiraoSubtype(phase);
      if (value < 0.90) return rollIndividualismoSubtype(phase);
      return rollChanceSubtype(elapsedMs);
      
    case 'final':
      if (value < 0.25) return rollApoioSubtype(phase);
      if (value < 0.65) return rollBloqueioSubtype(phase);
      if (value < 0.75) return rollMutiraoSubtype(phase);
      if (value < 0.95) return rollIndividualismoSubtype(phase);
      return rollChanceSubtype(elapsedMs);
  }
  
  return 'apoio';
}

function rollApoioSubtype(phase: RunPhase): TarifaEntityType {
  const rnd = Math.random();
  if (phase === 'abertura') return 'apoio';
  if (phase === 'escalada') {
    if (rnd < 0.50) return 'apoio';
    if (rnd < 0.65) return 'apoio-cadeia';
    return 'apoio-territorial';
  }
  if (phase === 'pressao' || phase === 'final') {
    if (rnd < 0.40) return 'apoio';
    if (rnd < 0.60) return 'apoio-cadeia';
    return 'apoio-territorial';
  }
  return 'apoio';
}

function rollBloqueioSubtype(phase: RunPhase): TarifaEntityType {
  const rnd = Math.random();
  if (phase === 'abertura') return 'bloqueio';
  if (phase === 'escalada') {
    if (rnd < 0.60) return 'bloqueio';
    if (rnd < 0.85) return 'bloqueio-pesado';
    return 'bloqueio-sequencia';
  }
  if (phase === 'pressao') {
    if (rnd < 0.40) return 'bloqueio';
    if (rnd < 0.70) return 'bloqueio-pesado';
    if (rnd < 0.90) return 'bloqueio-sequencia';
    return 'zona-pressao';
  }
  if (phase === 'final') {
    if (rnd < 0.30) return 'bloqueio';
    if (rnd < 0.65) return 'bloqueio-pesado';
    if (rnd < 0.90) return 'bloqueio-sequencia';
    return 'zona-pressao';
  }
  return 'bloqueio';
}

function rollMutiraoSubtype(phase: RunPhase): TarifaEntityType {
  const rnd = Math.random();
  if (phase === 'abertura' || phase === 'escalada') {
    if (rnd < 0.70) return 'mutirao';
    return 'mutirao-bairro';
  }
  if (phase === 'pressao') {
    if (rnd < 0.50) return 'mutirao';
    if (rnd < 0.85) return 'mutirao-bairro';
    return 'mutirao-sindical';
  }
  if (phase === 'final') {
    if (rnd < 0.40) return 'mutirao';
    if (rnd < 0.70) return 'mutirao-bairro';
    return 'mutirao-sindical';
  }
  return 'mutirao';
}

function rollIndividualismoSubtype(phase: RunPhase): TarifaEntityType {
  const rnd = Math.random();
  if (phase === 'abertura' || phase === 'escalada') return 'individualismo';
  if (phase === 'pressao') {
    if (rnd < 0.60) return 'individualismo';
    return 'individualismo-tentador';
  }
  if (phase === 'final') {
    if (rnd < 0.40) return 'individualismo';
    if (rnd < 0.80) return 'individualismo-tentador';
    return 'individualismo-cluster';
  }
  return 'individualismo';
}

function rollChanceSubtype(elapsedMs: number): TarifaEntityType {
  const remainingMs = RUN_DURATION_MS - elapsedMs;
  if (remainingMs >= 15_000) return 'apoio'; // Too early
  
  const rnd = Math.random();
  if (rnd < 0.80) return 'chance';
  if (rnd < 0.95) return 'chance-abertura';
  return 'chance-virada';
}

// === SPAWN LOGIC ===

// === SPAWN LOGIC ===

function spawnEntity(state: TarifaZeroState): TarifaEntity {
  const phase = state.currentPhase;
  const event = state.activeEvent;
  
  // Speed varies by phase
  let baseSpeed = 180;
  let speedVariance = 40;
  
  switch (phase) {
    case 'abertura':
      baseSpeed = 180;
      speedVariance = 30;
      break;
    case 'escalada':
      baseSpeed = 220;
      speedVariance = 40;
      break;
    case 'pressao':
      baseSpeed = 280;
      speedVariance = 50;
      break;
    case 'final':
      baseSpeed = 340;
      speedVariance = 60;
      break;
  }
  
  // Event modifiers
  if (event.active === 'onda-bloqueio') {
    baseSpeed *= 1.15;
  }
  if (event.active === 'catraca-fechando') {
    baseSpeed *= 1.20;
  }
  
  const speed = baseSpeed + Math.random() * speedVariance;
  const entityType = rollEntityType(state.elapsedMs, phase, event);
  
  // Special handling for certain entity types
  const entity: TarifaEntity = {
    id: generateId('arcade-entidade'),
    lane: randomLane(),
    y: -40,
    speed,
    type: entityType,
  };
  
  // Zona de pressão tem altura
  if (entityType === 'zona-pressao') {
    entity.height = 60;
  }
  
  return entity;
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

// === COLLISION PROCESSING ===

interface CollisionResult {
  state: Partial<TarifaZeroState>;
  event?: { type: 'powerup_collect'; powerupId: string };
}

// Helper to create feedback with position for particle rendering
function createFeedback(type: TarifaEntityType, lane: number, y: number, value?: number): RecentFeedback {
  return {
    id: generateId('feedback'),
    type,
    ageMs: 0,
    value,
    x: laneCenterX(lane, 400), // Will be overridden in render with actual canvas width
    y,
  };
}

function processEntityCollision(
  state: TarifaZeroState,
  entity: TarifaEntity,
  activeEvent: RunEventState
): CollisionResult {
  const result: CollisionResult = { state: {} };
  const baseMultiplier = state.comboMultiplier;
  const eventModifier = activeEvent.active === 'mutirao-ativo' ? 1.5 : 1;
  const finalMultiplier = baseMultiplier * eventModifier;
  
  // APOIO TYPES
  if (entity.type === 'apoio') {
    result.state.apoio = state.apoio + 1;
    result.state.collectiveMeterTarget = clamp(state.collectiveMeterTarget + 8, 0, 100);
    result.state.score = state.score + Math.round(14 * finalMultiplier);
    result.state.apoioSequenceCount = state.apoioSequenceCount + 1;
    result.state.recentFeedback = [...state.recentFeedback, createFeedback(entity.type, entity.lane, entity.y)];
    result.state.lastCollectLane = entity.lane;
  }
  
  if (entity.type === 'apoio-cadeia') {
    const chainBonus = entity.chainIndex || 0;
    const meterGain = 6 + chainBonus * 4; // 6, 10, 14
    const scoreGain = (12 + chainBonus * 8) * finalMultiplier; // 12, 20, 35 (with multiplier)
    
    result.state.apoioChain = state.apoioChain + 1;
    result.state.collectiveMeterTarget = clamp(state.collectiveMeterTarget + meterGain, 0, 100);
    result.state.score = state.score + Math.round(scoreGain);
    result.state.apoioSequenceCount = state.apoioSequenceCount + 1;
    result.state.recentFeedback = [...state.recentFeedback, createFeedback(entity.type, entity.lane, entity.y, chainBonus + 1)];
    result.state.lastCollectLane = entity.lane;
  }
  
  if (entity.type === 'apoio-territorial') {
    const baseGain = 12;
    const bonus = state.collectiveMeter > 60 ? 10 : 0;
    
    result.state.apoioTerritorial = state.apoioTerritorial + 1;
    result.state.collectiveMeterTarget = clamp(state.collectiveMeterTarget + baseGain, 0, 100);
    result.state.score = state.score + Math.round((18 + bonus) * finalMultiplier);
    result.state.apoioSequenceCount = state.apoioSequenceCount + 1;
    result.state.recentFeedback = [...state.recentFeedback, createFeedback(entity.type, entity.lane, entity.y)];
    result.state.lastCollectLane = entity.lane;
  }
  
  // MUTIRÃO TYPES
  if (entity.type === 'mutirao') {
    result.state.mutiroes = state.mutiroes + 1;
    result.state.collectiveMeterTarget = clamp(state.collectiveMeterTarget + 20, 0, 100);
    result.state.comboTimerMs = 6_500;
    result.state.score = state.score + Math.round(28 * eventModifier);
    result.state.recentFeedback = [...state.recentFeedback, createFeedback(entity.type, entity.lane, entity.y)];
    result.state.lastCollectLane = entity.lane;
    result.event = { type: 'powerup_collect', powerupId: 'mutirao-popular' };
  }
  
  if (entity.type === 'mutirao-bairro') {
    // Stronger combo, shorter duration, requires different lane from last collect
    const bonusForMovement = state.lastCollectLane !== null && state.lastCollectLane !== entity.lane ? 10 : 0;
    
    result.state.mutiroesBairro = state.mutiroesBairro + 1;
    result.state.collectiveMeterTarget = clamp(state.collectiveMeterTarget + 25, 0, 100);
    result.state.comboTimerMs = 5_000;
    result.state.comboMultiplier = 2.0; // Stronger but shorter
    result.state.score = state.score + Math.round((35 + bonusForMovement) * eventModifier);
    result.state.recentFeedback = [...state.recentFeedback, createFeedback(entity.type, entity.lane, entity.y)];
    result.state.lastCollectLane = entity.lane;
    result.event = { type: 'powerup_collect', powerupId: 'mutirao-bairro' };
  }
  
  if (entity.type === 'mutirao-sindical') {
    result.state.mutiroesSindical = state.mutiroesSindical + 1;
    result.state.collectiveMeterTarget = clamp(state.collectiveMeterTarget + 30, 0, 100);
    result.state.comboTimerMs = 8_000; // Longer duration
    result.state.comboMultiplier = 1.5; // Weaker but longer
    result.state.score = state.score + Math.round(40 * eventModifier);
    result.state.recentFeedback = [...state.recentFeedback, createFeedback(entity.type, entity.lane, entity.y)];
    result.state.lastCollectLane = entity.lane;
    result.event = { type: 'powerup_collect', powerupId: 'mutirao-sindical' };
  }
  
  // BLOQUEIO TYPES (break streak, flash damage)
  if (entity.type === 'bloqueio') {
    result.state.bloqueios = state.bloqueios + 1;
    result.state.collectiveMeterTarget = clamp(state.collectiveMeterTarget - 14, 0, 100);
    result.state.score = Math.max(0, state.score - 18);
    result.state.laneFlashMs = 260;
    result.state.perfectStreakMs = 0; // Break perfect streak
    result.state.apoioSequenceCount = 0; // Break apoio sequence
    result.state.recentFeedback = [...state.recentFeedback, createFeedback(entity.type, entity.lane, entity.y)];
  }
  
  if (entity.type === 'bloqueio-pesado') {
    const penalty = activeEvent.active === 'forca-coletiva' ? 0 : -20; // Força coletiva blocks penalties
    
    result.state.bloqueiosPesado = state.bloqueiosPesado + 1;
    result.state.collectiveMeterTarget = clamp(state.collectiveMeterTarget + penalty, 0, 100);
    result.state.score = Math.max(0, state.score - 28);
    result.state.laneFlashMs = 400;
    result.state.perfectStreakMs = 0;
    result.state.apoioSequenceCount = 0;
    result.state.recentFeedback = [...state.recentFeedback, createFeedback(entity.type, entity.lane, entity.y)];
  }
  
  if (entity.type === 'bloqueio-sequencia') {
    const penalty = activeEvent.active === 'forca-coletiva' ? 0 : -12;
    
    result.state.bloqueiosSequencia = state.bloqueiosSequencia + 1;
    result.state.collectiveMeterTarget = clamp(state.collectiveMeterTarget + penalty, 0, 100);
    result.state.score = Math.max(0, state.score - 15);
    result.state.laneFlashMs = 280;
    result.state.perfectStreakMs = 0;
    result.state.apoioSequenceCount = 0;
    result.state.recentFeedback = [...state.recentFeedback, createFeedback(entity.type, entity.lane, entity.y)];
  }
  
  if (entity.type === 'zona-pressao') {
    // Can traverse but takes damage
    const penalty = activeEvent.active === 'forca-coletiva' ? 0 : -10;
    
    result.state.zonaPressaoHits = state.zonaPressaoHits + 1;
    result.state.collectiveMeterTarget = clamp(state.collectiveMeterTarget + penalty, 0, 100);
    result.state.score = Math.max(0, state.score - 12);
    // Don't break perfect streak (you chose to traverse)
    result.state.recentFeedback = [...state.recentFeedback, createFeedback(entity.type, entity.lane, entity.y)];
  }
  
  // INDIVIDUALISMO TYPES (score gain, meter loss, break sequence)
  if (entity.type === 'individualismo') {
    result.state.individualismos = state.individualismos + 1;
    result.state.collectiveMeterTarget = clamp(state.collectiveMeterTarget - 22, 0, 100);
    result.state.score = state.score + 10;
    result.state.apoioSequenceCount = 0; // Break sequence
    result.state.comboTimerMs = Math.max(0, state.comboTimerMs - 2_000); // Reduce combo timer
    result.state.recentFeedback = [...state.recentFeedback, createFeedback(entity.type, entity.lane, entity.y)];
  }
  
  if (entity.type === 'individualismo-tentador') {
    result.state.individualismosTentador = state.individualismosTentador + 1;
    result.state.collectiveMeterTarget = clamp(state.collectiveMeterTarget - 28, 0, 100);
    result.state.score = state.score + 22; // Higher score, higher penalty
    result.state.apoioSequenceCount = 0;
    result.state.comboTimerMs = Math.max(0, state.comboTimerMs - 2_500);
    result.state.recentFeedback = [...state.recentFeedback, createFeedback(entity.type, entity.lane, entity.y)];
  }
  
  if (entity.type === 'individualismo-cluster') {
    // Cluster of 3, each hit
    result.state.individualismosCluster = state.individualismosCluster + 1;
    result.state.collectiveMeterTarget = clamp(state.collectiveMeterTarget - 18, 0, 100);
    result.state.score = state.score + 8;
    result.state.apoioSequenceCount = 0;
    result.state.comboTimerMs = Math.max(0, state.comboTimerMs - 1_500);
    result.state.recentFeedback = [...state.recentFeedback, createFeedback(entity.type, entity.lane, entity.y)];
  }
  
  // CHANCE TYPES (rare, powerful)
  if (entity.type === 'chance') {
    result.state.chances = state.chances + 1;
    result.state.collectiveMeterTarget = clamp(state.collectiveMeterTarget + 30, 0, 100);
    result.state.score = state.score + Math.round(50 * finalMultiplier);
    result.state.comboTimerMs = 8_000;
    result.state.comboMultiplier = Math.max(state.comboMultiplier, 2.0);
    result.state.recentFeedback = [...state.recentFeedback, createFeedback(entity.type, entity.lane, entity.y)];
    result.state.lastCollectLane = entity.lane;
    result.event = { type: 'powerup_collect', powerupId: 'chance-coletiva' };
  }
  
  if (entity.type === 'chance-virada') {
    // Only appears when meter <40%
    result.state.chancesVirada = state.chancesVirada + 1;
    result.state.collectiveMeterTarget = clamp(state.collectiveMeterTarget + 40, 0, 100);
    result.state.score = state.score + Math.round(80 * finalMultiplier);
    result.state.comboTimerMs = 6_000;
    result.state.comboMultiplier = 2.5;
    result.state.recentFeedback = [...state.recentFeedback, createFeedback(entity.type, entity.lane, entity.y)];
    result.state.lastCollectLane = entity.lane;
    result.event = { type: 'powerup_collect', powerupId: 'chance-virada' };
  }
  
  if (entity.type === 'chance-abertura') {
    // Only in corredor-livre event, extends it
    result.state.chancesAbertura = state.chancesAbertura + 1;
    result.state.collectiveMeterTarget = clamp(state.collectiveMeterTarget + 35, 0, 100);
    result.state.score = state.score + Math.round(65 * finalMultiplier);
    result.state.recentFeedback = [...state.recentFeedback, createFeedback(entity.type, entity.lane, entity.y)];
    result.state.lastCollectLane = entity.lane;
    // Extend corredor-livre event if active
    if (activeEvent.active === 'corredor-livre') {
      result.state.activeEvent = {
        ...activeEvent,
        timeLeftMs: activeEvent.timeLeftMs + 2_000,
      };
    }
    result.event = { type: 'powerup_collect', powerupId: 'chance-abertura' };
  }
  
  return result;
}

function resolveCollectiveRate(state: TarifaZeroState) {
  const positive = 
    state.apoio + 
    state.apoioChain * 1.5 + 
    state.apoioTerritorial * 1.2 +
    state.mutiroes * 2 + 
    state.mutiroesBairro * 2.2 +
    state.mutiroesSindical * 2.5 +
    state.chances * 3 +
    state.chancesVirada * 4 +
    state.chancesAbertura * 3.5;
    
  const negative = 
    state.individualismos + 
    state.individualismosTentador * 1.3 +
    state.individualismosCluster * 1.8 +
    state.bloqueios +
    state.bloqueiosPesado * 1.2 +
    state.bloqueiosSequencia +
    state.zonaPressaoHits * 0.8;
    
  const total = positive + negative;
  if (total === 0) {
    return 0;
  }
  return Math.round((positive / total) * 100);
}

function buildResult(state: TarifaZeroState): ArcadeRunResult {
  const collectiveRate = resolveCollectiveRate(state);
  
  // Comprehensive score calculation with all entity types
  const resultScore = Math.max(
    0,
    Math.round(
      state.score +
        // Positive entities
        state.apoio * 6 +
        state.apoioChain * 10 +
        state.apoioTerritorial * 8 +
        state.mutiroes * 32 +
        state.mutiroesBairro * 38 +
        state.mutiroesSindical * 42 +
        state.chances * 50 +
        state.chancesVirada * 80 +
        state.chancesAbertura * 65 +
        // Meter bonus
        state.collectiveMeter * 1.3 +
        // Negative entities
        -state.bloqueios * 14 -
        state.bloqueiosPesado * 18 -
        state.bloqueiosSequencia * 12 -
        state.zonaPressaoHits * 10 -
        state.individualismos * 20 -
        state.individualismosTentador * 24 -
        state.individualismosCluster * 28,
    ),
  );

  // Title based on collective rate
  const title =
    collectiveRate >= 72
      ? 'Corredor do Povo Liberado'
      : collectiveRate >= 45
      ? 'Corredor em Disputa'
      : 'Corredor Travado pela Tarifa';

  // Summary with more context
  let summary = '';
  if (collectiveRate >= 72) {
    summary = 'A estratégia coletiva venceu: mutirão, apoio e tarifa zero abriram passagem para todo mundo.';
    if (state.comboMultiplier > 2) {
      summary += ' Combos fortes potencializaram a vitória.';
    }
  } else if (collectiveRate >= 45) {
    summary = 'Você segurou a rota, mas ainda cedeu espaço à lógica individual. Mais cooperação libera o corredor.';
    if (state.individualismosCluster > 0 || state.individualismosTentador > 3) {
      summary += ' Atalhos individuais travaram o coletivo.';
    }
  } else {
    summary = 'A corrida individual fez a catraca vencer. Sem ação coletiva, o corredor do povo não abre.';
    if (state.bloqueiosPesado > 3 || state.zonaPressaoHits > 2) {
      summary += ' Bloqueios estruturais dominaram o corredor.';
    }
  }

  // Expanded stats
  const totalApoios = state.apoio + state.apoioChain + state.apoioTerritorial;
  const totalMutiroes = state.mutiroes + state.mutiroesBairro + state.mutiroesSindical;
  const totalBloqueios = state.bloqueios + state.bloqueiosPesado + state.bloqueiosSequencia + state.zonaPressaoHits;
  const totalIndividualismos = state.individualismos + state.individualismosTentador + state.individualismosCluster;

  return {
    resultId: generateId('arcade-resultado'),
    score: resultScore,
    title,
    summary,
    campaignLine: 'Tarifa zero e organização popular: mobilidade é direito, não mercadoria.',
    stats: {
      apoio: totalApoios,
      mutiroes: totalMutiroes,
      bloqueios: totalBloqueios,
      individualismos: totalIndividualismos,
      collectiveRate,
      durationMs: state.elapsedMs,
      // Depth metrics
      comboMultiplierPeak: Math.round(state.comboMultiplierPeak * 100) / 100,
      perfectStreakPeak: Math.round(state.perfectStreakPeak),
      apoioSequencePeak: state.apoioSequencePeak,
      eventsTriggered: state.eventsTriggered.length,
      totalCollisions: state.totalCollisionsThisRun,
      currentPhase: state.currentPhase,
    },
  };
}

// Helper to convert hex color to RGB string for use in rgba() CSS
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
  return '160, 160, 160'; // Default gray fallback
}

export const tarifaZeroCorredorLogic: ArcadeGameLogic<TarifaZeroState> = {
  createInitialState() {
    return {
      playerLane: 1,
      entities: [],
      spawnCooldownMs: BASE_SPAWN_MS,
      score: 0,
      apoio: 0,
      apoioChain: 0,
      apoioTerritorial: 0,
      mutiroes: 0,
      mutiroesBairro: 0,
      mutiroesSindical: 0,
      bloqueios: 0,
      bloqueiosPesado: 0,
      bloqueiosSequencia: 0,
      zonaPressaoHits: 0,
      individualismos: 0,
      individualismosTentador: 0,
      individualismosCluster: 0,
      chances: 0,
      chancesVirada: 0,
      chancesAbertura: 0,
      collectiveMeter: 46,
      collectiveMeterTarget: 46,
      collectiveMeterPeak: 46,
      collectiveMeterLow: 46,
      comboTimerMs: 0,
      comboMultiplier: 1,
      comboMultiplierPeak: 1,
      apoioSequenceCount: 0,
      apoioSequencePeak: 0,
      perfectStreakMs: 0,
      perfectStreakPeak: 0,
      totalCollisionsThisRun: 0,
      lastCollectLane: null,
      elapsedMs: 0,
      currentPhase: 'abertura',
      activeEvent: { active: null, timeLeftMs: 0, triggered: false },
      eventsTriggered: [],
      laneFlashMs: 0,
      lastFlashLane: null,
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
    
    // Update phase
    next.currentPhase = getCurrentPhase(next.elapsedMs);
    
    // Update combo multiplier based on combo timer
    if (next.comboTimerMs > 0) {
      // Higher combo when timer is fresh
      const comboStrength = Math.min(next.comboTimerMs / 2000, 1);
      next.comboMultiplier = 1 + comboStrength * 0.75; // 1.0 to 1.75×
    } else {
      next.comboMultiplier = 1;
    }
    
    // Track combo peak
    next.comboMultiplierPeak = Math.max(next.comboMultiplierPeak, next.comboMultiplier);
    
    // Update perfect streak
    next.perfectStreakMs += ctx.dtMs;
    
    // Track perfect streak peak
    next.perfectStreakPeak = Math.max(next.perfectStreakPeak, next.perfectStreakMs);
    
    // Check and trigger events
    const newEvent = checkAndTriggerEvent(next);
    if (newEvent && !next.activeEvent.triggered) {
      next.activeEvent = {
        active: newEvent,
        timeLeftMs: getEventDuration(newEvent),
        triggered: true,
      };
      next.eventsTriggered = [...next.eventsTriggered, newEvent];
    }
    
    // Update active event timer
    if (next.activeEvent.active) {
      next.activeEvent.timeLeftMs -= ctx.dtMs;
      if (next.activeEvent.timeLeftMs <= 0) {
        next.activeEvent = { active: null, timeLeftMs: 0, triggered: false };
      }
    }

    // Smooth meter transition
    const meterDiff = next.collectiveMeterTarget - next.collectiveMeter;
    if (Math.abs(meterDiff) > 0.1) {
      next.collectiveMeter += meterDiff * 0.15;
    } else {
      next.collectiveMeter = next.collectiveMeterTarget;
    }
    
    // Track meter peaks/lows
    next.collectiveMeterPeak = Math.max(next.collectiveMeterPeak, next.collectiveMeter);
    next.collectiveMeterLow = Math.min(next.collectiveMeterLow, next.collectiveMeter);

    // Age recent feedback
    next.recentFeedback = state.recentFeedback
      .map((f) => ({ ...f, ageMs: f.ageMs + ctx.dtMs }))
      .filter((f) => f.ageMs < 500);

    const events: ArcadeTickResult<TarifaZeroState>['events'] = [];

    // Spawn entities (rate varies by phase & event)
    next.spawnCooldownMs -= ctx.dtMs;
    if (next.spawnCooldownMs <= 0) {
      next.entities = [...next.entities, spawnEntity(next)];
      
      // Dynamic spawn rate by phase
      let baseSpawn = BASE_SPAWN_MS;
      switch (next.currentPhase) {
        case 'abertura': baseSpawn = 850; break;
        case 'escalada': baseSpawn = 650; break;
        case 'pressao': baseSpawn = 450; break;
        case 'final': baseSpawn = 350; break;
      }
      
      // Event modifiers
      if (next.activeEvent.active === 'onda-bloqueio') baseSpawn *= 0.7; // Faster spawns
      if (next.activeEvent.active === 'mutirao-ativo') baseSpawn *= 1.3; // Slower, more apoio
      
      next.spawnCooldownMs = baseSpawn + Math.random() * 120;
    }

    const collisionY = ctx.height * PLAYER_COLLISION_Y_RATIO;
    const laneWidth = ctx.width / LANE_COUNT;
    const entitySize = Math.max(16, laneWidth * 0.25);

    const survivors: TarifaEntity[] = [];

    // Process all entities
    for (const entity of next.entities) {
      const advanced = {
        ...entity,
        y: entity.y + entity.speed * (ctx.dtMs / 1000),
      };

      const sameLane = advanced.lane === next.playerLane;
      const colliding = sameLane && Math.abs(advanced.y - collisionY) < (entity.height || entitySize);

      if (colliding) {
        // Process collision by entity type
        const collisionResult = processEntityCollision(next, advanced, next.activeEvent);
        Object.assign(next, collisionResult.state);
        
        // Track collision count
        next.totalCollisionsThisRun += 1;
        
        // Track apoio sequence peak if applicable
        if (advanced.type.startsWith('apoio')) {
          next.apoioSequencePeak = Math.max(next.apoioSequencePeak, next.apoioSequenceCount);
        } else {
          // Reset sequence if not apoio
          next.apoioSequencePeak = Math.max(next.apoioSequencePeak, next.apoioSequenceCount);
        }
        
        // Add collision events
        if (collisionResult.event) {
          events.push(collisionResult.event);
        }
        
        continue; // Entity consumed
      }

      if (advanced.y > ctx.height + 50) {
        continue; // Entity off-screen
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

      // === APOIO TYPES ===
      if (entity.type === 'apoio') {
        const gradient = canvasCtx.createRadialGradient(x, entity.y, 0, x, entity.y, 15);
        gradient.addColorStop(0, '#7ce0ae');
        gradient.addColorStop(1, '#5bc893');
        canvasCtx.fillStyle = gradient;
        canvasCtx.beginPath();
        canvasCtx.arc(x, entity.y, 14, 0, Math.PI * 2);
        canvasCtx.fill();
        
        canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        canvasCtx.lineWidth = 2;
        canvasCtx.stroke();
        
        canvasCtx.fillStyle = '#0a1f2e';
        canvasCtx.font = 'bold 13px sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.textBaseline = 'middle';
        canvasCtx.fillText('+', x, entity.y);
      }

      if (entity.type === 'apoio-cadeia') {
        const chainIndex = entity.chainIndex || 0;
        const size = 12 + chainIndex * 2;
        
        const gradient = canvasCtx.createRadialGradient(x, entity.y, 0, x, entity.y, size);
        gradient.addColorStop(0, '#a0efc8');
        gradient.addColorStop(1, '#7ce0ae');
        canvasCtx.fillStyle = gradient;
        canvasCtx.beginPath();
        canvasCtx.arc(x, entity.y, size, 0, Math.PI * 2);
        canvasCtx.fill();
        
        canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        canvasCtx.lineWidth = 2;
        canvasCtx.stroke();
        
        canvasCtx.fillStyle = '#0a1f2e';
        canvasCtx.font = 'bold 11px sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.textBaseline = 'middle';
        canvasCtx.fillText('++', x, entity.y);
      }

      if (entity.type === 'apoio-territorial') {
        const gradient = canvasCtx.createRadialGradient(x, entity.y, 0, x, entity.y, 17);
        gradient.addColorStop(0, '#6fd1f0');
        gradient.addColorStop(1, '#55b8d6');
        canvasCtx.fillStyle = gradient;
        canvasCtx.beginPath();
        canvasCtx.arc(x, entity.y, 16, 0, Math.PI * 2);
        canvasCtx.fill();
        
        canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        canvasCtx.lineWidth = 2.5;
        canvasCtx.stroke();
        
        canvasCtx.fillStyle = '#0a1f2e';
        canvasCtx.font = 'bold 14px sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.textBaseline = 'middle';
        canvasCtx.fillText('T', x, entity.y);
      }

      // === BLOQUEIO TYPES ===
      if (entity.type === 'bloqueio') {
        canvasCtx.fillStyle = '#f45f5f';
        canvasCtx.fillRect(x - 16, entity.y - 16, 32, 32);
        
        canvasCtx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeRect(x - 16, entity.y - 16, 32, 32);
        
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

      if (entity.type === 'bloqueio-pesado') {
        canvasCtx.fillStyle = '#d84545';
        canvasCtx.fillRect(x - 20, entity.y - 20, 40, 40);
        
        canvasCtx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        canvasCtx.lineWidth = 3;
        canvasCtx.strokeRect(x - 20, entity.y - 20, 40, 40);
        
        canvasCtx.strokeStyle = '#ffe2e2';
        canvasCtx.lineWidth = 5;
        canvasCtx.lineCap = 'round';
        canvasCtx.beginPath();
        canvasCtx.moveTo(x - 12, entity.y - 12);
        canvasCtx.lineTo(x + 12, entity.y + 12);
        canvasCtx.moveTo(x + 12, entity.y - 12);
        canvasCtx.lineTo(x - 12, entity.y + 12);
        canvasCtx.stroke();
      }

      if (entity.type === 'bloqueio-sequencia') {
        // 2 connected blocks
        canvasCtx.fillStyle = '#f47575';
        canvasCtx.fillRect(x - 14, entity.y - 22, 28, 14);
        canvasCtx.fillRect(x - 14, entity.y + 8, 28, 14);
        
        canvasCtx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeRect(x - 14, entity.y - 22, 28, 14);
        canvasCtx.strokeRect(x - 14, entity.y + 8, 28, 14);
        
        // Connector line
        canvasCtx.strokeStyle = '#f45f5f';
        canvasCtx.lineWidth = 2;
        canvasCtx.setLineDash([3, 2]);
        canvasCtx.beginPath();
        canvasCtx.moveTo(x, entity.y - 8);
        canvasCtx.lineTo(x, entity.y + 8);
        canvasCtx.stroke();
        canvasCtx.setLineDash([]);
      }

      if (entity.type === 'zona-pressao') {
        const rectHeight = entity.height || 60;
        canvasCtx.fillStyle = 'rgba(244, 95, 95, 0.25)';
        canvasCtx.fillRect(x - 18, entity.y - rectHeight / 2, 36, rectHeight);
        
        canvasCtx.strokeStyle = 'rgba(244, 95, 95, 0.5)';
        canvasCtx.lineWidth = 2;
        canvasCtx.setLineDash([4, 4]);
        canvasCtx.strokeRect(x - 18, entity.y - rectHeight / 2, 36, rectHeight);
        canvasCtx.setLineDash([]);
        
        canvasCtx.fillStyle = '#f45f5f';
        canvasCtx.font = 'bold 10px sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.textBaseline = 'middle';
        canvasCtx.fillText('!', x, entity.y);
      }

      // === MUTIRAO TYPES ===
      if (entity.type === 'mutirao') {
        const gradient = canvasCtx.createRadialGradient(x, entity.y, 0, x, entity.y, 17);
        gradient.addColorStop(0, '#ffd765');
        gradient.addColorStop(1, '#f9cf4a');
        canvasCtx.fillStyle = gradient;
        canvasCtx.beginPath();
        canvasCtx.arc(x, entity.y, 16, 0, Math.PI * 2);
        canvasCtx.fill();
        
        canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        canvasCtx.lineWidth = 2.5;
        canvasCtx.stroke();
        
        canvasCtx.fillStyle = '#0a1f2e';
        canvasCtx.font = 'bold 13px sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.textBaseline = 'middle';
        canvasCtx.fillText('M', x, entity.y);
      }

      if (entity.type === 'mutirao-bairro') {
        const gradient = canvasCtx.createRadialGradient(x, entity.y, 0, x, entity.y, 17);
        gradient.addColorStop(0, '#ffe180');
        gradient.addColorStop(1, '#ffd055');
        canvasCtx.fillStyle = gradient;
        canvasCtx.beginPath();
        canvasCtx.arc(x, entity.y, 16, 0, Math.PI * 2);
        canvasCtx.fill();
        
        canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        canvasCtx.lineWidth = 2.5;
        canvasCtx.stroke();
        
        canvasCtx.fillStyle = '#0a1f2e';
        canvasCtx.font = 'bold 10px sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.textBaseline = 'middle';
        canvasCtx.fillText('MB', x, entity.y);
      }

      if (entity.type === 'mutirao-sindical') {
        const gradient = canvasCtx.createRadialGradient(x, entity.y, 0, x, entity.y, 18);
        gradient.addColorStop(0, '#ffc844');
        gradient.addColorStop(1, '#f0b030');
        canvasCtx.fillStyle = gradient;
        canvasCtx.beginPath();
        canvasCtx.arc(x, entity.y, 17, 0, Math.PI * 2);
        canvasCtx.fill();
        
        canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        canvasCtx.lineWidth = 3;
        canvasCtx.stroke();
        
        canvasCtx.fillStyle = '#0a1f2e';
        canvasCtx.font = 'bold 14px sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.textBaseline = 'middle';
        canvasCtx.fillText('S', x, entity.y);
      }

      // === INDIVIDUALISMO TYPES ===
      if (entity.type === 'individualismo') {
        canvasCtx.fillStyle = '#b8c5d0';
        canvasCtx.beginPath();
        canvasCtx.arc(x, entity.y, 13, 0, Math.PI * 2);
        canvasCtx.fill();
        
        canvasCtx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        canvasCtx.lineWidth = 2;
        canvasCtx.stroke();
        
        canvasCtx.fillStyle = '#2a3d4d';
        canvasCtx.font = 'bold 12px sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.textBaseline = 'middle';
        canvasCtx.fillText('$', x, entity.y);
      }

      if (entity.type === 'individualismo-tentador') {
        canvasCtx.fillStyle = '#d4dfe8';
        canvasCtx.shadowColor = '#d4dfe8';
        canvasCtx.shadowBlur = 4;
        canvasCtx.beginPath();
        canvasCtx.arc(x, entity.y, 14, 0, Math.PI * 2);
        canvasCtx.fill();
        canvasCtx.shadowBlur = 0;
        
        canvasCtx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        canvasCtx.lineWidth = 2;
        canvasCtx.stroke();
        
        canvasCtx.fillStyle = '#2a3d4d';
        canvasCtx.font = 'bold 11px sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.textBaseline = 'middle';
        canvasCtx.fillText('$$', x, entity.y);
      }

      if (entity.type === 'individualismo-cluster') {
        // 3 small circles
        const positions = [
          { dx: -10, dy: -6 },
          { dx: 10, dy: -6 },
          { dx: 0, dy: 8 }
        ];
        
        for (const pos of positions) {
          canvasCtx.fillStyle = '#b8c5d0';
          canvasCtx.beginPath();
          canvasCtx.arc(x + pos.dx, entity.y + pos.dy, 8, 0, Math.PI * 2);
          canvasCtx.fill();
          
          canvasCtx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
          canvasCtx.lineWidth = 1.5;
          canvasCtx.stroke();
        }
      }

      // === CHANCE TYPES ===
      if (entity.type === 'chance') {
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
        
        canvasCtx.fillStyle = '#0a1f2e';
        canvasCtx.font = 'bold 12px sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.textBaseline = 'middle';
        canvasCtx.fillText('?', x, entity.y);
      }

      if (entity.type === 'chance-virada') {
        canvasCtx.fillStyle = '#ffd700';
        canvasCtx.shadowColor = '#ffd700';
        canvasCtx.shadowBlur = 10;
        canvasCtx.beginPath();
        const size = 18;
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
        
        canvasCtx.fillStyle = '#0a1f2e';
        canvasCtx.font = 'bold 14px sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.textBaseline = 'middle';
        canvasCtx.fillText('!', x, entity.y);
      }

      if (entity.type === 'chance-abertura') {
        canvasCtx.fillStyle = '#4df0d0';
        canvasCtx.shadowColor = '#4df0d0';
        canvasCtx.shadowBlur = 9;
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
        
        canvasCtx.fillStyle = '#0a1f2e';
        canvasCtx.font = 'bold 13px sans-serif';
        canvasCtx.textAlign = 'center';
        canvasCtx.textBaseline = 'middle';
        canvasCtx.fillText('↑', x, entity.y);
      }
    }

    // Flash de dano
    const flash = state.laneFlashMs > 0 ? state.laneFlashMs / 260 : 0;
    if (flash > 0) {
      canvasCtx.fillStyle = `rgba(244, 95, 95, ${flash * 0.22})`;
      canvasCtx.fillRect(0, 0, width, height);
    }

    // Particle feedback for pickups - colorful burst effect
    for (const feedback of state.recentFeedback) {
      if (!feedback.x || !feedback.y) continue;
      
      const alpha = 1 - feedback.ageMs / 500; // Fade out
      const progress = feedback.ageMs / 500; // 0 to 1
      
      // Determine particle color by entity type
      let particleColor = '#a0a0a0';
      let particleCount = 4;
      
      if (feedback.type.startsWith('apoio')) {
        particleColor = '#7ce0ae'; // Green
        particleCount = 5;
      } else if (feedback.type.startsWith('mutirao')) {
        particleColor = '#ffd765'; // Gold
        particleCount = 6;
      } else if (feedback.type.startsWith('bloqueio') || feedback.type === 'zona-pressao') {
        particleColor = '#f45f5f'; // Red
        particleCount = 4;
      } else if (feedback.type.startsWith('chance')) {
        particleColor = '#00d9ff'; // Cyan
        particleCount = 5;
      } else if (feedback.type.startsWith('individualismo')) {
        particleColor = '#b8c5d0'; // Gray
        particleCount = 3;
      }
      
      // Render particles bursting outward
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = progress * 60; // Travel distance
        const px = feedback.x + Math.cos(angle) * distance;
        const py = feedback.y + Math.sin(angle) * distance - progress * 40; // Float upward
        const particleSize = 3 + (1 - progress) * 2; // Shrink
        
        canvasCtx.fillStyle = `rgba(${hexToRgb(particleColor)}, ${alpha * 0.8})`;
        canvasCtx.beginPath();
        canvasCtx.arc(px, py, particleSize, 0, Math.PI * 2);
        canvasCtx.fill();
      }
      
      // Central glow at origin
      const glowSize = 8 * (1 - progress);
      if (glowSize > 0.5) {
        canvasCtx.fillStyle = `rgba(${hexToRgb(particleColor)}, ${alpha * 0.3})`;
        canvasCtx.beginPath();
        canvasCtx.arc(feedback.x, feedback.y, glowSize, 0, Math.PI * 2);
        canvasCtx.fill();
      }
    }

    // Event visual feedback
    if (state.activeEvent.active) {
      const eventAlpha = Math.min(1, state.activeEvent.timeLeftMs / 1000);
      let eventBg = 'rgba(249, 207, 74, 0.15)';
      let eventColor = '#f9cf4a';
      let eventLabel = '';
      
      switch (state.activeEvent.active) {
        case 'mutirao-ativo':
          eventBg = 'rgba(255, 215, 101, 0.18)';
          eventColor = '#ffd765';
          eventLabel = '⭐ MUTIRÃO ATIVO';
          break;
        case 'onda-bloqueio':
          eventBg = 'rgba(244, 95, 95, 0.15)';
          eventColor = '#f45f5f';
          eventLabel = '⚠️ ONDA DE BLOQUEIO';
          break;
        case 'corredor-livre':
          eventBg = 'rgba(124, 224, 174, 0.18)';
          eventColor = '#7ce0ae';
          eventLabel = '✨ CORREDOR LIVRE';
          break;
        case 'janela-chance':
          eventBg = 'rgba(0, 217, 255, 0.15)';
          eventColor = '#00d9ff';
          eventLabel = '🌟 JANELA DE CHANCE';
          break;
        case 'forca-coletiva':
          eventBg = 'rgba(255, 199, 68, 0.2)';
          eventColor = '#ffc744';
          eventLabel = '🛡️ FORÇA COLETIVA';
          // Aura around player
          canvasCtx.shadowColor = '#ffc744';
          canvasCtx.shadowBlur = 25;
          break;
        case 'catraca-fechando':
          eventBg = 'rgba(164, 44, 44, 0.18)';
          eventColor = '#d84545';
          eventLabel = '🔴 CATRACA FECHANDO';
          // Red vignette
          const vignetteGradient = canvasCtx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.3, width / 2, height / 2, Math.min(width, height) * 0.7);
          vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
          vignetteGradient.addColorStop(1, 'rgba(164, 44, 44, 0.25)');
          canvasCtx.fillStyle = vignetteGradient;
          canvasCtx.fillRect(0, 0, width, height);
          break;
      }
      
      // Event banner at top
      canvasCtx.fillStyle = eventBg;
      canvasCtx.fillRect(0, 38, width, 28);
      
      canvasCtx.fillStyle = eventColor;
      canvasCtx.font = 'bold 12px sans-serif';
      canvasCtx.textAlign = 'center';
      canvasCtx.textBaseline = 'middle';
      canvasCtx.globalAlpha = eventAlpha;
      canvasCtx.fillText(eventLabel, width / 2, 52);
      canvasCtx.globalAlpha = 1;
      
      // Event timer
      const timerSec = Math.ceil(state.activeEvent.timeLeftMs / 1000);
      canvasCtx.font = 'bold 10px sans-serif';
      canvasCtx.fillText(`${timerSec}s`, width / 2, 64);
      
      canvasCtx.shadowBlur = 0;
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
    const statsY = height - 65;
    canvasCtx.fillStyle = 'rgba(10, 31, 46, 0.75)';
    canvasCtx.fillRect(10, statsY, 200, 58);
    
    canvasCtx.fillStyle = '#f0f5ff';
    canvasCtx.font = 'bold 10px sans-serif';
    canvasCtx.textAlign = 'left';
    canvasCtx.textBaseline = 'top';
    canvasCtx.fillText(`Apoios ${state.apoio + state.apoioChain + state.apoioTerritorial}`, 16, statsY + 6);
    canvasCtx.fillText(`Mutirões ${state.mutiroes + state.mutiroesBairro + state.mutiroesSindical}`, 16, statsY + 20);
    canvasCtx.fillText(`Bloqueios ${state.bloqueios + state.bloqueiosPesado + state.bloqueiosSequencia}`, 16, statsY + 34);
    
    // Sequence counter
    if (state.apoioSequenceCount > 0) {
      canvasCtx.fillStyle = '#7ce0ae';
      canvasCtx.fillText(`Sequência: ${state.apoioSequenceCount}`, 120, statsY + 6);
    }
    
    // Multiplier
    if (state.comboMultiplier > 1.0) {
      canvasCtx.fillStyle = '#ffd765';
      canvasCtx.fillText(`${state.comboMultiplier.toFixed(2)}x`, 120, statsY + 20);
    }

    // Combo indicator (destaque quando ativo)
    if (state.comboTimerMs > 0) {
      const comboIntensity = Math.min(1, state.comboTimerMs / 2000);
      const comboAlpha = 0.5 + comboIntensity * 0.5;
      
      canvasCtx.fillStyle = `rgba(249, 207, 74, ${comboAlpha})`;
      canvasCtx.fillRect(width / 2 - 100, height - 100, 200, 38);
      
      canvasCtx.strokeStyle = '#f9cf4a';
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeRect(width / 2 - 100, height - 100, 200, 38);
      
      canvasCtx.fillStyle = '#0a1f2e';
      canvasCtx.font = 'bold 14px sans-serif';
      canvasCtx.textAlign = 'center';
      canvasCtx.textBaseline = 'middle';
      canvasCtx.fillText('🔥 COMBO ATIVO', width / 2, height - 90);
      
      // Timer bar
      const timerWidth = 180;
      const timerFill = Math.min(1, state.comboTimerMs / 8000);
      canvasCtx.fillStyle = 'rgba(10, 31, 46, 0.4)';
      canvasCtx.fillRect(width / 2 - timerWidth / 2, height - 72, timerWidth, 6);
      canvasCtx.fillStyle = '#f9cf4a';
      canvasCtx.fillRect(width / 2 - timerWidth / 2, height - 72, timerWidth * timerFill, 6);
    }
    
    // Perfect streak indicator
    if (state.perfectStreakMs > 5000) {
      const streakSec = Math.floor(state.perfectStreakMs / 1000);
      canvasCtx.fillStyle = 'rgba(124, 224, 174, 0.8)';
      canvasCtx.fillRect(width / 2 - 70, 80, 140, 22);
      
      canvasCtx.strokeStyle = '#7ce0ae';
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeRect(width / 2 - 70, 80, 140, 22);
      
      canvasCtx.fillStyle = '#0a1f2e';
      canvasCtx.font = 'bold 11px sans-serif';
      canvasCtx.textAlign = 'center';
      canvasCtx.textBaseline = 'middle';
      canvasCtx.fillText(`✨ PERFEITO ${streakSec}s`, width / 2, 91);
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

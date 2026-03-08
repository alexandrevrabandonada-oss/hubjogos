import { generateId } from '@/lib/storage/local-session';
import type {
  ArcadeGameLogic,
  ArcadeInputSnapshot,
  ArcadeRunResult,
  ArcadeTickResult,
} from './types';
import { drawTarifaZeroAsset } from './tarifa-zero-assets';

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
  ageMs: number;
  type: TarifaEntityType;
  chainIndex?: number; // For apoio-cadeia
  height?: number; // For zona-pressao
}

interface RecentFeedback {
  id: string;
  type: TarifaEntityType;
  ageMs: number;
  value?: number; // Score/meter change
  lane?: number;
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
  playerVisualLane: number;
  playerTravelMomentum: number;
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

function isHazardEntity(type: TarifaEntityType) {
  return type === 'bloqueio' || type === 'bloqueio-pesado' || type === 'bloqueio-sequencia' || type === 'zona-pressao';
}

function chooseSpawnLane(state: TarifaZeroState, entityType: TarifaEntityType) {
  const topOccupiedLanes = new Set(state.entities.filter((entity) => entity.y < 124).map((entity) => entity.lane));
  let lane = randomLane();

  if (isHazardEntity(entityType) && state.elapsedMs < 9_000 && lane === state.playerLane) {
    lane = (lane + (Math.random() < 0.5 ? 1 : 2)) % LANE_COUNT;
  }

  if (topOccupiedLanes.has(lane) && topOccupiedLanes.size < LANE_COUNT) {
    const alternatives = Array.from({ length: LANE_COUNT }, (_, index) => index).filter((candidate) => !topOccupiedLanes.has(candidate));
    if (alternatives.length > 0) {
      lane = alternatives[Math.floor(Math.random() * alternatives.length)];
    }
  }

  return lane;
}

function getPhaseMotionFactor(phase: RunPhase) {
  switch (phase) {
    case 'abertura':
      return 0.75;
    case 'escalada':
      return 1;
    case 'pressao':
      return 1.25;
    case 'final':
      return 1.5;
  }
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
    lane: chooseSpawnLane(state, entityType),
    y: -40,
    speed,
    ageMs: 0,
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
    lane,
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
    result.state.lastFlashLane = entity.lane;
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
    result.state.lastFlashLane = entity.lane;
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
    result.state.lastFlashLane = entity.lane;
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
    result.state.lastFlashLane = entity.lane;
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

function fillRoundedRect(
  canvasCtx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  canvasCtx.beginPath();
  canvasCtx.roundRect(x, y, width, height, radius);
  canvasCtx.fill();
}

function strokeRoundedRect(
  canvasCtx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  canvasCtx.beginPath();
  canvasCtx.roundRect(x, y, width, height, radius);
  canvasCtx.stroke();
}

function getPhaseTheme(phase: RunPhase) {
  switch (phase) {
    case 'abertura':
      return { label: 'FASE 1  ABERTURA', color: '#7ce0ae' };
    case 'escalada':
      return { label: 'FASE 2  ESCALADA', color: '#f9cf4a' };
    case 'pressao':
      return { label: 'FASE 3  PRESSAO', color: '#ffb380' };
    case 'final':
      return { label: 'FASE 4  FINAL', color: '#ffd765' };
  }
}

function getEventTheme(event: RunEvent) {
  switch (event) {
    case 'mutirao-ativo':
      return { label: 'MUTIRAO ATIVO', color: '#ffd765', bg: 'rgba(255, 215, 101, 0.2)' };
    case 'onda-bloqueio':
      return { label: 'ONDA DE BLOQUEIO', color: '#f45f5f', bg: 'rgba(244, 95, 95, 0.18)' };
    case 'corredor-livre':
      return { label: 'CORREDOR LIVRE', color: '#7ce0ae', bg: 'rgba(124, 224, 174, 0.18)' };
    case 'janela-chance':
      return { label: 'JANELA DE CHANCE', color: '#00d9ff', bg: 'rgba(0, 217, 255, 0.18)' };
    case 'forca-coletiva':
      return { label: 'FORCA COLETIVA', color: '#f9cf4a', bg: 'rgba(249, 207, 74, 0.2)' };
    case 'catraca-fechando':
      return { label: 'CATRACA FECHANDO', color: '#ff8080', bg: 'rgba(168, 52, 52, 0.22)' };
    default:
      return null;
  }
}

function drawBackground(
  canvasCtx: CanvasRenderingContext2D,
  state: TarifaZeroState,
  width: number,
  height: number,
  laneWidth: number,
) {
  const background = canvasCtx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, '#08121d');
  background.addColorStop(0.45, '#123d59');
  background.addColorStop(1, '#102736');
  canvasCtx.fillStyle = background;
  canvasCtx.fillRect(0, 0, width, height);

  drawTarifaZeroAsset(canvasCtx, 'bg-skyline-far', 0, 0, width, height, { alpha: 0.95 });
  drawTarifaZeroAsset(canvasCtx, 'bg-skyline-mid', 0, 0, width, height, { alpha: 0.98 });
  drawTarifaZeroAsset(canvasCtx, 'bg-corredor-road', 0, 0, width, height, { alpha: 1 });

  const motionFactor = getPhaseMotionFactor(state.currentPhase);
  const streakOffset = (state.elapsedMs * 0.24 * motionFactor) % 56;

  const haze = canvasCtx.createLinearGradient(0, 0, 0, height * 0.38);
  haze.addColorStop(0, 'rgba(255, 239, 183, 0.2)');
  haze.addColorStop(1, 'rgba(255, 239, 183, 0)');
  canvasCtx.fillStyle = haze;
  canvasCtx.fillRect(0, 0, width, height * 0.38);

  for (let lane = 0; lane < LANE_COUNT; lane += 1) {
    const x = lane * laneWidth;
    const isPlayerLane = lane === state.playerLane;
    canvasCtx.fillStyle = isPlayerLane ? 'rgba(249, 207, 74, 0.12)' : 'rgba(255, 255, 255, 0.03)';
    canvasCtx.fillRect(x + 4, 0, laneWidth - 8, height);

    if (lane > 0) {
      canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
      canvasCtx.lineWidth = 2;
      canvasCtx.setLineDash([10, 14]);
      canvasCtx.beginPath();
      canvasCtx.moveTo(x, 0);
      canvasCtx.lineTo(x, height);
      canvasCtx.stroke();
      canvasCtx.setLineDash([]);
    }

    canvasCtx.strokeStyle = `rgba(249, 207, 74, ${lane === state.playerLane ? 0.18 : 0.08})`;
    canvasCtx.lineWidth = lane === state.playerLane ? 4 : 3;
    canvasCtx.lineCap = 'round';
    for (let y = height; y > height * 0.22; y -= 56) {
      const streakY = y + streakOffset;
      canvasCtx.beginPath();
      canvasCtx.moveTo(x + laneWidth * 0.42, streakY);
      canvasCtx.lineTo(x + laneWidth * 0.58, streakY - 26 * motionFactor);
      canvasCtx.stroke();
    }
  }
}

function drawSpawnTelegraph(
  canvasCtx: CanvasRenderingContext2D,
  entity: TarifaEntity,
  width: number,
) {
  if (entity.ageMs > 260 && entity.y > 96) {
    return;
  }

  const laneWidth = width / LANE_COUNT;
  const laneX = entity.lane * laneWidth;
  const telegraphAlpha = Math.max(0, 0.46 - entity.ageMs / 700);
  const tone = isHazardEntity(entity.type) ? '244, 95, 95' : entity.type.startsWith('chance') ? '0, 217, 255' : '124, 224, 174';

  canvasCtx.fillStyle = `rgba(${tone}, ${telegraphAlpha})`;
  fillRoundedRect(canvasCtx, laneX + 10, 88, laneWidth - 20, 10, 5);
  canvasCtx.strokeStyle = `rgba(${tone}, ${telegraphAlpha + 0.14})`;
  canvasCtx.lineWidth = 2;
  strokeRoundedRect(canvasCtx, laneX + 10, 88, laneWidth - 20, 10, 5);
}

function drawEntitySprite(
  canvasCtx: CanvasRenderingContext2D,
  entity: TarifaEntity,
  width: number,
) {
  const x = laneCenterX(entity.lane, width);

  drawSpawnTelegraph(canvasCtx, entity, width);

  canvasCtx.fillStyle = 'rgba(8, 18, 29, 0.22)';
  canvasCtx.beginPath();
  canvasCtx.ellipse(x, entity.y + 21, 18, 7, 0, 0, Math.PI * 2);
  canvasCtx.fill();

  if (entity.type === 'apoio') {
    if (drawTarifaZeroAsset(canvasCtx, 'pickup-apoio', x - 26, entity.y - 26, 52, 52)) {
      return;
    }
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
    return;
  }

  if (entity.type === 'apoio-cadeia') {
    if (drawTarifaZeroAsset(canvasCtx, 'pickup-apoio-cadeia', x - 34, entity.y - 24, 68, 48)) {
      return;
    }
    canvasCtx.fillStyle = '#94e9bc';
    canvasCtx.beginPath();
    canvasCtx.arc(x - 10, entity.y, 12, 0, Math.PI * 2);
    canvasCtx.arc(x + 10, entity.y, 12, 0, Math.PI * 2);
    canvasCtx.fill();
    return;
  }

  if (entity.type === 'apoio-territorial') {
    if (drawTarifaZeroAsset(canvasCtx, 'pickup-apoio-territorial', x - 29, entity.y - 29, 58, 58)) {
      return;
    }
    canvasCtx.fillStyle = '#6fd1f0';
    canvasCtx.beginPath();
    canvasCtx.arc(x, entity.y, 16, 0, Math.PI * 2);
    canvasCtx.fill();
    return;
  }

  if (entity.type === 'bloqueio') {
    if (drawTarifaZeroAsset(canvasCtx, 'obstacle-catraca', x - 28, entity.y - 28, 56, 56)) {
      return;
    }
    canvasCtx.fillStyle = '#f45f5f';
    canvasCtx.fillRect(x - 16, entity.y - 16, 32, 32);
    return;
  }

  if (entity.type === 'bloqueio-pesado') {
    if (drawTarifaZeroAsset(canvasCtx, 'obstacle-barreira-pesada', x - 34, entity.y - 30, 68, 60)) {
      return;
    }
    canvasCtx.fillStyle = '#d84545';
    canvasCtx.fillRect(x - 20, entity.y - 20, 40, 40);
    return;
  }

  if (entity.type === 'bloqueio-sequencia') {
    const drewTop = drawTarifaZeroAsset(canvasCtx, 'obstacle-barreira-pesada', x - 26, entity.y - 34, 52, 24);
    const drewBottom = drawTarifaZeroAsset(canvasCtx, 'obstacle-barreira-pesada', x - 26, entity.y + 8, 52, 24);
    if (drewTop && drewBottom) {
      canvasCtx.strokeStyle = 'rgba(244, 95, 95, 0.8)';
      canvasCtx.lineWidth = 2;
      canvasCtx.setLineDash([3, 3]);
      canvasCtx.beginPath();
      canvasCtx.moveTo(x, entity.y - 8);
      canvasCtx.lineTo(x, entity.y + 8);
      canvasCtx.stroke();
      canvasCtx.setLineDash([]);
      return;
    }
    canvasCtx.fillStyle = '#f47575';
    canvasCtx.fillRect(x - 14, entity.y - 22, 28, 14);
    canvasCtx.fillRect(x - 14, entity.y + 8, 28, 14);
    return;
  }

  if (entity.type === 'zona-pressao') {
    const rectHeight = entity.height || 60;
    if (drawTarifaZeroAsset(canvasCtx, 'obstacle-zona-pressao', x - 24, entity.y - rectHeight / 2, 48, rectHeight)) {
      return;
    }
    canvasCtx.fillStyle = 'rgba(244, 95, 95, 0.25)';
    canvasCtx.fillRect(x - 18, entity.y - rectHeight / 2, 36, rectHeight);
    return;
  }

  if (entity.type === 'mutirao' || entity.type === 'mutirao-bairro' || entity.type === 'mutirao-sindical') {
    const assetKey = entity.type === 'mutirao-bairro'
      ? 'pickup-mutirao-bairro'
      : entity.type === 'mutirao-sindical'
      ? 'pickup-mutirao-sindical'
      : 'pickup-mutirao';

    if (drawTarifaZeroAsset(canvasCtx, assetKey, x - 28, entity.y - 28, 56, 56)) {
      return;
    }
    canvasCtx.fillStyle = '#ffd765';
    canvasCtx.beginPath();
    canvasCtx.arc(x, entity.y, 16, 0, Math.PI * 2);
    canvasCtx.fill();
    return;
  }

  if (entity.type === 'individualismo' || entity.type === 'individualismo-tentador') {
    const assetKey = entity.type === 'individualismo-tentador' ? 'pickup-individualismo-tentador' : 'pickup-individualismo';
    if (drawTarifaZeroAsset(canvasCtx, assetKey, x - 24, entity.y - 24, 48, 48)) {
      return;
    }
    canvasCtx.fillStyle = '#b8c5d0';
    canvasCtx.beginPath();
    canvasCtx.arc(x, entity.y, 13, 0, Math.PI * 2);
    canvasCtx.fill();
    return;
  }

  if (entity.type === 'individualismo-cluster') {
    if (drawTarifaZeroAsset(canvasCtx, 'pickup-individualismo', x - 30, entity.y - 22, 24, 24)) {
      drawTarifaZeroAsset(canvasCtx, 'pickup-individualismo', x - 12, entity.y - 26, 24, 24);
      drawTarifaZeroAsset(canvasCtx, 'pickup-individualismo', x + 6, entity.y - 22, 24, 24);
      return;
    }
    const positions = [{ dx: -10, dy: -6 }, { dx: 10, dy: -6 }, { dx: 0, dy: 8 }];
    for (const pos of positions) {
      canvasCtx.fillStyle = '#b8c5d0';
      canvasCtx.beginPath();
      canvasCtx.arc(x + pos.dx, entity.y + pos.dy, 8, 0, Math.PI * 2);
      canvasCtx.fill();
    }
    return;
  }

  if (entity.type === 'chance' || entity.type === 'chance-abertura') {
    const assetKey = entity.type === 'chance-abertura' ? 'pickup-chance-abertura' : 'pickup-chance-rara';
    if (drawTarifaZeroAsset(canvasCtx, assetKey, x - 30, entity.y - 30, 60, 60)) {
      return;
    }
    canvasCtx.fillStyle = '#00d9ff';
    canvasCtx.beginPath();
    canvasCtx.arc(x, entity.y, 16, 0, Math.PI * 2);
    canvasCtx.fill();
    return;
  }

  if (entity.type === 'chance-virada') {
    if (drawTarifaZeroAsset(canvasCtx, 'pickup-chance-virada', x - 30, entity.y - 30, 60, 60)) {
      return;
    }
    canvasCtx.fillStyle = '#ffd700';
    canvasCtx.beginPath();
    canvasCtx.arc(x, entity.y, 18, 0, Math.PI * 2);
    canvasCtx.fill();
  }
}

function drawHud(
  canvasCtx: CanvasRenderingContext2D,
  state: TarifaZeroState,
  width: number,
  height: number,
) {
  const progress = clamp(state.elapsedMs / RUN_DURATION_MS, 0, 1);
  const barMargin = 14;
  const barWidth = width - 2 * barMargin;
  const barHeight = 20;

  if (!drawTarifaZeroAsset(canvasCtx, 'ui-hud-progress-frame', barMargin, 10, barWidth, barHeight + 12)) {
    canvasCtx.fillStyle = 'rgba(10, 31, 46, 0.85)';
    fillRoundedRect(canvasCtx, barMargin, 12, barWidth, barHeight, 10);
  }

  canvasCtx.save();
  canvasCtx.beginPath();
  canvasCtx.rect(barMargin + 8, 18, Math.max(0, (barWidth - 16) * progress), barHeight - 6);
  canvasCtx.clip();
  if (!drawTarifaZeroAsset(canvasCtx, 'ui-hud-progress-fill', barMargin, 10, barWidth, barHeight + 12)) {
    const progressGradient = canvasCtx.createLinearGradient(barMargin, 12, barMargin + barWidth, 12);
    progressGradient.addColorStop(0, '#7ce0ae');
    progressGradient.addColorStop(0.6, '#f9cf4a');
    progressGradient.addColorStop(1, '#ffd765');
    canvasCtx.fillStyle = progressGradient;
    fillRoundedRect(canvasCtx, barMargin + 4, 16, barWidth - 8, barHeight - 8, 8);
  }
  canvasCtx.restore();

  const phaseTheme = getPhaseTheme(state.currentPhase);
  const phaseBadgeWidth = Math.min(160, width * 0.34);
  const phaseBadgeX = width - phaseBadgeWidth - 42;
  if (drawTarifaZeroAsset(canvasCtx, 'ui-badge-phase', phaseBadgeX, 42, phaseBadgeWidth, 28)) {
    canvasCtx.fillStyle = phaseTheme.color;
    canvasCtx.font = '700 10px system-ui, sans-serif';
    canvasCtx.textAlign = 'center';
    canvasCtx.textBaseline = 'middle';
    canvasCtx.fillText(phaseTheme.label, phaseBadgeX + phaseBadgeWidth / 2, 56);
  }

  const meterHeight = height * 0.32;
  const meterWidth = 26;
  const meterX = width - meterWidth - 12;
  const meterY = height * 0.34;
  const meterFill = clamp(state.collectiveMeter / 100, 0, 1);
  const fillHeight = (meterHeight - 12) * meterFill;

  if (!drawTarifaZeroAsset(canvasCtx, 'ui-hud-meter-frame', meterX - 8, meterY - 8, meterWidth + 16, meterHeight + 16)) {
    canvasCtx.fillStyle = 'rgba(10, 31, 46, 0.7)';
    fillRoundedRect(canvasCtx, meterX, meterY, meterWidth, meterHeight, 12);
    canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    canvasCtx.lineWidth = 2;
    strokeRoundedRect(canvasCtx, meterX, meterY, meterWidth, meterHeight, 12);
  }

  const meterGradient = canvasCtx.createLinearGradient(0, meterY + meterHeight, 0, meterY);
  meterGradient.addColorStop(0, '#7ce0ae');
  meterGradient.addColorStop(0.6, '#f9cf4a');
  meterGradient.addColorStop(1, '#ffd765');
  canvasCtx.fillStyle = meterGradient;
  fillRoundedRect(canvasCtx, meterX + 5, meterY + meterHeight - 6 - fillHeight, meterWidth - 10, fillHeight, 8);

  canvasCtx.fillStyle = '#f0f5ff';
  canvasCtx.font = '700 10px system-ui, sans-serif';
  canvasCtx.textAlign = 'center';
  canvasCtx.textBaseline = 'bottom';
  canvasCtx.fillText('COMUM', meterX + meterWidth / 2, meterY - 8);
  canvasCtx.textBaseline = 'top';
  canvasCtx.fillText(`${Math.round(state.collectiveMeter)}%`, meterX + meterWidth / 2, meterY + meterHeight + 6);

  const statsY = height - 74;
  canvasCtx.fillStyle = 'rgba(8, 18, 29, 0.8)';
  fillRoundedRect(canvasCtx, 12, statsY, 220, 64, 14);
  canvasCtx.strokeStyle = 'rgba(233, 224, 176, 0.25)';
  canvasCtx.lineWidth = 2;
  strokeRoundedRect(canvasCtx, 12, statsY, 220, 64, 14);
  drawTarifaZeroAsset(canvasCtx, 'ui-icon-score', 18, statsY + 8, 22, 22);

  canvasCtx.fillStyle = '#f0f5ff';
  canvasCtx.font = '700 11px system-ui, sans-serif';
  canvasCtx.textAlign = 'left';
  canvasCtx.textBaseline = 'top';
  canvasCtx.fillText(`Apoios ${state.apoio + state.apoioChain + state.apoioTerritorial}`, 46, statsY + 8);
  canvasCtx.fillText(`Mutiroes ${state.mutiroes + state.mutiroesBairro + state.mutiroesSindical}`, 46, statsY + 24);
  canvasCtx.fillText(`Bloqueios ${state.bloqueios + state.bloqueiosPesado + state.bloqueiosSequencia}`, 46, statsY + 40);

  if (state.apoioSequenceCount > 0) {
    canvasCtx.fillStyle = '#7ce0ae';
    canvasCtx.fillText(`Seq ${state.apoioSequenceCount}`, 154, statsY + 8);
  }

  if (state.comboMultiplier > 1.0) {
    drawTarifaZeroAsset(canvasCtx, 'ui-icon-combo', 150, statsY + 24, 18, 18);
    canvasCtx.fillStyle = '#ffd765';
    canvasCtx.fillText(`${state.comboMultiplier.toFixed(2)}x`, 172, statsY + 24);
  }

  if (state.comboTimerMs > 0) {
    const comboIntensity = Math.min(1, state.comboTimerMs / 2000);
    canvasCtx.fillStyle = `rgba(249, 207, 74, ${0.4 + comboIntensity * 0.4})`;
    fillRoundedRect(canvasCtx, width / 2 - 114, height - 118, 228, 40, 16);
    canvasCtx.strokeStyle = '#f9cf4a';
    canvasCtx.lineWidth = 2;
    strokeRoundedRect(canvasCtx, width / 2 - 114, height - 118, 228, 40, 16);
    drawTarifaZeroAsset(canvasCtx, 'ui-icon-combo', width / 2 - 88, height - 112, 24, 24);
    canvasCtx.fillStyle = '#0a1f2e';
    canvasCtx.font = '700 14px system-ui, sans-serif';
    canvasCtx.textAlign = 'left';
    canvasCtx.textBaseline = 'middle';
    canvasCtx.fillText('COMBO ATIVO', width / 2 - 58, height - 97);
    canvasCtx.fillStyle = 'rgba(10, 31, 46, 0.4)';
    fillRoundedRect(canvasCtx, width / 2 - 88, height - 80, 176, 6, 3);
    canvasCtx.fillStyle = '#0a1f2e';
    fillRoundedRect(canvasCtx, width / 2 - 88, height - 80, 176 * Math.min(1, state.comboTimerMs / 8000), 6, 3);
  }

  if (state.perfectStreakMs > 5000) {
    const streakSec = Math.floor(state.perfectStreakMs / 1000);
    canvasCtx.fillStyle = 'rgba(124, 224, 174, 0.82)';
    fillRoundedRect(canvasCtx, width / 2 - 78, 82, 156, 24, 12);
    canvasCtx.strokeStyle = '#7ce0ae';
    canvasCtx.lineWidth = 2;
    strokeRoundedRect(canvasCtx, width / 2 - 78, 82, 156, 24, 12);
    canvasCtx.fillStyle = '#0a1f2e';
    canvasCtx.font = '700 11px system-ui, sans-serif';
    canvasCtx.textAlign = 'center';
    canvasCtx.textBaseline = 'middle';
    canvasCtx.fillText(`PERFEITO ${streakSec}s`, width / 2, 94);
  }
}

function drawEventLayer(
  canvasCtx: CanvasRenderingContext2D,
  state: TarifaZeroState,
  width: number,
  height: number,
) {
  if (!state.activeEvent.active) {
    return;
  }

  const theme = getEventTheme(state.activeEvent.active);
  if (!theme) {
    return;
  }

  if (state.activeEvent.active === 'forca-coletiva') {
    canvasCtx.save();
    canvasCtx.shadowColor = '#ffc744';
    canvasCtx.shadowBlur = 26;
    canvasCtx.fillStyle = 'rgba(255, 199, 68, 0.06)';
    canvasCtx.fillRect(0, 0, width, height);
    canvasCtx.restore();
  }

  if (state.activeEvent.active === 'catraca-fechando') {
    const vignetteGradient = canvasCtx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.28,
      width / 2,
      height / 2,
      Math.min(width, height) * 0.74,
    );
    vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGradient.addColorStop(1, 'rgba(164, 44, 44, 0.22)');
    canvasCtx.fillStyle = vignetteGradient;
    canvasCtx.fillRect(0, 0, width, height);
  }

  const bannerWidth = Math.min(width - 36, 290);
  const bannerX = (width - bannerWidth) / 2;
  const bannerY = 42;
  if (!drawTarifaZeroAsset(canvasCtx, 'ui-badge-event', bannerX, bannerY, bannerWidth, 30)) {
    canvasCtx.fillStyle = theme.bg;
    fillRoundedRect(canvasCtx, bannerX, bannerY, bannerWidth, 28, 12);
    canvasCtx.strokeStyle = theme.color;
    canvasCtx.lineWidth = 2;
    strokeRoundedRect(canvasCtx, bannerX, bannerY, bannerWidth, 28, 12);
  }

  canvasCtx.fillStyle = theme.color;
  canvasCtx.font = '700 11px system-ui, sans-serif';
  canvasCtx.textAlign = 'center';
  canvasCtx.textBaseline = 'middle';
  canvasCtx.fillText(theme.label, width / 2, bannerY + 13);
  canvasCtx.fillStyle = '#f0f5ff';
  canvasCtx.font = '700 10px system-ui, sans-serif';
  canvasCtx.fillText(`${Math.ceil(state.activeEvent.timeLeftMs / 1000)}s`, width / 2, bannerY + 27);
}

function drawPlayer(
  canvasCtx: CanvasRenderingContext2D,
  state: TarifaZeroState,
  width: number,
  playerY: number,
) {
  const playerX = laneCenterX(state.playerVisualLane, width);
  const tilt = state.playerTravelMomentum * 0.08;

  canvasCtx.fillStyle = 'rgba(8, 18, 29, 0.28)';
  canvasCtx.beginPath();
  canvasCtx.ellipse(playerX, playerY + 28, 24, 9, 0, 0, Math.PI * 2);
  canvasCtx.fill();

  if (Math.abs(state.playerTravelMomentum) > 0.04) {
    canvasCtx.strokeStyle = `rgba(249, 207, 74, ${0.18 + Math.abs(state.playerTravelMomentum) * 0.2})`;
    canvasCtx.lineWidth = 5;
    canvasCtx.lineCap = 'round';
    canvasCtx.beginPath();
    canvasCtx.moveTo(playerX - state.playerTravelMomentum * 20, playerY + 16);
    canvasCtx.lineTo(playerX - state.playerTravelMomentum * 34, playerY + 42);
    canvasCtx.stroke();
  }

  if (drawTarifaZeroAsset(canvasCtx, 'player-bus-default', playerX - 34, playerY - 32, 68, 68, { rotation: tilt })) {
    return;
  }

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
  canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  canvasCtx.lineWidth = 3;
  canvasCtx.stroke();
  canvasCtx.fillStyle = '#0a1f2e';
  canvasCtx.font = '700 13px system-ui, sans-serif';
  canvasCtx.textAlign = 'center';
  canvasCtx.textBaseline = 'middle';
  canvasCtx.fillText('AF', playerX, playerY);
}

export const tarifaZeroCorredorLogic: ArcadeGameLogic<TarifaZeroState> = {
  createInitialState() {
    return {
      playerLane: 1,
      playerVisualLane: 1,
      playerTravelMomentum: 0,
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
    const targetLane = applyInput(state, {
      ...input,
      pointerLane: normalizeLane(input.pointerLane),
    });

    const next: TarifaZeroState = {
      ...state,
      elapsedMs: state.elapsedMs + ctx.dtMs,
      playerLane: targetLane,
      laneFlashMs: Math.max(0, state.laneFlashMs - ctx.dtMs),
      comboTimerMs: Math.max(0, state.comboTimerMs - ctx.dtMs),
    };

    const visualSmoothing = Math.min(1, ctx.dtMs / 92);
    next.playerVisualLane = state.playerVisualLane + (targetLane - state.playerVisualLane) * visualSmoothing;
    const desiredMomentum = clamp(targetLane - state.playerVisualLane, -1, 1);
    next.playerTravelMomentum = state.playerTravelMomentum + (desiredMomentum - state.playerTravelMomentum) * Math.min(1, ctx.dtMs / 120);
    
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
        ageMs: entity.ageMs + ctx.dtMs,
      };

      const sameLane = advanced.lane === next.playerLane;
      const colliding = sameLane && Math.abs(advanced.y - collisionY) < (entity.height || entitySize);

      if (colliding) {
        // Process collision by entity type
        const collisionResult = processEntityCollision(next, advanced, next.activeEvent);
        Object.assign(next, collisionResult.state);
        
        // Track collision count
        if (isHazardEntity(advanced.type)) {
          next.totalCollisionsThisRun += 1;
        }
        
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

    drawBackground(canvasCtx, state, width, height, laneWidth);
    for (const entity of state.entities) {
      drawEntitySprite(canvasCtx, entity, width);
    }

    const flash = state.laneFlashMs > 0 ? state.laneFlashMs / 320 : 0;
    if (flash > 0) {
      const flashLane = state.lastFlashLane ?? state.playerLane;
      canvasCtx.fillStyle = `rgba(244, 95, 95, ${flash * 0.28})`;
      canvasCtx.fillRect(flashLane * laneWidth + 4, 0, laneWidth - 8, height);
      canvasCtx.fillStyle = `rgba(255, 108, 108, ${flash * 0.14})`;
      canvasCtx.fillRect(0, 0, width, height);
    }

    // Particle feedback for pickups - colorful burst effect
    for (const feedback of state.recentFeedback) {
      if (feedback.y === undefined) continue;

      const feedbackX = feedback.lane !== undefined ? laneCenterX(feedback.lane, width) : (feedback.x ?? width / 2);
      
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
        const px = feedbackX + Math.cos(angle) * distance;
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
        canvasCtx.arc(feedbackX, feedback.y, glowSize, 0, Math.PI * 2);
        canvasCtx.fill();
      }
    }

    drawEventLayer(canvasCtx, state, width, height);
    drawPlayer(canvasCtx, state, width, playerY);
    drawHud(canvasCtx, state, width, height);

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

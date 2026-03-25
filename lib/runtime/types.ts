// Game Runtime Contract + Play Shell v1
// T72 — Unified Runtime System

import { Game, GameGenre, DeviceSupport } from '@/lib/games/catalog';
import { ResultData, OutcomeSeverity } from '@/components/result/ResultScreen';

// --- Core Runtime Types ---

export type RuntimeType = 
  | 'arcade_instant'      // No save, instant play
  | 'session_based'       // Run-in-progress save
  | 'checkpoint_based'    // Checkpoint progression
  | 'branching_narrative' // Narrative state tracking
  | 'simulation_snapshot' // Simulation state save
  | 'stateful_session';   // Tycoon/management persistent state

export type SessionStatus = 
  | 'initializing'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'saving'
  | 'completed'
  | 'failed'
  | 'exited';

export type InputMode = 
  | 'touch_simple'      // Simple tap
  | 'touch_drag'        // Drag gestures
  | 'touch_directional' // D-pad style
  | 'touch_action'      // Action buttons
  | 'keyboard'          // Keyboard only
  | 'mouse'             // Mouse only
  | 'mixed_pointer'     // Mouse + keyboard
  | 'turn_based';        // Turn-based selection

export type PerformanceTier = 
  | 'lightweight'   // 30fps, simple graphics
  | 'standard'      // 60fps, moderate
  | 'high_fidelity'; // 60fps+, complex

export interface GameRuntimeConfig {
  // Identification
  gameSlug: string;
  genre: GameGenre;
  runtimeType: RuntimeType;
  
  // Capabilities
  supportedInputs: InputMode[];
  supportedDevices: DeviceSupport[];
  performanceTier: PerformanceTier;
  
  // Save/Checkpoint
  supportsSave: boolean;
  supportsCheckpoint: boolean;
  maxCheckpoints?: number;
  autoSaveInterval?: number; // seconds, 0 = no auto-save
  
  // Lifecycle
  hasPause: boolean;
  hasRestart: boolean;
  hasExit: boolean;
  
  // Result emission
  resultType: ResultData['outcomeType'];
  
  // Audio
  hasAudio: boolean;
  audioEssential: boolean; // Can game be played without audio?
  
  // HUD
  hudZones: HudZoneConfig;
  
  // Accessibility
  supportsReducedMotion: boolean;
  supportsHighContrast: boolean;
  scalableText: boolean;
}

export interface HudZoneConfig {
  topBar?: boolean;        // Status bar
  leftRail?: boolean;      // Left action rail
  rightRail?: boolean;     // Right action rail
  bottomControls?: boolean; // Bottom control bar
  pauseOverlay?: boolean;   // Pause menu overlay
  helpOverlay?: boolean;  // Help/instructions overlay
  missionText?: boolean;  // Mission/objective text
  criticalAlerts?: boolean; // Critical alert zone
}

// --- Save/Checkpoint Types ---

export interface SavePayload {
  gameSlug: string;
  timestamp: number;
  sessionDuration: number; // seconds
  checkpointId?: string;
  gameState: Record<string, any>;
  metadata: {
    genre: GameGenre;
    runtimeType: RuntimeType;
    deviceType: string;
  };
}

export interface CheckpointPayload {
  checkpointId: string;
  label: string;
  timestamp: number;
  gameState: Record<string, any>;
}

// --- Result Emission Types ---

export interface GameResultPayload {
  gameSlug: string;
  genre: GameGenre;
  outcomeType: ResultData['outcomeType'];
  outcomeSeverity: OutcomeSeverity;
  resultData: ResultData;
  sessionStats: SessionStats;
}

export interface SessionStats {
  startTime: number;
  endTime: number;
  durationSeconds: number;
  pauseCount: number;
  totalPauseDuration: number;
  interactionCount: number;
  checkpointCount: number;
  restartCount: number;
  inputMode: InputMode;
}

// --- Input Types ---

export interface InputHints {
  primaryAction?: string;
  secondaryAction?: string;
  movement?: string;
  pause?: string;
  special?: string[];
}

export interface InputConfig {
  mode: InputMode;
  hints: InputHints;
  touchZones?: TouchZoneConfig[];
  keyboardMap?: KeyboardMapConfig;
}

export interface TouchZoneConfig {
  id: string;
  label: string;
  region: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action: string;
  priority: 'primary' | 'secondary' | 'tertiary';
}

export interface KeyboardMapConfig {
  up?: string;
  down?: string;
  left?: string;
  right?: string;
  action?: string;
  secondary?: string;
  pause?: string;
}

// --- Lifecycle Event Types ---

export interface LifecycleEvent {
  type: LifecycleEventType;
  timestamp: number;
  payload?: Record<string, any>;
}

export type LifecycleEventType =
  | 'game_start'
  | 'first_interaction'
  | 'pause'
  | 'resume'
  | 'checkpoint'
  | 'save'
  | 'fail'
  | 'complete'
  | 'exit'
  | 'restart'
  | 'input_change'
  | 'orientation_change'
  | 'visibility_change';

// --- Runtime State ---

export interface RuntimeState {
  sessionStatus: SessionStatus;
  currentSave?: SavePayload;
  checkpoints: CheckpointPayload[];
  sessionStats: SessionStats;
  inputMode: InputMode;
  isMuted: boolean;
  isPaused: boolean;
  lastCheckpointId?: string;
}

// --- Default Configs by Genre ---

export const DEFAULT_RUNTIME_CONFIGS: Record<GameGenre, Partial<GameRuntimeConfig>> = {
  arcade: {
    runtimeType: 'arcade_instant',
    supportsSave: false,
    supportsCheckpoint: false,
    hasPause: true,
    hasRestart: true,
    hasExit: true,
    resultType: 'score_rank',
    hasAudio: true,
    audioEssential: false,
    performanceTier: 'standard',
    supportsReducedMotion: true,
    supportsHighContrast: true,
    scalableText: false,
    hudZones: {
      topBar: true,
      bottomControls: true,
      pauseOverlay: true,
      criticalAlerts: true,
    },
  },
  platform: {
    runtimeType: 'checkpoint_based',
    supportsSave: true,
    supportsCheckpoint: true,
    maxCheckpoints: 5,
    hasPause: true,
    hasRestart: true,
    hasExit: true,
    resultType: 'win_loss',
    hasAudio: true,
    audioEssential: false,
    performanceTier: 'standard',
    supportsReducedMotion: true,
    supportsHighContrast: true,
    scalableText: true,
    hudZones: {
      topBar: true,
      leftRail: true,
      rightRail: true,
      bottomControls: true,
      pauseOverlay: true,
      missionText: true,
    },
  },
  simulation: {
    runtimeType: 'simulation_snapshot',
    supportsSave: true,
    supportsCheckpoint: true,
    autoSaveInterval: 30,
    hasPause: true,
    hasRestart: true,
    hasExit: true,
    resultType: 'territory_state',
    hasAudio: true,
    audioEssential: false,
    performanceTier: 'high_fidelity',
    supportsReducedMotion: true,
    supportsHighContrast: true,
    scalableText: true,
    hudZones: {
      topBar: true,
      leftRail: true,
      rightRail: true,
      bottomControls: true,
      pauseOverlay: true,
      helpOverlay: true,
      missionText: true,
      criticalAlerts: true,
    },
  },
  management: {
    runtimeType: 'stateful_session',
    supportsSave: true,
    supportsCheckpoint: true,
    autoSaveInterval: 60,
    hasPause: true,
    hasRestart: true,
    hasExit: true,
    resultType: 'mixed',
    hasAudio: true,
    audioEssential: false,
    performanceTier: 'standard',
    supportsReducedMotion: true,
    supportsHighContrast: true,
    scalableText: true,
    hudZones: {
      topBar: true,
      leftRail: true,
      rightRail: true,
      bottomControls: true,
      pauseOverlay: true,
      helpOverlay: true,
      missionText: true,
      criticalAlerts: true,
    },
  },
  strategy: {
    runtimeType: 'stateful_session',
    supportsSave: true,
    supportsCheckpoint: true,
    hasPause: true,
    hasRestart: true,
    hasExit: true,
    resultType: 'win_loss',
    hasAudio: true,
    audioEssential: false,
    performanceTier: 'standard',
    supportsReducedMotion: true,
    supportsHighContrast: true,
    scalableText: true,
    hudZones: {
      topBar: true,
      leftRail: true,
      rightRail: true,
      bottomControls: false,
      pauseOverlay: true,
      helpOverlay: true,
      missionText: true,
    },
  },
  narration: {
    runtimeType: 'branching_narrative',
    supportsSave: true,
    supportsCheckpoint: true,
    maxCheckpoints: 10,
    hasPause: true,
    hasRestart: true,
    hasExit: true,
    resultType: 'narrative',
    hasAudio: true,
    audioEssential: false,
    performanceTier: 'lightweight',
    supportsReducedMotion: true,
    supportsHighContrast: true,
    scalableText: true,
    hudZones: {
      topBar: false,
      bottomControls: true,
      pauseOverlay: true,
      helpOverlay: true,
      missionText: false,
    },
  },
  quiz: {
    runtimeType: 'session_based',
    supportsSave: false,
    supportsCheckpoint: false,
    hasPause: true,
    hasRestart: true,
    hasExit: true,
    resultType: 'archetype',
    hasAudio: false,
    audioEssential: false,
    performanceTier: 'lightweight',
    supportsReducedMotion: true,
    supportsHighContrast: true,
    scalableText: true,
    hudZones: {
      topBar: true,
      bottomControls: true,
      pauseOverlay: true,
    },
  },
};

// --- Helper Functions ---

export function createRuntimeConfig(
  game: Game,
  overrides?: Partial<GameRuntimeConfig>
): GameRuntimeConfig {
  const defaults = DEFAULT_RUNTIME_CONFIGS[game.genre];
  
  return {
    gameSlug: game.slug,
    genre: game.genre,
    supportedInputs: inferInputModes(game.genre, game.deviceSupport),
    supportedDevices: game.deviceSupport,
    inputHints: inferInputHints(game.genre),
    ...defaults,
    ...overrides,
  } as GameRuntimeConfig;
}

function inferInputModes(genre: GameGenre, devices: DeviceSupport[]): InputMode[] {
  const modes: InputMode[] = [];
  
  if (devices.includes('mobile')) {
    switch (genre) {
      case 'arcade':
      case 'platform':
        modes.push('touch_directional', 'touch_action');
        break;
      case 'simulation':
      case 'management':
        modes.push('touch_drag', 'touch_simple');
        break;
      case 'narration':
      case 'quiz':
        modes.push('touch_simple');
        break;
      default:
        modes.push('touch_simple');
    }
  }
  
  if (devices.includes('desktop')) {
    modes.push('keyboard', 'mouse', 'mixed_pointer');
  }
  
  return modes;
}

function inferInputHints(genre: GameGenre): InputHints {
  switch (genre) {
    case 'arcade':
      return {
        primaryAction: 'Ação principal',
        movement: 'Mover',
        pause: 'Pausar',
      };
    case 'platform':
      return {
        primaryAction: 'Pular / Ação',
        movement: 'Mover',
        pause: 'Pausar',
      };
    case 'simulation':
    case 'management':
      return {
        primaryAction: 'Selecionar',
        secondaryAction: 'Menu / Opções',
        pause: 'Pausar',
      };
    case 'narration':
      return {
        primaryAction: 'Continuar / Escolher',
        pause: 'Pausar',
      };
    case 'quiz':
      return {
        primaryAction: 'Selecionar resposta',
        pause: 'Pausar',
      };
    default:
      return {
        primaryAction: 'Ação',
        pause: 'Pausar',
      };
  }
}

export function createInitialRuntimeState(
  config: GameRuntimeConfig,
  deviceType: string
): RuntimeState {
  const now = Date.now();
  
  // Use deviceType for future device-specific initialization
  const _deviceContext = deviceType;
  
  return {
    sessionStatus: 'initializing',
    checkpoints: [],
    sessionStats: {
      startTime: now,
      endTime: 0,
      durationSeconds: 0,
      pauseCount: 0,
      totalPauseDuration: 0,
      interactionCount: 0,
      checkpointCount: 0,
      restartCount: 0,
      inputMode: config.supportedInputs[0] || 'touch_simple',
    },
    inputMode: config.supportedInputs[0] || 'touch_simple',
    isMuted: false,
    isPaused: false,
  };
}

export function canPause(status: SessionStatus, config: GameRuntimeConfig): boolean {
  return config.hasPause && status !== 'completed' && status !== 'failed';
}

export function canSave(config: GameRuntimeConfig): boolean {
  return config.supportsSave;
}

export function isInstantGame(config: GameRuntimeConfig): boolean {
  return config.runtimeType === 'arcade_instant' || config.runtimeType === 'session_based';
}

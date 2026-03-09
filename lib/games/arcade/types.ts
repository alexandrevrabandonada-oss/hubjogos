export type ArcadeInputKind = 'keyboard' | 'touch' | 'mouse' | 'virtual';

export interface ArcadeInputSnapshot {
  moveLeft: boolean;
  moveRight: boolean;
  moveLeftPressed: boolean;
  moveRightPressed: boolean;
  actionOnePressed: boolean;
  actionTwoPressed: boolean;
  actionThreePressed: boolean;
  specialPressed: boolean;
  pausePressed: boolean;
  restartPressed: boolean;
  pointerLane: number | null;
  lastInputKind: ArcadeInputKind | null;
}

export interface ArcadeRuntimeContext {
  dtMs: number;
  elapsedMs: number;
  width: number;
  height: number;
}

export type ArcadeRuntimeEvent =
  | {
      type: 'powerup_collect';
      powerupId: string;
    }
  | {
      type: 'collision';
      severity: 'light' | 'heavy';
      hazardId: string;
    }
  | {
      type: 'phase_transition';
      phase: 'abertura' | 'escalada' | 'pressao' | 'final';
    }
  | {
      type: 'special_event';
      eventId: string;
    }
  | {
      type: 'action_used';
      actionId: string;
      hotspotId?: string;
    }
  | {
      type: 'station_select';
      stationId: string;
    }
  | {
      type: 'station_overload';
      stationId: string;
    }
  | {
      type: 'collapse';
      reason: string;
    };

export interface ArcadeTickResult<State> {
  state: State;
  events?: ArcadeRuntimeEvent[];
}

export interface ArcadeRunResult {
  score: number;
  title: string;
  summary: string;
  campaignLine: string;
  resultId: string;
  stats: {
    apoio: number;
    mutiroes: number;
    bloqueios: number;
    individualismos: number;
    collectiveRate: number;
    durationMs: number;
    // Depth metrics (optional for backward compat)
    comboMultiplierPeak?: number;
    perfectStreakPeak?: number;
    apoioSequencePeak?: number;
    eventsTriggered?: number;
    totalCollisions?: number;
    currentPhase?: 'abertura' | 'escalada' | 'pressao' | 'final';
  };
}

export interface ArcadeGameLogic<State> {
  createInitialState: (ctx: { width: number; height: number }) => State;
  update: (state: State, input: ArcadeInputSnapshot, ctx: ArcadeRuntimeContext) => ArcadeTickResult<State>;
  render: (ctx: CanvasRenderingContext2D, state: State, view: { width: number; height: number }) => void;
  isFinished: (state: State, ctx: { elapsedMs: number }) => boolean;
  buildResult: (state: State) => ArcadeRunResult;
  getScore: (state: State) => number;
}

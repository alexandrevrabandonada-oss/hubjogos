/**
 * T75: Mutirão de Saneamento — Playtest Telemetry
 * 
 * Tracks gameplay signals for balance validation and UX improvement.
 * Lightweight, privacy-respecting, local-first.
 */

const TELEMETRY_KEY = 'mutirao_telemetry_v1';

// --- Types ---

export interface MutiraoTelemetrySession {
  id: string;
  startedAt: number;
  firstInteractionAt: number | null;
  completedAt: number | null;
  durationSeconds: number | null;
  actions: TelemetryAction[];
  trustSnapshots: number[];
  energySnapshots: number[];
  riskSnapshots: number[];
  coverageSnapshots: number[];
  finalState: {
    turn: number;
    confianca: number;
    energia: number;
    riscoSaude: number;
    cobertura: number;
    acoesRealizadas: number;
    resultId: string | null;
  } | null;
  resultSeverity: 'triumph' | 'success' | 'neutral' | 'struggle' | 'collapse' | null;
  exitedBeforeCompletion: boolean;
  replayed: boolean;
  shared: boolean;
}

export interface TelemetryAction {
  type: string;
  turn: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface TelemetryAggregate {
  totalSessions: number;
  completedSessions: number;
  avgTimeToFirstInteraction: number;
  avgActionsPerRun: number;
  resultDistribution: Record<string, number>;
  failStateFrequency: number;
  exitBeforeCompletionRate: number;
  replayRate: number;
  shareRate: number;
  // Extended metrics for T76
  completionRate: number;
  avgTurnsReached: number;
  replayed: number;
  shared: number;
  actionFrequency: Record<string, number>;
  healthRiskSpikes: number;
  energyDepletionFrequency: number;
}

// --- Session Management ---

let currentSession: MutiraoTelemetrySession | null = null;

export function startTelemetrySession(): string {
  const sessionId = `mutirao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  currentSession = {
    id: sessionId,
    startedAt: Date.now(),
    firstInteractionAt: null,
    completedAt: null,
    durationSeconds: null,
    actions: [],
    trustSnapshots: [],
    energySnapshots: [],
    riskSnapshots: [],
    coverageSnapshots: [],
    finalState: null,
    resultSeverity: null,
    exitedBeforeCompletion: false,
    replayed: false,
    shared: false,
  };
  
  return sessionId;
}

export function recordFirstInteraction(): void {
  if (currentSession && !currentSession.firstInteractionAt) {
    currentSession.firstInteractionAt = Date.now();
  }
}

export function recordAction(type: string, turn: number, metadata?: Record<string, unknown>): void {
  if (!currentSession) return;
  
  // Track first interaction
  if (!currentSession.firstInteractionAt) {
    recordFirstInteraction();
  }
  
  currentSession.actions.push({
    type,
    turn,
    timestamp: Date.now(),
    metadata,
  });
}

export function recordStateSnapshot(
  _turn: number,
  confianca: number,
  energia: number,
  riscoSaude: number,
  cobertura: number
): void {
  if (!currentSession) return;
  
  currentSession.trustSnapshots.push(confianca);
  currentSession.energySnapshots.push(energia);
  currentSession.riskSnapshots.push(riscoSaude);
  currentSession.coverageSnapshots.push(cobertura);
}

export function completeSession(
  finalTurn: number,
  confianca: number,
  energia: number,
  riscoSaude: number,
  cobertura: number,
  acoesRealizadas: number,
  resultId: string | null,
  resultSeverity: MutiraoTelemetrySession['resultSeverity']
): void {
  if (!currentSession) return;
  
  currentSession.completedAt = Date.now();
  currentSession.durationSeconds = Math.round(
    (currentSession.completedAt - currentSession.startedAt) / 1000
  );
  currentSession.finalState = {
    turn: finalTurn,
    confianca,
    energia,
    riscoSaude,
    cobertura,
    acoesRealizadas,
    resultId,
  };
  currentSession.resultSeverity = resultSeverity;
  currentSession.exitedBeforeCompletion = false;
  
  // Persist to storage
  persistSession(currentSession);
}

export function recordExitBeforeCompletion(): void {
  if (!currentSession) return;
  
  currentSession.exitedBeforeCompletion = true;
  currentSession.completedAt = Date.now();
  currentSession.durationSeconds = Math.round(
    (currentSession.completedAt - currentSession.startedAt) / 1000
  );
  
  persistSession(currentSession);
}

export function recordReplay(): void {
  if (!currentSession) return;
  currentSession.replayed = true;
  updateSession(currentSession);
}

export function recordShareClick(): void {
  if (!currentSession) return;
  currentSession.shared = true;
  updateSession(currentSession);
}

// --- Storage ---

function getStoredSessions(): MutiraoTelemetrySession[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(TELEMETRY_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function persistSession(session: MutiraoTelemetrySession): void {
  if (typeof window === 'undefined') return;
  
  const sessions = getStoredSessions();
  sessions.push(session);
  
  // Keep only last 100 sessions to avoid storage bloat
  const trimmed = sessions.slice(-100);
  
  localStorage.setItem(TELEMETRY_KEY, JSON.stringify(trimmed));
}

function updateSession(updated: MutiraoTelemetrySession): void {
  if (typeof window === 'undefined') return;
  
  const sessions = getStoredSessions();
  const index = sessions.findIndex(s => s.id === updated.id);
  
  if (index >= 0) {
    sessions[index] = updated;
    localStorage.setItem(TELEMETRY_KEY, JSON.stringify(sessions));
  }
}

// --- Analytics ---

export function getTelemetryAggregate(): TelemetryAggregate {
  const sessions = getStoredSessions();
  
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      completedSessions: 0,
      avgTimeToFirstInteraction: 0,
      avgActionsPerRun: 0,
      resultDistribution: {},
      failStateFrequency: 0,
      exitBeforeCompletionRate: 0,
      replayRate: 0,
      shareRate: 0,
      completionRate: 0,
      avgTurnsReached: 0,
      replayed: 0,
      shared: 0,
      actionFrequency: {},
      healthRiskSpikes: 0,
      energyDepletionFrequency: 0,
    };
  }
  
  const completed = sessions.filter(s => s.completedAt && !s.exitedBeforeCompletion);
  const completedCount = completed.length;
  
  // Time to first interaction
  const firstInteractionTimes = sessions
    .filter(s => s.firstInteractionAt)
    .map(s => (s.firstInteractionAt! - s.startedAt) / 1000);
  const avgTimeToFirstInteraction = firstInteractionTimes.length > 0
    ? firstInteractionTimes.reduce((a, b) => a + b, 0) / firstInteractionTimes.length
    : 0;
  
  // Actions per run
  const avgActionsPerRun = completedCount > 0
    ? completed.reduce((sum, s) => sum + s.actions.length, 0) / completedCount
    : 0;
  
  // Result distribution
  const resultDistribution: Record<string, number> = {};
  completed.forEach(s => {
    const key = s.resultSeverity || 'unknown';
    resultDistribution[key] = (resultDistribution[key] || 0) + 1;
  });
  
  // Fail state frequency (struggle + collapse)
  const failCount = completed.filter(
    s => s.resultSeverity === 'struggle' || s.resultSeverity === 'collapse'
  ).length;
  const failStateFrequency = completedCount > 0 ? failCount / completedCount : 0;
  
  // Exit before completion rate
  const exitBeforeCount = sessions.filter(s => s.exitedBeforeCompletion).length;
  const exitBeforeCompletionRate = sessions.length > 0 ? exitBeforeCount / sessions.length : 0;
  
  // Replay rate
  const replayCount = sessions.filter(s => s.replayed).length;
  const replayRate = sessions.length > 0 ? replayCount / sessions.length : 0;
  
  // Share rate
  const shareCount = sessions.filter(s => s.shared).length;
  const shareRate = sessions.length > 0 ? shareCount / sessions.length : 0;

  // Extended metrics for T76
  const completionRate = sessions.length > 0 ? (completedCount / sessions.length) * 100 : 0;
  
  const avgTurnsReached = completedCount > 0
    ? completed.reduce((sum, s) => sum + (s.finalState?.turn || 0), 0) / completedCount
    : 0;
  
  const replayed = sessions.filter(s => s.replayed).length;
  const shared = sessions.filter(s => s.shared).length;

  // Action frequency
  const actionFrequency: Record<string, number> = {};
  sessions.forEach(s => {
    s.actions.forEach(a => {
      actionFrequency[a.type] = (actionFrequency[a.type] || 0) + 1;
    });
  });

  // Health risk spikes (when risk increased by > 2 in a turn)
  let healthRiskSpikes = 0;
  sessions.forEach(s => {
    for (let i = 1; i < s.riskSnapshots.length; i++) {
      if (s.riskSnapshots[i] - s.riskSnapshots[i - 1] > 2) {
        healthRiskSpikes++;
      }
    }
  });

  // Energy depletion frequency
  const energyDepletedCount = sessions.filter(s => {
    return s.energySnapshots.some(e => e === 0);
  }).length;
  const energyDepletionFrequency = sessions.length > 0 ? (energyDepletedCount / sessions.length) * 100 : 0;

  return {
    totalSessions: sessions.length,
    completedSessions: completedCount,
    avgTimeToFirstInteraction,
    avgActionsPerRun,
    resultDistribution,
    failStateFrequency,
    exitBeforeCompletionRate,
    replayRate,
    shareRate,
    completionRate,
    avgTurnsReached,
    replayed,
    shared,
    actionFrequency,
    healthRiskSpikes,
    energyDepletionFrequency,
  };
}

// --- Debug Utilities ---

export function exportTelemetryData(): string {
  const sessions = getStoredSessions();
  return JSON.stringify(sessions, null, 2);
}

export function clearTelemetryData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TELEMETRY_KEY);
}

export function getRecentSessions(count: number = 10): MutiraoTelemetrySession[] {
  const sessions = getStoredSessions();
  return sessions.slice(-count).reverse();
}

// Hub Progression State & Persistence
// v1 — localStorage, privacy-light, extensible

import { GameGenre, PoliticalTheme, TerritoryScope } from '@/lib/games/catalog';

export type ProgressionState =
  | 'first_time'
  | 'first_play_completed'
  | 'returning_player'
  | 'multi_game_explorer'
  | 'sharer'
  | 'deep_engagement';

export interface GameSession {
  slug: string;
  startedAt: number;
  endedAt?: number;
  completed: boolean;
  durationSeconds?: number;
  abandoned: boolean;
  genre: GameGenre;
  territory: TerritoryScope;
  politicalThemes: PoliticalTheme[];
}

export interface HubProgression {
  recentlyPlayed: string[]; // game slugs (max 8, most recent first)
  completedGames: string[];
  savedGames: string[]; // favorites/bookmarks
  sessions: GameSession[];
  lastSession: number | null;
  genreAffinity: Record<GameGenre, number>; // genre -> score (0-100)
  territoryAffinity: Record<TerritoryScope, number>; // territory -> score (0-100)
  politicalThemeAffinity: Record<PoliticalTheme, number>; // theme -> score (0-100)
  sessionCount: number;
  totalPlayTimeSeconds: number;
  firstVisitAt: number | null;
}

const STORAGE_KEY = 'hub_progression_v1';
const MAX_RECENTLY_PLAYED = 8;
const MAX_SESSION_HISTORY = 50;
const AFFINITY_INCREMENT = 10;
const AFFINITY_DECAY = 2; // per different game played

export function getDefaultProgression(): HubProgression {
  return {
    recentlyPlayed: [],
    completedGames: [],
    savedGames: [],
    sessions: [],
    lastSession: null,
    genreAffinity: {} as Record<GameGenre, number>,
    territoryAffinity: {} as Record<TerritoryScope, number>,
    politicalThemeAffinity: {} as Record<PoliticalTheme, number>,
    sessionCount: 0,
    totalPlayTimeSeconds: 0,
    firstVisitAt: null,
  };
}

export function loadProgression(): HubProgression {
  if (typeof window === 'undefined') return getDefaultProgression();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProgression();
    const parsed = JSON.parse(raw);
    // Ensure all fields exist (for backward compatibility)
    return { ...getDefaultProgression(), ...parsed };
  } catch {
    return getDefaultProgression();
  }
}

export function saveProgression(data: Partial<HubProgression>) {
  if (typeof window === 'undefined') return;
  const current = loadProgression();
  const merged = { ...current, ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
}

// Record a game start (not yet completed)
export function recordGameStart(
  slug: string,
  genre: GameGenre,
  territory: TerritoryScope,
  politicalThemes: PoliticalTheme[]
): GameSession {
  const progression = loadProgression();
  
  const session: GameSession = {
    slug,
    startedAt: Date.now(),
    completed: false,
    abandoned: false,
    genre,
    territory,
    politicalThemes,
  };

  // Add to sessions (keep only last MAX_SESSION_HISTORY)
  const sessions = [session, ...progression.sessions].slice(0, MAX_SESSION_HISTORY);
  
  // Update recently played (move to front, dedupe, limit)
  const recentlyPlayed = [slug, ...progression.recentlyPlayed.filter(s => s !== slug)].slice(0, MAX_RECENTLY_PLAYED);

  saveProgression({
    sessions,
    recentlyPlayed,
    lastSession: Date.now(),
    sessionCount: progression.sessionCount + 1,
    firstVisitAt: progression.firstVisitAt || Date.now(),
  });

  return session;
}

// Record a game completion
export function recordGameCompletion(slug: string, durationSeconds?: number) {
  const progression = loadProgression();
  
  // Find the most recent session for this game
  const sessionIndex = progression.sessions.findIndex(s => s.slug === slug && !s.completed);
  
  if (sessionIndex >= 0) {
    const session = progression.sessions[sessionIndex];
    session.completed = true;
    session.endedAt = Date.now();
    session.durationSeconds = durationSeconds || Math.floor((Date.now() - session.startedAt) / 1000);
    
    // Update affinities
    const updatedAffinities = updateAffinities(progression, session);
    
    // Add to completed games if not already there
    const completedGames = progression.completedGames.includes(slug)
      ? progression.completedGames
      : [...progression.completedGames, slug];

    saveProgression({
      sessions: progression.sessions,
      completedGames,
      totalPlayTimeSeconds: progression.totalPlayTimeSeconds + (session.durationSeconds || 0),
      ...updatedAffinities,
    });

    return session;
  }

  return null;
}

// Record game abandonment
export function recordGameAbandon(slug: string) {
  const progression = loadProgression();
  
  const sessionIndex = progression.sessions.findIndex(s => s.slug === slug && !s.completed);
  
  if (sessionIndex >= 0) {
    const session = progression.sessions[sessionIndex];
    session.abandoned = true;
    session.endedAt = Date.now();
    session.durationSeconds = Math.floor((Date.now() - session.startedAt) / 1000);

    saveProgression({
      sessions: progression.sessions,
    });

    return session;
  }

  return null;
}

// Toggle saved/favorite game
export function toggleSavedGame(slug: string) {
  const progression = loadProgression();
  const savedGames = progression.savedGames.includes(slug)
    ? progression.savedGames.filter(s => s !== slug)
    : [...progression.savedGames, slug];
  
  saveProgression({ savedGames });
  return savedGames.includes(slug);
}

// Get completion status for a game
export function getGameStatus(slug: string): 'novo' | 'jogado' | 'concluído' | 'continue' {
  const progression = loadProgression();
  
  if (progression.completedGames.includes(slug)) return 'concluído';
  
  const hasActiveSession = progression.sessions.some(
    s => s.slug === slug && !s.completed && !s.abandoned
  );
  if (hasActiveSession) return 'continue';
  
  if (progression.recentlyPlayed.includes(slug)) return 'jogado';
  
  return 'novo';
}

// Update affinity scores based on session
function updateAffinities(progression: HubProgression, session: GameSession) {
  const genreAffinity = { ...progression.genreAffinity };
  const territoryAffinity = { ...progression.territoryAffinity };
  const politicalThemeAffinity = { ...progression.politicalThemeAffinity };

  // Boost played game's attributes
  genreAffinity[session.genre] = (genreAffinity[session.genre] || 0) + AFFINITY_INCREMENT;
  territoryAffinity[session.territory] = (territoryAffinity[session.territory] || 0) + AFFINITY_INCREMENT;
  
  for (const theme of session.politicalThemes) {
    politicalThemeAffinity[theme] = (politicalThemeAffinity[theme] || 0) + AFFINITY_INCREMENT;
  }

  // Cap at 100
  const cap = (n: number) => Math.min(100, n);
  
  return {
    genreAffinity: Object.fromEntries(
      Object.entries(genreAffinity).map(([k, v]) => [k, cap(v)])
    ) as Record<GameGenre, number>,
    territoryAffinity: Object.fromEntries(
      Object.entries(territoryAffinity).map(([k, v]) => [k, cap(v)])
    ) as Record<TerritoryScope, number>,
    politicalThemeAffinity: Object.fromEntries(
      Object.entries(politicalThemeAffinity).map(([k, v]) => [k, cap(v)])
    ) as Record<PoliticalTheme, number>,
  };
}

// Get top affinity recommendations
export function getTopAffinities(type: 'genre' | 'territory' | 'politicalTheme'): string[] {
  const progression = loadProgression();
  
  let affinities: Record<string, number>;
  switch (type) {
    case 'genre':
      affinities = progression.genreAffinity;
      break;
    case 'territory':
      affinities = progression.territoryAffinity;
      break;
    case 'politicalTheme':
      affinities = progression.politicalThemeAffinity;
      break;
    default:
      return [];
  }

  return Object.entries(affinities)
    .sort((a, b) => b[1] - a[1])
    .filter(([, score]) => score > 0)
    .map(([key]) => key);
}

// Calculate current progression state
export function getProgressionState(): ProgressionState {
  const p = loadProgression();
  
  // First time visitor
  if (!p.firstVisitAt || p.sessionCount === 0) return 'first_time';
  
  // Deep engagement: has saved games and many completions
  if (p.savedGames.length > 0 && p.completedGames.length >= 3) return 'deep_engagement';
  
  // Sharer: completed multiple games (placeholder for share tracking)
  if (p.completedGames.length >= 5) return 'sharer';
  
  // Multi-game explorer: 3+ completed games
  if (p.completedGames.length >= 3) return 'multi_game_explorer';
  
  // Returning player: has played before, some progress
  if (p.sessionCount > 1 && p.recentlyPlayed.length > 0) return 'returning_player';
  
  // First play completed: has at least one completion
  if (p.completedGames.length > 0) return 'first_play_completed';
  
  return 'returning_player';
}

// Check if it's a returning session (been away for > 24 hours)
export function isReturningSession(): boolean {
  const p = loadProgression();
  if (!p.lastSession) return false;
  const hoursSinceLastSession = (Date.now() - p.lastSession) / (1000 * 60 * 60);
  return hoursSinceLastSession > 24;
}

// Get session gap message for returning users
export function getReturnMessage(): string | null {
  if (!isReturningSession()) return null;
  
  const p = loadProgression();
  if (!p.lastSession) return null;
  
  const daysSince = Math.floor((Date.now() - p.lastSession) / (1000 * 60 * 60 * 24));
  
  if (daysSince > 30) return 'Bem-vindo de volta! Muita coisa aconteceu.';
  if (daysSince > 7) return 'Bem-vindo de volta! Pronto para continuar?';
  if (daysSince > 1) return 'Bom te ver de novo!';
  
  return null;
}

// Clear all progression (for testing or privacy)
export function clearProgression() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

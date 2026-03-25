// Hub Progression Analytics Events
// v1 — comprehensive progression tracking, privacy-light

import { getOrCreateAnonymousIdentity } from '@/lib/storage/local-session';
import { loadProgression, getProgressionState, ProgressionState } from './progression';
import { Game, GameGenre, TerritoryScope, PoliticalTheme } from '@/lib/games/catalog';
import { RecommendationResult } from './recommendation';

// All T69 progression analytics events
export type ProgressionEvent =
  // Continue/Return surfaces
  | 'continue_lane_impression'
  | 'continue_card_click'
  | 'recent_lane_impression'
  | 'recent_card_click'
  // Recommendations
  | 'recommendation_impression'
  | 'recommendation_click'
  | 'proximo_passo_impression'
  | 'voce_pode_gostar_impression'
  | 'voltar_luta_impression'
  // Post-game flow
  | 'post_game_next_click'
  | 'post_game_related_click'
  | 'completion_state_seen'
  | 'post_game_share_seen'
  // Save state
  | 'save_state_created'
  | 'save_state_updated'
  | 'save_state_cleared'
  // Share flow
  | 'share_cta_seen'
  | 'share_cta_click'
  | 'share_after_completion'
  | 'share_from_recommendation'
  // Progression state
  | 'progression_state_changed'
  | 'first_completion'
  | 'multi_game_milestone'
  | 'returning_session'
  // Cross-game flow
  | 'cross_genre_explore'
  | 'cross_territory_explore'
  | 'deepening_session_click'
  // Campaign integration
  | 'campaign_cta_after_game'
  | 'political_theme_discovery'
  // T70 — Entry Page events
  | 'entry_page_view'
  | 'entry_primary_play_click'
  | 'entry_secondary_cta_click'
  | 'why_it_matters_seen'
  | 'related_games_click'
  | 'entry_share_click'
  // T71 — Endgame Result + Share Packs
  | 'result_screen_view'
  | 'result_replay_click'
  | 'result_next_game_click'
  | 'result_share_click'
  | 'result_copy_text_click'
  | 'result_related_issue_click'
  // T72 — Runtime events
  | 'play_shell_view'
  | 'game_start'
  | 'first_interaction'
  | 'pause_click'
  | 'resume_click'
  | 'restart_click'
  | 'exit_click'
  | 'checkpoint_reached'
  | 'save_written'
  | 'fail_state_seen'
  | 'completion_emitted';

export interface ProgressionEventMeta {
  // Core identifiers
  game_slug?: string;
  source_surface?: string;
  target_game_slug?: string;
  // Game attributes
  genre?: GameGenre;
  territory?: TerritoryScope;
  political_theme?: PoliticalTheme;
  // Progression context
  progression_state?: ProgressionState;
  session_count?: number;
  completion_count?: number;
  // Recommendation context
  recommendation_reason?: 'genre_affinity' | 'territory_affinity' | 'political_theme' | 'editorial' | 'cross_genre' | 'cross_territory' | 'session_length' | 'unplayed' | 'continue' | 'shareable' | 'flow_next';
  // Flow context
  flow_type?: 'quick_to_deep' | 'arcade_to_simulator' | 'territory_discovery' | 'issue_intro_to_strategy';
  // Engagement metrics
  time_since_last_session_hours?: number;
  total_play_time_minutes?: number;
  [key: string]: any;
}

interface ProgressionEventPayload {
  event: ProgressionEvent;
  timestamp: string;
  anonymousId: string;
  sessionId?: string;
  metadata: ProgressionEventMeta;
}

const STORAGE_KEY = 'hub_progression_analytics_v1';
const MAX_EVENTS = 100;

function canUseBrowserStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function getStoredEvents(): ProgressionEventPayload[] {
  if (!canUseBrowserStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function storeEvent(payload: ProgressionEventPayload) {
  if (!canUseBrowserStorage()) return;
  try {
    const events = [payload, ...getStoredEvents()].slice(0, MAX_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // Silently fail - analytics should never break functionality
  }
}

// Main tracking function
export function trackProgressionEvent(
  event: ProgressionEvent,
  meta: ProgressionEventMeta = {}
) {
  if (typeof window === 'undefined') return;

  const identity = getOrCreateAnonymousIdentity();
  const progression = loadProgression();
  const currentState = getProgressionState();

  const payload: ProgressionEventPayload = {
    event,
    timestamp: new Date().toISOString(),
    anonymousId: identity.id,
    metadata: {
      progression_state: currentState,
      session_count: progression.sessionCount,
      completion_count: progression.completedGames.length,
      ...meta,
    },
  };

  // Store locally
  storeEvent(payload);

  // Dispatch custom event for real-time listeners
  window.dispatchEvent(
    new CustomEvent('hub_progression_event', { detail: payload })
  );

  // Console logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Progression Analytics]', event, payload.metadata);
  }
}

// Specialized tracking helpers

export function trackRecommendations(
  recommendations: RecommendationResult[],
  surface: string
) {
  recommendations.forEach(rec => {
    trackRecommendationImpression(rec.game, rec.reason, surface);
  });
}

export function trackContinueLaneImpression(games: Game[], laneId: string) {
  trackProgressionEvent('continue_lane_impression', {
    source_surface: laneId,
    game_slug: games[0]?.slug,
    genre: games[0]?.genre,
    territory: games[0]?.territoryScope,
  });
}

export function trackContinueCardClick(game: Game, laneId: string) {
  trackProgressionEvent('continue_card_click', {
    game_slug: game.slug,
    source_surface: laneId,
    genre: game.genre,
    territory: game.territoryScope,
    political_theme: game.politicalThemes[0],
  });
}

export function trackRecentLaneImpression(games: Game[]) {
  trackProgressionEvent('recent_lane_impression', {
    game_slug: games[0]?.slug,
  });
}

export function trackRecommendationImpression(
  game: Game,
  reason: ProgressionEventMeta['recommendation_reason'],
  surface: string
) {
  trackProgressionEvent('recommendation_impression', {
    game_slug: game.slug,
    source_surface: surface,
    recommendation_reason: reason,
    genre: game.genre,
    territory: game.territoryScope,
  });
}

export function trackRecommendationClick(
  game: Game,
  reason: ProgressionEventMeta['recommendation_reason'],
  sourceSurface: string
) {
  trackProgressionEvent('recommendation_click', {
    game_slug: game.slug,
    source_surface: sourceSurface,
    recommendation_reason: reason,
    genre: game.genre,
    territory: game.territoryScope,
  });
}

export function trackPostGameNextClick(fromGame: Game, toGameSlug: string, flowType?: string) {
  trackProgressionEvent('post_game_next_click', {
    game_slug: fromGame.slug,
    target_game_slug: toGameSlug,
    genre: fromGame.genre,
    territory: fromGame.territoryScope,
    flow_type: flowType as any,
  });
}

export function trackCompletionStateSeen(game: Game) {
  const progression = loadProgression();
  const isFirstCompletion = progression.completedGames.length === 1;
  
  trackProgressionEvent('completion_state_seen', {
    game_slug: game.slug,
    genre: game.genre,
    territory: game.territoryScope,
  });

  if (isFirstCompletion) {
    trackProgressionEvent('first_completion', {
      game_slug: game.slug,
      genre: game.genre,
    });
  }

  if (progression.completedGames.length === 3) {
    trackProgressionEvent('multi_game_milestone', {
      completion_count: 3,
    });
  }
}

export function trackShareCtaSeen(game: Game, context: 'post_game' | 'recommendation') {
  trackProgressionEvent('share_cta_seen', {
    game_slug: game.slug,
    source_surface: context,
    genre: game.genre,
  });
}

export function trackShareCtaClick(game: Game, context: 'post_game' | 'recommendation') {
  trackProgressionEvent('share_cta_click', {
    game_slug: game.slug,
    source_surface: context,
  });
  trackProgressionEvent('share_after_completion', {
    game_slug: game.slug,
  });
}

export function trackSaveStateCreated(game: Game) {
  trackProgressionEvent('save_state_created', {
    game_slug: game.slug,
    genre: game.genre,
    territory: game.territoryScope,
  });
}

export function trackCrossGenreExplore(fromGenre: GameGenre, toGenre: GameGenre) {
  trackProgressionEvent('cross_genre_explore', {
    genre: fromGenre,
    political_theme: toGenre as any, // Using political_theme field for the target genre
  });
}

export function trackCrossTerritoryExplore(fromTerritory: TerritoryScope, toTerritory: TerritoryScope) {
  trackProgressionEvent('cross_territory_explore', {
    territory: fromTerritory,
    political_theme: toTerritory as any, // Using political_theme field for the target territory
  });
}

export function trackReturningSession(hoursSinceLast: number) {
  trackProgressionEvent('returning_session', {
    time_since_last_session_hours: Math.round(hoursSinceLast),
  });
}

// Get all stored events for batch sending
export function getPendingProgressionEvents(): ProgressionEventPayload[] {
  return getStoredEvents();
}

// Clear sent events
export function clearPendingProgressionEvents() {
  if (!canUseBrowserStorage()) return;
  localStorage.removeItem(STORAGE_KEY);
}

// T70 — Entry Page Analytics Events

export function trackEntryPageView(game: Game) {
  trackProgressionEvent('entry_page_view', {
    game_slug: game.slug,
    genre: game.genre,
    territory: game.territoryScope,
    political_theme: game.politicalThemes[0],
  });
}

export function trackEntryPrimaryPlayClick(game: Game) {
  trackProgressionEvent('entry_primary_play_click', {
    game_slug: game.slug,
    genre: game.genre,
    territory: game.territoryScope,
    political_theme: game.politicalThemes[0],
  });
}

export function trackEntrySecondaryCtaClick(
  game: Game,
  ctaLabel: string,
  sourceSurface: string
) {
  trackProgressionEvent('entry_secondary_cta_click', {
    game_slug: game.slug,
    source_surface: sourceSurface,
    genre: game.genre,
    cta_label: ctaLabel,
  });
}

export function trackWhyItMattersSeen(game: Game) {
  trackProgressionEvent('why_it_matters_seen', {
    game_slug: game.slug,
    political_theme: game.politicalThemes[0],
  });
}

export function trackRelatedGamesClick(
  sourceGame: Game,
  targetGame: Game,
  reason: string
) {
  trackProgressionEvent('related_games_click', {
    game_slug: sourceGame.slug,
    target_game_slug: targetGame.slug,
    genre: sourceGame.genre,
    recommendation_reason: reason as any,
  });
}

export function trackEntryShareClick(game: Game, source: string) {
  trackProgressionEvent('entry_share_click', {
    game_slug: game.slug,
    source_surface: source,
    genre: game.genre,
    political_theme: game.politicalThemes[0],
  });
}

// T71 — Endgame Result + Share Packs Analytics

export function trackResultScreenView(
  game: Game,
  outcomeType: string,
  outcomeSeverity: string
) {
  trackProgressionEvent('result_screen_view', {
    game_slug: game.slug,
    genre: game.genre,
    territory: game.territoryScope,
    political_theme: game.politicalThemes[0],
    outcome_type: outcomeType,
    outcome_label: outcomeSeverity,
    source_surface: 'game_end',
  });
}

export function trackResultReplayClick(game: Game, outcomeType: string) {
  trackProgressionEvent('result_replay_click', {
    game_slug: game.slug,
    genre: game.genre,
    outcome_type: outcomeType,
  });
}

export function trackResultNextGameClick(
  game: Game,
  targetGameSlug: string,
  nextStepType: 'deeper' | 'lighter' | 'territory' | 'theme'
) {
  trackProgressionEvent('result_next_game_click', {
    game_slug: game.slug,
    target_game_slug: targetGameSlug,
    genre: game.genre,
    recommendation_reason: `result_next_${nextStepType}` as any,
  });
}

export function trackResultShareClick(game: Game, outcomeType: string) {
  trackProgressionEvent('result_share_click', {
    game_slug: game.slug,
    genre: game.genre,
    outcome_type: outcomeType,
    political_theme: game.politicalThemes[0],
  });
}

export function trackResultCopyTextClick(game: Game, outcomeType: string) {
  trackProgressionEvent('result_copy_text_click', {
    game_slug: game.slug,
    genre: game.genre,
    outcome_type: outcomeType,
  });
}

export function trackResultRelatedIssueClick(game: Game, relatedTerritory: string) {
  trackProgressionEvent('result_related_issue_click', {
    game_slug: game.slug,
    territory: game.territoryScope,
    political_theme: relatedTerritory as any,
    source_surface: 'result_related_territory',
  });
}

// T72 — Runtime Analytics

export function trackPlayShellView(game: Game, runtimeType: string) {
  trackProgressionEvent('play_shell_view', {
    game_slug: game.slug,
    genre: game.genre,
    runtime_type: runtimeType,
  });
}

export function trackGameStart(game: Game, runtimeType: string) {
  trackProgressionEvent('game_start', {
    game_slug: game.slug,
    genre: game.genre,
    runtime_type: runtimeType,
  });
}

export function trackFirstInteraction(game: Game, inputMode: string) {
  trackProgressionEvent('first_interaction', {
    game_slug: game.slug,
    genre: game.genre,
    input_mode: inputMode,
  });
}

export function trackPauseClick(game: Game) {
  trackProgressionEvent('pause_click', {
    game_slug: game.slug,
    genre: game.genre,
  });
}

export function trackResumeClick(game: Game) {
  trackProgressionEvent('resume_click', {
    game_slug: game.slug,
    genre: game.genre,
  });
}

export function trackRestartClick(game: Game) {
  trackProgressionEvent('restart_click', {
    game_slug: game.slug,
    genre: game.genre,
  });
}

export function trackExitClick(game: Game) {
  trackProgressionEvent('exit_click', {
    game_slug: game.slug,
    genre: game.genre,
  });
}

export function trackCheckpointReached(game: Game, checkpointId: string) {
  trackProgressionEvent('checkpoint_reached', {
    game_slug: game.slug,
    genre: game.genre,
    checkpoint_id: checkpointId,
  });
}

export function trackSaveWritten(gameSlug: string, genre: GameGenre) {
  trackProgressionEvent('save_written', {
    game_slug: gameSlug,
    genre,
  });
}

export function trackFailStateSeen(game: Game, reason: string) {
  trackProgressionEvent('fail_state_seen', {
    game_slug: game.slug,
    genre: game.genre,
    failure_reason: reason,
  });
}

export function trackCompletionEmitted(game: Game, outcomeType: string) {
  trackProgressionEvent('completion_emitted', {
    game_slug: game.slug,
    genre: game.genre,
    outcome_type: outcomeType,
    political_theme: game.politicalThemes[0],
  });
}

// Development helper to see current progression state
export function debugProgressionState() {
  if (process.env.NODE_ENV !== 'development') return;
  
  const progression = loadProgression();
  const state = getProgressionState();
  
  console.group('🎮 Hub Progression Debug');
  console.log('Current State:', state);
  console.log('Session Count:', progression.sessionCount);
  console.log('Completed Games:', progression.completedGames.length);
  console.log('Recently Played:', progression.recentlyPlayed);
  console.log('Genre Affinity:', progression.genreAffinity);
  console.log('Territory Affinity:', progression.territoryAffinity);
  console.log('Pending Events:', getStoredEvents().length);
  console.groupEnd();
}

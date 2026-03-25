// Hub Cross-Game Recommendation Logic
// v1 — editorial, intelligent, not random

import {
  Game,
  PoliticalTheme,
  TerritoryScope,
} from '@/lib/games/catalog';
import {
  loadProgression,
  getTopAffinities,
  HubProgression,
} from './progression';
import { trackRecommendationImpression } from './analytics';

// Recommendation reason for analytics
export type RecommendationReason =
  | 'genre_affinity'
  | 'territory_affinity'
  | 'political_theme'
  | 'editorial'
  | 'cross_genre'
  | 'cross_territory'
  | 'session_length'
  | 'unplayed'
  | 'continue'
  | 'shareable'
  | 'flow_next';

export interface RecommendationResult {
  game: Game;
  reason: RecommendationReason;
  score: number;
  explanation: string;
}

// Editorial flow types
export type FlowDirection =
  | 'quick_to_deep'           // arcade -> simulation
  | 'arcade_to_simulator'     // quick action -> thoughtful
  | 'territory_discovery'     // same territory, different genre
  | 'issue_intro_to_strategy' // issue awareness -> strategic depth
  | 'genre_explore'           // try something different
  | 'related_theme';          // same political theme

interface ScoringWeights {
  unplayed: number;
  genreAffinity: number;
  territoryAffinity: number;
  politicalThemeAffinity: number;
  sessionLengthFlow: number;
  editorialBoost: number;
  isNew: number;
  shareable: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  unplayed: 50,
  genreAffinity: 20,
  territoryAffinity: 15,
  politicalThemeAffinity: 15,
  sessionLengthFlow: 10,
  editorialBoost: 25,
  isNew: 5,
  shareable: 3,
};

// Main recommendation function with flow context
export function recommendNextGames(
  games: Game[],
  currentGame: Game | null,
  flowDirection: FlowDirection = 'quick_to_deep',
  limit: number = 3
): RecommendationResult[] {
  const progression = loadProgression();
  const playedSlugs = new Set([
    ...progression.recentlyPlayed,
    ...progression.completedGames,
  ]);

  // Score all games
  const scored = games
    .filter(g => g.status === 'live' || g.status === 'beta')
    .map(game => {
      const score = calculateGameScore(game, currentGame, progression, playedSlugs, flowDirection);
      return {
        game,
        ...score,
      };
    });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

// Single recommendation for post-game
export function recommendAfterGame(
  games: Game[],
  justCompleted: Game,
  context: 'completion' | 'abandon' | 'return'
): RecommendationResult | null {
  let flowDirection: FlowDirection;

  if (context === 'abandon') {
    // If abandoned, suggest something shorter or different genre
    flowDirection = justCompleted.pace === 'deep' ? 'quick_to_deep' : 'genre_explore';
  } else if (context === 'return') {
    // Returning player - pick up where they left off or territory exploration
    flowDirection = 'territory_discovery';
  } else {
    // Normal completion - escalate or deepen
    flowDirection = getFlowDirectionFromPace(justCompleted);
  }

  const recommendations = recommendNextGames(games, justCompleted, flowDirection, 1);
  return recommendations[0] || null;
}

// Recommendations for homepage surfaces
export function getContinuePlaying(games: Game[]): RecommendationResult[] {
  const progression = loadProgression();
  
  // Find games with active sessions (started but not completed)
  const continueSlugs = progression.sessions
    .filter(s => !s.completed && !s.abandoned)
    .map(s => s.slug);

  const uniqueContinueSlugs = [...new Set(continueSlugs)];
  
  return uniqueContinueSlugs
    .map(slug => games.find(g => g.slug === slug))
    .filter((g): g is Game => !!g)
    .map(game => ({
      game,
      reason: 'continue' as RecommendationReason,
      score: 100, // Highest priority
      explanation: 'Continue onde parou',
    }));
}

export function getRecentlyPlayed(games: Game[], excludeCompleted = true): RecommendationResult[] {
  const progression = loadProgression();
  
  return progression.recentlyPlayed
    .map(slug => games.find(g => g.slug === slug))
    .filter((g): g is Game => !!g)
    .filter(g => !excludeCompleted || !progression.completedGames.includes(g.slug))
    .map(game => ({
      game,
      reason: 'unplayed' as RecommendationReason,
      score: 70,
      explanation: 'Jogado recentemente',
    }));
}

export function getNextStepRecommendations(games: Game[], limit = 3): RecommendationResult[] {
  const progression = loadProgression();
  
  // Determine flow based on progression state
  let flowDirection: FlowDirection = 'quick_to_deep';
  
  if (progression.completedGames.length === 0) {
    // First game - keep it simple
    flowDirection = 'quick_to_deep';
  } else if (progression.completedGames.length < 3) {
    // Early exploration - same territory or theme
    flowDirection = 'territory_discovery';
  } else {
    // Deep engagement - explore different genres
    flowDirection = 'genre_explore';
  }

  const lastCompletedSlug = progression.completedGames[progression.completedGames.length - 1];
  const lastCompleted = games.find(g => g.slug === lastCompletedSlug);

  return recommendNextGames(games, lastCompleted || null, flowDirection, limit);
}

export function getVocêPodeGostar(games: Game[], limit = 3): RecommendationResult[] {
  const progression = loadProgression();
  
  // Use affinity data for personalized recommendations
  const topGenres = getTopAffinities('genre');
  const topTerritories = getTopAffinities('territory');
  const topThemes = getTopAffinities('politicalTheme');

  const playedSlugs = new Set([
    ...progression.recentlyPlayed,
    ...progression.completedGames,
  ]);

  const scored = games
    .filter(g => g.status === 'live' && !playedSlugs.has(g.slug))
    .map(game => {
      let score = 0;
      let reasons: string[] = [];

      // Genre affinity match
      if (topGenres.includes(game.genre)) {
        score += 25;
        reasons.push('gênero favorito');
      }

      // Territory affinity match
      if (topTerritories.some(t => game.territories.includes(t as TerritoryScope))) {
        score += 20;
        reasons.push('território de interesse');
      }

      // Political theme affinity
      if (topThemes.some(t => game.politicalThemes.includes(t as PoliticalTheme))) {
        score += 15;
        reasons.push('tema político relacionado');
      }

      // Is new game
      if (game.isNew) {
        score += 10;
        reasons.push('novidade');
      }

      return {
        game,
        reason: 'genre_affinity' as RecommendationReason,
        score,
        explanation: reasons.join(', ') || 'Recomendado para você',
      };
    });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

export function getVoltarParaLuta(games: Game[], currentGame: Game): RecommendationResult[] {
  // Find games in same territory or related political themes
  const related = games.filter(g => 
    g.slug !== currentGame.slug &&
    g.status === 'live' &&
    (
      g.territories.some(t => currentGame.territories.includes(t)) ||
      g.politicalThemes.some(pt => currentGame.politicalThemes.includes(pt))
    )
  );

  return related.slice(0, 3).map(game => {
    const isSameTerritory = game.territories.some(t => currentGame.territories.includes(t));
    return {
      game,
      reason: isSameTerritory ? 'territory_affinity' : 'political_theme',
      score: isSameTerritory ? 80 : 70,
      explanation: isSameTerritory 
        ? `Mais em ${game.territoryScope}` 
        : 'Tema relacionado',
    };
  });
}

// Share-aware recommendations
export function getShareableRecommendations(games: Game[], limit = 2): RecommendationResult[] {
  const progression = loadProgression();
  const playedSlugs = new Set([
    ...progression.recentlyPlayed,
    ...progression.completedGames,
  ]);

  // Games that are good for sharing (quick, high impact)
  const shareable = games
    .filter(g => 
      g.status === 'live' && 
      !playedSlugs.has(g.slug) &&
      g.pace === 'quick' && // Quick games are more shareable
      g.difficulty !== 'hard' // Easy to complete
    )
    .map(game => ({
      game,
      reason: 'shareable' as RecommendationReason,
      score: 60 + (game.isNew ? 10 : 0),
      explanation: 'Perfeito para compartilhar',
    }));

  return shareable.slice(0, limit);
}

// Calculate score for a single game
function calculateGameScore(
  game: Game,
  currentGame: Game | null,
  progression: HubProgression,
  playedSlugs: Set<string>,
  flowDirection: FlowDirection
): { score: number; reason: RecommendationReason; explanation: string } {
  let score = 0;
  let reasons: string[] = [];
  let primaryReason: RecommendationReason = 'editorial';

  // Unplayed bonus
  if (!playedSlugs.has(game.slug)) {
    score += DEFAULT_WEIGHTS.unplayed;
    reasons.push('não jogado');
    primaryReason = 'unplayed';
  }

  if (!currentGame) {
    return { score, reason: primaryReason, explanation: reasons.join(', ') };
  }

  // Genre affinity
  const genreScore = progression.genreAffinity[game.genre] || 0;
  if (genreScore > 0) {
    score += (genreScore / 100) * DEFAULT_WEIGHTS.genreAffinity;
    if (!reasons.includes('gênero favorito')) {
      reasons.push('gênero favorito');
    }
    primaryReason = 'genre_affinity';
  }

  // Territory match
  if (game.territories.some(t => currentGame.territories.includes(t))) {
    score += DEFAULT_WEIGHTS.territoryAffinity;
    reasons.push('mesmo território');
    primaryReason = 'territory_affinity';
  }

  // Political theme match
  const themeMatch = game.politicalThemes.filter(pt => 
    currentGame.politicalThemes.includes(pt)
  ).length;
  if (themeMatch > 0) {
    score += DEFAULT_WEIGHTS.politicalThemeAffinity * (themeMatch / game.politicalThemes.length);
    reasons.push('tema político relacionado');
    primaryReason = 'political_theme';
  }

  // Session length flow
  const flowScore = calculateFlowScore(currentGame, game, flowDirection);
  score += flowScore * DEFAULT_WEIGHTS.sessionLengthFlow;
  if (flowScore > 0.5) {
    reasons.push('próximo passo natural');
    primaryReason = 'flow_next';
  }

  // New game boost
  if (game.isNew) {
    score += DEFAULT_WEIGHTS.isNew;
    reasons.push('novo');
  }

  return {
    score,
    reason: primaryReason,
    explanation: reasons.join(', ') || 'Recomendação editorial',
  };
}

// Calculate how well a game fits the desired flow direction
function calculateFlowScore(from: Game, to: Game, direction: FlowDirection): number {
  switch (direction) {
    case 'quick_to_deep':
      if (from.pace === 'quick' && (to.pace === 'session' || to.pace === 'deep')) return 1;
      if (from.pace === 'session' && to.pace === 'deep') return 1;
      return 0;

    case 'arcade_to_simulator':
      if (from.genre === 'arcade' && to.genre === 'simulation') return 1;
      if (from.genre === 'arcade' && to.genre === 'management') return 0.8;
      return 0;

    case 'territory_discovery':
      return to.territories.some(t => from.territories.includes(t)) ? 0.7 : 0;

    case 'issue_intro_to_strategy':
      const themeMatch = to.politicalThemes.filter(pt => 
        from.politicalThemes.includes(pt)
      ).length;
      if (themeMatch > 0 && (to.genre === 'strategy' || to.genre === 'management')) return 1;
      return themeMatch > 0 ? 0.5 : 0;

    case 'genre_explore':
      return from.genre !== to.genre ? 0.6 : 0;

    case 'related_theme':
      return to.politicalThemes.filter(pt => from.politicalThemes.includes(pt)).length > 0 ? 0.8 : 0;

    default:
      return 0;
  }
}

// Determine flow direction based on current game pace
function getFlowDirectionFromPace(game: Game): FlowDirection {
  switch (game.pace) {
    case 'quick':
      return 'quick_to_deep';
    case 'session':
      return Math.random() > 0.5 ? 'territory_discovery' : 'issue_intro_to_strategy';
    case 'deep':
      return 'genre_explore';
    default:
      return 'territory_discovery';
  }
}

// Hook for recommendation impression tracking
export function trackRecommendations(
  recommendations: RecommendationResult[],
  surface: string
) {
  recommendations.forEach(rec => {
    trackRecommendationImpression(rec.game, rec.reason, surface);
  });
}

// Filter games by user device support
export function filterByDeviceSupport(
  recommendations: RecommendationResult[],
  isMobile: boolean
): RecommendationResult[] {
  return recommendations.filter(rec => {
    const supportsMobile = rec.game.deviceSupport.includes('mobile');
    const supportsDesktop = rec.game.deviceSupport.includes('desktop');
    return isMobile ? supportsMobile : supportsDesktop;
  });
}

// Legacy compatibility
export interface GameMeta {
  slug: string;
  genre: string;
  territory: string;
  politicalTheme: string;
  sessionLength: 'quick' | 'medium' | 'deep';
  shareable?: boolean;
  [key: string]: any;
}

// Legacy function for backward compatibility
export function recommendNextGame(
  games: GameMeta[],
  currentGameSlug?: string
): GameMeta | null {
  const progression = loadProgression();
  const played = new Set([
    ...progression.recentlyPlayed,
    ...progression.completedGames,
  ]);
  let candidates = games.filter((g) => !played.has(g.slug));
  
  if (currentGameSlug) {
    const current = games.find((g) => g.slug === currentGameSlug);
    if (current) {
      candidates = candidates.sort((a, _b) => {
        let score = 0;
        if (a.territory === current.territory) score += 2;
        if (a.politicalTheme === current.politicalTheme) score += 2;
        if (a.genre === current.genre) score += 1;
        if (
          (current.sessionLength === 'quick' && a.sessionLength === 'medium') ||
          (current.sessionLength === 'medium' && a.sessionLength === 'deep')
        )
          score += 1;
        return score;
      });
    }
  }
  
  return candidates[0] || games[0] || null;
}

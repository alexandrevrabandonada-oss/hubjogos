/**
 * Game Recommendations
 * Utilities for suggesting next games based on current game context
 */

import { games, type Game } from './catalog';
import { getLocalArray } from '@/lib/storage/local-session';

export interface GameRecommendation {
  game: Game;
  reason: string;
  priority: number;
}

interface CandidateScore {
  game: Game;
  reason: string;
  score: number;
}

function toTimestamp(value?: string): number {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function getRecommendationEvidenceBoost(currentGame: Game, candidate: Game): number {
  const events = getLocalArray<any>('events');
  if (!events || events.length === 0) {
    return 0;
  }

  let clickSignals = 0;
  let effectiveStarts = 0;

  const bySession = new Map<string, any[]>();
  events.forEach((event) => {
    const sessionId = event.sessionId || 'unknown';
    if (!bySession.has(sessionId)) {
      bySession.set(sessionId, []);
    }
    bySession.get(sessionId)?.push(event);
  });

  for (const sessionEvents of bySession.values()) {
    const ordered = [...sessionEvents].sort((a, b) => toTimestamp(a.createdAt) - toTimestamp(b.createdAt));

    for (const event of ordered) {
      const name = event.event;
      const fromSlug = event.slug;
      const metadata = event.metadata || {};
      const toSlug = metadata.nextGameSlug || metadata.slug || metadata.arcadeSlug || metadata.quickSlug;

      const isCrossClick =
        name === 'next_game_after_run_click' ||
        name === 'next_game_click' ||
        name === 'quick_to_arcade_click' ||
        name === 'arcade_to_quick_click';

      if (!isCrossClick || fromSlug !== currentGame.slug || toSlug !== candidate.slug) {
        continue;
      }

      clickSignals += 1;
      const clickTs = toTimestamp(event.createdAt);
      const hasEffectiveStart = ordered.some((nextEvent) => {
        const nextName = nextEvent.event;
        const isStart = nextName === 'game_start' || nextName === 'arcade_run_start' || nextName === 'first_interaction_time';
        if (!isStart || nextEvent.slug !== candidate.slug) {
          return false;
        }

        const nextTs = toTimestamp(nextEvent.createdAt);
        return nextTs > clickTs && nextTs - clickTs <= 90 * 1000;
      });

      if (hasEffectiveStart) {
        effectiveStarts += 1;
      }
    }
  }

  if (clickSignals === 0) {
    return 0;
  }

  const effectiveRate = Math.round((effectiveStarts / clickSignals) * 100);
  if (effectiveRate >= 60) return 40;
  if (effectiveRate >= 40) return 24;
  if (effectiveRate >= 20) return 12;
  return -8;
}

/**
 * Get recommended next games based on the current game
 * Returns up to 3 recommendations, prioritizing:
 * 1. Same series, different format (arcade <-> quick)
 * 2. Same territory, different series
 * 3. Different format, same political axis
 */
export function getNextGameRecommendations(currentGame: Game): GameRecommendation[] {
  const recommendations: CandidateScore[] = [];
  const liveGames = games.filter((g) => g.status === 'live' && g.slug !== currentGame.slug);

  // Priority 1: Same series, different format
  if (currentGame.kind === 'arcade') {
    // Suggest quick games from same series
    const sameSeries = liveGames.filter(
      (g) => g.series === currentGame.series && g.pace === 'quick'
    );
    sameSeries.forEach((g) => {
      recommendations.push({
        game: g,
        reason: 'Mesma série, entrada rápida',
        score: 100 + getRecommendationEvidenceBoost(currentGame, g),
      });
    });
  } else {
    // Suggest arcades from same series
    const sameSeries = liveGames.filter(
      (g) => g.series === currentGame.series && g.kind === 'arcade'
    );
    sameSeries.forEach((g) => {
      recommendations.push({
        game: g,
        reason: 'Mesma série, controle real',
        score: 100 + getRecommendationEvidenceBoost(currentGame, g),
      });
    });
  }

  // Priority 2: Same territory, different series
  const sameTerritory = liveGames.filter(
    (g) =>
      g.territoryScope === currentGame.territoryScope &&
      g.series !== currentGame.series &&
      !recommendations.some((r) => r.game.slug === g.slug)
  );
  sameTerritory.slice(0, 2).forEach((g) => {
    recommendations.push({
      game: g,
      reason: 'Outro tema do RJ',
      score: 60 + getRecommendationEvidenceBoost(currentGame, g),
    });
  });

  // Priority 3: Different format
  if (currentGame.kind === 'arcade') {
    // Suggest a quick game
    const quickGames = liveGames.filter(
      (g) =>
        g.pace === 'quick' &&
        !recommendations.some((r) => r.game.slug === g.slug)
    );
    if (quickGames.length > 0) {
      recommendations.push({
        game: quickGames[0],
        reason: 'Quick para continuar',
        score: 30 + getRecommendationEvidenceBoost(currentGame, quickGames[0]),
      });
    }
  } else {
    // Suggest an arcade
    const arcadeGames = liveGames.filter(
      (g) =>
        g.kind === 'arcade' &&
        !recommendations.some((r) => r.game.slug === g.slug)
    );
    if (arcadeGames.length > 0) {
      recommendations.push({
        game: arcadeGames[0],
        reason: 'Arcade para mais ação',
        score: 30 + getRecommendationEvidenceBoost(currentGame, arcadeGames[0]),
      });
    }
  }

  // Consolidate by slug keeping the highest-scored reason.
  const deduped = new Map<string, CandidateScore>();
  recommendations.forEach((item) => {
    const existing = deduped.get(item.game.slug);
    if (!existing || item.score > existing.score) {
      deduped.set(item.game.slug, item);
    }
  });

  // Sort by weighted score and return top 3.
  return recommendations
    .length > 0
    ? Array.from(deduped.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item, index) => ({
        game: item.game,
        reason: item.reason,
        priority: index + 1,
      }))
    : [];
}

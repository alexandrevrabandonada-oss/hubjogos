import { useCallback } from 'react';
import { type Game } from '@/lib/games/catalog';
import {
  trackArcadeRunStart,
  trackArcadeRunEnd,
  trackArcadeScore,
  trackArcadeReplayClick,
} from '@/lib/analytics/track';

interface TelemetryPayload {
  runId: string;
  score: number;
  durationMs: number;
  [key: string]: any;
}

/**
 * Shared module for Arcade Telemetry.
 * Unifica e simplifica as chamadas aos métodos de tracking padrão do Google Analytics/PostHog.
 * 
 * @param game Objeto do jogo atual (do catálogo)
 */
export function useArcadeTelemetry(game: Game) {
  const trackStart = useCallback((runId: string) => {
    void trackArcadeRunStart(game, {
      arcadeSlug: game.slug,
      runId,
    }).catch(console.error);
  }, [game]);

  const trackEnd = useCallback(async (payload: TelemetryPayload) => {
    try {
      await trackArcadeScore(game, payload.score, {
        ...(payload as any)
      });

      await trackArcadeRunEnd(game, {
        arcadeSlug: game.slug,
        ...(payload as any)
      });
    } catch (err) {
      console.error('Falha ao registrar telemetria de fim de run', err);
    }
  }, [game]);

  const trackReplay = useCallback(() => {
    void trackArcadeReplayClick(game, game.slug).catch(console.error);
  }, [game]);

  return { trackStart, trackEnd, trackReplay };
}

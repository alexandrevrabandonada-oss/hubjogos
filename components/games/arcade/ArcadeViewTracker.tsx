"use client";

import { useEffect } from 'react';
import { trackGameView } from '@/lib/analytics/track';
import { type Game } from '@/lib/games/catalog';

interface ArcadeViewTrackerProps {
  game: Game;
}

export function ArcadeViewTracker({ game }: ArcadeViewTrackerProps) {
  useEffect(() => {
    if (game) {
      void trackGameView(game);
    }
  }, [game]);

  return null;
}

'use client';

import React, { useEffect } from 'react';
import styles from './PortfolioLane.module.css';
import { Game } from '@/lib/games/catalog';
import { GameCard } from './GameCard';
import Link from 'next/link';
import { trackPortfolioLaneImpression } from '@/lib/analytics/track';

interface PortfolioLaneProps {
  title: string;
  category: string;
  games: Game[];
  viewAllHref?: string;
  laneId: string;
  cardVariant?: 'standard' | 'featured' | 'compact';
}

export function PortfolioLane({ 
  title, 
  category, 
  games, 
  viewAllHref, 
  laneId,
  cardVariant = 'standard'
}: PortfolioLaneProps) {
  useEffect(() => {
    if (games && games.length > 0) {
      trackPortfolioLaneImpression(laneId, title).catch(console.error);
    }
  }, [laneId, title, games]);

  if (!games || games.length === 0) return null;

  return (
    <div className={styles.laneContainer} data-lane-id={laneId}>
      <div className={styles.laneHeader}>
        <div className={styles.titleGroup}>
          <span className={styles.category}>{category}</span>
          <h3 className={styles.title}>{title}</h3>
        </div>
        {viewAllHref && (
          <Link href={viewAllHref} className={styles.viewAll}>
            Ver todos →
          </Link>
        )}
      </div>
      <div className={styles.laneScroll}>
        <div className={styles.laneTracks}>
          {games.map((game) => (
            <div key={game.id} className={`${styles.laneItem} ${styles[`laneItem${cardVariant.charAt(0).toUpperCase() + cardVariant.slice(1)}`]}`}>
              <GameCard game={game} laneId={laneId} variant={cardVariant} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

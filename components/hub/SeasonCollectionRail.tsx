import React from 'react';
import styles from './SeasonCollectionRail.module.css';
import { Game } from '@/lib/games/catalog';
import { GameCard } from './GameCard';

interface SeasonCollectionRailProps {
  title: string;
  description?: string;
  seasonId?: string;
  games: Game[];
}

export function SeasonCollectionRail({ title, description, seasonId, games }: SeasonCollectionRailProps) {
  if (!games || games.length === 0) return null;

  return (
    <div className={styles.railContainer}>
      <div className={styles.railHeader}>
        <div className={styles.titleWrap}>
          {seasonId && <span className={styles.seasonBadge}>{seasonId.toUpperCase()}</span>}
          <h3 className={styles.title}>{title}</h3>
        </div>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      <div className={styles.railScroll}>
        <div className={styles.railTracks}>
          {games.map((game) => (
            <div key={game.id} className={styles.railItem}>
              <GameCard game={game} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

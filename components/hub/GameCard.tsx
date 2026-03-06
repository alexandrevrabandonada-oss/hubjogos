/**
 * Game Card Component
 * Card que exibe um jogo do catálogo
 */

'use client';

import Link from 'next/link';
import { Game } from '@/lib/games/catalog';
import styles from './GameCard.module.css';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const statusLabels = {
    live: '🔴 Ao Vivo',
    beta: '🟡 Beta',
    coming: '⭕ Em Breve',
  };

  return (
    <Link href={`/play/${game.slug}`}>
      <div className={styles.card} style={{'--accent-color': game.color} as any}>
        {/* Status Badge */}
        <div className={styles.statusBadge}>
          {statusLabels[game.status]}
        </div>

        {/* Icon */}
        <div className={styles.icon}>{game.icon}</div>

        {/* Title */}
        <h3 className={styles.title}>{game.title}</h3>

        {/* Short Description */}
        <p className={styles.description}>{game.shortDescription}</p>

        {/* Meta Info */}
        <div className={styles.meta}>
          <span className={styles.duration}>⏱️ {game.duration}</span>
          <span className={styles.difficulty}>
            {game.difficulty === 'easy' && '⚪'}
            {game.difficulty === 'medium' && '🟡'}
            {game.difficulty === 'hard' && '🔴'}
            {' '}
            {game.difficulty}
          </span>
        </div>

        {/* CTA */}
        <div className={styles.cta}>{game.cta} →</div>
      </div>
    </Link>
  );
}

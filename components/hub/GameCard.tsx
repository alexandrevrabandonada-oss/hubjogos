/**
 * Game Card Component
 * Card que exibe um jogo do catálogo
 */

'use client';

import Link from 'next/link';
import { Game } from '@/lib/games/catalog';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MetaChip } from '@/components/ui/MetaChip';
import { trackSeriesClick } from '@/lib/analytics/track';
import styles from './GameCard.module.css';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  async function handleCardClick() {
    await trackSeriesClick(game as any, game.series, game.territoryScope, 'game-card').catch(console.error);
  }

  return (
    <Link href={`/play/${game.slug}`} className={styles.linkWrap} onClick={handleCardClick}>
      <Card interactive className={styles.card}>
        <div
          className={styles.accentBar}
          style={{ '--accent-color': game.color } as any}
        />

        <div className={styles.topRow}>
          <span className={styles.icon} aria-hidden>
            {game.icon}
          </span>
          <StatusBadge status={game.status} />
        </div>

        <h3 className={styles.title}>{game.title}</h3>
        <p className={styles.description}>{game.shortDescription}</p>

        <div className={styles.meta}>
          <MetaChip icon="⏱">{game.estimatedMinutes} min</MetaChip>
          <MetaChip icon="⚡">{game.pace}</MetaChip>
          <MetaChip icon="📌">{game.theme}</MetaChip>
          <MetaChip icon="🗺">{game.territoryScope}</MetaChip>
          <MetaChip icon="🧱">{game.series.replace('serie-', '')}</MetaChip>
          <MetaChip icon="🧭">{game.kind}</MetaChip>
          <MetaChip icon={game.runtimeState === 'real' ? '✅' : '🧱'}>
            {game.runtimeState === 'real' ? 'engine real' : 'shell'}
          </MetaChip>
        </div>

        <div className={styles.cta}>
          <span>Entender a pauta</span>
          <strong>{game.cta} →</strong>
        </div>
      </Card>
    </Link>
  );
}

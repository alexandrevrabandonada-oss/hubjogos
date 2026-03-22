/**
 * Game Card Component
 * Card que exibe um jogo do catálogo
 */

'use client';

import Link from 'next/link';
import {
  Game,
  GAME_SERIES_LABELS,
  TERRITORY_SCOPE_LABELS,
} from '@/lib/games/catalog';
import { Card } from '@/components/ui/Card';
import { MetaChip } from '@/components/ui/MetaChip';
import { GameStatusBadge } from '@/components/hub/GameStatusBadge';
import { GameTypePill } from '@/components/hub/GameTypePill';
import { GameRoleLabel } from '@/components/hub/GameRoleLabel';
import { trackSeriesClick } from '@/lib/analytics/track';
import styles from './GameCard.module.css';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const destination = game.kind === 'arcade' ? `/arcade/${game.slug}` : `/play/${game.slug}`;
  const isArcade = game.kind === 'arcade';
  const actionLabel = isArcade 
    ? `${game.cta} agora` 
    : `${game.cta} agora`;

  async function handleCardClick() {
    await trackSeriesClick(game as any, game.series, game.territoryScope, 'game-card').catch(console.error);
  }

  return (
    <Link href={destination} className={styles.linkWrap} onClick={handleCardClick}>
      <Card interactive className={`${styles.card} ${isArcade ? styles.arcadeCard : ''}`}>
        <div
          className={styles.accentBar}
          style={{ '--accent-color': game.color } as any}
        />

        <div className={styles.topRow}>
          <span className={styles.icon} aria-hidden>
            {game.icon}
          </span>
          <div className={styles.topBadges}>
            <GameTypePill kind={game.kind} />
            <GameStatusBadge status={game.status} />
          </div>
        </div>

        <h3 className={styles.title}>{game.title}</h3>
        <p className={styles.description}>{game.shortDescription}</p>

        <div className={styles.meta}>
          <GameRoleLabel role={game.funRole} />
          <MetaChip icon="⏱">{game.duration}</MetaChip>
          <MetaChip icon="🗺">{TERRITORY_SCOPE_LABELS[game.territoryScope]}</MetaChip>
          <MetaChip icon="🧱">{GAME_SERIES_LABELS[game.series]}</MetaChip>
          {isArcade ? <MetaChip icon="🔁">replay imediato</MetaChip> : <MetaChip icon="⚡">entrada rápida</MetaChip>}
        </div>

        <div className={styles.cta}>
          <span className={styles.ctaHint}>
            {isArcade ? '🎮 Jogue de verdade' : '⚡ Entre rápido'}
          </span>
          <strong className={styles.ctaAction}>{actionLabel} →</strong>
        </div>
      </Card>
    </Link>
  );
}

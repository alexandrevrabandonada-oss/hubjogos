/**
 * Game Card Component
 * Card que exibe um jogo do catálogo
 */

'use client';

import Link from 'next/link';
import {
  Game,
  GAME_SERIES_LABELS,
  POLITICAL_AXIS_LABELS,
  TERRITORY_SCOPE_LABELS,
} from '@/lib/games/catalog';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MetaChip } from '@/components/ui/MetaChip';
import { trackSeriesClick } from '@/lib/analytics/track';
import styles from './GameCard.module.css';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const destination = game.kind === 'arcade' ? `/arcade/${game.slug}` : `/play/${game.slug}`;

  async function handleCardClick() {
    await trackSeriesClick(game as any, game.series, game.territoryScope, 'game-card').catch(console.error);
  }

  return (
    <Link href={destination} className={styles.linkWrap} onClick={handleCardClick}>
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
          <MetaChip icon="🗺">{TERRITORY_SCOPE_LABELS[game.territoryScope]}</MetaChip>
          <MetaChip icon="🧱">{GAME_SERIES_LABELS[game.series]}</MetaChip>
          <MetaChip icon="🧭">{POLITICAL_AXIS_LABELS[game.politicalAxis]}</MetaChip>
          <MetaChip icon="🤝">{game.collectiveSolutionType}</MetaChip>
          <MetaChip icon="🎮">{game.kind}</MetaChip>
          <MetaChip icon={game.runtimeState === 'real' ? '✅' : '🧱'}>
            {game.runtimeState === 'real' ? 'engine real' : 'shell'}
          </MetaChip>
          {(game.territoryScope === 'volta-redonda' || game.territoryScope === 'sul-fluminense') && (
            <MetaChip icon="🧭">Escala {TERRITORY_SCOPE_LABELS[game.territoryScope]} {'->'} Estado RJ</MetaChip>
          )}
        </div>

        <div className={styles.cta}>
          <span>Entender a pauta</span>
          <strong>{game.cta} →</strong>
        </div>
      </Card>
    </Link>
  );
}

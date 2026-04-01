'use client';


import Link from 'next/link';
import Image from 'next/image';
import {
  Game,
  GAME_GENRE_LABELS,
  TERRITORY_SCOPE_LABELS,
} from '@/lib/games/catalog';
import { Card } from '@/components/ui/Card';
import { trackSeriesClick, trackPortfolioCardClick } from '@/lib/analytics/track';
import { ProgressionBadge } from '@/components/hub/ProgressionBadge';
import { loadProgression, saveProgression } from '@/lib/hub/progression';
import { trackProgressionEvent } from '@/lib/hub/analytics';
import styles from './GameCard.module.css';

interface GameCardProps {
  game: Game;
  laneId?: string;
  variant?: 'standard' | 'featured' | 'compact';
}

export function GameCard({ game, laneId, variant = 'standard' }: GameCardProps) {
  const destination =
    game.slug === 'tarifa-zero-corredor'
      ? '/games/corredor-livre'
      : game.slug === 'cidade-real'
        ? '/games/cidade-real'
      : game.slug === 'bairro-resiste'
        ? '/games/bairro-resiste'
      : game.slug === 'frota-popular-spike'
        ? '/games/frota-popular-spike'
      : game.kind === 'arcade'
        ? `/arcade/${game.slug}`
        : `/play/${game.slug}`;
  

  async function handleCardClick() {
    // Nova analítica de Portfólio (T67)
    if (laneId) {
      await trackPortfolioCardClick(game, laneId).catch(console.error);
    }
    // Mantendo analíticas da série por compatibilidade
    await trackSeriesClick(game as any, game.series, game.territoryScope, laneId || 'game-card').catch(console.error);

    // Progression: update local save state
    try {
      const progression = loadProgression();
      // Add to recently played (move to front, dedupe)
      const updatedRecently = [game.slug, ...progression.recentlyPlayed.filter(s => s !== game.slug)].slice(0, 8);
      // Optionally, mark as completed if game has completion logic elsewhere
      saveProgression({
        recentlyPlayed: updatedRecently,
        lastSession: Date.now(),
      });
      trackProgressionEvent('continue_card_click', {
        game_slug: game.slug,
        source_surface: laneId,
        genre: game.genre,
        territory: game.territoryScope,
        click_context: 'card_click',
      });
    } catch (e) {
      // ignore
    }
  }

  const cardVariantClass = styles[`card${variant.charAt(0).toUpperCase() + variant.slice(1)}`];
  const cardClassName = `${styles.card} ${cardVariantClass || ''} ${game.genre === 'arcade' ? styles.arcadeCard : ''}`;

  const style = {
    '--card-accent': `var(--genre-${game.genre})`
  } as React.CSSProperties;

  return (
    <Link href={destination} className={styles.linkWrap} onClick={handleCardClick} style={style}>
      <Card interactive className={cardClassName}>
        {game.priorityScore > 90 && <div className={styles.accentBar} />}

        {/* Progression badge logic */}
        <div className={styles.progressionBadges}>
          {game.isNew && <ProgressionBadge type="novo" />}
          {/* Example: show 'jogado' if in recently played, 'concluído' if in completedGames, etc. */}
          {(() => {
            try {
              const progression = loadProgression();
              if (progression.completedGames.includes(game.slug)) {
                return <ProgressionBadge type="concluído" />;
              }
              if (progression.recentlyPlayed.includes(game.slug)) {
                return <ProgressionBadge type="jogado" />;
              }
              // Optionally, add more badges (recomendado, curto, profundo) based on logic
              // if (game.sessionLength === 'quick') return <ProgressionBadge type="curto" />;
              // if (game.sessionLength === 'deep') return <ProgressionBadge type="profundo" />;
            } catch {
              return null;
            }
            return null;
          })()}
        </div>

        <div className={styles.topRow}>
          <span className={styles.icon} aria-hidden>
            {game.icon}
          </span>
          <div className={styles.topBadges}>
            {game.publicVisibility === 'flagship' && <span className={`${styles.visibilityBadge} ${styles.badgeFlagship}`}>Flagship</span>}
            {game.publicVisibility === 'public_ready_beta' && <span className={`${styles.visibilityBadge} ${styles.badgeBeta}`}>Beta</span>}
            {game.publicVisibility === 'lab' && <span className={`${styles.visibilityBadge} ${styles.badgeLab}`}>Lab</span>}
            {game.publicVisibility === 'secondary_quickplay' && game.genre === 'quiz' && <span className={`${styles.visibilityBadge} ${styles.badgeQuick}`}>Quick</span>}
            <span className={styles.genreBadge}>{GAME_GENRE_LABELS[game.genre]}</span>
          </div>
        </div>

        <h3 className={styles.title}>{game.title}</h3>
        {game.publicVisibility === 'flagship' && (
          <>
            <div className={styles.flagshipThumbWrap}>
              <Image
                src={game.cover}
                alt={`${game.title} poster oficial`}
                fill
                className={styles.flagshipThumb}
                sizes="(max-width: 768px) 100vw, 420px"
              />
            </div>
            <div className={styles.flagshipProofRow}>
              <span className={styles.flagshipProofChip}>{game.runtimeState === 'real' ? 'Runtime real' : 'Captura guiada'}</span>
              <span className={styles.flagshipProofChip}>{game.duration}</span>
              <span className={styles.flagshipProofChip}>{game.deviceSupport.length === 2 ? 'Mobile + Desktop' : game.deviceSupport[0] === 'mobile' ? 'Mobile' : 'Desktop'}</span>
            </div>
          </>
        )}
        <p className={styles.description}>{game.shortDescription}</p>

        <div className={styles.meta}>
          {game.territories.map(t => (
            <span key={t} className={styles.territoryTag}>
              {TERRITORY_SCOPE_LABELS[t]}
            </span>
          ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.deviceIcons}>
            {game.deviceSupport.includes('mobile') && <span title="suporta mobile">📱</span>}
            {game.deviceSupport.includes('desktop') && <span title="suporta desktop">💻</span>}
          </div>
          <strong className={styles.ctaAction}>{game.cta} →</strong>
        </div>
      </Card>
    </Link>
  );
}

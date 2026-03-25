'use client';

// Post-Game Loop Components
// v1 — Result summary, next steps, share CTA, campaign connection

import React from 'react';
import Link from 'next/link';
import { Game } from '@/lib/games/catalog';
import { GameCard } from '../hub/GameCard';
import { ProgressionBadge } from '../hub/ProgressionBadge';
import { RecommendationResult } from '@/lib/hub/recommendation';
import {
  trackCompletionStateSeen,
  trackShareCtaSeen,
  trackShareCtaClick,
  trackPostGameNextClick,
} from '@/lib/hub/analytics';
import styles from './PostGameLoop.module.css';

// --- Result Summary Section ---
interface ResultSummaryProps {
  game: Game;
  resultTitle: string;
  resultSummary: string;
  resultId: string;
  onView?: () => void;
}

export function ResultSummary({
  game,
  resultTitle,
  resultSummary,
  resultId,
  onView,
}: ResultSummaryProps) {
  React.useEffect(() => {
    trackCompletionStateSeen(game);
    if (onView) onView();
  }, [game, onView]);

  return (
    <div className={styles.resultSummary} data-testid="result-summary">
      <div className={styles.completionBadge}>
        <ProgressionBadge type="concluído" />
      </div>
      <h2 className={styles.resultTitle}>{resultTitle}</h2>
      <p className={styles.resultDescription}>{resultSummary}</p>
      <div className={styles.resultMeta}>
        <span className={styles.gameLabel}>{game.title}</span>
        <span className={styles.divider}>•</span>
        <span className={styles.resultId}>Resultado: {resultId}</span>
      </div>
    </div>
  );
}

// --- Why It Matters Section ---
interface WhyItMattersProps {
  game: Game;
  explanation?: string;
}

export function WhyItMatters({ game, explanation }: WhyItMattersProps) {
  const defaultExplanation = game.campaignRole ||
    'Esta experiência faz parte de um projeto maior de transformação política.';

  return (
    <div className={styles.whyItMatters}>
      <h3 className={styles.sectionTitle}>Por que isso importa</h3>
      <p className={styles.explanation}>{explanation || defaultExplanation}</p>
      <div className={styles.themeChips}>
        {game.politicalThemes.map(theme => (
          <span key={theme} className={styles.themeChip}>
            {theme}
          </span>
        ))}
      </div>
    </div>
  );
}

// --- Next Game Recommendation ---
interface NextGameRecommendationProps {
  recommendation: RecommendationResult;
  onPlayClick?: () => void;
}

export function NextGameRecommendation({
  recommendation,
  onPlayClick,
}: NextGameRecommendationProps) {
  const { game, explanation } = recommendation;

  const handleClick = () => {
    trackPostGameNextClick(game, game.slug, 'completion');
    if (onPlayClick) onPlayClick();
  };

  return (
    <div className={styles.nextGameSection}>
      <h3 className={styles.sectionTitle}>Continue sua jornada</h3>
      <div className={styles.nextGameCard}>
        <GameCard game={game} laneId="post-game-next" variant="featured" />
        {explanation && (
          <p className={styles.nextGameReason}>{explanation}</p>
        )}
        <Link
          href={game.kind === 'arcade' ? `/arcade/${game.slug}` : `/play/${game.slug}`}
          className={styles.playNextButton}
          onClick={handleClick}
        >
          Jogar Agora →
        </Link>
      </div>
    </div>
  );
}

// --- Related Issue / Struggle ---
interface RelatedStruggleProps {
  game: Game;
  relatedGames: Game[];
  maxItems?: number;
}

export function RelatedStruggle({
  game,
  relatedGames,
  maxItems = 1,
}: RelatedStruggleProps) {
  const displayGames = relatedGames.slice(0, maxItems);
  if (!displayGames.length) return null;

  return (
    <div className={styles.relatedStruggle}>
      <h3 className={styles.sectionTitle}>Lutas relacionadas</h3>
      <p className={styles.contextText}>
        Explore mais sobre {game.politicalThemes[0] || 'esta temática'}:
      </p>
      <div className={styles.relatedGameList}>
        {displayGames.map(relatedGame => (
          <Link
            key={relatedGame.slug}
            href={relatedGame.kind === 'arcade' ? `/arcade/${relatedGame.slug}` : `/play/${relatedGame.slug}`}
            className={styles.relatedGameLink}
          >
            <span className={styles.relatedIcon}>{relatedGame.icon}</span>
            <span className={styles.relatedTitle}>{relatedGame.title}</span>
            <span className={styles.relatedCta}>Explorar →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// --- Share CTA Section ---
interface ShareCtaProps {
  game: Game;
  shareUrl: string;
  shareText: string;
  context?: 'post_game' | 'recommendation';
  onShare?: () => void;
}

export function ShareCta({
  game,
  shareUrl,
  shareText,
  context = 'post_game',
  onShare,
}: ShareCtaProps) {
  React.useEffect(() => {
    trackShareCtaSeen(game, context);
  }, [game, context]);

  const handleShare = async () => {
    trackShareCtaClick(game, context);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Terminei ${game.title} no Hub de Jogos!`,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        alert('Link copiado para a área de transferência!');
      } catch {
        // Clipboard API not available
      }
    }
    
    if (onShare) onShare();
  };

  return (
    <div className={styles.shareSection}>
      <h3 className={styles.sectionTitle}>Compartilhe sua experiência</h3>
      <p className={styles.shareHint}>
        Espalhe a mensagem e convide mais pessoas para o projeto político.
      </p>
      <button
        className={styles.shareButton}
        onClick={handleShare}
        aria-label="Compartilhar resultado"
      >
        <span className={styles.shareIcon}>📤</span>
        <span className={styles.shareLabel}>Compartilhar</span>
      </button>
    </div>
  );
}

// --- Campaign / Civic CTA ---
interface CampaignCtaProps {
  campaignUrl?: string;
  ctaText?: string;
  context?: string;
}

export function CampaignCta({
  campaignUrl = '/participar',
  ctaText = 'Participar da Campanha',
  context,
}: CampaignCtaProps) {
  return (
    <div className={styles.campaignSection}>
      <h3 className={styles.sectionTitle}>Vá além do jogo</h3>
      <p className={styles.campaignText}>
        Estas lutas são reais. Junte-se a quem já está organizando mudança.
      </p>
      <Link
        href={campaignUrl}
        className={styles.campaignButton}
        data-context={context}
      >
        {ctaText} →
      </Link>
    </div>
  );
}

// --- Return to Hub CTA ---
interface ReturnToHubProps {
  label?: string;
}

export function ReturnToHub({ label = 'Voltar ao Hub' }: ReturnToHubProps) {
  return (
    <div className={styles.returnToHub}>
      <Link href="/" className={styles.returnLink}>
        ← {label}
      </Link>
    </div>
  );
}

// --- Complete Post-Game Loop ---
interface PostGameLoopProps {
  game: Game;
  result: {
    title: string;
    summary: string;
    id: string;
  };
  nextRecommendation: RecommendationResult | null;
  relatedGames: Game[];
  shareData: {
    url: string;
    text: string;
  };
  showCampaignCta?: boolean;
}

export function PostGameLoop({
  game,
  result,
  nextRecommendation,
  relatedGames,
  shareData,
  showCampaignCta = true,
}: PostGameLoopProps) {
  return (
    <div className={styles.postGameLoop}>
      <ResultSummary
        game={game}
        resultTitle={result.title}
        resultSummary={result.summary}
        resultId={result.id}
      />

      <WhyItMatters game={game} />

      {nextRecommendation && (
        <NextGameRecommendation recommendation={nextRecommendation} />
      )}

      <RelatedStruggle game={game} relatedGames={relatedGames} />

      <ShareCta
        game={game}
        shareUrl={shareData.url}
        shareText={shareData.text}
        context="post_game"
      />

      {showCampaignCta && (
        <CampaignCta />
      )}

      <ReturnToHub />
    </div>
  );
}

// --- Compact Post-Game (for minimal view) ---
interface CompactPostGameProps {
  game: Game;
  nextRecommendation: RecommendationResult | null;
  onPlayNext?: () => void;
  onReturnToHub?: () => void;
}

export function CompactPostGame({
  game,
  nextRecommendation,
  onPlayNext,
  onReturnToHub,
}: CompactPostGameProps) {
  return (
    <div className={styles.compactPostGame}>
      <div className={styles.completionMessage}>
        <ProgressionBadge type="concluído" />
        <span>Concluído!</span>
      </div>

      {nextRecommendation && (
        <div className={styles.quickNext}>
          <span className={styles.nextLabel}>Próximo:</span>
          <Link
            href={nextRecommendation.game.kind === 'arcade'
              ? `/arcade/${nextRecommendation.game.slug}`
              : `/play/${nextRecommendation.game.slug}`
            }
            className={styles.quickNextLink}
            onClick={() => {
              trackPostGameNextClick(game, nextRecommendation.game.slug, 'compact');
              if (onPlayNext) onPlayNext();
            }}
          >
            {nextRecommendation.game.title} →
          </Link>
          {nextRecommendation.explanation && (
            <span className={styles.quickNextReason}>
              {nextRecommendation.explanation}
            </span>
          )}
        </div>
      )}

      <Link
        href="/"
        className={styles.quickReturn}
        onClick={onReturnToHub}
      >
        Voltar ao Hub
      </Link>
    </div>
  );
}

export type {
  ResultSummaryProps,
  NextGameRecommendationProps,
  ShareCtaProps,
  CampaignCtaProps,
  PostGameLoopProps,
  CompactPostGameProps,
};

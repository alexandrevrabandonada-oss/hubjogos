'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CampaignMark } from '@/components/campaign/CampaignMark';
import { OutcomeCtaConfig } from '@/lib/games/ctas';
import { MicroFeedback } from '@/components/ui/MicroFeedback';
import { getNextGameRecommendations } from '@/lib/games/recommendations';
import { getGameBySlug } from '@/lib/games/catalog';
import { saveProgression, loadProgression } from '@/lib/hub/progression';
import { trackProgressionEvent } from '@/lib/hub/analytics';
import { recommendNextGame } from '@/lib/hub/recommendation';
import {
  trackLinkCopy,
  trackCampaignMarkClick,
  trackOutcomeView,
  trackOutcomeReplayIntent,
  trackNextSeriesExperienceClick,
  trackPrimaryCtaClick,
  trackReplayClick,
  trackReturnToHubAfterOutcome,
  trackSecondaryCtaClick,
  trackNextGameClick,
  trackHubReturnClick,
  trackReplayAfterRunClick,
  trackNextGameAfterRunClick,
} from '@/lib/analytics/track';
import { resolveExperimentVariantClient } from '@/lib/experiments/client';
import styles from './GameOutcome.module.css';

interface GameOutcomeProps {
  eyebrow?: string;
  title: string;
  revelation: string;
  nextAction: string;
  summary: string;
  ctas: OutcomeCtaConfig;
  onRestart: () => void;
  onCopySummary?: () => Promise<void>;
  onCopyLink?: () => Promise<void>;
  onCtaClick?: (ctaId: string) => Promise<void>;
  game: { slug: string; kind: string };
  resultId?: string;
}

export function GameOutcome({
  eyebrow = 'Resultado da experiência',
  title,
  revelation,
  nextAction,
  summary,
  ctas,
  onRestart,
  onCopySummary,
  onCopyLink,
  onCtaClick,
  game,
  resultId,
}: GameOutcomeProps) {
  const [feedback, setFeedback] = useState('');
  const [primaryLabel, setPrimaryLabel] = useState(ctas.primary.label);
  const [nextGames, setNextGames] = useState<ReturnType<typeof getNextGameRecommendations>>([]);

  useEffect(() => {
    if (resultId) {
      trackOutcomeView(game as any, resultId).catch(console.error);
      // Progression: mark game as completed, update last session, fire analytics
      try {
        const progression = loadProgression();
        // Add to completedGames (dedupe)
        const updatedCompleted = progression.completedGames.includes(game.slug)
          ? progression.completedGames
          : [...progression.completedGames, game.slug];
        saveProgression({
          completedGames: updatedCompleted,
          lastSession: Date.now(),
        });
        trackProgressionEvent('completion_state_seen', {
          game_slug: game.slug,
          progression_state: 'completed',
        });
      } catch (e) {
        // ignore
      }
    }
  }, [game, resultId]);

  useEffect(() => {
    const fullGame = getGameBySlug(game.slug);
    if (fullGame) {
      // Use new recommendation logic if available
      // For demo: recommend one next game
      // TODO: Replace with editorial logic as needed
      const allGames = typeof window !== 'undefined' ? (window.__ALL_GAMES__ || []) : [];
      let rec = null;
      if (allGames.length > 0) {
        rec = recommendNextGame(allGames, game.slug);
      }
      if (rec) {
        setNextGames([{ game: rec, reason: 'Recomendado para você' }]);
      } else {
        const recommendations = getNextGameRecommendations(fullGame);
        setNextGames(recommendations);
      }
    }
  }, [game.slug]);

  useEffect(() => {
    const variant = resolveExperimentVariantClient('outcome-primary-cta-copy', 'explore-next');
    if (variant === 'continue-journey') {
      setPrimaryLabel('Continuar jornada');
      return;
    }

    setPrimaryLabel(ctas.primary.label);
  }, [ctas.primary.label]);

  async function handleCopySummary() {
    try {
      if (onCopySummary) {
        await onCopySummary();
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(summary);
      }
      setFeedback('Resumo copiado!');
      setTimeout(() => setFeedback(''), 3000);
    } catch {
      setFeedback('Falha ao copiar.');
    }
  }

  async function handleCopyLink() {
    try {
      if (onCopyLink) {
        await onCopyLink();
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        await trackLinkCopy(game as any);
      }
      setFeedback('Link copiado!');
      setTimeout(() => setFeedback(''), 3000);
    } catch {
      setFeedback('Falha ao copiar.');
    }
  }

  async function trackNavigationByHref(href: string) {
    if (href.startsWith('/play/')) {
      const parts = href.split('/').filter(Boolean);
      const nextSlug = parts.length >= 2 ? parts[1] : 'unknown';
      await trackNextGameClick(game as any, nextSlug).catch(console.error);
      await trackOutcomeReplayIntent(game as any, 'alternate_route').catch(console.error);
      return;
    }

    if (href.startsWith('/explorar') || href === '/') {
      await trackHubReturnClick(game as any, href).catch(console.error);
      await trackReturnToHubAfterOutcome(game as any, href).catch(console.error);
    }
  }

  async function handlePrimaryCtaClick(ctaId: string) {
    await trackPrimaryCtaClick(game as any, ctaId, {
      trackingId: ctas.primary.trackingId || ctaId,
      category: ctas.primary.category || 'exploration',
    }).catch(console.error);
    await trackNavigationByHref(ctas.primary.href);
    if (onCtaClick) {
      await onCtaClick(ctaId);
    }
  }

  async function handleSecondaryCtaClick(ctaId: string) {
    await trackSecondaryCtaClick(game as any, ctaId, {
      trackingId: ctas.secondary.trackingId || ctaId,
      category: ctas.secondary.category || 'related',
    }).catch(console.error);
    await trackNavigationByHref(ctas.secondary.href);

    if (ctaId.startsWith('proxima-serie-') && ctas.secondary.href.startsWith('/play/')) {
      const parts = ctas.secondary.href.split('/').filter(Boolean);
      const targetSlug = parts.length >= 2 ? parts[1] : 'unknown';
      await trackNextSeriesExperienceClick(
        game as any,
        (game as any).series || 'unknown',
        targetSlug,
        (game as any).territoryScope || 'unknown',
      ).catch(console.error);
    }

    if (onCtaClick) {
      await onCtaClick(ctaId);
    }
  }

  async function handleRestart() {
    await trackReplayClick(game as any, 'outcome').catch(console.error);
    await trackOutcomeReplayIntent(game as any, 'replay').catch(console.error);
    await trackReplayAfterRunClick(game as any, 'outcome').catch(console.error);
    onRestart();
  }

  return (
    <Card className={styles.outcome}>
      <span className="eyebrow">{eyebrow}</span>
      <h3>{title}</h3>
      <CampaignMark
        compact
        onClick={() => {
          void trackCampaignMarkClick(game as any, 'outcome-card');
        }}
      />

      <div className={styles.revelation}>
        <strong>Leitura política</strong>
        <p>{revelation}</p>
      </div>

      <div className={styles.nextAction}>
        <strong>Próximo passo recomendado</strong>
        <p>{nextAction}</p>
      </div>

      <div className={styles.feedbackSection}>
        <MicroFeedback gameSlug={game.slug} engineKind={game.kind} />
      </div>

      <div className={styles.summary}>
        <strong>Resumo compartilhável</strong>
        <p>{summary}</p>
      </div>

      <div className={styles.replayCue}>
        <strong>🔁 Quer testar outra estratégia?</strong>
        <p>Troque uma decisão-chave e veja como o resultado muda.</p>
        <Button onClick={handleRestart} className={styles.replayButton}>
          Jogar de novo agora
        </Button>
      </div>

      {nextGames.length > 0 && (
        <div className={styles.nextGamesBlock}>
          <strong>Próximos jogos recomendados</strong>
          <div className={styles.nextGamesGrid}>
            {nextGames.map((rec) => {
              const destination = rec.game.kind === 'arcade' 
                ? `/arcade/${rec.game.slug}` 
                : `/play/${rec.game.slug}`;
              const isArcade = rec.game.kind === 'arcade';
              return (
                <Link
                  key={rec.game.slug}
                  href={destination}
                  className={styles.nextGameCard}
                  onClick={() => {
                    void trackNextGameAfterRunClick(game as any, rec.game.slug, 'outcome');
                    void trackNextGameClick(game as any, rec.game.slug);
                  }}
                >
                  <span className={styles.nextGameIcon}>{rec.game.icon}</span>
                  <div className={styles.nextGameContent}>
                    <h4>{rec.game.title}</h4>
                    <p className={styles.nextGameReason}>{rec.reason}</p>
                    <span className={styles.nextGameBadge}>
                      {isArcade ? '🎮 Arcade' : '⚡ Quick'} • {rec.game.duration}
                    </span>
                  </div>
                  <span className={styles.nextGameCta}>{rec.game.cta} →</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.links}>
        <Link
          href={ctas.primary.href}
          className={styles.primaryLink}
          onClick={() => handlePrimaryCtaClick(ctas.primary.id)}
        >
          {primaryLabel}
        </Link>
        <Link
          href={ctas.secondary.href}
          className={styles.secondaryLink}
          onClick={() => handleSecondaryCtaClick(ctas.secondary.id)}
        >
          {ctas.secondary.label}
        </Link>
      </div>

      <div className={styles.actions}>
        <Button onClick={handleCopySummary} variant="ghost">
          Copiar resumo
        </Button>
        <Button onClick={handleCopyLink} variant="ghost">
          Copiar link
        </Button>
      </div>

      {feedback ? <p className={styles.copyFeedback}>{feedback}</p> : null}
    </Card>
  );
}

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { OutcomeCtaConfig } from '@/lib/games/ctas';
import { MicroFeedback } from '@/components/ui/MicroFeedback';
import {
  trackLinkCopy,
  trackOutcomeView,
  trackPrimaryCtaClick,
  trackSecondaryCtaClick,
  trackNextGameClick,
  trackHubReturnClick,
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

  useEffect(() => {
    if (resultId) {
      trackOutcomeView(game as any, resultId).catch(console.error);
    }
  }, [game, resultId]);

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
      return;
    }

    if (href.startsWith('/explorar') || href === '/') {
      await trackHubReturnClick(game as any, href).catch(console.error);
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
    if (onCtaClick) {
      await onCtaClick(ctaId);
    }
  }

  return (
    <Card className={styles.outcome}>
      <span className="eyebrow">{eyebrow}</span>
      <h3>{title}</h3>

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
        <Button onClick={onRestart}>Reiniciar</Button>
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

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { OutcomeCtaConfig } from '@/lib/games/ctas';
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
}: GameOutcomeProps) {
  const [feedback, setFeedback] = useState('');

  async function handleCopySummary() {
    try {
      if (onCopySummary) {
        await onCopySummary();
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(summary);
      }
      setFeedback('Resumo copiado para a área de transferência.');
    } catch {
      setFeedback('Não foi possível copiar o resumo agora.');
    }
  }

  async function handleCopyLink() {
    try {
      if (onCopyLink) {
        await onCopyLink();
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
      }
      setFeedback('Link copiado para a área de transferência.');
    } catch {
      setFeedback('Não foi possível copiar o link agora.');
    }
  }

  async function handleCtaClick(ctaId: string) {
    if (!onCtaClick) {
      return;
    }
    await onCtaClick(ctaId);
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
        <strong>Próximo passo</strong>
        <p>{nextAction}</p>
      </div>

      <div className={styles.summary}>
        <strong>Resumo compartilhável</strong>
        <p>{summary}</p>
      </div>

      <div className={styles.links}>
        <Link
          href={ctas.primary.href}
          className={styles.primaryLink}
          onClick={() => handleCtaClick(ctas.primary.id)}
        >
          {ctas.primary.label}
        </Link>
        <Link
          href={ctas.secondary.href}
          className={styles.secondaryLink}
          onClick={() => handleCtaClick(ctas.secondary.id)}
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

      {feedback ? <p className={styles.feedback}>{feedback}</p> : null}
    </Card>
  );
}

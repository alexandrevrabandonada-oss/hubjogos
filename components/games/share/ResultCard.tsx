/**
 * Share Card Component
 * Card visual para compartilhamento de resultado
 */

'use client';

import { games } from '@/lib/games/catalog';
import styles from './ResultCard.module.css';

interface ResultCardProps {
  gameSlug: string;
  resultTitle: string;
  resultId: string;
  summary: string;
}

export function ResultCard({ gameSlug, resultTitle, resultId, summary }: ResultCardProps) {
  const game = games.find((g) => g.slug === gameSlug);

  if (!game) {
    return <div className={styles.error}>Jogo não encontrado</div>;
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.gameIcon}>{game.icon}</div>
        <div className={styles.gameInfo}>
          <h2 className={styles.gameTitle}>{game.title}</h2>
          <p className={styles.subtitle}>Hub de Jogos da Pré-Campanha</p>
        </div>
      </div>

      <div className={styles.result}>
        <h3 className={styles.resultTitle}>{resultTitle}</h3>
        <p className={styles.summary}>{summary}</p>
      </div>

      <div className={styles.footer}>
        <p className={styles.cta}>{game.cta}</p>
        <p className={styles.attribution}>Experimente em jogo.precamp.com</p>
      </div>

      <div className={styles.watermark}>
        Resultado #{resultId.slice(0, 8)}
      </div>
    </div>
  );
}

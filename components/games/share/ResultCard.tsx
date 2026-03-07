/**
 * Share Card Component
 * Card visual para compartilhamento de resultado
 * Agora usa o sistema universal FinalShareCard
 */

'use client';

import { games } from '@/lib/games/catalog';
import { FinalShareCard } from '@/components/campaign/FinalShareCard';
import styles from './ResultCard.module.css';

interface ResultCardProps {
  gameSlug: string;
  resultTitle: string;
  resultId: string;
  summary: string;
  onQrClick?: () => void;
  showQR?: boolean;
}

export function ResultCard({ 
  gameSlug, 
  resultTitle, 
  resultId, 
  summary, 
  onQrClick, 
  showQR = true 
}: ResultCardProps) {
  const game = games.find((g) => g.slug === gameSlug);

  if (!game) {
    return <div className={styles.error}>Jogo não encontrado</div>;
  }

  return (
    <FinalShareCard
      game={game}
      resultTitle={resultTitle}
      resultSummary={summary}
      resultId={resultId}
      showAvatar={true}
      showQR={showQR}
      onQrClick={onQrClick}
    />
  );
}

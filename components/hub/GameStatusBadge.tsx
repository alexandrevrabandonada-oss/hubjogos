import React from 'react';
import styles from './GameStatusBadge.module.css';
import { GameStatus } from '@/lib/games/catalog';

interface GameStatusBadgeProps {
  status: GameStatus | 'pre-production' | 'cold-backlog';
  className?: string;
}

export function GameStatusBadge({ status, className = '' }: GameStatusBadgeProps) {
  const labels: Record<string, string> = {
    live: 'Live',
    beta: 'Beta Público',
    coming: 'Em Breve',
    'pre-production': 'Pré-Produção',
    'cold-backlog': 'Arquivo Frio',
  };

  return (
    <span className={`${styles.badge} ${styles[status]} ${className}`}>
      {labels[status] || status}
    </span>
  );
}

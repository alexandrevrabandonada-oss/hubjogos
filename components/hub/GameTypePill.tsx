import React from 'react';
import styles from './GameTypePill.module.css';

interface GameTypePillProps {
  kind: 'arcade' | 'quick' | 'narrative' | 'simulation' | 'map' | 'quiz' | 'future-flagship' | 'branching_story';
  className?: string;
}

export function GameTypePill({ kind, className = '' }: GameTypePillProps) {
  let label = 'Jogo';
  let icon = '🎮';
  let variant = 'default';

  if (kind === 'arcade') {
    label = 'Arcade Line';
    icon = '🔥';
    variant = 'arcade';
  } else if (kind === 'quick' || kind === 'quiz') {
    label = 'Quick Line';
    icon = '⚡';
    variant = 'quick';
  } else if (kind === 'future-flagship') {
    label = 'Médio/Futuro';
    icon = '🏗️';
    variant = 'future';
  } else {
    label = kind.charAt(0).toUpperCase() + kind.slice(1);
    variant = 'session';
  }

  return (
    <span className={`${styles.pill} ${styles[variant]} ${className}`}>
      <span className={styles.icon}>{icon}</span> {label}
    </span>
  );
}

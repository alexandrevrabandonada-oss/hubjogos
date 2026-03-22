import React from 'react';
import styles from './GameRoleLabel.module.css';

interface GameRoleLabelProps {
  role: 'entrada' | 'retencao' | 'aprofundamento' | string;
  className?: string;
}

export function GameRoleLabel({ role, className = '' }: GameRoleLabelProps) {
  const map: Record<string, { label: string; tone: string }> = {
    entrada: { label: 'Porta de Entrada', tone: 'entry' },
    retencao: { label: 'Retenção & Replay', tone: 'core' },
    aprofundamento: { label: 'Aprofundamento', tone: 'deep' },
  };

  const lookup = map[role] || { label: role, tone: 'default' };

  return (
    <span className={`${styles.roleLabel} ${styles[lookup.tone]} ${className}`}>
      {lookup.label}
    </span>
  );
}

// Subtle status/completion badge for game cards and surfaces
import React from 'react';

export type ProgressionBadgeType =
  | 'novo'
  | 'jogado'
  | 'concluído'
  | 'recomendado'
  | 'continue'
  | 'curto'
  | 'profundo';

export function ProgressionBadge({ type }: { type: ProgressionBadgeType }) {
  const labelMap: Record<ProgressionBadgeType, string> = {
    novo: 'Novo',
    jogado: 'Jogado',
    concluído: 'Concluído',
    recomendado: 'Recomendado',
    continue: 'Continue',
    curto: 'Curto',
    profundo: 'Profundo',
  };
  return (
    <span className={`progression-badge progression-badge--${type}`}>
      {labelMap[type]}
    </span>
  );
}

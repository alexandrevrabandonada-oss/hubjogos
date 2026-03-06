import type { ExperimentDefinition } from './types';
import type { TimeWindow } from '@/lib/analytics/windowing';

export const scorecardThresholds = {
  minViewsPerVariant: 40,
  minClicksPerPlacement: 25,
  minSessionsPerSource: 20,
  minShareViewsForReentry: 30,
  directionalLiftPct: 15,
  candidateLiftPct: 25,
  stalenessThresholdHours: 72, // 3 days without traffic = stale
} as const;

export type ScorecardStatus =
  | 'insufficient_data'
  | 'monitoring'
  | 'directional_signal'
  | 'inconclusive'
  | 'candidate_winner';

export interface ExperimentVariantReading {
  key: string;
  label?: string;
  sessions: number;
  completions: number;
  completionRate: number;
  primaryValue: number;
}

export interface ExperimentScorecard {
  key: string;
  name: string;
  primaryMetric: string;
  affectedSurface: string;
  variants: ExperimentVariantReading[];
  sampleMinReached: boolean;
  minSamplePerVariant: number;
  bestVariantKey: string | null;
  bestVariantValue: number;
  secondVariantValue: number;
  liftVsSecondPct: number;
  status: ScorecardStatus;
  rationale: string;
  // Tijolo 18: temporal context
  window: TimeWindow;
  lastEventAt: Date | null;
  sampleSize: number;
  freshnessWarnings: string[];
}

interface BuildInput {
  experiment: ExperimentDefinition;
  variants: Array<{
    key: string;
    sessions: number;
    completions: number;
    completionRate: number;
  }>;
  window?: TimeWindow;
  lastEventAt?: Date | null;
}

function sortByPrimaryValueDesc(items: ExperimentVariantReading[]) {
  return [...items].sort((a, b) => b.primaryValue - a.primaryValue);
}

function resolvePrimaryValue(metric: string, row: { completionRate: number }) {
  switch (metric) {
    default:
      return row.completionRate;
  }
}

export function buildExperimentScorecard(input: BuildInput): ExperimentScorecard {
  const minSamplePerVariant = scorecardThresholds.minViewsPerVariant;
  const metric = input.experiment.primaryMetric || 'completion_rate';
  const surface = input.experiment.affectedSurface || 'not_specified';
  const window = input.window || 'all';
  const lastEventAt = input.lastEventAt || null;

  const variants: ExperimentVariantReading[] = input.variants.map((row) => {
    const def = input.experiment.variants.find((v) => v.key === row.key);
    return {
      key: row.key,
      label: def?.name,
      sessions: row.sessions,
      completions: row.completions,
      completionRate: row.completionRate,
      primaryValue: resolvePrimaryValue(metric, row),
    };
  });

  const minVariantSample = variants.length
    ? Math.min(...variants.map((variant) => variant.sessions))
    : 0;

  const totalSampleSize = variants.reduce((sum, v) => sum + v.sessions, 0);

  const sorted = sortByPrimaryValueDesc(variants);
  const best = sorted[0];
  const second = sorted[1] || null;
  const liftVsSecondPct = second ? Number((best.primaryValue - second.primaryValue).toFixed(2)) : 0;

  const sampleMinReached = variants.length > 1 && minVariantSample >= minSamplePerVariant;

  // Freshness warnings
  const freshnessWarnings: string[] = [];
  
  if (totalSampleSize === 0) {
    freshnessWarnings.push('Nenhuma sessão registrada nesta janela.');
  }

  if (lastEventAt) {
    const now = new Date();
    const hoursSinceLastEvent = (now.getTime() - lastEventAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastEvent > scorecardThresholds.stalenessThresholdHours) {
      freshnessWarnings.push(`Sem tráfego há ${Math.floor(hoursSinceLastEvent / 24)} dias.`);
    }
  } else if (totalSampleSize > 0) {
    freshnessWarnings.push('Timestamp do último evento não disponível.');
  }

  if (totalSampleSize > 0 && totalSampleSize < minSamplePerVariant) {
    freshnessWarnings.push(`Amostra total (${totalSampleSize}) abaixo do mínimo recomendado.`);
  }

  let status: ScorecardStatus = 'monitoring';
  let rationale = 'Experimento ativo e acumulando dados para leitura comparativa.';

  if (variants.length < 2) {
    status = 'insufficient_data';
    rationale = 'Menos de duas variantes com dados de sessao; ainda nao comparavel.';
  } else if (!sampleMinReached) {
    status = 'insufficient_data';
    rationale = `Amostra minima por variante nao atingida (${minVariantSample}/${minSamplePerVariant}).`;
  } else if (Math.abs(liftVsSecondPct) < 5) {
    status = 'inconclusive';
    rationale = 'Diferenca pequena entre variantes; manter monitoramento.';
  } else if (liftVsSecondPct >= scorecardThresholds.candidateLiftPct && minVariantSample >= minSamplePerVariant * 2) {
    status = 'candidate_winner';
    rationale = 'Sinal forte e consistente, mas ainda sem decisao automatica.';
  } else if (liftVsSecondPct >= scorecardThresholds.directionalLiftPct) {
    status = 'directional_signal';
    rationale = 'Sinal direcional inicial; continuar coleta antes de qualquer decisao.';
  }

  return {
    key: input.experiment.key,
    name: input.experiment.name,
    primaryMetric: metric,
    affectedSurface: surface,
    variants,
    sampleMinReached,
    minSamplePerVariant,
    bestVariantKey: best?.key || null,
    bestVariantValue: best?.primaryValue || 0,
    secondVariantValue: second?.primaryValue || 0,
    liftVsSecondPct,
    status,
    rationale,
    window,
    lastEventAt,
    sampleSize: totalSampleSize,
    freshnessWarnings,
  };
}

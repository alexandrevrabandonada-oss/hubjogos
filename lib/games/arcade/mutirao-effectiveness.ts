/**
 * Helpers de leitura de efetividade do Mutirão do Bairro (T36C)
 * 
 * Calcula métricas específicas de performance e engagement do arcade de coordenação territorial.
 */

import type { AnalyticsEventPayload } from '@/lib/analytics/events';

export interface MutiraoEffectivenessMetrics {
  totalRuns: number;
  collapseCount: number;
  survivalCount: number;
  collapseRate: number;
  avgPressurePeak: number;
  avgScore: number;
  totalActions: number;
  actionBreakdown: {
    reparar: number;
    defender: number;
    mobilizar: number;
    mutirao: number;
  };
  actionDiversity: number; // 0-100, quanto mais equilibrado, melhor
  mostUsedAction: string;
  avgDurationMs: number;
  replayRate: number;
  eventCount: number;
  eventBreakdown: {
    chuvaForte: number;
    boatoPanico: number;
    ondaSolidaria: number;
    trancoSabotagem: number;
  };
  pressureMilestones: {
    peak55: number;
    peak70: number;
    peak85: number;
  };
  collectiveRate: number; // média das collective rates de todas as runs
}

export function calculateMutiraoEffectiveness(events: AnalyticsEventPayload[]): MutiraoEffectivenessMetrics {
  const mutiraoRunStarts = events.filter((e) => e.event === 'arcade_run_start' && e.slug === 'mutirao-do-bairro');
  const mutiraoRunEnds = events.filter((e) => e.event === 'arcade_run_end' && e.slug === 'mutirao-do-bairro');
  const mutiraoScores = events.filter((e) => e.event === 'arcade_score' && e.slug === 'mutirao-do-bairro');
  const mutiraoActions = events.filter((e) => e.event === 'mutirao_action_used');
  const mutiraoEvents = events.filter((e) => e.event === 'mutirao_event_triggered');
  const mutiraoPeaks = events.filter((e) => e.event === 'mutirao_pressure_peak');
  const mutiraoReplays = events.filter((e) => e.event === 'arcade_replay_click' && e.slug === 'mutirao-do-bairro');

  const totalRuns = mutiraoRunStarts.length;
  const completedRuns = mutiraoRunEnds.length;

  // Collapse vs Survival - inferido via metadata de runs
  let collapseCount = 0;
  let survivalCount = 0;
  let totalCollectiveRate = 0;
  let totalDurationMs = 0;

  for (const run of mutiraoScores) {
    const metadata = run.metadata || {};
    const collectiveRate = (metadata.collectiveRate as number) || 0;
    const durationMs = (metadata.durationMs as number) || 0;
    
    totalCollectiveRate += collectiveRate;
    totalDurationMs += durationMs;

    // Inferência de collapse: runs muito curtas (< 60s) ou collectiveRate muito baixo
    if (durationMs < 60000 || collectiveRate < 40) {
      collapseCount += 1;
    } else {
      survivalCount += 1;
    }
  }

  const collapseRate = totalRuns > 0 ? Math.round((collapseCount / totalRuns) * 100) : 0;
  const avgCollectiveRate = completedRuns > 0 ? Math.round(totalCollectiveRate / completedRuns) : 0;
  const avgDurationMs = completedRuns > 0 ? Math.round(totalDurationMs / completedRuns) : 0;

  // Pressure peaks
  const pressureValues: number[] = [];
  let peak55 = 0;
  let peak70 = 0;
  let peak85 = 0;

  for (const peak of mutiraoPeaks) {
    const value = (peak.metadata?.peak as number) || 0;
    const milestone = (peak.metadata?.milestone as number) || 0;
    pressureValues.push(value);

    if (milestone >= 1) peak55 += 1;
    if (milestone >= 2) peak70 += 1;
    if (milestone >= 3) peak85 += 1;
  }

  const avgPressurePeak =
    pressureValues.length > 0
      ? Math.round(pressureValues.reduce((sum, p) => sum + p, 0) / pressureValues.length)
      : 0;

  // Score médio
  const scores = mutiraoScores.map((e) => (e.metadata?.score as number) || 0);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : 0;

  // Ações
  const actionBreakdown = {
    reparar: 0,
    defender: 0,
    mobilizar: 0,
    mutirao: 0,
  };

  for (const action of mutiraoActions) {
    const actionId = action.metadata?.actionId || '';
    if (actionId === 'reparar') actionBreakdown.reparar += 1;
    else if (actionId === 'defender') actionBreakdown.defender += 1;
    else if (actionId === 'mobilizar') actionBreakdown.mobilizar += 1;
    else if (actionId === 'ativar-mutirao') actionBreakdown.mutirao += 1;
  }

  const totalActions = Object.values(actionBreakdown).reduce((sum, count) => sum + count, 0);

  // Diversidade de ações (mais próximo de 25% cada = 100, concentrado em uma = 0)
  const actionCounts = Object.values(actionBreakdown);
  const maxCount = Math.max(...actionCounts, 1);
  const minCount = Math.min(...actionCounts.filter((c) => c > 0), 1);
  const diversity = totalActions > 0 ? Math.round((minCount / maxCount) * 100) : 0;

  const mostUsedAction =
    Object.entries(actionBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'nenhuma';

  // Eventos
  const eventBreakdown = {
    chuvaForte: 0,
    boatoPanico: 0,
    ondaSolidaria: 0,
    trancoSabotagem: 0,
  };

  for (const evt of mutiraoEvents) {
    const eventId = evt.metadata?.eventId || '';
    if (eventId === 'chuva-forte') eventBreakdown.chuvaForte += 1;
    else if (eventId === 'boato-de-panico') eventBreakdown.boatoPanico += 1;
    else if (eventId === 'onda-solidaria') eventBreakdown.ondaSolidaria += 1;
    else if (eventId === 'tranco-de-sabotagem') eventBreakdown.trancoSabotagem += 1;
  }

  const eventCount = mutiraoEvents.length;

  // Replay rate
  const replayRate = totalRuns > 0 ? Math.round((mutiraoReplays.length / totalRuns) * 100) : 0;

  return {
    totalRuns,
    collapseCount,
    survivalCount,
    collapseRate,
    avgPressurePeak,
    avgScore,
    totalActions,
    actionBreakdown,
    actionDiversity: diversity,
    mostUsedAction,
    avgDurationMs,
    replayRate,
    eventCount,
    eventBreakdown,
    pressureMilestones: {
      peak55,
      peak70,
      peak85,
    },
    collectiveRate: avgCollectiveRate,
  };
}

export function compareMutiraoVsTarifaZero(
  mutiraoMetrics: MutiraoEffectivenessMetrics,
  tarifaZeroAvgScore: number,
  tarifaZeroReplayRate: number,
): {
  mutiraoEngagement: 'higher' | 'similar' | 'lower';
  scoreComparison: string;
  replayComparison: string;
  recommendation: string;
} {
  const mutiraoEngagement =
    mutiraoMetrics.replayRate > tarifaZeroReplayRate + 10
      ? 'higher'
      : mutiraoMetrics.replayRate < tarifaZeroReplayRate - 10
      ? 'lower'
      : 'similar';

  const scoreComparison =
    mutiraoMetrics.avgScore > tarifaZeroAvgScore
      ? `Mutirão tem score ${Math.round(((mutiraoMetrics.avgScore - tarifaZeroAvgScore) / tarifaZeroAvgScore) * 100)}% maior`
      : mutiraoMetrics.avgScore < tarifaZeroAvgScore
      ? `Tarifa Zero tem score ${Math.round(((tarifaZeroAvgScore - mutiraoMetrics.avgScore) / mutiraoMetrics.avgScore) * 100)}% maior`
      : 'Scores similares';

  const replayComparison =
    mutiraoMetrics.replayRate > tarifaZeroReplayRate
      ? `Mutirão tem replay ${mutiraoMetrics.replayRate - tarifaZeroReplayRate}pp maior`
      : mutiraoMetrics.replayRate < tarifaZeroReplayRate
      ? `Tarifa Zero tem replay ${tarifaZeroReplayRate - mutiraoMetrics.replayRate}pp maior`
      : 'Replay similar';

  const recommendation =
    mutiraoMetrics.collapseRate > 60
      ? 'Revisar curva de dificuldade do Mutirão (collapse rate alto).'
      : mutiraoMetrics.actionDiversity < 40
      ? 'Promover diversidade de ações (jogadores focando muito em uma só).'
      : mutiraoEngagement === 'lower'
      ? 'Investigar UX/onboarding do Mutirão.'
      : 'Mutirão performando bem, manter monitoramento.';

  return {
    mutiraoEngagement,
    scoreComparison,
    replayComparison,
    recommendation,
  };
}

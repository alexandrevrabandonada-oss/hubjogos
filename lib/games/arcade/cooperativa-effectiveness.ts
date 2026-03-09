import type { AnalyticsEventPayload } from '@/lib/analytics/events';

export type CooperativaDecisionStatus =
  | 'insufficient_live_usage'
  | 'needs_more_tuning'
  | 'promising_but_unstable'
  | 'premium_candidate'
  | 'ready_for_premium_pass';

export type CooperativaFinalDecision =
  | 'promote_to_premium_pass'
  | 'run_one_more_tuning_cycle'
  | 'keep_observing';

export interface CooperativaEffectivenessMetrics {
  runs: number;
  runEnds: number;
  effectiveRuns: number;
  survivalCount: number;
  collapseCount: number;
  survivalRate: number;
  collectivityRate: number;
  mutiraoUsageRate: number;
  replayRate: number;
  postRunCtaRate: number;
  firstInputAvgMs: number;
  actionBreakdown: Record<string, number>;
  mostUsedAction: string;
  phaseReached: Record<string, number>;
  phaseReachedRate: Record<string, number>;
  collapseReasons: Array<{ reason: string; count: number; rate: number }>;
  topCollapseReason: string;
  topCollapseReasonPct: number;
  stationOverload: Record<string, number>;
  mostCriticalStation: string;
}

export interface CooperativaDecisionReadout {
  status: CooperativaDecisionStatus;
  finalDecision: CooperativaFinalDecision;
  recommendation: string;
  rationale: string;
}

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function pct(numerator: number, denominator: number) {
  if (denominator <= 0) {
    return 0;
  }
  return Math.round((numerator / denominator) * 100);
}

export function calculateCooperativaEffectiveness(events: AnalyticsEventPayload[]): CooperativaEffectivenessMetrics {
  const cooperativaEvents = events.filter((event) => event.slug === 'cooperativa-na-pressao');

  const runStarts = cooperativaEvents.filter((event) => event.event === 'arcade_run_start');
  const runEnds = cooperativaEvents.filter((event) => event.event === 'arcade_run_end');
  const replayClicks = cooperativaEvents.filter((event) => event.event === 'arcade_replay_click');
  const postRunCtas = cooperativaEvents.filter(
    (event) => event.event === 'arcade_campaign_cta_click' || event.event === 'campaign_cta_click_after_run',
  );
  const firstInputs = cooperativaEvents.filter((event) => event.event === 'arcade_first_input_time');
  const collapseEvents = cooperativaEvents.filter((event) => event.event === 'cooperativa_collapse_reason');
  const mutiraoEvents = cooperativaEvents.filter((event) => event.event === 'cooperativa_mutirao_activated');

  const actionBreakdown: Record<string, number> = {
    'organizar-turno': 0,
    'redistribuir-esforco': 0,
    'cuidar-equipe': 0,
    'mutirao-cooperativo': 0,
  };

  const phaseReached: Record<string, number> = {
    abertura: 0,
    escalada: 0,
    pressao: 0,
    final: 0,
  };

  const collapseReasonsCounter: Record<string, number> = {
    estabilidade: 0,
    solidariedade: 0,
    pressao: 0,
    unknown: 0,
  };

  const stationOverload: Record<string, number> = {
    montagem: 0,
    logistica: 0,
    cuidado: 0,
    unknown: 0,
  };

  for (const event of cooperativaEvents) {
    if (event.event === 'cooperativa_action_used') {
      const actionId = String(event.metadata?.actionId || '');
      if (actionId in actionBreakdown) {
        actionBreakdown[actionId] += 1;
      }
    }

    if (event.event === 'cooperativa_phase_reached') {
      const phase = String(event.metadata?.phase || '');
      if (phase in phaseReached) {
        phaseReached[phase] += 1;
      }
    }

    if (event.event === 'cooperativa_collapse_reason') {
      const reason = String(event.metadata?.reason || 'unknown');
      if (reason in collapseReasonsCounter) {
        collapseReasonsCounter[reason] += 1;
      } else {
        collapseReasonsCounter.unknown += 1;
      }
    }

    if (event.event === 'cooperativa_station_selected' && event.metadata?.overload === true) {
      const stationId = String(event.metadata?.stationId || 'unknown');
      if (stationId in stationOverload) {
        stationOverload[stationId] += 1;
      } else {
        stationOverload.unknown += 1;
      }
    }
  }

  const runEndBySession = new Set(runEnds.map((event) => event.sessionId));
  const collapsedSessionIds = new Set(collapseEvents.map((event) => event.sessionId));

  const collectivityValues = runEnds
    .map((event) => toNumber(event.metadata?.collectiveRate))
    .filter((value) => value > 0);

  const firstInputValues = firstInputs
    .map((event) => toNumber(event.metadata?.msSinceStart))
    .filter((value) => value > 0);

  const collapseReasons = Object.entries(collapseReasonsCounter)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => ({ reason, count, rate: pct(count, Math.max(1, collapseEvents.length)) }));

  const runs = Math.max(runStarts.length, runEnds.length);
  const runEndsCount = runEnds.length;
  const collapseCount = runEndBySession.size > 0 ? Array.from(collapsedSessionIds).filter((id) => runEndBySession.has(id)).length : collapseEvents.length;
  const survivalCount = Math.max(0, runEndsCount - collapseCount);

  return {
    runs,
    runEnds: runEndsCount,
    effectiveRuns: 0,
    survivalCount,
    collapseCount,
    survivalRate: pct(survivalCount, Math.max(1, runEndsCount)),
    collectivityRate:
      collectivityValues.length > 0
        ? Math.round(collectivityValues.reduce((sum, value) => sum + value, 0) / collectivityValues.length)
        : 0,
    mutiraoUsageRate: pct(mutiraoEvents.length, Math.max(1, runEndsCount)),
    replayRate: pct(replayClicks.length, Math.max(1, runEndsCount)),
    postRunCtaRate: pct(postRunCtas.length, Math.max(1, runEndsCount)),
    firstInputAvgMs:
      firstInputValues.length > 0
        ? Math.round(firstInputValues.reduce((sum, value) => sum + value, 0) / firstInputValues.length)
        : 0,
    actionBreakdown,
    mostUsedAction: Object.entries(actionBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none',
    phaseReached,
    phaseReachedRate: {
      abertura: pct(phaseReached.abertura, Math.max(1, runs)),
      escalada: pct(phaseReached.escalada, Math.max(1, runs)),
      pressao: pct(phaseReached.pressao, Math.max(1, runs)),
      final: pct(phaseReached.final, Math.max(1, runs)),
    },
    collapseReasons,
    topCollapseReason: collapseReasons[0]?.reason || 'none',
    topCollapseReasonPct: collapseReasons[0]?.rate || 0,
    stationOverload,
    mostCriticalStation:
      Object.entries(stationOverload)
        .filter(([station]) => station !== 'unknown')
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none',
  };
}

export function resolveCooperativaDecision(metrics: CooperativaEffectivenessMetrics): CooperativaDecisionReadout {
  const runs = metrics.runs;

  if (runs < 20) {
    return {
      status: 'insufficient_live_usage',
      finalDecision: 'keep_observing',
      recommendation: 'Manter observacao por mais 7 dias antes de qualquer premium pass.',
      rationale: `Amostra insuficiente: ${runs}/20 runs minimas.`,
    };
  }

  if (
    runs >= 70 &&
    metrics.survivalRate >= 62 &&
    metrics.collectivityRate >= 68 &&
    metrics.mutiraoUsageRate >= 35 &&
    metrics.replayRate >= 18 &&
    metrics.postRunCtaRate >= 12 &&
    metrics.firstInputAvgMs > 0 &&
    metrics.firstInputAvgMs <= 2200 &&
    metrics.phaseReachedRate.final >= 45 &&
    metrics.topCollapseReasonPct <= 45
  ) {
    return {
      status: 'ready_for_premium_pass',
      finalDecision: 'promote_to_premium_pass',
      recommendation: 'Promover para premium pass incremental sem abrir novo jogo.',
      rationale: 'Sinais de estabilidade e força de campanha consolidados.',
    };
  }

  if (
    runs >= 45 &&
    metrics.survivalRate >= 55 &&
    metrics.collectivityRate >= 62 &&
    metrics.mutiraoUsageRate >= 25 &&
    metrics.replayRate >= 14 &&
    metrics.postRunCtaRate >= 8 &&
    (metrics.firstInputAvgMs === 0 || metrics.firstInputAvgMs <= 2600)
  ) {
    return {
      status: 'premium_candidate',
      finalDecision: 'run_one_more_tuning_cycle',
      recommendation: 'Rodar uma rodada curta de tuning orientada a colapso/replay e reavaliar.',
      rationale: 'Sinal promissor, ainda sem robustez para premiumizar agora.',
    };
  }

  if (
    metrics.survivalRate < 45 ||
    metrics.collectivityRate < 55 ||
    metrics.replayRate < 10 ||
    metrics.phaseReachedRate.final < 25 ||
    metrics.topCollapseReasonPct >= 60
  ) {
    return {
      status: 'needs_more_tuning',
      finalDecision: 'run_one_more_tuning_cycle',
      recommendation: 'Aplicar tuning leve focado no gargalo dominante e validar por 7 dias.',
      rationale: 'Bottlenecks de estabilidade/engajamento ainda evidentes.',
    };
  }

  return {
    status: 'promising_but_unstable',
    finalDecision: 'keep_observing',
    recommendation: 'Manter observacao por mais uma janela para evitar decisao precoce.',
    rationale: 'Sinal positivo, mas ainda instavel para premium pass.',
  };
}

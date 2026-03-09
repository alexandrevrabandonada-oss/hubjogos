function normalizeMetadata(metadata) {
  if (!metadata) {
    return {};
  }

  if (typeof metadata === 'string') {
    try {
      const parsed = JSON.parse(metadata);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  return typeof metadata === 'object' ? metadata : {};
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function roundPct(numerator, denominator) {
  if (denominator <= 0) {
    return 0;
  }
  return Math.round((numerator / denominator) * 100);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getEffectiveRunsForCooperativa(effectiveRuns) {
  const rows = effectiveRuns?.topEffectiveRunsByGame || [];
  const hit = rows.find((row) => row.slug === 'cooperativa-na-pressao');
  return hit ? toNumber(hit.effectiveRuns) : 0;
}

function computeDecision(scorecard) {
  const MIN_LIVE_RUNS = 20;
  const MIN_PREMIUM_RUNS = 45;
  const MIN_READY_RUNS = 70;

  const runs = scorecard.runs;

  if (runs < MIN_LIVE_RUNS) {
    return {
      status: 'insufficient_live_usage',
      finalDecision: 'keep_observing',
      rationale: `Amostra real insuficiente para decidir premium (${runs}/${MIN_LIVE_RUNS} runs).`,
      recommendation: 'Manter observacao por mais uma janela de 7 dias com foco em run_end, replay e CTA pos-run.',
      thresholds: {
        minLiveRuns: MIN_LIVE_RUNS,
        minPremiumRuns: MIN_PREMIUM_RUNS,
        minReadyRuns: MIN_READY_RUNS,
      },
    };
  }

  const readySignals =
    runs >= MIN_READY_RUNS &&
    scorecard.survivalRate >= 62 &&
    scorecard.collectivityRate >= 68 &&
    scorecard.mutiraoUsageRate >= 35 &&
    scorecard.replayRate >= 18 &&
    scorecard.postRunCtaRate >= 12 &&
    scorecard.firstInputAvgMs > 0 &&
    scorecard.firstInputAvgMs <= 2200 &&
    scorecard.phaseReachedRate.final >= 45 &&
    scorecard.topCollapseReasonPct <= 45;

  if (readySignals) {
    return {
      status: 'ready_for_premium_pass',
      finalDecision: 'promote_to_premium_pass',
      rationale: 'Sinais de estabilidade e campanha sustentam premium pass com risco operacional controlado.',
      recommendation: 'Promover para premium pass e iniciar escopo visual/audio premium incremental sem abrir novo jogo.',
      thresholds: {
        minLiveRuns: MIN_LIVE_RUNS,
        minPremiumRuns: MIN_PREMIUM_RUNS,
        minReadyRuns: MIN_READY_RUNS,
      },
    };
  }

  const premiumCandidateSignals =
    runs >= MIN_PREMIUM_RUNS &&
    scorecard.survivalRate >= 55 &&
    scorecard.collectivityRate >= 62 &&
    scorecard.mutiraoUsageRate >= 25 &&
    scorecard.replayRate >= 14 &&
    scorecard.postRunCtaRate >= 8 &&
    (scorecard.firstInputAvgMs === 0 || scorecard.firstInputAvgMs <= 2600) &&
    scorecard.phaseReachedRate.pressao >= 55;

  if (premiumCandidateSignals) {
    return {
      status: 'premium_candidate',
      finalDecision: 'run_one_more_tuning_cycle',
      rationale: 'Jogo com sinais de candidato premium, mas ainda sem robustez suficiente para promover agora.',
      recommendation: 'Executar ciclo curto de tuning guiado por dados e reavaliar em 7 dias.',
      thresholds: {
        minLiveRuns: MIN_LIVE_RUNS,
        minPremiumRuns: MIN_PREMIUM_RUNS,
        minReadyRuns: MIN_READY_RUNS,
      },
    };
  }

  const unstableSignals =
    scorecard.survivalRate < 45 ||
    scorecard.collectivityRate < 55 ||
    scorecard.replayRate < 10 ||
    scorecard.phaseReachedRate.final < 25 ||
    scorecard.topCollapseReasonPct >= 60;

  if (unstableSignals) {
    return {
      status: 'needs_more_tuning',
      finalDecision: 'run_one_more_tuning_cycle',
      rationale: 'Ha gargalos de estabilidade/compreensao no loop que pedem ajuste leve antes de premiumizacao.',
      recommendation: 'Rodar uma rodada curta de tuning focada no principal gargalo observado e manter telemetria ativa.',
      thresholds: {
        minLiveRuns: MIN_LIVE_RUNS,
        minPremiumRuns: MIN_PREMIUM_RUNS,
        minReadyRuns: MIN_READY_RUNS,
      },
    };
  }

  return {
    status: 'promising_but_unstable',
    finalDecision: 'keep_observing',
    rationale: 'Sinais promissores, mas sem estabilidade consistente para decidir premium ou tuning agora.',
    recommendation: 'Manter observacao por mais 7 dias e reavaliar com foco em replay, CTA e colapsos.',
    thresholds: {
      minLiveRuns: MIN_LIVE_RUNS,
      minPremiumRuns: MIN_PREMIUM_RUNS,
      minReadyRuns: MIN_READY_RUNS,
    },
  };
}

function buildCooperativaInsights(events = [], effectiveRuns) {
  const relevantEvents = events.filter((event) => {
    const slug = event.slug;
    const metadata = normalizeMetadata(event.metadata);
    return slug === 'cooperativa-na-pressao' || metadata.arcadeSlug === 'cooperativa-na-pressao';
  });

  const runStarts = relevantEvents.filter((event) => event.event_name === 'arcade_run_start');
  const runEnds = relevantEvents.filter((event) => event.event_name === 'arcade_run_end');
  const firstInputs = relevantEvents.filter((event) => event.event_name === 'arcade_first_input_time');
  const replayClicks = relevantEvents.filter((event) => event.event_name === 'arcade_replay_click');
  const campaignCtaClicks = relevantEvents.filter(
    (event) => event.event_name === 'arcade_campaign_cta_click' || event.event_name === 'campaign_cta_click_after_run',
  );

  const actionBreakdown = {
    'organizar-turno': 0,
    'redistribuir-esforco': 0,
    'cuidar-equipe': 0,
    'mutirao-cooperativo': 0,
  };

  const phaseReached = {
    abertura: 0,
    escalada: 0,
    pressao: 0,
    final: 0,
  };

  const collapseReasons = {
    estabilidade: 0,
    solidariedade: 0,
    pressao: 0,
    unknown: 0,
  };

  const stationOverload = {
    montagem: 0,
    logistica: 0,
    cuidado: 0,
    unknown: 0,
  };

  const pressurePeaks = [];

  let mutiraoActivations = 0;

  for (const event of relevantEvents) {
    const metadata = normalizeMetadata(event.metadata);

    if (event.event_name === 'cooperativa_action_used') {
      const actionId = String(metadata.actionId || '');
      if (actionId in actionBreakdown) {
        actionBreakdown[actionId] += 1;
      }
    }

    if (event.event_name === 'cooperativa_phase_reached') {
      const phase = String(metadata.phase || '');
      if (phase in phaseReached) {
        phaseReached[phase] += 1;
      }
    }

    if (event.event_name === 'cooperativa_collapse_reason') {
      const reason = String(metadata.reason || 'unknown');
      if (reason in collapseReasons) {
        collapseReasons[reason] += 1;
      } else {
        collapseReasons.unknown += 1;
      }
    }

    if (event.event_name === 'cooperativa_station_selected' && metadata.overload === true) {
      const stationId = String(metadata.stationId || 'unknown');
      if (stationId in stationOverload) {
        stationOverload[stationId] += 1;
      } else {
        stationOverload.unknown += 1;
      }
    }

    if (event.event_name === 'cooperativa_pressure_peak') {
      pressurePeaks.push(toNumber(metadata.peak));
    }

    if (event.event_name === 'cooperativa_mutirao_activated') {
      mutiraoActivations += 1;
    }
  }

  const runEndsWithCollapse = new Set(
    relevantEvents
      .filter((event) => event.event_name === 'cooperativa_collapse_reason')
      .map((event) => event.session_id)
      .filter(Boolean),
  );

  const runEndsCount = runEnds.length;
  const runs = Math.max(runStarts.length, runEndsCount);
  const survivalCount = Math.max(0, runEndsCount - runEndsWithCollapse.size);
  const collapseCount = runEndsWithCollapse.size;

  const collectiveRates = runEnds
    .map((event) => toNumber(normalizeMetadata(event.metadata).collectiveRate))
    .filter((value) => value > 0);
  const collectivityRate =
    collectiveRates.length > 0
      ? Math.round(collectiveRates.reduce((sum, value) => sum + value, 0) / collectiveRates.length)
      : 0;

  const firstInputValues = firstInputs
    .map((event) => toNumber(normalizeMetadata(event.metadata).msSinceStart))
    .filter((value) => value > 0);
  const firstInputAvgMs =
    firstInputValues.length > 0
      ? Math.round(firstInputValues.reduce((sum, value) => sum + value, 0) / firstInputValues.length)
      : 0;

  const totalActions = Object.values(actionBreakdown).reduce((sum, value) => sum + value, 0);
  const mostUsedAction = Object.entries(actionBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

  const collapseEntries = Object.entries(collapseReasons)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => ({
      reason,
      count,
      rate: roundPct(count, Math.max(1, collapseCount)),
    }));

  const topCollapseReason = collapseEntries[0]?.reason || 'none';
  const topCollapseReasonPct = collapseEntries[0]?.rate || 0;

  const mostCriticalStation =
    Object.entries(stationOverload)
      .filter(([station]) => station !== 'unknown')
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

  const phaseReachedRate = {
    abertura: roundPct(phaseReached.abertura, Math.max(1, runs)),
    escalada: roundPct(phaseReached.escalada, Math.max(1, runs)),
    pressao: roundPct(phaseReached.pressao, Math.max(1, runs)),
    final: roundPct(phaseReached.final, Math.max(1, runs)),
  };

  const avgPressurePeak =
    pressurePeaks.length > 0
      ? Math.round(pressurePeaks.reduce((sum, value) => sum + value, 0) / pressurePeaks.length)
      : 0;

  const scorecard = {
    runs,
    effectiveRuns: getEffectiveRunsForCooperativa(effectiveRuns),
    runEnds: runEndsCount,
    survivalCount,
    collapseCount,
    survivalRate: roundPct(survivalCount, Math.max(1, runEndsCount)),
    collectivityRate,
    mutiraoUsageRate: roundPct(mutiraoActivations, Math.max(1, runEndsCount)),
    replayRate: roundPct(replayClicks.length, Math.max(1, runEndsCount)),
    postRunCtaRate: roundPct(campaignCtaClicks.length, Math.max(1, runEndsCount)),
    firstInputAvgMs,
    totalActions,
    actionBreakdown,
    mostUsedAction,
    phaseReached,
    phaseReachedRate,
    collapseReasons: collapseEntries,
    topCollapseReason,
    topCollapseReasonPct,
    stationOverload,
    mostCriticalStation,
    pressurePeaks: {
      samples: pressurePeaks.length,
      average: avgPressurePeak,
      max: pressurePeaks.length > 0 ? Math.max(...pressurePeaks) : 0,
      pressure55Plus: pressurePeaks.filter((value) => value >= 55).length,
      pressure70Plus: pressurePeaks.filter((value) => value >= 70).length,
      pressure85Plus: pressurePeaks.filter((value) => value >= 85).length,
    },
  };

  const decision = computeDecision(scorecard);

  return {
    slug: 'cooperativa-na-pressao',
    title: 'Cooperativa na Pressao',
    scorecard,
    decision,
    weeklyRecommendation: decision.recommendation,
    generatedAt: new Date().toISOString(),
    dataQuality: {
      hasLiveRuns: scorecard.runs > 0,
      hasRunEnds: scorecard.runEnds > 0,
      hasActionSignals: scorecard.totalActions > 0,
      confidence: clamp(
        Math.round(
          (scorecard.runs >= 20 ? 35 : Math.round((scorecard.runs / 20) * 35)) +
            (scorecard.runEnds >= 12 ? 30 : Math.round((scorecard.runEnds / 12) * 30)) +
            (scorecard.totalActions >= 40 ? 20 : Math.round((scorecard.totalActions / 40) * 20)) +
            (scorecard.firstInputAvgMs > 0 ? 15 : 0),
        ),
        0,
        100,
      ),
    },
  };
}

module.exports = {
  buildCooperativaInsights,
};

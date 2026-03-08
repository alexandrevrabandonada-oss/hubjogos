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
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function isMutiraoEvent(event) {
  const metadata = normalizeMetadata(event.metadata);
  return event.slug === 'mutirao-do-bairro' || metadata.arcadeSlug === 'mutirao-do-bairro';
}

function buildMutiraoInsights(events = []) {
  const mutiraoRunStarts = events.filter(
    (event) => event.event_name === 'arcade_run_start' && isMutiraoEvent(event),
  );
  const mutiraoRunEnds = events.filter(
    (event) => event.event_name === 'arcade_run_end' && isMutiraoEvent(event),
  );
  const mutiraoScores = events.filter((event) => event.event_name === 'arcade_score' && isMutiraoEvent(event));
  const mutiraoActions = events.filter((event) => event.event_name === 'mutirao_action_used');
  const mutiraoEvents = events.filter((event) => event.event_name === 'mutirao_event_triggered');
  const mutiraoPeaks = events.filter((event) => event.event_name === 'mutirao_pressure_peak');
  const mutiraoReplayClicks = events.filter(
    (event) =>
      (event.event_name === 'arcade_replay_click' || event.event_name === 'replay_after_run_click') &&
      isMutiraoEvent(event),
  );
  const mutiraoPostRunCtas = events.filter((event) => {
    if (event.event_name !== 'campaign_cta_click_after_game' && event.event_name !== 'arcade_campaign_cta_click') {
      return false;
    }
    return isMutiraoEvent(event);
  });

  const runs = Math.max(mutiraoRunStarts.length, mutiraoRunEnds.length);

  let collapseCount = 0;
  let survivalCount = 0;
  let scoreSum = 0;
  let durationSum = 0;
  let collectiveRateSum = 0;

  for (const run of mutiraoRunEnds) {
    const metadata = normalizeMetadata(run.metadata);
    const score = toNumber(metadata.score);
    const durationMs = toNumber(metadata.durationMs);
    const collectiveRate = toNumber(metadata.collectiveRate);

    scoreSum += score;
    durationSum += durationMs;
    collectiveRateSum += collectiveRate;

    if (durationMs < 60_000 || collectiveRate < 40) {
      collapseCount += 1;
    } else {
      survivalCount += 1;
    }
  }

  if (mutiraoRunEnds.length === 0 && mutiraoScores.length > 0) {
    for (const scoreEvent of mutiraoScores) {
      const metadata = normalizeMetadata(scoreEvent.metadata);
      scoreSum += toNumber(metadata.score);
    }
  }

  const actionBreakdown = {
    reparar: 0,
    defender: 0,
    mobilizar: 0,
    mutirao: 0,
  };

  for (const actionEvent of mutiraoActions) {
    const metadata = normalizeMetadata(actionEvent.metadata);
    if (metadata.actionId === 'reparar') actionBreakdown.reparar += 1;
    if (metadata.actionId === 'defender') actionBreakdown.defender += 1;
    if (metadata.actionId === 'mobilizar') actionBreakdown.mobilizar += 1;
    if (metadata.actionId === 'ativar-mutirao') actionBreakdown.mutirao += 1;
  }

  const totalActions = Object.values(actionBreakdown).reduce((sum, value) => sum + value, 0);
  const actionValues = Object.values(actionBreakdown);
  const nonZeroActions = actionValues.filter((value) => value > 0);
  const actionMax = actionValues.length > 0 ? Math.max(...actionValues) : 0;
  const actionMin = nonZeroActions.length > 0 ? Math.min(...nonZeroActions) : 0;
  const actionDiversity = totalActions > 0 && actionMax > 0 ? Math.round((actionMin / actionMax) * 100) : 0;

  const mostUsedAction = Object.entries(actionBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'nenhuma';

  const eventBreakdown = {
    chuvaForte: 0,
    boatoPanico: 0,
    ondaSolidaria: 0,
    trancoSabotagem: 0,
  };

  for (const eventItem of mutiraoEvents) {
    const metadata = normalizeMetadata(eventItem.metadata);
    if (metadata.eventId === 'chuva-forte') eventBreakdown.chuvaForte += 1;
    if (metadata.eventId === 'boato-de-panico') eventBreakdown.boatoPanico += 1;
    if (metadata.eventId === 'onda-solidaria') eventBreakdown.ondaSolidaria += 1;
    if (metadata.eventId === 'tranco-de-sabotagem') eventBreakdown.trancoSabotagem += 1;
  }

  let pressurePeakSum = 0;
  let peak55 = 0;
  let peak70 = 0;
  let peak85 = 0;

  for (const peakEvent of mutiraoPeaks) {
    const metadata = normalizeMetadata(peakEvent.metadata);
    const peak = toNumber(metadata.peak);
    const milestone = toNumber(metadata.milestone);
    pressurePeakSum += peak;

    if (milestone >= 1) peak55 += 1;
    if (milestone >= 2) peak70 += 1;
    if (milestone >= 3) peak85 += 1;
  }

  const tariffRunEnds = events.filter(
    (event) => event.event_name === 'arcade_run_end' && (event.slug === 'tarifa-zero-corredor' || event.slug === 'tarifa-zero-rj'),
  );
  const tariffReplayClicks = events.filter(
    (event) =>
      (event.event_name === 'arcade_replay_click' || event.event_name === 'replay_after_run_click') &&
      (event.slug === 'tarifa-zero-corredor' || event.slug === 'tarifa-zero-rj'),
  );
  const tariffRuns = tariffRunEnds.length;
  const tariffReplayRate = tariffRuns > 0 ? Math.round((tariffReplayClicks.length / tariffRuns) * 100) : 0;
  const tariffAvgScore =
    tariffRuns > 0
      ? Math.round(
          tariffRunEnds.reduce((sum, run) => sum + toNumber(normalizeMetadata(run.metadata).score), 0) / tariffRuns,
        )
      : 0;

  const avgScoreBase = mutiraoRunEnds.length > 0 ? mutiraoRunEnds.length : mutiraoScores.length;

  const replayRate = runs > 0 ? Math.round((mutiraoReplayClicks.length / runs) * 100) : 0;
  const scoreDelta = tariffAvgScore > 0 ? Math.round(((scoreSum / Math.max(avgScoreBase, 1) - tariffAvgScore) / tariffAvgScore) * 100) : 0;
  const replayDelta = replayRate - tariffReplayRate;

  const engagement = replayDelta > 10 ? 'higher' : replayDelta < -10 ? 'lower' : 'similar';

  return {
    runs,
    collapseCount,
    survivalCount,
    collapseRate: runs > 0 ? Math.round((collapseCount / runs) * 100) : 0,
    avgPressurePeak: mutiraoPeaks.length > 0 ? Math.round(pressurePeakSum / mutiraoPeaks.length) : 0,
    avgScore: avgScoreBase > 0 ? Math.round(scoreSum / avgScoreBase) : 0,
    avgDurationMs: mutiraoRunEnds.length > 0 ? Math.round(durationSum / mutiraoRunEnds.length) : 0,
    collectiveRate: mutiraoRunEnds.length > 0 ? Math.round(collectiveRateSum / mutiraoRunEnds.length) : 0,
    replayRate,
    postRunCtaClicks: mutiraoPostRunCtas.length,
    totalActions,
    actionBreakdown,
    actionDiversity,
    mostUsedAction,
    eventCount: mutiraoEvents.length,
    eventBreakdown,
    pressureMilestones: {
      peak55,
      peak70,
      peak85,
    },
    comparison: {
      against: 'tarifa-zero-rj',
      engagement,
      scoreDeltaPct: scoreDelta,
      replayDeltaPp: replayDelta,
    },
  };
}

module.exports = {
  buildMutiraoInsights,
};

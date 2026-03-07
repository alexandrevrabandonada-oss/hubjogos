const fs = require('fs');
const path = require('path');

const scorecardThresholds = {
  minViewsPerVariant: 40,
  minClicksPerPlacement: 25,
  minSessionsPerSource: 20,
  minShareViewsForReentry: 30,
  directionalLiftPct: 15,
  candidateLiftPct: 25,
};

/**
 * Tijolo 18: Calculate window start date for temporal filtering
 */
function getWindowStartDate(window, now = new Date()) {
  switch (window) {
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'all':
    default:
      return null;
  }
}

/**
 * Tijolo 18: Check if event/session is within window
 */
function isInWindow(dateStr, window) {
  if (!window || window === 'all') {
    return true;
  }

  const windowStart = getWindowStartDate( window);
  if (!windowStart) {
    return true;
  }

  const eventDate = new Date(dateStr);
  return eventDate >= windowStart;
}

function safeHostname(referrer) {
  if (!referrer) {
    return 'direto/desconhecido';
  }

  try {
    return new URL(referrer).hostname || 'direto/desconhecido';
  } catch {
    return 'direto/desconhecido';
  }
}

function resolveSource(session) {
  return session?.utm_source || safeHostname(session?.referrer);
}

function computeExitRate(exits, sessions) {
  if (!sessions) {
    return 0;
  }

  return Math.round((exits / sessions) * 100);
}

function buildCirculationFromRows(sessions, events, window = 'all') {
  // Tijolo 18: Filter sessions and events by window
  const filteredSessions = sessions.filter((session) => {
    const createdAt = session.created_at || session.createdAt || session.startedAt || session.started_at;
    return createdAt ? isInWindow(createdAt, window) : true;
  });

  const filteredEvents = events.filter((event) => {
    const createdAt = event.created_at || event.createdAt;
    return createdAt ? isInWindow(createdAt, window) : true;
  });

  const sessionMap = new Map(filteredSessions.map((session) => [session.session_id || session.sessionId, session]));

  const sourceSessions = {};
  const gameSessions = {};
  const engineSessions = {};

  for (const session of filteredSessions) {
    const source = resolveSource(session);
    sourceSessions[source] = (sourceSessions[source] || 0) + 1;
    const slug = session.slug;
    const engineKind = session.engine_kind || session.engineKind;
    gameSessions[slug] = (gameSessions[slug] || 0) + 1;
    engineSessions[engineKind] = (engineSessions[engineKind] || 0) + 1;
  }

  const ctrByPlacement = {};
  const ctaClicksMap = {};
  const ctaTrackingIdMap = {};
  const ctaCategoryMap = {};

  const exitsBySource = {};
  const exitsByGame = {};
  const exitsByEngine = {};

  let sharePageViews = 0;
  let nextGameClicks = 0;
  let hubReturnClicks = 0;

  const exitEventNames = new Set(['primary_cta_click', 'secondary_cta_click', 'next_game_click', 'hub_return_click']);

  for (const event of filteredEvents) {
    const eventName = event.event_name || event.event;
    const metadata = event.metadata || {};

    if (eventName === 'outcome_view') {
      const placement = String(metadata.placement || 'outcome_page');
      if (!ctrByPlacement[placement]) {
        ctrByPlacement[placement] = { outcomeViews: 0, clicks: 0, ctr: 0 };
      }
      ctrByPlacement[placement].outcomeViews += 1;
    }

    if (eventName === 'primary_cta_click' || eventName === 'secondary_cta_click') {
      const placement = String(metadata.placement || (eventName === 'primary_cta_click' ? 'outcome_primary' : 'outcome_secondary'));
      if (!ctrByPlacement[placement]) {
        ctrByPlacement[placement] = { outcomeViews: 0, clicks: 0, ctr: 0 };
      }
      ctrByPlacement[placement].clicks += 1;

      const ctaId = event.cta_id || event.ctaId || 'unknown';
      ctaClicksMap[ctaId] = (ctaClicksMap[ctaId] || 0) + 1;

      if (typeof metadata.trackingId === 'string') {
        ctaTrackingIdMap[ctaId] = metadata.trackingId;
      }
      if (typeof metadata.category === 'string') {
        ctaCategoryMap[ctaId] = metadata.category;
      }
    }

    if (eventName === 'share_page_view') {
      sharePageViews += 1;
    }

    if (eventName === 'next_game_click') {
      nextGameClicks += 1;
    }

    if (eventName === 'hub_return_click') {
      hubReturnClicks += 1;
    }

    if (exitEventNames.has(eventName)) {
      const sessionId = event.session_id || event.sessionId;
      const session = sessionMap.get(sessionId);
      const source = resolveSource(session || {});
      const slug = event.slug;
      const engineKind = event.engine_kind || event.engineKind;

      if (!exitsBySource[source]) {
        exitsBySource[source] = { exits: 0, sessions: sourceSessions[source] || 0, exitRate: 0 };
      }
      exitsBySource[source].exits += 1;

      if (!exitsByGame[slug]) {
        exitsByGame[slug] = { exits: 0, sessions: gameSessions[slug] || 0, exitRate: 0 };
      }
      exitsByGame[slug].exits += 1;

      if (!exitsByEngine[engineKind]) {
        exitsByEngine[engineKind] = { exits: 0, sessions: engineSessions[engineKind] || 0, exitRate: 0 };
      }
      exitsByEngine[engineKind].exits += 1;
    }
  }

  for (const key of Object.keys(ctrByPlacement)) {
    const point = ctrByPlacement[key];
    point.ctr = point.outcomeViews > 0 ? Math.round((point.clicks / point.outcomeViews) * 100) : 0;
  }

  for (const key of Object.keys(exitsBySource)) {
    const row = exitsBySource[key];
    row.exitRate = computeExitRate(row.exits, row.sessions);
  }

  for (const key of Object.keys(exitsByGame)) {
    const row = exitsByGame[key];
    row.exitRate = computeExitRate(row.exits, row.sessions);
  }

  for (const key of Object.keys(exitsByEngine)) {
    const row = exitsByEngine[key];
    row.exitRate = computeExitRate(row.exits, row.sessions);
  }

  const topCtas = Object.entries(ctaClicksMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([ctaId, clicks]) => ({
      ctaId,
      clicks,
      trackingId: ctaTrackingIdMap[ctaId],
      category: ctaCategoryMap[ctaId],
    }));

  const reentryActions = nextGameClicks + hubReturnClicks;

  return {
    ctrByPlacement,
    topCtas,
    shareReentry: {
      sharePageViews,
      nextGameClicks,
      hubReturnClicks,
      reentryActions,
      reentryRate: sharePageViews > 0 ? Math.round((reentryActions / sharePageViews) * 100) : 0,
    },
    exitsBySource,
    exitsByGame,
    exitsByEngine,
  };
}

function parseExperimentsRegistry(content) {
  const experiments = [];
  const regex = /'([^']+)'\s*:\s*\{([\s\S]*?)\n\s*\},/g;

  let match;
  while ((match = regex.exec(content)) !== null) {
    const key = match[1];
    const body = match[2];

    const name = body.match(/name:\s*'([^']+)'/)?.[1] || key;
    const description = body.match(/description:\s*'([^']*)'/)?.[1] || '';
    const enabled = body.match(/enabled:\s*(true|false)/)?.[1] === 'true';
    const primaryMetric = body.match(/primaryMetric:\s*'([^']+)'/)?.[1] || 'completion_rate';
    const affectedSurface = body.match(/affectedSurface:\s*'([^']+)'/)?.[1] || 'not_specified';

    const variants = [];
    const variantsBlock = body.match(/variants:\s*\[([\s\S]*?)\]/)?.[1] || '';
    const variantRegex = /\{([\s\S]*?)\}/g;
    let variantMatch;
    while ((variantMatch = variantRegex.exec(variantsBlock)) !== null) {
      const variantBody = variantMatch[1];
      const variantKey = variantBody.match(/key:\s*'([^']+)'/)?.[1];
      const variantName = variantBody.match(/name:\s*'([^']+)'/)?.[1] || variantKey;
      const variantWeight = Number(variantBody.match(/weight:\s*(\d+)/)?.[1] || 0);
      if (variantKey) {
        variants.push({ key: variantKey, name: variantName, weight: variantWeight });
      }
    }

    experiments.push({ key, name, description, enabled, primaryMetric, affectedSurface, variants });
  }

  return experiments;
}

function buildExperimentScorecards(experimentRows, registry) {
  const grouped = {};
  for (const row of experimentRows || []) {
    const key = row.experiment_key || row.experimentKey;
    const variant = row.variant;
    if (!grouped[key]) {
      grouped[key] = {};
    }

    grouped[key][variant] = {
      sessions: Number(row.sessions || 0),
      completions: Number(row.completions || 0),
      completionRate: Number(row.completion_rate || row.completionRate || 0),
    };
  }

  const activeExperiments = registry.filter((exp) => exp.enabled);

  return activeExperiments.map((exp) => {
    const variantsData = exp.variants.map((variant) => {
      const row = grouped[exp.key]?.[variant.key] || { sessions: 0, completions: 0, completionRate: 0 };
      return {
        key: variant.key,
        name: variant.name,
        sessions: row.sessions,
        completions: row.completions,
        completionRate: row.completionRate,
      };
    });

    const minSample = variantsData.length ? Math.min(...variantsData.map((v) => v.sessions)) : 0;
    const sortedByRate = [...variantsData].sort((a, b) => b.completionRate - a.completionRate);
    const best = sortedByRate[0];
    const second = sortedByRate[1] || { completionRate: 0 };
    const lift = Number((best ? best.completionRate - second.completionRate : 0).toFixed(2));

    let status = 'monitoring';
    let rationale = 'Experimento ativo em observação.';

    if (variantsData.length < 2 || minSample < scorecardThresholds.minViewsPerVariant) {
      status = 'insufficient_data';
      rationale = `Amostra mínima não atingida (${minSample}/${scorecardThresholds.minViewsPerVariant}).`;
    } else if (Math.abs(lift) < 5) {
      status = 'inconclusive';
      rationale = 'Diferença entre variantes ainda pequena.';
    } else if (lift >= scorecardThresholds.candidateLiftPct && minSample >= scorecardThresholds.minViewsPerVariant * 2) {
      status = 'candidate_winner';
      rationale = 'Sinal forte e estável, sem automação de decisão.';
    } else if (lift >= scorecardThresholds.directionalLiftPct) {
      status = 'directional_signal';
      rationale = 'Sinal direcional inicial; manter coleta.';
    }

    return {
      key: exp.key,
      name: exp.name,
      primaryMetric: exp.primaryMetric,
      affectedSurface: exp.affectedSurface,
      variants: variantsData,
      minSamplePerVariant: scorecardThresholds.minViewsPerVariant,
      sampleMinReached: minSample >= scorecardThresholds.minViewsPerVariant,
      bestVariantKey: best?.key || null,
      liftVsSecondPct: lift,
      status,
      rationale,
    };
  });
}

function buildReadingCriteria(circulation, sources, scorecards) {
  const clicks = Object.values(circulation.ctrByPlacement).reduce((sum, row) => sum + row.clicks, 0);
  const maxSourceSessions = Math.max(0, ...Object.values(sources || {}));

  const checks = {
    ctrComparable: clicks >= scorecardThresholds.minClicksPerPlacement,
    shareReentryReadable: circulation.shareReentry.sharePageViews >= scorecardThresholds.minShareViewsForReentry,
    sourceCohortsReadable: maxSourceSessions >= scorecardThresholds.minSessionsPerSource,
    experimentReadable: scorecards.some((item) => item.sampleMinReached),
  };

  const warnings = [];

  if (!checks.ctrComparable) {
    warnings.push(`CTR cedo demais: ${clicks}/${scorecardThresholds.minClicksPerPlacement} clicks mínimos.`);
  }

  if (!checks.shareReentryReadable) {
    warnings.push(
      `Share→reentry cedo demais: ${circulation.shareReentry.sharePageViews}/${scorecardThresholds.minShareViewsForReentry} share views.`,
    );
  }

  if (!checks.sourceCohortsReadable) {
    warnings.push('Origens sem volume mínimo para comparação disciplinada.');
  }

  if (!checks.experimentReadable) {
    warnings.push('Experimentos sem amostra mínima por variante.');
  }

  return {
    thresholds: scorecardThresholds,
    checks,
    warnings,
  };
}

function toTopRows(record, limit = 5) {
  return Object.entries(record || {})
    .sort(([, a], [, b]) => {
      const aValue = typeof a === 'number' ? a : a?.exits || 0;
      const bValue = typeof b === 'number' ? b : b?.exits || 0;
      return bValue - aValue;
    })
    .slice(0, limit)
    .map(([key, value]) => ({ key, value }));
}

function loadCatalogMetadata() {
  const catalogPath = path.join(__dirname, '..', 'lib', 'games', 'catalog.ts');
  if (!fs.existsSync(catalogPath)) {
    return {};
  }

  const content = fs.readFileSync(catalogPath, 'utf-8');
  const map = {};

  // Parse básico dos blocos do catálogo para alimentar snapshots/export sem acoplamento TS runtime.
  const gameRegex = /\{[\s\S]*?slug:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'[\s\S]*?pace:\s*'([^']+)'[\s\S]*?line:\s*'([^']+)'[\s\S]*?territoryScope:\s*'([^']+)'[\s\S]*?series:\s*'([^']+)'[\s\S]*?politicalAxis:\s*'([^']+)'[\s\S]*?collectiveSolutionType:\s*'([^']+)'[\s\S]*?commonVsMarket:\s*'([^']+)'[\s\S]*?campaignFrame:\s*'([^']+)'[\s\S]*?\},/g;
  let match;
  while ((match = gameRegex.exec(content)) !== null) {
    map[match[1]] = {
      slug: match[1],
      title: match[2],
      pace: match[3],
      line: match[4],
      territoryScope: match[5],
      series: match[6],
      politicalAxis: match[7],
      collectiveSolutionType: match[8],
      commonVsMarket: match[9],
      campaignFrame: match[10],
    };
  }

  return map;
}

function buildQuickLineInsights(sessions, events, catalogMap, window = 'all') {
  const safeSessions = sessions || [];
  const safeEvents = events || [];
  const metadata = catalogMap || {};

  const quickEntries = Object.values(metadata).filter((item) => item.pace === 'quick');
  const quickSlugs = new Set(quickEntries.map((item) => item.slug));

  const bySlug = {};

  for (const session of safeSessions) {
    const slug = session.slug;
    if (!quickSlugs.has(slug)) {
      continue;
    }

    if (!bySlug[slug]) {
      bySlug[slug] = {
        slug,
        title: metadata[slug]?.title || slug,
        series: metadata[slug]?.series || 'unknown',
        territoryScope: metadata[slug]?.territoryScope || 'unknown',
        politicalAxis: metadata[slug]?.politicalAxis || 'unknown',
        collectiveSolutionType: metadata[slug]?.collectiveSolutionType || 'unknown',
        commonVsMarket: metadata[slug]?.commonVsMarket || 'unknown',
        sessions: 0,
        starts: 0,
        completions: 0,
        shares: 0,
        replays: 0,
        postGameCtaClicks: 0,
        finalCardInteractions: 0,
        sharePagePlayClicks: 0,
        firstInteractionCount: 0,
        firstInteractionAvgMs: 0,
        qrViews: 0,
        qrClicks: 0,
      };
    }

    bySlug[slug].sessions += 1;
    if (session.status === 'completed') {
      bySlug[slug].completions += 1;
    }
  }

  const firstInteractionSums = {};

  for (const event of safeEvents) {
    const eventName = event.event_name || event.event;
    const slug = event.slug;
    if (!quickSlugs.has(slug) || !bySlug[slug]) {
      continue;
    }

    if (eventName === 'result_copy' || eventName === 'link_copy' || eventName === 'final_card_share_click') {
      bySlug[slug].shares += 1;
    }

    if (eventName === 'game_start') {
      bySlug[slug].starts += 1;
    }

    if (eventName === 'quick_minigame_replay' || eventName === 'replay_click' || eventName === 'outcome_replay_intent') {
      bySlug[slug].replays += 1;
    }

    if (eventName === 'primary_cta_click' || eventName === 'secondary_cta_click' || eventName === 'campaign_cta_click_after_game') {
      bySlug[slug].postGameCtaClicks += 1;
    }

    if (
      eventName === 'final_card_view' ||
      eventName === 'final_card_download' ||
      eventName === 'final_card_share_click' ||
      eventName === 'final_card_qr_click'
    ) {
      bySlug[slug].finalCardInteractions += 1;
    }

    if (eventName === 'share_page_play_click') {
      bySlug[slug].sharePagePlayClicks += 1;
    }

    if (eventName === 'final_card_qr_view') {
      bySlug[slug].qrViews += 1;
    }

    if (eventName === 'final_card_qr_click') {
      bySlug[slug].qrClicks += 1;
    }

    if (eventName === 'first_interaction_time') {
      const value = Number(event?.metadata?.msSinceStart || 0);
      if (!firstInteractionSums[slug]) {
        firstInteractionSums[slug] = { totalMs: 0, count: 0 };
      }
      if (value > 0) {
        firstInteractionSums[slug].totalMs += value;
        firstInteractionSums[slug].count += 1;
      }
      bySlug[slug].firstInteractionCount += 1;
    }
  }

  const baseQuick = Object.values(bySlug).map((row) => {
    const firstInteraction = firstInteractionSums[row.slug];
    const completionRate = row.sessions > 0 ? Math.round((row.completions / row.sessions) * 100) : 0;
    const replayRate = row.completions > 0 ? Math.round((row.replays / row.completions) * 100) : 0;
    const shareRate = row.completions > 0 ? Math.round((row.shares / row.completions) * 100) : 0;
    const postGameCtaRate = row.completions > 0 ? Math.round((row.postGameCtaClicks / row.completions) * 100) : 0;
    const reentryRate = row.shares > 0 ? Math.round((row.sharePagePlayClicks / row.shares) * 100) : 0;
    const qrCtr = row.qrViews > 0 ? Math.round((row.qrClicks / row.qrViews) * 100) : 0;

    return {
      ...row,
      completionRate,
      replayRate,
      shareRate,
      postGameCtaRate,
      reentryRate,
      qrCtr,
      firstInteractionAvgMs:
        firstInteraction && firstInteraction.count > 0
          ? Math.round(firstInteraction.totalMs / firstInteraction.count)
          : 0,
    };
  });

  const maxFirstInteraction = Math.max(0, ...baseQuick.map((row) => row.firstInteractionAvgMs));
  const heuristic = {
    weights: {
      completionRate: 0.3,
      replayRate: 0.2,
      shareRate: 0.2,
      postGameCtaRate: 0.15,
      reentryRate: 0.1,
      firstInteractionScore: 0.05,
    },
    minSampleSessions: 12,
    minQrVariantSessions: 30,
    directionalLiftPct: 15,
  };

  const quickComparison = baseQuick
    .map((row) => {
      const firstInteractionScore =
        maxFirstInteraction > 0 && row.firstInteractionAvgMs > 0
          ? Math.round((1 - (row.firstInteractionAvgMs / maxFirstInteraction)) * 100)
          : 0;
      const stickyScore = Math.round(
        (row.completionRate * heuristic.weights.completionRate) +
        (row.replayRate * heuristic.weights.replayRate) +
        (row.shareRate * heuristic.weights.shareRate) +
        (row.postGameCtaRate * heuristic.weights.postGameCtaRate) +
        (row.reentryRate * heuristic.weights.reentryRate) +
        (firstInteractionScore * heuristic.weights.firstInteractionScore),
      );

      return {
        ...row,
        firstInteractionScore,
        stickyScore,
      };
    })
    .sort((a, b) => b.sessions - a.sessions);

  const bySeries = {};
  const byTerritory = {};
  const byPoliticalAxis = {};
  const byCommonVsMarket = {};
  for (const row of quickComparison) {
    if (!bySeries[row.series]) {
      bySeries[row.series] = { sessions: 0, starts: 0, completions: 0, shares: 0, replays: 0, stickyTotal: 0, games: 0 };
    }
    if (!byTerritory[row.territoryScope]) {
      byTerritory[row.territoryScope] = { sessions: 0, completions: 0, shares: 0, replays: 0, stickyTotal: 0, games: 0, topGameSlug: row.slug, topGameSessions: row.sessions };
    }
    if (!byPoliticalAxis[row.politicalAxis]) {
      byPoliticalAxis[row.politicalAxis] = { sessions: 0, completions: 0, shares: 0, replays: 0, stickyTotal: 0, games: 0 };
    }
    if (!byCommonVsMarket[row.commonVsMarket]) {
      byCommonVsMarket[row.commonVsMarket] = { sessions: 0, completions: 0, shares: 0, replays: 0 };
    }

    bySeries[row.series].starts += row.starts;
    bySeries[row.series].sessions += row.sessions;
    bySeries[row.series].completions += row.completions;
    bySeries[row.series].shares += row.shares;
    bySeries[row.series].replays += row.replays;
    bySeries[row.series].stickyTotal += row.stickyScore;
    bySeries[row.series].games += 1;

    byTerritory[row.territoryScope].sessions += row.sessions;
    byTerritory[row.territoryScope].completions += row.completions;
    byTerritory[row.territoryScope].shares += row.shares;
    byTerritory[row.territoryScope].replays += row.replays;
    byTerritory[row.territoryScope].stickyTotal += row.stickyScore;
    byTerritory[row.territoryScope].games += 1;
    if (row.sessions > byTerritory[row.territoryScope].topGameSessions) {
      byTerritory[row.territoryScope].topGameSessions = row.sessions;
      byTerritory[row.territoryScope].topGameSlug = row.slug;
    }

    byPoliticalAxis[row.politicalAxis].sessions += row.sessions;
    byPoliticalAxis[row.politicalAxis].completions += row.completions;
    byPoliticalAxis[row.politicalAxis].shares += row.shares;
    byPoliticalAxis[row.politicalAxis].replays += row.replays;
    byPoliticalAxis[row.politicalAxis].stickyTotal += row.stickyScore;
    byPoliticalAxis[row.politicalAxis].games += 1;

    byCommonVsMarket[row.commonVsMarket].sessions += row.sessions;
    byCommonVsMarket[row.commonVsMarket].completions += row.completions;
    byCommonVsMarket[row.commonVsMarket].shares += row.shares;
    byCommonVsMarket[row.commonVsMarket].replays += row.replays;
  }

  const rankedSeries = Object.entries(bySeries)
    .map(([key, row]) => ({
      key,
      ...row,
      completionRate: row.sessions > 0 ? Math.round((row.completions / row.sessions) * 100) : 0,
      replayRate: row.completions > 0 ? Math.round((row.replays / row.completions) * 100) : 0,
      shareRate: row.completions > 0 ? Math.round((row.shares / row.completions) * 100) : 0,
      stickyScore: row.games > 0 ? Math.round(row.stickyTotal / row.games) : 0,
    }))
    .sort((a, b) => b.stickyScore - a.stickyScore);

  const rankedTerritory = Object.entries(byTerritory)
    .map(([key, row]) => ({
      key,
      ...row,
      shareRate: row.completions > 0 ? Math.round((row.shares / row.completions) * 100) : 0,
      replayRate: row.completions > 0 ? Math.round((row.replays / row.completions) * 100) : 0,
      stickyScore: row.games > 0 ? Math.round(row.stickyTotal / row.games) : 0,
      topGameTitle: metadata[row.topGameSlug]?.title || row.topGameSlug,
    }))
    .sort((a, b) => b.stickyScore - a.stickyScore);

  const rankedPoliticalAxis = Object.entries(byPoliticalAxis)
    .map(([key, row]) => ({
      key,
      ...row,
      completionRate: row.sessions > 0 ? Math.round((row.completions / row.sessions) * 100) : 0,
      shareRate: row.completions > 0 ? Math.round((row.shares / row.completions) * 100) : 0,
      stickyScore: row.games > 0 ? Math.round(row.stickyTotal / row.games) : 0,
    }))
    .sort((a, b) => b.stickyScore - a.stickyScore);

  const qrSummary = {
    'with-qr': { sessions: 0, completions: 0, qrViews: 0, qrClicks: 0 },
    'without-qr': { sessions: 0, completions: 0, qrViews: 0, qrClicks: 0 },
  };
  const qrVariantBySession = {};

  for (const session of safeSessions) {
    const list = Array.isArray(session.experiments)
      ? session.experiments
      : typeof session.experiments === 'string'
        ? (() => {
            try {
              const parsed = JSON.parse(session.experiments);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          })()
        : [];
    const hit = list.find((item) => item && item.key === 'final-card-qr-code' && typeof item.variant === 'string');
    if (hit && qrSummary[hit.variant]) {
      qrVariantBySession[session.session_id || session.sessionId] = hit.variant;
      qrSummary[hit.variant].sessions += 1;
      if (session.status === 'completed') {
        qrSummary[hit.variant].completions += 1;
      }
    }
  }

  for (const event of safeEvents) {
    const variant = qrVariantBySession[event.session_id || event.sessionId];
    if (!variant || !qrSummary[variant]) {
      continue;
    }

    const eventName = event.event_name || event.event;
    if (eventName === 'final_card_qr_view') {
      qrSummary[variant].qrViews += 1;
    }
    if (eventName === 'final_card_qr_click') {
      qrSummary[variant].qrClicks += 1;
    }
  }

  const withQrCtr = qrSummary['with-qr'].qrViews > 0 ? (qrSummary['with-qr'].qrClicks / qrSummary['with-qr'].qrViews) * 100 : 0;
  const withoutQrCtr = qrSummary['without-qr'].qrViews > 0 ? (qrSummary['without-qr'].qrClicks / qrSummary['without-qr'].qrViews) * 100 : 0;
  const qrDelta = Number((withQrCtr - withoutQrCtr).toFixed(2));
  const qrMinSample = Math.min(qrSummary['with-qr'].sessions, qrSummary['without-qr'].sessions);

  const qrReadout = Object.fromEntries(
    Object.entries(qrSummary).map(([variant, row]) => {
      const completionRate = row.sessions > 0 ? Math.round((row.completions / row.sessions) * 100) : 0;
      const qrCtr = row.qrViews > 0 ? Math.round((row.qrClicks / row.qrViews) * 100) : 0;
      const status = qrMinSample < heuristic.minQrVariantSessions
        ? 'cedo-demais'
        : Math.abs(qrDelta) >= heuristic.directionalLiftPct
          ? 'sinal-direcional'
          : 'monitorando';
      return [variant, { ...row, completionRate, qrCtr, status, deltaVsBaselinePct: qrDelta }];
    }),
  );

  const warnings = [];
  if (quickComparison.length === 0) {
    warnings.push('Sem sessões quick na janela atual para comparação entre jogos.');
  }
  const lowSampleQuick = quickComparison.filter((row) => row.sessions < heuristic.minSampleSessions).map((row) => row.title);
  if (lowSampleQuick.length > 0) {
    warnings.push(`Amostra baixa por quick (min ${heuristic.minSampleSessions} sessões): ${lowSampleQuick.join(', ')}.`);
  }
  if (qrMinSample < heuristic.minQrVariantSessions) {
    warnings.push(`QR A/B cedo demais (${qrMinSample}/${heuristic.minQrVariantSessions} sessões mínimas por variante).`);
  }

  const topStickyGame = quickComparison.slice().sort((a, b) => b.stickyScore - a.stickyScore)[0] || null;

  // Tijolo 27: Metas mínimas de coleta baseadas na janela temporal
  const collectionTargets = window === '7d'
    ? {
      quick: { sessions: 60, starts: 50, completions: 15, shares: 5, replays: 3 },
      series: { sessions: 100, starts: 80, completions: 25, shares: 8 },
      territory: { sessions: 80, starts: 60, completions: 20, shares: 6 },
      qrVariant: { sessions: 60, qrViews: 20, qrClicks: 8 },
    }
    : window === '30d'
      ? {
        quick: { sessions: 150, starts: 120, completions: 40, shares: 12, replays: 8 },
        series: { sessions: 250, starts: 200, completions: 60, shares: 20 },
        territory: { sessions: 200, starts: 150, completions: 50, shares: 15 },
        qrVariant: { sessions: 150, qrViews: 50, qrClicks: 20 },
      }
      : {
        quick: { sessions: 200, starts: 150, completions: 50, shares: 15, replays: 10 },
        series: { sessions: 300, starts: 250, completions: 80, shares: 25 },
        territory: { sessions: 250, starts: 200, completions: 60, shares: 20 },
        qrVariant: { sessions: 200, qrViews: 60, qrClicks: 25 },
      };

  function getCollectionStatus(current, target) {
    const pct = target > 0 ? (current / target) * 100 : 0;
    if (pct < 50) return 'coleta-insuficiente';
    if (pct < 100) return 'coleta-em-andamento';
    return 'coleta-minima-atingida';
  }

  // Status por quick
  const byQuickStatus = {};
  for (const row of quickComparison) {
    const progressValues = [
      row.sessions / collectionTargets.quick.sessions,
      row.starts / collectionTargets.quick.starts,
      row.completions / collectionTargets.quick.completions,
      row.shares / collectionTargets.quick.shares,
      row.replays / collectionTargets.quick.replays,
    ];
    const avgProgress = (progressValues.reduce((sum, val) => sum + val, 0) / progressValues.length) * 100;
    byQuickStatus[row.slug] = {
      status: getCollectionStatus(row.sessions, collectionTargets.quick.sessions),
      progress: {
        sessions: row.sessions,
        starts: row.starts,
        completions: row.completions,
        shares: row.shares,
        replays: row.replays,
      },
      progressPct: Math.round(avgProgress),
    };
  }

  // Status por série
  const bySeriesStatus = {};
  for (const row of rankedSeries) {
    const progressValues = [
      row.sessions / collectionTargets.series.sessions,
      row.starts / collectionTargets.series.starts,
      row.completions / collectionTargets.series.completions,
      row.shares / collectionTargets.series.shares,
    ];
    const avgProgress = (progressValues.reduce((sum, val) => sum + val, 0) / progressValues.length) * 100;
    const gamesInSeries = quickComparison.filter((q) => q.series === row.key).map((q) => q.slug);
    const allGamesReady = gamesInSeries.every((slug) => byQuickStatus[slug]?.status === 'coleta-minima-atingida');
    bySeriesStatus[row.key] = {
      status: allGamesReady && row.sessions >= collectionTargets.series.sessions
        ? 'pronto-para-priorizacao'
        : getCollectionStatus(row.sessions, collectionTargets.series.sessions),
      progress: {
        sessions: row.sessions,
        starts: row.starts,
        completions: row.completions,
        shares: row.shares,
      },
      progressPct: Math.round(avgProgress),
      gamesInSeries,
    };
  }

  // Status por território
  const byTerritoryStatus = {};
  for (const row of rankedTerritory) {
    const progressValues = [
      row.sessions / collectionTargets.territory.sessions,
      row.starts / collectionTargets.territory.starts,
      row.completions / collectionTargets.territory.completions,
      row.shares / collectionTargets.territory.shares,
    ];
    const avgProgress = (progressValues.reduce((sum, val) => sum + val, 0) / progressValues.length) * 100;
    const gamesInTerritory = quickComparison.filter((q) => q.territoryScope === row.key).map((q) => q.slug);
    const allGamesReady = gamesInTerritory.every((slug) => byQuickStatus[slug]?.status === 'coleta-minima-atingida');
    byTerritoryStatus[row.key] = {
      status: allGamesReady && row.sessions >= collectionTargets.territory.sessions
        ? 'pronto-para-priorizacao'
        : getCollectionStatus(row.sessions, collectionTargets.territory.sessions),
      progress: {
        sessions: row.sessions,
        starts: row.starts,
        completions: row.completions,
        shares: row.shares,
      },
      progressPct: Math.round(avgProgress),
      gamesInTerritory,
      topGameSlug: row.topGameSlug || null,
      topGameSessions: row.topGameSessions || 0,
    };
  }

  // Status QR Experiment
  const qrProgressByVariant = {};
  for (const [variant, data] of Object.entries(qrSummary)) {
    const progressValues = [
      data.sessions / collectionTargets.qrVariant.sessions,
      data.qrViews / collectionTargets.qrVariant.qrViews,
      data.qrClicks / collectionTargets.qrVariant.qrClicks,
    ];
    const avgProgress = (progressValues.reduce((sum, val) => sum + val, 0) / progressValues.length) * 100;
    qrProgressByVariant[variant] = {
      sessions: data.sessions,
      qrViews: data.qrViews,
      qrClicks: data.qrClicks,
      progressPct: Math.round(avgProgress),
    };
  }

  const qrMinSessionsVariant = Math.min(
    qrProgressByVariant['with-qr']?.sessions || 0,
    qrProgressByVariant['without-qr']?.sessions || 0,
  );
  const qrExperimentStatus = getCollectionStatus(qrMinSessionsVariant, collectionTargets.qrVariant.sessions);

  return {
    quickComparison,
    quickRanking: quickComparison.slice().sort((a, b) => b.stickyScore - a.stickyScore),
    bySeries,
    byTerritory,
    byPoliticalAxis,
    byCommonVsMarket,
    rankedSeries,
    rankedTerritory,
    rankedPoliticalAxis,
    heuristic,
    qrReadout,
    collectionTargets,
    collectionStatus: {
      byQuick: byQuickStatus,
      bySeries: bySeriesStatus,
      byTerritory: byTerritoryStatus,
      qrExperiment: {
        status: qrExperimentStatus,
        progressByVariant: qrProgressByVariant,
      },
    },
    warnings,
    topStickyGame,
  };
}

module.exports = {
  scorecardThresholds,
  safeHostname,
  resolveSource,
  buildCirculationFromRows,
  parseExperimentsRegistry,
  buildExperimentScorecards,
  buildReadingCriteria,
  toTopRows,
  getWindowStartDate,
  isInWindow,
  loadCatalogMetadata,
  buildQuickLineInsights,
};

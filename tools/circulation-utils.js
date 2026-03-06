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
};

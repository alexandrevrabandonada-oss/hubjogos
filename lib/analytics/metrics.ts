/**
 * Helpers para agregação de métricas locais e remotas
 * Tijolo 18: suporte a janelas temporais e ambiente explícito
 */

import { getLocalArray } from '@/lib/storage/local-session';
import type { SessionRecord, AnalyticsEventPayload, ResultRecord } from '@/lib/analytics/events';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { buildExperimentScorecard, scorecardThresholds } from '@/lib/experiments/scorecard';
import { listAllExperiments } from '@/lib/experiments/config';
import type { TimeWindow, DataEnvironment } from './windowing';
import { getWindowStartDate, determineEnvironment } from './windowing';

interface CirculationPoint {
  outcomeViews: number;
  clicks: number;
  ctr: number;
}

interface ExitAggregate {
  exits: number;
  sessions: number;
  exitRate: number;
}

export interface MetricsSnapshot {
  source: 'local' | 'supabase' | 'hybrid';
  environment: DataEnvironment; // Tijolo 18
  window: TimeWindow; // Tijolo 18
  lastEventAt: Date | null; // Tijolo 18
  totalSessions: number;
  completedSessions: number;
  totalEvents: number;
  eventsByType: Record<string, number>;
  conclusionsByEngine: Record<string, number>;
  sources: Record<string, number>;
  funnel: {
    starts: number;
    completions: number;
    shares: number;
  };
  gamesSorted: Array<{
    slug: string;
    title: string;
    initiated: number;
    completed: number;
    shares: number;
    completionRate: number;
  }>;
  cohorts: {
    bySource: Record<string, {
      sessions: number;
      starts: number;
      completions: number;
      shares: number;
      completionRate: number;
    }>;
    byGame: Record<string, {
      sessions: number;
      starts: number;
      completions: number;
      shares: number;
      completionRate: number;
      feedbackPositive: number;
      feedbackNeutral: number;
      feedbackNegative: number;
    }>;
    byEngine: Record<string, {
      sessions: number;
      starts: number;
      completions: number;
      shares: number;
      completionRate: number;
    }>;
  };
  experiments: Record<string, {
    name: string;
    variants: Record<string, {
      sessions: number;
      completions: number;
      completionRate: number;
    }>;
  }>;
  circulation: {
    ctrByPlacement: Record<string, CirculationPoint>;
    topCtas: Array<{
      ctaId: string;
      clicks: number;
      trackingId?: string;
      category?: string;
    }>;
    shareReentry: {
      sharePageViews: number;
      nextGameClicks: number;
      hubReturnClicks: number;
      reentryActions: number;
      reentryRate: number;
    };
    exitsBySource: Record<string, ExitAggregate>;
    exitsByGame: Record<string, ExitAggregate>;
    exitsByEngine: Record<string, ExitAggregate>;
  };
  readingCriteria: {
    thresholds: typeof scorecardThresholds;
    checks: {
      ctrComparable: boolean;
      shareReentryReadable: boolean;
      sourceCohortsReadable: boolean;
      experimentReadable: boolean;
    };
    warnings: string[];
  };
  experimentScorecards: ReturnType<typeof buildExperimentScorecard>[];
  generatedAt: string;
}

interface NormalizedEvent {
  sessionId: string;
  eventName: string;
  slug: string;
  engineKind: string;
  ctaId?: string | null;
  metadata?: Record<string, unknown>;
}

function safeHostname(referrer?: string | null) {
  if (!referrer) {
    return 'direto/desconhecido';
  }

  try {
    return new URL(referrer).hostname || 'direto/desconhecido';
  } catch {
    return 'direto/desconhecido';
  }
}

function resolveSource(session?: Pick<SessionRecord, 'utm_source' | 'referrer'> | null) {
  if (!session) {
    return 'direto/desconhecido';
  }

  return session.utm_source || safeHostname(session.referrer);
}

function computeExitRate(exits: number, sessions: number) {
  if (sessions <= 0) {
    return 0;
  }

  return Math.round((exits / sessions) * 100);
}

function buildCirculation(
  sessions: SessionRecord[],
  events: NormalizedEvent[],
  sourceSessionsCount: Record<string, number>,
  gameSessionsCount: Record<string, number>,
  engineSessionsCount: Record<string, number>,
) {
  const sessionsById = new Map<string, SessionRecord>(sessions.map((session) => [session.sessionId, session]));

  const ctrByPlacement: Record<string, CirculationPoint> = {};
  const ctaClicks: Record<string, number> = {};
  const ctaTracking: Record<string, string> = {};
  const ctaCategory: Record<string, string> = {};

  const exitsBySource: Record<string, ExitAggregate> = {};
  const exitsByGame: Record<string, ExitAggregate> = {};
  const exitsByEngine: Record<string, ExitAggregate> = {};

  const exitEvents = new Set(['primary_cta_click', 'secondary_cta_click', 'next_game_click', 'hub_return_click']);

  let sharePageViews = 0;
  let nextGameClicks = 0;
  let hubReturnClicks = 0;

  for (const event of events) {
    const metadata = event.metadata || {};

    if (event.eventName === 'outcome_view') {
      const placement = String(metadata.placement || 'outcome_page');
      if (!ctrByPlacement[placement]) {
        ctrByPlacement[placement] = { outcomeViews: 0, clicks: 0, ctr: 0 };
      }
      ctrByPlacement[placement].outcomeViews += 1;
    }

    if (event.eventName === 'primary_cta_click' || event.eventName === 'secondary_cta_click') {
      const placement = String(metadata.placement || (event.eventName === 'primary_cta_click' ? 'outcome_primary' : 'outcome_secondary'));
      if (!ctrByPlacement[placement]) {
        ctrByPlacement[placement] = { outcomeViews: 0, clicks: 0, ctr: 0 };
      }
      ctrByPlacement[placement].clicks += 1;

      const ctaId = event.ctaId || 'unknown';
      ctaClicks[ctaId] = (ctaClicks[ctaId] || 0) + 1;

      if (typeof metadata.trackingId === 'string') {
        ctaTracking[ctaId] = metadata.trackingId;
      }
      if (typeof metadata.category === 'string') {
        ctaCategory[ctaId] = metadata.category;
      }
    }

    if (event.eventName === 'share_page_view') {
      sharePageViews += 1;
    }

    if (event.eventName === 'next_game_click') {
      nextGameClicks += 1;
    }

    if (event.eventName === 'hub_return_click') {
      hubReturnClicks += 1;
    }

    if (exitEvents.has(event.eventName)) {
      const session = sessionsById.get(event.sessionId);
      const source = resolveSource(session);

      if (!exitsBySource[source]) {
        exitsBySource[source] = { exits: 0, sessions: sourceSessionsCount[source] || 0, exitRate: 0 };
      }
      exitsBySource[source].exits += 1;

      if (!exitsByGame[event.slug]) {
        exitsByGame[event.slug] = { exits: 0, sessions: gameSessionsCount[event.slug] || 0, exitRate: 0 };
      }
      exitsByGame[event.slug].exits += 1;

      if (!exitsByEngine[event.engineKind]) {
        exitsByEngine[event.engineKind] = { exits: 0, sessions: engineSessionsCount[event.engineKind] || 0, exitRate: 0 };
      }
      exitsByEngine[event.engineKind].exits += 1;
    }
  }

  for (const placement of Object.keys(ctrByPlacement)) {
    const point = ctrByPlacement[placement];
    point.ctr = point.outcomeViews > 0 ? Math.round((point.clicks / point.outcomeViews) * 100) : 0;
  }

  for (const source of Object.keys(exitsBySource)) {
    const row = exitsBySource[source];
    row.exitRate = computeExitRate(row.exits, row.sessions);
  }

  for (const slug of Object.keys(exitsByGame)) {
    const row = exitsByGame[slug];
    row.exitRate = computeExitRate(row.exits, row.sessions);
  }

  for (const engine of Object.keys(exitsByEngine)) {
    const row = exitsByEngine[engine];
    row.exitRate = computeExitRate(row.exits, row.sessions);
  }

  const topCtas = Object.entries(ctaClicks)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([ctaId, clicks]) => ({
      ctaId,
      clicks,
      trackingId: ctaTracking[ctaId],
      category: ctaCategory[ctaId],
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

function buildReadingCriteria(
  circulation: MetricsSnapshot['circulation'],
  cohorts: MetricsSnapshot['cohorts'],
  experimentScorecards: ReturnType<typeof buildExperimentScorecard>[],
): MetricsSnapshot['readingCriteria'] {
  const totalPlacementClicks = Object.values(circulation.ctrByPlacement).reduce((sum, row) => sum + row.clicks, 0);
  const sourceCohorts = Object.values(cohorts.bySource);

  const ctrComparable = totalPlacementClicks >= scorecardThresholds.minClicksPerPlacement;
  const shareReentryReadable = circulation.shareReentry.sharePageViews >= scorecardThresholds.minShareViewsForReentry;
  const sourceCohortsReadable = sourceCohorts.some((row) => row.sessions >= scorecardThresholds.minSessionsPerSource);
  const experimentReadable = experimentScorecards.some((scorecard) => scorecard.sampleMinReached);

  const warnings: string[] = [];

  if (!ctrComparable) {
    warnings.push(`CTR ainda cedo: ${totalPlacementClicks}/${scorecardThresholds.minClicksPerPlacement} clicks minimos por placement.`);
  }

  if (!shareReentryReadable) {
    warnings.push(
      `Share→reentry ainda cedo: ${circulation.shareReentry.sharePageViews}/${scorecardThresholds.minShareViewsForReentry} views de share page.`,
    );
  }

  if (!sourceCohortsReadable) {
    warnings.push('Coortes por origem com baixa amostra: evitar decisões por canal neste momento.');
  }

  if (!experimentReadable) {
    warnings.push('Experimentos ativos sem amostra mínima por variante para interpretação confiável.');
  }

  return {
    thresholds: scorecardThresholds,
    checks: {
      ctrComparable,
      shareReentryReadable,
      sourceCohortsReadable,
      experimentReadable,
    },
    warnings,
  };
}

function buildScorecardsFromSnapshot(
  snapshotExperiments: MetricsSnapshot['experiments'],
  window: TimeWindow = 'all',
  lastEventAt: Date | null = null,
) {
  const registry = listAllExperiments().filter((experiment) => experiment.enabled);

  return registry.map((experiment) => {
    const variantsMap = snapshotExperiments[experiment.key]?.variants || {};

    const variants = experiment.variants.map((variant) => {
      const row = variantsMap[variant.key];
      return {
        key: variant.key,
        sessions: Number(row?.sessions || 0),
        completions: Number(row?.completions || 0),
        completionRate: Number(row?.completionRate || 0),
      };
    });

    return buildExperimentScorecard({
      experiment,
      variants,
      window,
      lastEventAt,
    });
  });
}

export function collectLocalMetrics(
  gamesCatalog: Array<{ slug: string; title: string }>,
  window: TimeWindow = 'all',
): MetricsSnapshot {
  const sessions = getLocalArray<SessionRecord>('sessions');
  const events = getLocalArray<AnalyticsEventPayload>('events');
  const results = getLocalArray<ResultRecord>('results');

  // Filter by window
  const windowStart = getWindowStartDate(window);
  const filteredSessions = windowStart
    ? sessions.filter((session) => new Date(session.startedAt) >= windowStart)
    : sessions;
  const filteredEvents = windowStart
    ? events.filter((event) => new Date(event.createdAt) >= windowStart)
    : events;
  const filteredResults = windowStart
    ? results.filter((result) => new Date(result.createdAt) >= windowStart)
    : results;

  // Calculate lastEventAt
  let lastEventAt: Date | null = null;
  if (filteredEvents.length > 0) {
    lastEventAt = new Date(Math.max(...filteredEvents.map((event) => new Date(event.createdAt).getTime())));
  }

  const eventsByType: Record<string, number> = {};
  for (const event of filteredEvents) {
    eventsByType[event.event] = (eventsByType[event.event] || 0) + 1;
  }

  const conclusionsByEngine: Record<string, number> = {};
  for (const result of filteredResults) {
    conclusionsByEngine[result.engineKind] = (conclusionsByEngine[result.engineKind] || 0) + 1;
  }

  const sourceSessionsCount: Record<string, number> = {};
  const gameSessionsCount: Record<string, number> = {};
  const engineSessionsCount: Record<string, number> = {};

  const cohortsBySource: MetricsSnapshot['cohorts']['bySource'] = {};
  const cohortsByGame: MetricsSnapshot['cohorts']['byGame'] = {};
  const cohortsByEngine: MetricsSnapshot['cohorts']['byEngine'] = {};

  for (const session of filteredSessions) {
    const source = resolveSource(session);

    sourceSessionsCount[source] = (sourceSessionsCount[source] || 0) + 1;
    gameSessionsCount[session.slug] = (gameSessionsCount[session.slug] || 0) + 1;
    engineSessionsCount[session.engineKind] = (engineSessionsCount[session.engineKind] || 0) + 1;

    if (!cohortsBySource[source]) {
      cohortsBySource[source] = { sessions: 0, starts: 0, completions: 0, shares: 0, completionRate: 0 };
    }
    cohortsBySource[source].sessions += 1;
    if (session.status === 'completed') {
      cohortsBySource[source].completions += 1;
    }

    if (!cohortsByGame[session.slug]) {
      cohortsByGame[session.slug] = {
        sessions: 0,
        starts: 0,
        completions: 0,
        shares: 0,
        completionRate: 0,
        feedbackPositive: 0,
        feedbackNeutral: 0,
        feedbackNegative: 0,
      };
    }
    cohortsByGame[session.slug].sessions += 1;
    if (session.status === 'completed') {
      cohortsByGame[session.slug].completions += 1;
    }

    if (!cohortsByEngine[session.engineKind]) {
      cohortsByEngine[session.engineKind] = { sessions: 0, starts: 0, completions: 0, shares: 0, completionRate: 0 };
    }
    cohortsByEngine[session.engineKind].sessions += 1;
    if (session.status === 'completed') {
      cohortsByEngine[session.engineKind].completions += 1;
    }
  }

  const normalizedEvents: NormalizedEvent[] = filteredEvents.map((event) => ({
    sessionId: event.sessionId,
    eventName: event.event,
    slug: event.slug,
    engineKind: event.engineKind,
    ctaId: event.ctaId,
    metadata: event.metadata,
  }));

  for (const event of filteredEvents) {
    const source = resolveSource(filteredSessions.find((session) => session.sessionId === event.sessionId));

    if (event.event === 'game_start') {
      if (cohortsBySource[source]) {
        cohortsBySource[source].starts += 1;
      }
      if (cohortsByGame[event.slug]) {
        cohortsByGame[event.slug].starts += 1;
      }
      if (cohortsByEngine[event.engineKind]) {
        cohortsByEngine[event.engineKind].starts += 1;
      }
    }

    if (event.event === 'result_copy' || event.event === 'link_copy') {
      if (cohortsBySource[source]) {
        cohortsBySource[source].shares += 1;
      }
      if (cohortsByGame[event.slug]) {
        cohortsByGame[event.slug].shares += 1;
      }
      if (cohortsByEngine[event.engineKind]) {
        cohortsByEngine[event.engineKind].shares += 1;
      }
    }

    if (event.event === 'cta_click' && event.metadata?.type === 'micro_feedback') {
      const rating = String(event.metadata.rating || '');
      if (rating === 'positive') {
        cohortsByGame[event.slug].feedbackPositive += 1;
      } else if (rating === 'neutral') {
        cohortsByGame[event.slug].feedbackNeutral += 1;
      } else if (rating === 'negative') {
        cohortsByGame[event.slug].feedbackNegative += 1;
      }
    }
  }

  for (const source of Object.keys(cohortsBySource)) {
    const row = cohortsBySource[source];
    row.completionRate = row.sessions > 0 ? Math.round((row.completions / row.sessions) * 100) : 0;
  }

  for (const slug of Object.keys(cohortsByGame)) {
    const row = cohortsByGame[slug];
    row.completionRate = row.sessions > 0 ? Math.round((row.completions / row.sessions) * 100) : 0;
  }

  for (const engine of Object.keys(cohortsByEngine)) {
    const row = cohortsByEngine[engine];
    row.completionRate = row.sessions > 0 ? Math.round((row.completions / row.sessions) * 100) : 0;
  }

  const experimentsData: MetricsSnapshot['experiments'] = {};
  for (const session of filteredSessions) {
    for (const exp of session.experiments || []) {
      if (!experimentsData[exp.key]) {
        experimentsData[exp.key] = { name: exp.key, variants: {} };
      }

      if (!experimentsData[exp.key].variants[exp.variant]) {
        experimentsData[exp.key].variants[exp.variant] = { sessions: 0, completions: 0, completionRate: 0 };
      }

      const variant = experimentsData[exp.key].variants[exp.variant];
      variant.sessions += 1;
      if (session.status === 'completed') {
        variant.completions += 1;
      }
    }
  }

  for (const experimentKey of Object.keys(experimentsData)) {
    const variants = experimentsData[experimentKey].variants;
    for (const variantKey of Object.keys(variants)) {
      const variant = variants[variantKey];
      variant.completionRate = variant.sessions > 0 ? Math.round((variant.completions / variant.sessions) * 100) : 0;
    }
  }

  const circulation = buildCirculation(
    filteredSessions,
    normalizedEvents,
    sourceSessionsCount,
    gameSessionsCount,
    engineSessionsCount,
  );

  const gamesSorted = gamesCatalog
    .map((game) => {
      const cohort = cohortsByGame[game.slug];
      return {
        slug: game.slug,
        title: game.title,
        initiated: cohort?.sessions || 0,
        completed: cohort?.completions || 0,
        shares: cohort?.shares || 0,
        completionRate: cohort?.completionRate || 0,
      };
    })
    .sort((a, b) => b.initiated - a.initiated);

  const completedSessions = filteredSessions.filter((session) => session.status === 'completed').length;
  const experimentScorecards = buildScorecardsFromSnapshot(experimentsData, window, lastEventAt);

  return {
    source: 'local',
    environment: determineEnvironment('local', false),
    window,
    lastEventAt,
    totalSessions: filteredSessions.length,
    completedSessions,
    totalEvents: filteredEvents.length,
    eventsByType,
    conclusionsByEngine,
    sources: sourceSessionsCount,
    funnel: {
      starts: filteredEvents.filter((event) => event.event === 'game_start').length,
      completions: completedSessions,
      shares: filteredEvents.filter((event) => event.event === 'result_copy' || event.event === 'link_copy').length,
    },
    gamesSorted,
    cohorts: {
      bySource: cohortsBySource,
      byGame: cohortsByGame,
      byEngine: cohortsByEngine,
    },
    experiments: experimentsData,
    circulation,
    readingCriteria: buildReadingCriteria(circulation, { bySource: cohortsBySource, byGame: cohortsByGame, byEngine: cohortsByEngine }, experimentScorecards),
    experimentScorecards,
    generatedAt: new Date().toISOString(),
  };
}

interface RemoteFunnelRow {
  total_sessions: number;
  starts: number;
  completions: number;
  shares: number;
  total_events: number;
}

interface RemoteSourceRow {
  source: string;
  sessions: number;
  starts: number;
  completions: number;
  shares: number;
  completion_rate: number;
}

interface RemoteGameRow {
  slug: string;
  initiated: number;
  completed: number;
  shares: number;
  completion_rate: number;
  feedback_positive?: number;
  feedback_neutral?: number;
  feedback_negative?: number;
}

interface RemoteEngineRow {
  engine_kind: string;
  sessions: number;
  starts: number;
  completions: number;
  shares: number;
  completion_rate: number;
}

interface RemoteEventRow {
  event_name: string;
  total: number;
}

interface RemoteExperimentRow {
  experiment_key: string;
  variant: string;
  sessions: number;
  completions: number;
  completion_rate: number;
}

interface RemoteRawEventRow {
  session_id: string;
  event_name: string;
  slug: string;
  engine_kind: string;
  cta_id?: string;
  metadata?: Record<string, unknown>;
}

interface RemoteRawSessionRow {
  session_id: string;
  slug: string;
  engine_kind: string;
  status: 'started' | 'completed';
  utm_source?: string | null;
  referrer?: string | null;
}

async function collectRemoteMetrics(
  gamesCatalog: Array<{ slug: string; title: string }>,
  window: TimeWindow = 'all',
): Promise<MetricsSnapshot | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  try {
    const [
      funnelRes,
      sourcesRes,
      gamesRes,
      engineRes,
      eventsRes,
      experimentsRes,
      rawEventsRes,
      rawSessionsRes,
    ] = await Promise.all([
      (supabase as any).from('beta_funnel_overview').select('*').limit(1),
      (supabase as any).from('beta_sources_overview').select('*').limit(100),
      (supabase as any).from('beta_game_overview').select('*').limit(100),
      (supabase as any).from('beta_engine_overview').select('*').limit(50),
      (supabase as any).from('beta_events_overview').select('*').limit(200),
      (supabase as any).from('experiment_performance').select('*').limit(300),
      (supabase as any)
        .from('game_events')
        .select('session_id,event_name,slug,engine_kind,cta_id,metadata')
        .in('event_name', ['outcome_view', 'primary_cta_click', 'secondary_cta_click', 'share_page_view', 'next_game_click', 'hub_return_click'])
        .limit(10000),
      (supabase as any)
        .from('game_sessions')
        .select('session_id,slug,engine_kind,status,utm_source,referrer')
        .limit(10000),
    ]);

    if (funnelRes.error || !funnelRes.data || funnelRes.data.length === 0) {
      return null;
    }

    const funnel = funnelRes.data[0] as RemoteFunnelRow;
    const sourceRows = (sourcesRes.data || []) as RemoteSourceRow[];
    const gameRows = (gamesRes.data || []) as RemoteGameRow[];
    const engineRows = (engineRes.data || []) as RemoteEngineRow[];
    const eventRows = (eventsRes.data || []) as RemoteEventRow[];
    const experimentRows = (experimentsRes.data || []) as RemoteExperimentRow[];

    const sessions = ((rawSessionsRes.data || []) as RemoteRawSessionRow[]).map<SessionRecord>((row) => ({
      sessionId: row.session_id,
      anonymousId: 'remote',
      slug: row.slug,
      engineKind: row.engine_kind,
      status: row.status,
      startedAt: '',
      utm_source: row.utm_source || undefined,
      referrer: row.referrer || undefined,
    }));

    const sourceSessionsCount: Record<string, number> = {};
    const gameSessionsCount: Record<string, number> = {};
    const engineSessionsCount: Record<string, number> = {};

    for (const session of sessions) {
      const source = resolveSource(session);
      sourceSessionsCount[source] = (sourceSessionsCount[source] || 0) + 1;
      gameSessionsCount[session.slug] = (gameSessionsCount[session.slug] || 0) + 1;
      engineSessionsCount[session.engineKind] = (engineSessionsCount[session.engineKind] || 0) + 1;
    }

    const normalizedEvents = ((rawEventsRes.data || []) as RemoteRawEventRow[]).map<NormalizedEvent>((row) => ({
      sessionId: row.session_id,
      eventName: row.event_name,
      slug: row.slug,
      engineKind: row.engine_kind,
      ctaId: row.cta_id,
      metadata: row.metadata,
    }));

    const sources: Record<string, number> = {};
    const cohortsBySource: MetricsSnapshot['cohorts']['bySource'] = {};
    for (const row of sourceRows) {
      sources[row.source] = Number(row.sessions || 0);
      cohortsBySource[row.source] = {
        sessions: Number(row.sessions || 0),
        starts: Number(row.starts || 0),
        completions: Number(row.completions || 0),
        shares: Number(row.shares || 0),
        completionRate: Number(row.completion_rate || 0),
      };
    }

    const gamesMap = new Map(gameRows.map((row) => [row.slug, row]));
    const cohortsByGame: MetricsSnapshot['cohorts']['byGame'] = {};
    const gamesSorted = gamesCatalog
      .map((game) => {
        const row = gamesMap.get(game.slug);
        const initiated = Number(row?.initiated || 0);
        const completed = Number(row?.completed || 0);
        const shares = Number(row?.shares || 0);

        cohortsByGame[game.slug] = {
          sessions: initiated,
          starts: initiated,
          completions: completed,
          shares,
          completionRate: Number(row?.completion_rate || 0),
          feedbackPositive: Number(row?.feedback_positive || 0),
          feedbackNeutral: Number(row?.feedback_neutral || 0),
          feedbackNegative: Number(row?.feedback_negative || 0),
        };

        return {
          slug: game.slug,
          title: game.title,
          initiated,
          completed,
          shares,
          completionRate: Number(row?.completion_rate || 0),
        };
      })
      .sort((a, b) => b.initiated - a.initiated);

    const conclusionsByEngine: Record<string, number> = {};
    const cohortsByEngine: MetricsSnapshot['cohorts']['byEngine'] = {};
    for (const row of engineRows) {
      conclusionsByEngine[row.engine_kind] = Number(row.completions || 0);
      cohortsByEngine[row.engine_kind] = {
        sessions: Number(row.sessions || 0),
        starts: Number(row.starts || 0),
        completions: Number(row.completions || 0),
        shares: Number(row.shares || 0),
        completionRate: Number(row.completion_rate || 0),
      };
    }

    const eventsByType: Record<string, number> = {};
    for (const row of eventRows) {
      eventsByType[row.event_name] = Number(row.total || 0);
    }

    const experiments: MetricsSnapshot['experiments'] = {};
    for (const row of experimentRows) {
      if (!experiments[row.experiment_key]) {
        experiments[row.experiment_key] = {
          name: row.experiment_key,
          variants: {},
        };
      }

      experiments[row.experiment_key].variants[row.variant] = {
        sessions: Number(row.sessions || 0),
        completions: Number(row.completions || 0),
        completionRate: Number(row.completion_rate || 0),
      };
    }

    const circulation = buildCirculation(
      sessions,
      normalizedEvents,
      sourceSessionsCount,
      gameSessionsCount,
      engineSessionsCount,
    );

    // Calculate lastEventAt from raw events if available
    // For simplicity, we'll use 'now' as a placeholder if we can't determine from data
    // In production, you might query created_at from game_events directly
    const lastEventAt = normalizedEvents.length > 0 ? new Date() : null;

    const experimentScorecards = buildScorecardsFromSnapshot(experiments, window, lastEventAt);

    return {
      source: 'supabase',
      environment: determineEnvironment('supabase', true),
      window,
      lastEventAt,
      totalSessions: Number(funnel.total_sessions || 0),
      completedSessions: Number(funnel.completions || 0),
      totalEvents: Number(funnel.total_events || 0),
      eventsByType,
      conclusionsByEngine,
      sources,
      funnel: {
        starts: Number(funnel.starts || 0),
        completions: Number(funnel.completions || 0),
        shares: Number(funnel.shares || 0),
      },
      gamesSorted,
      cohorts: {
        bySource: cohortsBySource,
        byGame: cohortsByGame,
        byEngine: cohortsByEngine,
      },
      experiments,
      circulation,
      readingCriteria: buildReadingCriteria(circulation, { bySource: cohortsBySource, byGame: cohortsByGame, byEngine: cohortsByEngine }, experimentScorecards),
      experimentScorecards,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function collectBestAvailableMetrics(
  gamesCatalog: Array<{ slug: string; title: string }>,
  window: TimeWindow = 'all',
): Promise<MetricsSnapshot> {
  const remote = await collectRemoteMetrics(gamesCatalog, window);

  if (remote) {
    return remote;
  }

  return collectLocalMetrics(gamesCatalog, window);
}

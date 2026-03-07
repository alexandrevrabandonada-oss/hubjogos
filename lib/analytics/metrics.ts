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

type CollectionStatus = 'coleta-insuficiente' | 'coleta-em-andamento' | 'coleta-minima-atingida' | 'pronto-para-priorizacao';

interface QuickRow {
  slug: string;
  title: string;
  sessions: number;
  starts: number;
  completions: number;
  replays: number;
  shares: number;
  postGameCtaClicks: number;
  finalCardInteractions: number;
  sharePagePlayClicks: number;
  firstInteractionCount: number;
  firstInteractionAvgMs: number;
  qrViews: number;
  qrClicks: number;
  completionRate: number;
  replayRate: number;
  shareRate: number;
  postGameCtaRate: number;
  reentryRate: number;
  qrCtr: number;
  firstInteractionScore: number;
  stickyScore: number;
}

interface ArcadeRow {
  slug: string;
  title: string;
  runs: number;
  runEnds: number;
  scoreCount: number;
  scoreAverage: number;
  replayClicks: number;
  firstInputCount: number;
  firstInputAvgMs: number;
  campaignCtaClicks: number;
  powerupCollects: number;
  runEndRate: number;
  replayRate: number;
}

interface CollectionTargets {
  quick: {
    sessions: number;
    starts: number;
    completions: number;
    shares: number;
    replays: number;
  };
  series: {
    sessions: number;
    starts: number;
    completions: number;
    shares: number;
  };
  territory: {
    sessions: number;
    starts: number;
    completions: number;
    shares: number;
  };
  qrVariant: {
    sessions: number;
    qrViews: number;
    qrClicks: number;
  };
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
  quickInsights: {
    quickComparison: QuickRow[];
    rankingByStickiness: QuickRow[];
    qrExperimentSummary: Record<string, {
      sessions: number;
      completions: number;
      completionRate: number;
      finalCardViews: number;
      qrViews: number;
      qrClicks: number;
      qrCtr: number;
      status: 'cedo-demais' | 'monitorando' | 'sinal-direcional';
      deltaVsBaselinePct: number;
    }>;
    heuristic: {
      weights: {
        completionRate: number;
        replayRate: number;
        shareRate: number;
        postGameCtaRate: number;
        reentryRate: number;
        firstInteractionScore: number;
      };
      minSampleSessions: number;
      minQrVariantSessions: number;
      directionalLiftPct: number;
    };
    collectionTargets: CollectionTargets;
    collectionStatus: {
      byQuick: Record<string, {
        status: CollectionStatus;
        progress: {
          sessions: number;
          starts: number;
          completions: number;
          shares: number;
          replays: number;
        };
        progressPct: number;
      }>;
      bySeries: Record<string, {
        status: CollectionStatus;
        progress: {
          sessions: number;
          starts: number;
          completions: number;
          shares: number;
        };
        progressPct: number;
        gamesInSeries: string[];
      }>;
      byTerritory: Record<string, {
        status: CollectionStatus;
        progress: {
          sessions: number;
          starts: number;
          completions: number;
          shares: number;
        };
        progressPct: number;
        gamesInTerritory: string[];
        topGameSlug?: string;
        topGameSessions?: number;
      }>;
      qrExperiment: {
        status: CollectionStatus;
        progressByVariant: Record<string, {
          sessions: number;
          qrViews: number;
          qrClicks: number;
          progressPct: number;
        }>;
      };
    };
    warnings: string[];
  };
  arcadeInsights: {
    overview: {
      runs: number;
      runEnds: number;
      runEndRate: number;
      scoreAverage: number;
      replayClicks: number;
      replayRate: number;
      firstInputAvgMs: number;
      campaignCtaClicks: number;
      powerupCollects: number;
      quickStarts: number;
      quickReplays: number;
      quickReplayRate: number;
    };
    byArcadeGame: ArcadeRow[];
  };
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

type SessionWithExperiments = Pick<SessionRecord, 'sessionId' | 'slug' | 'status'> & {
  experiments?: unknown;
};

function normalizeExperimentsPayload(value: unknown): Array<{ key: string; variant: string }> {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is { key: string; variant: string } =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as { key?: unknown }).key === 'string' &&
        typeof (item as { variant?: unknown }).variant === 'string',
    );
  }

  if (typeof value === 'string') {
    try {
      return normalizeExperimentsPayload(JSON.parse(value));
    } catch {
      return [];
    }
  }

  return [];
}

function getQuickInsights(
  gamesCatalog: Array<{ slug: string; title: string; pace?: string; kind?: string }>,
  sessions: SessionWithExperiments[],
  events: NormalizedEvent[],
  window: TimeWindow = 'all',
): MetricsSnapshot['quickInsights'] {
  const quickGames = gamesCatalog.filter((game) => game.pace === 'quick');
  const quickSlugs = new Set(quickGames.map((game) => game.slug));
  const titleBySlug = new Map(quickGames.map((game) => [game.slug, game.title]));

  const rows: Record<string, Omit<QuickRow, 'completionRate' | 'replayRate' | 'shareRate' | 'postGameCtaRate' | 'reentryRate' | 'qrCtr' | 'firstInteractionScore' | 'stickyScore'>> = {};
  const firstInteractionSums: Record<string, { total: number; count: number }> = {};

  for (const slug of quickSlugs) {
    rows[slug] = {
      slug,
      title: titleBySlug.get(slug) || slug,
      sessions: 0,
      starts: 0,
      completions: 0,
      replays: 0,
      shares: 0,
      postGameCtaClicks: 0,
      finalCardInteractions: 0,
      sharePagePlayClicks: 0,
      firstInteractionCount: 0,
      firstInteractionAvgMs: 0,
      qrViews: 0,
      qrClicks: 0,
    };
  }

  for (const session of sessions) {
    if (!quickSlugs.has(session.slug) || !rows[session.slug]) {
      continue;
    }
    rows[session.slug].sessions += 1;
    if (session.status === 'completed') {
      rows[session.slug].completions += 1;
    }
  }

  for (const event of events) {
    const slug = event.slug;
    if (!quickSlugs.has(slug) || !rows[slug]) {
      continue;
    }

    if (event.eventName === 'game_start') {
      rows[slug].starts += 1;
    }

    if (event.eventName === 'quick_minigame_replay' || event.eventName === 'replay_click' || event.eventName === 'outcome_replay_intent') {
      rows[slug].replays += 1;
    }

    if (event.eventName === 'result_copy' || event.eventName === 'link_copy' || event.eventName === 'final_card_share_click') {
      rows[slug].shares += 1;
    }

    if (event.eventName === 'primary_cta_click' || event.eventName === 'secondary_cta_click' || event.eventName === 'campaign_cta_click_after_game') {
      rows[slug].postGameCtaClicks += 1;
    }

    if (
      event.eventName === 'final_card_view' ||
      event.eventName === 'final_card_download' ||
      event.eventName === 'final_card_share_click' ||
      event.eventName === 'final_card_qr_click'
    ) {
      rows[slug].finalCardInteractions += 1;
    }

    if (event.eventName === 'share_page_play_click') {
      rows[slug].sharePagePlayClicks += 1;
    }

    if (event.eventName === 'final_card_qr_view') {
      rows[slug].qrViews += 1;
    }

    if (event.eventName === 'final_card_qr_click') {
      rows[slug].qrClicks += 1;
    }

    if (event.eventName === 'first_interaction_time') {
      rows[slug].firstInteractionCount += 1;
      const value = Number(event.metadata?.msSinceStart || 0);
      if (value > 0) {
        const bucket = firstInteractionSums[slug] || { total: 0, count: 0 };
        bucket.total += value;
        bucket.count += 1;
        firstInteractionSums[slug] = bucket;
      }
    }
  }

  const enrichedRows = Object.values(rows).map((row) => {
    const first = firstInteractionSums[row.slug];
    return {
      ...row,
      firstInteractionAvgMs: first && first.count > 0 ? Math.round(first.total / first.count) : 0,
      completionRate: row.sessions > 0 ? Math.round((row.completions / row.sessions) * 100) : 0,
      replayRate: row.completions > 0 ? Math.round((row.replays / row.completions) * 100) : 0,
      shareRate: row.completions > 0 ? Math.round((row.shares / row.completions) * 100) : 0,
      postGameCtaRate: row.completions > 0 ? Math.round((row.postGameCtaClicks / row.completions) * 100) : 0,
      reentryRate: row.shares > 0 ? Math.round((row.sharePagePlayClicks / row.shares) * 100) : 0,
      qrCtr: row.qrViews > 0 ? Math.round((row.qrClicks / row.qrViews) * 100) : 0,
      firstInteractionScore: 0,
      stickyScore: 0,
    };
  });

  const maxFirstInteraction = Math.max(0, ...enrichedRows.map((row) => row.firstInteractionAvgMs));
  const weights = {
    completionRate: 0.3,
    replayRate: 0.2,
    shareRate: 0.2,
    postGameCtaRate: 0.15,
    reentryRate: 0.1,
    firstInteractionScore: 0.05,
  };

  const scoredRows = enrichedRows.map((row) => {
    const firstInteractionScore =
      maxFirstInteraction > 0 && row.firstInteractionAvgMs > 0
        ? Math.round((1 - (row.firstInteractionAvgMs / maxFirstInteraction)) * 100)
        : 0;

    const stickyScore = Math.round(
      (row.completionRate * weights.completionRate) +
      (row.replayRate * weights.replayRate) +
      (row.shareRate * weights.shareRate) +
      (row.postGameCtaRate * weights.postGameCtaRate) +
      (row.reentryRate * weights.reentryRate) +
      (firstInteractionScore * weights.firstInteractionScore),
    );

    return {
      ...row,
      firstInteractionScore,
      stickyScore,
    };
  });

  const qrByVariant: Record<string, {
    sessions: number;
    completions: number;
    finalCardViews: number;
    qrViews: number;
    qrClicks: number;
  }> = {
    'with-qr': { sessions: 0, completions: 0, finalCardViews: 0, qrViews: 0, qrClicks: 0 },
    'without-qr': { sessions: 0, completions: 0, finalCardViews: 0, qrViews: 0, qrClicks: 0 },
  };

  const variantBySession: Record<string, string> = {};
  for (const session of sessions) {
    const experiments = normalizeExperimentsPayload(session.experiments);
    const qrExperiment = experiments.find((item) => item.key === 'final-card-qr-code');
    if (!qrExperiment || !qrByVariant[qrExperiment.variant]) {
      continue;
    }
    variantBySession[session.sessionId] = qrExperiment.variant;
    qrByVariant[qrExperiment.variant].sessions += 1;
    if (session.status === 'completed') {
      qrByVariant[qrExperiment.variant].completions += 1;
    }
  }

  for (const event of events) {
    const variant = variantBySession[event.sessionId];
    if (!variant || !qrByVariant[variant]) {
      continue;
    }

    if (event.eventName === 'final_card_view') {
      qrByVariant[variant].finalCardViews += 1;
    }
    if (event.eventName === 'final_card_qr_view') {
      qrByVariant[variant].qrViews += 1;
    }
    if (event.eventName === 'final_card_qr_click') {
      qrByVariant[variant].qrClicks += 1;
    }
  }

  const minQrVariantSessions = 30;
  const directionalLiftPct = 15;
  const withQrCtr = qrByVariant['with-qr'].qrViews > 0
    ? (qrByVariant['with-qr'].qrClicks / qrByVariant['with-qr'].qrViews) * 100
    : 0;
  const withoutQrCtr = qrByVariant['without-qr'].qrViews > 0
    ? (qrByVariant['without-qr'].qrClicks / qrByVariant['without-qr'].qrViews) * 100
    : 0;
  const deltaVsBaselinePct = Number((withQrCtr - withoutQrCtr).toFixed(2));

  const qrExperimentSummary = Object.fromEntries(
    Object.entries(qrByVariant).map(([variant, row]) => {
      const completionRate = row.sessions > 0 ? Math.round((row.completions / row.sessions) * 100) : 0;
      const qrCtr = row.qrViews > 0 ? Math.round((row.qrClicks / row.qrViews) * 100) : 0;
      const minSample = Math.min(qrByVariant['with-qr'].sessions, qrByVariant['without-qr'].sessions);
      const status: 'cedo-demais' | 'monitorando' | 'sinal-direcional' =
        minSample < minQrVariantSessions
          ? 'cedo-demais'
          : Math.abs(deltaVsBaselinePct) >= directionalLiftPct
            ? 'sinal-direcional'
            : 'monitorando';

      return [
        variant,
        {
          sessions: row.sessions,
          completions: row.completions,
          completionRate,
          finalCardViews: row.finalCardViews,
          qrViews: row.qrViews,
          qrClicks: row.qrClicks,
          qrCtr,
          status,
          deltaVsBaselinePct,
        },
      ];
    }),
  );

  const minSampleSessions = 12;
  const warnings: string[] = [];
  if (scoredRows.length === 0) {
    warnings.push('Sem sessões quick na janela atual para comparação entre jogos.');
  }
  const lowSampleRows = scoredRows.filter((row) => row.sessions < minSampleSessions).map((row) => row.title);
  if (lowSampleRows.length > 0) {
    warnings.push(`Amostra baixa por quick (min ${minSampleSessions} sessões): ${lowSampleRows.join(', ')}.`);
  }

  const qrMinSample = Math.min(qrByVariant['with-qr'].sessions, qrByVariant['without-qr'].sessions);
  if (qrMinSample < minQrVariantSessions) {
    warnings.push(`QR A/B ainda cedo: ${qrMinSample}/${minQrVariantSessions} sessões mínimas por variante.`);
  }

  // Tijolo 27: Metas mínimas de coleta baseadas na janela temporal
  const collectionTargets: CollectionTargets = window === '7d'
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

  // Função auxiliar para calcular status de coleta
  function getCollectionStatus(current: number, target: number): CollectionStatus {
    const pct = target > 0 ? (current / target) * 100 : 0;
    if (pct < 50) {
      return 'coleta-insuficiente';
    }
    if (pct < 100) {
      return 'coleta-em-andamento';
    }
    return 'coleta-minima-atingida';
  }

  // Status por quick
  const byQuick: Record<string, {
    status: CollectionStatus;
    progress: { sessions: number; starts: number; completions: number; shares: number; replays: number };
    progressPct: number;
  }> = {};

  for (const row of scoredRows) {
    const progressValues = [
      row.sessions / collectionTargets.quick.sessions,
      row.starts / collectionTargets.quick.starts,
      row.completions / collectionTargets.quick.completions,
      row.shares / collectionTargets.quick.shares,
      row.replays / collectionTargets.quick.replays,
    ];
    const avgProgress = (progressValues.reduce((sum, val) => sum + val, 0) / progressValues.length) * 100;
    byQuick[row.slug] = {
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

  // Status por série (agrupando quicks)
  // Por ora, vou assumir que o catálogo não está disponível aqui com série/território.
  // Vamos deixar isso vazio por enquanto e implementar no circulation-utils.js que tem acesso ao catalog completo.
  const bySeries: Record<string, {
    status: CollectionStatus;
    progress: { sessions: number; starts: number; completions: number; shares: number };
    progressPct: number;
    gamesInSeries: string[];
  }> = {};

  const byTerritory: Record<string, {
    status: CollectionStatus;
    progress: { sessions: number; starts: number; completions: number; shares: number };
    progressPct: number;
    gamesInTerritory: string[];
  }> = {};

  // Status QR Experiment
  const qrProgressByVariant: Record<string, { sessions: number; qrViews: number; qrClicks: number; progressPct: number }> = {};
  for (const [variant, data] of Object.entries(qrByVariant)) {
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
    quickComparison: scoredRows.sort((a, b) => b.sessions - a.sessions),
    rankingByStickiness: [...scoredRows].sort((a, b) => b.stickyScore - a.stickyScore),
    qrExperimentSummary,
    heuristic: {
      weights,
      minSampleSessions,
      minQrVariantSessions,
      directionalLiftPct,
    },
    collectionTargets,
    collectionStatus: {
      byQuick,
      bySeries,
      byTerritory,
      qrExperiment: {
        status: qrExperimentStatus,
        progressByVariant: qrProgressByVariant,
      },
    },
    warnings,
  };
}

function getArcadeInsights(
  gamesCatalog: Array<{ slug: string; title: string; pace?: string; kind?: string }>,
  events: NormalizedEvent[],
): MetricsSnapshot['arcadeInsights'] {
  const arcadeGames = gamesCatalog.filter((game) => game.kind === 'arcade');
  const arcadeSlugs = new Set(arcadeGames.map((game) => game.slug));
  const quickSlugs = new Set(gamesCatalog.filter((game) => game.pace === 'quick').map((game) => game.slug));

  const rowsBySlug: Record<string, ArcadeRow> = {};
  for (const game of arcadeGames) {
    rowsBySlug[game.slug] = {
      slug: game.slug,
      title: game.title,
      runs: 0,
      runEnds: 0,
      scoreCount: 0,
      scoreAverage: 0,
      replayClicks: 0,
      firstInputCount: 0,
      firstInputAvgMs: 0,
      campaignCtaClicks: 0,
      powerupCollects: 0,
      runEndRate: 0,
      replayRate: 0,
    };
  }

  const scoreSums: Record<string, number> = {};
  const firstInputSums: Record<string, number> = {};

  let quickStarts = 0;
  let quickReplays = 0;

  for (const event of events) {
    if (quickSlugs.has(event.slug) && event.eventName === 'game_start') {
      quickStarts += 1;
    }
    if (
      quickSlugs.has(event.slug) &&
      (event.eventName === 'quick_minigame_replay' ||
        event.eventName === 'replay_click' ||
        event.eventName === 'outcome_replay_intent')
    ) {
      quickReplays += 1;
    }

    if (!arcadeSlugs.has(event.slug) || !rowsBySlug[event.slug]) {
      continue;
    }

    const row = rowsBySlug[event.slug];

    if (event.eventName === 'arcade_run_start') {
      row.runs += 1;
    }

    if (event.eventName === 'arcade_run_end') {
      row.runEnds += 1;
    }

    if (event.eventName === 'arcade_replay_click') {
      row.replayClicks += 1;
    }

    if (event.eventName === 'arcade_campaign_cta_click') {
      row.campaignCtaClicks += 1;
    }

    if (event.eventName === 'arcade_powerup_collect') {
      row.powerupCollects += 1;
    }

    if (event.eventName === 'arcade_score') {
      const score = Number(event.metadata?.score || 0);
      if (Number.isFinite(score) && score >= 0) {
        scoreSums[row.slug] = (scoreSums[row.slug] || 0) + score;
        row.scoreCount += 1;
      }
    }

    if (event.eventName === 'arcade_first_input_time') {
      const ms = Number(event.metadata?.msSinceStart || 0);
      if (Number.isFinite(ms) && ms >= 0) {
        firstInputSums[row.slug] = (firstInputSums[row.slug] || 0) + ms;
        row.firstInputCount += 1;
      }
    }
  }

  const byArcadeGame = Object.values(rowsBySlug)
    .map((row) => {
      const scoreAverage = row.scoreCount > 0 ? Math.round((scoreSums[row.slug] || 0) / row.scoreCount) : 0;
      const firstInputAvgMs =
        row.firstInputCount > 0 ? Math.round((firstInputSums[row.slug] || 0) / row.firstInputCount) : 0;
      const runEndRate = row.runs > 0 ? Math.round((row.runEnds / row.runs) * 100) : 0;
      const replayRate = row.runEnds > 0 ? Math.round((row.replayClicks / row.runEnds) * 100) : 0;

      return {
        ...row,
        scoreAverage,
        firstInputAvgMs,
        runEndRate,
        replayRate,
      };
    })
    .sort((a, b) => b.runs - a.runs);

  const runs = byArcadeGame.reduce((sum, row) => sum + row.runs, 0);
  const runEnds = byArcadeGame.reduce((sum, row) => sum + row.runEnds, 0);
  const replayClicks = byArcadeGame.reduce((sum, row) => sum + row.replayClicks, 0);
  const campaignCtaClicks = byArcadeGame.reduce((sum, row) => sum + row.campaignCtaClicks, 0);
  const powerupCollects = byArcadeGame.reduce((sum, row) => sum + row.powerupCollects, 0);

  const scoreWeightedSum = byArcadeGame.reduce((sum, row) => sum + row.scoreAverage * row.scoreCount, 0);
  const scoreCount = byArcadeGame.reduce((sum, row) => sum + row.scoreCount, 0);
  const firstInputWeightedSum = byArcadeGame.reduce((sum, row) => sum + row.firstInputAvgMs * row.firstInputCount, 0);
  const firstInputCount = byArcadeGame.reduce((sum, row) => sum + row.firstInputCount, 0);

  return {
    overview: {
      runs,
      runEnds,
      runEndRate: runs > 0 ? Math.round((runEnds / runs) * 100) : 0,
      scoreAverage: scoreCount > 0 ? Math.round(scoreWeightedSum / scoreCount) : 0,
      replayClicks,
      replayRate: runEnds > 0 ? Math.round((replayClicks / runEnds) * 100) : 0,
      firstInputAvgMs: firstInputCount > 0 ? Math.round(firstInputWeightedSum / firstInputCount) : 0,
      campaignCtaClicks,
      powerupCollects,
      quickStarts,
      quickReplays,
      quickReplayRate: quickStarts > 0 ? Math.round((quickReplays / quickStarts) * 100) : 0,
    },
    byArcadeGame,
  };
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
  gamesCatalog: Array<{ slug: string; title: string; pace?: string; kind?: string }>,
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
  const quickInsights = getQuickInsights(
    gamesCatalog,
    filteredSessions as SessionWithExperiments[],
    normalizedEvents,
    window,
  );
  const arcadeInsights = getArcadeInsights(gamesCatalog, normalizedEvents);

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
    quickInsights,
    arcadeInsights,
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
  created_at?: string;
}

interface RemoteRawSessionRow {
  session_id: string;
  slug: string;
  engine_kind: string;
  status: 'started' | 'completed';
  utm_source?: string | null;
  referrer?: string | null;
  experiments?: Array<{ key: string; variant: string }> | string | null;
  started_at?: string;
}

async function collectRemoteMetrics(
  gamesCatalog: Array<{ slug: string; title: string; pace?: string; kind?: string }>,
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
        .select('session_id,event_name,slug,engine_kind,cta_id,metadata,created_at')
        .in('event_name', [
          'game_start',
          'arcade_run_start',
          'arcade_run_end',
          'arcade_score',
          'arcade_first_input_time',
          'arcade_replay_click',
          'arcade_powerup_collect',
          'arcade_campaign_cta_click',
          'outcome_view',
          'primary_cta_click',
          'secondary_cta_click',
          'campaign_cta_click_after_game',
          'share_page_view',
          'share_page_play_click',
          'next_game_click',
          'hub_return_click',
          'result_copy',
          'link_copy',
          'final_card_view',
          'final_card_download',
          'final_card_share_click',
          'final_card_qr_view',
          'final_card_qr_click',
          'quick_minigame_replay',
          'replay_click',
          'outcome_replay_intent',
          'first_interaction_time',
        ])
        .limit(10000),
      (supabase as any)
        .from('game_sessions')
        .select('session_id,slug,engine_kind,status,utm_source,referrer,experiments,started_at')
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
      startedAt: row.started_at || new Date().toISOString(),
      utm_source: row.utm_source || undefined,
      referrer: row.referrer || undefined,
      experiments: normalizeExperimentsPayload(row.experiments),
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

    const rawEventRows = (rawEventsRes.data || []) as RemoteRawEventRow[];
    const normalizedEvents = rawEventRows.map<NormalizedEvent>((row) => ({
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

    const lastEventAt = rawEventRows
      .map((row) => (row.created_at ? new Date(row.created_at).getTime() : 0))
      .filter((value) => value > 0)
      .reduce((max, value) => (value > max ? value : max), 0);
    const resolvedLastEventAt = lastEventAt > 0 ? new Date(lastEventAt) : null;

    const experimentScorecards = buildScorecardsFromSnapshot(experiments, window, resolvedLastEventAt);
    const quickInsights = getQuickInsights(gamesCatalog, sessions, normalizedEvents, window);
    const arcadeInsights = getArcadeInsights(gamesCatalog, normalizedEvents);

    return {
      source: 'supabase',
      environment: determineEnvironment('supabase', true),
      window,
      lastEventAt: resolvedLastEventAt,
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
      quickInsights,
      arcadeInsights,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function collectBestAvailableMetrics(
  gamesCatalog: Array<{ slug: string; title: string; pace?: string; kind?: string }>,
  window: TimeWindow = 'all',
): Promise<MetricsSnapshot> {
  const remote = await collectRemoteMetrics(gamesCatalog, window);

  if (remote) {
    return remote;
  }

  return collectLocalMetrics(gamesCatalog, window);
}

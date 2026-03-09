/**
 * Helpers para agregação de métricas locais e remotas
 * Tijolo 18: suporte a janelas temporais e ambiente explícito
 */

import { getLocalArray } from '@/lib/storage/local-session';
import type { SessionRecord, AnalyticsEventPayload, ResultRecord, AnalyticsEventName } from '@/lib/analytics/events';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { buildExperimentScorecard, scorecardThresholds } from '@/lib/experiments/scorecard';
import { listAllExperiments } from '@/lib/experiments/config';
import type { TimeWindow, DataEnvironment } from './windowing';
import { getWindowStartDate, determineEnvironment } from './windowing';
import type { EffectiveRunsAnalysis } from './effective-runs';
import { analyzeEffectiveRuns } from './effective-runs';

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

type ArcadeDecisionState =
  | 'insufficient_sample'
  | 'early_signal'
  | 'directional_lead'
  | 'candidate_flagship'
  | 'ready_for_next_step';

type ArcadeSlug = 'tarifa-zero-corredor' | 'mutirao-do-bairro';

interface ArcadeCampaignStrengthRow {
  slug: string;
  title: string;
  runs: number;
  runEndRate: number;
  replayRate: number;
  campaignCtaRate: number;
  firstInputAvgMs: number;
  weightedScore: number;
}

interface ArcadeDuelDimension {
  key: 'runs' | 'run_end_rate' | 'replay_rate' | 'campaign_cta_rate' | 'first_input_time' | 'engagement_index';
  label: string;
  tarifaValue: number;
  mutiraoValue: number;
  winner: 'tarifa-zero-corredor' | 'mutirao-do-bairro' | 'tie';
  weight: number;
}

interface ArcadeLineDecision {
  compared: {
    tarifaSlug: string;
    mutiraoSlug: string;
  };
  sample: {
    tarifaRuns: number;
    mutiraoRuns: number;
    minRunsForSignal: number;
    minRunsForReadiness: number;
  };
  campaignStrength: {
    tarifa: ArcadeCampaignStrengthRow;
    mutirao: ArcadeCampaignStrengthRow;
    winner: 'tarifa-zero-corredor' | 'mutirao-do-bairro' | 'technical_tie';
    scoreDelta: number;
  };
  duel: {
    leader: 'tarifa-zero-corredor' | 'mutirao-do-bairro' | 'technical_tie' | 'insufficient_sample';
    confidence: 'insufficient_sample' | 'early_signal' | 'directional' | 'strong';
    tarifaPoints: number;
    mutiraoPoints: number;
    pointsDelta: number;
    dimensions: ArcadeDuelDimension[];
  };
  decision: {
    state: ArcadeDecisionState;
    recommendation: 'arcade_a_leads' | 'arcade_b_leads' | 'technical_tie' | 'insufficient_sample';
    readyForNextStep: boolean;
    summary: string;
    warnings: string[];
  };
}

type ArcadeFairStatus = 'unbalanced_exposure' | 'exposure_correction_in_progress' | 'fair_comparison_window' | 'decision_ready';

interface ArcadeExposureScorecard {
  slug: string;
  title: string;
  exposureSignals: number;
  intentClicks: number;
  starts: number;
  effectiveStarts: number;
  exposureToIntentRate: number;
  intentToStartRate: number;
  exposureToStartRate: number;
  exposureToEffectiveRate: number;
  shareOfExposure: number;
  shareOfRuns: number;
}

interface ArcadeExposureDuel {
  compared: {
    tarifaSlug: string;
    mutiraoSlug: string;
  };
  scorecards: ArcadeExposureScorecard[];
  totals: {
    exposureSignals: number;
    starts: number;
  };
  fairness: {
    status: ArcadeFairStatus;
    minExposureForFairWindow: number;
    minRunsForDecision: number;
    exposureDeltaPct: number;
    runsDeltaPct: number;
    underexposedArcade: 'tarifa-zero-corredor' | 'mutirao-do-bairro' | null;
    recommendedExposureBoost: number;
    summary: string;
    actions: string[];
  };
  contextLeaders: {
    volumeLeader: 'tarifa-zero-corredor' | 'mutirao-do-bairro' | 'technical_tie';
    efficiencyLeader: 'tarifa-zero-corredor' | 'mutirao-do-bairro' | 'technical_tie';
    campaignLeader: 'tarifa-zero-corredor' | 'mutirao-do-bairro' | 'technical_tie' | 'insufficient_sample';
  };
}

// T39: Convergence Scorecard for Confidence-Based Decision
type ArcadeConvergenceConfidence =
  | 'insufficient_fair_sample'        // < 30 runs efetivos por arcade OU exposição ainda desequilibrada
  | 'fair_sample_but_divergent'       // >= 30 runs e exposição equilibrada MAS líderes divergem em 3+ dimensões
  | 'directional_alignment'           // 2/3 ou mais dimensões apontam mesmo líder OU líderes alternam entre dois
  | 'decision_candidate'              // 4/6 dimensões convergem + replay/QR corrobora + volume > 40/60 split
  | 'ready_for_next_step';            // 5+/6 dimensões convergem + confidence >= 85% + volume >= 50/50 split

interface ArcadeConvergenceDimension {
  key: 'volume' | 'exposure' | 'exposure_efficiency' | 'effective_runs' | 'campaign_strength' | 'qr_final_card';
  label: string;
  tarifaValue: number;
  mutiraoValue: number;
  leader: 'tarifa-zero-corredor' | 'mutirao-do-bairro' | 'technical_tie' | 'insufficient_data';
  margin: number; // % delta
  weight: number; // importance in decision
  signal: 'strong' | 'moderate' | 'weak' | 'absent';
}

interface ArcadeConvergenceScorecard {
  compared: {
    tarifaSlug: string;
    mutiraoSlug: string;
  };
  sample: {
    totalEffectiveRuns: number;
    tarifaEffectiveRuns: number;
    mutiraoEffectiveRuns: number;
    minEffectiveRunsPerArcade: number;
    sampleSufficiency: 'insufficient' | 'adequate' | 'strong';
    sampleGapDeduction: number; // deduction from confidence if sample gap large
  };
  exposure: {
    isBalanced: boolean;
    exposureDeltaPct: number;
    minBalanceThreshold: number;
  };
  dimensions: ArcadeConvergenceDimension[];
  convergence: {
    alignedDimensions: number; // count of dims pointing to same leader
    totalDimensions: number;
    alignmentRatio: number; // 0-1
    divergentDimensions: string[]; // list of dims that diverge
  };
  confidence: {
    rawScore: number; // 0-100 before deductions
    sampleDeduction: number;
    exposureDeduction: number;
    finalScore: number; // 0-100
    state: ArcadeConvergenceConfidence;
    summary: string;
    warnings: string[];
  };
  decision: {
    readyToDecide: boolean;
    recommendedLeader: 'tarifa-zero-corredor' | 'mutirao-do-bairro' | 'no consensus' | 'maintain parity';
    rationale: string;
    nextActionIfNotReady: string;
  };
}

interface ArcadeFinalDecisionDimension {
  key: string;
  label: string;
  leader: 'tarifa-zero-corredor' | 'mutirao-do-bairro' | 'technical_tie' | 'insufficient_data';
  margin: number;
  signal: 'strong' | 'moderate' | 'weak' | 'absent';
}

interface ArcadeFinalDecision {
  generatedAt: string;
  window: string;
  decision: 'focus_tarifa_zero' | 'focus_mutirao' | 'maintain_dual_arcade' | 'defer_new_product';
  confidence: number; // 0-100
  rationale: string;
  blockers: string[];
  enablers: string[];
  t37: {
    leader: 'tarifa-zero-corredor' | 'mutirao-do-bairro' | 'technical_tie' | 'insufficient_sample';
    state: string;
    confidence: string;
    summary: string;
  };
  t38: {
    fairnessStatus: 'unbalanced_exposure' | 'correcting' | 'fair_exposure' | 'ready_to_compare';
    exposureDeltaPct: number;
    volumeLeader: 'tarifa-zero-corredor' | 'mutirao-do-bairro' | 'technical_tie' | 'no consensus';
    efficiencyLeader: 'tarifa-zero-corredor' | 'mutirao-do-bairro' | 'technical_tie' | 'no consensus';
  };
  t39: {
    state: ArcadeConvergenceConfidence;
    alignedDimensions: number;
    totalDimensions: number;
    score: number;
    dimensions: ArcadeFinalDecisionDimension[];
  };
  sample: {
    tarifaRuns: number;
    mutiraoRuns: number;
    totalRuns: number;
    minRunsForSignal: number;
    sufficient: boolean;
  };
  recommendation: {
    actionIfDecidable: string;
    actionIfDeferred: string;
    campaignFocus: 'concentrate_tarifa' | 'concentrate_mutirao' | 'maintain_parity' | 'defer_and_retest';
  };
  stability?: {
    stateDurationDays: number;
    decisionStable: boolean;
    candidatePersistenceDays: number;
    candidateReadyForPromotion: boolean;
    stateChanges: number;
    lastStateChange: string | null;
    observationPeriod: string;
    historySize: number;
  };
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
  arcadeLineDecision: ArcadeLineDecision;
  arcadeExposureDuel: ArcadeExposureDuel;
  arcadeConvergenceScorecard?: ArcadeConvergenceScorecard; // T39: Decision confidence
  arcadeFinalDecision?: ArcadeFinalDecision; // T40: Final arcade decision
  effectiveRuns?: EffectiveRunsAnalysis; // Tijolo 33
  generatedAt: string;
}

function normalizePct(value: number, max = 100) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(max, value));
}

function buildArcadeCampaignStrength(row: ArcadeRow | undefined, fallbackSlug: string): ArcadeCampaignStrengthRow {
  const runs = row?.runs || 0;
  const runEndRate = normalizePct(row?.runEndRate || 0);
  const replayRate = normalizePct(row?.replayRate || 0);
  const campaignCtaRate = runs > 0 ? normalizePct(Math.round(((row?.campaignCtaClicks || 0) / runs) * 100)) : 0;
  const firstInputAvgMs = row?.firstInputAvgMs || 0;
  const firstInputScore = firstInputAvgMs > 0 ? normalizePct(Math.round((Math.max(0, 4000 - firstInputAvgMs) / 4000) * 100)) : 0;

  const weightedScore = Math.round(
    runEndRate * 0.25 + replayRate * 0.3 + campaignCtaRate * 0.3 + firstInputScore * 0.15,
  );

  return {
    slug: row?.slug || fallbackSlug,
    title: row?.title || fallbackSlug,
    runs,
    runEndRate,
    replayRate,
    campaignCtaRate,
    firstInputAvgMs,
    weightedScore,
  };
}

function getArcadeLineDecision(arcadeRows: ArcadeRow[]): ArcadeLineDecision {
  const tarifaRow =
    arcadeRows.find((row) => row.slug === 'tarifa-zero-corredor') ||
    arcadeRows.find((row) => row.slug === 'tarifa-zero-rj');
  const mutiraoRow = arcadeRows.find((row) => row.slug === 'mutirao-do-bairro');

  const tarifa = buildArcadeCampaignStrength(tarifaRow, 'tarifa-zero-corredor');
  const mutirao = buildArcadeCampaignStrength(mutiraoRow, 'mutirao-do-bairro');

  const minRunsForSignal = 30;
  const minRunsForReadiness = 80;
  const minRuns = Math.min(tarifa.runs, mutirao.runs);

  const tarifaEngagement = Math.round(tarifa.replayRate * 0.6 + tarifa.campaignCtaRate * 0.4);
  const mutiraoEngagement = Math.round(mutirao.replayRate * 0.6 + mutirao.campaignCtaRate * 0.4);

  const dimensions: ArcadeDuelDimension[] = [
    {
      key: 'runs',
      label: 'Runs',
      tarifaValue: tarifa.runs,
      mutiraoValue: mutirao.runs,
      winner: tarifa.runs === mutirao.runs ? 'tie' : tarifa.runs > mutirao.runs ? 'tarifa-zero-corredor' : 'mutirao-do-bairro',
      weight: 1.5,
    },
    {
      key: 'run_end_rate',
      label: 'Run end rate',
      tarifaValue: tarifa.runEndRate,
      mutiraoValue: mutirao.runEndRate,
      winner:
        tarifa.runEndRate === mutirao.runEndRate
          ? 'tie'
          : tarifa.runEndRate > mutirao.runEndRate
          ? 'tarifa-zero-corredor'
          : 'mutirao-do-bairro',
      weight: 1,
    },
    {
      key: 'replay_rate',
      label: 'Replay rate',
      tarifaValue: tarifa.replayRate,
      mutiraoValue: mutirao.replayRate,
      winner: tarifa.replayRate === mutirao.replayRate ? 'tie' : tarifa.replayRate > mutirao.replayRate ? 'tarifa-zero-corredor' : 'mutirao-do-bairro',
      weight: 1.2,
    },
    {
      key: 'campaign_cta_rate',
      label: 'CTA pos-run rate',
      tarifaValue: tarifa.campaignCtaRate,
      mutiraoValue: mutirao.campaignCtaRate,
      winner:
        tarifa.campaignCtaRate === mutirao.campaignCtaRate
          ? 'tie'
          : tarifa.campaignCtaRate > mutirao.campaignCtaRate
          ? 'tarifa-zero-corredor'
          : 'mutirao-do-bairro',
      weight: 1.2,
    },
    {
      key: 'first_input_time',
      label: 'First input (menor melhor)',
      tarifaValue: tarifa.firstInputAvgMs,
      mutiraoValue: mutirao.firstInputAvgMs,
      winner:
        tarifa.firstInputAvgMs === mutirao.firstInputAvgMs
          ? 'tie'
          : tarifa.firstInputAvgMs === 0
          ? 'mutirao-do-bairro'
          : mutirao.firstInputAvgMs === 0
          ? 'tarifa-zero-corredor'
          : tarifa.firstInputAvgMs < mutirao.firstInputAvgMs
          ? 'tarifa-zero-corredor'
          : 'mutirao-do-bairro',
      weight: 0.7,
    },
    {
      key: 'engagement_index',
      label: 'Indice de engajamento',
      tarifaValue: tarifaEngagement,
      mutiraoValue: mutiraoEngagement,
      winner:
        tarifaEngagement === mutiraoEngagement ? 'tie' : tarifaEngagement > mutiraoEngagement ? 'tarifa-zero-corredor' : 'mutirao-do-bairro',
      weight: 1.4,
    },
  ];

  let tarifaPoints = 0;
  let mutiraoPoints = 0;

  for (const dimension of dimensions) {
    if (dimension.winner === 'tarifa-zero-corredor') {
      tarifaPoints += dimension.weight;
    } else if (dimension.winner === 'mutirao-do-bairro') {
      mutiraoPoints += dimension.weight;
    }
  }

  const pointsDelta = Number((tarifaPoints - mutiraoPoints).toFixed(2));
  const absDelta = Math.abs(pointsDelta);
  const scoreDelta = tarifa.weightedScore - mutirao.weightedScore;

  const warnings: string[] = [];
  if (tarifa.runs < minRunsForSignal || mutirao.runs < minRunsForSignal) {
    warnings.push(
      `Amostra arcade ainda em consolidacao: Tarifa ${tarifa.runs}/${minRunsForSignal} runs, Mutirao ${mutirao.runs}/${minRunsForSignal} runs.`,
    );
  }
  if (tarifa.runs < minRunsForReadiness || mutirao.runs < minRunsForReadiness) {
    warnings.push(
      `Amostra para readiness ainda insuficiente: Tarifa ${tarifa.runs}/${minRunsForReadiness}, Mutirao ${mutirao.runs}/${minRunsForReadiness}.`,
    );
  }
  if (absDelta < 1) {
    warnings.push('Pontuacao tecnica muito proxima entre os dois arcades; manter leitura como empate tecnico.');
  }

  let leader: ArcadeLineDecision['duel']['leader'] = 'technical_tie';
  if (minRuns < 10) {
    leader = 'insufficient_sample';
  } else if (pointsDelta > 0.99) {
    leader = 'tarifa-zero-corredor';
  } else if (pointsDelta < -0.99) {
    leader = 'mutirao-do-bairro';
  }

  const confidence: ArcadeLineDecision['duel']['confidence'] =
    minRuns < 10 ? 'insufficient_sample' : minRuns < minRunsForSignal ? 'early_signal' : absDelta >= 2.4 ? 'strong' : 'directional';

  const campaignWinner =
    scoreDelta > 2
      ? 'tarifa-zero-corredor'
      : scoreDelta < -2
      ? 'mutirao-do-bairro'
      : 'technical_tie';

  let state: ArcadeDecisionState = 'directional_lead';
  let recommendation: ArcadeLineDecision['decision']['recommendation'] = 'technical_tie';
  let summary = 'Empate tecnico entre os arcades nesta janela.';
  let readyForNextStep = false;

  if (minRuns < 10) {
    state = 'insufficient_sample';
    recommendation = 'insufficient_sample';
    summary = 'Amostra insuficiente para declarar lideranca entre Tarifa Zero e Mutirao.';
  } else if (minRuns < minRunsForSignal) {
    state = 'early_signal';
    recommendation = leader === 'tarifa-zero-corredor' ? 'arcade_a_leads' : leader === 'mutirao-do-bairro' ? 'arcade_b_leads' : 'technical_tie';
    summary =
      leader === 'technical_tie'
        ? 'Sinal inicial sem vencedor claro; manter distribuicao equilibrada entre os dois arcades.'
        : `Sinal inicial aponta ${leader === 'tarifa-zero-corredor' ? 'Tarifa Zero' : 'Mutirao'} na frente, ainda sem massa critica.`;
  } else if (leader === 'technical_tie') {
    state = 'directional_lead';
    recommendation = 'technical_tie';
    summary = 'Com amostra minima atingida, a leitura continua em empate tecnico.';
  } else if (minRuns >= minRunsForReadiness && absDelta >= 2.4) {
    state = 'ready_for_next_step';
    recommendation = leader === 'tarifa-zero-corredor' ? 'arcade_a_leads' : 'arcade_b_leads';
    summary = `${leader === 'tarifa-zero-corredor' ? 'Tarifa Zero' : 'Mutirao'} lidera com amostra minima robusta para proximo passo.`;
    readyForNextStep = true;
  } else if (absDelta >= 2.4) {
    state = 'candidate_flagship';
    recommendation = leader === 'tarifa-zero-corredor' ? 'arcade_a_leads' : 'arcade_b_leads';
    summary = `${leader === 'tarifa-zero-corredor' ? 'Tarifa Zero' : 'Mutirao'} lidera com sinal forte, aguardando consolidacao de amostra para readiness.`;
  } else {
    state = 'directional_lead';
    recommendation = leader === 'tarifa-zero-corredor' ? 'arcade_a_leads' : 'arcade_b_leads';
    summary = `${leader === 'tarifa-zero-corredor' ? 'Tarifa Zero' : 'Mutirao'} lidera de forma direcional, com margem ainda moderada.`;
  }

  return {
    compared: {
      tarifaSlug: tarifa.slug,
      mutiraoSlug: mutirao.slug,
    },
    sample: {
      tarifaRuns: tarifa.runs,
      mutiraoRuns: mutirao.runs,
      minRunsForSignal,
      minRunsForReadiness,
    },
    campaignStrength: {
      tarifa,
      mutirao,
      winner: campaignWinner,
      scoreDelta,
    },
    duel: {
      leader,
      confidence,
      tarifaPoints,
      mutiraoPoints,
      pointsDelta,
      dimensions,
    },
    decision: {
      state,
      recommendation,
      readyForNextStep,
      summary,
      warnings,
    },
  };
}

function resolveArcadeSlugFromEvent(eventName: string, slug: string, metadata?: Record<string, unknown>): string | null {
  const rawSlug =
    eventName === 'home_arcade_click' || eventName === 'explorar_arcade_click' || eventName === 'quick_to_arcade_click'
      ? String(metadata?.arcadeSlug || '')
      : eventName === 'home_primary_play_click' && String(metadata?.targetType || '').toLowerCase() === 'arcade'
      ? String(metadata?.targetSlug || '')
      : eventName === 'above_fold_game_click' && String(metadata?.gameType || '').toLowerCase() === 'arcade'
      ? String(metadata?.gameSlug || slug || '')
      : eventName === 'card_preview_interaction' || eventName === 'card_full_click'
      ? String(slug || '')
      : null;

  if (!rawSlug) {
    return null;
  }

  const normalized = rawSlug === 'tarifa-zero-rj' ? 'tarifa-zero-corredor' : rawSlug;
  return normalized === 'tarifa-zero-corredor' || normalized === 'mutirao-do-bairro' ? normalized : null;
}

function getArcadeExposureDuel(
  events: Array<{ sessionId: string; eventName: string; slug: string; metadata?: Record<string, unknown> }>,
  arcadeLineDecision: ArcadeLineDecision,
  effectiveRuns?: EffectiveRunsAnalysis,
): ArcadeExposureDuel {
  const rows: Record<'tarifa-zero-corredor' | 'mutirao-do-bairro', ArcadeExposureScorecard> = {
    'tarifa-zero-corredor': {
      slug: 'tarifa-zero-corredor',
      title: 'Tarifa Zero RJ - Corredor do Povo',
      exposureSignals: 0,
      intentClicks: 0,
      starts: 0,
      effectiveStarts: 0,
      exposureToIntentRate: 0,
      intentToStartRate: 0,
      exposureToStartRate: 0,
      exposureToEffectiveRate: 0,
      shareOfExposure: 0,
      shareOfRuns: 0,
    },
    'mutirao-do-bairro': {
      slug: 'mutirao-do-bairro',
      title: 'Mutirao do Bairro',
      exposureSignals: 0,
      intentClicks: 0,
      starts: 0,
      effectiveStarts: 0,
      exposureToIntentRate: 0,
      intentToStartRate: 0,
      exposureToStartRate: 0,
      exposureToEffectiveRate: 0,
      shareOfExposure: 0,
      shareOfRuns: 0,
    },
  };

  for (const event of events) {
    const isExposureEvent =
      event.eventName === 'card_preview_interaction' ||
      event.eventName === 'card_full_click' ||
      event.eventName === 'home_arcade_click' ||
      event.eventName === 'explorar_arcade_click' ||
      event.eventName === 'quick_to_arcade_click' ||
      event.eventName === 'home_primary_play_click' ||
      event.eventName === 'above_fold_game_click';

    if (isExposureEvent) {
      const arcadeSlug = resolveArcadeSlugFromEvent(event.eventName, event.slug, event.metadata);
      if (arcadeSlug && (arcadeSlug === 'tarifa-zero-corredor' || arcadeSlug === 'mutirao-do-bairro')) {
        rows[arcadeSlug as ArcadeSlug].exposureSignals += 1;
        if (event.eventName !== 'card_preview_interaction') {
          rows[arcadeSlug as ArcadeSlug].intentClicks += 1;
        }
      }
    }

    if (event.eventName === 'arcade_run_start') {
      const runSlugRaw = String(event.metadata?.arcadeSlug || event.slug || '');
      const runSlug = runSlugRaw === 'tarifa-zero-rj' ? 'tarifa-zero-corredor' : runSlugRaw;
      if (runSlug === 'tarifa-zero-corredor' || runSlug === 'mutirao-do-bairro') {
        rows[runSlug].starts += 1;
      }
    }
  }

  const effectiveByGame = effectiveRuns?.effectiveRunsByGame;
  if (effectiveByGame) {
    rows['tarifa-zero-corredor'].effectiveStarts = effectiveByGame.get('tarifa-zero-corredor')?.effectiveRuns || 0;
    rows['mutirao-do-bairro'].effectiveStarts = effectiveByGame.get('mutirao-do-bairro')?.effectiveRuns || 0;
  }

  const scorecards = [rows['tarifa-zero-corredor'], rows['mutirao-do-bairro']].map((row) => ({
    ...row,
  }));
  const totalExposure = scorecards.reduce((sum, row) => sum + row.exposureSignals, 0);
  const totalRuns = scorecards.reduce((sum, row) => sum + row.starts, 0);

  for (const row of scorecards) {
    row.exposureToIntentRate = row.exposureSignals > 0 ? Math.round((row.intentClicks / row.exposureSignals) * 100) : 0;
    row.intentToStartRate = row.intentClicks > 0 ? Math.round((row.starts / row.intentClicks) * 100) : 0;
    row.exposureToStartRate = row.exposureSignals > 0 ? Math.round((row.starts / row.exposureSignals) * 100) : 0;
    row.exposureToEffectiveRate = row.exposureSignals > 0 ? Math.round((row.effectiveStarts / row.exposureSignals) * 100) : 0;
    row.shareOfExposure = totalExposure > 0 ? Math.round((row.exposureSignals / totalExposure) * 100) : 0;
    row.shareOfRuns = totalRuns > 0 ? Math.round((row.starts / totalRuns) * 100) : 0;
  }

  const tarifa = scorecards[0];
  const mutirao = scorecards[1];
  const exposureDeltaPct = Math.abs(tarifa.shareOfExposure - mutirao.shareOfExposure);
  const runsDeltaPct = Math.abs(tarifa.shareOfRuns - mutirao.shareOfRuns);
  const minExposureForFairWindow = 30;
  const minRunsForDecision = arcadeLineDecision.sample.minRunsForSignal;
  const minExposure = Math.min(tarifa.exposureSignals, mutirao.exposureSignals);
  const minRuns = Math.min(tarifa.starts, mutirao.starts);

  const underexposedArcade: ArcadeExposureDuel['fairness']['underexposedArcade'] =
    tarifa.exposureSignals === mutirao.exposureSignals
      ? null
      : tarifa.exposureSignals < mutirao.exposureSignals
      ? 'tarifa-zero-corredor'
      : 'mutirao-do-bairro';

  const recommendedExposureBoost = underexposedArcade ? Math.ceil(Math.abs(tarifa.exposureSignals - mutirao.exposureSignals) / 2) : 0;

  let status: ArcadeFairStatus = 'fair_comparison_window';
  if (exposureDeltaPct >= 35 || minExposure < 12) {
    status = 'unbalanced_exposure';
  } else if (exposureDeltaPct > 15 || minExposure < minExposureForFairWindow) {
    status = 'exposure_correction_in_progress';
  } else if (minRuns >= minRunsForDecision) {
    status = 'decision_ready';
  }

  let summary = 'Janela de comparacao justa aberta por exposicao; aguardar consolidacao de runs para decisao oficial.';
  if (status === 'unbalanced_exposure') {
    summary = `Duelo enviesado por exposicao (${exposureDeltaPct}pp de gap); corrigir distribuicao antes de declarar vencedor.`;
  } else if (status === 'exposure_correction_in_progress') {
    summary = `Correcao de exposicao em andamento (${exposureDeltaPct}pp de gap); manter pareamento de vitrine.`;
  } else if (status === 'decision_ready') {
    summary = 'Exposicao equilibrada e amostra minima de runs atendida; comparacao oficial pronta.';
  }

  const winnerByValue = (tarifaValue: number, mutiraoValue: number): 'tarifa-zero-corredor' | 'mutirao-do-bairro' | 'technical_tie' => {
    if (tarifaValue === mutiraoValue) {
      return 'technical_tie';
    }
    return tarifaValue > mutiraoValue ? 'tarifa-zero-corredor' : 'mutirao-do-bairro';
  };

  return {
    compared: {
      tarifaSlug: 'tarifa-zero-corredor',
      mutiraoSlug: 'mutirao-do-bairro',
    },
    scorecards,
    totals: {
      exposureSignals: totalExposure,
      starts: totalRuns,
    },
    fairness: {
      status,
      minExposureForFairWindow,
      minRunsForDecision,
      exposureDeltaPct,
      runsDeltaPct,
      underexposedArcade,
      recommendedExposureBoost,
      summary,
      actions: [
        underexposedArcade
          ? `Aumentar distribuicao de ${underexposedArcade} em pelo menos +${recommendedExposureBoost} sinais de exposicao na proxima janela.`
          : 'Manter distribuicao pareada entre os dois arcades na vitrine principal.',
        'Usar as mesmas superfices (home, explorar e quick->arcade) para evitar vies de entrada.',
        'Declarar vencedor oficial apenas com exposicao equilibrada e amostra minima de runs.',
      ],
    },
    contextLeaders: {
      volumeLeader: winnerByValue(tarifa.starts, mutirao.starts),
      efficiencyLeader: winnerByValue(tarifa.exposureToStartRate, mutirao.exposureToStartRate),
      campaignLeader: (arcadeLineDecision.campaignStrength.winner as ArcadeExposureDuel['contextLeaders']['campaignLeader']) || 'technical_tie',
    },
  };
}

function getArcadeConvergenceScorecard(
  arcadeLineDecision: ArcadeLineDecision,
  arcadeExposureDuel: ArcadeExposureDuel,
  arcadeRows: ArcadeRow[],
): ArcadeConvergenceScorecard {
  const tariffaRow = arcadeRows.find((r) => r.slug === 'tarifa-zero-corredor');
  const mutiraoRow = arcadeRows.find((r) => r.slug === 'mutirao-do-bairro');
  
  if (!tariffaRow || !mutiraoRow) {
    // Fallback: insufficient data
    return {
      compared: { tarifaSlug: 'tarifa-zero-corredor', mutiraoSlug: 'mutirao-do-bairro' },
      sample: {
        totalEffectiveRuns: 0,
        tarifaEffectiveRuns: 0,
        mutiraoEffectiveRuns: 0,
        minEffectiveRunsPerArcade: 30,
        sampleSufficiency: 'insufficient',
        sampleGapDeduction: 100,
      },
      exposure: { isBalanced: false, exposureDeltaPct: 0, minBalanceThreshold: 15 },
      dimensions: [],
      convergence: { alignedDimensions: 0, totalDimensions: 6, alignmentRatio: 0, divergentDimensions: [] },
      confidence: {
        rawScore: 0,
        sampleDeduction: 100,
        exposureDeduction: 0,
        finalScore: 0,
        state: 'insufficient_fair_sample',
        summary: 'Dados insuficientes.',
        warnings: ['Amostra muito pequena para decisão.'],
      },
      decision: {
        readyToDecide: false,
        recommendedLeader: 'maintain parity',
        rationale: 'Amostra inadequada.',
        nextActionIfNotReady: 'Continuar coleta com distribuição pareada.',
      },
    };
  }

  // T39: 6 Dimensions of Convergence
  const tarifaEffective = tariffaRow.runs; // Placeholder: use effective runs if available
  const mutiraoEffective = mutiraoRow.runs;
  const totalEffectiveRuns = tarifaEffective + mutiraoEffective;
  const minEffectiveRunsPerArcade = 30;

  // Dimension 1: Volume (raw starts)
  const volumeLead = tariffaRow.runs > mutiraoRow.runs ? tariffaRow.runs - mutiraoRow.runs : mutiraoRow.runs - tariffaRow.runs;
  const volumeMargin = totalEffectiveRuns > 0 ? (volumeLead / totalEffectiveRuns) * 100 : 0;
  const volumeLeader = tariffaRow.runs === mutiraoRow.runs ? 'technical_tie' : tariffaRow.runs > mutiraoRow.runs ? 'tarifa-zero-corredor' : 'mutirao-do-bairro';
  const volumeSignal: ArcadeConvergenceDimension['signal'] = volumeMargin >= 15 ? 'strong' : volumeMargin >= 8 ? 'moderate' : volumeMargin >= 3 ? 'weak' : 'absent';

  // Dimension 2: Exposure (from T38)
  const exposureLeader = arcadeExposureDuel.contextLeaders.volumeLeader; // exposure context leader
  const exposureDeltaPct = arcadeExposureDuel.fairness.exposureDeltaPct;
  const exposureSignal: ArcadeConvergenceDimension['signal'] = exposureDeltaPct >= 20 ? 'strong' : exposureDeltaPct >= 10 ? 'moderate' : 'weak';

  // Dimension 3: Exposure Efficiency (exposure -> start rate)
  const efficiencyLeader = arcadeExposureDuel.contextLeaders.efficiencyLeader;
  const tarifaEffRate = arcadeExposureDuel.scorecards[0]?.exposureToStartRate || 0;
  const mutiraoEffRate = arcadeExposureDuel.scorecards[1]?.exposureToStartRate || 0;
  const effMargin = Math.abs(tarifaEffRate - mutiraoEffRate);
  const efficiencySignal: ArcadeConvergenceDimension['signal'] = effMargin >= 8 ? 'strong' : effMargin >= 4 ? 'moderate' : effMargin >= 1 ? 'weak' : 'absent';

  // Dimension 4: Effective Runs (replay + completion driven)
  const tarifaReplays = tariffaRow.replayClicks;
  const mutiraoReplays = mutiraoRow.replayClicks;
  const effectiveRunsLeader = tarifaReplays === mutiraoReplays ? 'technical_tie' : tarifaReplays > mutiraoReplays ? 'tarifa-zero-corredor' : 'mutirao-do-bairro';
  const replayMargin = Math.max(tarifaReplays, mutiraoReplays) > 0 ? (Math.abs(tarifaReplays - mutiraoReplays) / Math.max(tarifaReplays, mutiraoReplays)) * 100 : 0;
  const replaySignal: ArcadeConvergenceDimension['signal'] = replayMargin >= 20 ? 'strong' : replayMargin >= 10 ? 'moderate' : replayMargin >= 3 ? 'weak' : 'absent';

  // Dimension 5: Campaign Strength (from T37)
  const campaignLeader = arcadeLineDecision.campaignStrength.winner;
  const campaignScoreDelta = arcadeLineDecision.campaignStrength.scoreDelta;
  const campaignSignal: ArcadeConvergenceDimension['signal'] = campaignScoreDelta >= 10 ? 'strong' : campaignScoreDelta >= 5 ? 'moderate' : campaignScoreDelta >= 1 ? 'weak' : 'absent';

  // Dimension 6: QR / Final Card Engagement (placeholder for future)
  const qrLeader: 'tarifa-zero-corredor' | 'mutirao-do-bairro' | 'technical_tie' | 'insufficient_data' = 'insufficient_data';
  const qrSignal: ArcadeConvergenceDimension['signal'] = 'absent';

  const dimensions: ArcadeConvergenceDimension[] = [
    {
      key: 'volume',
      label: 'Volume de Runs',
      tarifaValue: tariffaRow.runs,
      mutiraoValue: mutiraoRow.runs,
      leader: volumeLeader,
      margin: volumeMargin,
      weight: 0.25,
      signal: volumeSignal,
    },
    {
      key: 'exposure',
      label: 'Exposição (sinais)',
      tarifaValue: arcadeExposureDuel.scorecards[0]?.exposureSignals || 0,
      mutiraoValue: arcadeExposureDuel.scorecards[1]?.exposureSignals || 0,
      leader: exposureLeader,
      margin: exposureDeltaPct,
      weight: 0.15,
      signal: exposureSignal,
    },
    {
      key: 'exposure_efficiency',
      label: 'Eficiência (exposição → start)',
      tarifaValue: tarifaEffRate,
      mutiraoValue: mutiraoEffRate,
      leader: efficiencyLeader,
      margin: effMargin,
      weight: 0.2,
      signal: efficiencySignal,
    },
    {
      key: 'effective_runs',
      label: 'Engajamento (replays)',
      tarifaValue: tarifaReplays,
      mutiraoValue: mutiraoReplays,
      leader: effectiveRunsLeader,
      margin: replayMargin,
      weight: 0.2,
      signal: replaySignal,
    },
    {
      key: 'campaign_strength',
      label: 'Força de Campanha (T37)',
      tarifaValue: arcadeLineDecision.campaignStrength.tarifa.weightedScore,
      mutiraoValue: arcadeLineDecision.campaignStrength.mutirao.weightedScore,
      leader: campaignLeader,
      margin: campaignScoreDelta,
      weight: 0.15,
      signal: campaignSignal,
    },
    {
      key: 'qr_final_card',
      label: 'QR / Final Card (futuro)',
      tarifaValue: 0,
      mutiraoValue: 0,
      leader: qrLeader,
      margin: 0,
      weight: 0.05,
      signal: qrSignal,
    },
  ];

  // Compute convergence
  const alignedDimensions = dimensions.filter((d) => d.leader === campaignLeader && d.signal !== 'absent').length;
  const alignmentRatio = dimensions.length > 0 ? alignedDimensions / dimensions.length : 0;
  const divergentDimensions = dimensions
    .filter((d) => d.leader !== campaignLeader && d.leader !== 'technical_tie' && d.leader !== 'insufficient_data' && d.signal !== 'absent')
    .map((d) => d.label);

  // Sample sufficiency check
  const sampleSufficiency: ArcadeConvergenceScorecard['sample']['sampleSufficiency'] =
    tarifaEffective >= minEffectiveRunsPerArcade && mutiraoEffective >= minEffectiveRunsPerArcade
      ? 'strong'
      : tarifaEffective >= minEffectiveRunsPerArcade * 0.5 && mutiraoEffective >= minEffectiveRunsPerArcade * 0.5
      ? 'adequate'
      : 'insufficient';

  const sampleGapDeduction = sampleSufficiency === 'insufficient' ? 40 : sampleSufficiency === 'adequate' ? 20 : 0;

  // Exposure balance check
  const isExposureBalanced = arcadeExposureDuel.fairness.status === 'fair_comparison_window' || arcadeExposureDuel.fairness.status === 'decision_ready';
  const exposureDeduction = !isExposureBalanced ? 30 : 0;

  // Compute confidence score (0-100)
  let rawScore = 100;

  // Apply signal strengths
  dimensions.forEach((dim) => {
    if (dim.signal === 'strong') rawScore += 0; // already 100 base
    else if (dim.signal === 'moderate') rawScore -= 5;
    else if (dim.signal === 'weak') rawScore -= 10;
    else rawScore -= 20; // absent
  });

  // Apply convergence bonus/penalty
  if (alignmentRatio >= 0.83) rawScore += 15; // 5+/6 aligned
  else if (alignmentRatio >= 0.67) rawScore += 10; // 4/6 aligned
  else if (alignmentRatio >= 0.5) rawScore += 0; // 3/6 aligned
  else rawScore -= 20; // < 2/6 aligned (divergent)

  rawScore = Math.max(0, Math.min(100, rawScore)); // Clamp 0-100

  const finalScore = Math.max(0, rawScore - sampleGapDeduction - exposureDeduction);

  // Determine confidence state
  let state: ArcadeConvergenceConfidence = 'insufficient_fair_sample';
  if (sampleSufficiency !== 'insufficient' && isExposureBalanced) {
    if (alignmentRatio >= 0.83 && finalScore >= 85) {
      state = 'ready_for_next_step';
    } else if (alignmentRatio >= 0.67 && finalScore >= 75) {
      state = 'decision_candidate';
    } else if (alignmentRatio >= 0.5) {
      state = 'directional_alignment';
    } else {
      state = 'fair_sample_but_divergent';
    }
  }

  // Build summary and warnings
  let summary = '';
  const warnings: string[] = [];

  if (state === 'insufficient_fair_sample') {
    summary = `Amostra insuficiente (${tarifaEffective}/${minEffectiveRunsPerArcade} runs Tarifa, ${mutiraoEffective}/${minEffectiveRunsPerArcade} Mutirao). Exposição ${isExposureBalanced ? '' : 'des'}equilibrada.`;
    warnings.push('Continuar coleta com distribuição pareada antes de decisão.');
  } else if (state === 'fair_sample_but_divergent') {
    summary = `Amostra justa (${totalEffectiveRuns} total), mas líderes divergem em ${divergentDimensions.length} dimensão(ões): ${divergentDimensions.join(', ')}.`;
    warnings.push('Avaliar qualidade de produto e posicionamento antes de declarar vencedor.');
  } else if (state === 'directional_alignment') {
    summary = `Sinais alinhados em ${alignedDimensions}/6 dimensões. Confiança ${finalScore}/100.`;
    warnings.push('Monitorar próximas semanas para consolidação.');
  } else if (state === 'decision_candidate') {
    summary = `${alignedDimensions}/6 dimensões convergem. Recomendação: ${campaignLeader} como arcade focal.`;
    warnings.push('Validar convergência por mais 7 dias antes de concentrar distribuição.');
  } else if (state === 'ready_for_next_step') {
    summary = `Convergência forte (${alignedDimensions}/6 dimensões, ${finalScore}/100). ${campaignLeader} é arcade confiável para T40.`;
    warnings.push('Aprovado para próxima fase com segurança operacional alta.');
  }

  return {
    compared: {
      tarifaSlug: 'tarifa-zero-corredor',
      mutiraoSlug: 'mutirao-do-bairro',
    },
    sample: {
      totalEffectiveRuns,
      tarifaEffectiveRuns: tarifaEffective,
      mutiraoEffectiveRuns: mutiraoEffective,
      minEffectiveRunsPerArcade,
      sampleSufficiency,
      sampleGapDeduction,
    },
    exposure: {
      isBalanced: isExposureBalanced,
      exposureDeltaPct: arcadeExposureDuel.fairness.exposureDeltaPct,
      minBalanceThreshold: 15,
    },
    dimensions,
    convergence: {
      alignedDimensions,
      totalDimensions: dimensions.length,
      alignmentRatio,
      divergentDimensions,
    },
    confidence: {
      rawScore,
      sampleDeduction: sampleGapDeduction,
      exposureDeduction,
      finalScore,
      state,
      summary,
      warnings,
    },
    decision: {
      readyToDecide: state === 'decision_candidate' || state === 'ready_for_next_step',
      recommendedLeader:
        state === 'ready_for_next_step' || state === 'decision_candidate'
          ? (campaignLeader && campaignLeader !== 'technical_tie' ? campaignLeader : 'no consensus')
          : state === 'directional_alignment'
          ? (alignedDimensions >= 3 && campaignLeader && campaignLeader !== 'technical_tie' ? campaignLeader : 'no consensus')
          : 'maintain parity',
      rationale: summary,
      nextActionIfNotReady:
        sampleSufficiency === 'insufficient'
          ? `Aumentar para ${minEffectiveRunsPerArcade} runs por arcade com distribuição pareada.`
          : !isExposureBalanced
          ? `Rebalancear exposição (gap: ${arcadeExposureDuel.fairness.exposureDeltaPct}pp).`
          : `Monitorar convergência de ${divergentDimensions.join(', ')} nas próximas semanas.`,
    },
  };
}

function buildFinalArcadeDecision(
  arcadeLineDecision: ArcadeLineDecision,
  arcadeExposureDuel: ArcadeExposureDuel,
  arcadeConvergenceScorecard: ArcadeConvergenceScorecard | undefined
): ArcadeFinalDecision {
  // Default fallback if convergence not provided
  const convergence = arcadeConvergenceScorecard || {
    compared: { tarifaSlug: 'tarifa-zero-corredor', mutiraoSlug: 'mutirao-do-bairro' },
    sample: { totalEffectiveRuns: 0, tarifaEffectiveRuns: 0, mutiraoEffectiveRuns: 0, minEffectiveRunsPerArcade: 30, sampleSufficiency: 'insufficient', sampleGapDeduction: 0 },
    exposure: { isBalanced: false, exposureDeltaPct: 0, minBalanceThreshold: 15 },
    dimensions: [],
    convergence: { alignedDimensions: 0, totalDimensions: 0, alignmentRatio: 0, divergentDimensions: [] },
    confidence: { rawScore: 0, sampleDeduction: 0, exposureDeduction: 0, finalScore: 0, state: 'insufficient_fair_sample', summary: '', warnings: [] },
    decision: { readyToDecide: false, recommendedLeader: 'no consensus', rationale: '', nextActionIfNotReady: '' },
  };

  const officialLeader = arcadeLineDecision.duel?.leader || 'insufficient_sample';
  const officialState = arcadeLineDecision.decision?.state || 'insufficient_sample';
  const officialConfidence = arcadeLineDecision.duel?.confidence || 'insufficient_sample';
  const fairnessStatus = arcadeExposureDuel.fairness?.status || 'unbalanced_exposure';
  const exposureDeltaPct = arcadeExposureDuel.fairness?.exposureDeltaPct || 0;
  const convergenceState = convergence.confidence.state;
  const alignedDimensions = convergence.convergence.alignedDimensions;
  const totalDimensions = convergence.convergence.totalDimensions;
  const convergenceScore = convergence.confidence.finalScore;

  const tarifaRuns = convergence.sample.tarifaEffectiveRuns;
  const mutiraoRuns = convergence.sample.mutiraoEffectiveRuns;
  const totalRuns = convergence.sample.totalEffectiveRuns;
  const minRunsForSignal = convergence.sample.minEffectiveRunsPerArcade;

  // Determine blockers and enablers
  const blockers: string[] = [];
  const enablers: string[] = [];

  // Blocker: Insufficient sample
  if (convergence.sample.sampleSufficiency === 'insufficient') {
    blockers.push(`Amostra insuficiente (${totalRuns} runs total, mínimo recomendado: ${minRunsForSignal * 1.5})`);
  }

  // Blocker: Exposure imbalance
  if (fairnessStatus === 'unbalanced_exposure' && exposureDeltaPct > 15) {
    blockers.push(`Exposição desbalanceada (Δ=${Math.round(exposureDeltaPct)}pp). Reavaliar após rebalancear.`);
  }

  // Blocker: Divergence in key dimensions
  if (convergenceState === 'fair_sample_but_divergent') {
    blockers.push(`Líderes divergem em múltiplas dimensões. Investigar antes de decidir.`);
  }

  // Enabler: Strong convergence
  if (convergenceState === 'directional_alignment') {
    enablers.push(`Sinais alinhados em ${alignedDimensions}/${totalDimensions} dimensões.`);
  } else if (convergenceState === 'decision_candidate' || convergenceState === 'ready_for_next_step') {
    enablers.push(`✅ Convergência forte (${alignedDimensions}/${totalDimensions} dims, score ${convergenceScore}/100).`);
  }

  // Enabler: Exposure balanced
  if (fairnessStatus === 'fair_comparison_window' || fairnessStatus === 'decision_ready') {
    enablers.push(`Exposição balanceada (Δ=${Math.round(exposureDeltaPct)}pp).`);
  }

  // Enabler: Official decision clear
  if (officialLeader !== 'technical_tie' && officialLeader !== 'insufficient_sample') {
    enablers.push(`Liderança oficial clara: ${officialLeader === 'tarifa-zero-corredor' ? 'Tarifa Zero RJ' : 'Mutirão do Bairro'}.`);
  }

  // Decision Logic
  let finalDecision: 'focus_tarifa_zero' | 'focus_mutirao' | 'maintain_dual_arcade' | 'defer_new_product' = 'defer_new_product';
  let decisionRationale = '';
  let decisionConfidence = 0;

  if (blockers.length === 0 && enablers.length >= 3) {
    // Ready to decide
    if (officialLeader === 'tarifa-zero-corredor') {
      finalDecision = 'focus_tarifa_zero';
      decisionRationale = `Tarifa Zero RJ lidera oficialmente com confiança ${officialConfidence}, exposição justa, e convergência forte (${alignedDimensions}/${totalDimensions} dims).`;
      decisionConfidence = Math.min(convergenceScore, 95);
    } else if (officialLeader === 'mutirao-do-bairro') {
      finalDecision = 'focus_mutirao';
      decisionRationale = `Mutirão do Bairro lidera oficialmente com confiança ${officialConfidence}, exposição justa, e convergência forte (${alignedDimensions}/${totalDimensions} dims).`;
      decisionConfidence = Math.min(convergenceScore, 95);
    } else {
      finalDecision = 'maintain_dual_arcade';
      decisionRationale = `Empate técnico. Ambos arcades demonstram força comparável. Manter estratégia pareada.`;
      decisionConfidence = Math.round(convergenceScore * 0.8);
    }
  } else if (blockers.length === 0 && convergenceState === 'directional_alignment') {
    // Directional but not fully ready
    finalDecision = 'maintain_dual_arcade';
    decisionRationale = `Sinais parciais (${alignedDimensions}/${totalDimensions} dims alinhadas). Manter parity pero validar por 7 dias adicionais.`;
    decisionConfidence = Math.round(convergenceScore * 0.6);
  } else if (blockers.length > 0) {
    // Explicit blockers
    finalDecision = 'defer_new_product';
    decisionRationale = `Decisão bloqueada por: ${blockers.join(' ')}`;
    decisionConfidence = 0;
  } else {
    // Insufficient enablers
    finalDecision = convergenceState === 'decision_candidate' ? 'maintain_dual_arcade' : 'defer_new_product';
    decisionRationale = `Estado T39: ${convergenceState}. Validar por 7 dias adicionais.`;
    decisionConfidence = Math.round(convergenceScore * 0.6);
  }

  return {
    generatedAt: new Date().toISOString(),
    window: '7d',
    decision: finalDecision,
    confidence: Math.round(decisionConfidence),
    rationale: decisionRationale,
    blockers,
    enablers,
    t37: {
      leader: officialLeader as any,
      state: officialState,
      confidence: officialConfidence,
      summary: arcadeLineDecision.decision?.summary || 'Sem decisão consolidada.',
    },
    t38: {
      fairnessStatus: fairnessStatus as any,
      exposureDeltaPct: Math.round(exposureDeltaPct * 100) / 100,
      volumeLeader: (arcadeExposureDuel.contextLeaders?.volumeLeader || 'technical_tie') as any,
      efficiencyLeader: (arcadeExposureDuel.contextLeaders?.efficiencyLeader || 'technical_tie') as any,
    },
    t39: {
      state: convergenceState,
      alignedDimensions,
      totalDimensions,
      score: convergenceScore,
      dimensions: convergence.dimensions.map(d => ({
        key: d.key,
        label: d.label,
        leader: d.leader as any,
        margin: d.margin,
        signal: d.signal as any,
      })),
    },
    sample: {
      tarifaRuns,
      mutiraoRuns,
      totalRuns,
      minRunsForSignal,
      sufficient: totalRuns >= minRunsForSignal * 1.5,
    },
    recommendation: {
      actionIfDecidable:
        finalDecision === 'focus_tarifa_zero'
          ? 'Concentrar recursos em Tarifa Zero RJ. Redirect visitor flow. Monitor para T41 next phase.'
          : finalDecision === 'focus_mutirao'
          ? 'Concentrar recursos em Mutirão do Bairro. Redirect visitor flow. Monitor para T41 next phase.'
          : finalDecision === 'maintain_dual_arcade'
          ? 'Manter estratégia pareada. Ambos arcades continuam em equal exposure. Reavaliar em 7 dias.'
          : 'Aguardar coleta adicional pareada Tarifa vs Mutirão. Reavaliar em 7 dias.',
      actionIfDeferred: 'Continuar coleta pareada Tarifa vs Mutirão. Reavaliar em 7 dias.',
      campaignFocus:
        finalDecision === 'focus_tarifa_zero'
          ? 'concentrate_tarifa'
          : finalDecision === 'focus_mutirao'
          ? 'concentrate_mutirao'
          : finalDecision === 'maintain_dual_arcade'
          ? 'maintain_parity'
          : 'defer_and_retest',
    },
  };
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
  const arcadeLineDecision = getArcadeLineDecision(arcadeInsights.byArcadeGame);

  // Tijolo 33: Effective Runs Analysis
  let effectiveRuns: EffectiveRunsAnalysis | undefined;
  try {
    const territoryBySlug = Object.fromEntries(
      gamesCatalog.map((game) => [game.slug, (game as any).territoryScope || 'estado-rj']),
    );
    effectiveRuns = analyzeEffectiveRuns(filteredEvents, {
      sessions: filteredSessions.map((session) => ({
        sessionId: session.sessionId,
        slug: session.slug,
        utmSource: session.utm_source,
      })),
      territoryBySlug,
    });
  } catch {
    // Se falhar, continua sem effective runs
    effectiveRuns = undefined;
  }

  const arcadeExposureDuel = getArcadeExposureDuel(normalizedEvents, arcadeLineDecision, effectiveRuns);
  const arcadeConvergenceScorecard = getArcadeConvergenceScorecard(arcadeLineDecision, arcadeExposureDuel, arcadeInsights.byArcadeGame);
  const arcadeFinalDecision = buildFinalArcadeDecision(arcadeLineDecision, arcadeExposureDuel, arcadeConvergenceScorecard);

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
    arcadeLineDecision,
    arcadeExposureDuel,
    arcadeConvergenceScorecard,
    arcadeFinalDecision,
    effectiveRuns,
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
                  // Tijolo 32 events
                  'card_preview_interaction',
                  'card_full_click',
                  'click_to_play_time',
                  'replay_after_run_click',
                  'next_game_after_run_click',
                  'quick_to_arcade_click',
                  'arcade_to_quick_click',
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

        // Tijolo 33: Effective Runs Analysis
        let effectiveRuns: EffectiveRunsAnalysis | undefined;
        try {
          const territoryBySlug = Object.fromEntries(
            gamesCatalog.map((game) => [game.slug, (game as any).territoryScope || 'estado-rj']),
          );
          const eventsForAnalysis = rawEventRows.map<AnalyticsEventPayload>((row) => ({
            sessionId: row.session_id,
            anonymousId: 'remote',
            event: row.event_name as AnalyticsEventName,
            slug: row.slug,
            engineKind: row.engine_kind,
            ctaId: row.cta_id,
            metadata: row.metadata as Record<string, string | number | boolean | null> | undefined,
            createdAt: row.created_at || new Date().toISOString(),
          }));
          effectiveRuns = analyzeEffectiveRuns(eventsForAnalysis, {
            sessions: sessions.map((session) => ({
              sessionId: session.sessionId,
              slug: session.slug,
              utmSource: session.utm_source,
            })),
            territoryBySlug,
          });
        } catch {
          // Se falhar, continua sem effective runs
          effectiveRuns = undefined;
        }
    const arcadeInsights = getArcadeInsights(gamesCatalog, normalizedEvents);
    const arcadeLineDecision = getArcadeLineDecision(arcadeInsights.byArcadeGame);
    const arcadeExposureDuel = getArcadeExposureDuel(normalizedEvents, arcadeLineDecision, effectiveRuns);
    const arcadeConvergenceScorecard = getArcadeConvergenceScorecard(arcadeLineDecision, arcadeExposureDuel, arcadeInsights.byArcadeGame);
    const arcadeFinalDecision = buildFinalArcadeDecision(arcadeLineDecision, arcadeExposureDuel, arcadeConvergenceScorecard);

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
      arcadeLineDecision,
      arcadeExposureDuel,
      arcadeConvergenceScorecard,
      arcadeFinalDecision,
      effectiveRuns,
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

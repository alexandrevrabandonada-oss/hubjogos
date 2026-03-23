'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  COLLECTIVE_SOLUTION_LABELS,
  COMMON_VS_MARKET_LABELS,
  GAME_SERIES_LABELS,
  POLITICAL_AXIS_LABELS,
  TERRITORY_SCOPE_LABELS,
  games,
} from '@/lib/games/catalog';
import { collectBestAvailableMetrics } from '@/lib/analytics/metrics';
import type { MetricsSnapshot } from '@/lib/analytics/metrics';
import type { TimeWindow } from '@/lib/analytics/windowing';
import { formatTimeAgo } from '@/lib/analytics/windowing';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { listAllExperiments } from '@/lib/experiments/config';
import { calculateMutiraoEffectiveness, compareMutiraoVsTarifaZero } from '@/lib/games/arcade/mutirao-effectiveness';
import { calculateCooperativaEffectiveness, resolveCooperativaDecision } from '@/lib/games/arcade/cooperativa-effectiveness';
import { getLocalArray } from '@/lib/storage/local-session';
import type { AnalyticsEventPayload } from '@/lib/analytics/events';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import styles from './metrics.module.css';

interface OpsRoutineStatus {
  snapshotAt: string | null;
  snapshotSource: string | null;
  prioritarioPendentes: number;
  lastAuditAt: string | null;
  lastAuditActionType: string | null;
  auditIsRecent: boolean;
  automationConfigured: boolean;
}

interface StalenessAlert {
  severity: 'warning' | 'critical';
  category: string;
  message: string;
}

interface StalenessReport {
  checkedAt: string;
  stalenessThreshold: string;
  lastSessionAt: string | null;
  lastEventAt: string | null;
  summary: {
    critical: number;
    warnings: number;
    healthy: boolean;
  };
  alerts: StalenessAlert[];
}

type Severity = 'ok' | 'warning' | 'critical';

function toHoursSince(value: string | Date | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const date = typeof value === 'string' ? new Date(value) : value;
  const timestamp = date.getTime();
  if (Number.isNaN(timestamp)) {
    return null;
  }

  return (Date.now() - timestamp) / (1000 * 60 * 60);
}

function severityClass(severity: Severity) {
  if (severity === 'critical') {
    return styles.severityCritical;
  }
  if (severity === 'warning') {
    return styles.severityWarning;
  }
  return styles.severityOk;
}

function severityLabel(severity: Severity) {
  if (severity === 'critical') {
    return '🔴 CRÍTICO';
  }
  if (severity === 'warning') {
    return '🟡 WARNING';
  }
  return '🟢 INFO';
}

function getWorstSeverity(levels: Severity[]): Severity {
  if (levels.includes('critical')) {
    return 'critical';
  }
  if (levels.includes('warning')) {
    return 'warning';
  }
  return 'ok';
}

function windowLabel(window: TimeWindow) {
  if (window === '24h') {
    return 'Últimas 24h';
  }
  if (window === '7d') {
    return 'Últimos 7 dias';
  }
  if (window === '30d') {
    return 'Últimos 30 dias';
  }
  return 'Todo histórico';
}

function formatDelta(current: number, baseline: number) {
  if (baseline === 0) {
    return current === 0 ? '0%' : 'n/a';
  }

  const pct = Math.round(((current - baseline) / baseline) * 100);
  if (pct === 0) {
    return '0%';
  }

  return `${pct > 0 ? '+' : ''}${pct}%`;
}


export default function EstadoPage() {
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null);
  const [comparisonPrimary, setComparisonPrimary] = useState<MetricsSnapshot | null>(null);
  const [comparisonBaseline, setComparisonBaseline] = useState<MetricsSnapshot | null>(null);
  const [comparisonPair, setComparisonPair] = useState<{ primary: TimeWindow; baseline: TimeWindow } | null>(null);
  const [opsRoutine, setOpsRoutine] = useState<OpsRoutineStatus | null>(null);
  const [staleness, setStaleness] = useState<StalenessReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [window, setWindow] = useState<TimeWindow>('all'); // Tijolo 18

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      const pair = window === '24h'
        ? { primary: '24h' as TimeWindow, baseline: '7d' as TimeWindow }
        : { primary: '7d' as TimeWindow, baseline: '30d' as TimeWindow };

      const [currentData, primaryData, baselineData] = await Promise.all([
        collectBestAvailableMetrics(games, window),
        pair.primary === window ? Promise.resolve(null) : collectBestAvailableMetrics(games, pair.primary),
        pair.baseline === window ? Promise.resolve(null) : collectBestAvailableMetrics(games, pair.baseline),
      ]);

      if (!mounted) {
        return;
      }

      setMetrics(currentData);
      setComparisonPair(pair);
      setComparisonPrimary(primaryData || (pair.primary === window ? currentData : null));
      setComparisonBaseline(baselineData || (pair.baseline === window ? currentData : null));
      setLoading(false);
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [window]); // Depend on window

  useEffect(() => {
    let mounted = true;

    async function loadOpsRoutineStatus() {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !key) {
        if (mounted) {
          setOpsRoutine({
            snapshotAt: null,
            snapshotSource: null,
            prioritarioPendentes: 0,
            lastAuditAt: null,
            lastAuditActionType: null,
            auditIsRecent: false,
            automationConfigured: false,
          });
        }
        return;
      }

      try {
        const [snapshotRes, prioritarioRes, lastAuditRes] = await Promise.all([
          fetch(
            `${url}/rest/v1/ops_audit_log?select=created_at,actor_source,action_type&action_type=eq.snapshot_generated&order=created_at.desc&limit=1`,
            {
              headers: {
                apikey: key,
                Authorization: `Bearer ${key}`,
              },
            },
          ),
          fetch(
            `${url}/rest/v1/feedback_records?select=feedback_id&triage_status=eq.prioritario`,
            {
              headers: {
                apikey: key,
                Authorization: `Bearer ${key}`,
              },
            },
          ),
          fetch(
            `${url}/rest/v1/ops_audit_log?select=created_at,action_type&order=created_at.desc&limit=1`,
            {
              headers: {
                apikey: key,
                Authorization: `Bearer ${key}`,
              },
            },
          ),
        ]);

        const snapshotRows = snapshotRes.ok ? await snapshotRes.json() : [];
        const prioritarioRows = prioritarioRes.ok ? await prioritarioRes.json() : [];
        const lastAuditRows = lastAuditRes.ok ? await lastAuditRes.json() : [];

        const snapshot = snapshotRows[0] || null;
        const lastAudit = lastAuditRows[0] || null;
        const lastAuditAt = lastAudit?.created_at || null;

        let auditIsRecent = false;
        if (lastAuditAt) {
          const ageMs = Date.now() - new Date(lastAuditAt).getTime();
          auditIsRecent = ageMs <= 48 * 60 * 60 * 1000;
        }

        if (mounted) {
          setOpsRoutine({
            snapshotAt: snapshot?.created_at || null,
            snapshotSource: snapshot?.actor_source || null,
            prioritarioPendentes: prioritarioRows.length,
            lastAuditAt,
            lastAuditActionType: lastAudit?.action_type || null,
            auditIsRecent,
            automationConfigured: Boolean(snapshot?.actor_source === 'ops-cron'),
          });
        }
      } catch {
        if (mounted) {
          setOpsRoutine({
            snapshotAt: null,
            snapshotSource: null,
            prioritarioPendentes: 0,
            lastAuditAt: null,
            lastAuditActionType: null,
            auditIsRecent: false,
            automationConfigured: false,
          });
        }
      }
    }

    void loadOpsRoutineStatus();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadStaleness() {
      try {
        const response = await fetch('/api/ops/staleness/latest', { cache: 'no-store' });
        if (!response.ok) {
          if (mounted) {
            setStaleness(null);
          }
          return;
        }

        const data = (await response.json()) as StalenessReport;
        if (mounted) {
          setStaleness(data);
        }
      } catch {
        if (mounted) {
          setStaleness(null);
        }
      }
    }

    void loadStaleness();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <Section>
          <p>Carregando dados...</p>
        </Section>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className={styles.container}>
        <Section>
          <p>Erro ao carregar métricas.</p>
        </Section>
      </div>
    );
  }

  const completionRateOverall =
    metrics.totalSessions > 0
      ? Math.round((metrics.completedSessions / metrics.totalSessions) * 100)
      : 0;

  const firstInteractionCount = metrics.eventsByType.first_interaction_time || 0;
  const replayClickCount = metrics.eventsByType.replay_click || 0;
  const replayIntentCount = metrics.eventsByType.outcome_replay_intent || 0;
  const sharePlayClickCount = metrics.eventsByType.share_page_play_click || 0;
  const campaignMarkClickCount = metrics.eventsByType.campaign_mark_click || 0;
  const returnHubAfterOutcomeCount = metrics.eventsByType.return_to_hub_after_outcome || 0;

  const firstInteractionCoverage =
    metrics.funnel.starts > 0 ? Math.round((firstInteractionCount / metrics.funnel.starts) * 100) : 0;
  const replayIntentRate =
    metrics.funnel.completions > 0
      ? Math.round(((replayClickCount + replayIntentCount) / metrics.funnel.completions) * 100)
      : 0;
  const shareReentryPlayRate =
    metrics.circulation.shareReentry.sharePageViews > 0
      ? Math.round((sharePlayClickCount / metrics.circulation.shareReentry.sharePageViews) * 100)
      : 0;

  const gameBySlug = new Map(games.map((game) => [game.slug, game]));

  const seriesSummary = Object.entries(GAME_SERIES_LABELS).map(([series, label]) => {
    const inSeries = metrics.gamesSorted.filter((row) => gameBySlug.get(row.slug)?.series === series);
    const initiated = inSeries.reduce((sum, row) => sum + row.initiated, 0);
    const completed = inSeries.reduce((sum, row) => sum + row.completed, 0);
    const shares = inSeries.reduce((sum, row) => sum + row.shares, 0);
    return {
      series,
      label,
      initiated,
      completed,
      shares,
      completionRate: initiated > 0 ? Math.round((completed / initiated) * 100) : 0,
    };
  });

  const territorySummary = Object.entries(TERRITORY_SCOPE_LABELS).map(([scope, label]) => {
    const inScope = metrics.gamesSorted.filter((row) => gameBySlug.get(row.slug)?.territoryScope === scope);
    const initiated = inScope.reduce((sum, row) => sum + row.initiated, 0);
    const completed = inScope.reduce((sum, row) => sum + row.completed, 0);
    const shares = inScope.reduce((sum, row) => sum + row.shares, 0);
    return {
      scope,
      label,
      initiated,
      completed,
      shares,
      completionRate: initiated > 0 ? Math.round((completed / initiated) * 100) : 0,
    };
  });

  const politicalAxisSummary = Object.entries(POLITICAL_AXIS_LABELS).map(([axis, label]) => {
    const inAxis = metrics.gamesSorted.filter((row) => gameBySlug.get(row.slug)?.politicalAxis === axis);
    const initiated = inAxis.reduce((sum, row) => sum + row.initiated, 0);
    const completed = inAxis.reduce((sum, row) => sum + row.completed, 0);
    const shares = inAxis.reduce((sum, row) => sum + row.shares, 0);
    return {
      axis,
      label,
      initiated,
      completed,
      shares,
      completionRate: initiated > 0 ? Math.round((completed / initiated) * 100) : 0,
    };
  });

  const collectiveSolutionSummary = Object.entries(COLLECTIVE_SOLUTION_LABELS)
    .filter(([key]) => key !== 'nao-definido')
    .map(([solution, label]) => {
      const inSolution = metrics.gamesSorted.filter((row) => gameBySlug.get(row.slug)?.collectiveSolutionType === solution);
      const initiated = inSolution.reduce((sum, row) => sum + row.initiated, 0);
      const completed = inSolution.reduce((sum, row) => sum + row.completed, 0);
      const shares = inSolution.reduce((sum, row) => sum + row.shares, 0);
      return {
        solution,
        label,
        initiated,
        completed,
        shares,
        completionRate: initiated > 0 ? Math.round((completed / initiated) * 100) : 0,
      };
    });

  const commonVsMarketSummary = Object.entries(COMMON_VS_MARKET_LABELS).map(([frame, label]) => {
    const inFrame = metrics.gamesSorted.filter((row) => gameBySlug.get(row.slug)?.commonVsMarket === frame);
    const initiated = inFrame.reduce((sum, row) => sum + row.initiated, 0);
    const completed = inFrame.reduce((sum, row) => sum + row.completed, 0);
    return {
      frame,
      label,
      initiated,
      completed,
      completionRate: initiated > 0 ? Math.round((completed / initiated) * 100) : 0,
    };
  });

  const ideologicalSignals = metrics.eventsByType['ideological_axis_signal'] || 0;

  const quickReplayEvents = metrics.eventsByType['quick_minigame_replay'] || 0;
  const quickQrViews = metrics.eventsByType['final_card_qr_view'] || 0;
  const quickQrClicks = metrics.eventsByType['final_card_qr_click'] || 0;
  const quickQrCtr = quickQrViews > 0 ? Math.round((quickQrClicks / quickQrViews) * 100) : 0;

  const arcadeOverview = metrics.arcadeInsights.overview;
  const arcadeDecision = metrics.arcadeLineDecision;
  const arcadeExposureDuel = metrics.arcadeExposureDuel;

  // T39: Convergence scorecard (decision confidence)
  const arcadeConvergenceScorecard = metrics.arcadeConvergenceScorecard;
  const arcadeFinalDecision = metrics.arcadeFinalDecision;
  const arcadeDecisionLabel =
    arcadeDecision.decision.recommendation === 'arcade_a_leads'
      ? 'Arcade A (Tarifa Zero) lidera'
      : arcadeDecision.decision.recommendation === 'arcade_b_leads'
      ? 'Arcade B (Mutirao) lidera'
      : arcadeDecision.decision.recommendation === 'technical_tie'
      ? 'Empate tecnico'
      : 'Amostra insuficiente';
  const arcadeStateLabel = arcadeDecision.decision.state;
  const arcadeFairStatusLabel = arcadeExposureDuel.fairness.status;
  const arcadeExposureSummary = arcadeExposureDuel.fairness.summary;
  const arcadeUnderexposed = arcadeExposureDuel.fairness.underexposedArcade;
  const arcadeVsQuickRunDelta = arcadeOverview.runs - arcadeOverview.quickStarts;
  const arcadeVsQuickReplayDelta = arcadeOverview.replayRate - arcadeOverview.quickReplayRate;
  const mutiraoActions = metrics.eventsByType['mutirao_action_used'] || 0;
  const mutiraoEvents = metrics.eventsByType['mutirao_event_triggered'] || 0;
  const mutiraoPressurePeak = metrics.eventsByType['mutirao_pressure_peak'] || 0;

  // T36C/T49: Arcade effectiveness scorecards from tracked events
  const events = getLocalArray<AnalyticsEventPayload>('events');
  const mutiraoEffectiveness = calculateMutiraoEffectiveness(events);
  const cooperativaEffectiveness = calculateCooperativaEffectiveness(events);
  const cooperativaDecision = resolveCooperativaDecision(cooperativaEffectiveness);

  const bairroResisteRuns = events.filter((e) => e.event === 'arcade_run_end' && e.slug === 'bairro-resiste');
  const bairroMostCriticalHotspots = bairroResisteRuns.map(e => e.metadata?.bairro_worst_hotspot).filter(Boolean);
  const bairroPhaseReached = bairroResisteRuns.map(e => e.metadata?.bairro_phase_reached as number).filter(Boolean);
  const bairroMostUsedAction = bairroResisteRuns.map(e => e.metadata?.bairro_most_used_action).filter(Boolean);

  const getMode = (arr: any[]) => {
    if (!arr.length) return 'N/A';
    const counts = arr.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  };

  const bairroAvgPhase = bairroPhaseReached.length ? Math.round(bairroPhaseReached.reduce((a,b)=>a+b,0)/bairroPhaseReached.length) : 0;
  const bairroWorstHotspotMode = getMode(bairroMostCriticalHotspots);
  const bairroMostUsedActionMode = getMode(bairroMostUsedAction);
  const bairroRunCount = bairroResisteRuns.length;
  
  // Calculate Tarifa Zero metrics for comparison
  const tarifaZeroScores = events
    .filter((e) => e.event === 'arcade_score' && e.slug === 'tarifa-zero-rj')
    .map((e) => e.metadata?.score as number | undefined)
    .filter((s): s is number => s !== undefined);
  const tarifaZeroAvgScore = tarifaZeroScores.length > 0 
    ? Math.round(tarifaZeroScores.reduce((a, b) => a + b, 0) / tarifaZeroScores.length)
    : 0;
  const tarifaZeroReplays = events.filter((e) => e.event === 'arcade_replay_click' && e.slug === 'tarifa-zero-rj');
  const tarifaZeroRuns = events.filter((e) => e.event === 'arcade_run_start' && e.slug === 'tarifa-zero-rj');
  const tarifaZeroReplayRate = tarifaZeroRuns.length > 0 
    ? Math.round((tarifaZeroReplays.length / tarifaZeroRuns.length) * 100)
    : 0;
  
  const mutiraoVsTarifaZero = compareMutiraoVsTarifaZero(
    mutiraoEffectiveness,
    tarifaZeroAvgScore,
    tarifaZeroReplayRate,
  );

  const homePrimaryPlayClicks = metrics.eventsByType['home_primary_play_click'] || 0;
  const homeArcadeClicks = metrics.eventsByType['home_arcade_click'] || 0;
  const homeQuickClicks = metrics.eventsByType['home_quick_click'] || 0;
  const aboveFoldGameClicks = metrics.eventsByType['above_fold_game_click'] || 0;
  const homePlayNowClicks = metrics.eventsByType['home_play_now_block_click'] || 0;
  const quickVsArcadeChoices =
    (metrics.eventsByType['home_quick_vs_arcade_choice'] || 0) +
    (metrics.eventsByType['arcade_vs_quick_preference'] || 0);
  const manifestoExpandClicks = metrics.eventsByType['manifesto_expand_click'] || 0;
  const seriesClicks = metrics.eventsByType['series_click'] || 0;
  const explorarArcadeClicks = metrics.eventsByType['explorar_arcade_click'] || 0;
  const explorarQuickClicks = metrics.eventsByType['explorar_quick_click'] || 0;
  const explorarFilterChanges = metrics.eventsByType['explorar_filter_change'] || 0;

  // Tijolo 32: Conversion & Replay metrics
  const cardFullClicks = metrics.eventsByType['card_full_click'] || 0;
  const cardPreviewInteractions = metrics.eventsByType['card_preview_interaction'] || 0;
  const clickToPlayEvents = metrics.eventsByType['click_to_play_time'] || 0;
  const replayAfterRunClicks = metrics.eventsByType['replay_after_run_click'] || 0;
  const nextGameAfterRunClicks = metrics.eventsByType['next_game_after_run_click'] || 0;
  const quickToArcadeClicks = metrics.eventsByType['quick_to_arcade_click'] || 0;
  const arcadeToQuickClicks = metrics.eventsByType['arcade_to_quick_click'] || 0;

  const cardPreviewCtr = cardFullClicks > 0 ? Math.round((cardPreviewInteractions / cardFullClicks) * 100) : 0;
  const replayAfterRunRate = metrics.funnel.completions > 0 ? Math.round((replayAfterRunClicks / metrics.funnel.completions) * 100) : 0;
  const nextGameAfterRunRate = metrics.funnel.completions > 0 ? Math.round((nextGameAfterRunClicks / metrics.funnel.completions) * 100) : 0;
  const crossGameConversionTotal = quickToArcadeClicks + arcadeToQuickClicks;

  // Tijolo 33: Effective runs readout
  const effective = metrics.effectiveRuns;
  const effectivePreviewToPlay = effective?.previewToPlay;
  const effectiveReplay = effective?.replayEffectiveness;
  const effectiveCrossGame = effective?.crossGameEffectiveness;
  const effectiveQuickToArcade = effective?.quickToArcadeEffective;
  const effectiveArcadeToQuick = effective?.arcadeToQuickEffective;
  const effectiveCardToRun = effective?.cardClickToRun;

  const effectiveRunsByGame = effective
    ? Array.from(effective.effectiveRunsByGame.values())
      .sort((a, b) => b.effectiveRunRate - a.effectiveRunRate)
      .slice(0, 5)
    : [];

  const effectiveReplayByGame = effective
    ? Array.from(effective.effectiveReplayByGame.values())
      .sort((a, b) => b.effectiveReplayRate - a.effectiveReplayRate)
      .slice(0, 5)
    : [];

  const strongestCrossGameBridges = effective
    ? Array.from(effective.effectiveCrossGame.entries())
      .flatMap(([from, toMap]) =>
        Array.from(toMap.entries()).map(([to, starts]) => ({ from, to, starts })),
      )
      .sort((a, b) => b.starts - a.starts)
      .slice(0, 5)
    : [];

  const effectiveByChannel = (effective?.byChannel || []).slice(0, 5);
  const effectiveByTerritory = (effective?.byTerritory || []).slice(0, 5);

  const effectiveWarnings = effective?.warnings || [];

  const homeTotalTrackedClicks = homePrimaryPlayClicks + homeArcadeClicks + homeQuickClicks + homePlayNowClicks;
  const homeArcadeCtr =
    homeTotalTrackedClicks > 0 ? Math.round(((homePrimaryPlayClicks + homeArcadeClicks) / homeTotalTrackedClicks) * 100) : 0;
  const homeQuickCtr = homeTotalTrackedClicks > 0 ? Math.round((homeQuickClicks / homeTotalTrackedClicks) * 100) : 0;
  const homeToPlayByTypeDelta = homeArcadeCtr - homeQuickCtr;

  const trackedQuickSlugs = ['custo-de-viver', 'quem-paga-a-conta', 'cidade-em-comum'];
  const quickComparison = metrics.quickInsights.quickComparison
    .filter((row) => trackedQuickSlugs.includes(row.slug))
    .sort((a, b) => b.sessions - a.sessions);
  const quickRanking = metrics.quickInsights.rankingByStickiness.filter((row) => trackedQuickSlugs.includes(row.slug));

  const quickBySeries = Object.values(
    quickComparison.reduce<Record<string, {
      key: string;
      label: string;
      sessions: number;
      starts: number;
      completions: number;
      shares: number;
      replays: number;
      postGameCtaClicks: number;
      sharePagePlayClicks: number;
      stickyTotal: number;
      games: number;
    }>>((acc, row) => {
      const game = gameBySlug.get(row.slug);
      const key = game?.series || 'serie-nao-definida';
      const label = GAME_SERIES_LABELS[key as keyof typeof GAME_SERIES_LABELS] || key;
      if (!acc[key]) {
        acc[key] = {
          key,
          label,
          sessions: 0,
          starts: 0,
          completions: 0,
          shares: 0,
          replays: 0,
          postGameCtaClicks: 0,
          sharePagePlayClicks: 0,
          stickyTotal: 0,
          games: 0,
        };
      }
      acc[key].sessions += row.sessions;
      acc[key].starts += row.starts;
      acc[key].completions += row.completions;
      acc[key].shares += row.shares;
      acc[key].replays += row.replays;
      acc[key].postGameCtaClicks += row.postGameCtaClicks;
      acc[key].sharePagePlayClicks += row.sharePagePlayClicks;
      acc[key].stickyTotal += row.stickyScore;
      acc[key].games += 1;
      return acc;
    }, {}),
  )
    .map((row) => ({
      ...row,
      completionRate: row.sessions > 0 ? Math.round((row.completions / row.sessions) * 100) : 0,
      replayRate: row.completions > 0 ? Math.round((row.replays / row.completions) * 100) : 0,
      shareRate: row.completions > 0 ? Math.round((row.shares / row.completions) * 100) : 0,
      stickyScore: row.games > 0 ? Math.round(row.stickyTotal / row.games) : 0,
    }))
    .sort((a, b) => b.stickyScore - a.stickyScore);

  const quickByTerritory = Object.values(
    quickComparison.reduce<Record<string, {
      key: string;
      label: string;
      sessions: number;
      shares: number;
      replays: number;
      completions: number;
      stickyTotal: number;
      games: number;
      topGameSlug: string;
      topGameSessions: number;
    }>>((acc, row) => {
      const game = gameBySlug.get(row.slug);
      const key = game?.territoryScope || 'estado-rj';
      const label = TERRITORY_SCOPE_LABELS[key as keyof typeof TERRITORY_SCOPE_LABELS] || key;
      if (!acc[key]) {
        acc[key] = {
          key,
          label,
          sessions: 0,
          shares: 0,
          replays: 0,
          completions: 0,
          stickyTotal: 0,
          games: 0,
          topGameSlug: row.slug,
          topGameSessions: row.sessions,
        };
      }
      acc[key].sessions += row.sessions;
      acc[key].shares += row.shares;
      acc[key].replays += row.replays;
      acc[key].completions += row.completions;
      acc[key].stickyTotal += row.stickyScore;
      acc[key].games += 1;
      if (row.sessions > acc[key].topGameSessions) {
        acc[key].topGameSlug = row.slug;
        acc[key].topGameSessions = row.sessions;
      }
      return acc;
    }, {}),
  )
    .map((row) => ({
      ...row,
      shareRate: row.completions > 0 ? Math.round((row.shares / row.completions) * 100) : 0,
      replayRate: row.completions > 0 ? Math.round((row.replays / row.completions) * 100) : 0,
      stickyScore: row.games > 0 ? Math.round(row.stickyTotal / row.games) : 0,
      topGameTitle: gameBySlug.get(row.topGameSlug)?.title || row.topGameSlug,
    }))
    .sort((a, b) => b.stickyScore - a.stickyScore);

  const quickByAxis = Object.values(
    quickComparison.reduce<Record<string, {
      key: string;
      label: string;
      sessions: number;
      completions: number;
      shares: number;
      stickyTotal: number;
      games: number;
    }>>((acc, row) => {
      const game = gameBySlug.get(row.slug);
      const key = game?.politicalAxis || 'reforma-estatal';
      const label = POLITICAL_AXIS_LABELS[key as keyof typeof POLITICAL_AXIS_LABELS] || key;
      if (!acc[key]) {
        acc[key] = {
          key,
          label,
          sessions: 0,
          completions: 0,
          shares: 0,
          stickyTotal: 0,
          games: 0,
        };
      }
      acc[key].sessions += row.sessions;
      acc[key].completions += row.completions;
      acc[key].shares += row.shares;
      acc[key].stickyTotal += row.stickyScore;
      acc[key].games += 1;
      return acc;
    }, {}),
  )
    .map((row) => ({
      ...row,
      completionRate: row.sessions > 0 ? Math.round((row.completions / row.sessions) * 100) : 0,
      shareRate: row.completions > 0 ? Math.round((row.shares / row.completions) * 100) : 0,
      stickyScore: row.games > 0 ? Math.round(row.stickyTotal / row.games) : 0,
    }))
    .sort((a, b) => b.stickyScore - a.stickyScore);

  const quickSampleWarning = quickComparison.some((row) => row.sessions < metrics.quickInsights.heuristic.minSampleSessions);

  const replayByKind = Object.entries(metrics.gamesSorted.reduce<Record<string, { initiated: number; completed: number; shares: number }>>((acc, row) => {
    const kind = gameBySlug.get(row.slug)?.kind || 'unknown';
    if (!acc[kind]) {
      acc[kind] = { initiated: 0, completed: 0, shares: 0 };
    }
    acc[kind].initiated += row.initiated;
    acc[kind].completed += row.completed;
    acc[kind].shares += row.shares;
    return acc;
  }, {})).map(([kind, data]) => ({
    kind,
    initiated: data.initiated,
    replaySignal:
      data.initiated > 0 ? Math.round(((data.completed + data.shares) / data.initiated) * 100) : 0,
  }));

  const sourceLabel = isSupabaseConfigured
    ? metrics.source === 'hybrid'
      ? '🔵 híbrido (local + remoto)'
      : '🟡 remoto (Supabase)'
    : '🟢 local (localStorage)';

  const environmentLabel =
    metrics.environment === 'remote-production'
      ? 'Produção'
      : metrics.environment === 'remote-staging'
      ? 'Staging'
      : metrics.environment === 'hybrid'
      ? 'Híbrido'
      : 'Local/Dev';

  const isSentryConfigured = !!process.env.NEXT_PUBLIC_SENTRY_DSN || !!process.env.SENTRY_DSN;
  const hasCI = true;
  const enabledExperiments = listAllExperiments().filter((experiment) => experiment.enabled);

  const sampleSeverity: Severity =
    metrics.totalSessions < 10
      ? 'critical'
      : metrics.totalSessions < 40
        ? 'warning'
        : 'ok';

  const eventAgeHours = toHoursSince(metrics.lastEventAt);
  const stalenessFromMetricsSeverity: Severity =
    eventAgeHours === null
      ? 'warning'
      : eventAgeHours > 72
        ? 'critical'
        : eventAgeHours > 24
          ? 'warning'
          : 'ok';

  const stalenessSeverity: Severity = staleness
    ? staleness.summary.critical > 0
      ? 'critical'
      : staleness.summary.warnings > 0
        ? 'warning'
        : 'ok'
    : stalenessFromMetricsSeverity;

  const activeExperimentsWithoutTraffic = enabledExperiments.filter((experiment) => {
    const variants = metrics.experiments[experiment.key]?.variants;
    if (!variants) {
      return true;
    }

    const total = Object.values(variants).reduce((sum, variant) => sum + variant.sessions, 0);
    return total === 0;
  });

  const experimentsSeverity: Severity = activeExperimentsWithoutTraffic.length > 0 ? 'warning' : 'ok';

  const lowTrafficEngines = Object.entries(metrics.cohorts.byEngine)
    .filter(([, row]) => row.sessions > 0 && row.sessions < 5)
    .map(([engine]) => engine);

  const engineTrafficSeverity: Severity = lowTrafficEngines.length > 0 ? 'warning' : 'ok';

  const ctaExposureWithoutClicks = Object.entries(metrics.circulation.ctrByPlacement)
    .filter(([, row]) => row.outcomeViews >= 20 && row.clicks === 0)
    .map(([placement]) => placement);

  const ctaSeverity: Severity = ctaExposureWithoutClicks.length > 0 ? 'warning' : 'ok';

  const feedbackSeverity: Severity =
    (opsRoutine?.prioritarioPendentes || 0) > 0
      ? 'critical'
      : 'ok';

  const cockpitSeverity = getWorstSeverity([
    sampleSeverity,
    stalenessSeverity,
    experimentsSeverity,
    engineTrafficSeverity,
    ctaSeverity,
    feedbackSeverity,
  ]);

  const comparisonSampleInsufficient =
    !comparisonPrimary ||
    !comparisonBaseline ||
    comparisonPrimary.totalSessions < 10 ||
    comparisonBaseline.totalSessions < 10;

  return (
    <div className={styles.container}>
      <Section>
        <div className={styles.header}>
          <h1>Estado de Nação: Métricas</h1>
          <p className={styles.subtitle}>
            Leitura interna do uso do hub.
          </p>
          <div className={styles.sourceBadge}>
            {sourceLabel} · Ambiente: <strong>{environmentLabel}</strong>
          </div>
          <div className={`${styles.severityBadge} ${severityClass(cockpitSeverity)}`}>
            Cockpit: {severityLabel(cockpitSeverity)} · Janela ativa: <strong>{windowLabel(window)}</strong>
          </div>

          {/* Tijolo 18: Window selector */}
          <div className={styles.windowSelector}>
            <label htmlFor="window-select">Janela de leitura:</label>
            <select
              id="window-select"
              value={window}
              onChange={(e) => setWindow(e.target.value as TimeWindow)}
              className={styles.windowSelect}
            >
              <option value="all">Todo histórico</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="24h">Últimas 24 horas</option>
            </select>
            {metrics.lastEventAt && (
              <span className={styles.freshnessInfo}>
                Último evento: {formatTimeAgo(metrics.lastEventAt)}
              </span>
            )}
          </div>

          <div className={styles.opsStatus}>
            <span title="Observabilidade (Sentry)" className={isSentryConfigured ? styles.statusOk : styles.statusOff}>
              {isSentryConfigured ? '👁️ Monitoramento Ativo' : '⚪ Sem Monitoramento'}
            </span>
            <span title="Integração Contínua" className={hasCI ? styles.statusOk : styles.statusOff}>
              🚀 CI/CD Habilitado
            </span>
          </div>
          {!isSupabaseConfigured && (
            <p className={styles.supabaseWarning}>
              ⚠️ Supabase não configurado — exibindo apenas dados locais. Configure{' '}
              <code>NEXT_PUBLIC_SUPABASE_URL</code> e{' '}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> no{' '}
              <code>.env.local</code> para persistência remota.
            </p>
          )}
          <p className={styles.generatedAt}>
            Gerado em: <time>{new Date(metrics.generatedAt).toLocaleString('pt-BR')}</time>
          </p>
        </div>

        <Card className={styles.fullCard}>
          <div className={styles.cardTitleRow}>
            <h3>🧭 Cockpit Temporal Diário</h3>
            <span className={`${styles.severityBadge} ${severityClass(cockpitSeverity)}`}>{severityLabel(cockpitSeverity)}</span>
          </div>
          <div className={styles.signalGrid}>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Janela em uso</p>
              <p className={styles.signalValue}>{windowLabel(window)}</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Amostra da janela</p>
              <p className={styles.signalValue}>{metrics.totalSessions} sessões</p>
              <span className={`${styles.severityBadge} ${severityClass(sampleSeverity)}`}>
                {sampleSeverity === 'ok' ? 'Amostra legível' : 'Amostra baixa'}
              </span>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Último evento remoto visto</p>
              <p className={styles.signalValue}>
                {staleness?.lastEventAt
                  ? `${formatTimeAgo(new Date(staleness.lastEventAt))} (${new Date(staleness.lastEventAt).toLocaleString('pt-BR')})`
                  : metrics.lastEventAt
                    ? `${formatTimeAgo(metrics.lastEventAt)} (${metrics.lastEventAt.toLocaleString('pt-BR')})`
                    : 'Sem evento recente'}
              </p>
              <span className={`${styles.severityBadge} ${severityClass(stalenessSeverity)}`}>
                {staleness
                  ? `Staleness: ${staleness.summary.critical} crítico(s), ${staleness.summary.warnings} warning(s)`
                  : stalenessSeverity === 'ok'
                    ? 'Staleness saudável'
                    : 'Staleness exige atenção'}
              </span>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Experimentos ativos sem tráfego</p>
              <p className={styles.signalValue}>{activeExperimentsWithoutTraffic.length}</p>
              {activeExperimentsWithoutTraffic.length > 0 && (
                <p className={styles.signalNote}>{activeExperimentsWithoutTraffic.map((experiment) => experiment.key).join(', ')}</p>
              )}
            </div>
          </div>

          <div className={styles.signalList}>
            {lowTrafficEngines.length > 0 && (
              <p>⚠️ Engine com baixa atividade na janela: {lowTrafficEngines.join(', ')}.</p>
            )}
            {ctaExposureWithoutClicks.length > 0 && (
              <p>⚠️ CTA com exposição sem clique relevante: {ctaExposureWithoutClicks.join(', ')}.</p>
            )}
            {(opsRoutine?.prioritarioPendentes || 0) > 0 && (
              <p>🚨 Feedback prioritário pendente: {opsRoutine?.prioritarioPendentes || 0} item(ns).</p>
            )}
            {staleness?.alerts?.slice(0, 2).map((alert) => (
              <p key={`${alert.category}-${alert.message}`}>
                {alert.severity === 'critical' ? '🚨' : '⚠️'} {alert.category}: {alert.message}
              </p>
            ))}
            {lowTrafficEngines.length === 0 && ctaExposureWithoutClicks.length === 0 && (opsRoutine?.prioritarioPendentes || 0) === 0 && (!staleness || staleness.alerts.length === 0) && (
              <p>✅ Sem alertas operacionais relevantes para a janela atual.</p>
            )}
          </div>
        </Card>

        <Card className={styles.fullCard}>
          <div className={styles.cardTitleRow}>
            <h3>↔️ Comparação Leve de Janela</h3>
            <span className={styles.windowHint}>
              {comparisonPair ? `${windowLabel(comparisonPair.primary)} vs ${windowLabel(comparisonPair.baseline)}` : '24h vs 7d'}
            </span>
          </div>
          {comparisonPrimary && comparisonBaseline ? (
            <>
              {comparisonSampleInsufficient && (
                <p className={styles.supabaseWarning}>
                  ⚠️ Amostra insuficiente para leitura forte ({comparisonPrimary.totalSessions} vs {comparisonBaseline.totalSessions} sessões). Use tendência, não decisão final.
                </p>
              )}
              <div className={styles.signalGrid}>
                <div className={styles.signalItem}>
                  <p className={styles.signalLabel}>Tráfego por engine (sessões)</p>
                  <p className={styles.signalValue}>
                    {comparisonPrimary.totalSessions} vs {comparisonBaseline.totalSessions}
                  </p>
                  <p className={styles.signalNote}>Delta: {formatDelta(comparisonPrimary.totalSessions, comparisonBaseline.totalSessions)}</p>
                </div>
                <div className={styles.signalItem}>
                  <p className={styles.signalLabel}>Share/Reentry rate</p>
                  <p className={styles.signalValue}>
                    {comparisonPrimary.circulation.shareReentry.reentryRate}% vs {comparisonBaseline.circulation.shareReentry.reentryRate}%
                  </p>
                  <p className={styles.signalNote}>
                    Delta: {formatDelta(comparisonPrimary.circulation.shareReentry.reentryRate, comparisonBaseline.circulation.shareReentry.reentryRate)}
                  </p>
                </div>
                <div className={styles.signalItem}>
                  <p className={styles.signalLabel}>Top CTA (clicks)</p>
                  <p className={styles.signalValue}>
                    {(comparisonPrimary.circulation.topCtas[0]?.clicks || 0)} vs {(comparisonBaseline.circulation.topCtas[0]?.clicks || 0)}
                  </p>
                  <p className={styles.signalNote}>
                    Delta: {formatDelta(comparisonPrimary.circulation.topCtas[0]?.clicks || 0, comparisonBaseline.circulation.topCtas[0]?.clicks || 0)}
                  </p>
                </div>
                <div className={styles.signalItem}>
                  <p className={styles.signalLabel}>Experimentos com atividade</p>
                  <p className={styles.signalValue}>
                    {Object.values(comparisonPrimary.experiments).filter((exp) => Object.values(exp.variants).some((variant) => variant.sessions > 0)).length}
                    {' vs '}
                    {Object.values(comparisonBaseline.experiments).filter((exp) => Object.values(exp.variants).some((variant) => variant.sessions > 0)).length}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className={styles.techNote}>Comparação temporal indisponível neste momento.</p>
          )}
        </Card>

        <div className={styles.grid}>
          {/* Overview Cards */}
          <Card className={styles.card}>
            <h3>Sessões Totais</h3>
            <p className={styles.largeNumber}>{metrics.totalSessions}</p>
          </Card>

          <Card className={styles.card}>
            <h3>Funil: Inícios</h3>
            <p className={styles.largeNumber}>{metrics.funnel.starts}</p>
          </Card>

          <Card className={styles.card}>
            <h3>Funil: Conclusões</h3>
            <p className={styles.largeNumber}>{metrics.funnel.completions}</p>
          </Card>

          <Card className={styles.card}>
            <h3>Funil: Shares</h3>
            <p className={styles.largeNumber}>{metrics.funnel.shares}</p>
          </Card>

          <Card className={styles.card}>
            <h3>Conclusões</h3>
            <p className={styles.largeNumber}>{metrics.completedSessions}</p>
          </Card>

          <Card className={styles.card}>
            <h3>Taxa de Conclusão</h3>
            <p className={styles.largeNumber}>{completionRateOverall}%</p>
          </Card>

          <Card className={styles.card}>
            <h3>Eventos Capturados</h3>
            <p className={styles.largeNumber}>{metrics.totalEvents}</p>
          </Card>

          <Card className={styles.card}>
            <h3>Cobertura de 1ª interação</h3>
            <p className={styles.largeNumber}>{firstInteractionCoverage}%</p>
          </Card>

          <Card className={styles.card}>
            <h3>Intenção de replay</h3>
            <p className={styles.largeNumber}>{replayIntentRate}%</p>
          </Card>

          <Card className={styles.card}>
            <h3>Share → jogar</h3>
            <p className={styles.largeNumber}>{shareReentryPlayRate}%</p>
          </Card>

          <Card className={styles.card}>
            <h3>Cliques na assinatura</h3>
            <p className={styles.largeNumber}>{campaignMarkClickCount}</p>
          </Card>
        </div>

        <Card className={styles.fullCard}>
          <h3>Sinais de Diversão e Replay</h3>
          <div className={styles.eventsList}>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>first_interaction_time</span>
              <span className={styles.eventCount}>{firstInteractionCount}</span>
            </div>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>replay_click</span>
              <span className={styles.eventCount}>{replayClickCount}</span>
            </div>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>outcome_replay_intent</span>
              <span className={styles.eventCount}>{replayIntentCount}</span>
            </div>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>share_page_play_click</span>
              <span className={styles.eventCount}>{sharePlayClickCount}</span>
            </div>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>return_to_hub_after_outcome</span>
              <span className={styles.eventCount}>{returnHubAfterOutcomeCount}</span>
            </div>
          </div>
        </Card>

        <Card className={styles.fullCard}>
          <h3>Linha Arcade: visão rápida</h3>
          <div className={styles.signalGrid}>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Runs iniciadas</p>
              <p className={styles.signalValue}>{arcadeOverview.runs}</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Runs concluídas</p>
              <p className={styles.signalValue}>{arcadeOverview.runEnds}</p>
              <p className={styles.signalNote}>Run end rate: {arcadeOverview.runEndRate}%</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Score médio</p>
              <p className={styles.signalValue}>{arcadeOverview.scoreAverage}</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>First input médio</p>
              <p className={styles.signalValue}>{arcadeOverview.firstInputAvgMs}ms</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Replay pós-run</p>
              <p className={styles.signalValue}>{arcadeOverview.replayClicks}</p>
              <p className={styles.signalNote}>Taxa: {arcadeOverview.replayRate}%</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>CTA pós-run</p>
              <p className={styles.signalValue}>{arcadeOverview.campaignCtaClicks}</p>
              <p className={styles.signalNote}>Power-ups coletivos: {arcadeOverview.powerupCollects}</p>
            </div>
          </div>
          <p className={styles.techNote}>
            Eventos dedicados: arcade_run_start, arcade_run_end, arcade_score, arcade_first_input_time, arcade_replay_click, arcade_powerup_collect, arcade_campaign_cta_click, mutirao_action_used, mutirao_event_triggered, mutirao_pressure_peak.
          </p>
          <div className={styles.eventsList}>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>mutirao_action_used</span>
              <span className={styles.eventCount}>{mutiraoActions}</span>
            </div>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>mutirao_event_triggered</span>
              <span className={styles.eventCount}>{mutiraoEvents}</span>
            </div>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>mutirao_pressure_peak</span>
              <span className={styles.eventCount}>{mutiraoPressurePeak}</span>
            </div>
          </div>
        </Card>

        <Card className={styles.fullCard}>
          <h3>Quick vs Arcade (comparativo leve)</h3>
          <div className={styles.eventsList}>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>Starts quick</span>
              <span className={styles.eventCount}>{arcadeOverview.quickStarts}</span>
            </div>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>Runs arcade</span>
              <span className={styles.eventCount}>{arcadeOverview.runs}</span>
            </div>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>Delta runs - quick starts</span>
              <span className={styles.eventCount}>{arcadeVsQuickRunDelta}</span>
            </div>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>Replay rate quick</span>
              <span className={styles.eventCount}>{arcadeOverview.quickReplayRate}%</span>
            </div>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>Replay rate arcade</span>
              <span className={styles.eventCount}>{arcadeOverview.replayRate}%</span>
            </div>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>Delta replay arcade - quick</span>
              <span className={styles.eventCount}>{arcadeVsQuickReplayDelta}%</span>
            </div>
          </div>

          {metrics.arcadeInsights.byArcadeGame.length > 0 && (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Arcade</th>
                    <th>Visual</th>
                    <th>Runs</th>
                    <th>RunEnd%</th>
                    <th>Score médio</th>
                    <th>Replay%</th>
                    <th>First input</th>
                    <th>CTA pós-run</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.arcadeInsights.byArcadeGame.map((row) => {
                    const arcadeMeta = games.find((game) => game.slug === row.slug);

                    return (
                      <tr key={row.slug}>
                        <td className={styles.gameTitle}>{row.title}</td>
                        <td>
                          {arcadeMeta?.visualVersion ? (
                            <>
                              <div className={styles.gameTitle}>{arcadeMeta.visualVersion}</div>
                              <div className={styles.tableNote}>{arcadeMeta.assetSet}</div>
                              {arcadeMeta.premiumTheme ? <div className={styles.tableNote}>theme: {arcadeMeta.premiumTheme}</div> : null}
                              {arcadeMeta.audioProfile ? <div className={styles.tableNote}>audio: {arcadeMeta.audioProfile}</div> : null}
                            </>
                          ) : (
                            <span className={styles.tableNote}>canvas base</span>
                          )}
                        </td>
                        <td className={styles.numeric}>{row.runs}</td>
                        <td className={styles.numeric}>{row.runEndRate}%</td>
                        <td className={styles.numeric}>{row.scoreAverage}</td>
                        <td className={styles.numeric}>{row.replayRate}%</td>
                        <td className={styles.numeric}>{row.firstInputAvgMs}ms</td>
                        <td className={styles.numeric}>{row.campaignCtaClicks}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className={styles.fullCard}>
          <h3>Linha Arcade - comparacao oficial (T37)</h3>
          <div className={styles.signalGrid}>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Estado de decisao</p>
              <p className={styles.signalValue}>{arcadeStateLabel}</p>
              <p className={styles.signalNote}>{arcadeDecision.decision.summary}</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Leitura oficial da semana</p>
              <p className={styles.signalValue}>{arcadeDecisionLabel}</p>
              <p className={styles.signalNote}>Confianca: {arcadeDecision.duel.confidence}</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Score forca de campanha (Tarifa)</p>
              <p className={styles.signalValue}>{arcadeDecision.campaignStrength.tarifa.weightedScore}</p>
              <p className={styles.signalNote}>Runs: {arcadeDecision.campaignStrength.tarifa.runs}</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Score forca de campanha (Mutirao)</p>
              <p className={styles.signalValue}>{arcadeDecision.campaignStrength.mutirao.weightedScore}</p>
              <p className={styles.signalNote}>Runs: {arcadeDecision.campaignStrength.mutirao.runs}</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Duel points Tarifa</p>
              <p className={styles.signalValue}>{arcadeDecision.duel.tarifaPoints}</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Duel points Mutirao</p>
              <p className={styles.signalValue}>{arcadeDecision.duel.mutiraoPoints}</p>
              <p className={styles.signalNote}>Delta: {arcadeDecision.duel.pointsDelta}</p>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Dimensao</th>
                  <th>Tarifa Zero</th>
                  <th>Mutirao</th>
                  <th>Vencedor</th>
                </tr>
              </thead>
              <tbody>
                {arcadeDecision.duel.dimensions.map((dimension) => (
                  <tr key={dimension.key}>
                    <td className={styles.gameTitle}>{dimension.label}</td>
                    <td className={styles.numeric}>{dimension.tarifaValue}</td>
                    <td className={styles.numeric}>{dimension.mutiraoValue}</td>
                    <td className={styles.gameTitle}>{dimension.winner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {arcadeDecision.decision.warnings.length > 0 && (
            <div className={styles.warningBox}>
              ⚠️ Leitura sob cautela: {arcadeDecision.decision.warnings.join(' ')}
            </div>
          )}

          <p className={styles.techNote}>
            Regras T37: comparar Tarifa Zero vs Mutirao com guardrail de amostra minima, declarar lideranca apenas com sinal suficiente,
            e manter empate tecnico quando a margem for estreita.
          </p>
        </Card>

        <Card className={styles.fullCard}>
          <h3>Linha Arcade - Exposicao justa do duelo (T38)</h3>
          <div className={styles.signalGrid}>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Status do duelo justo</p>
              <p className={styles.signalValue}>{arcadeFairStatusLabel}</p>
              <p className={styles.signalNote}>{arcadeExposureSummary}</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Gap de exposicao</p>
              <p className={styles.signalValue}>{arcadeExposureDuel.fairness.exposureDeltaPct}pp</p>
              <p className={styles.signalNote}>Meta para comparacao justa: &le; 15pp</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Gap de share de runs</p>
              <p className={styles.signalValue}>{arcadeExposureDuel.fairness.runsDeltaPct}pp</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Lider por volume (runs)</p>
              <p className={styles.signalValue}>{arcadeExposureDuel.contextLeaders.volumeLeader}</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Lider por eficiencia (exposicao {'\u2192'} start)</p>
              <p className={styles.signalValue}>{arcadeExposureDuel.contextLeaders.efficiencyLeader}</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Lider por forca de campanha</p>
              <p className={styles.signalValue}>{arcadeExposureDuel.contextLeaders.campaignLeader}</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Arcade subexposto</p>
              <p className={styles.signalValue}>{arcadeUnderexposed || 'nenhum'}</p>
              <p className={styles.signalNote}>
                Boost recomendado: +{arcadeExposureDuel.fairness.recommendedExposureBoost} sinais na proxima janela
              </p>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Arcade</th>
                  <th>Exposicao</th>
                  <th>Cliques de interesse</th>
                  <th>Starts</th>
                  <th>Starts efetivos</th>
                  <th>Expo {'\u2192'} Start</th>
                  <th>Share exposicao</th>
                </tr>
              </thead>
              <tbody>
                {arcadeExposureDuel.scorecards.map((row) => (
                  <tr key={row.slug}>
                    <td className={styles.gameTitle}>{row.title}</td>
                    <td className={styles.numeric}>{row.exposureSignals}</td>
                    <td className={styles.numeric}>{row.intentClicks}</td>
                    <td className={styles.numeric}>{row.starts}</td>
                    <td className={styles.numeric}>{row.effectiveStarts}</td>
                    <td className={styles.numeric}>{row.exposureToStartRate}%</td>
                    <td className={styles.numeric}>{row.shareOfExposure}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(arcadeFairStatusLabel === 'unbalanced_exposure' || arcadeFairStatusLabel === 'exposure_correction_in_progress') && (
            <div className={styles.warningBox}>
              ⚠️ Janela ainda nao totalmente justa. Acoes sugeridas: {arcadeExposureDuel.fairness.actions.join(' ')}
            </div>
          )}

          <p className={styles.techNote}>
            Eventos T38 para equalizacao: home_arcade_click, explorar_arcade_click, quick_to_arcade_click,
            home_primary_play_click, above_fold_game_click, card_preview_interaction, card_full_click e arcade_run_start.
          </p>
        </Card>

        {arcadeConvergenceScorecard && (
          <Card className={styles.fullCard}>
            <h3>🎯 Decisão da Linha Arcade - Convergência (T39)</h3>
            <div className={styles.signalGrid}>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Estado de confiança</p>
                <p className={styles.signalValue}>{arcadeConvergenceScorecard.confidence.state}</p>
                <p className={styles.signalNote}>{arcadeConvergenceScorecard.confidence.summary}</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Escore de confiança</p>
                <p className={styles.signalValue}>{arcadeConvergenceScorecard.confidence.finalScore}/100</p>
                <p className={styles.signalNote}>Raw: {arcadeConvergenceScorecard.confidence.rawScore} - Amostra: -{arcadeConvergenceScorecard.confidence.sampleDeduction} - Exp: -{arcadeConvergenceScorecard.confidence.exposureDeduction}</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Amostra (runs efetivos)</p>
                <p className={styles.signalValue}>{arcadeConvergenceScorecard.sample.totalEffectiveRuns}</p>
                <p className={styles.signalNote}>Tarifa: {arcadeConvergenceScorecard.sample.tarifaEffectiveRuns}/{arcadeConvergenceScorecard.sample.minEffectiveRunsPerArcade} | Mutirao: {arcadeConvergenceScorecard.sample.mutiraoEffectiveRuns}/{arcadeConvergenceScorecard.sample.minEffectiveRunsPerArcade}</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Dimensões alinhadas</p>
                <p className={styles.signalValue}>{arcadeConvergenceScorecard.convergence.alignedDimensions}/{arcadeConvergenceScorecard.convergence.totalDimensions}</p>
                <p className={styles.signalNote}>Rácio: {Math.round(arcadeConvergenceScorecard.convergence.alignmentRatio * 100)}%</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Pronto para decidir?</p>
                <p className={styles.signalValue}>{arcadeConvergenceScorecard.decision.readyToDecide ? '✅ Sim' : '⏳ Não'}</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Líder recomendado</p>
                <p className={styles.signalValue}>{arcadeConvergenceScorecard.decision.recommendedLeader}</p>
                <p className={styles.signalNote}>{arcadeConvergenceScorecard.decision.rationale}</p>
              </div>
            </div>

            {arcadeConvergenceScorecard.convergence.divergentDimensions.length > 0 && (
              <div className={styles.warningBox}>
                ⚠️ Dimensões divergentes: {arcadeConvergenceScorecard.convergence.divergentDimensions.join(', ')}
              </div>
            )}

            {arcadeConvergenceScorecard.confidence.warnings.length > 0 && (
              <div className={styles.warningBox}>
                📝 Avisos: {arcadeConvergenceScorecard.confidence.warnings.join(' ')}
              </div>
            )}

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Dimensão</th>
                    <th>Tarifa</th>
                    <th>Mutirão</th>
                    <th>Líder</th>
                    <th>Margem</th>
                    <th>Força</th>
                  </tr>
                </thead>
                <tbody>
                  {arcadeConvergenceScorecard.dimensions.map((dim) => (
                    <tr key={dim.key}>
                      <td className={styles.gameTitle}>{dim.label}</td>
                      <td className={styles.numeric}>{dim.tarifaValue}</td>
                      <td className={styles.numeric}>{dim.mutiraoValue}</td>
                      <td className={styles.gameTitle}>{dim.leader}</td>
                      <td className={styles.numeric}>{Math.round(dim.margin)}%</td>
                      <td className={styles.numeric}>{dim.signal === 'strong' ? '💪 Forte' : dim.signal === 'moderate' ? '➡️ Moderado' : dim.signal === 'weak' ? '🤏 Fraco' : '❌ Ausente'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className={styles.techNote}>
              T39 mede convergência entre 6 dimensões (volume, exposição, eficiência, engajamento, campanha, QR). Estado: {arcadeConvergenceScorecard.confidence.state}. Próxima ação: {arcadeConvergenceScorecard.decision.nextActionIfNotReady}
            </p>
          </Card>
        )}

        {arcadeFinalDecision && (
          <Card className={styles.fullCard}>
            <h3>🏁 Decisão Final da Linha Arcade (T40)</h3>
            <div className={styles.signalGrid}>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Decisão Final</p>
                <p className={styles.signalValue} style={{
                  color: arcadeFinalDecision.decision === 'focus_tarifa_zero' ? '#2E7D32' :
                         arcadeFinalDecision.decision === 'focus_mutirao' ? '#F9A825' :
                         arcadeFinalDecision.decision === 'maintain_dual_arcade' ? '#1976D2' :
                         '#D32F2F'
                }}>
                  {arcadeFinalDecision.decision === 'focus_tarifa_zero' ? 'Tarifa Zero RJ' :
                   arcadeFinalDecision.decision === 'focus_mutirao' ? 'Mutirão do Bairro' :
                   arcadeFinalDecision.decision === 'maintain_dual_arcade' ? 'Manter Dual' :
                   'Adiar Decisão'}
                </p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Confiança</p>
                <p className={styles.signalValue}>{arcadeFinalDecision.confidence}%</p>
                <p className={styles.signalNote}>Score: {arcadeFinalDecision.t39.score}/100</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Líder T37</p>
                <p className={styles.signalValue}>{arcadeFinalDecision.t37.leader === 'tarifa-zero-corredor' ? 'Tarifa' : 
                                                   arcadeFinalDecision.t37.leader === 'mutirao-do-bairro' ? 'Mutirão' : 'N/A'}</p>
                <p className={styles.signalNote}>{arcadeFinalDecision.t37.confidence}</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Status T38</p>
                <p className={styles.signalValue}>{arcadeFinalDecision.t38.fairnessStatus}</p>
                <p className={styles.signalNote}>Δ={Math.round(arcadeFinalDecision.t38.exposureDeltaPct)}pp</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Dims Alinhadas</p>
                <p className={styles.signalValue}>{arcadeFinalDecision.t39.alignedDimensions}/{arcadeFinalDecision.t39.totalDimensions}</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Amostra</p>
                <p className={styles.signalValue}>{arcadeFinalDecision.sample.totalRuns}</p>
                <p className={styles.signalNote}>{arcadeFinalDecision.sample.sufficient ? '✅ Suficiente' : '❌ Insuficiente'}</p>
              </div>
            </div>

            {arcadeFinalDecision.blockers.length > 0 && (
              <div className={styles.warningBox} style={{ backgroundColor: '#FFEBEE', borderColor: '#D32F2F' }}>
                🛑 <strong>Blocadores:</strong> {arcadeFinalDecision.blockers.join(' | ')}
              </div>
            )}

            {arcadeFinalDecision.enablers.length > 0 && (
              <div className={styles.warningBox} style={{ backgroundColor: '#E8F5E9', borderColor: '#2E7D32' }}>
                ✅ <strong>Habilitadores:</strong> {arcadeFinalDecision.enablers.join(' | ')}
              </div>
            )}

            {arcadeFinalDecision.stability && (
              <div className={styles.warningBox} style={{ 
                backgroundColor: '#FFF9C4', 
                borderColor: '#F9A825',
                marginTop: '1rem'
              }}>
                <strong>📊 Estabilidade & Persistência (T40):</strong>
                <br />
                • Estado atual há {arcadeFinalDecision.stability.stateDurationDays} dias ({arcadeFinalDecision.stability.decisionStable ? '✅ Estável' : '⏳ Flutuando'})
                <br />
                • Persistência como candidato: {arcadeFinalDecision.stability.candidatePersistenceDays} dias ({arcadeFinalDecision.stability.candidateReadyForPromotion ? '✅ Autorizado (7d)' : '⏳ Aguardando 7d'})
                <br />
                • Mudanças de estado: {arcadeFinalDecision.stability.stateChanges} (período: {arcadeFinalDecision.stability.observationPeriod}, histórico: {arcadeFinalDecision.stability.historySize} snapshots)
                {arcadeFinalDecision.stability.lastStateChange && (
                  <>
                    <br />
                    • Última mudança: {new Date(arcadeFinalDecision.stability.lastStateChange).toLocaleString('pt-BR')}
                  </>
                )}
              </div>
            )}

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Dimensão</th>
                    <th>Tarifa</th>
                    <th>Mutirão</th>
                    <th>Líder</th>
                    <th>Margem</th>
                    <th>Força</th>
                  </tr>
                </thead>
                <tbody>
                  {arcadeFinalDecision.t39.dimensions.map((dim) => (
                    <tr key={dim.key}>
                      <td className={styles.gameTitle}>{dim.label}</td>
                      <td className={styles.numeric}>-</td>
                      <td className={styles.numeric}>-</td>
                      <td className={styles.gameTitle}>{dim.leader === 'tarifa-zero-corredor' ? 'Tarifa' : 
                                                         dim.leader === 'mutirao-do-bairro' ? 'Mutirão' : 'N/A'}</td>
                      <td className={styles.numeric}>{dim.margin}%</td>
                      <td className={styles.numeric}>{dim.signal === 'strong' ? '💪 Forte' : dim.signal === 'moderate' ? '➡️ Moderado' : dim.signal === 'weak' ? '🤏 Fraco' : '❌ Ausente'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.warningBox} style={{ 
              backgroundColor: '#F5F5F5', 
              borderColor: '#666',
              marginTop: '1rem'
            }}>
              <strong>Recomendação:</strong> {arcadeFinalDecision.recommendation.actionIfDecidable}
            </div>

            <p className={styles.techNote}>
              T40 consolida T37+T38+T39 com bloqueadores explícitos. Decisão: {arcadeFinalDecision.decision}. Campanha: {arcadeFinalDecision.recommendation.campaignFocus}
            </p>
          </Card>
        )}

        {mutiraoEffectiveness.totalRuns > 0 && (
          <Card className={styles.fullCard}>
            <h3>🎮 Mutirão do Bairro – Efetividade (T36C Premium)</h3>
            <div className={styles.signalGrid}>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Total de runs</p>
                <p className={styles.signalValue}>{mutiraoEffectiveness.totalRuns}</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Taxa de colapso</p>
                <p className={styles.signalValue} style={{ 
                  color: mutiraoEffectiveness.collapseRate > 60 ? '#D74B4B' : 
                         mutiraoEffectiveness.collapseRate > 40 ? '#F18F4E' : '#7FD36E' 
                }}>
                  {mutiraoEffectiveness.collapseRate}%
                </p>
                <p className={styles.signalNote}>{mutiraoEffectiveness.collapseCount} colapsos / {mutiraoEffectiveness.survivalCount} sobrevivências</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Score médio</p>
                <p className={styles.signalValue}>{mutiraoEffectiveness.avgScore}</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Diversidade de ações</p>
                <p className={styles.signalValue}>{mutiraoEffectiveness.actionDiversity}</p>
                <p className={styles.signalNote}>0-100: distribuição uniforme entre ações</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Ação mais usada</p>
                <p className={styles.signalValue}>{mutiraoEffectiveness.mostUsedAction}</p>
                <p className={styles.signalNote}>{mutiraoEffectiveness.totalActions} ações totais</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Pico de pressão médio</p>
                <p className={styles.signalValue}>{mutiraoEffectiveness.avgPressurePeak}%</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Duração média</p>
                <p className={styles.signalValue}>{Math.round(mutiraoEffectiveness.avgDurationMs / 1000)}s</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Taxa de replay</p>
                <p className={styles.signalValue}>{mutiraoEffectiveness.replayRate}%</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Taxa coletiva média</p>
                <p className={styles.signalValue}>{mutiraoEffectiveness.collectiveRate}%</p>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <h4>Breakdown de ações</h4>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Ação</th>
                    <th>Usos</th>
                    <th>% do total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={styles.gameTitle}>Reparar</td>
                    <td className={styles.numeric}>{mutiraoEffectiveness.actionBreakdown.reparar}</td>
                    <td className={styles.numeric}>
                      {mutiraoEffectiveness.totalActions > 0 
                        ? Math.round((mutiraoEffectiveness.actionBreakdown.reparar / mutiraoEffectiveness.totalActions) * 100)
                        : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.gameTitle}>Defender</td>
                    <td className={styles.numeric}>{mutiraoEffectiveness.actionBreakdown.defender}</td>
                    <td className={styles.numeric}>
                      {mutiraoEffectiveness.totalActions > 0 
                        ? Math.round((mutiraoEffectiveness.actionBreakdown.defender / mutiraoEffectiveness.totalActions) * 100)
                        : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.gameTitle}>Mobilizar</td>
                    <td className={styles.numeric}>{mutiraoEffectiveness.actionBreakdown.mobilizar}</td>
                    <td className={styles.numeric}>
                      {mutiraoEffectiveness.totalActions > 0 
                        ? Math.round((mutiraoEffectiveness.actionBreakdown.mobilizar / mutiraoEffectiveness.totalActions) * 100)
                        : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.gameTitle}>Mutirão</td>
                    <td className={styles.numeric}>{mutiraoEffectiveness.actionBreakdown.mutirao}</td>
                    <td className={styles.numeric}>
                      {mutiraoEffectiveness.totalActions > 0 
                        ? Math.round((mutiraoEffectiveness.actionBreakdown.mutirao / mutiraoEffectiveness.totalActions) * 100)
                        : 0}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.tableWrap}>
              <h4>Eventos especiais</h4>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Evento</th>
                    <th>Ocorrências</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={styles.gameTitle}>Chuva forte</td>
                    <td className={styles.numeric}>{mutiraoEffectiveness.eventBreakdown.chuvaForte}</td>
                  </tr>
                  <tr>
                    <td className={styles.gameTitle}>Boato de pânico</td>
                    <td className={styles.numeric}>{mutiraoEffectiveness.eventBreakdown.boatoPanico}</td>
                  </tr>
                  <tr>
                    <td className={styles.gameTitle}>Onda solidária</td>
                    <td className={styles.numeric}>{mutiraoEffectiveness.eventBreakdown.ondaSolidaria}</td>
                  </tr>
                  <tr>
                    <td className={styles.gameTitle}>Tranco de sabotagem</td>
                    <td className={styles.numeric}>{mutiraoEffectiveness.eventBreakdown.trancoSabotagem}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.tableWrap}>
              <h4>Milestones de pressão</h4>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Threshold</th>
                    <th>Atingidos</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={styles.gameTitle}>55% (Moderado)</td>
                    <td className={styles.numeric}>{mutiraoEffectiveness.pressureMilestones.peak55}</td>
                  </tr>
                  <tr>
                    <td className={styles.gameTitle}>70% (Alto)</td>
                    <td className={styles.numeric}>{mutiraoEffectiveness.pressureMilestones.peak70}</td>
                  </tr>
                  <tr>
                    <td className={styles.gameTitle}>85% (Crítico)</td>
                    <td className={styles.numeric}>{mutiraoEffectiveness.pressureMilestones.peak85}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {mutiraoVsTarifaZero && (
              <div className={styles.techNote}>
                <strong>Comparativo Mutirão vs Tarifa Zero RJ:</strong>
                <p>
                  Engajamento Mutirão: {mutiraoVsTarifaZero.mutiraoEngagement === 'higher' ? '⬆ Superior' : 
                                        mutiraoVsTarifaZero.mutiraoEngagement === 'similar' ? '➡ Similar' : '⬇ Inferior'} 
                  {' | '}Score: {mutiraoVsTarifaZero.scoreComparison}
                  {' | '}Replay: {mutiraoVsTarifaZero.replayComparison}
                </p>
                <p className={styles.signalNote}>{mutiraoVsTarifaZero.recommendation}</p>
              </div>
            )}

            <p className={styles.techNote}>
              Eventos Mutirão: mutirao_action_used, mutirao_event_triggered, mutirao_pressure_peak. 
              Fonte: lib/games/arcade/mutirao-effectiveness.ts (T36C).
            </p>
          </Card>
        )}

        {cooperativaEffectiveness.runs > 0 && (
          <Card className={styles.fullCard}>
            <h3>🏭 Cooperativa na Pressão - Scorecard de decisão (T49)</h3>
            <div className={styles.signalGrid}>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Status de decisão</p>
                <p className={styles.signalValue}>{cooperativaDecision.status}</p>
                <p className={styles.signalNote}>{cooperativaDecision.rationale}</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Decisão formal</p>
                <p className={styles.signalValue}>{cooperativaDecision.finalDecision}</p>
                <p className={styles.signalNote}>{cooperativaDecision.recommendation}</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Runs observadas</p>
                <p className={styles.signalValue}>{cooperativaEffectiveness.runs}</p>
                <p className={styles.signalNote}>Run ends: {cooperativaEffectiveness.runEnds}</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Survival rate</p>
                <p className={styles.signalValue}>{cooperativaEffectiveness.survivalRate}%</p>
                <p className={styles.signalNote}>{cooperativaEffectiveness.survivalCount} sobrevivencias / {cooperativaEffectiveness.collapseCount} colapsos</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Collectivity rate</p>
                <p className={styles.signalValue}>{cooperativaEffectiveness.collectivityRate}%</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Mutirão usage</p>
                <p className={styles.signalValue}>{cooperativaEffectiveness.mutiraoUsageRate}%</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Replay rate</p>
                <p className={styles.signalValue}>{cooperativaEffectiveness.replayRate}%</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>CTA pós-run</p>
                <p className={styles.signalValue}>{cooperativaEffectiveness.postRunCtaRate}%</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>First input médio</p>
                <p className={styles.signalValue}>{cooperativaEffectiveness.firstInputAvgMs}ms</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Ação mais usada</p>
                <p className={styles.signalValue}>{cooperativaEffectiveness.mostUsedAction}</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Estação mais crítica</p>
                <p className={styles.signalValue}>{cooperativaEffectiveness.mostCriticalStation}</p>
              </div>
              <div className={styles.signalItem}>
                <p className={styles.signalLabel}>Fase final atingida</p>
                <p className={styles.signalValue}>{cooperativaEffectiveness.phaseReachedRate.final}%</p>
              </div>
            </div>

            {cooperativaEffectiveness.collapseReasons.length > 0 && (
              <div className={styles.tableWrap}>
                <h4>Principais causas de colapso</h4>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Causa</th>
                      <th>Ocorrências</th>
                      <th>% dos colapsos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cooperativaEffectiveness.collapseReasons.map((row) => (
                      <tr key={row.reason}>
                        <td className={styles.gameTitle}>{row.reason}</td>
                        <td className={styles.numeric}>{row.count}</td>
                        <td className={styles.numeric}>{row.rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p className={styles.techNote}>
              Leitura T49 focada em dados reais de run: survival, coletividade, mutirão, replay, CTA pós-run e colapsos.
              Sem premiumização automática enquanto status não atingir `ready_for_premium_pass`.
            </p>
          </Card>
        )}

        <Card className={styles.fullCard}>
          <h3>🔄 Janela T50 - Cooperativa em Observação (7 dias)</h3>
          <div className={styles.signalGrid}>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Status T50</p>
              <p className={styles.signalValue}>Ativo</p>
              <p className={styles.signalNote}>Período: 09/03 - 16/03 (23:30)</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Dias restantes</p>
              <p className={styles.signalValue}>↳ Revisar</p>
              <p className={styles.signalNote}>Checkpoint mid-point: 12/03</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Sinais mínimos de vida</p>
              <p className={styles.signalValue}>{cooperativaEffectiveness.runs > 0 ? 'EM COLETA' : 'NENHUM'}</p>
              <p className={styles.signalNote}>Runs completas, replay ou CTA pós-run</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Runs observadas</p>
              <p className={styles.signalValue}>{cooperativaEffectiveness.runs}</p>
              <p className={styles.signalNote}>Meta T50: ≥5 conclusões</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Survival rate</p>
              <p className={styles.signalValue}>{cooperativaEffectiveness.survivalRate}%</p>
              <p className={styles.signalNote}>Meta: ≥20% para vida mínima</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Collectivity rate</p>
              <p className={styles.signalValue}>{cooperativaEffectiveness.collectivityRate}%</p>
              <p className={styles.signalNote}>Meta premium: ≥60%</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Mutirão activado</p>
              <p className={styles.signalValue}>{cooperativaEffectiveness.mutiraoUsageRate}%</p>
              <p className={styles.signalNote}>Sinal de coordenação coletiva</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Replay espontâneo</p>
              <p className={styles.signalValue}>{cooperativaEffectiveness.replayRate}%</p>
              <p className={styles.signalNote}>Sinal crítico de diversão</p>
            </div>
          </div>

          <p className={styles.techNote}>
            <strong>Recomendação operacional:</strong> Manter observação ativa. Sem novo jogo paralelo. Sem premiumizar cedo.
            Decisão final ao fim de 7 dias: <code>promote_to_premium_pass</code>, <code>run_short_tuning_cycle</code>, ou <code>archive_to_cold_backlog</code>.
          </p>
        </Card>

        
        <Card className={styles.fullCard}>
          <h3>Insights Bairro Resiste (T58/T59)</h3>
          <div className={styles.signalGrid}>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Amostra Local</p>
              <p className={styles.signalValue}>{bairroRunCount}</p>
              <p className={styles.signalNote}>runs finalizadas</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Maior Ameaça</p>
              <p className={styles.signalValue}>{String(bairroWorstHotspotMode).toUpperCase()}</p>
              <p className={styles.signalNote}>hotspot mais colapsado</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Sobrevivência Média</p>
              <p className={styles.signalValue}>Fase {bairroAvgPhase}</p>
              <p className={styles.signalNote}>fase de colapso/vitória</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Ação Mais Eficaz</p>
              <p className={styles.signalValue}>{String(bairroMostUsedActionMode).toUpperCase()}</p>
              <p className={styles.signalNote}>curas efetuadas</p>
            </div>
          </div>
        </Card>
<Card className={styles.fullCard}>
          <h3>Front-stage da Home e Explorar</h3>
          <div className={styles.signalGrid}>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Cliques above-the-fold</p>
              <p className={styles.signalValue}>{aboveFoldGameClicks}</p>
              <p className={styles.signalNote}>Proxy de entrada imediata no jogo</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Home: cliques primários</p>
              <p className={styles.signalValue}>{homePrimaryPlayClicks}</p>
              <p className={styles.signalNote}>Botões do hero (jogar agora)</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Home: bloco &quot;Jogue agora&quot;</p>
              <p className={styles.signalValue}>{homePlayNowClicks}</p>
              <p className={styles.signalNote}>Clique em cards acima da dobra</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Arcade CTR na home</p>
              <p className={styles.signalValue}>{homeArcadeCtr}%</p>
              <p className={styles.signalNote}>Arcade clicks: {homePrimaryPlayClicks + homeArcadeClicks}</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Quick CTR na home</p>
              <p className={styles.signalValue}>{homeQuickCtr}%</p>
              <p className={styles.signalNote}>Quick clicks: {homeQuickClicks}</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Delta arcade - quick</p>
              <p className={styles.signalValue}>{homeToPlayByTypeDelta}%</p>
              <p className={styles.signalNote}>Home → play por tipo</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Quick vs Arcade choice clicks</p>
              <p className={styles.signalValue}>{quickVsArcadeChoices}</p>
              <p className={styles.signalNote}>Preferência declarada no bloco comparativo</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Manifesto expand clicks</p>
              <p className={styles.signalValue}>{manifestoExpandClicks}</p>
              <p className={styles.signalNote}>Interesse em camada editorial/política</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Series clicks</p>
              <p className={styles.signalValue}>{seriesClicks}</p>
              <p className={styles.signalNote}>Seção mais clicada da camada editorial</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Explorar: cliques em arcade</p>
              <p className={styles.signalValue}>{explorarArcadeClicks}</p>
              <p className={styles.signalNote}>Vitrine de arcades no catálogo</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Explorar: cliques em quick</p>
              <p className={styles.signalValue}>{explorarQuickClicks}</p>
              <p className={styles.signalNote}>Strip de quick games</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Explorar: uso de filtros</p>
              <p className={styles.signalValue}>{explorarFilterChanges}</p>
              <p className={styles.signalNote}>Proxy útil de scroll depth e exploração</p>
            </div>
          </div>
          <p className={styles.techNote}>
            Eventos front-stage: home_primary_play_click, home_arcade_click, home_quick_click, home_play_now_block_click,
            home_quick_vs_arcade_choice, arcade_vs_quick_preference, above_fold_game_click, manifesto_expand_click,
            series_click, explorar_arcade_click, explorar_quick_click, explorar_filter_change.
          </p>
        </Card>

        <Card className={styles.fullCard}>
          <h3>🎯 Conversão e Replay (Tijolo 32)</h3>
          <div className={styles.signalGrid}>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Card full clicks</p>
              <p className={styles.signalValue}>{cardFullClicks}</p>
              <p className={styles.signalNote}>Cliques na área completa do card</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Preview interactions</p>
              <p className={styles.signalValue}>{cardPreviewInteractions}</p>
              <p className={styles.signalNote}>Hover/focus em preview vivo</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Preview CTR</p>
              <p className={styles.signalValue}>{cardPreviewCtr}%</p>
              <p className={styles.signalNote}>Interações preview → click</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Click-to-play events</p>
              <p className={styles.signalValue}>{clickToPlayEvents}</p>
              <p className={styles.signalNote}>Medições de tempo click → first input</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Replay after run</p>
              <p className={styles.signalValue}>{replayAfterRunClicks}</p>
              <p className={styles.signalNote}>Clique replay pós-jogo</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Replay rate pós-run</p>
              <p className={styles.signalValue}>{replayAfterRunRate}%</p>
              <p className={styles.signalNote}>Replay / completions</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Next game after run</p>
              <p className={styles.signalValue}>{nextGameAfterRunClicks}</p>
              <p className={styles.signalNote}>Recomendações pós-jogo clicadas</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Next game rate pós-run</p>
              <p className={styles.signalValue}>{nextGameAfterRunRate}%</p>
              <p className={styles.signalNote}>Cross-game / completions</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Quick → Arcade crossover</p>
              <p className={styles.signalValue}>{quickToArcadeClicks}</p>
              <p className={styles.signalNote}>Conversão quick para arcade</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Arcade → Quick crossover</p>
              <p className={styles.signalValue}>{arcadeToQuickClicks}</p>
              <p className={styles.signalNote}>Conversão arcade para quick</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Cross-game total</p>
              <p className={styles.signalValue}>{crossGameConversionTotal}</p>
              <p className={styles.signalNote}>Quick ↔ Arcade conversão total</p>
            </div>

            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Preview → play efetivo</p>
              <p className={styles.signalValue}>{effectivePreviewToPlay?.conversionRate ?? 0}%</p>
              <p className={styles.signalNote}>Status: {effectivePreviewToPlay?.status || 'insufficient_data'}</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Card click → run efetivo</p>
              <p className={styles.signalValue}>{effectiveCardToRun?.conversionRate ?? 0}%</p>
              <p className={styles.signalNote}>Status: {effectiveCardToRun?.status || 'insufficient_data'}</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Replay efetivo</p>
              <p className={styles.signalValue}>{effectiveReplay?.conversionRate ?? 0}%</p>
              <p className={styles.signalNote}>Status: {effectiveReplay?.status || 'insufficient_data'}</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Next-game start efetivo</p>
              <p className={styles.signalValue}>{effectiveCrossGame?.conversionRate ?? 0}%</p>
              <p className={styles.signalNote}>Status: {effectiveCrossGame?.status || 'insufficient_data'}</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Quick → Arcade efetivo</p>
              <p className={styles.signalValue}>{effectiveQuickToArcade?.conversionRate ?? 0}%</p>
              <p className={styles.signalNote}>Status: {effectiveQuickToArcade?.status || 'insufficient_data'}</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Arcade → Quick efetivo</p>
              <p className={styles.signalValue}>{effectiveArcadeToQuick?.conversionRate ?? 0}%</p>
              <p className={styles.signalNote}>Status: {effectiveArcadeToQuick?.status || 'insufficient_data'}</p>
            </div>
          </div>
          {effectiveWarnings.length > 0 && (
            <div className={styles.techNote}>
              <strong>Avisos de amostra:</strong>
              <ul>
                {effectiveWarnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {effectiveRunsByGame.length > 0 && (
            <div className={styles.tableWrap}>
              <h4>Top jogos por run efetiva</h4>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Jogo</th>
                    <th>Runs efetivas</th>
                    <th>Card clicks</th>
                    <th>Taxa efetiva</th>
                  </tr>
                </thead>
                <tbody>
                  {effectiveRunsByGame.map((row) => (
                    <tr key={row.slug}>
                      <td className={styles.gameTitle}>{row.slug}</td>
                      <td className={styles.numeric}>{row.effectiveRuns}</td>
                      <td className={styles.numeric}>{row.cardClicks}</td>
                      <td className={styles.numeric}>{row.effectiveRunRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {effectiveReplayByGame.length > 0 && (
            <div className={styles.tableWrap}>
              <h4>Replay efetivo por jogo</h4>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Jogo</th>
                    <th>Replays efetivos</th>
                    <th>Replay clicks</th>
                    <th>Taxa efetiva</th>
                  </tr>
                </thead>
                <tbody>
                  {effectiveReplayByGame.map((row) => (
                    <tr key={row.slug}>
                      <td className={styles.gameTitle}>{row.slug}</td>
                      <td className={styles.numeric}>{row.effectiveReplays}</td>
                      <td className={styles.numeric}>{row.replayClicks}</td>
                      <td className={styles.numeric}>{row.effectiveReplayRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {strongestCrossGameBridges.length > 0 && (
            <div className={styles.tableWrap}>
              <h4>Pontes cross-game mais fortes</h4>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>De</th>
                    <th>Para</th>
                    <th>Starts efetivos</th>
                  </tr>
                </thead>
                <tbody>
                  {strongestCrossGameBridges.map((row) => (
                    <tr key={`${row.from}->${row.to}`}>
                      <td className={styles.gameTitle}>{row.from}</td>
                      <td className={styles.gameTitle}>{row.to}</td>
                      <td className={styles.numeric}>{row.starts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {effectiveByChannel.length > 0 && (
            <div className={styles.tableWrap}>
              <h4>Run efetiva por canal</h4>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Canal</th>
                    <th>Card clicks</th>
                    <th>Runs efetivas</th>
                    <th>Taxa efetiva</th>
                  </tr>
                </thead>
                <tbody>
                  {effectiveByChannel.map((row) => (
                    <tr key={row.key}>
                      <td className={styles.gameTitle}>{row.label}</td>
                      <td className={styles.numeric}>{row.cardClicks}</td>
                      <td className={styles.numeric}>{row.effectiveRuns}</td>
                      <td className={styles.numeric}>{row.effectiveRunRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {effectiveByTerritory.length > 0 && (
            <div className={styles.tableWrap}>
              <h4>Run efetiva por território</h4>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Território</th>
                    <th>Card clicks</th>
                    <th>Runs efetivas</th>
                    <th>Taxa efetiva</th>
                  </tr>
                </thead>
                <tbody>
                  {effectiveByTerritory.map((row) => (
                    <tr key={row.key}>
                      <td className={styles.gameTitle}>{row.label}</td>
                      <td className={styles.numeric}>{row.cardClicks}</td>
                      <td className={styles.numeric}>{row.effectiveRuns}</td>
                      <td className={styles.numeric}>{row.effectiveRunRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className={styles.techNote}>
            Eventos de conversão (Tijolo 32): card_full_click, card_preview_interaction, click_to_play_time,
            replay_after_run_click, next_game_after_run_click, quick_to_arcade_click, arcade_to_quick_click.
          </p>
        </Card>

        {/* Top Origens */}
        <Card className={styles.fullCard}>
          <h3>Principais Origens (UTMs / Referrers)</h3>
          <div className={styles.eventsList}>
            {Object.entries(metrics.sources)
              .sort(([, a], [, b]) => b - a)
              .map(([source, count]) => (
                <div key={source} className={styles.eventRow}>
                  <span className={styles.eventLabel}>{source}</span>
                  <span className={styles.eventCount}>{count}</span>
                </div>
              ))}
          </div>
        </Card>

        {/* Eventos por tipo */}
        <Card className={styles.fullCard}>
          <h3>Eventos por Tipo</h3>
          <div className={styles.eventsList}>
            {Object.entries(metrics.eventsByType)
              .sort(([, a], [, b]) => b - a)
              .map(([eventName, count]) => (
                <div key={eventName} className={styles.eventRow}>
                  <span className={styles.eventLabel}>{eventName}</span>
                  <span className={styles.eventCount}>{count}</span>
                </div>
              ))}
          </div>
        </Card>

        {/* Conclusões por engine */}
        <Card className={styles.fullCard}>
          <h3>Conclusões por Engine</h3>
          <div className={styles.engineList}>
            {Object.entries(metrics.conclusionsByEngine)
              .sort(([, a], [, b]) => b - a)
              .map(([engineKind, count]) => (
                <div key={engineKind} className={styles.engineRow}>
                  <span className={styles.engineLabel}>{engineKind}</span>
                  <span className={styles.engineCount}>{count}</span>
                </div>
              ))}
          </div>
        </Card>

        {/* Tabela de jogos */}
        <Card className={styles.fullCard}>
          <h3>Desempenho por Jogo</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Jogo</th>
                  <th>Iniciado</th>
                  <th>Concluído</th>
                  <th>Shares</th>
                  <th>Taxa</th>
                </tr>
              </thead>
              <tbody>
                {metrics.gamesSorted.map((game) => (
                  <tr key={game.slug}>
                    <td className={styles.gameTitle}>{game.title}</td>
                    <td className={styles.numeric}>{game.initiated}</td>
                    <td className={styles.numeric}>{game.completed}</td>
                    <td className={styles.numeric}>{game.shares}</td>
                    <td className={styles.numeric}>
                      <span
                        className={
                          game.completionRate >= 50
                            ? styles.rateGood
                            : game.completionRate >= 25
                              ? styles.rateOk
                              : styles.rateLow
                        }
                      >
                        {game.completionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className={styles.fullCard}>
          <h3>Editorial da Campanha: Séries</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Série</th>
                  <th>Acessos</th>
                  <th>Compartilhamentos</th>
                  <th>Conversão</th>
                </tr>
              </thead>
              <tbody>
                {seriesSummary
                  .sort((a, b) => b.initiated - a.initiated)
                  .map((row) => (
                    <tr key={row.series}>
                      <td className={styles.gameTitle}>{row.label}</td>
                      <td className={styles.numeric}>{row.initiated}</td>
                      <td className={styles.numeric}>{row.shares}</td>
                      <td className={styles.numeric}>{row.completionRate}%</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className={styles.fullCard}>
          <h3>Conversão por Escopo Territorial</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Escopo</th>
                  <th>Acessos</th>
                  <th>Compartilhamentos</th>
                  <th>Conversão</th>
                </tr>
              </thead>
              <tbody>
                {territorySummary
                  .sort((a, b) => b.initiated - a.initiated)
                  .map((row) => (
                    <tr key={row.scope}>
                      <td className={styles.gameTitle}>{row.label}</td>
                      <td className={styles.numeric}>{row.initiated}</td>
                      <td className={styles.numeric}>{row.shares}</td>
                      <td className={styles.numeric}>{row.completionRate}%</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className={styles.fullCard}>
          <h3>Leitura Ideologica da Linha</h3>
          <p className={styles.techNote}>
            Recorte por eixo politico, tipo de solucao coletiva e disputa comum vs mercado.
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Eixo politico</th>
                  <th>Acessos</th>
                  <th>Conclusoes</th>
                  <th>Shares</th>
                  <th>Conv%</th>
                </tr>
              </thead>
              <tbody>
                {politicalAxisSummary
                  .sort((a, b) => b.initiated - a.initiated)
                  .map((row) => (
                    <tr key={row.axis}>
                      <td className={styles.gameTitle}>{row.label}</td>
                      <td className={styles.numeric}>{row.initiated}</td>
                      <td className={styles.numeric}>{row.completed}</td>
                      <td className={styles.numeric}>{row.shares}</td>
                      <td className={styles.numeric}>{row.completionRate}%</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className={styles.eventsList}>
            {collectiveSolutionSummary.map((row) => (
              <div key={row.solution} className={styles.eventRow}>
                <span className={styles.eventLabel}>{row.label}</span>
                <span className={styles.eventCount}>
                  {row.initiated} acessos · {row.completionRate}% conv
                </span>
              </div>
            ))}
            {commonVsMarketSummary.map((row) => (
              <div key={row.frame} className={styles.eventRow}>
                <span className={styles.eventLabel}>Disputa {row.label}</span>
                <span className={styles.eventCount}>{row.initiated} acessos</span>
              </div>
            ))}
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>ideological_axis_signal</span>
              <span className={styles.eventCount}>{ideologicalSignals}</span>
            </div>
          </div>
        </Card>

        {/* === PRIORIZAÇÃO ESTRATÉGICA QUICK (Tijolo 26) === */}
        <Card className={styles.fullCard}>
          <h3>Linha Quick: Comparação real entre jogos</h3>
          <p className={styles.techNote}>
            Heurística de grude (explícita): completion 30%, replay 20%, share 20%, CTA pós-jogo 15%, share→play 10%, tempo até 1ª interação 5%.
          </p>
          {quickComparison.length > 0 ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Quick</th>
                    <th>Views</th>
                    <th>Starts</th>
                    <th>Completions</th>
                    <th>Replay%</th>
                    <th>Share%</th>
                    <th>CTA pós-jogo</th>
                    <th>Card final</th>
                    <th>Share→Play</th>
                    <th>QR CTR</th>
                    <th>TFI médio</th>
                    <th>Grude</th>
                  </tr>
                </thead>
                <tbody>
                  {quickComparison.map((row) => (
                    <tr key={row.slug}>
                      <td className={styles.gameTitle}>{row.title}</td>
                      <td className={styles.numeric}>{row.sessions}</td>
                      <td className={styles.numeric}>{row.starts}</td>
                      <td className={styles.numeric}>{row.completions}</td>
                      <td className={styles.numeric}>{row.replayRate}%</td>
                      <td className={styles.numeric}>{row.shareRate}%</td>
                      <td className={styles.numeric}>{row.postGameCtaClicks}</td>
                      <td className={styles.numeric}>{row.finalCardInteractions}</td>
                      <td className={styles.numeric}>{row.reentryRate}%</td>
                      <td className={styles.numeric}>{row.qrCtr}%</td>
                      <td className={styles.numeric}>{row.firstInteractionAvgMs}ms</td>
                      <td className={styles.numeric}><strong>{row.stickyScore}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.techNote}>Sem amostra quick suficiente para comparação lado a lado.</p>
          )}
          <p className={styles.techNote}>
            Sinais globais da linha quick: replay events = {quickReplayEvents}, QR views = {quickQrViews}, QR clicks = {quickQrClicks}, QR CTR = {quickQrCtr}%, ideological signals = {ideologicalSignals}.
          </p>
          {(quickSampleWarning || metrics.quickInsights.warnings.length > 0) && (
            <p className={styles.supabaseWarning}>
              ⚠️ Leitura ainda em consolidação. {metrics.quickInsights.warnings.join(' ')}
            </p>
          )}
        </Card>

        {/* === O QUE DISTRIBUIR AGORA (Tijolo 28) === */}
        <Card className={styles.fullCard}>
          <h3>📢 O que distribuir agora — Operação de Campanha</h3>
          <p className={styles.techNote}>
            Recomendações baseadas no status de coleta e nas metas operacionais da semana.
          </p>
          
          {(() => {
            const quicksInsuficientes = Object.entries(metrics.quickInsights.collectionStatus.byQuick || {})
              .filter(([, status]) => status.status === 'coleta-insuficiente' || status.status === 'coleta-em-andamento')
              .sort((a, b) => (a[1].progressPct || 0) - (b[1].progressPct || 0));
            
            const territoriosInsuficientes = Object.entries(metrics.quickInsights.collectionStatus.byTerritory || {})
              .filter(([, status]) => status.status === 'coleta-insuficiente' || status.status === 'coleta-em-andamento')
              .sort((a, b) => (a[1].progressPct || 0) - (b[1].progressPct || 0));
            
            const seriesInsuficientes = Object.entries(metrics.quickInsights.collectionStatus.bySeries || {})
              .filter(([, status]) => status.status === 'coleta-insuficiente' || status.status === 'coleta-em-andamento')
              .sort((a, b) => (a[1].progressPct || 0) - (b[1].progressPct || 0));
            
            const allReady = quicksInsuficientes.length === 0 && territoriosInsuficientes.length === 0 && seriesInsuficientes.length === 0;
            
            if (allReady) {
              return (
                <div style={{ padding: '1rem', background: '#e8f5e9', borderRadius: '4px' }}>
                  <p style={{ margin: 0, color: '#2e7d32', fontWeight: 'bold' }}>
                    ✅ Metas de coleta atingidas! Pronto para decisão sobre formato médio (Tijolo 29).
                  </p>
                </div>
              );
            }
            
            return (
              <div>
                {quicksInsuficientes.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>🎮 Quick prioritário</h4>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                      <strong>{quicksInsuficientes[0][0]}</strong> — {quicksInsuficientes[0][1].progressPct}% da meta
                    </p>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#666' }}>
                      Distribuir nos canais: Instagram, WhatsApp, TikTok
                    </p>
                  </div>
                )}
                
                {territoriosInsuficientes.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>🗺️ Território prioritário</h4>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                      <strong>{territoriosInsuficientes[0][0]}</strong> — {territoriosInsuficientes[0][1].progressPct}% da meta
                    </p>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#666' }}>
                      Pacote: <code>reports/distribution/packages/territorio-{territoriosInsuficientes[0][0]}.md</code>
                    </p>
                  </div>
                )}
                
                {seriesInsuficientes.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>📚 Série prioritária</h4>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                      <strong>{seriesInsuficientes[0][0]}</strong> — {seriesInsuficientes[0][1].progressPct}% da meta
                    </p>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#666' }}>
                      Empurrar quicks desta série primeiro
                    </p>
                  </div>
                )}
                
                {(metrics.quickInsights.collectionStatus.qrExperiment?.status === 'coleta-insuficiente' || 
                  metrics.quickInsights.collectionStatus.qrExperiment?.status === 'coleta-em-andamento') && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>🔬 Experimento QR precisa atenção</h4>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#666' }}>
                      Garantir exposição balanceada entre variantes
                    </p>
                  </div>
                )}
                
                <div style={{ padding: '0.75rem', background: '#fff3cd', borderRadius: '4px', marginTop: '1rem' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>
                    💡 <strong>Próximos passos:</strong> Consultar <code>docs/operacao-semanal-distribuicao.md</code> para roteiro completo.
                  </p>
                </div>
              </div>
            );
          })()}
        </Card>

        {/* === STATUS DE COLETA (Tijolo 27) === */}
        <Card className={styles.fullCard}>
          <h3>Status de Coleta - Distribuição Quick (Tijolo 27)</h3>
          <p className={styles.techNote}>
            Metas mínimas de coleta para janela {windowLabel(window).toLowerCase()}: quick {metrics.quickInsights.collectionTargets.quick.sessions} sessões / série {metrics.quickInsights.collectionTargets.series.sessions} sessões / território {metrics.quickInsights.collectionTargets.territory.sessions} sessões / QR {metrics.quickInsights.collectionTargets.qrVariant.sessions} sessões/variante.
          </p>
          
          {/* Status por quick */}
          {Object.keys(metrics.quickInsights.collectionStatus.byQuick).length > 0 && (
            <>
              <h4 style={{ marginTop: '1.5rem', fontSize: '1rem' }}>Por quick game</h4>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Quick</th>
                      <th>Status</th>
                      <th>Progresso</th>
                      <th>Sessões</th>
                      <th>Starts</th>
                      <th>Completions</th>
                      <th>Shares</th>
                      <th>Replays</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(metrics.quickInsights.collectionStatus.byQuick).map(([slug, status]) => {
                      const quickTitle = quickComparison.find((q) => q.slug === slug)?.title || slug;
                      const statusBadge = 
                        status.status === 'pronto-para-priorizacao' ? '✅ Pronto' :
                        status.status === 'coleta-minima-atingida' ? '🟢 Meta atingida' :
                        status.status === 'coleta-em-andamento' ? '🟡 Em andamento' :
                        '🔴 Insuficiente';
                      const targets = metrics.quickInsights.collectionTargets.quick;
                      return (
                        <tr key={slug}>
                          <td className={styles.gameTitle}>{quickTitle}</td>
                          <td className={styles.numeric}>{statusBadge}</td>
                          <td className={styles.numeric}>{status.progressPct}%</td>
                          <td className={styles.numeric}>{status.progress.sessions}/{targets.sessions}</td>
                          <td className={styles.numeric}>{status.progress.starts}/{targets.starts}</td>
                          <td className={styles.numeric}>{status.progress.completions}/{targets.completions}</td>
                          <td className={styles.numeric}>{status.progress.shares}/{targets.shares}</td>
                          <td className={styles.numeric}>{status.progress.replays}/{targets.replays}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Status por série */}
          {Object.keys(metrics.quickInsights.collectionStatus.bySeries).length > 0 && (
            <>
              <h4 style={{ marginTop: '1.5rem', fontSize: '1rem' }}>Por série</h4>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Série</th>
                      <th>Status</th>
                      <th>Progresso</th>
                      <th>Sessões</th>
                      <th>Starts</th>
                      <th>Completions</th>
                      <th>Shares</th>
                      <th>Jogos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(metrics.quickInsights.collectionStatus.bySeries).map(([serieKey, status]) => {
                      const serieLabel = quickBySeries.find((s) => s.key === serieKey)?.label || serieKey;
                      const statusBadge = 
                        status.status === 'pronto-para-priorizacao' ? '✅ Pronto' :
                        status.status === 'coleta-minima-atingida' ? '🟢 Meta atingida' :
                        status.status === 'coleta-em-andamento' ? '🟡 Em andamento' :
                        '🔴 Insuficiente';
                      const targets = metrics.quickInsights.collectionTargets.series;
                      return (
                        <tr key={serieKey}>
                          <td className={styles.gameTitle}>{serieLabel}</td>
                          <td className={styles.numeric}>{statusBadge}</td>
                          <td className={styles.numeric}>{status.progressPct}%</td>
                          <td className={styles.numeric}>{status.progress.sessions}/{targets.sessions}</td>
                          <td className={styles.numeric}>{status.progress.starts}/{targets.starts}</td>
                          <td className={styles.numeric}>{status.progress.completions}/{targets.completions}</td>
                          <td className={styles.numeric}>{status.progress.shares}/{targets.shares}</td>
                          <td className={styles.numeric}>{status.gamesInSeries.length}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Status por território */}
          {Object.keys(metrics.quickInsights.collectionStatus.byTerritory).length > 0 && (
            <>
              <h4 style={{ marginTop: '1.5rem', fontSize: '1rem' }}>Por território</h4>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Território</th>
                      <th>Status</th>
                      <th>Progresso</th>
                      <th>Sessões</th>
                      <th>Starts</th>
                      <th>Completions</th>
                      <th>Shares</th>
                      <th>Jogos</th>
                      <th>Jogo forte</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(metrics.quickInsights.collectionStatus.byTerritory).map(([territoryKey, status]) => {
                      const territoryLabel = quickByTerritory.find((t) => t.key === territoryKey)?.label || territoryKey;
                      const statusBadge = 
                        status.status === 'pronto-para-priorizacao' ? '✅ Pronto' :
                        status.status === 'coleta-minima-atingida' ? '🟢 Meta atingida' :
                        status.status === 'coleta-em-andamento' ? '🟡 Em andamento' :
                        '🔴 Insuficiente';
                      const targets = metrics.quickInsights.collectionTargets.territory;
                      const topGameTitle = status.topGameSlug ? (quickComparison.find((q) => q.slug === status.topGameSlug)?.title || status.topGameSlug) : 'n/d';
                      return (
                        <tr key={territoryKey}>
                          <td className={styles.gameTitle}>{territoryLabel}</td>
                          <td className={styles.numeric}>{statusBadge}</td>
                          <td className={styles.numeric}>{status.progressPct}%</td>
                          <td className={styles.numeric}>{status.progress.sessions}/{targets.sessions}</td>
                          <td className={styles.numeric}>{status.progress.starts}/{targets.starts}</td>
                          <td className={styles.numeric}>{status.progress.completions}/{targets.completions}</td>
                          <td className={styles.numeric}>{status.progress.shares}/{targets.shares}</td>
                          <td className={styles.numeric}>{status.gamesInTerritory.length}</td>
                          <td className={styles.gameTitle}>{topGameTitle}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Status experimento QR */}
          <h4 style={{ marginTop: '1.5rem', fontSize: '1rem' }}>Experimento QR A/B</h4>
          <div className={styles.signalGrid}>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Status geral</p>
              <p className={styles.signalValue}>
                {metrics.quickInsights.collectionStatus.qrExperiment.status === 'pronto-para-priorizacao' ? '✅ Pronto' :
                 metrics.quickInsights.collectionStatus.qrExperiment.status === 'coleta-minima-atingida' ? '🟢 Meta atingida' :
                 metrics.quickInsights.collectionStatus.qrExperiment.status === 'coleta-em-andamento' ? '🟡 Em andamento' :
                 '🔴 Insuficiente'}
              </p>
            </div>
            {Object.entries(metrics.quickInsights.collectionStatus.qrExperiment.progressByVariant).map(([variant, progress]) => {
              const targets = metrics.quickInsights.collectionTargets.qrVariant;
              return (
                <div key={variant} className={styles.signalItem}>
                  <p className={styles.signalLabel}>{variant}</p>
                  <p className={styles.signalValue}>{progress.progressPct}% da meta</p>
                  <p className={styles.signalNote}>
                    {progress.sessions}/{targets.sessions} sessões • {progress.qrViews}/{targets.qrViews} views • {progress.qrClicks}/{targets.qrClicks} clicks
                  </p>
                </div>
              );
            })}
          </div>

          {metrics.quickInsights.warnings.length > 0 && (
            <p className={styles.supabaseWarning} style={{ marginTop: '1rem' }}>
              ⚠️ {metrics.quickInsights.warnings.join(' ')}
            </p>
          )}
        </Card>

        <Card className={styles.fullCard}>
          <h3>Scorecard de Grude: Rankings</h3>
          <div className={styles.signalGrid}>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Ranking quick</p>
              {quickRanking.map((row, index) => (
                <p key={row.slug} className={styles.signalNote}>{index + 1}. {row.title} ({row.stickyScore})</p>
              ))}
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Ranking série (quick)</p>
              {quickBySeries.map((row, index) => (
                <p key={row.key} className={styles.signalNote}>{index + 1}. {row.label} ({row.stickyScore})</p>
              ))}
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Ranking território (quick)</p>
              {quickByTerritory.map((row, index) => (
                <p key={row.key} className={styles.signalNote}>{index + 1}. {row.label} ({row.stickyScore})</p>
              ))}
            </div>
          </div>
        </Card>

        <Card className={styles.fullCard}>
          <h3>Série, Eixo e Território mais vivos (quick)</h3>
          <div className={styles.signalGrid}>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Série líder</p>
              <p className={styles.signalValue}>{quickBySeries[0]?.label || 'n/d'}</p>
              <p className={styles.signalNote}>Conv {quickBySeries[0]?.completionRate || 0}% • Share {quickBySeries[0]?.shareRate || 0}%</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Eixo político líder</p>
              <p className={styles.signalValue}>{quickByAxis[0]?.label || 'n/d'}</p>
              <p className={styles.signalNote}>Conv {quickByAxis[0]?.completionRate || 0}% • Share {quickByAxis[0]?.shareRate || 0}%</p>
            </div>
            <div className={styles.signalItem}>
              <p className={styles.signalLabel}>Território mais responsivo</p>
              <p className={styles.signalValue}>{quickByTerritory[0]?.label || 'n/d'}</p>
              <p className={styles.signalNote}>Jogo mais forte: {quickByTerritory[0]?.topGameTitle || 'n/d'}</p>
            </div>
          </div>
        </Card>

        <Card className={styles.fullCard}>
          <h3>QR Experiment Readout (Tijolo 26)</h3>
          <p className={styles.techNote}>Estado do experimento por variante: cedo demais, monitorando ou sinal direcional.</p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Variante</th>
                  <th>Amostra</th>
                  <th>Conclusão</th>
                  <th>QR Views</th>
                  <th>QR Clicks</th>
                  <th>QR CTR</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(metrics.quickInsights.qrExperimentSummary).map(([variant, row]) => (
                  <tr key={variant}>
                    <td className={styles.gameTitle}>{variant}</td>
                    <td className={styles.numeric}>{row.sessions}</td>
                    <td className={styles.numeric}>{row.completionRate}%</td>
                    <td className={styles.numeric}>{row.qrViews}</td>
                    <td className={styles.numeric}>{row.qrClicks}</td>
                    <td className={styles.numeric}>{row.qrCtr}%</td>
                    <td className={styles.numeric}>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className={styles.fullCard}>
          <h3>Replay por Tipo de Jogo (sinal leve)</h3>
          <p className={styles.techNote}>
            Indicador proxy: (conclusões + shares) / acessos por tipo.
          </p>
          <div className={styles.eventsList}>
            {replayByKind
              .sort((a, b) => b.replaySignal - a.replaySignal)
              .map((row) => (
                <div key={row.kind} className={styles.eventRow}>
                  <span className={styles.eventLabel}>{row.kind}</span>
                  <span className={styles.eventCount}>{row.replaySignal}%</span>
                </div>
              ))}
          </div>
        </Card>

        {/* === CARD FINAL E PRESENÇA DE CAMPANHA (Tijolo 22) === */}
        <Card className={styles.fullCard}>
          <h3>Card Final e Presença de Campanha</h3>
          <p className={styles.techNote}>
            Sinais de adoção do card final universal, avatar V2 e QR de reentrada (Tijolos 22/23).
          </p>
          <div className={styles.eventsList}>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>final_card_view</span>
              <span className={styles.eventCount}>{metrics.eventsByType['final_card_view'] || 0}</span>
            </div>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>final_card_download</span>
              <span className={styles.eventCount}>{metrics.eventsByType['final_card_download'] || 0}</span>
            </div>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>final_card_share_click</span>
              <span className={styles.eventCount}>{metrics.eventsByType['final_card_share_click'] || 0}</span>
            </div>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>campaign_avatar_view</span>
              <span className={styles.eventCount}>{metrics.eventsByType['campaign_avatar_view'] || 0}</span>
            </div>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>campaign_cta_click_after_game</span>
              <span className={styles.eventCount}>{metrics.eventsByType['campaign_cta_click_after_game'] || 0}</span>
            </div>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>final_card_qr_view</span>
              <span className={styles.eventCount}>{metrics.eventsByType['final_card_qr_view'] || 0}</span>
            </div>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>final_card_qr_click</span>
              <span className={styles.eventCount}>{metrics.eventsByType['final_card_qr_click'] || 0}</span>
            </div>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>avatar_v2_rendered</span>
              <span className={styles.eventCount}>{metrics.eventsByType['avatar_v2_rendered'] || 0}</span>
            </div>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>avatar_expression_rendered</span>
              <span className={styles.eventCount}>{metrics.eventsByType['avatar_expression_rendered'] || 0}</span>
            </div>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>quick_minigame_completion</span>
              <span className={styles.eventCount}>{metrics.eventsByType['quick_minigame_completion'] || 0}</span>
            </div>
            <div className={styles.eventRow}>
              <span className={styles.eventLabel}>quick_minigame_replay</span>
              <span className={styles.eventCount}>{metrics.eventsByType['quick_minigame_replay'] || 0}</span>
            </div>
          </div>
          <p className={styles.techNote}>
            Valores baixos são normais no início. Acompanhar tendência nas próximas janelas.
          </p>
        </Card>

        {/* === NOVAS SEÇÕES: COORTES === */}
        
        {/* Coortes por Origem */}
        <Card className={styles.fullCard}>
          <h3>Desempenho por Origem (Coortes)</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Origem</th>
                  <th>Sessões</th>
                  <th>Inícios</th>
                  <th>Conclusões</th>
                  <th>Shares</th>
                  <th>Taxa Conclusão</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(metrics.cohorts.bySource)
                  .sort(([, a], [, b]) => b.sessions - a.sessions)
                  .map(([source, data]) => (
                    <tr key={source}>
                      <td className={styles.gameTitle}>{source}</td>
                      <td className={styles.numeric}>{data.sessions}</td>
                      <td className={styles.numeric}>{data.starts}</td>
                      <td className={styles.numeric}>{data.completions}</td>
                      <td className={styles.numeric}>{data.shares}</td>
                      <td className={styles.numeric}>
                        <span
                          className={
                            data.completionRate >= 50
                              ? styles.rateGood
                              : data.completionRate >= 25
                                ? styles.rateOk
                                : styles.rateLow
                          }
                        >
                          {data.completionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Coortes por Jogo com Feedback */}
        <Card className={styles.fullCard}>
          <h3>Análise Completa por Jogo</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Jogo</th>
                  <th>Sessões</th>
                  <th>Conclusões</th>
                  <th>Taxa</th>
                  <th>😊</th>
                  <th>😐</th>
                  <th>🙁</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(metrics.cohorts.byGame)
                  .sort(([, a], [, b]) => b.sessions - a.sessions)
                  .map(([slug, data]) => {
                    const game = games.find(g => g.slug === slug);
                    return (
                      <tr key={slug}>
                        <td className={styles.gameTitle}>{game?.title || slug}</td>
                        <td className={styles.numeric}>{data.sessions}</td>
                        <td className={styles.numeric}>{data.completions}</td>
                        <td className={styles.numeric}>
                          <span
                            className={
                              data.completionRate >= 50
                                ? styles.rateGood
                                : data.completionRate >= 25
                                  ? styles.rateOk
                                  : styles.rateLow
                            }
                          >
                            {data.completionRate}%
                          </span>
                        </td>
                        <td className={styles.numeric}>{data.feedbackPositive}</td>
                        <td className={styles.numeric}>{data.feedbackNeutral}</td>
                        <td className={styles.numeric}>{data.feedbackNegative}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Coortes por Engine */}
        <Card className={styles.fullCard}>
          <h3>Desempenho por Engine</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Engine</th>
                  <th>Sessões</th>
                  <th>Inícios</th>
                  <th>Conclusões</th>
                  <th>Shares</th>
                  <th>Taxa</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(metrics.cohorts.byEngine)
                  .sort(([, a], [, b]) => b.sessions - a.sessions)
                  .map(([engine, data]) => (
                    <tr key={engine}>
                      <td className={styles.gameTitle}>{engine}</td>
                      <td className={styles.numeric}>{data.sessions}</td>
                      <td className={styles.numeric}>{data.starts}</td>
                      <td className={styles.numeric}>{data.completions}</td>
                      <td className={styles.numeric}>{data.shares}</td>
                      <td className={styles.numeric}>
                        <span
                          className={
                            data.completionRate >= 50
                              ? styles.rateGood
                              : data.completionRate >= 25
                                ? styles.rateOk
                                : styles.rateLow
                          }
                        >
                          {data.completionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* === CIRCULAÇÃO === */}
        <Card className={styles.fullCard}>
          <h3>📊 Circulação & Conversão (Tijolo 17)</h3>

          {metrics.readingCriteria.warnings.length > 0 && (
            <div className={styles.supabaseWarning} style={{ marginBottom: '1rem' }}>
              <strong>Leitura disciplinada:</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem' }}>
                {metrics.readingCriteria.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* CTR por Placement */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Taxa de Clique por Placement</h4>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Placement</th>
                    <th>Visualizações</th>
                    <th>Clicks</th>
                    <th>CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(metrics.circulation.ctrByPlacement)
                    .sort(([, a], [, b]) => b.outcomeViews - a.outcomeViews)
                    .map(([placement, data]) => (
                      <tr key={placement}>
                        <td className={styles.gameTitle}>{placement}</td>
                        <td className={styles.numeric}>{data.outcomeViews}</td>
                        <td className={styles.numeric}>{data.clicks}</td>
                        <td className={styles.numeric}>
                          <span className={data.ctr >= 20 ? styles.rateGood : data.ctr >= 10 ? styles.rateOk : styles.rateLow}>
                            {data.ctr}%
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top CTAs */}
          {metrics.circulation.topCtas.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Top CTAs por Clicks</h4>
              <div className={styles.eventsList}>
                {metrics.circulation.topCtas.map((cta) => (
                  <div key={cta.ctaId} className={styles.eventRow}>
                    <div>
                      <span className={styles.eventLabel}>{cta.ctaId}</span>
                      {cta.trackingId && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                          ({cta.trackingId})
                        </span>
                      )}
                      {cta.category && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            background: 'var(--bg-tertiary)',
                            padding: '0.1rem 0.35rem',
                            borderRadius: '3px',
                            marginLeft: '0.5rem',
                          }}
                        >
                          {cta.category}
                        </span>
                      )}
                    </div>
                    <span className={styles.eventCount}>{cta.clicks}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share → Reentry */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Share → Reentry Conversion</h4>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Métrica</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={styles.gameTitle}>Share Pages Viewed</td>
                    <td className={styles.numeric}>{metrics.circulation.shareReentry.sharePageViews}</td>
                  </tr>
                  <tr>
                    <td className={styles.gameTitle}>Next Game Clicks</td>
                    <td className={styles.numeric}>{metrics.circulation.shareReentry.nextGameClicks}</td>
                  </tr>
                  <tr>
                    <td className={styles.gameTitle}>Hub Return Clicks</td>
                    <td className={styles.numeric}>{metrics.circulation.shareReentry.hubReturnClicks}</td>
                  </tr>
                  <tr>
                    <td className={styles.gameTitle}>Ações de Reentrada</td>
                    <td className={styles.numeric}>{metrics.circulation.shareReentry.reentryActions}</td>
                  </tr>
                  <tr>
                    <td className={styles.gameTitle}>Reentry Rate</td>
                    <td className={styles.numeric}>
                      <span className={metrics.circulation.shareReentry.reentryRate >= 30 ? styles.rateGood : styles.rateOk}>
                        {metrics.circulation.shareReentry.reentryRate}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Saídas por Origem (Top 5)</h4>
            <div className={styles.eventsList}>
              {Object.entries(metrics.circulation.exitsBySource)
                .sort(([, a], [, b]) => b.exits - a.exits)
                .slice(0, 5)
                .map(([source, data]) => (
                  <div key={source} className={styles.eventRow}>
                    <span className={styles.eventLabel}>{source}</span>
                    <span className={styles.eventCount}>{data.exits} ({data.exitRate}%)</span>
                  </div>
                ))}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Saídas por Jogo (Top 5)</h4>
            <div className={styles.eventsList}>
              {Object.entries(metrics.circulation.exitsByGame)
                .sort(([, a], [, b]) => b.exits - a.exits)
                .slice(0, 5)
                .map(([slug, data]) => {
                  const game = games.find((g) => g.slug === slug);
                  return (
                    <div key={slug} className={styles.eventRow}>
                      <span className={styles.eventLabel}>{game?.title || slug}</span>
                      <span className={styles.eventCount}>{data.exits} ({data.exitRate}%)</span>
                    </div>
                  );
                })}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Saídas por Engine</h4>
            <div className={styles.eventsList}>
              {Object.entries(metrics.circulation.exitsByEngine)
                .sort(([, a], [, b]) => b.exits - a.exits)
                .map(([engine, data]) => (
                  <div key={engine} className={styles.eventRow}>
                    <span className={styles.eventLabel}>{engine}</span>
                    <span className={styles.eventCount}>{data.exits} ({data.exitRate}%)</span>
                  </div>
                ))}
            </div>
          </div>
        </Card>

        {/* Scorecards de experimento */}
        <Card className={styles.fullCard}>
          <h3>🧪 Scorecards de Experimento</h3>
          {metrics.experimentScorecards.length === 0 ? (
            <p className={styles.techNote}>Nenhum experimento ativo para scorecard.</p>
          ) : (
            <div className={styles.eventsList}>
              {metrics.experimentScorecards.map((card) => (
                <div key={card.key} className={styles.eventRow} style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', gap: '1rem' }}>
                    <span className={styles.eventLabel}>{card.name}</span>
                    <span className={styles.eventCount}>{card.status}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Métrica: {card.primaryMetric} • Superfície: {card.affectedSurface}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Melhor variante: {card.bestVariantKey || 'n/a'} • Lift: {card.liftVsSecondPct}%
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{card.rationale}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Experimentos A/B */}
        {Object.keys(metrics.experiments).length > 0 && (
          <Card className={styles.fullCard}>
            <h3>Experimentos A/B Ativos</h3>
            {Object.entries(metrics.experiments).map(([expKey, expData]) => (
              <div key={expKey} className={styles.experimentSection}>
                <h4>{expData.name}</h4>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Variante</th>
                        <th>Sessões</th>
                        <th>Conclusões</th>
                        <th>Taxa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(expData.variants).map(([variantKey, variantData]) => (
                        <tr key={variantKey}>
                          <td className={styles.gameTitle}>{variantKey}</td>
                          <td className={styles.numeric}>{variantData.sessions}</td>
                          <td className={styles.numeric}>{variantData.completions}</td>
                          <td className={styles.numeric}>
                            <span
                              className={
                                variantData.completionRate >= 50
                                  ? styles.rateGood
                                  : variantData.completionRate >= 25
                                    ? styles.rateOk
                                    : styles.rateLow
                              }
                            >
                              {variantData.completionRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Status de Experimentos (Registry) */}
        <Card className={styles.fullCard}>
          <h3>⚗️ Status de Experimentos (Registry)</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Configuração de experimentos A/B ativos e inativos. Override via{' '}
            <code style={{ fontSize: '0.8rem' }}>EXPERIMENTS_OVERRIDE</code> env.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {listAllExperiments().map((exp) => (
              <div
                key={exp.key}
                style={{
                  padding: '0.75rem',
                  background: exp.enabled ? 'var(--color-success-soft, #e8f4ec)' : 'var(--bg-tertiary, #efefef)',
                  borderRadius: '6px',
                  borderLeft: `4px solid ${exp.enabled ? 'var(--color-success, #2c9643)' : 'var(--border-color, #ccc)'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>
                      {exp.enabled ? '✅' : '⏸️'} {exp.name}
                    </strong>
                    {exp.overridden && (
                      <span
                        style={{
                          marginLeft: '0.5rem',
                          fontSize: '0.7rem',
                          background: 'var(--color-warning, #d97b22)',
                          color: 'white',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '999px',
                        }}
                      >
                        OVERRIDE
                      </span>
                    )}
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {exp.description}
                    </p>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      Métrica principal: {exp.primaryMetric || 'n/a'} • Superfície: {exp.affectedSurface || 'n/a'}
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      Variantes: {exp.variants.map((v: { name: string; weight: number }) => `${v.name} (${v.weight}%)`).join(', ')}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: exp.enabled ? 'var(--color-success, #2c9643)' : 'var(--text-secondary)',
                        fontWeight: 600,
                      }}
                    >
                      {exp.enabled ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Origem dos dados */}
        <Card className={styles.fullCard}>
          <h3>🔐 Operações Protegidas (Tijolo 14)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
            <div>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 600 }}>Auditar Triagem</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Quando token OPS_ADMIN_TOKEN está configurado, as mudanças em triagem de feedback são registradas em audit log.
              </p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.7rem' }}>
                Rota: <code>/api/ops/feedback/triage</code>
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 600 }}>Status</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: process.env.NEXT_PUBLIC_OPS_ADMIN_TOKEN ? 'var(--color-success, #2c9643)' : 'var(--text-secondary)' }}>
                {process.env.NEXT_PUBLIC_OPS_ADMIN_TOKEN ? '✅ Configurado' : '⚪ Não configurado (OPS_ADMIN_TOKEN)'}
              </p>
            </div>
          </div>
          <p style={{ margin: '1rem 0 0 0', fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Para ativar: configure <code>OPS_ADMIN_TOKEN</code> no <code>.env.local</code> e cole o token em <code>/estado/feedback</code> para habilitar auditoria nas mudanças de triagem.
          </p>
        </Card>

        <Card className={styles.fullCard}>
          <h3>🛠️ Rotina Operacional Contínua (Tijolo 15)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ padding: '0.75rem', border: '1px solid var(--border-color, #ddd)', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Último Snapshot</p>
              <p style={{ margin: '0.35rem 0 0 0', fontWeight: 600, fontSize: '0.9rem' }}>
                {opsRoutine?.snapshotAt
                  ? new Date(opsRoutine.snapshotAt).toLocaleString('pt-BR')
                  : 'Sem snapshot auditado'}
              </p>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                Origem: {opsRoutine?.snapshotSource || 'n/d'}
              </p>
            </div>

            <div style={{ padding: '0.75rem', border: '1px solid var(--border-color, #ddd)', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Feedback Prioritário Pendente</p>
              <p style={{ margin: '0.35rem 0 0 0', fontWeight: 700, fontSize: '1.2rem', color: (opsRoutine?.prioritarioPendentes || 0) > 0 ? 'var(--color-warning, #d97b22)' : 'var(--color-success, #2c9643)' }}>
                {opsRoutine?.prioritarioPendentes ?? 0}
              </p>
            </div>

            <div style={{ padding: '0.75rem', border: '1px solid var(--border-color, #ddd)', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Audit Log Recente</p>
              <p style={{ margin: '0.35rem 0 0 0', fontWeight: 600, fontSize: '0.9rem', color: opsRoutine?.auditIsRecent ? 'var(--color-success, #2c9643)' : 'var(--color-warning, #d97b22)' }}>
                {opsRoutine?.lastAuditAt
                  ? opsRoutine.auditIsRecent
                    ? '✅ Ativo nas últimas 48h'
                    : '⚠️ Sem ação recente (>48h)'
                  : '⚪ Sem dados de auditoria'}
              </p>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                Última ação: {opsRoutine?.lastAuditActionType || 'n/d'}
              </p>
            </div>

            <div style={{ padding: '0.75rem', border: '1px solid var(--border-color, #ddd)', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Automação de Snapshot</p>
              <p style={{ margin: '0.35rem 0 0 0', fontWeight: 600, fontSize: '0.9rem' }}>
                {opsRoutine?.automationConfigured ? '✅ Cron observado no audit log' : '⚪ Ainda não observado'}
              </p>
            </div>
          </div>
          <p style={{ margin: '0.85rem 0 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            Fallback: se os dados remotos não estiverem disponíveis, rode <code>npm run beta:ops</code>, <code>npm run beta:snapshot</code> e <code>npm run ops:check-alerts</code> para leitura operacional local.
          </p>
        </Card>

        {/* Origem dos dados */}
        <Card className={styles.fullCard}>
          <h3>Origem dos Dados</h3>
          <p>
            Fonte atual: <strong>{sourceLabel}</strong>.
          </p>
          {isSupabaseConfigured ? (
            <p>
              Supabase está configurado. Sessões, eventos e resultados são enviados remotamente
              quando possível. Se a escrita remota falhar, o dado permanece local.
            </p>
          ) : (
            <p>
              Supabase <strong>não está configurado</strong>. Todos os dados ficam no
              localStorage deste dispositivo e podem ser perdidos ao limpar o navegador.
              Para habilitar persistência remota, consulte{' '}
              <code>supabase/tijolo-12-schema-docs.md</code>.
            </p>
          )}
          <p className={styles.techNote}>
            Para entender o que é rastreado, veja{' '}
            <code>lib/analytics/events.ts</code> e{' '}
            <code>lib/analytics/track.ts</code>.
          </p>
        </Card>

        <div className={styles.actions}>
          <Link href="/estado/feedback">
            <Button>Ver Feedback Qualitativo →</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary">← Voltar ao Hub</Button>
          </Link>
        </div>
      </Section>
    </div>
  );
}

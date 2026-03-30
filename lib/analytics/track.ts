import type { Game } from '@/lib/games/catalog';
import { registerResult, startSession, trackEvent } from './session-store';

function base(game: Game) {
  return {
    slug: game.slug,
    engineKind: game.kind,
    engineId: game.engineId,
  };
}

function baseMetadata(game: Game): Record<string, string | number> {
  return {
    pace: game.pace,
    line: game.line,
    series: game.series,
    territoryScope: game.territoryScope,
    politicalAxis: game.politicalAxis,
    collectiveSolutionType: game.collectiveSolutionType,
    commonVsMarket: game.commonVsMarket,
    campaignFrame: game.campaignFrame,
  };
}

function withBaseMetadata(
  game: Game,
  payload: {
    event: any;
    step?: string;
    resultId?: string;
    ctaId?: string;
    metadata?: Record<string, string | number | boolean>;
  },
) {
  return {
    ...base(game),
    ...payload,
    metadata: {
      ...baseMetadata(game),
      ...(payload.metadata || {}),
    },
  };
}

export async function trackGameView(game: Game) {
  await startSession(base(game));
  await trackEvent(withBaseMetadata(game, { event: 'game_view' }));
}

export async function trackGameStart(game: Game) {
  await trackEvent(withBaseMetadata(game, { event: 'game_start' }));
}

export async function trackStepAdvance(game: Game, step: string) {
  await trackEvent(withBaseMetadata(game, { event: 'step_advance', step }));
}

export async function trackGameComplete(
  game: Game,
  result: { id: string; title: string; summary: string },
) {
  await trackEvent(withBaseMetadata(game, { event: 'game_complete', resultId: result.id }));
  await registerResult({
    ...base(game),
    resultId: result.id,
    resultTitle: result.title,
    summary: result.summary,
  });
}

export async function trackResultCopy(game: Game) {
  await trackEvent(withBaseMetadata(game, { event: 'result_copy' }));
}

export async function trackLinkCopy(game: Game) {
  await trackEvent(withBaseMetadata(game, { event: 'link_copy' }));
}

export async function trackCtaClick(game: Game, ctaId: string) {
  await trackEvent(withBaseMetadata(game, { event: 'cta_click', ctaId }));
}

export async function trackFirstInteractionTime(game: Game, msSinceStart: number, interactionType: string) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'first_interaction_time',
      metadata: {
        msSinceStart: Math.max(0, Math.round(msSinceStart)),
        interactionType,
      },
    }),
  );
}

export async function trackReplayClick(game: Game, context: 'outcome' | 'engine' | 'share') {
  await trackEvent(withBaseMetadata(game, { event: 'replay_click', metadata: { context } }));
}

export async function trackAlternatePathClick(game: Game, context: string) {
  await trackEvent(withBaseMetadata(game, { event: 'alternate_path_click', metadata: { context } }));
}

export async function trackOutcomeReplayIntent(game: Game, intent: 'replay' | 'alternate_route' | 'compare') {
  await trackEvent(withBaseMetadata(game, { event: 'outcome_replay_intent', metadata: { intent } }));
}

export async function trackCampaignMarkClick(game: Game, placement: string) {
  await trackEvent(withBaseMetadata(game, { event: 'campaign_mark_click', metadata: { placement } }));
}

export async function trackSeriesClick(game: Game, series: string, territoryScope: string, placement: string) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'series_click',
      metadata: {
        series,
        territoryScope,
        gameType: game.kind,
        pace: (game as any).pace || 'unknown',
        estimatedMinutes: game.estimatedMinutes,
        placement,
      },
    }),
  );
}

export async function trackNextSeriesExperienceClick(
  game: Game,
  series: string,
  targetSlug: string,
  territoryScope: string,
) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'next_series_experience_click',
      metadata: {
        series,
        targetSlug,
        territoryScope,
        gameType: game.kind,
        pace: (game as any).pace || 'unknown',
        estimatedMinutes: game.estimatedMinutes,
      },
    }),
  );
}

export async function trackOutcomeView(game: Game, resultId: string) {
  await trackEvent(withBaseMetadata(game, { event: 'outcome_view', resultId, metadata: { placement: 'outcome_page' } }));
}

export async function trackPrimaryCtaClick(game: Game, ctaId: string, metadata?: Record<string, string | number>) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'primary_cta_click',
      ctaId,
      metadata: { placement: 'outcome_primary', ...(metadata || {}) },
    }),
  );
}

export async function trackSecondaryCtaClick(game: Game, ctaId: string, metadata?: Record<string, string | number>) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'secondary_cta_click',
      ctaId,
      metadata: { placement: 'outcome_secondary', ...(metadata || {}) },
    }),
  );
}

export async function trackSharePageView(game: Game, resultId: string) {
  await trackEvent(withBaseMetadata(game, { event: 'share_page_view', resultId, metadata: { placement: 'share_page' } }));
}

export async function trackShareExportClick(game: Game, resultId: string) {
  await trackEvent(withBaseMetadata(game, { event: 'share_export_click', resultId, metadata: { action: 'download_png' } }));
}

export async function trackNextGameClick(game: Game, nextGameSlug: string) {
  await trackEvent(withBaseMetadata(game, { event: 'next_game_click', metadata: { nextGameSlug } }));
}

export async function trackHubReturnClick(game: Game, destination: string) {
  await trackEvent(withBaseMetadata(game, { event: 'hub_return_click', metadata: { destination } }));
}

export async function trackSharePagePlayClick(game: Game, destinationSlug: string) {
  await trackEvent(withBaseMetadata(game, { event: 'share_page_play_click', metadata: { destinationSlug } }));
}

export async function trackReturnToHubAfterOutcome(game: Game, destination: string) {
  await trackEvent(withBaseMetadata(game, { event: 'return_to_hub_after_outcome', metadata: { destination } }));
}

export async function trackFinalCardView(game: Game, resultId: string) {
  await trackEvent(withBaseMetadata(game, { event: 'final_card_view', resultId, metadata: { placement: 'share_page' } }));
}

export async function trackFinalCardDownload(game: Game, resultId: string) {
  await trackEvent(withBaseMetadata(game, { event: 'final_card_download', resultId, metadata: { action: 'download' } }));
}

export async function trackFinalCardShareClick(game: Game, resultId: string) {
  await trackEvent(withBaseMetadata(game, { event: 'final_card_share_click', resultId, metadata: { action: 'share_intent' } }));
}

export async function trackCampaignAvatarView(game: Game, variant: string, size: string) {
  await trackEvent(withBaseMetadata(game, { event: 'campaign_avatar_view', metadata: { variant, size } }));
}

export async function trackCampaignCtaClickAfterGame(game: Game, ctaId: string, placement: string) {
  await trackEvent(withBaseMetadata(game, { event: 'campaign_cta_click_after_game', ctaId, metadata: { placement } }));
}

export async function trackFinalCardQRView(game: Game, resultId: string) {
  await trackEvent(withBaseMetadata(game, { event: 'final_card_qr_view', resultId, metadata: { placement: 'final_card_footer' } }));
}

export async function trackFinalCardQRClick(game: Game, resultId: string) {
  await trackEvent(withBaseMetadata(game, { event: 'final_card_qr_click', resultId, metadata: { action: 'qr_scan_intent' } }));
}

export async function trackAvatarV2Rendered(game: Game, expression: string, glasses: string) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'avatar_v2_rendered',
      metadata: { expression, glasses, version: 'v2' },
    }),
  );
}

export async function trackAvatarExpressionRendered(game: Game, expression: string) {
  await trackEvent(withBaseMetadata(game, { event: 'avatar_expression_rendered', metadata: { expression } }));
}

export async function trackQuickMinigameCompletion(game: Game, resultId: string) {
  await trackEvent(withBaseMetadata(game, { event: 'quick_minigame_completion', resultId, metadata: { pace: game.pace } }));
}

export async function trackQuickMinigameReplay(game: Game) {
  await trackEvent(withBaseMetadata(game, { event: 'quick_minigame_replay', metadata: { pace: game.pace } }));
}

export async function trackIdeologicalAxisSignal(
  game: Game,
  resultId: string,
  dominantAxis: string,
  score: number,
) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'ideological_axis_signal',
      resultId,
      metadata: {
        dominantAxis,
        axisScore: score,
      },
    }),
  );
}

export async function trackArcadeRunStart(
  game: Game,
  metadata: { arcadeSlug: string; runId: string },
) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'arcade_run_start',
      metadata,
    }),
  );
}

export async function trackArcadeRunEnd(
  game: Game,
  metadata: {
    arcadeSlug: string;
    runId: string;
    score: number;
    durationMs: number;
    collectiveRate: number;
    apoio: number;
    mutiroes: number;
    bloqueios: number;
    individualismos: number;
  },
) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'arcade_run_end',
      metadata,
    }),
  );
}

export async function trackArcadeScore(
  game: Game,
  score: number,
  metadata?: { collectiveRate?: number; durationMs?: number },
) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'arcade_score',
      metadata: {
        score,
        ...(metadata || {}),
      },
    }),
  );
}

export async function trackArcadeFirstInputTime(
  game: Game,
  msSinceStart: number,
  interactionType: string,
) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'arcade_first_input_time',
      metadata: {
        msSinceStart: Math.max(0, Math.round(msSinceStart)),
        interactionType,
      },
    }),
  );
}

export async function trackArcadeReplayClick(game: Game, arcadeSlug: string) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'arcade_replay_click',
      metadata: { arcadeSlug },
    }),
  );
}

export async function trackArcadePowerupCollect(
  game: Game,
  powerupId: string,
  metadata?: Record<string, string | number>,
) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'arcade_powerup_collect',
      metadata: {
        powerupId,
        ...(metadata || {}),
      },
    }),
  );
}

export async function trackArcadeCampaignCtaClick(
  game: Game,
  arcadeSlug: string,
  placement: string,
) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'arcade_campaign_cta_click',
      metadata: {
        arcadeSlug,
        placement,
      },
    }),
  );
}

export async function trackMutiraoActionUsed(
  game: Game,
  actionId: string,
  metadata?: Record<string, string | number | boolean>,
) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'mutirao_action_used',
      metadata: {
        actionId,
        ...(metadata || {}),
      },
    }),
  );
}

export async function trackMutiraoEventTriggered(
  game: Game,
  eventId: string,
  metadata?: Record<string, string | number | boolean>,
) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'mutirao_event_triggered',
      metadata: {
        eventId,
        ...(metadata || {}),
      },
    }),
  );
}

export async function trackMutiraoPressurePeak(
  game: Game,
  peak: number,
  metadata?: Record<string, string | number | boolean>,
) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'mutirao_pressure_peak',
      metadata: {
        peak,
        ...(metadata || {}),
      },
    }),
  );
}

export async function trackCooperativaActionUsed(
  game: Game,
  actionId: string,
  metadata?: Record<string, string | number | boolean>,
) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'cooperativa_action_used',
      metadata: {
        actionId,
        ...(metadata || {}),
      },
    }),
  );
}

export async function trackCooperativaEventTriggered(
  game: Game,
  eventId: string,
  metadata?: Record<string, string | number | boolean>,
) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'cooperativa_event_triggered',
      metadata: {
        eventId,
        ...(metadata || {}),
      },
    }),
  );
}

export async function trackCooperativaPressurePeak(
  game: Game,
  peak: number,
  metadata?: Record<string, string | number | boolean>,
) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'cooperativa_pressure_peak',
      metadata: {
        peak,
        ...(metadata || {}),
      },
    }),
  );
}

export async function trackCooperativaStationSelected(
  game: Game,
  stationId: string,
  metadata?: Record<string, string | number | boolean>,
) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'cooperativa_station_selected',
      metadata: {
        stationId,
        ...(metadata || {}),
      },
    }),
  );
}

export async function trackCooperativaStationOverload(
  game: Game,
  stationId: string,
  metadata?: Record<string, string | number | boolean>,
) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'cooperativa_station_overload',
      metadata: {
        stationId,
        ...(metadata || {}),
      },
    }),
  );
}

export async function trackCooperativaPhaseReached(
  game: Game,
  phase: string,
  metadata?: Record<string, string | number | boolean>,
) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'cooperativa_phase_reached',
      metadata: {
        phase,
        ...(metadata || {}),
      },
    }),
  );
}

export async function trackCooperativaCollapseReason(
  game: Game,
  reason: string,
  metadata?: Record<string, string | number | boolean>,
) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'cooperativa_collapse_reason',
      metadata: {
        reason,
        ...(metadata || {}),
      },
    }),
  );
}

export async function trackCooperativaMutiraoActivated(
  game: Game,
  metadata?: Record<string, string | number | boolean>,
) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'cooperativa_mutirao_activated',
      metadata: {
        ...(metadata || {}),
      },
    }),
  );
}

export async function trackCampaignCtaClickAfterRun(
  game: Game,
  ctaId: string,
  placement: string,
) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'campaign_cta_click_after_run',
      ctaId,
      metadata: {
        placement,
      },
    }),
  );
}

// Front-stage tracking (Tijolo 31)
export async function trackHomePrimaryPlayClick(game: Game, targetSlug: string, targetType: string) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'home_primary_play_click',
      metadata: {
        targetSlug,
        targetType,
        placement: 'home_hero',
      },
    }),
  );
}

export async function trackHomeArcadeClick(game: Game, arcadeSlug: string, placement: string) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'home_arcade_click',
      metadata: {
        arcadeSlug,
        placement,
      },
    }),
  );
}

export async function trackHomeQuickClick(game: Game, quickSlug: string, placement: string) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'home_quick_click',
      metadata: {
        quickSlug,
        placement,
      },
    }),
  );
}

export async function trackHomePlayNowBlockClick(game: Game, gameSlug: string, gameType: string) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'home_play_now_block_click',
      metadata: {
        gameSlug,
        gameType,
        placement: 'play_now_block',
      },
    }),
  );
}

export async function trackHomeQuickVsArcadeChoice(game: Game, choice: 'quick' | 'arcade', gameSlug: string) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'home_quick_vs_arcade_choice',
      metadata: {
        choice,
        gameSlug,
        placement: 'quick_vs_arcade_block',
      },
    }),
  );
}

export async function trackArcadeVsQuickPreference(game: Game, choice: 'quick' | 'arcade', gameSlug: string) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'arcade_vs_quick_preference',
      metadata: {
        choice,
        gameSlug,
        placement: 'quick_vs_arcade_block',
      },
    }),
  );
}

export async function trackAboveFoldGameClick(game: Game, gameSlug: string, gameType: string, position: number) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'above_fold_game_click',
      metadata: {
        gameSlug,
        gameType,
        position,
        placement: 'above_fold',
      },
    }),
  );
}

export async function trackManifestoExpandClick(game: Game, expanded: boolean, placement: string) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'manifesto_expand_click',
      metadata: {
        expanded,
        placement,
      },
    }),
  );
}

export async function trackExplorarArcadeClick(game: Game, arcadeSlug: string) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'explorar_arcade_click',
      metadata: {
        arcadeSlug,
        placement: 'explorar_arcade_section',
      },
    }),
  );
}

export async function trackExplorarQuickClick(game: Game, quickSlug: string) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'explorar_quick_click',
      metadata: {
        quickSlug,
        placement: 'explorar_quick_section',
      },
    }),
  );
}

export async function trackExplorarFilterChange(game: Game, filterType: string, filterValue: string) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'explorar_filter_change',
      metadata: {
        filterType,
        filterValue,
        placement: 'explorar_filters',
      },
    }),
  );
}

// Tijolo 32: Conversion and replay tracking
export async function trackCardPreviewInteraction(game: Game, interactionType: 'hover' | 'focus') {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'card_preview_interaction',
      metadata: {
        interactionType,
      },
    }),
  );
}

export async function trackCardFullClick(game: Game, placement: string) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'card_full_click',
      metadata: {
        placement,
      },
    }),
  );
}

export async function trackClickToPlayTime(game: Game, msSinceClick: number, entryPoint: string) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'click_to_play_time',
      metadata: {
        msSinceClick: Math.max(0, Math.round(msSinceClick)),
        entryPoint,
      },
    }),
  );
}

export async function trackReplayAfterRunClick(game: Game, context: 'outcome' | 'arcade_finish') {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'replay_after_run_click',
      metadata: {
        context,
      },
    }),
  );
}

export async function trackNextGameAfterRunClick(game: Game, nextGameSlug: string, context: 'outcome' | 'share') {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'next_game_after_run_click',
      metadata: {
        nextGameSlug,
        context,
      },
    }),
  );
}

export async function trackQuickToArcadeClick(game: Game, arcadeSlug: string, placement: string) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'quick_to_arcade_click',
      metadata: {
        arcadeSlug,
        placement,
      },
    }),
  );
}

export async function trackArcadeToQuickClick(game: Game, quickSlug: string, placement: string) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'arcade_to_quick_click',
      metadata: {
        quickSlug,
        placement,
      },
    }),
  );
}

// Tarifa Zero depth metrics (T35C)
export async function trackTarifaZeroComboPeak(
  game: Game,
  data: {
    comboMultiplierPeak: number;
    perfectStreakPeakMs: number;
    apoioSequencePeak: number;
    eventsTriggered: number;
  },
) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'tarifa_zero_combo_peak',
      metadata: data,
    }),
  );
}

export async function trackTarifaZeroPhaseDeaths(
  game: Game,
  currentPhase: 'abertura' | 'escalada' | 'pressao' | 'final',
  durationMs: number,
  collectiveRate: number,
) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'tarifa_zero_phase_death',
      metadata: {
        phase: currentPhase,
        durationMs,
        collectiveRate,
      },
    }),
  );
}

export async function trackTarifaZeroDepthMetrics(
  game: Game,
  data: {
    comboMultiplierPeak: number;
    perfectStreakPeakMs: number;
    apoioSequencePeak: number;
    totalCollisions: number;
    eventsTriggered: number;
    collectiveRate: number;
    phase: string;
  },
) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'tarifa_zero_depth_metrics',
      metadata: data,
    }),
  );
}
export async function trackHeroImpression(game: Game, variant: string) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'hero_impression',
      metadata: {
        hero_variant: variant,
        game_slug: game.slug,
        source_surface: 'hub_hero',
      },
    }),
  );
}

export async function trackHeroPrimaryCtaClick(game: Game, variant: string, ctaId: string) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'hero_primary_cta_click',
      ctaId,
      metadata: {
        hero_variant: variant,
        game_slug: game.slug,
        source_surface: 'hub_hero',
      },
    }),
  );
}

export async function trackHeroSecondaryCtaClick(game: Game, variant: string, ctaId: string) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'hero_secondary_cta_click',
      ctaId,
      metadata: {
        hero_variant: variant,
        game_slug: game.slug,
        source_surface: 'hub_hero',
      },
    }),
  );
}

export async function trackPortfolioLaneImpression(laneId: string, laneTitle: string) {
  await trackEvent({
    event: 'portfolio_lane_impression',
    slug: 'hub',
    engineKind: 'hub',
    metadata: {
      laneId,
      laneTitle,
      source_surface: 'hub_home'
    }
  });
}

export async function trackPortfolioCardClick(game: Game, laneId: string) {
  await trackEvent(
    withBaseMetadata(game, {
      event: 'portfolio_card_click',
      metadata: {
        laneId,
        game_slug: game.slug,
        source_surface: 'hub_home'
      }
    })
  );
}

// ─── Desobstrução T117A Validation Wave Tracking ─────────────────────────────

export async function trackDesobstrucaoPrimerComplete(metadata: {
  timeToCompletePrimerMs: number;
  dragsRequired: number;
  completedOnFirstAttempt: boolean;
  isTouchDevice: boolean;
}) {
  await trackEvent({
    event: 'desobstrucao_primer_complete',
    slug: 'desobstrucao',
    engineKind: 'physics-arcade',
    metadata: {
      timeToCompletePrimerMs: Math.round(metadata.timeToCompletePrimerMs),
      dragsRequired: metadata.dragsRequired,
      completedOnFirstAttempt: metadata.completedOnFirstAttempt,
      isTouchDevice: metadata.isTouchDevice,
    },
  });
}

  export async function trackDesobstrucaoPhaseTransition(metadata: {
    phase1Attempts: number;
    phase1DurationMs: number;
  }) {
    await trackEvent({
      event: 'desobstrucao_phase_transition',
      slug: 'desobstrucao',
      engineKind: 'physics-arcade',
      metadata: {
        phase1Attempts: metadata.phase1Attempts,
        phase1DurationMs: Math.round(metadata.phase1DurationMs),
      },
    });
  }

  export async function trackDesobstrucaoSessionComplete(metadata: {
    phase1Attempts: number;
    phase2Attempts: number;
    totalDurationMs: number;
    primerCompleted: boolean;
    isTouchDevice: boolean;
  }) {
    await trackEvent({
      event: 'desobstrucao_session_complete',
      slug: 'desobstrucao',
      engineKind: 'physics-arcade',
      metadata: {
        phase1Attempts: metadata.phase1Attempts,
        phase2Attempts: metadata.phase2Attempts,
        totalDurationMs: Math.round(metadata.totalDurationMs),
        primerCompleted: metadata.primerCompleted,
        isTouchDevice: metadata.isTouchDevice,
      },
    });
  }

  export async function trackDesobstrucaoFeedback(metadata: {
    satisfactionRating: number;
    clusters: string[];
    openNote: string;
    isTouchDevice: boolean;
  }) {
    await trackEvent({
      event: 'desobstrucao_feedback',
      slug: 'desobstrucao',
      engineKind: 'physics-arcade',
      metadata: {
        satisfactionRating: metadata.satisfactionRating,
        clusters: metadata.clusters.join(','),
        openNote: metadata.openNote.slice(0, 280),
        isTouchDevice: metadata.isTouchDevice,
      },
    });
  }

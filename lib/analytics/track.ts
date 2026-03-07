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

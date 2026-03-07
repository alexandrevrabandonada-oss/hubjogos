import type { Game } from '@/lib/games/catalog';
import { registerResult, startSession, trackEvent } from './session-store';

function base(game: Game) {
  return {
    slug: game.slug,
    engineKind: game.kind,
    engineId: game.engineId,
  };
}

export async function trackGameView(game: Game) {
  await startSession(base(game));
  await trackEvent({ ...base(game), event: 'game_view' });
}

export async function trackGameStart(game: Game) {
  await trackEvent({ ...base(game), event: 'game_start' });
}

export async function trackStepAdvance(game: Game, step: string) {
  await trackEvent({ ...base(game), event: 'step_advance', step });
}

export async function trackGameComplete(
  game: Game,
  result: { id: string; title: string; summary: string }
) {
  await trackEvent({ ...base(game), event: 'game_complete', resultId: result.id });
  await registerResult({
    ...base(game),
    resultId: result.id,
    resultTitle: result.title,
    summary: result.summary,
  });
}

export async function trackResultCopy(game: Game) {
  await trackEvent({ ...base(game), event: 'result_copy' });
}

export async function trackLinkCopy(game: Game) {
  await trackEvent({ ...base(game), event: 'link_copy' });
}

export async function trackCtaClick(game: Game, ctaId: string) {
  await trackEvent({ ...base(game), event: 'cta_click', ctaId });
}

export async function trackFirstInteractionTime(game: Game, msSinceStart: number, interactionType: string) {
  await trackEvent({
    ...base(game),
    event: 'first_interaction_time',
    metadata: {
      msSinceStart: Math.max(0, Math.round(msSinceStart)),
      interactionType,
    },
  });
}

export async function trackReplayClick(game: Game, context: 'outcome' | 'engine' | 'share') {
  await trackEvent({
    ...base(game),
    event: 'replay_click',
    metadata: { context },
  });
}

export async function trackAlternatePathClick(game: Game, context: string) {
  await trackEvent({
    ...base(game),
    event: 'alternate_path_click',
    metadata: { context },
  });
}

export async function trackOutcomeReplayIntent(game: Game, intent: 'replay' | 'alternate_route' | 'compare') {
  await trackEvent({
    ...base(game),
    event: 'outcome_replay_intent',
    metadata: { intent },
  });
}

export async function trackCampaignMarkClick(game: Game, placement: string) {
  await trackEvent({
    ...base(game),
    event: 'campaign_mark_click',
    metadata: { placement },
  });
}

export async function trackSeriesClick(
  game: Game,
  series: string,
  territoryScope: string,
  placement: string,
) {
  await trackEvent({
    ...base(game),
    event: 'series_click',
    metadata: {
      series,
      territoryScope,
      gameType: game.kind,
      pace: (game as any).pace || 'unknown',
      estimatedMinutes: game.estimatedMinutes,
      placement,
    },
  });
}

export async function trackNextSeriesExperienceClick(
  game: Game,
  series: string,
  targetSlug: string,
  territoryScope: string,
) {
  await trackEvent({
    ...base(game),
    event: 'next_series_experience_click',
    metadata: {
      series,
      targetSlug,
      territoryScope,
      gameType: game.kind,
      pace: (game as any).pace || 'unknown',
      estimatedMinutes: game.estimatedMinutes,
    },
  });
}

// Novos eventos de saída - Tijolo 16 (Circulação e Conversão)

export async function trackOutcomeView(game: Game, resultId: string) {
  await trackEvent({
    ...base(game),
    event: 'outcome_view',
    resultId,
    metadata: { placement: 'outcome_page' },
  });
}

export async function trackPrimaryCtaClick(game: Game, ctaId: string, metadata?: Record<string, string | number>) {
  await trackEvent({
    ...base(game),
    event: 'primary_cta_click',
    ctaId,
    metadata: { placement: 'outcome_primary', ...metadata },
  });
}

export async function trackSecondaryCtaClick(game: Game, ctaId: string, metadata?: Record<string, string | number>) {
  await trackEvent({
    ...base(game),
    event: 'secondary_cta_click',
    ctaId,
    metadata: { placement: 'outcome_secondary', ...metadata },
  });
}

export async function trackSharePageView(game: Game, resultId: string) {
  await trackEvent({
    ...base(game),
    event: 'share_page_view',
    resultId,
    metadata: { placement: 'share_page' },
  });
}

export async function trackShareExportClick(game: Game, resultId: string) {
  await trackEvent({
    ...base(game),
    event: 'share_export_click',
    resultId,
    metadata: { action: 'download_png' },
  });
}

export async function trackNextGameClick(game: Game, nextGameSlug: string) {
  await trackEvent({
    ...base(game),
    event: 'next_game_click',
    metadata: { nextGameSlug },
  });
}

export async function trackHubReturnClick(game: Game, destination: string) {
  await trackEvent({
    ...base(game),
    event: 'hub_return_click',
    metadata: { destination },
  });
}

export async function trackSharePagePlayClick(game: Game, destinationSlug: string) {
  await trackEvent({
    ...base(game),
    event: 'share_page_play_click',
    metadata: { destinationSlug },
  });
}

export async function trackReturnToHubAfterOutcome(game: Game, destination: string) {
  await trackEvent({
    ...base(game),
    event: 'return_to_hub_after_outcome',
    metadata: { destination },
  });
}

// Novos eventos de card final e avatar - Tijolo 22

export async function trackFinalCardView(game: Game, resultId: string) {
  await trackEvent({
    ...base(game),
    event: 'final_card_view',
    resultId,
    metadata: { placement: 'share_page' },
  });
}

export async function trackFinalCardDownload(game: Game, resultId: string) {
  await trackEvent({
    ...base(game),
    event: 'final_card_download',
    resultId,
    metadata: { action: 'download' },
  });
}

export async function trackFinalCardShareClick(game: Game, resultId: string) {
  await trackEvent({
    ...base(game),
    event: 'final_card_share_click',
    resultId,
    metadata: { action: 'share_intent' },
  });
}

export async function trackCampaignAvatarView(game: Game, variant: string, size: string) {
  await trackEvent({
    ...base(game),
    event: 'campaign_avatar_view',
    metadata: { variant, size },
  });
}

export async function trackCampaignCtaClickAfterGame(game: Game, ctaId: string, placement: string) {
  await trackEvent({
    ...base(game),
    event: 'campaign_cta_click_after_game',
    ctaId,
    metadata: { placement },
  });
}


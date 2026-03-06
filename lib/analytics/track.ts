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


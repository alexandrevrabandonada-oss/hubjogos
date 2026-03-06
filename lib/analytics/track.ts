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

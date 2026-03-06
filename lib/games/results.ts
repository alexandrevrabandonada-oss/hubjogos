import { getBranchingStoryById } from '@/lib/games/branching/registry';
import { getGameBySlug } from '@/lib/games/catalog';
import { getMapById } from '@/lib/games/map/registry';
import { getQuizById } from '@/lib/games/quiz/registry';
import { resolveGameEngine } from '@/lib/games/runtime/resolve-engine';
import { getSimulationById } from '@/lib/games/simulation/registry';

export interface GameResultInfo {
  title: string;
  summary: string;
}

export function resolveGameResultById(
  gameSlug: string,
  resultId: string
): GameResultInfo | null {
  const game = getGameBySlug(gameSlug);
  if (!game) {
    return null;
  }

  const resolved = resolveGameEngine(game);

  if (resolved.status !== 'resolved') {
    return null;
  }

  if (resolved.engineType === 'quiz') {
    const profile = resolved.quiz.profiles.find((item) => item.id === resultId);
    if (!profile) {
      return null;
    }
    return {
      title: profile.title,
      summary: `${profile.description} Próxima ação: ${profile.nextAction}`,
    };
  }

  if (resolved.engineType === 'branching_story') {
    const ending = resolved.story.endings.find((item) => item.id === resultId);
    if (!ending) {
      return null;
    }
    return {
      title: ending.title,
      summary: ending.revelation,
    };
  }

  if (resolved.engineType === 'simulation') {
    const simulation = getSimulationById(game.engineId);
    const result = simulation?.results.find((item) => item.id === resultId);
    if (!result) {
      return null;
    }
    return {
      title: result.title,
      summary: result.revelation,
    };
  }

  const map = getMapById(game.engineId || '');
  const result = map?.results.find((item) => item.id === resultId);
  if (!result) {
    return null;
  }
  return {
    title: result.title,
    summary: result.revelation,
  };
}

export function resolveDefaultResultSummary(gameSlug: string): string {
  const game = getGameBySlug(gameSlug);
  if (!game) {
    return 'Completei uma experiência política no Hub de Jogos da Pré-Campanha de Alexandre Fonseca para Deputado';
  }

  if (game.kind === 'quiz') {
    return getQuizById(game.engineId)?.subtitle || game.shortDescription;
  }

  if (game.kind === 'branching_story') {
    return getBranchingStoryById(game.engineId)?.subtitle || game.shortDescription;
  }

  if (game.kind === 'simulation') {
    return getSimulationById(game.engineId)?.subtitle || game.shortDescription;
  }

  if (game.kind === 'map') {
    return getMapById(game.engineId || '')?.description || game.shortDescription;
  }

  return game.shortDescription;
}

import { getBranchingStoryById } from '@/lib/games/branching/registry';
import { Game } from '@/lib/games/catalog';
import { getQuizById } from '@/lib/games/quiz/registry';
import { getSimulationById } from '@/lib/games/simulation/registry';
import { getMapById } from '@/lib/games/map/registry';
import { RuntimeResolution } from './types';

export function resolveGameEngine(game: Game): RuntimeResolution {
  if (game.kind === 'quiz') {
    if (!game.engineId) {
      return {
        status: 'fallback',
        engineType: 'shell',
        game,
        reason: 'Quiz não possui engineId definido.',
      };
    }

    const quiz = getQuizById(game.engineId);

    if (quiz) {
      return {
        status: 'resolved',
        engineType: 'quiz',
        game,
        quiz,
      };
    }

    return {
      status: 'fallback',
      engineType: 'shell',
      game,
      reason: 'Quiz não encontrado para este engineId.',
    };
  }

  if (game.kind === 'branching_story') {
    if (!game.engineId) {
      return {
        status: 'fallback',
        engineType: 'shell',
        game,
        reason: 'Branching story não possui engineId definido.',
      };
    }

    const story = getBranchingStoryById(game.engineId);

    if (story) {
      return {
        status: 'resolved',
        engineType: 'branching_story',
        game,
        story,
      };
    }

    return {
      status: 'fallback',
      engineType: 'shell',
      game,
      reason: 'Branching story ainda não possui engine real vinculada.',
    };
  }

  if (game.kind === 'simulation') {
    if (!game.engineId) {
      return {
        status: 'fallback',
        engineType: 'shell',
        game,
        reason: 'Simulação não possui engineId definido.',
      };
    }

    const simulation = getSimulationById(game.engineId);

    if (simulation) {
      return {
        status: 'resolved',
        engineType: 'simulation',
        game,
        simulation,
      };
    }

    return {
      status: 'fallback',
      engineType: 'shell',
      game,
      reason: 'Simulação ainda não possui engine real vinculada.',
    };
  }

  if (game.kind === 'map') {
    if (!game.engineId) {
      return {
        status: 'fallback',
        engineType: 'shell',
        game,
        reason: 'Mapa não possui engineId definido.',
      };
    }

    const map = getMapById(game.engineId);

    if (map) {
      return {
        status: 'resolved',
        engineType: 'map',
        game,
        map,
      };
    }

    return {
      status: 'fallback',
      engineType: 'shell',
      game,
      reason: 'Mapa ainda não possui engine real vinculada.',
    };
  }

  return {
    status: 'fallback',
    engineType: 'shell',
    game,
    reason: 'Engine ainda não implementada para este tipo de experiência.',
  };
}

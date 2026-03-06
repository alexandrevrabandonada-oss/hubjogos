import { describe, expect, it } from 'vitest';
import {
  createInitialSimulationState,
  getRemainingBudget,
  updateBudgetCategory,
} from '@/lib/games/simulation/engine';
import { calculateSimulationResult } from '@/lib/games/simulation/types';
import { cidadeRealSimulation } from '@/lib/games/simulation/data/cidade-real';

describe('simulation engine', () => {
  it('inicializa orçamento balanceado sem resto', () => {
    const state = createInitialSimulationState(cidadeRealSimulation);

    expect(state.step).toBe(0);
    expect(getRemainingBudget(state)).toBe(0);
  });

  it('corrige overflow de categoria sem ultrapassar total', () => {
    const state = createInitialSimulationState(cidadeRealSimulation);
    const updated = updateBudgetCategory(state, 'saude', 120);

    const total = Object.values(updated.budget).reduce((sum, value) => sum + value, 0);

    expect(total).toBe(cidadeRealSimulation.totalBudget);
    expect(updated.budget.saude).toBeGreaterThanOrEqual(0);
  });

  it('retorna eixo de cuidado com saúde, moradia e educação acima do crítico', () => {
    const state = createInitialSimulationState(cidadeRealSimulation);
    const custom = {
      ...state,
      budget: {
        saude: 30,
        educacao: 30,
        transporte: 20,
        moradia: 18,
        manutencao: 2,
      },
    };

    const result = calculateSimulationResult(custom, cidadeRealSimulation);

    expect(result.axis).toBe('orientacao-cuidado');
  });
});

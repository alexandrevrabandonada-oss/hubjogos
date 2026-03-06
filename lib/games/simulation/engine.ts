/**
 * Engine de simulação
 * Lógica pura de alocação orçamentária e cálculo de resultado
 */

import {
  BudgetCategory,
  SimulationDefinition,
  SimulationState,
  calculateSimulationResult,
} from './types';

export function createInitialSimulationState(
  definition: SimulationDefinition
): SimulationState {
  const baseAllocation = Math.floor(
    definition.totalBudget / definition.categories.length
  );

  const budget: Record<BudgetCategory, number> = {} as Record<
    BudgetCategory,
    number
  >;
  definition.categories.forEach((cat) => {
    budget[cat.key] = baseAllocation;
  });

  return {
    budget,
    totalBudget: definition.totalBudget,
    step: 0,
    history: [],
    finalResult: undefined,
  };
}

export function updateBudgetCategory(
  state: SimulationState,
  category: BudgetCategory,
  amount: number
): SimulationState {
  const newBudget = { ...state.budget };

  // Restrição: não pode ficar negativo
  if (amount < 0) {
    newBudget[category] = 0;
  } else {
    newBudget[category] = amount;
  }

  // Verifica se total não ultrapassa orçamento
  const total = Object.values(newBudget).reduce((a, b) => a + b, 0);
  if (total > state.totalBudget) {
    // Reduz o valor para encaixar
    newBudget[category] = amount - (total - state.totalBudget);
  }

  //revalidação
  if (newBudget[category] < 0) {
    newBudget[category] = 0;
  }

  return {
    ...state,
    budget: newBudget,
  };
}

export function getRemainingBudget(state: SimulationState): number {
  const allocated = Object.values(state.budget).reduce((a, b) => a + b, 0);
  return state.totalBudget - allocated;
}

export function canAdvanceStep(
  state: SimulationState,
  definition: SimulationDefinition
): boolean {
  // Pode avançar se há pressão a responder e não é último step
  return state.step < definition.pressures.length;
}

export function getNextPressure(
  state: SimulationState,
  definition: SimulationDefinition
) {
  if (state.step < definition.pressures.length) {
    return definition.pressures[state.step];
  }
  return null;
}

export function advanceStep(state: SimulationState): SimulationState {
  return {
    ...state,
    step: state.step + 1,
    history: [
      ...state.history,
      {
        step: state.step,
        allocation: { ...state.budget },
        decision: 'Avançou pressão',
      },
    ],
  };
}

export function completeSimulation(
  state: SimulationState,
  definition: SimulationDefinition
): SimulationState {
  const result = calculateSimulationResult(state, definition);
  return {
    ...state,
    finalResult: result,
  };
}

export function getProgressPercent(
  state: SimulationState,
  definition: SimulationDefinition
): number {
  if (definition.pressures.length === 0) return 100;
  return Math.min(100, Math.round((state.step / definition.pressures.length) * 100));
}

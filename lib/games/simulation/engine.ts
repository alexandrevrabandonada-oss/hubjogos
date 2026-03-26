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

  const districtHealth: Record<string, number> = {};
  if (definition.districts) {
    definition.districts.forEach((d) => {
      districtHealth[d.id] = d.initialHealth;
    });
  }

  return {
    budget,
    totalBudget: definition.totalBudget,
    step: 0,
    history: [],
    finalResult: undefined,
    districtHealth: definition.districts ? districtHealth : undefined,
    activeProjects: [],
    politicalTrust: 50, // Começa no neutro
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

/**
 * V2 - Visual City Logic
 */

export function applyProject(
  state: SimulationState,
  projectId: string,
  definition: SimulationDefinition
): SimulationState {
  const project = definition.projects?.find((p) => p.id === projectId);
  if (!project) return state;

  const newDistrictHealth = { ...(state.districtHealth || {}) };
  const newBudget = { ...state.budget };
  const newActiveProjects = [...(state.activeProjects || []), projectId];

  project.impacts.forEach((impact) => {
    // Impacto em distrito específico
    if (impact.targetDistrictId && newDistrictHealth[impact.targetDistrictId] !== undefined) {
      newDistrictHealth[impact.targetDistrictId] = Math.min(
        100,
        newDistrictHealth[impact.targetDistrictId] + (impact.healthValue || 0)
      );
    }

    // Impacto em categoria de orçamento (legacy support/internal tracking)
    if (impact.category) {
      newBudget[impact.category] = (newBudget[impact.category] || 0) + (impact.healthValue || 5);
    }
  });

  return {
    ...state,
    districtHealth: newDistrictHealth,
    budget: newBudget,
    activeProjects: newActiveProjects,
    politicalTrust: Math.min(100, (state.politicalTrust || 50) + 5),
  };
}

export function applyPressureToDistricts(
  state: SimulationState,
  definition: SimulationDefinition
): SimulationState {
  if (!state.districtHealth) return state;

  const pressure = getNextPressure(state, definition);
  const newDistrictHealth = { ...state.districtHealth };

  // Decaimento natural (se não houver projeto ativo na área)
  Object.keys(newDistrictHealth).forEach((id) => {
    newDistrictHealth[id] = Math.max(0, newDistrictHealth[id] - 3);
  });

  // Impacto da pressão atual
  if (pressure) {
    // Se a pressão for de saúde, afeta distritos que precisam de saúde
    definition.districts?.forEach((d) => {
      if (d.needs.includes(pressure.demandCategory)) {
        newDistrictHealth[d.id] = Math.max(0, newDistrictHealth[d.id] - 10);
      }
    });
  }

  return {
    ...state,
    districtHealth: newDistrictHealth,
    politicalTrust: Math.max(0, (state.politicalTrust || 50) - 8),
  };
}

export function getProgressPercent(
  state: SimulationState,
  definition: SimulationDefinition
): number {
  if (definition.pressures.length === 0) return 100;
  return Math.min(100, Math.round((state.step / definition.pressures.length) * 100));
}

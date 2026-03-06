/**
 * Types para engine de simulação
 * Permite decisões sob restrições numérico-políticas
 */

export type BudgetCategory = 'saude' | 'educacao' | 'transporte' | 'moradia' | 'manutencao';

export interface BudgetImpact {
  category: BudgetCategory;
  consequence: string;
  severity: 'low' | 'medium' | 'high';
}

export interface SimulationResult {
  id: string;
  title: string;
  axis: string;
  description: string;
  revelation: string;
  nextAction: string;
  impacts: BudgetImpact[];
}

export interface SimulationState {
  budget: Record<BudgetCategory, number>;
  totalBudget: number;
  step: number;
  history: Array<{
    step: number;
    allocation: Record<BudgetCategory, number>;
    decision: string;
  }>;
  finalResult?: SimulationResult;
}

export interface SimulationDefinition {
  id: string;
  title: string;
  subtitle: string;
  totalBudget: number;
  categories: Array<{
    key: BudgetCategory;
    label: string;
    icon: string;
    description: string;
    minBudget: number;
    criticalThreshold: number;
  }>;
  pressures: Array<{
    step: number;
    title: string;
    description: string;
    demandCategory: BudgetCategory;
    demandPercentage: number;
  }>;
  results: SimulationResult[];
}

export function calculateSimulationResult(
  state: SimulationState,
  definition: SimulationDefinition
): SimulationResult {
  const budget = state.budget;

  // Contabiliza subinvestimentos
  const underfunded: BudgetCategory[] = [];
  const wellFunded: BudgetCategory[] = [];

  definition.categories.forEach((cat) => {
    if (budget[cat.key] < cat.criticalThreshold) {
      underfunded.push(cat.key);
    } else {
      wellFunded.push(cat.key);
    }
  });

  // Lógica de resultado político: não há saída mágica
  if (underfunded.length >= 4) {
    // Austeridade extrema
    return (
      definition.results.find((r) => r.axis === 'austeridade-extrema') ||
      definition.results[0]
    );
  }

  if (underfunded.includes('saude') && underfunded.includes('moradia')) {
    // Colapso estrutural
    return (
      definition.results.find((r) => r.axis === 'colapso-estrutural') ||
      definition.results[1]
    );
  }

  if (
    wellFunded.includes('transporte') &&
    wellFunded.includes('manutencao') &&
    underfunded.includes('moradia')
  ) {
    // Resultado tecnocrático: cidade para circulação, não para viver
    return (
      definition.results.find((r) => r.axis === 'tecnocracia-circuladora') ||
      definition.results[2]
    );
  }

  if (
    wellFunded.includes('saude') &&
    wellFunded.includes('moradia') &&
    wellFunded.includes('educacao')
  ) {
    // Resultado de cuidado (ainda com conflitos)
    return (
      definition.results.find((r) => r.axis === 'orientacao-cuidado') ||
      definition.results[3]
    );
  }

  // Padrão: resultado de contenção/ajuste
  return (
    definition.results.find((r) => r.axis === 'contencao-ajuste') ||
    definition.results[definition.results.length - 1]
  );
}

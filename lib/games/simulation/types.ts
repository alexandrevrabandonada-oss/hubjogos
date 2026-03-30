/**
 * Types para engine de simulação (V2 - Visual/Tactical)
 * Permite decisões sob restrições numérico-políticas e territoriais
 */

export type BudgetCategory = 'saude' | 'educacao' | 'transporte' | 'moradia' | 'manutencao';

export interface BudgetImpact {
  category: BudgetCategory;
  consequence: string;
  severity: 'low' | 'medium' | 'high';
}

export interface CityDistrict {
  id: string;
  name: string;
  flavor: string;
  initialHealth: number; // 0-100
  icon: string;
  needs: BudgetCategory[];
}

export interface UrbanProject {
  id: string;
  label: string;
  description: string;
  cost: number;
  icon?: string;
  impacts: Array<{
    category?: BudgetCategory;
    targetDistrictId?: string; // Se afetar distrito específico
    healthValue?: number; // Melhora de 0-100
    politicalValue?: number; // Efeito no humor/confiança
  }>;
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
  // V2 fields
  districtHealth?: Record<string, number>;
  activeProjects?: string[];
  politicalTrust?: number; // 0-100
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
  // V2 fields
  districts?: CityDistrict[];
  projects?: UrbanProject[];
  isVisualMode?: boolean; // Se deve usar o motor tático/visual
}

export function calculateSimulationResult(
  state: SimulationState,
  definition: SimulationDefinition
): SimulationResult {
  // Se for modo visual, a lógica de resultado foca na saúde dos distritos
  if (definition.isVisualMode && state.districtHealth) {
    const healthValues = Object.values(state.districtHealth);
    const avgHealth = healthValues.reduce((a, b) => a + b, 0) / healthValues.length;
    
    // Em um arco curto de 3 crises, a rota boa precisa ser exigente, mas alcançável.
    if (avgHealth >= 56) {
      return (
        definition.results.find((r) => r.axis === 'orientacao-cuidado') ||
        definition.results[0]
      );
    }
    
    return (
      definition.results.find((r) => r.axis === 'contencao-ajuste') ||
      definition.results[definition.results.length - 1]
    );
  }

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

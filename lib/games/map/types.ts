/**
 * Types para engine de mapa
 * Permite exploração espacial e descoberta de padrões territoriais
 */

export interface MapPoint {
  id: string;
  name: string;
  region: string;
  coordinates: { x: number; y: number };
  type: 'abandoned' | 'active' | 'contested';
  iconType: 'hospital' | 'school' | 'factory' | 'house' | 'theater' | 'market';
  description: string;
  history: string;
  politicalReading: string;
  discovered: boolean;
}

export interface MapRegion {
  id: string;
  name: string;
  color: string;
}

export interface MapResult {
  id: string;
  title: string;
  pattern: string;
  description: string;
  revelation: string;
  nextAction: string;
}

export interface MapState {
  points: Record<string, MapPoint>;
  visitedPoints: string[];
  currentPointId: string | null;
  explorationComplete: boolean;
  finalResult: MapResult | null;
}

export interface MapDefinition {
  id: string;
  title: string;
  description: string;
  regions: MapRegion[];
  points: MapPoint[];
  results: MapResult[];
  minPointsToComplete: number;
}

/**
 * Calcula resultado do mapa baseado nos pontos visitados
 */
export function calculateMapResult(
  definition: MapDefinition,
  visitedPoints: string[]
): MapResult {
  const points = definition.points.filter((p) => visitedPoints.includes(p.id));

  // Contagem por tipo
  const abandonedCount = points.filter((p) => p.type === 'abandoned').length;
  const contestedCount = points.filter((p) => p.type === 'contested').length;

  // Contagem por função
  const publicServices = points.filter(
    (p) => p.iconType === 'hospital' || p.iconType === 'school'
  ).length;
  const productive = points.filter(
    (p) => p.iconType === 'factory' || p.iconType === 'market'
  ).length;
  const cultural = points.filter(
    (p) => p.iconType === 'theater'
  ).length;

  // Lógica de resultado
  // Padrão 1: predominância de serviços públicos abandonados
  if (publicServices >= 4 && abandonedCount >= 5) {
    return definition.results.find((r) => r.id === 'abandono-servicos') || definition.results[0];
  }

  // Padrão 2: espaços produtivos abandonados
  if (productive >= 3 && abandonedCount >= 4) {
    return definition.results.find((r) => r.id === 'desindustrializacao') || definition.results[0];
  }

  // Padrão 3: territórios em disputa
  if (contestedCount >= 3) {
    return definition.results.find((r) => r.id === 'territorio-disputa') || definition.results[0];
  }

  // Padrão 4: memória cultural apagada
  if (cultural >= 2) {
    return definition.results.find((r) => r.id === 'memoria-apagada') || definition.results[0];
  }

  // Padrão padrão: abandono difuso
  return definition.results.find((r) => r.id === 'abandono-sistemico') || definition.results[0];
}

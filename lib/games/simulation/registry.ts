/**
 * Registry de simulações
 * Resolução por engineId, padrão adapter
 */

import { cidadeRealSimulation } from './data/cidade-real';
import { SimulationDefinition } from './types';

const simulationRegistry: Record<string, SimulationDefinition> = {
  'cidade-real-v1': cidadeRealSimulation,
};

export function getSimulationById(id?: string): SimulationDefinition | null {
  if (!id) {
    return null;
  }
  return simulationRegistry[id] || null;
}

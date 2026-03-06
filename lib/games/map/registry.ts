/**
 * Registry de mapas
 * Resolve mapas por ID
 */

import { abandonadoMap } from './data/abandonado';
import { MapDefinition } from './types';

const mapsById: Record<string, MapDefinition> = {
  'abandonado-v1': abandonadoMap,
};

export function getMapById(id: string): MapDefinition | null {
  return mapsById[id] || null;
}

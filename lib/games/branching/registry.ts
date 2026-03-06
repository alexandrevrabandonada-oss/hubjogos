import { transporteUrgenteStory } from './data/transporte-urgente';
import { BranchingStoryDefinition } from './types';

const branchingRegistry: Record<string, BranchingStoryDefinition> = {
  'transporte-urgente': transporteUrgenteStory,
};

export function getBranchingStoryById(id?: string): BranchingStoryDefinition | null {
  if (!id) {
    return null;
  }

  return branchingRegistry[id] || null;
}

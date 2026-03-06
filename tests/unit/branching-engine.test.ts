import { describe, expect, it } from 'vitest';
import {
  computeBranchingResult,
  getBranchingNode,
  resolveNextStep,
} from '@/lib/games/branching/engine';
import { transporteUrgenteStory } from '@/lib/games/branching/data/transporte-urgente';

describe('branching engine', () => {
  it('resolve próxima etapa para outro nó quando choice aponta node', () => {
    const node = getBranchingNode(transporteUrgenteStory, 'inicio-turno');
    expect(node).toBeTruthy();

    const step = resolveNextStep(transporteUrgenteStory, node!, 'n1-a');

    expect(step.choice?.id).toBe('n1-a');
    expect(step.nextNode?.id).toBe('pressao-plataforma');
    expect(step.endingId).toBeNull();
  });

  it('resolve ending e resumo coerente', () => {
    const history = [
      { nodeId: 'inicio-turno', choiceId: 'n1-a' },
      { nodeId: 'pressao-plataforma', choiceId: 'n2-a' },
    ];

    const result = computeBranchingResult(
      transporteUrgenteStory,
      'fim-exaustao',
      history
    );

    expect(result.ending.id).toBe('fim-exaustao');
    expect(result.summary).toContain('Caminho:');
    expect(result.summary).toContain('05h20 - início do turno');
  });
});

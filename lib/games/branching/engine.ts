import {
  BranchingChoice,
  BranchingNode,
  BranchingResult,
  BranchingStoryDefinition,
} from './types';

function buildSummary(
  story: BranchingStoryDefinition,
  endingId: string,
  history: Array<{ nodeId: string; choiceId: string }>
): string {
  const ending = story.endings.find((item) => item.id === endingId);
  if (!ending) {
    return 'Resultado indisponível.';
  }

  const path = history
    .map((step) => {
      const node = story.nodes.find((item) => item.id === step.nodeId);
      const choice = node?.choices.find((item) => item.id === step.choiceId);
      if (!node || !choice) {
        return null;
      }
      return `${node.title}: ${choice.label}`;
    })
    .filter(Boolean)
    .join(' | ');

  return `${ending.title}. ${ending.revelation} Caminho: ${path}`;
}

export function getBranchingNode(story: BranchingStoryDefinition, nodeId: string) {
  return story.nodes.find((node) => node.id === nodeId) || null;
}

export function getBranchingEnding(story: BranchingStoryDefinition, endingId: string) {
  return story.endings.find((ending) => ending.id === endingId) || null;
}

export function resolveNextStep(
  story: BranchingStoryDefinition,
  currentNode: BranchingNode,
  choiceId: string
): { nextNode: BranchingNode | null; endingId: string | null; choice: BranchingChoice | null } {
  const choice = currentNode.choices.find((item) => item.id === choiceId);

  if (!choice) {
    return { nextNode: null, endingId: null, choice: null };
  }

  const ending = getBranchingEnding(story, choice.nextId);
  if (ending) {
    return { nextNode: null, endingId: ending.id, choice };
  }

  return {
    nextNode: getBranchingNode(story, choice.nextId),
    endingId: null,
    choice,
  };
}

export function computeBranchingResult(
  story: BranchingStoryDefinition,
  endingId: string,
  history: Array<{ nodeId: string; choiceId: string }>
): BranchingResult {
  const ending = getBranchingEnding(story, endingId) || story.endings[0];

  return {
    ending,
    history,
    summary: buildSummary(story, ending.id, history),
  };
}

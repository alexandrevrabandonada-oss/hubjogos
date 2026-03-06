export interface BranchingChoice {
  id: string;
  label: string;
  consequence: string;
  nextId: string;
}

export interface BranchingNode {
  id: string;
  title: string;
  body: string;
  choices: BranchingChoice[];
}

export interface BranchingEnding {
  id: string;
  title: string;
  revelation: string;
  nextAction: string;
}

export interface BranchingStoryDefinition {
  id: string;
  title: string;
  subtitle: string;
  startNodeId: string;
  nodes: BranchingNode[];
  endings: BranchingEnding[];
}

export interface BranchingResult {
  ending: BranchingEnding;
  history: Array<{
    nodeId: string;
    choiceId: string;
  }>;
  summary: string;
}

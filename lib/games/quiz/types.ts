export type QuizAxis =
  | 'services'
  | 'labor'
  | 'mobility'
  | 'participation'
  | 'urban-memory'
  | 'cost-of-living'
  | 'governance'
  | 'collective-power';

export interface QuizOption {
  id: string;
  label: string;
  impact: Partial<Record<QuizAxis, number>>;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  context?: string;
  options: QuizOption[];
}

export interface QuizProfile {
  id: string;
  axis: QuizAxis;
  title: string;
  description: string;
  nextAction: string;
}

export interface QuizDefinition {
  id: string;
  title: string;
  subtitle: string;
  questions: QuizQuestion[];
  profiles: QuizProfile[];
}

export interface QuizResult {
  profile: QuizProfile;
  scores: Record<QuizAxis, number>;
  answered: number;
  summary: string;
}

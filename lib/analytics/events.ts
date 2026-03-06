export type AnalyticsEventName =
  | 'game_view'
  | 'game_start'
  | 'step_advance'
  | 'game_complete'
  | 'result_copy'
  | 'link_copy'
  | 'cta_click';

export interface AnalyticsEventPayload {
  sessionId: string;
  anonymousId: string;
  event: AnalyticsEventName;
  slug: string;
  engineKind: string;
  engineId?: string;
  step?: string;
  resultId?: string;
  ctaId?: string;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: string;
}

export interface SessionRecord {
  sessionId: string;
  anonymousId: string;
  slug: string;
  engineKind: string;
  engineId?: string;
  startedAt: string;
  completedAt?: string;
  status: 'started' | 'completed';
}

export interface ResultRecord {
  sessionId: string;
  anonymousId: string;
  slug: string;
  engineKind: string;
  engineId?: string;
  resultId: string;
  resultTitle: string;
  summary: string;
  createdAt: string;
}

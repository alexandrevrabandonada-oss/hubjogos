export type AnalyticsEventName =
  | 'game_view'
  | 'game_start'
  | 'step_advance'
  | 'game_complete'
  | 'result_copy'
  | 'link_copy'
  | 'cta_click'
  // Eventos de saída granulares (Tijolo 16)
  | 'outcome_view'
  | 'primary_cta_click'
  | 'secondary_cta_click'
  | 'share_page_view'
  | 'share_export_click'
  | 'next_game_click'
  | 'hub_return_click';

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
  // Experimentos ativos durante este evento
  experiments?: Array<{ key: string; variant: string }>;
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
  // Atribuição de origem
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  referrer?: string | null;
  initialPath?: string | null;
  // Experimentos resolvidos para esta sessão
  experiments?: Array<{ key: string; variant: string }>;
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

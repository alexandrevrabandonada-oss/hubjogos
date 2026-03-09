export type AnalyticsEventName =
  | 'game_view'
  | 'game_start'
  | 'step_advance'
  | 'game_complete'
  | 'result_copy'
  | 'link_copy'
  | 'cta_click'
  | 'first_interaction_time'
  | 'replay_click'
  | 'alternate_path_click'
  | 'outcome_replay_intent'
  | 'share_page_play_click'
  | 'campaign_mark_click'
  | 'series_click'
  | 'next_series_experience_click'
  | 'return_to_hub_after_outcome'
  // Eventos de saída granulares (Tijolo 16)
  | 'outcome_view'
  | 'primary_cta_click'
  | 'secondary_cta_click'
  | 'share_page_view'
  | 'share_export_click'
  | 'next_game_click'
  | 'hub_return_click'
  // Eventos de card final e avatar (Tijolo 22)
  | 'final_card_view'
  | 'final_card_download'
  | 'final_card_share_click'
  | 'campaign_avatar_view'
  | 'campaign_cta_click_after_game'
  // Eventos de QR code e avatar V2 (Tijolo 23)
  | 'final_card_qr_view'
  | 'final_card_qr_click'
  | 'avatar_v2_rendered'
  | 'avatar_expression_rendered'
  | 'quick_minigame_completion'
  | 'quick_minigame_replay'
  | 'ideological_axis_signal'
  // Linha arcade (Tijolo 29)
  | 'arcade_run_start'
  | 'arcade_run_end'
  | 'arcade_score'
  | 'arcade_first_input_time'
  | 'arcade_replay_click'
  | 'arcade_powerup_collect'
  | 'arcade_campaign_cta_click'
  | 'mutirao_action_used'
  | 'mutirao_event_triggered'
  | 'mutirao_pressure_peak'
  | 'cooperativa_action_used'
  | 'cooperativa_event_triggered'
  | 'cooperativa_pressure_peak'
  | 'cooperativa_station_selected'
  | 'cooperativa_station_overload'
  | 'cooperativa_phase_reached'
  | 'cooperativa_collapse_reason'
  | 'cooperativa_mutirao_activated'
  | 'campaign_cta_click_after_run'
  // Front-stage tracking (Tijolo 31)
  | 'home_primary_play_click'
  | 'home_arcade_click'
  | 'home_quick_click'
  | 'home_play_now_block_click'
  | 'home_quick_vs_arcade_choice'
  | 'arcade_vs_quick_preference'
  | 'above_fold_game_click'
  | 'manifesto_expand_click'
  | 'explorar_arcade_click'
  | 'explorar_quick_click'
  | 'explorar_filter_change'
  // Conversão e replay tracking (Tijolo 32)
  | 'card_preview_interaction'
  | 'card_full_click'
  | 'click_to_play_time'
  | 'replay_after_run_click'
  | 'next_game_after_run_click'
  | 'quick_to_arcade_click'
  | 'arcade_to_quick_click';

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

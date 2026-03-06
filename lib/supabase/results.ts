import { isSupabaseConfigured, getSupabaseClient } from './client';
import type {
  AnalyticsEventPayload,
  ResultRecord,
  SessionRecord,
} from '@/lib/analytics/events';

async function withSupabase<T>(task: (supabase: NonNullable<ReturnType<typeof getSupabaseClient>>) => Promise<T>) {
  if (!isSupabaseConfigured) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  try {
    return await task(supabase);
  } catch {
    return null;
  }
}

export async function persistSessionStart(session: SessionRecord) {
  await withSupabase(async (supabase) => {
    await supabase.from('game_sessions' as any).insert({
      session_id: session.sessionId,
      anonymous_id: session.anonymousId,
      slug: session.slug,
      engine_kind: session.engineKind,
      engine_id: session.engineId || null,
      started_at: session.startedAt,
      status: session.status,
      utm_source: session.utm_source || null,
      utm_medium: session.utm_medium || null,
      utm_campaign: session.utm_campaign || null,
      utm_content: session.utm_content || null,
      referrer: session.referrer || null,
      initial_path: session.initialPath || null,
      experiments: session.experiments || [],
    } as any);
  });
}

export async function persistSessionComplete(session: SessionRecord) {
  await withSupabase(async (supabase) => {
    await (supabase as any)
      .from('game_sessions')
      .update({
        completed_at: session.completedAt || new Date().toISOString(),
        status: 'completed',
      })
      .eq('session_id', session.sessionId);
  });
}

export async function persistEvent(event: AnalyticsEventPayload) {
  await withSupabase(async (supabase) => {
    await supabase.from('game_events' as any).insert({
      session_id: event.sessionId,
      anonymous_id: event.anonymousId,
      event_name: event.event,
      slug: event.slug,
      engine_kind: event.engineKind,
      engine_id: event.engineId || null,
      step: event.step || null,
      result_id: event.resultId || null,
      cta_id: event.ctaId || null,
      metadata: event.metadata || {},
      experiments: event.experiments || [],
      created_at: event.createdAt,
    } as any);
  });
}

export async function persistResult(result: ResultRecord) {
  await withSupabase(async (supabase) => {
    await supabase.from('game_results' as any).insert({
      session_id: result.sessionId,
      anonymous_id: result.anonymousId,
      slug: result.slug,
      engine_kind: result.engineKind,
      engine_id: result.engineId || null,
      result_id: result.resultId,
      result_title: result.resultTitle,
      summary: result.summary,
      created_at: result.createdAt,
    } as any);
  });
}

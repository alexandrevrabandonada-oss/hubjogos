import { getSupabaseClient, isSupabaseConfigured } from './client';
import type { FeedbackRecord, FeedbackTriageStatus } from '@/lib/analytics/feedback';

type SupabaseClient = NonNullable<ReturnType<typeof getSupabaseClient>>;

interface FeedbackRow {
  feedback_id: string;
  session_id: string;
  anonymous_id: string;
  slug: string;
  engine_kind: string;
  rating: 'positive' | 'neutral' | 'negative';
  comment: string | null;
  triage_status: 'pending' | 'reviewed' | 'prioritario';
  triaged_at: string | null;
  created_at: string;
}

async function withSupabase<T>(task: (supabase: SupabaseClient) => Promise<T>) {
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

function mapRowToFeedback(row: FeedbackRow): FeedbackRecord {
  return {
    id: row.feedback_id,
    sessionId: row.session_id,
    anonymousId: row.anonymous_id,
    gameSlug: row.slug,
    engineKind: row.engine_kind,
    rating: row.rating,
    comment: row.comment || undefined,
    triageStatus: row.triage_status || 'pending',
    triagedAt: row.triaged_at || undefined,
    createdAt: row.created_at,
    source: 'supabase',
  };
}

export async function persistFeedbackRecordRemote(record: FeedbackRecord) {
  return withSupabase(async (supabase) => {
    const { error } = await supabase.from('feedback_records' as any).upsert(
      {
        feedback_id: record.id,
        session_id: record.sessionId,
        anonymous_id: record.anonymousId,
        slug: record.gameSlug,
        engine_kind: record.engineKind,
        rating: record.rating,
        comment: record.comment || null,
        triage_status: record.triageStatus || 'pending',
        triaged_at: record.triagedAt || null,
        created_at: record.createdAt,
      } as any,
      {
        onConflict: 'feedback_id',
      } as any,
    );

    if (error) {
      return null;
    }

    return true;
  });
}

export async function fetchFeedbackRecordsRemote(limit = 300): Promise<FeedbackRecord[] | null> {
  return withSupabase(async (supabase) => {
    const { data, error } = await supabase
      .from('feedback_records' as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return null;
    }

    return (data as FeedbackRow[]).map(mapRowToFeedback);
  });
}

export async function updateFeedbackTriageRemote(
  feedbackId: string,
  status: FeedbackTriageStatus,
  triagedAt?: string,
) {
  await withSupabase(async (supabase) => {
    await (supabase as any)
      .from('feedback_records')
      .update({
        triage_status: status,
        triaged_at: triagedAt || null,
      })
      .eq('feedback_id', feedbackId);
  });
}

/**
 * Tipos para feedback qualitativo expandido
 */

import {
  appendLocalItem,
  getLocalArray,
  replaceLocalArray,
  generateId,
} from '@/lib/storage/local-session';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import {
  fetchFeedbackRecordsRemote,
  persistFeedbackRecordRemote,
  updateFeedbackTriageRemote,
} from '@/lib/supabase/feedback';

export type FeedbackRating = 'positive' | 'neutral' | 'negative';
export type FeedbackTriageStatus = 'pending' | 'reviewed' | 'prioritario';
export type FeedbackDataSource = 'local' | 'supabase' | 'hybrid';

export interface FeedbackRecord {
  id: string;
  sessionId: string;
  anonymousId: string;
  gameSlug: string;
  engineKind: string;
  rating: FeedbackRating;
  comment?: string;
  createdAt: string;
  triageStatus?: FeedbackTriageStatus;
  triagedAt?: string;
  source?: FeedbackDataSource;
}

export interface FeedbackSummary {
  source: FeedbackDataSource;
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  withComments: number;
  byGame: Record<string, {
    positive: number;
    neutral: number;
    negative: number;
    withComments: number;
  }>;
  byEngine: Record<string, {
    positive: number;
    neutral: number;
    negative: number;
  }>;
  recentComments: Array<{
    id: string;
    gameSlug: string;
    engineKind: string;
    rating: FeedbackRating;
    comment: string;
    createdAt: string;
    triageStatus: FeedbackTriageStatus;
    source: FeedbackDataSource;
  }>;
}

/**
 * Coleta e agrega feedback qualitativo local
 */
export function collectFeedbackLocal(): FeedbackSummary {
  const feedbacks = getLocalArray<FeedbackRecord>('feedback').map((fb) => ({
    ...fb,
    triageStatus: fb.triageStatus || 'pending',
    source: 'local' as const,
  }));

  return summarizeFeedback(feedbacks, 'local');
}

function summarizeFeedback(feedbacks: FeedbackRecord[], source: FeedbackDataSource): FeedbackSummary {
  const normalized = feedbacks.map((fb) => ({
    ...fb,
    triageStatus: fb.triageStatus || 'pending',
    source: fb.source || source,
  }));

  const summary: FeedbackSummary = {
    source,
    total: normalized.length,
    positive: 0,
    neutral: 0,
    negative: 0,
    withComments: 0,
    byGame: {},
    byEngine: {},
    recentComments: [],
  };

  normalized.forEach((fb) => {
    // Contagem geral
    if (fb.rating === 'positive') summary.positive += 1;
    else if (fb.rating === 'neutral') summary.neutral += 1;
    else if (fb.rating === 'negative') summary.negative += 1;

    if (fb.comment) summary.withComments += 1;

    // Por jogo
    if (!summary.byGame[fb.gameSlug]) {
      summary.byGame[fb.gameSlug] = {
        positive: 0,
        neutral: 0,
        negative: 0,
        withComments: 0,
      };
    }
    if (fb.rating === 'positive') summary.byGame[fb.gameSlug].positive += 1;
    else if (fb.rating === 'neutral') summary.byGame[fb.gameSlug].neutral += 1;
    else if (fb.rating === 'negative') summary.byGame[fb.gameSlug].negative += 1;
    if (fb.comment) summary.byGame[fb.gameSlug].withComments += 1;

    // Por engine
    if (!summary.byEngine[fb.engineKind]) {
      summary.byEngine[fb.engineKind] = {
        positive: 0,
        neutral: 0,
        negative: 0,
      };
    }
    if (fb.rating === 'positive') summary.byEngine[fb.engineKind].positive += 1;
    else if (fb.rating === 'neutral') summary.byEngine[fb.engineKind].neutral += 1;
    else if (fb.rating === 'negative') summary.byEngine[fb.engineKind].negative += 1;
  });

  // Comentários recentes (últimos 50)
  summary.recentComments = normalized
    .filter((fb) => fb.comment && fb.comment.trim().length > 0)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 50)
    .map((fb) => ({
      id: fb.id,
      gameSlug: fb.gameSlug,
      engineKind: fb.engineKind,
      rating: fb.rating,
      comment: fb.comment!,
      createdAt: fb.createdAt,
      triageStatus: fb.triageStatus || 'pending',
      source: fb.source || source,
    }));

  return summary;
}

function mergeFeedbackRecords(local: FeedbackRecord[], remote: FeedbackRecord[]) {
  const byId = new Map<string, FeedbackRecord>();

  remote.forEach((item) => {
    byId.set(item.id, { ...item, source: 'supabase' });
  });

  local.forEach((item) => {
    if (byId.has(item.id)) {
      const remoteItem = byId.get(item.id)!;
      byId.set(item.id, {
        ...remoteItem,
        comment: remoteItem.comment || item.comment,
      });
      return;
    }

    byId.set(item.id, { ...item, source: 'local' });
  });

  return Array.from(byId.values());
}

export async function collectFeedback(): Promise<FeedbackSummary> {
  const local = getLocalArray<FeedbackRecord>('feedback').map((item) => ({
    ...item,
    triageStatus: item.triageStatus || 'pending',
    source: 'local' as const,
  }));

  if (!isSupabaseConfigured) {
    return summarizeFeedback(local, 'local');
  }

  const remote = await fetchFeedbackRecordsRemote(400);

  if (!remote) {
    return summarizeFeedback(local, 'local');
  }

  if (remote.length === 0) {
    return summarizeFeedback(local, 'local');
  }

  const merged = mergeFeedbackRecords(local, remote);
  const source: FeedbackDataSource = local.length > 0 ? 'hybrid' : 'supabase';

  return summarizeFeedback(merged, source);
}

interface RegisterFeedbackInput {
  gameSlug: string;
  engineKind: string;
  rating: FeedbackRating;
  comment?: string;
  sessionId: string;
  anonymousId: string;
}

export async function registerFeedback(input: RegisterFeedbackInput): Promise<FeedbackRecord> {
  const record: FeedbackRecord = {
    id: generateId('feedback'),
    sessionId: input.sessionId,
    anonymousId: input.anonymousId,
    gameSlug: input.gameSlug,
    engineKind: input.engineKind,
    rating: input.rating,
    comment: input.comment?.trim() || undefined,
    createdAt: new Date().toISOString(),
    triageStatus: 'pending',
    source: 'local',
  };

  appendLocalItem('feedback', record);
  const persisted = await persistFeedbackRecordRemote(record);

  if (persisted) {
    return {
      ...record,
      source: 'hybrid',
    };
  }

  return record;
}

export async function markFeedbackTriage(id: string, status: FeedbackTriageStatus) {
  const local = getLocalArray<FeedbackRecord>('feedback');
  const triagedAt = status === 'reviewed' ? new Date().toISOString() : undefined;

  const updated = local.map((item) => {
    if (item.id !== id) {
      return item;
    }
    return {
      ...item,
      triageStatus: status,
      triagedAt,
    };
  });

  replaceLocalArray('feedback', updated);
  await updateFeedbackTriageRemote(id, status, triagedAt);
}

import {
  appendLocalItem,
  getLocalArray,
  getOrCreateAnonymousIdentity,
  replaceLocalArray,
  generateId,
} from '@/lib/storage/local-session';
import type {
  AnalyticsEventPayload,
  AnalyticsEventName,
  ResultRecord,
  SessionRecord,
} from './events';
import {
  persistEvent,
  persistResult,
  persistSessionComplete,
  persistSessionStart,
} from '@/lib/supabase/results';

interface StartSessionInput {
  slug: string;
  engineKind: string;
  engineId?: string;
}

interface TrackInput {
  slug: string;
  engineKind: string;
  engineId?: string;
  event: AnalyticsEventName;
  step?: string;
  resultId?: string;
  ctaId?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

const activeSessions = new Map<string, string>();

function sessionMapKey(input: { slug: string; engineKind: string; engineId?: string }) {
  return `${input.slug}:${input.engineKind}:${input.engineId || 'no-engine'}`;
}

export async function startSession(input: StartSessionInput) {
  const anonymous = getOrCreateAnonymousIdentity();
  const sessionId = generateId('session');
  const startedAt = new Date().toISOString();

  const record: SessionRecord = {
    sessionId,
    anonymousId: anonymous.id,
    slug: input.slug,
    engineKind: input.engineKind,
    engineId: input.engineId,
    startedAt,
    status: 'started',
  };

  activeSessions.set(sessionMapKey(input), sessionId);
  appendLocalItem('sessions', record);
  await persistSessionStart(record);

  return record;
}

async function ensureSession(input: StartSessionInput) {
  const key = sessionMapKey(input);
  const activeSessionId = activeSessions.get(key);
  if (activeSessionId) {
    const sessions = getLocalArray<SessionRecord>('sessions');
    const session = sessions.find((item) => item.sessionId === activeSessionId);
    if (session) {
      return session;
    }
  }

  return startSession(input);
}

export async function trackEvent(input: TrackInput) {
  const session = await ensureSession(input);

  const event: AnalyticsEventPayload = {
    sessionId: session.sessionId,
    anonymousId: session.anonymousId,
    event: input.event,
    slug: input.slug,
    engineKind: input.engineKind,
    engineId: input.engineId,
    step: input.step,
    resultId: input.resultId,
    ctaId: input.ctaId,
    metadata: input.metadata,
    createdAt: new Date().toISOString(),
  };

  appendLocalItem('events', event);
  await persistEvent(event);

  return event;
}

interface RegisterResultInput {
  slug: string;
  engineKind: string;
  engineId?: string;
  resultId: string;
  resultTitle: string;
  summary: string;
}

export async function registerResult(input: RegisterResultInput) {
  const session = await ensureSession(input);

  const result: ResultRecord = {
    sessionId: session.sessionId,
    anonymousId: session.anonymousId,
    slug: input.slug,
    engineKind: input.engineKind,
    engineId: input.engineId,
    resultId: input.resultId,
    resultTitle: input.resultTitle,
    summary: input.summary,
    createdAt: new Date().toISOString(),
  };

  appendLocalItem('results', result);
  await persistResult(result);

  await completeSession({
    slug: input.slug,
    engineKind: input.engineKind,
    engineId: input.engineId,
  });

  return result;
}

interface CompleteSessionInput {
  slug: string;
  engineKind: string;
  engineId?: string;
}

export async function completeSession(input: CompleteSessionInput) {
  const key = sessionMapKey(input);
  const activeSessionId = activeSessions.get(key);

  if (!activeSessionId) {
    return;
  }

  const sessions = getLocalArray<SessionRecord>('sessions');
  const updated = sessions.map((session) => {
    if (session.sessionId !== activeSessionId) {
      return session;
    }

    return {
      ...session,
      completedAt: session.completedAt || new Date().toISOString(),
      status: 'completed' as const,
    };
  });

  const session = updated.find((item) => item.sessionId === activeSessionId);
  replaceLocalArray('sessions', updated);

  if (session) {
    await persistSessionComplete(session);
  }

  activeSessions.delete(key);
}

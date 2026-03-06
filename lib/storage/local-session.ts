export interface AnonymousIdentity {
  id: string;
  createdAt: string;
}

function canUseBrowserStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function safeRead<T>(key: string, fallback: T): T {
  if (!canUseBrowserStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T) {
  if (!canUseBrowserStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // noop
  }
}

export function generateId(prefix: string) {
  const token =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

  return `${prefix}-${token}`;
}

const LOCAL_KEYS = {
  identity: 'hubjogos:anonymous-identity',
  sessions: 'hubjogos:session-records',
  results: 'hubjogos:result-records',
  events: 'hubjogos:event-records',
  feedback: 'hubjogos:feedback-records',
} as const;

export function getOrCreateAnonymousIdentity(): AnonymousIdentity {
  const existing = safeRead<AnonymousIdentity | null>(LOCAL_KEYS.identity, null);

  if (existing && existing.id) {
    return existing;
  }

  const nextIdentity: AnonymousIdentity = {
    id: generateId('anon'),
    createdAt: new Date().toISOString(),
  };

  safeWrite(LOCAL_KEYS.identity, nextIdentity);
  return nextIdentity;
}

export function getLocalArray<T>(key: keyof typeof LOCAL_KEYS): T[] {
  return safeRead<T[]>(LOCAL_KEYS[key], []);
}

export function appendLocalItem<T>(key: keyof typeof LOCAL_KEYS, item: T) {
  const all = getLocalArray<T>(key);
  all.push(item);
  safeWrite(LOCAL_KEYS[key], all);
}

export function replaceLocalArray<T>(key: keyof typeof LOCAL_KEYS, next: T[]) {
  safeWrite(LOCAL_KEYS[key], next);
}

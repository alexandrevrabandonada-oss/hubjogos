import { resolveVariant } from './resolve';

const SESSION_STORAGE_KEY = 'hjpc_exp_session_id';

function createSessionId() {
  return `exp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getExperimentSessionId() {
  if (typeof window === 'undefined') {
    return 'server_fallback';
  }

  const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const generated = createSessionId();
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, generated);
  return generated;
}

export function resolveExperimentVariantClient(experimentKey: string, fallbackVariant: string) {
  const sessionId = getExperimentSessionId();
  const resolved = resolveVariant(experimentKey, sessionId);
  return resolved?.variantKey || fallbackVariant;
}

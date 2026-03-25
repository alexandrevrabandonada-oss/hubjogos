// Save/Checkpoint System
// T72 — Game Runtime Contract

import { SavePayload } from './types';

const SAVE_PREFIX = 'hub_runtime_save_';

export function saveToLocal(gameSlug: string, payload: SavePayload): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = `${SAVE_PREFIX}${gameSlug}`;
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Silently fail - save should never break gameplay
  }
}

export function loadFromLocal(gameSlug: string): SavePayload | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const key = `${SAVE_PREFIX}${gameSlug}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearFromLocal(gameSlug: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = `${SAVE_PREFIX}${gameSlug}`;
    localStorage.removeItem(key);
  } catch {
    // Silently fail
  }
}

export function listAllSaves(): { gameSlug: string; payload: SavePayload }[] {
  if (typeof window === 'undefined') return [];
  
  const saves: { gameSlug: string; payload: SavePayload }[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(SAVE_PREFIX)) {
      const gameSlug = key.replace(SAVE_PREFIX, '');
      const payload = loadFromLocal(gameSlug);
      if (payload) {
        saves.push({ gameSlug, payload });
      }
    }
  }
  
  return saves.sort((a, b) => b.payload.timestamp - a.payload.timestamp);
}

export function clearAllSaves(): void {
  if (typeof window === 'undefined') return;
  
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(SAVE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  });
}

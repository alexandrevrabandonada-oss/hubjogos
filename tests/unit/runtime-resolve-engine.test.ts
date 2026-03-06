import { describe, expect, it } from 'vitest';
import { games } from '@/lib/games/catalog';
import { resolveGameEngine } from '@/lib/games/runtime/resolve-engine';

describe('resolveGameEngine', () => {
  it('resolve corretamente as 4 engines reais do catálogo', () => {
    const slugs = ['voto-consciente', 'transporte-urgente', 'cidade-real', 'abandonado'];

    const resolvedTypes = slugs.map((slug) => {
      const game = games.find((item) => item.slug === slug);
      expect(game).toBeTruthy();
      return resolveGameEngine(game!);
    });

    expect(resolvedTypes.map((item) => item.status)).toEqual([
      'resolved',
      'resolved',
      'resolved',
      'resolved',
    ]);
    expect(resolvedTypes.map((item) => item.engineType)).toEqual([
      'quiz',
      'branching_story',
      'simulation',
      'map',
    ]);
  });

  it('entra em fallback quando engineId está ausente', () => {
    const game = {
      ...games.find((item) => item.slug === 'voto-consciente')!,
      engineId: undefined,
    };

    const resolved = resolveGameEngine(game);

    expect(resolved.status).toBe('fallback');
    expect(resolved.engineType).toBe('shell');
  });
});

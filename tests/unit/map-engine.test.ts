import { describe, expect, it } from 'vitest';
import { abandonadoMap } from '@/lib/games/map/data/abandonado';
import {
  canComplete,
  completeExploration,
  createInitialMapState,
  visitPoint,
} from '@/lib/games/map/engine';
import { calculateMapResult } from '@/lib/games/map/types';

describe('map engine', () => {
  it('visita pontos sem duplicar histórico', () => {
    const initial = createInitialMapState(abandonadoMap);
    const once = visitPoint(initial, 'hospital-central');
    const twice = visitPoint(once, 'hospital-central');

    expect(once.visitedPoints).toHaveLength(1);
    expect(twice.visitedPoints).toHaveLength(1);
    expect(twice.points['hospital-central'].discovered).toBe(true);
  });

  it('classifica padrão sistêmico quando não há padrão dominante específico', () => {
    const result = calculateMapResult(abandonadoMap, [
      'mercado-municipal',
      'casarao-colonial',
      'hospital-central',
      'escola-popular',
      'fabrica-textil',
    ]);

    expect(result.id).toBe('abandono-sistemico');
  });

  it('permite concluir após mínimo de pontos e produz resultado final', () => {
    let state = createInitialMapState(abandonadoMap);
    ['hospital-central', 'escola-popular', 'fabrica-textil', 'posto-saude', 'cooperativa-costura'].forEach((id) => {
      state = visitPoint(state, id);
    });

    expect(canComplete(state, abandonadoMap.minPointsToComplete)).toBe(true);

    const done = completeExploration(state, abandonadoMap);

    expect(done.explorationComplete).toBe(true);
    expect(done.finalResult).toBeTruthy();
  });
});

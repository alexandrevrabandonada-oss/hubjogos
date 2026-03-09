import { beforeEach, describe, expect, it } from 'vitest';
import { cooperativaNaPressaoLogic } from '@/lib/games/arcade/cooperativa-na-pressao';
import type { ArcadeInputSnapshot, ArcadeRuntimeContext } from '@/lib/games/arcade/types';

describe('Cooperativa na Pressao - Game Logic (T42 Slice)', () => {
  let initialState: ReturnType<typeof cooperativaNaPressaoLogic.createInitialState>;

  const mockContext: ArcadeRuntimeContext = {
    dtMs: 100,
    elapsedMs: 0,
    width: 640,
    height: 960,
  };

  function createInput(overrides: Partial<ArcadeInputSnapshot> = {}): ArcadeInputSnapshot {
    return {
      moveLeft: false,
      moveRight: false,
      moveLeftPressed: false,
      moveRightPressed: false,
      actionOnePressed: false,
      actionTwoPressed: false,
      actionThreePressed: false,
      specialPressed: false,
      pausePressed: false,
      restartPressed: false,
      pointerLane: null,
      lastInputKind: null,
      ...overrides,
    };
  }

  beforeEach(() => {
    initialState = cooperativaNaPressaoLogic.createInitialState({ width: 640, height: 960 });
  });

  it('inicializa com 3 estacoes e fase de abertura', () => {
    expect(initialState.stations).toHaveLength(3);
    expect(initialState.currentPhase).toBe('abertura');
  });

  it('acao Organizar reduz backlog da estacao selecionada', () => {
    let state = initialState;
    state.selectedStation = 0;
    state.stations[0].backlog = 70;

    const result = cooperativaNaPressaoLogic.update(state, createInput({ actionOnePressed: true }), mockContext);
    expect(result.state.stations[0].backlog).toBeLessThan(70);
  });

  it('acao Cuidar reduz exaustao e aumenta solidariedade', () => {
    let state = initialState;
    state.stations.forEach((station) => {
      station.burnout = 60;
    });
    const solidarityBefore = state.solidariedade;

    const result = cooperativaNaPressaoLogic.update(state, createInput({ actionThreePressed: true }), mockContext);
    const burnoutAfter = result.state.stations.reduce((sum, station) => sum + station.burnout, 0);
    const burnoutBefore = 60 * state.stations.length;

    expect(burnoutAfter).toBeLessThan(burnoutBefore);
    expect(result.state.solidariedade).toBeGreaterThanOrEqual(solidarityBefore);
  });

  it('deve chegar a fase de pressao apos tempo suficiente', () => {
    let state = initialState;
    for (let i = 0; i < 620; i += 1) {
      const result = cooperativaNaPressaoLogic.update(state, createInput(), {
        ...mockContext,
        elapsedMs: state.elapsedMs + 100,
      });
      state = result.state;
    }

    expect(['pressao', 'fechamento']).toContain(state.currentPhase);
  });

  it('gera resultado coerente ao finalizar', () => {
    const result = cooperativaNaPressaoLogic.buildResult(initialState);
    expect(result.resultId).toContain('arcade-cooperativa-resultado');
    expect(result.stats.collectiveRate).toBeGreaterThanOrEqual(0);
    expect(result.stats.collectiveRate).toBeLessThanOrEqual(100);
  });
});

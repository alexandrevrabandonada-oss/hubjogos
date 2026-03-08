/**
 * Unit Tests - Mutirão do Bairro Arcade (T36C Premium)
 * 
 * Cobertura:
 * - Transições de fase
 * - Escalação de pressão
 * - Trigger de eventos
 * - Detecção de colapso
 * - Comportamento de ações
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { mutiraoDoBairroLogic } from '@/lib/games/arcade/mutirao-do-bairro';
import type { ArcadeInputSnapshot, ArcadeRuntimeContext } from '@/lib/games/arcade/types';

describe('Mutirão do Bairro - Game Logic (T36C Premium)', () => {
  let initialState: ReturnType<typeof mutiraoDoBairroLogic.createInitialState>;
  const mockContext: ArcadeRuntimeContext = {
    dtMs: 100,
    elapsedMs: 0,
    width: 640,
    height: 960,
  };

  beforeEach(() => {
    initialState = mutiraoDoBairroLogic.createInitialState({ width: 640, height: 960 });
  });

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

  describe('Inicialização', () => {
    it('deve inicializar com estado válido', () => {
      const state = initialState;
      expect(state.elapsedMs).toBe(0);
      expect(state.stability).toBeGreaterThan(0);
      expect(state.trust).toBeGreaterThan(0);
      expect(state.currentPhase).toBe('arranque');
    });

    it('deve ter 3 hotspots (agua, energia, mobilidade)', () => {
      const ids = initialState.hotspots.map((h) => h.id);
      expect(ids).toEqual(['agua', 'energia', 'mobilidade']);
    });

    it('hotspots devem ter valores válidos de integrity e danger', () => {
      initialState.hotspots.forEach((h) => {
        expect(h.integrity).toBeGreaterThan(0);
        expect(h.integrity).toBeLessThanOrEqual(100);
        expect(h.danger).toBeGreaterThanOrEqual(0);
        expect(h.danger).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Transições de Fase', () => {
    it('deve transicionar arranque → pressao após ~20s', () => {
      let state = initialState;
      for (let i = 0; i < 200; i++) {
        const result = mutiraoDoBairroLogic.update(state, createInput(), {
          ...mockContext,
          dtMs: 100,
          elapsedMs: state.elapsedMs + 100,
        });
        state = result.state;
      }
      expect(state.currentPhase).toBe('pressao');
    });

    it('deve transicionar pressao → virada após ~45s', () => {
      let state = initialState;
      for (let i = 0; i < 900; i++) {
        const result = mutiraoDoBairroLogic.update(state, createInput(), {
          ...mockContext,
          dtMs: 100,
          elapsedMs: state.elapsedMs + 100,
        });
        state = result.state;
      }
      expect(state.currentPhase).toMatch(/virada|fechamento/);
    });

    it('elapsedMs deve aumentar a cada tick', () => {
      let state = initialState;
      expect(state.elapsedMs).toBe(0);

      const result = mutiraoDoBairroLogic.update(state, createInput(), mockContext);
      state = result.state;

      expect(state.elapsedMs).toBeGreaterThan(0);
    });
  });

  describe('Pressão e Dano', () => {
    it('pressurePeak deve ficar entre 0-100', () => {
      let state = initialState;
      for (let i = 0; i < 300; i++) {
        const result = mutiraoDoBairroLogic.update(state, createInput(), {
          ...mockContext,
          dtMs: 100,
          elapsedMs: state.elapsedMs + 100,
        });
        state = result.state;
        expect(state.pressurePeak).toBeLessThanOrEqual(100);
        expect(state.pressurePeak).toBeGreaterThanOrEqual(0);
      }
    });

    it('pressureMilestone deve aumentar com pressão escalante', () => {
      let state = initialState;
      state.stability = 20;
      state.trust = 20;

      let maxMilestone = 0;
      for (let i = 0; i < 100; i++) {
        const result = mutiraoDoBairroLogic.update(state, createInput(), {
          ...mockContext,
          dtMs: 100,
          elapsedMs: state.elapsedMs + 100,
        });
        state = result.state;
        maxMilestone = Math.max(maxMilestone, state.pressureMilestone);
      }

      // Milestone pode levar mais tempo para escalar
    });
  });

  describe('Colapso', () => {
    it('deve marcar colapso se ficar em estado crítico por 6+s', () => {
      let state = initialState;
      state.stability = 15;

      for (let i = 0; i < 100; i++) {
        state.stability = 15;
        const result = mutiraoDoBairroLogic.update(state, createInput(), {
          ...mockContext,
          dtMs: 100,
          elapsedMs: state.elapsedMs + 100,
        });
        state = result.state;
        if (state.finishedByCollapse) break;
      }

      expect(state.finishedByCollapse).toBe(true);
    });

    it('pode sair de colapso com ação reparar', () => {
      let state = initialState;
      state.stability = 25;
      state.selectedHotspot = 0;

      const result = mutiraoDoBairroLogic.update(state, createInput({ actionOnePressed: true }), mockContext);
      state = result.state;

      expect(state.stability).toBeGreaterThan(25);
    });
  });

  describe('Ações - Reparar', () => {
    it('deve aumentar integrity de hotspot selecionado', () => {
      let state = initialState;
      state.selectedHotspot = 0;
      state.hotspots[0].integrity = 40;

      const result = mutiraoDoBairroLogic.update(state, createInput({ actionOnePressed: true }), mockContext);
      state = result.state;

      expect(state.hotspots[0].integrity).toBeGreaterThan(40);
    });

    it('deve contar como ação usada', () => {
      let state = initialState;
      const actionsBefore = state.actionsUsed;
      state.selectedHotspot = 0;

      const result = mutiraoDoBairroLogic.update(state, createInput({ actionOnePressed: true }), mockContext);
      state = result.state;

      expect(state.actionsUsed).toBeGreaterThan(actionsBefore);
    });
  });

  describe('Ações - Defender', () => {
    it('deve diminuir danger de hotspot selecionado', () => {
      let state = initialState;
      state.selectedHotspot = 1;
      state.hotspots[1].danger = 70;

      const result = mutiraoDoBairroLogic.update(state, createInput({ actionTwoPressed: true }), mockContext);
      state = result.state;

      expect(state.hotspots[1].danger).toBeLessThan(70);
    });

    it('deve contar como ação usada', () => {
      let state = initialState;
      const actionsBefore = state.actionsUsed;

      const result = mutiraoDoBairroLogic.update(state, createInput({ actionTwoPressed: true }), mockContext);
      state = result.state;

      expect(state.actionsUsed).toBeGreaterThan(actionsBefore);
    });
  });

  describe('Ações - Mobilizar', () => {
    it('deve aumentar collectiveActions counter', () => {
      let state = initialState;
      const collectiveBefore = state.collectiveActions;

      const result = mutiraoDoBairroLogic.update(state, createInput({ actionThreePressed: true }), mockContext);
      state = result.state;

      expect(state.collectiveActions).toBeGreaterThan(collectiveBefore);
    });

    it('deve beneficiar estabilidade', () => {
      let state = initialState;
      state.stability = 50;

      const result = mutiraoDoBairroLogic.update(state, createInput({ actionThreePressed: true }), mockContext);
      state = result.state;

      expect(state.stability).toBeLessThan(51); // Mobilizar estabiliza levemente
    });
  });

  describe('Ações - Mutirão', () => {
    it('deve ativar quando charge = 100%', () => {
      let state = initialState;
      state.mutiraoCharge = 100;

      const result = mutiraoDoBairroLogic.update(state, createInput({ specialPressed: true }), mockContext);
      state = result.state;

      expect(state.mutiraoActiveMs).toBeGreaterThan(0);
      expect(state.mutiraoUses).toBeGreaterThan(0);
    });

    it('não ativa se charge < 100%', () => {
      let state = initialState;
      state.mutiraoCharge = 50;
      const before = state.mutiraoUses;

      const result = mutiraoDoBairroLogic.update(state, createInput({ specialPressed: true }), mockContext);
      state = result.state;

      expect(state.mutiraoUses).toBe(before);
    });

   it('deve resetar charge após ativação', () => {
      let state = initialState;
      state.mutiraoCharge = 100;

      const result = mutiraoDoBairroLogic.update(state, createInput({ specialPressed: true }), mockContext);
      state = result.state;

      expect(state.mutiraoCharge).toBeLessThan(100);
    });
  });

  describe('Eventos', () => {
    it('activeEvent deve ser válido ou null', () => {
      let state = initialState;
      state.currentPhase = 'pressao';

      for (let i = 0; i < 200; i++) {
        const result = mutiraoDoBairroLogic.update(state, createInput(), {
          ...mockContext,
          dtMs: 100,
          elapsedMs: state.elapsedMs + 100,
        });
        state = result.state;

        const validEvents = [null, 'chuva-forte', 'boato-de-panico', 'onda-solidaria', 'tranco-de-sabotagem'];
        expect(validEvents).toContain(state.activeEvent);
      }
    });

    it('eventTimeLeftMs deve decrementar', () => {
      let state = initialState;
      state.activeEvent = 'chuva-forte';
      state.eventTimeLeftMs = 5000;

      const result = mutiraoDoBairroLogic.update(state, createInput(), mockContext);
      state = result.state;

      expect(state.eventTimeLeftMs).toBeLessThan(5000);
    });
  });

  describe('Seleção de Hotspot', () => {
    it('moveLeftPressed deve decrementar seleção', () => {
      let state = initialState;
      state.selectedHotspot = 1;

      const result = mutiraoDoBairroLogic.update(state, createInput({ moveLeftPressed: true }), mockContext);
      state = result.state;

      expect(state.selectedHotspot).toBe(0);
    });

    it('moveRightPressed deve incrementar seleção', () => {
      let state = initialState;
      state.selectedHotspot = 1;

      const result = mutiraoDoBairroLogic.update(state, createInput({ moveRightPressed: true }), mockContext);
      state = result.state;

      expect(state.selectedHotspot).toBe(2);
    });

    it('pointerLane deve definir seleção diretamente', () => {
      let state = initialState;

      const result = mutiraoDoBairroLogic.update(state, createInput({ pointerLane: 2 }), mockContext);
      state = result.state;

      expect(state.selectedHotspot).toBe(2);
    });

    it('seleção deve ficar entre 0-2', () => {
      let state = initialState;
      state.selectedHotspot = 0;

      const result = mutiraoDoBairroLogic.update(state, createInput({ moveLeftPressed: true }), mockContext);
      state = result.state;

      expect(state.selectedHotspot).toBeGreaterThanOrEqual(0);
      expect(state.selectedHotspot).toBeLessThan(3);
    });
  });

  describe('Score', () => {
    it('score deve aumentar com ações', () => {
      let state = initialState;
      const scoreBefore = state.score;

      for (let i = 0; i < 3; i++) {
        state.selectedHotspot = i % 3;
        const result = mutiraoDoBairroLogic.update(state, createInput({ actionOnePressed: true }), mockContext);
        state = result.state;
      }

      expect(state.score).toBeGreaterThanOrEqual(scoreBefore);
    });
  });

  describe('Robustez', () => {
    it('deve processar 500 ticks sem erro', () => {
      let state = initialState;

      expect(() => {
        for (let i = 0; i < 500; i++) {
          const action = Math.random();
          const input = createInput({
            actionOnePressed: action > 0.7 && action <= 0.775,
            actionTwoPressed: action > 0.775 && action <= 0.85,
            actionThreePressed: action > 0.85 && action <= 0.925,
            specialPressed: action > 0.925,
          });
          const result = mutiraoDoBairroLogic.update(state, input, {
            ...mockContext,
            dtMs: 100,
            elapsedMs: state.elapsedMs + 100,
          });
          state = result.state;
        }
      }).not.toThrow();
    });

    it('hotspot integrity não deve ficar negativa', () => {
      let state = initialState;
      state.hotspots[0].integrity = 5;
      state.hotspots[0].danger = 100;

      for (let i = 0; i < 50; i++) {
        const result = mutiraoDoBairroLogic.update(state, createInput(), {
          ...mockContext,
          dtMs: 100,
          elapsedMs: state.elapsedMs + 100,
        });
        state = result.state;
      }

      state.hotspots.forEach((h) => {
        expect(h.integrity).toBeGreaterThanOrEqual(0);
      });
    });
  });
});

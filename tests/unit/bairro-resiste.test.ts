import { describe, it, expect } from 'vitest';
import { getBairroPhase } from '@/components/games/arcade/BairroResisteArcadeGame';

describe('Bairro Resiste - Lógica de Jogo', () => {
  it('deve calcular a fase correta de acordo com o tempo', () => {
    // Fase 1: 0 a 30s
    expect(getBairroPhase(0)).toBe(1);
    expect(getBairroPhase(29000)).toBe(1);
    
    // Fase 2: 30s a 60s
    expect(getBairroPhase(30000)).toBe(2);
    expect(getBairroPhase(45000)).toBe(2);
    expect(getBairroPhase(59000)).toBe(2);
    
    // Fase 3: > 60s
    expect(getBairroPhase(60000)).toBe(3);
    expect(getBairroPhase(80000)).toBe(3);
    expect(getBairroPhase(90000)).toBe(3);
  });
});

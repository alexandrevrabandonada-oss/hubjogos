import { describe, expect, it } from 'vitest';
import { calculateQuizResult } from '@/lib/games/quiz/engine';
import { votoConscienteQuiz } from '@/lib/games/quiz/data/voto-consciente';

describe('calculateQuizResult', () => {
  it('retorna perfil dominante por eixo quando respostas favorecem services', () => {
    const selected = ['q1-a', 'q2-c', 'q3-a', 'q4-a', 'q5-a', 'q6-a'];

    const result = calculateQuizResult(votoConscienteQuiz, selected);

    expect(result.profile.axis).toBe('services');
    expect(result.answered).toBe(6);
    expect(result.summary).toContain(result.profile.title);
  });

  it('ignora respostas inválidas e mantém fallback seguro', () => {
    const selected = ['invalido', '', 'q3-z'];

    const result = calculateQuizResult(votoConscienteQuiz, selected);

    expect(result.answered).toBe(2);
    expect(result.profile).toBeTruthy();
    expect(Object.values(result.scores).every((value) => Number.isFinite(value))).toBe(true);
  });
});

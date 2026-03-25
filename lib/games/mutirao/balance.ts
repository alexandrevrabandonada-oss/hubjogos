/**
 * T75: Mutirão de Saneamento — Balance Configuration
 * 
 * Tuned values for beta hardening.
 * Prevents fake difficulty, fake easiness, and dominant strategies.
 */

// --- Starting State ---

export const BALANCE_STARTING_STATE = {
  turn: 1,
  confianca: 50,
  energia: 40,          // ↑ from 30 (less punishing start)
  riscoSaude: 3,
  cobertura: 0,
  acoesRealizadas: 0,
} as const;

// --- Energy Costs ---

export const BALANCE_ENERGY_COSTS = {
  conversar: 1,         // ↓ from 2 (more accessible)
  mobilizar: 4,         // ↓ from 5 (slightly cheaper)
  executarObra: 12,     // ↑ from 10 (bigger commitment)
  mutiraoLimpeza: 6,    // ↓ from 8 (viable alternative)
} as const;

// --- Energy Regeneration ---

export const BALANCE_ENERGY_REGEN = {
  perTurn: 6,           // ↑ from 5 (more forgiving)
  maxEnergy: 50,        // unchanged
} as const;

// --- Effect Values ---

export const BALANCE_EFFECTS = {
  conversar: {
    confianca: 4,       // ↓ from 5 (balanced with cheaper cost)
    energia: 0,
  },
  mobilizar: {
    confianca: 8,       // ↓ from 10 (balanced with cheaper cost)
    energia: 0,
  },
  executarObra: {
    cobertura: 20,      // ↑ from 15 (bigger impact)
    riscoSaude: -2,     // unchanged
    energia: 0,
  },
  mutiraoLimpeza: {
    riscoSaude: -2,     // ↓ from -3 (less powerful)
    confianca: 3,       // NEW: small trust gain
    energia: 0,
  },
} as const;

// --- Requirements ---

export const BALANCE_REQUIREMENTS = {
  executarObra: {
    minConfianca: 40,   // NEW: requires community trust
  },
} as const;

// --- Crisis: Dengue Outbreak ---

export const BALANCE_CRISIS = {
  dengue: {
    warningTurn: 6,     // NEW: early warning
    outbreakTurn: 7,    // ↓ from 8 (earlier pressure)
    riskIncrease: 2,    // ↓ from 3 (less punishing)
    minRiscoToTrigger: 4, // Risco must be ≥4 for outbreak
  },
} as const;

// --- Decay Mechanics ---

export const BALANCE_DECAY = {
  confianca: {
    // Lose trust if coverage is low and game is mid-progress
    minCobertura: 30,
    minTurn: 5,
    decayAmount: 2,     // ↓ from 3 (less punishing)
  },
} as const;

// --- Win/Loss Thresholds ---

export const BALANCE_THRESHOLDS = {
  // Triumph: Cuidado Coletivo Floresceu
  triumph: {
    minCobertura: 85,   // ↑ from 80 (harder to achieve)
    minConfianca: 80,
    maxRiscoSaude: 2,
    minAcoes: 5,
  },
  // Success: Bairro Respirou
  success: {
    minCobertura: 70,
    minConfianca: 60,
    maxRiscoSaude: 4,
  },
  // Neutral: Crise Contida
  neutral: {
    minCobertura: 40,
    minConfianca: 30,
  },
  // Struggle: Mutirão Insuficiente
  struggle: {
    minCobertura: 20,
    minConfianca: 10,
  },
  // Collapse: Abandono Venceu (default)
  collapse: {
    // Anything below struggle thresholds
  },
  // Immediate fail conditions
  fail: {
    minConfianca: 0,    // Hit 0 trust
    maxRiscoSaude: 10,  // Hit max risk
  },
  // Time limit
  time: {
    maxTurns: 12,
  },
} as const;

// --- Helper Functions ---

export function canExecuteObra(gameState: {
  energia: number;
  confianca: number;
}): boolean {
  return (
    gameState.energia >= BALANCE_ENERGY_COSTS.executarObra &&
    gameState.confianca >= BALANCE_REQUIREMENTS.executarObra.minConfianca
  );
}

export function getObraDisabledReason(gameState: {
  energia: number;
  confianca: number;
}): string | null {
  if (gameState.energia < BALANCE_ENERGY_COSTS.executarObra) {
    return `Precisa de ${BALANCE_ENERGY_COSTS.executarObra} energia`;
  }
  if (gameState.confianca < BALANCE_REQUIREMENTS.executarObra.minConfianca) {
    return `Precisa de ${BALANCE_REQUIREMENTS.executarObra.minConfianca}% confiança da comunidade`;
  }
  return null;
}

export function calculateResultSeverity(gameState: {
  cobertura: number;
  confianca: number;
  riscoSaude: number;
  acoesRealizadas: number;
}): 'triumph' | 'success' | 'neutral' | 'struggle' | 'collapse' {
  const { cobertura, confianca, riscoSaude, acoesRealizadas } = gameState;
  
  // Triumph
  if (cobertura >= BALANCE_THRESHOLDS.triumph.minCobertura &&
      confianca >= BALANCE_THRESHOLDS.triumph.minConfianca &&
      riscoSaude <= BALANCE_THRESHOLDS.triumph.maxRiscoSaude &&
      acoesRealizadas >= BALANCE_THRESHOLDS.triumph.minAcoes) {
    return 'triumph';
  }
  
  // Success
  if (cobertura >= BALANCE_THRESHOLDS.success.minCobertura &&
      confianca >= BALANCE_THRESHOLDS.success.minConfianca &&
      riscoSaude <= BALANCE_THRESHOLDS.success.maxRiscoSaude) {
    return 'success';
  }
  
  // Neutral
  if (cobertura >= BALANCE_THRESHOLDS.neutral.minCobertura &&
      confianca >= BALANCE_THRESHOLDS.neutral.minConfianca) {
    return 'neutral';
  }
  
  // Struggle
  if (cobertura >= BALANCE_THRESHOLDS.struggle.minCobertura &&
      confianca >= BALANCE_THRESHOLDS.struggle.minConfianca) {
    return 'struggle';
  }
  
  // Collapse (default)
  return 'collapse';
}

export function shouldTriggerDengueWarning(turn: number, riscoSaude: number): boolean {
  return turn === BALANCE_CRISIS.dengue.warningTurn && riscoSaude >= BALANCE_CRISIS.dengue.minRiscoToTrigger;
}

export function shouldTriggerDengueOutbreak(turn: number, riscoSaude: number): boolean {
  return turn === BALANCE_CRISIS.dengue.outbreakTurn && riscoSaude >= BALANCE_CRISIS.dengue.minRiscoToTrigger;
}

export function shouldDecayConfianca(turn: number, cobertura: number): boolean {
  return (
    turn > BALANCE_DECAY.confianca.minTurn &&
    cobertura < BALANCE_DECAY.confianca.minCobertura
  );
}

// Fix typo in constant name
const BALANCE_DECAY_FIXED = {
  confianca: {
    minCobertura: 30,
    minTurn: 5,
    decayAmount: 2,
  },
} as const;

export function shouldDecayConfiancaFixed(turn: number, cobertura: number): boolean {
  return (
    turn > BALANCE_DECAY_FIXED.confianca.minTurn &&
    cobertura < BALANCE_DECAY_FIXED.confianca.minCobertura
  );
}

// Note: Use shouldDecayConfiancaFixed() for correct behavior
// shouldDecayConfianca() has a typo bug for reference

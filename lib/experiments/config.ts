/**
 * Configuração operacional de experimentos
 * Permite override via env sem tocar no código
 */

import { experiments as baseRegistry } from './registry';
import type { ExperimentDefinition } from './types';

/**
 * Parse override de experimentos via env
 * Formato: EXPERIMENTS_OVERRIDE="beta-banner-copy:false,outcome-cta-style:true"
 */
function parseExperimentOverrides(): Record<string, boolean> {
  const overrideStr = process.env.EXPERIMENTS_OVERRIDE || process.env.NEXT_PUBLIC_EXPERIMENTS_OVERRIDE;
  if (!overrideStr) {
    return {};
  }

  const overrides: Record<string, boolean> = {};
  const pairs = overrideStr.split(',').map((s) => s.trim());

  for (const pair of pairs) {
    const [key, value] = pair.split(':').map((s) => s.trim());
    if (key && (value === 'true' || value === 'false')) {
      overrides[key] = value === 'true';
    }
  }

  return overrides;
}

/**
 * Obtém registro de experimentos com overrides aplicados
 */
export function getActiveExperimentsRegistry(): Record<string, ExperimentDefinition> {
  const overrides = parseExperimentOverrides();
  const merged: Record<string, ExperimentDefinition> = {};

  for (const [key, exp] of Object.entries(baseRegistry)) {
    merged[key] = {
      ...exp,
      enabled: key in overrides ? overrides[key] : exp.enabled,
    };
  }

  return merged;
}

/**
 * Lista todos experimentos com status
 */
export function listAllExperiments(): Array<ExperimentDefinition & { overridden: boolean }> {
  const overrides = parseExperimentOverrides();
  const registry = getActiveExperimentsRegistry();

  return Object.values(registry).map((exp) => ({
    ...exp,
    overridden: exp.key in overrides,
  }));
}

/**
 * Lista apenas experimentos ativos (com override aplicado)
 */
export function getActiveExperiments(): ExperimentDefinition[] {
  return Object.values(getActiveExperimentsRegistry()).filter((exp) => exp.enabled);
}

/**
 * Obtém definição de experimento (com override aplicado)
 */
export function getExperiment(key: string): ExperimentDefinition | null {
  const registry = getActiveExperimentsRegistry();
  return registry[key] || null;
}

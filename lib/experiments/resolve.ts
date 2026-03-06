/**
 * Resolução de variantes de experimentos
 * Garante estabilidade por sessão usando hash determinístico
 */

import type { ResolvedVariant } from './types';
import { getExperiment } from './config';

/**
 * Hash simples e determinístico para distribuição de variantes
 * Baseado em DJB2 hash algorithm
 */
function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
  }
  return Math.abs(hash);
}

/**
 * Resolve variante de experimento para uma sessão específica
 * 
 * @param experimentKey - Chave do experimento
 * @param sessionId - ID da sessão (para estabilidade)
 * @returns Variante resolvida ou null se experimento não existe/inativo
 */
export function resolveVariant(
  experimentKey: string,
  sessionId: string
): ResolvedVariant | null {
  const experiment = getExperiment(experimentKey);

  if (!experiment || !experiment.enabled) {
    return null;
  }

  // Gera número pseudo-aleatório mas estável para esta sessão+experimento
  const seed = `${experimentKey}:${sessionId}`;
  const hash = simpleHash(seed);
  const bucket = hash % 100; // 0-99

  // Distribui baseado nos pesos
  let accumulatedWeight = 0;
  for (const variant of experiment.variants) {
    accumulatedWeight += variant.weight;
    if (bucket < accumulatedWeight) {
      return {
        experimentKey: experiment.key,
        variantKey: variant.key,
        variantName: variant.name,
      };
    }
  }

  // Fallback para última variante se algo der errado
  const lastVariant = experiment.variants[experiment.variants.length - 1];
  return {
    experimentKey: experiment.key,
    variantKey: lastVariant.key,
    variantName: lastVariant.name,
  };
}

/**
 * Resolve múltiplos experimentos de uma vez
 */
export function resolveVariants(
  experimentKeys: string[],
  sessionId: string
): ResolvedVariant[] {
  return experimentKeys
    .map((key) => resolveVariant(key, sessionId))
    .filter((v): v is ResolvedVariant => v !== null);
}

/**
 * Helper para uso em componentes client-side
 * Retorna variante ou fallback se experimento inativo
 */
export function useVariantOrDefault<T>(
  experimentKey: string,
  sessionId: string,
  variantMap: Record<string, T>,
  defaultValue: T
): T {
  const resolved = resolveVariant(experimentKey, sessionId);
  
  if (!resolved) {
    return defaultValue;
  }

  return variantMap[resolved.variantKey] ?? defaultValue;
}

/**
 * Experiments - Sistema leve de experimentos A/B
 */

export type { ExperimentDefinition, ExperimentVariant, ResolvedVariant } from './types';
export { experiments, getExperiment, getActiveExperiments } from './registry';
export { resolveVariant, resolveVariants, useVariantOrDefault } from './resolve';
export { buildExperimentScorecard, scorecardThresholds } from './scorecard';
export { getExperimentSessionId, resolveExperimentVariantClient } from './client';

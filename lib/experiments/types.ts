/**
 * Sistema leve de experimentos A/B
 * Permite testar variações sem complexidade enterprise
 */

export interface ExperimentVariant {
  key: string;
  weight: number; // 0-100, soma de todas deve ser 100
  name: string;
}

export interface ExperimentDefinition {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  primaryMetric?: 'completion_rate' | 'ctr' | 'share_reentry_rate';
  affectedSurface?: string;
  variants: ExperimentVariant[];
}

export interface ResolvedVariant {
  experimentKey: string;
  variantKey: string;
  variantName: string;
}

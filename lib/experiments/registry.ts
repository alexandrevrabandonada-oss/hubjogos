/**
 * Registro central de experimentos ativos
 */

import type { ExperimentDefinition } from './types';

/**
 * Experimentos ativos no beta
 * 
 * Para adicionar novo experimento:
 * 1. Definir chave única
 * 2. Criar variantes com pesos que somem 100
 * 3. Habilitar quando pronto para testar
 * 4. Usar resolve() para obter variante por sessão
 */
export const experiments: Record<string, ExperimentDefinition> = {
  'beta-banner-copy': {
    key: 'beta-banner-copy',
    name: 'Beta Banner Copy',
    description: 'Testar diferentes textos no banner de beta público',
    enabled: true,
    primaryMetric: 'completion_rate',
    affectedSurface: 'global/beta-banner',
    variants: [
      {
        key: 'control',
        weight: 50,
        name: 'Controle - Texto original',
      },
      {
        key: 'clarity',
        weight: 50,
        name: 'Clareza - Foco em aprendizado',
      },
    ],
  },

  'outcome-cta-style': {
    key: 'outcome-cta-style',
    name: 'Outcome CTA Style',
    description: 'Teste antigo de estilo visual de CTA no outcome (mantido pausado neste ciclo)',
    enabled: false,
    primaryMetric: 'ctr',
    affectedSurface: 'outcome/common',
    variants: [
      {
        key: 'default',
        weight: 50,
        name: 'Default - Links inline',
      },
      {
        key: 'buttons',
        weight: 50,
        name: 'Buttons - Botões destacados',
      },
    ],
  },

  'home-games-order': {
    key: 'home-games-order',
    name: 'Home Games Order',
    description: 'Testar ordem de destaque dos jogos na home',
    enabled: false, // Desabilitado por padrão, habilitar quando necessário
    primaryMetric: 'completion_rate',
    affectedSurface: 'home/catalog',
    variants: [
      {
        key: 'default',
        weight: 50,
        name: 'Ordem padrão',
      },
      {
        key: 'engagement',
        weight: 50,
        name: 'Por taxa de conclusão',
      },
    ],
  },

  // === TIJOLO 16/17: CONVERSÃO ===

  'outcome-primary-cta-copy': {
    key: 'outcome-primary-cta-copy',
    name: 'Outcome Primary CTA Copy',
    description: 'Testar textos do CTA primario no outcome para elevar clique de proxima acao.',
    enabled: true,
    primaryMetric: 'ctr',
    affectedSurface: 'outcome/common-primary-cta',
    variants: [
      {
        key: 'explore-next',
        weight: 50,
        name: 'Controle - "Explorar proxima"',
      },
      {
        key: 'continue-journey',
        weight: 50,
        name: 'Alternativa - "Continuar jornada"',
      },
    ],
  },

  'share-page-reentry-cta': {
    key: 'share-page-reentry-cta',
    name: 'Share Page Reentry CTA',
    description: 'Testar força do CTA de reentrada na share page para aumentar volta ao hub.',
    enabled: true,
    primaryMetric: 'share_reentry_rate',
    affectedSurface: 'share/[game]/[result]-reentry',
    variants: [
      {
        key: 'soft-call',
        weight: 50,
        name: 'Controle - "Explorar outra experiencia"',
      },
      {
        key: 'strong-call',
        weight: 50,
        name: 'Alternativa - "Jogar agora"',
      },
    ],
  },

  'home-hero-cta-copy': {
    key: 'home-hero-cta-copy',
    name: 'Home Hero CTA Copy',
    description: 'Testar chamadas de entrada no hero para melhorar cliques para exploracao.',
    enabled: true,
    primaryMetric: 'ctr',
    affectedSurface: 'home/hero-cta',
    variants: [
      {
        key: 'explore',
        weight: 50,
        name: 'Controle - "Explorar experiencias"',
      },
      {
        key: 'discover-now',
        weight: 50,
        name: 'Alternativa - "Descubra agora"',
      },
    ],
  },
};

/**
 * Obtém definição de experimento por chave
 */
export function getExperiment(key: string): ExperimentDefinition | null {
  return experiments[key] || null;
}

/**
 * Lista todos experimentos ativos
 */
export function getActiveExperiments(): ExperimentDefinition[] {
  return Object.values(experiments).filter((exp) => exp.enabled);
}

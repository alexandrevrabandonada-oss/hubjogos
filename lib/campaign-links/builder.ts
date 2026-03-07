/**
 * Campaign Links - Builder
 * Constrói links rastreáveis de campanha com UTMs
 */

import type { CampaignLinkParams, CampaignLink, CampaignChannel, CampaignName } from './types';
import { CHANNEL_MEDIUM_MAP, CHANNEL_LABELS } from './types';

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub-jogos-pre-campanha.vercel.app';
const DEFAULT_CAMPAIGN = 'pre-campanha-alexandre-fonseca';

/**
 * Constrói um link de campanha rastreável
 */
export function buildCampaignLink(params: CampaignLinkParams): CampaignLink {
  const url = new URL(params.path, params.baseUrl);
  
  // UTMs obrigatórias
  url.searchParams.set('utm_source', params.source);
  url.searchParams.set('utm_medium', params.medium || CHANNEL_MEDIUM_MAP[params.source]);
  url.searchParams.set('utm_campaign', params.campaign || DEFAULT_CAMPAIGN);
  
  // UTMs opcionais
  if (params.content) {
    url.searchParams.set('utm_content', params.content);
  }
  if (params.term) {
    url.searchParams.set('utm_term', params.term);
  }
  
  // Contexto de jogo (se aplicável)
  if (params.territorio) {
    url.searchParams.set('territorio', params.territorio);
  }
  if (params.serie) {
    url.searchParams.set('serie', params.serie);
  }
  if (params.jogo) {
    url.searchParams.set('jogo', params.jogo);
  }
  
  // Labels
  const channelLabel = CHANNEL_LABELS[params.source];
  const pathParts = params.path.split('/').filter(Boolean);
  const shortLabel = `${channelLabel}`;
  const fullLabel = `${channelLabel} - ${pathParts.join(' → ')}`;
  
  return {
    url: url.toString(),
    source: params.source,
    medium: params.medium || CHANNEL_MEDIUM_MAP[params.source],
    campaign: params.campaign || DEFAULT_CAMPAIGN,
    gameSlug: params.jogo,
    territorio: params.territorio,
    serie: params.serie,
    shortLabel,
    fullLabel,
  };
}

/**
 * Constrói links para um jogo específico em múltiplos canais
 */
export function buildGameLinks(
  gameSlug: string,
  channels: CampaignChannel[],
  options?: {
    baseUrl?: string;
    campaign?: CampaignName;
    territorio?: string;
    serie?: string;
  }
): CampaignLink[] {
  const baseUrl = options?.baseUrl || DEFAULT_BASE_URL;
  const path = `/play/${gameSlug}`;
  
  return channels.map((source) => 
    buildCampaignLink({
      baseUrl,
      path,
      source,
      campaign: options?.campaign,
      content: gameSlug,
      territorio: options?.territorio,
      serie: options?.serie,
      jogo: gameSlug,
    })
  );
}

/**
 * Constrói links para a home em múltiplos canais
 */
export function buildHomeLinks(
  channels: CampaignChannel[],
  options?: {
    baseUrl?: string;
    campaign?: CampaignName;
    territorio?: string;
  }
): CampaignLink[] {
  const baseUrl = options?.baseUrl || DEFAULT_BASE_URL;
  
  return channels.map((source) => 
    buildCampaignLink({
      baseUrl,
      path: '/',
      source,
      campaign: options?.campaign,
      content: 'home',
      territorio: options?.territorio,
    })
  );
}

/**
 * Constrói links para a exploração em múltiplos canais
 */
export function buildExploreLinks(
  channels: CampaignChannel[],
  options?: {
    baseUrl?: string;
    campaign?: CampaignName;
    territorio?: string;
  }
): CampaignLink[] {
  const baseUrl = options?.baseUrl || DEFAULT_BASE_URL;
  
  return channels.map((source) => 
    buildCampaignLink({
      baseUrl,
      path: '/explorar',
      source,
      campaign: options?.campaign,
      content: 'explorar',
      territorio: options?.territorio,
    })
  );
}

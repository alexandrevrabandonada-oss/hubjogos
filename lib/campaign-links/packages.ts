/**
 * Campaign Links - Packages
 * Gera pacotes de distribuição por canal e território
 */

import type { CampaignLink, CampaignChannel } from './types';
import { buildGameLinks, buildHomeLinks, buildExploreLinks } from './builder';

export interface CampaignPackage {
  id: string;
  name: string;
  description: string;
  channel?: CampaignChannel;
  territorio?: string;
  serie?: string;
  links: CampaignLink[];
  priority: number;
  weekFocus?: number;
}

/**
 * Canais prioritários para distribuição social/orgânica
 */
export const PRIORITY_CHANNELS: CampaignChannel[] = [
  'instagram',
  'whatsapp',
  'tiktok',
  'bio',
  'direto',
];

/**
 * Canais secundários
 */
export const SECONDARY_CHANNELS: CampaignChannel[] = [
  'twitter',
  'facebook',
  'telegram',
  'youtube',
  'linkhub',
];

/**
 * Gera pacote por território
 */
export function buildTerritoryPackage(
  territorio: string,
  gamesSlugs: string[],
  options?: {
    channels?: CampaignChannel[];
    serie?: string;
    priority?: number;
    weekFocus?: number;
  }
): CampaignPackage {
  const channels = options?.channels || PRIORITY_CHANNELS;
  const links: CampaignLink[] = [];
  
  // Links para home + explorar
  links.push(...buildHomeLinks(channels, { territorio }));
  links.push(...buildExploreLinks(channels, { territorio }));
  
  // Links para cada jogo
  for (const gameSlug of gamesSlugs) {
    links.push(...buildGameLinks(gameSlug, channels, {
      territorio,
      serie: options?.serie,
    }));
  }
  
  return {
    id: `territorio-${territorio}`,
    name: `Pacote ${territorio}`,
    description: `Links de distribuição para ${territorio} - ${gamesSlugs.length} jogos, ${channels.length} canais`,
    territorio,
    serie: options?.serie,
    links,
    priority: options?.priority || 1,
    weekFocus: options?.weekFocus,
  };
}

/**
 * Gera pacote por canal
 */
export function buildChannelPackage(
  channel: CampaignChannel,
  gamesSlugs: string[],
  options?: {
    territorio?: string;
    serie?: string;
    priority?: number;
    weekFocus?: number;
  }
): CampaignPackage {
  const links: CampaignLink[] = [];
  
  // Links para home + explorar
  links.push(...buildHomeLinks([channel], { territorio: options?.territorio }));
  links.push(...buildExploreLinks([channel], { territorio: options?.territorio }));
  
  // Links para cada jogo
  for (const gameSlug of gamesSlugs) {
    links.push(...buildGameLinks(gameSlug, [channel], {
      territorio: options?.territorio,
      serie: options?.serie,
    }));
  }
  
  return {
    id: `canal-${channel}${options?.territorio ? `-${options.territorio}` : ''}`,
    name: `Pacote ${channel}${options?.territorio ? ` - ${options.territorio}` : ''}`,
    description: `Links para ${channel} - ${gamesSlugs.length} jogos`,
    channel,
    territorio: options?.territorio,
    serie: options?.serie,
    links,
    priority: options?.priority || 2,
    weekFocus: options?.weekFocus,
  };
}

/**
 * Gera pacote por série
 */
export function buildSeriesPackage(
  serie: string,
  gamesSlugs: string[],
  options?: {
    channels?: CampaignChannel[];
    territorio?: string;
    priority?: number;
    weekFocus?: number;
  }
): CampaignPackage {
  const channels = options?.channels || PRIORITY_CHANNELS;
  const links: CampaignLink[] = [];
  
  // Links para cada jogo da série
  for (const gameSlug of gamesSlugs) {
    links.push(...buildGameLinks(gameSlug, channels, {
      territorio: options?.territorio,
      serie,
    }));
  }
  
  return {
    id: `serie-${serie}`,
    name: `Série ${serie}`,
    description: `Links para série ${serie} - ${gamesSlugs.length} jogos, ${channels.length} canais`,
    serie,
    territorio: options?.territorio,
    links,
    priority: options?.priority || 1,
    weekFocus: options?.weekFocus,
  };
}

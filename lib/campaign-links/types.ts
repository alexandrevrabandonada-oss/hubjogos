/**
 * Campaign Links - Types
 * Define tipos para geração de links rastreáveis de campanha
 */

export type CampaignChannel = 
  | 'instagram'
  | 'tiktok'
  | 'whatsapp'
  | 'youtube'
  | 'direto'
  | 'bio'
  | 'linkhub'
  | 'twitter'
  | 'facebook'
  | 'telegram';

export type CampaignMedium = 
  | 'social'
  | 'messaging'
  | 'organic'
  | 'video'
  | 'bio-link';

export type CampaignName = 
  | 'pre-campanha-alexandre-fonseca'
  | 'quick-games-beta'
  | 'distribuicao-territorial'
  | 'experimento-qr';

export interface CampaignLinkParams {
  baseUrl: string;
  path: string;
  source: CampaignChannel;
  medium?: CampaignMedium;
  campaign?: CampaignName;
  content?: string;
  term?: string;
  territorio?: string;
  serie?: string;
  jogo?: string;
}

export interface CampaignLink {
  url: string;
  source: CampaignChannel;
  medium?: CampaignMedium;
  campaign?: CampaignName;
  gameSlug?: string;
  territorio?: string;
  serie?: string;
  shortLabel: string;
  fullLabel: string;
}

export const CHANNEL_MEDIUM_MAP: Record<CampaignChannel, CampaignMedium> = {
  instagram: 'social',
  tiktok: 'social',
  twitter: 'social',
  facebook: 'social',
  whatsapp: 'messaging',
  telegram: 'messaging',
  youtube: 'video',
  direto: 'organic',
  bio: 'bio-link',
  linkhub: 'bio-link',
};

export const CHANNEL_LABELS: Record<CampaignChannel, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  twitter: 'Twitter',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  youtube: 'YouTube',
  direto: 'Link Direto',
  bio: 'Bio',
  linkhub: 'Link Hub',
};

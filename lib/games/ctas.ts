import { GAME_SERIES_LABELS, Game, getNextGameInSeries } from './catalog';

export interface OutcomeAction {
  id: string;
  label: string;
  href: string;
  /** Categoria do CTA para análise (explorar, participar, replay, relacionado) */
  category?: 'exploration' | 'participation' | 'replay' | 'related' | 'feedback';
  /** Evento de tracking a registrar */
  trackingId?: string;
}

export interface OutcomeCtaConfig {
  primary: OutcomeAction;
  secondary: OutcomeAction;
  shareLine: string;
}

/**
 * Contexto de origem do usuário para personalização de CTA
 * Usado para servir a próxima ação mais apropriada conforme origem
 */
export type CtaOriginContext = 
  | 'direct' 
  | 'organic_search' 
  | 'social_media' 
  | 'newsletter' 
  | 'referral' 
  | 'share_page'
  | 'unknown';

/**
 * Contexto de situação do usuário no jogo
 */
export type CtaSituationContext = 
  | 'first_visit'
  | 'replay'
  | 'completion'
  | 'abandoned'
  | 'unknown';

const fallbackCta: OutcomeCtaConfig = {
  primary: {
    id: 'explorar-experiencias',
    label: 'Explorar outras experiências',
    href: '/explorar',
  },
  secondary: {
    id: 'participar-hub',
    label: 'Participar da construção do hub',
    href: '/participar',
  },
  shareLine:
    'Terminei uma experiência no Hub de Jogos da Pré-Campanha de Alexandre Fonseca para Deputado e descobri um recorte político importante para a cidade.',
};

const byGame: Record<string, OutcomeCtaConfig> = {
  'voto-consciente': {
    primary: {
      id: 'explorar-outras',
      label: 'Explorar outras experiências',
      href: '/explorar',
    },
    secondary: {
      id: 'participar-hub',
      label: 'Participar da construção',
      href: '/participar',
    },
    shareLine:
      'Meu resultado no Voto Consciente mostrou quais prioridades políticas eu coloco no centro da cidade.',
  },
  'transporte-urgente': {
    primary: {
      id: 'entender-mobilidade',
      label: 'Explorar outras experiências',
      href: '/explorar',
    },
    secondary: {
      id: 'participar-hub',
      label: 'Participar da construção',
      href: '/participar',
    },
    shareLine:
      'No Transporte Urgente, cada escolha mostrou o custo político da mobilidade precária no cotidiano.',
  },
  'cidade-real': {
    primary: {
      id: 'explorar-outras',
      label: 'Explorar outras experiências',
      href: '/explorar',
    },
    secondary: {
      id: 'participar-hub',
      label: 'Participar da construção',
      href: '/participar',
    },
    shareLine:
      'Administrei uma cidade real e descobri as contradições do orçamento público.',
  },
  'abandonado': {
    primary: {
      id: 'explorar-outras',
      label: 'Explorar outras experiências',
      href: '/explorar',
    },
    secondary: {
      id: 'participar-hub',
      label: 'Participar da construção',
      href: '/participar',
    },
    shareLine:
      'Mapeei edifícios abandonados e descobri histórias de memória e resistência urbana.',
  },
  'trabalho-impossivel': {
    primary: {
      id: 'explorar-outras',
      label: 'Explorar outras experiências',
      href: '/explorar',
    },
    secondary: {
      id: 'participar-hub',
      label: 'Participar da construção',
      href: '/participar',
    },
    shareLine:
      'Enfrentei escolhas impossíveis do trabalhador urbano e entendi dilemas sem respostas fáceis.',
  },
  'memoria-coletiva': {
    primary: {
      id: 'explorar-outras',
      label: 'Explorar outras experiências',
      href: '/explorar',
    },
    secondary: {
      id: 'participar-hub',
      label: 'Participar da construção',
      href: '/participar',
    },
    shareLine:
      'Joguei Memória Coletiva e reconectei com momentos políticos e urbanos importantes.',
  },
};

/**
 * Obter CTA configurado para um jogo
 * Retorna fallback se jogo não tiver CTA customizado
 */
export function getOutcomeCta(game: Game): OutcomeCtaConfig {
  const baseCta = byGame[game.slug] || fallbackCta;
  const nextInSeries = getNextGameInSeries(game);

  if (!nextInSeries) {
    return baseCta;
  }

  return {
    ...baseCta,
    secondary: {
      id: `proxima-serie-${game.series}`,
      label: `Próxima da série: ${GAME_SERIES_LABELS[game.series]}`,
      href: `/play/${nextInSeries.slug}`,
      category: 'related',
      trackingId: 'cta_next_series',
    },
  };
}

/**
 * Obter CTA com variação experimental
 * Permite testar diferentes textos de CTA via experimentos
 */
export function getOutcomeCtaWithVariant(
  game: Game,
  variant?: 'default' | 'buttons' | string
): OutcomeCtaConfig {
  const baseCta = getOutcomeCta(game);

  // Se não houver variante ou for default, retorna o padrão
  if (!variant || variant === 'default') {
    return baseCta;
  }

  // Variante "buttons" - CTAs mais diretos e acionáveis
  if (variant === 'buttons') {
    return {
      ...baseCta,
      primary: {
        ...baseCta.primary,
        label: 'Ver mais experiências →',
      },
      secondary: {
        ...baseCta.secondary,
        label: 'Ajudar a construir o hub',
      },
    };
  }

  return baseCta;
}

/**
 * Deduzir origem do contexto de URL/referrer
 */
export function inferOriginContext(source?: string): CtaOriginContext {
  if (!source) return 'unknown';
  
  const lower = source.toLowerCase();
  
  if (lower.includes('instagram') || lower.includes('tiktok') || lower.includes('twitter') || lower.includes('facebook') || lower.includes('whatsapp')) {
    return 'social_media';
  }
  if (lower.includes('google') || lower.includes('bing') || lower.includes('search')) {
    return 'organic_search';
  }
  if (lower.includes('newsletter') || lower.includes('email')) {
    return 'newsletter';
  }
  if (lower.includes('share_page')) {
    return 'share_page';
  }
  if (lower === 'direto' || lower === 'direto/desconhecido' || lower === '(direct)') {
    return 'direct';
  }
  
  return 'referral';
}

/**
 * Resolver CTA apropriado baseado em contexto de origem e situação
 * Permite serve diferentes chamadas à ação conforme origem do tráfego
 * 
 * Exemplo: usuário vindo de TikTok recebe CTA mais visual/urgente
 *          usuário em replay recebe "Jogar novamente" em vez de exploração
 */
export function resolveContextualCta(
  game: Game,
  options?: {
    origin?: CtaOriginContext | string;
    situation?: CtaSituationContext;
    variant?: string;
  }
): OutcomeCtaConfig & { resolvedOrigin: CtaOriginContext; chosenPrimary: string } {
  const baseCta = getOutcomeCtaWithVariant(game, options?.variant);
  const origin = typeof options?.origin === 'string' 
    ? inferOriginContext(options.origin)
    : (options?.origin || 'unknown');
  const situation = options?.situation || 'unknown';

  let primary = baseCta.primary;
  let secondary = baseCta.secondary;

  // Adaptação por origem: usuários vindo de redes sociais recebem CTA mais direto
  if (origin === 'social_media') {
    primary = {
      ...baseCta.primary,
      id: 'explorar-rapido',
      label: 'Explorar próxima',
      category: 'exploration',
      trackingId: 'cta_social_explore',
    };
  }

  // Adaptação por origem: newsletter recebe convite claro de engajamento
  if (origin === 'newsletter') {
    primary = {
      ...baseCta.primary,
      label: 'Continuar descobrindo',
      category: 'exploration',
      trackingId: 'cta_newsletter_continue',
    };
  }

  // Adaptação por situação: replay recebe CTA para nova experiência
  if (situation === 'replay') {
    primary = {
      id: 'proxima-experiencia',
      label: 'Tentar outra experiência',
      href: '/explorar',
      category: 'related',
      trackingId: 'cta_replay_next',
    };
  }

  // Adaptação por situação: share_page recebe CTA forte de reentrada
  if (origin === 'share_page') {
    primary = {
      id: 'voltar-a-jogar',
      label: 'Voltar a jogar',
      href: '/explorar',
      category: 'exploration',
      trackingId: 'cta_sharelink_reentry',
    };
  }

  return {
    ...baseCta,
    primary,
    secondary,
    resolvedOrigin: origin,
    chosenPrimary: primary.id,
  };
}


import { Game } from './catalog';

export interface OutcomeAction {
  id: string;
  label: string;
  href: string;
}

export interface OutcomeCtaConfig {
  primary: OutcomeAction;
  secondary: OutcomeAction;
  shareLine: string;
}

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
    'Terminei uma experiência no Hub de Jogos da Pré-Campanha e descobri um recorte político importante para a cidade.',
};

const byGame: Record<string, OutcomeCtaConfig> = {
  'voto-consciente': {
    primary: {
      id: 'entender-pauta-direitos',
      label: 'Entender a pauta de direitos',
      href: '/explorar',
    },
    secondary: {
      id: 'participar-hub',
      label: 'Participar da construção do hub',
      href: '/participar',
    },
    shareLine:
      'Meu resultado no Voto Consciente mostrou quais prioridades políticas eu coloco no centro da cidade.',
  },
  'transporte-urgente': {
    primary: {
      id: 'entender-pauta-transporte',
      label: 'Entender a pauta de transporte',
      href: '/explorar',
    },
    secondary: {
      id: 'participar-hub',
      label: 'Participar da construção do hub',
      href: '/participar',
    },
    shareLine:
      'No Transporte Urgente, cada escolha mostrou o custo político da mobilidade precária no cotidiano.',
  },
};

export function getOutcomeCta(game: Game): OutcomeCtaConfig {
  return byGame[game.slug] || fallbackCta;
}

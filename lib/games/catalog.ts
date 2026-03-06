/**
 * Catálogo local do Hub
 * Fonte de verdade para runtime de experiências no Tijolo 04.
 */

export type GameStatus = 'coming' | 'beta' | 'live';
export type GameTheme = 'city' | 'labor' | 'abandonment' | 'memory' | 'rights';
export type GameKind =
  | 'quiz'
  | 'branching_story'
  | 'narrative'
  | 'simulation'
  | 'map';

export type RuntimeState = 'real' | 'shell';

export interface Game {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  theme: GameTheme;
  icon: string;
  cover: string;
  status: GameStatus;
  runtimeState: RuntimeState;
  estimatedMinutes: number;
  duration: string;
  participants: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  cta: string;
  color: string;
  kind: GameKind;
  engineId?: string;
}

export const games: Game[] = [
  {
    id: 'cidade-real',
    slug: 'cidade-real',
    title: 'Cidade Real',
    description:
      'Um simulador de decisões orçamentárias municipais. Você é responsável pelo cuidado: saúde, educação, transporte, moradia. Como distribuir recursos limitados? Quem ganha? Quem perde? Entenda as contradições da administração pública urbana.',
    shortDescription: 'Simule o orçamento de uma cidade real',
    theme: 'city',
    icon: '🏙️',
    cover: '/games/cidade-real.jpg',
    status: 'live',
    runtimeState: 'real',
    estimatedMinutes: 7,
    duration: '5-8 min',
    participants: 1,
    difficulty: 'medium',
    tags: ['orçamento', 'política', 'simulação'],
    cta: 'Governar',
    color: '#C97E2F',
    kind: 'simulation',
    engineId: 'cidade-real-v1',
  },
  {
    id: 'abandonado',
    slug: 'abandonado',
    title: 'Abandonado',
    description:
      'Explore um mapa interativo de edifícios abandonados em sua região. Cada prédio conta histórias: por que fechou? Quem viveu aqui? O que poderia voltar a existir? Mapeie memória, território e resistência urbana.',
    shortDescription: 'Mapeie memória e abandono na cidade',
    theme: 'abandonment',
    icon: '🏚️',
    cover: '/games/abandonado.jpg',
    status: 'live',
    runtimeState: 'real',
    estimatedMinutes: 12,
    duration: '10-15 min',
    participants: 1,
    difficulty: 'easy',
    tags: ['memória', 'cidade', 'exploração'],
    cta: 'Explorar',
    color: '#7A6A52',
    kind: 'map',
    engineId: 'abandonado-v1',
  },
  {
    id: 'trabalho-impossivel',
    slug: 'trabalho-impossivel',
    title: 'Escolhas Impossíveis',
    description:
      'Um jogo de dilemas do trabalhador urbano. Cada dia, você enfrenta escolhas reais sem respostas certas: trabalhar de madrugada ou cuidar da família? Comprar alimentação ou pagar aluguel?',
    shortDescription: 'Escolhas impossíveis de um trabalhador',
    theme: 'labor',
    icon: '⚖️',
    cover: '/games/trabalho-impossivel.jpg',
    status: 'coming',
    runtimeState: 'shell',
    estimatedMinutes: 9,
    duration: '7-10 min',
    participants: 1,
    difficulty: 'hard',
    tags: ['trabalho', 'dilema', 'realidade'],
    cta: 'Decidir',
    color: '#A6472D',
    kind: 'narrative',
    engineId: 'trabalho-impossivel-v1',
  },
  {
    id: 'voto-consciente',
    slug: 'voto-consciente',
    title: 'Voto Consciente',
    description:
      'Um quiz que desvela suas posições políticas reais. Você responde sobre pautas concretas e ao final obtém leitura política acionável.',
    shortDescription: 'Descubra suas posições políticas reais',
    theme: 'rights',
    icon: '🗳️',
    cover: '/games/voto-consciente.jpg',
    status: 'live',
    runtimeState: 'real',
    estimatedMinutes: 10,
    duration: '8-12 min',
    participants: 1,
    difficulty: 'easy',
    tags: ['política', 'quiz', 'consciência'],
    cta: 'Responder',
    color: '#FFB81C',
    kind: 'quiz',
    engineId: 'voto-consciente',
  },
  {
    id: 'memoria-coletiva',
    slug: 'memoria-coletiva',
    title: 'Memória Coletiva',
    description:
      'Um jogo de associação e descoberta. Visuais de momentos políticos e urbanos reais são revelados gradualmente para leitura de contexto.',
    shortDescription: 'Jogo de memória política e urbana',
    theme: 'memory',
    icon: '🧩',
    cover: '/games/memoria-coletiva.jpg',
    status: 'coming',
    runtimeState: 'shell',
    estimatedMinutes: 8,
    duration: '6-9 min',
    participants: 1,
    difficulty: 'medium',
    tags: ['memória', 'história', 'associação'],
    cta: 'Lembrar',
    color: '#99845B',
    kind: 'narrative',
    engineId: 'memoria-coletiva-v1',
  },
  {
    id: 'transporte-urgente',
    slug: 'transporte-urgente',
    title: 'Transporte Urgente',
    description:
      'Uma narrativa interativa sobre mobilidade urbana. Suas escolhas definem rota, risco, fadiga e renda, expondo o custo humano da logística urbana.',
    shortDescription: 'Narrativa sobre mobilidade urbana precária',
    theme: 'city',
    icon: '🏃',
    cover: '/games/transporte-urgente.jpg',
    status: 'live',
    runtimeState: 'real',
    estimatedMinutes: 7,
    duration: '6-8 min',
    participants: 1,
    difficulty: 'medium',
    tags: ['transporte', 'narrativa', 'trabalho'],
    cta: 'Começar',
    color: '#8F5C2A',
    kind: 'branching_story',
    engineId: 'transporte-urgente',
  },
];

export function getGameBySlug(slug: string): Game | undefined {
  return games.find((game) => game.slug === slug);
}

export function getGamesByTheme(theme: GameTheme): Game[] {
  return games.filter((game) => game.theme === theme);
}

export function getGamesByStatus(status: GameStatus): Game[] {
  return games.filter((game) => game.status === status);
}

export function getLiveGames(): Game[] {
  return getGamesByStatus('live');
}

export function getBetaGames(): Game[] {
  return getGamesByStatus('beta');
}

export function getComingGames(): Game[] {
  return getGamesByStatus('coming');
}

export function getRealEngines(): Game[] {
  return games.filter((game) => game.runtimeState === 'real');
}

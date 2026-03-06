/**
 * Catálogo Local de Jogos - Tijolo 02
 * 
 * Fonte de verdade temporária para experiências no hub.
 * Futuro: será substituído por integração Supabase.
 * 
 * Cada jogo representa uma transformação de pauta política real em mecânica lúdica.
 */

export type GameStatus = 'coming' | 'beta' | 'live';
export type GameTheme = 'city' | 'labor' | 'abandonment' | 'memory' | 'rights';

export interface Game {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  theme: GameTheme;
  icon: string;
  cover: string; // future: image path
  status: GameStatus;
  duration: string; // ex: "3-5 min"
  participants: number; // player count
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  cta: string;
  color: string; // accent color para este jogo
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
    status: 'beta',
    duration: '5-8 min',
    participants: 1,
    difficulty: 'medium',
    tags: ['orçamento', 'política', 'simulação'],
    cta: 'Governar',
    color: '#FFB81C',
  },
  {
    id: 'abandonado',
    slug: 'abandonado',
    title: 'Abandonado',
    description:
      'Explore um mapa interativo de edifícios abandonados em sua região. Cada prédio conta histórias: por que fechou? Quem viveu aqui? O que poderia voltar a existir? Mapeie memória, terramorphology e resistência urbana.',
    shortDescription: 'Mapeie memória e abandono na cidade',
    theme: 'abandonment',
    icon: '🏚️',
    cover: '/games/abandonado.jpg',
    status: 'coming',
    duration: '10-15 min',
    participants: 1,
    difficulty: 'easy',
    tags: ['memória', 'cidade', 'exploração'],
    cta: 'Explorar',
    color: '#00D9FF',
  },
  {
    id: 'trabalho-impossivel',
    slug: 'trabalho-impossivel',
    title: 'Escolhas Impossíveis',
    description:
      'Um jogo de dilemas do trabalhador urbano. Cada dia, você enfrenta escolhas reais sem respostas certas: trabalhar de madrugada ou cuidar da família? Comprar alimentação ou pagar aluguel? Descubra a impossibilidade estruturada da vida precária.',
    shortDescription: 'Escolhas impossíveis de um trabalhador',
    theme: 'labor',
    icon: '⚖️',
    cover: '/games/trabalho-impossivel.jpg',
    status: 'coming',
    duration: '7-10 min',
    participants: 1,
    difficulty: 'hard',
    tags: ['trabalho', 'dilema', 'realidade'],
    cta: 'Decidir',
    color: '#FF1493',
  },
  {
    id: 'voto-consciente',
    slug: 'voto-consciente',
    title: 'Voto Consciente',
    description:
      'Um quiz que desvela suas posições políticas reais. Você responde sobre pautas concretas (educação, economia, meio ambiente, justiça). Ao final, vê quais candidatos/propostas (existentes ou fictícios) de fato combinam com suas respostas.',
    shortDescription: 'Descubra suas posições políticas reais',
    theme: 'rights',
    icon: '🗳️',
    cover: '/games/voto-consciente.jpg',
    status: 'live',
    duration: '8-12 min',
    participants: 1,
    difficulty: 'easy',
    tags: ['política', 'quiz', 'consciência'],
    cta: 'Responder',
    color: '#FFB81C',
  },
  {
    id: 'memoria-coletiva',
    slug: 'memoria-coletiva',
    title: 'Memória Coletiva',
    description:
      'Um jogo de associação e descoberta. Visuais de momentos políticos, culturais e urbanos reais são revelados gradualmente. Você tenta identificar contexto, data, significado. Trabalha memória coletiva urbana e política.',
    shortDescription: 'Jogo de memória política e urbana',
    theme: 'memory',
    icon: '🧩',
    cover: '/games/memoria-coletiva.jpg',
    status: 'coming',
    duration: '6-9 min',
    participants: 1,
    difficulty: 'medium',
    tags: ['memória', 'história', 'associação'],
    cta: 'Lembrar',
    color: '#00D9FF',
  },
  {
    id: 'transporte-urgente',
    slug: 'transporte-urgente',
    title: 'Transporte Urgente',
    description:
      'Uma narrativa interativa sobre mobilidade urbana. Você é um entregador, motoboy, buseiro. Suas escolhas definem rota, risco, fadiga, renda. Entenda o custo humano da logística urbana contemporânea.',
    shortDescription: 'Narrativa sobre mobilidade urbana precária',
    theme: 'city',
    icon: '🏃',
    cover: '/games/transporte-urgente.jpg',
    status: 'coming',
    duration: '12-15 min',
    participants: 1,
    difficulty: 'hard',
    tags: ['transporte', 'narrativa', 'trabalho'],
    cta: 'Começar',
    color: '#FF1493',
  },
];

/**
 * Utilitários para acessar o catálogo
 */
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

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
export type GamePace = 'quick' | 'session' | 'deep' | 'future-flagship';
export type GameLine =
  | 'denuncia'
  | 'orcamento-cuidado'
  | 'memoria-territorio'
  | 'trabalho'
  | 'mobilidade'
  | 'organizacao-popular'
  | 'estado-rj';
export type TerritoryScope =
  | 'volta-redonda'
  | 'sul-fluminense'
  | 'baixada'
  | 'capital'
  | 'estado-rj';
export type GameSeries =
  | 'serie-volta-redonda'
  | 'serie-trabalho-sobrevivencia'
  | 'serie-cidade-abandonada'
  | 'serie-rio-de-janeiro'
  | 'serie-campanha-missoes-estado'
  | 'serie-solucoes-coletivas';

export type PoliticalAxis = 'mercado' | 'reforma-estatal' | 'poder-popular';
export type CollectiveSolutionType =
  | 'nao-definido'
  | 'tarifa-zero'
  | 'cooperativismo'
  | 'ajuda-mutua'
  | 'autogestao'
  | 'controle-popular';
export type CommonVsMarket = 'mercado' | 'misto' | 'comum';
export type CampaignFrame = 'projeto-coletivo' | 'comunidade-em-luta' | 'defesa-dos-comuns';

export const GAME_PACE_LABELS: Record<GamePace, string> = {
  quick: '30s-2min',
  session: '2-6min',
  deep: '6min+',
  'future-flagship': 'formato futuro',
};

export const GAME_LINE_LABELS: Record<GameLine, string> = {
  denuncia: 'Denuncia',
  'orcamento-cuidado': 'Orcamento e Cuidado',
  'memoria-territorio': 'Memoria e Territorio',
  trabalho: 'Trabalho',
  mobilidade: 'Mobilidade',
  'organizacao-popular': 'Organizacao Popular',
  'estado-rj': 'Estado do RJ',
};

export const GAME_SERIES_LABELS: Record<GameSeries, string> = {
  'serie-volta-redonda': 'Serie Volta Redonda',
  'serie-trabalho-sobrevivencia': 'Serie Trabalho e Sobrevivencia',
  'serie-cidade-abandonada': 'Serie Cidade Abandonada',
  'serie-rio-de-janeiro': 'Serie Rio de Janeiro',
  'serie-campanha-missoes-estado': 'Serie Campanha / Missoes do Estado',
  'serie-solucoes-coletivas': 'Serie Solucoes Coletivas',
};

export const POLITICAL_AXIS_LABELS: Record<PoliticalAxis, string> = {
  mercado: 'Mercado',
  'reforma-estatal': 'Reforma Estatal',
  'poder-popular': 'Poder Popular',
};

export const COLLECTIVE_SOLUTION_LABELS: Record<CollectiveSolutionType, string> = {
  'nao-definido': 'Nao definido',
  'tarifa-zero': 'Tarifa Zero',
  cooperativismo: 'Cooperativismo',
  'ajuda-mutua': 'Ajuda Mutua',
  autogestao: 'Autogestao',
  'controle-popular': 'Controle Popular',
};

export const COMMON_VS_MARKET_LABELS: Record<CommonVsMarket, string> = {
  mercado: 'Mercado',
  misto: 'Misto',
  comum: 'Comum',
};

export const CAMPAIGN_FRAME_LABELS: Record<CampaignFrame, string> = {
  'projeto-coletivo': 'Projeto Coletivo',
  'comunidade-em-luta': 'Comunidade em Luta',
  'defesa-dos-comuns': 'Defesa dos Comuns',
};

export const TERRITORY_SCOPE_LABELS: Record<TerritoryScope, string> = {
  'volta-redonda': 'Volta Redonda',
  'sul-fluminense': 'Sul Fluminense',
  baixada: 'Baixada',
  capital: 'Capital',
  'estado-rj': 'Estado do Rio de Janeiro',
};

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
  pace: GamePace;
  line: GameLine;
  territoryScope: TerritoryScope;
  series: GameSeries;
  politicalAxis: PoliticalAxis;
  collectiveSolutionType: CollectiveSolutionType;
  commonVsMarket: CommonVsMarket;
  campaignFrame: CampaignFrame;
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
    pace: 'deep',
    line: 'orcamento-cuidado',
    territoryScope: 'volta-redonda',
    series: 'serie-volta-redonda',
    politicalAxis: 'reforma-estatal',
    collectiveSolutionType: 'controle-popular',
    commonVsMarket: 'misto',
    campaignFrame: 'projeto-coletivo',
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
    pace: 'deep',
    line: 'memoria-territorio',
    territoryScope: 'volta-redonda',
    series: 'serie-cidade-abandonada',
    politicalAxis: 'poder-popular',
    collectiveSolutionType: 'autogestao',
    commonVsMarket: 'comum',
    campaignFrame: 'comunidade-em-luta',
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
    pace: 'session',
    line: 'trabalho',
    territoryScope: 'sul-fluminense',
    series: 'serie-trabalho-sobrevivencia',
    politicalAxis: 'mercado',
    collectiveSolutionType: 'nao-definido',
    commonVsMarket: 'mercado',
    campaignFrame: 'projeto-coletivo',
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
    pace: 'session',
    line: 'organizacao-popular',
    territoryScope: 'estado-rj',
    series: 'serie-campanha-missoes-estado',
    politicalAxis: 'reforma-estatal',
    collectiveSolutionType: 'controle-popular',
    commonVsMarket: 'misto',
    campaignFrame: 'defesa-dos-comuns',
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
    pace: 'session',
    line: 'memoria-territorio',
    territoryScope: 'volta-redonda',
    series: 'serie-cidade-abandonada',
    politicalAxis: 'poder-popular',
    collectiveSolutionType: 'ajuda-mutua',
    commonVsMarket: 'comum',
    campaignFrame: 'comunidade-em-luta',
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
    pace: 'session',
    line: 'mobilidade',
    territoryScope: 'volta-redonda',
    series: 'serie-volta-redonda',
    politicalAxis: 'reforma-estatal',
    collectiveSolutionType: 'tarifa-zero',
    commonVsMarket: 'misto',
    campaignFrame: 'projeto-coletivo',
  },
  {
    id: 'custo-de-viver',
    slug: 'custo-de-viver',
    title: 'Custo de Viver',
    description:
      'Um quiz relâmpago sobre realidade econômica. Quanto custa viver bem em Volta Redonda? Responda 5 perguntas rápidas e descubra qual é o seu "custo de viver" real.',
    shortDescription: 'Quiz sobre custo de vida em VR',
    theme: 'labor',
    icon: '💰',
    cover: '/games/custo-de-viver.jpg',
    status: 'beta',
    runtimeState: 'real',
    estimatedMinutes: 2,
    duration: '1-2 min',
    participants: 1,
    difficulty: 'easy',
    tags: ['custo de vida', 'economia', 'realidade', 'quick'],
    cta: 'Calcular',
    color: '#C97E2F',
    kind: 'quiz',
    engineId: 'custo-de-viver',
    pace: 'quick',
    line: 'trabalho',
    territoryScope: 'volta-redonda',
    series: 'serie-trabalho-sobrevivencia',
    politicalAxis: 'reforma-estatal',
    collectiveSolutionType: 'cooperativismo',
    commonVsMarket: 'misto',
    campaignFrame: 'projeto-coletivo',
  },
  {
    id: 'quem-paga-a-conta',
    slug: 'quem-paga-a-conta',
    title: 'Quem Paga a Conta?',
    description:
      'Um quiz relâmpago sobre responsabilidade fiscal. Quem deve pagar pelos serviços essenciais do RJ? Responda 5 perguntas rápidas sobre transporte, saúde, moradia, educação e segurança.',
    shortDescription: 'Quiz sobre quem deve pagar serviços públicos',
    theme: 'rights',
    icon: '💸',
    cover: '/games/quem-paga-a-conta.jpg',
    status: 'beta',
    runtimeState: 'real',
    estimatedMinutes: 2,
    duration: '1-2 min',
    participants: 1,
    difficulty: 'easy',
    tags: ['responsabilidade', 'serviços públicos', 'Estado', 'quick'],
    cta: 'Responder',
    color: '#FFB81C',
    kind: 'quiz',
    engineId: 'quem-paga-a-conta',
    pace: 'quick',
    line: 'organizacao-popular',
    territoryScope: 'estado-rj',
    series: 'serie-campanha-missoes-estado',
    politicalAxis: 'reforma-estatal',
    collectiveSolutionType: 'controle-popular',
    commonVsMarket: 'misto',
    campaignFrame: 'defesa-dos-comuns',
  },
  {
    id: 'cidade-em-comum',
    slug: 'cidade-em-comum',
    title: 'Cidade em Comum',
    description:
      'Quiz relampago sobre saidas coletivas para o cotidiano: tarifa zero, cooperativas, mutirao e autogestao. Em 5 perguntas, descubra qual caminho de organizacao popular mais combina com sua leitura da cidade.',
    shortDescription: 'Qual solucao coletiva voce prioriza para a cidade?',
    theme: 'rights',
    icon: '🤝',
    cover: '/games/cidade-em-comum.jpg',
    status: 'beta',
    runtimeState: 'real',
    estimatedMinutes: 2,
    duration: '1-2 min',
    participants: 1,
    difficulty: 'easy',
    tags: ['organizacao popular', 'comum', 'quick', 'solucoes coletivas'],
    cta: 'Construir',
    color: '#2E7D5B',
    kind: 'quiz',
    engineId: 'cidade-em-comum',
    pace: 'quick',
    line: 'organizacao-popular',
    territoryScope: 'estado-rj',
    series: 'serie-solucoes-coletivas',
    politicalAxis: 'poder-popular',
    collectiveSolutionType: 'autogestao',
    commonVsMarket: 'comum',
    campaignFrame: 'defesa-dos-comuns',
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

export function getGamesBySeries(series: GameSeries): Game[] {
  return games.filter((game) => game.series === series);
}

export function getGamesByTerritory(scope: TerritoryScope): Game[] {
  return games.filter((game) => game.territoryScope === scope);
}

export function getGamesByPoliticalAxis(axis: PoliticalAxis): Game[] {
  return games.filter((game) => game.politicalAxis === axis);
}

export function getGamesByCollectiveSolution(solution: CollectiveSolutionType): Game[] {
  return games.filter((game) => game.collectiveSolutionType === solution);
}

export function getNextGameInSeries(game: Game): Game | undefined {
  const inSeries = games.filter((entry) => entry.series === game.series && entry.slug !== game.slug);
  return inSeries[0];
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

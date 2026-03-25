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
  | 'map'
  | 'arcade';

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
  | 'serie-solucoes-coletivas'
  | 'territorios-em-luta';

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
export type PortfolioStage = 'live' | 'validating' | 'coming' | 'pre-production' | 'cold-backlog';

export const TERRITORY_SCOPE_LABELS: Record<TerritoryScope, string> = {
  'volta-redonda': 'Volta Redonda',
  'sul-fluminense': 'Sul Fluminense',
  baixada: 'Baixada',
  capital: 'Capital',
  'estado-rj': 'Estado do Rio de Janeiro',
};

export type GameGenre = 'arcade' | 'platform' | 'simulation' | 'management' | 'strategy' | 'narration' | 'quiz';
export type PoliticalTheme = 'tarifa-zero' | 'trabalho' | 'moradia' | 'poluicao' | 'memoria' | 'servicos-publicos' | 'organizacao-popular' | 'cooperativismo' | 'cuidado' | 'transporte' | 'saude' | 'educacao';
export type DeviceSupport = 'mobile' | 'desktop';

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
  'territorios-em-luta': 'Territórios em Luta',
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

export const GAME_GENRE_LABELS: Record<GameGenre, string> = {
  arcade: 'Arcade',
  platform: 'Plataforma',
  simulation: 'Simulação',
  management: 'Gestão / Tycoon',
  strategy: 'Estratégia',
  narration: 'Narrativa / RPG',
  quiz: 'Quiz / Desafio',
};

export const POLITICAL_THEME_LABELS: Record<PoliticalTheme, string> = {
  'tarifa-zero': 'Tarifa Zero',
  trabalho: 'Trabalho',
  moradia: 'Moradia',
  poluicao: 'Poluição',
  memoria: 'Memória',
  'servicos-publicos': 'Serviços Públicos',
  'organizacao-popular': 'Org. Popular',
  cooperativismo: 'Cooperativismo',
  cuidado: 'Cuidado',
  transporte: 'Transporte',
  saude: 'Saúde',
  educacao: 'Educação',
};
export interface Game {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  theme: GameTheme; // UI theme
  genre: GameGenre;
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
  kind: GameKind; // Engine kind
  engineId?: string;
  pace: GamePace;
  line: GameLine;
  territoryScope: TerritoryScope; // Primary territory
  territories: TerritoryScope[]; // All relevant territories
  politicalThemes: PoliticalTheme[];
  series: GameSeries;
  politicalAxis: PoliticalAxis;
  collectiveSolutionType: CollectiveSolutionType;
  commonVsMarket: CommonVsMarket;
  campaignFrame: CampaignFrame;
  visualVersion?: string;
  assetSet?: string;
  premiumTheme?: string;
  audioProfile?: string;
  season: string;
  campaignRole: string;
  funRole: 'entrada' | 'retencao' | 'aprofundamento';
  deviceSupport: DeviceSupport[];
  isFeatured?: boolean;
  isNew?: boolean;
  priorityScore: number;
}

export interface PlannedGameCandidate {
  slug: string;
  title: string;
  type: 'arcade' | 'session';
  status: 'pre-producao' | 'backlog-frio' | 'active-build';
  territoryScope: TerritoryScope;
  series: GameSeries;
  politicalAxis: PoliticalAxis;
  campaignRole: string;
  funnelRole: 'entrada' | 'retencao' | 'aprofundamento';
  rationale: string;
}

export const games: Game[] = [
  {
    id: 'bairro-resiste',
    slug: 'bairro-resiste',
    title: 'Bairro Resiste - Defesa Territorial',
    description: 'Arcade hardcore de gestão de crise territorial. Administre o cooldown das brigadas, evite falhas em cascata de infraestrutura e segure a pressão sistêmica.',
    shortDescription: 'Proteja o bairro contra o colapso sistêmico em um mutirão de alta pressão.',
    theme: 'city',
    genre: 'arcade',
    icon: '🏘️',
    cover: '/arcade/bairro-resiste/bg/bg-bairro-base-v1.svg',
    status: 'live',
    runtimeState: 'real',
    estimatedMinutes: 2,
    duration: '1-2 min',
    participants: 1,
    difficulty: 'hard',
    tags: ['arcade', 'defesa territorial', 'crise', 'resistência'],
    cta: 'Resistir',
    color: '#0f172a',
    kind: 'arcade',
    engineId: 'bairro-resiste-v1',
    pace: 'quick',
    line: 'organizacao-popular',
    territoryScope: 'baixada',
    territories: ['baixada', 'sul-fluminense'],
    politicalThemes: ['moradia', 'organizacao-popular', 'cuidado'],
    series: 'serie-rio-de-janeiro',
    politicalAxis: 'poder-popular',
    collectiveSolutionType: 'ajuda-mutua',
    commonVsMarket: 'comum',
    campaignFrame: 'defesa-dos-comuns',
    visualVersion: 'T60-premium-v1',
    assetSet: 'bairro-resiste-premium',
    premiumTheme: 'bairro-resiste-premium',
    season: 's1-verao-26',
    campaignRole: 'Conectar defesa territorial com risco eminente.',
    funRole: 'retencao',
    deviceSupport: ['mobile', 'desktop'],
    isFeatured: true,
    priorityScore: 95
  },
  {
    id: 'tarifa-zero-corredor',
    slug: 'tarifa-zero-corredor',
    title: 'Tarifa Zero RJ - Corredor do Povo',
    description: 'Arcade lane-based de corrida coletiva. Controle o avatar do Alexandre, libere o corredor do povo com mutirões.',
    shortDescription: 'Arcade real de corrida coletiva com tarifa zero',
    theme: 'city',
    genre: 'arcade',
    icon: '🚌',
    cover: '/games/tarifa-zero-corredor.jpg',
    status: 'live',
    runtimeState: 'real',
    estimatedMinutes: 3,
    duration: '30s-3 min',
    participants: 1,
    difficulty: 'easy',
    tags: ['arcade', 'tarifa zero', 'mobilidade'],
    cta: 'Correr',
    color: '#1F6E8C',
    kind: 'arcade',
    engineId: 'tarifa-zero-corredor-v1',
    pace: 'quick',
    line: 'mobilidade',
    territoryScope: 'estado-rj',
    territories: ['estado-rj', 'capital'],
    politicalThemes: ['tarifa-zero', 'transporte', 'servicos-publicos'],
    series: 'serie-solucoes-coletivas',
    politicalAxis: 'poder-popular',
    collectiveSolutionType: 'tarifa-zero',
    commonVsMarket: 'comum',
    campaignFrame: 'defesa-dos-comuns',
    visualVersion: 'T35E-premium-v7',
    assetSet: 'corredor-do-povo-v6',
    premiumTheme: 'tarifa-zero-premium',
    audioProfile: 'tarifa-zero-sfx-v1',
    season: 's1-verao-26',
    campaignRole: 'Distribuição da mensagem e fixação de marca.',
    funRole: 'aprofundamento',
    deviceSupport: ['mobile', 'desktop'],
    priorityScore: 90
  },
  {
    id: 'mutirao-do-bairro',
    slug: 'mutirao-do-bairro',
    title: 'Mutirao do Bairro - Defesa do Comum',
    description: 'Arcade de coordenacao territorial em sessao curta. Organize brigadas, repare hotspots.',
    shortDescription: 'Arcade de coordenacao, reparo e defesa territorial',
    theme: 'city',
    genre: 'arcade',
    icon: '🛠️',
    cover: '/games/mutirao-do-bairro.jpg',
    status: 'live',
    runtimeState: 'real',
    estimatedMinutes: 2,
    duration: '1-2 min',
    participants: 1,
    difficulty: 'medium',
    tags: ['arcade', 'mutirao', 'autogestao'],
    cta: 'Coordenar',
    color: '#2F5D50',
    kind: 'arcade',
    engineId: 'mutirao-do-bairro-v1',
    pace: 'quick',
    line: 'organizacao-popular',
    territoryScope: 'estado-rj',
    territories: ['estado-rj'],
    politicalThemes: ['organizacao-popular', 'cuidado', 'moradia'],
    series: 'serie-solucoes-coletivas',
    politicalAxis: 'poder-popular',
    collectiveSolutionType: 'ajuda-mutua',
    commonVsMarket: 'comum',
    campaignFrame: 'comunidade-em-luta',
    visualVersion: 'T36C-premium-v1',
    assetSet: 'mutirao-bairro-premium',
    premiumTheme: 'mutirao-bairro-premium',
    audioProfile: 'mutirao-bairro-sfx-v1',
    season: 's1-verao-26',
    campaignRole: 'Distribuição da mensagem e fixação de marca.',
    funRole: 'aprofundamento',
    deviceSupport: ['mobile', 'desktop'],
    priorityScore: 80
  },
  {
    id: 'cooperativa-na-pressao',
    slug: 'cooperativa-na-pressao',
    title: 'Cooperativa na Pressao - Chao de Fabrica Coletivo',
    description: 'Arcade de coordenacao produtiva em sessao curta. Organize celulas de trabalho.',
    shortDescription: 'Vertical slice arcade de cooperativismo e ajuda mutua',
    theme: 'labor',
    genre: 'arcade',
    icon: '🏭',
    cover: '/games/cooperativa-na-pressao.jpg',
    status: 'beta',
    runtimeState: 'real',
    estimatedMinutes: 2,
    duration: '1-2 min',
    participants: 1,
    difficulty: 'medium',
    tags: ['arcade', 'cooperativa', 'trabalho coletivo'],
    cta: 'Coordenar',
    color: '#356451',
    kind: 'arcade',
    engineId: 'cooperativa-na-pressao-v1',
    pace: 'quick',
    line: 'trabalho',
    territoryScope: 'estado-rj',
    territories: ['estado-rj'],
    politicalThemes: ['cooperativismo', 'trabalho'],
    series: 'serie-trabalho-sobrevivencia',
    politicalAxis: 'poder-popular',
    collectiveSolutionType: 'cooperativismo',
    commonVsMarket: 'comum',
    campaignFrame: 'comunidade-em-luta',
    visualVersion: 'T42-slice-v1',
    assetSet: 'cooperativa-p0',
    premiumTheme: 'cooperativa-slice',
    audioProfile: 'cooperativa-sfx-v1',
    season: 's1-verao-26',
    campaignRole: 'Distribuição da mensagem.',
    funRole: 'aprofundamento',
    deviceSupport: ['desktop'],
    priorityScore: 70
  },
  {
    id: 'passe-livre-nacional',
    slug: 'passe-livre-nacional',
    title: 'Passe Livre Nacional - Sindicato em Movimento',
    description: 'Arcade de posicionamento coletivo. Coordene uma rede de transporte gratuita.',
    shortDescription: 'Arcade real de coordenação e defesa do transporte coletivo',
    theme: 'labor',
    genre: 'arcade',
    icon: '⚡',
    cover: '/games/passe-livre-nacional.jpg',
    status: 'live',
    runtimeState: 'real',
    estimatedMinutes: 3,
    duration: '1-3 min',
    participants: 1,
    difficulty: 'medium',
    tags: ['arcade', 'passe livre', 'mobilidade'],
    cta: 'Organizar',
    color: '#1B6E0D',
    kind: 'arcade',
    engineId: 'passe-livre-nacional-v1',
    pace: 'quick',
    line: 'organizacao-popular',
    territoryScope: 'estado-rj',
    territories: ['estado-rj'],
    politicalThemes: ['tarifa-zero', 'transporte'],
    series: 'serie-solucoes-coletivas',
    politicalAxis: 'poder-popular',
    collectiveSolutionType: 'autogestao',
    commonVsMarket: 'comum',
    campaignFrame: 'comunidade-em-luta',
    season: 's1-verao-26',
    campaignRole: 'Distribuição da mensagem.',
    funRole: 'aprofundamento',
    deviceSupport: ['mobile', 'desktop'],
    priorityScore: 75
  },
  {
    id: 'cidade-real',
    slug: 'cidade-real',
    title: 'Cidade Real',
    description: 'Um simulador de decisões orçamentárias municipais. Você é responsável pelo cuidado.',
    shortDescription: 'Simule o orçamento de uma cidade real',
    theme: 'city',
    genre: 'simulation',
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
    territories: ['volta-redonda'],
    politicalThemes: ['servicos-publicos', 'saude', 'educacao'],
    series: 'serie-volta-redonda',
    politicalAxis: 'reforma-estatal',
    collectiveSolutionType: 'controle-popular',
    commonVsMarket: 'misto',
    campaignFrame: 'projeto-coletivo',
    season: 's1-verao-26',
    campaignRole: 'Distribuição da mensagem.',
    funRole: 'aprofundamento',
    deviceSupport: ['desktop'],
    isFeatured: true,
    priorityScore: 85
  },
  {
    id: 'abandonado',
    slug: 'abandonado',
    title: 'Abandonado',
    description: 'Explore um mapa interativo de edifícios abandonados em sua região.',
    shortDescription: 'Mapeie memória e abandono na cidade',
    theme: 'abandonment',
    genre: 'simulation',
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
    territories: ['volta-redonda'],
    politicalThemes: ['memoria', 'moradia'],
    series: 'serie-cidade-abandonada',
    politicalAxis: 'poder-popular',
    collectiveSolutionType: 'autogestao',
    commonVsMarket: 'comum',
    campaignFrame: 'comunidade-em-luta',
    season: 's1-verao-26',
    campaignRole: 'Distribuição da mensagem.',
    funRole: 'aprofundamento',
    deviceSupport: ['desktop'],
    priorityScore: 60
  },
  {
    id: 'trabalho-impossivel',
    slug: 'trabalho-impossivel',
    title: 'Escolhas Impossíveis',
    description: 'Um jogo de dilemas do trabalhador urbano. Escolhas reais sem respostas certas.',
    shortDescription: 'Escolhas impossíveis de um trabalhador',
    theme: 'labor',
    genre: 'narration',
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
    territories: ['sul-fluminense'],
    politicalThemes: ['trabalho'],
    series: 'serie-trabalho-sobrevivencia',
    politicalAxis: 'mercado',
    collectiveSolutionType: 'nao-definido',
    commonVsMarket: 'mercado',
    campaignFrame: 'projeto-coletivo',
    season: 's1-verao-26',
    campaignRole: 'Distribuição da mensagem.',
    funRole: 'aprofundamento',
    deviceSupport: ['mobile', 'desktop'],
    priorityScore: 50
  },
  {
    id: 'voto-consciente',
    slug: 'voto-consciente',
    title: 'Voto Consciente',
    description: 'Um quiz que desvela suas posições políticas reais.',
    shortDescription: 'Descubra suas posições políticas reais',
    theme: 'rights',
    genre: 'quiz',
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
    territories: ['estado-rj'],
    politicalThemes: ['organizacao-popular'],
    series: 'serie-campanha-missoes-estado',
    politicalAxis: 'reforma-estatal',
    collectiveSolutionType: 'controle-popular',
    commonVsMarket: 'misto',
    campaignFrame: 'defesa-dos-comuns',
    season: 's1-verao-26',
    campaignRole: 'Distribuição da mensagem.',
    funRole: 'aprofundamento',
    deviceSupport: ['mobile', 'desktop'],
    priorityScore: 40
  },
  {
    id: 'memoria-coletiva',
    slug: 'memoria-coletiva',
    title: 'Memória Coletiva',
    description: 'Um jogo de associação e descoberta. Visuais de momentos políticos reais.',
    shortDescription: 'Jogo de memória política e urbana',
    theme: 'memory',
    genre: 'narration',
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
    territories: ['volta-redonda'],
    politicalThemes: ['memoria'],
    series: 'serie-cidade-abandonada',
    politicalAxis: 'poder-popular',
    collectiveSolutionType: 'ajuda-mutua',
    commonVsMarket: 'comum',
    campaignFrame: 'comunidade-em-luta',
    season: 's1-verao-26',
    campaignRole: 'Distribuição da mensagem.',
    funRole: 'aprofundamento',
    deviceSupport: ['mobile', 'desktop'],
    priorityScore: 45
  },
  {
    id: 'transporte-urgente',
    slug: 'transporte-urgente',
    title: 'Transporte Urgente',
    description: 'Uma narrativa interativa sobre mobilidade urbana. Suas escolhas definem rota.',
    shortDescription: 'Narrativa sobre mobilidade urbana precária',
    theme: 'city',
    genre: 'narration',
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
    territories: ['volta-redonda'],
    politicalThemes: ['transporte', 'trabalho'],
    series: 'serie-volta-redonda',
    politicalAxis: 'reforma-estatal',
    collectiveSolutionType: 'tarifa-zero',
    commonVsMarket: 'misto',
    campaignFrame: 'projeto-coletivo',
    season: 's1-verao-26',
    campaignRole: 'Distribuição da mensagem.',
    funRole: 'aprofundamento',
    deviceSupport: ['mobile', 'desktop'],
    priorityScore: 55
  },
  {
    id: 'custo-de-viver',
    slug: 'custo-de-viver',
    title: 'Custo de Viver',
    description: 'Um quiz relâmpago sobre realidade econômica em Volta Redonda.',
    shortDescription: 'Quiz sobre custo de vida em VR',
    theme: 'labor',
    genre: 'quiz',
    icon: '💰',
    cover: '/games/custo-de-viver.jpg',
    status: 'beta',
    runtimeState: 'real',
    estimatedMinutes: 2,
    duration: '1-2 min',
    participants: 1,
    difficulty: 'easy',
    tags: ['custo de vida', 'economia', 'quick'],
    cta: 'Calcular',
    color: '#C97E2F',
    kind: 'quiz',
    engineId: 'custo-de-viver',
    pace: 'quick',
    line: 'trabalho',
    territoryScope: 'volta-redonda',
    territories: ['volta-redonda'],
    politicalThemes: ['trabalho'],
    series: 'serie-trabalho-sobrevivencia',
    politicalAxis: 'reforma-estatal',
    collectiveSolutionType: 'cooperativismo',
    commonVsMarket: 'misto',
    campaignFrame: 'projeto-coletivo',
    season: 's1-verao-26',
    campaignRole: 'Distribuição da mensagem.',
    funRole: 'aprofundamento',
    deviceSupport: ['mobile', 'desktop'],
    isNew: true,
    priorityScore: 65
  },
  {
    id: 'quem-paga-a-conta',
    slug: 'quem-paga-a-conta',
    title: 'Quem Paga a Conta?',
    description: 'Um quiz relâmpago sobre responsabilidade fiscal e serviços essenciais.',
    shortDescription: 'Quiz sobre quem deve pagar serviços públicos',
    theme: 'rights',
    genre: 'quiz',
    icon: '💸',
    cover: '/games/quem-paga-a-conta.jpg',
    status: 'beta',
    runtimeState: 'real',
    estimatedMinutes: 2,
    duration: '1-2 min',
    participants: 1,
    difficulty: 'easy',
    tags: ['responsabilidade', 'Estado', 'quick'],
    cta: 'Responder',
    color: '#FFB81C',
    kind: 'quiz',
    engineId: 'quem-paga-a-conta',
    pace: 'quick',
    line: 'organizacao-popular',
    territoryScope: 'estado-rj',
    territories: ['estado-rj'],
    politicalThemes: ['servicos-publicos'],
    series: 'serie-campanha-missoes-estado',
    politicalAxis: 'reforma-estatal',
    collectiveSolutionType: 'controle-popular',
    commonVsMarket: 'misto',
    campaignFrame: 'defesa-dos-comuns',
    season: 's1-verao-26',
    campaignRole: 'Distribuição da mensagem.',
    funRole: 'aprofundamento',
    deviceSupport: ['mobile', 'desktop'],
    isNew: true,
    priorityScore: 60
  },
  {
    id: 'cidade-em-comum',
    slug: 'cidade-em-comum',
    title: 'Cidade em Comum',
    description: 'Quiz relampago sobre saidas coletivas para o cotidiano.',
    shortDescription: 'Qual solucao coletiva voce prioriza para a cidade?',
    theme: 'rights',
    genre: 'quiz',
    icon: '🤝',
    cover: '/games/cidade-em-comum.jpg',
    status: 'beta',
    runtimeState: 'real',
    estimatedMinutes: 2,
    duration: '1-2 min',
    participants: 1,
    difficulty: 'easy',
    tags: ['organizacao popular', 'comum', 'quick'],
    cta: 'Construir',
    color: '#2E7D5B',
    kind: 'quiz',
    engineId: 'cidade-em-comum',
    pace: 'quick',
    line: 'organizacao-popular',
    territoryScope: 'estado-rj',
    territories: ['estado-rj'],
    politicalThemes: ['organizacao-popular', 'cooperativismo'],
    series: 'serie-solucoes-coletivas',
    politicalAxis: 'poder-popular',
    collectiveSolutionType: 'autogestao',
    commonVsMarket: 'comum',
    campaignFrame: 'defesa-dos-comuns',
    season: 's1-verao-26',
    campaignRole: 'Distribuição da mensagem.',
    funRole: 'aprofundamento',
    deviceSupport: ['mobile', 'desktop'],
    isNew: true,
    priorityScore: 70
  }
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


export function getGamesByGenre(genre: GameGenre): Game[] {
  return games.filter((game) => game.genre === genre);
}

export function getGamesByTerritory(scope: TerritoryScope): Game[] {
  return games.filter((game) => game.territories.includes(scope));
}

export function getGamesByPoliticalTheme(theme: PoliticalTheme): Game[] {
  return games.filter((game) => game.politicalThemes.includes(theme));
}

export function getFeaturedGames(): Game[] {
  return games.filter((game) => game.isFeatured).sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getNewGames(): Game[] {
  return games.filter((game) => game.isNew).sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getGamesByDevice(device: DeviceSupport): Game[] {
  return games.filter((game) => game.deviceSupport.includes(device));
}


export function getGamesByPoliticalAxis(axis: PoliticalAxis): Game[] {
  return games.filter((game) => game.politicalAxis === axis);
}

export function getPortfolioStage(game: Game): PortfolioStage {
  if (game.slug === 'mutirao-do-bairro') {
    return 'validating';
  }
  if (game.status === 'live') {
    return 'live';
  }
  if (game.status === 'beta') {
    return 'validating';
  }
  return 'coming';
}

export const plannedGameCandidates: PlannedGameCandidate[] = [
  
  {
    slug: 'orcamento-do-comum',
    title: 'Orcamento do Comum',
    type: 'session',
    status: 'backlog-frio',
    territoryScope: 'estado-rj',
    series: 'serie-campanha-missoes-estado',
    politicalAxis: 'poder-popular',
    campaignRole: 'Traduzir disputa do fundo publico em controle popular e decisao coletiva.',
    funnelRole: 'aprofundamento',
    rationale: 'Potencia politica alta, com risco de UX/sistemas ainda alto; manter backlog frio maduro.',
  },
  {
    slug: 'rj-do-comum',
    title: 'RJ do Comum',
    type: 'session',
    status: 'backlog-frio',
    territoryScope: 'estado-rj',
    series: 'serie-rio-de-janeiro',
    politicalAxis: 'poder-popular',
    campaignRole: 'Projetar horizonte estadual do comum conectando territorios e servicos.',
    funnelRole: 'aprofundamento',
    rationale: 'Conceito ambicioso de escala estadual; manter como horizonte sem prometer implementacao imediata.',
  },
];

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

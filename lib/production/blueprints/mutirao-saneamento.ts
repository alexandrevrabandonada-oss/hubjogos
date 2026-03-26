// Mutirão de Saneamento - Production Blueprint
// T74 — Vertical Slice Build

import { GameProductionBlueprint } from '@/lib/production/types';

export const MUTIRAO_SANEAMENTO_BLUEPRINT: GameProductionBlueprint = {
  // Basic Info
  id: 'mutirao-saneamento',
  title: 'Mutirão de Saneamento',
  oneLinerPremise: 'Mobilize a comunidade para levar saneamento básico a um bairro abandonado pelo poder público',
  
  // Genre & Technical
  genre: 'simulation',
  targetPace: 'session',
  runtimeType: 'simulation_snapshot',
  estimatedMinutes: 5,
  
  // Political Framing
  politicalThemes: ['organizacao-popular', 'cuidado', 'moradia', 'servicos-publicos'],
  primaryFantasy: 'Organizador comunitário mobilizando vizinhos para soluções coletivas',
  corePoliticalMessage: 'Saneamento é direito fundamental, e quando o Estado abandona, o povo se organiza. Cuidado coletivo é resistência.',
  
  // Territory
  territoryScope: 'baixada',
  territorialSetting: 'Vila Esperança, bairro da Baixada Fluminense sem infraestrutura de saneamento',
  localContext: 'Comunidade de 500 famílias sem rede de esgoto, água irregular, e descaso municipal cronificado. A prefeitura promete desde 2018.',
  
  // Gameplay
  coreLoop: 'Observar condições → Identificar problemas críticos → Mobilizar atores → Alocar recursos coletivos → Executar ações → Resolver ou conter crises',
  winConditions: [
    'Saneamento básico funcionando para 80%+ das famílias',
    'Confiança comunitária mantida acima de 60%',
    'Pelo menos 3 ações coletivas bem-sucedidas'
  ],
  failConditions: [
    'Confiança comunitária colapsa (0%)',
    'Risco de saúde pública atinge nível crítico',
    'Tempo esgotado com menos de 30% de cobertura'
  ],
  difficulty: 'medium',
  replayability: 'high',
  
  // Hub Integration
  entryPageFraming: {
    whyItMattersStruggle: 'Saneamento é saúde, dignidade e direito. Milhões de brasileiros vivem sem esgoto tratado ou água potável.',
    whyItMattersRelevance: 'O poder público abandona periferias enquanto investe em áreas nobres. A organização comunitária é resposta.',
    whyItMattersInvitation: 'Experimente coordenar um mutirão de cuidado. Sinta o peso da escassez e a força do coletivo.',
  },
  resultModel: 'territory_state',
  shareabilityAngle: 'Nosso bairro, nosso cuidado! Conseguimos saneamento através da organização popular.',
  
  // Assets
  assetNeeds: {
    environments: 'moderate',
    characters: 'minimal',
    props: 'moderate',
    uiHuds: 'moderate',
    promoImages: 'moderate',
    heroMedia: 'moderate',
    sound: 'music',
  },
  
  // Production
  complexity: 'medium',
  strategicValue: 'critical',
  productionCost: 'medium',
  riskLevel: 'medium',
  
  suggestedTeam: {
    designers: 1,
    developers: 1,
    artists: 1,
    sound: 1,
  },
  
  estimatedWeeks: 4,
  
  dependencies: [
    'T72 simulation runtime',
    'Asset pipeline',
    'Territorial research',
  ],
  
  blockers: [],
  
  status: 'vertical_slice',
  priorityScore: 92,
};

// --- Vertical Slice Scope Definition ---

export interface VerticalSliceScope {
  // One Territory
  territory: {
    name: string;
    description: string;
    families: number;
    criticalIssues: string[];
  };
  
  // One Session Loop
  session: {
    phases: string[];
    duration: number;
    keyDecisions: number;
  };
  
  // One Crisis Pattern
  crisis: {
    name: string;
    trigger: string;
    escalation: string[];
    resolution: string;
  };
  
  // Actor Set
  actors: {
    residents: number;
    leaders: number;
    volunteers: number;
    authorities: string;
    allies: string;
  };
  
  // Result Flow
  result: {
    states: string[];
    metrics: string[];
  };
}

export const MUTIRAO_VERTICAL_SLICE_SCOPE: VerticalSliceScope = {
  territory: {
    name: 'Vila Esperança',
    description: 'Bairro da Baixada Fluminense, município fictício baseado em Japeri/Queimados',
    families: 500,
    criticalIssues: [
      'Esgoto a céu aberto na Rua das Palmeiras',
      'Água encanada irregular (3x por semana)',
      'Lixão a céu aberto no terreno baldio',
      'Mosquito da dengue proliferando',
      'Crianças com doenças de pele',
    ],
  },
  
  session: {
    phases: [
      'Diagnóstico inicial (30s)',
      'Mobilização (1min)',
      'Ação coletiva (2min)',
      'Crises emergentes (1min)',
      'Resultado (30s)',
    ],
    duration: 5,
    keyDecisions: 8,
  },
  
  crisis: {
    name: 'Surto de Dengue',
    trigger: 'Água parada + lixo acumulado atinge ponto crítico',
    escalation: [
      'Primeiros casos suspeitos',
      'Posto de saúde lotado',
      'Pânico na comunidade',
      'Morte de criança (game over)',
    ],
    resolution: 'Mutirão de limpeza + caixa d\'água improvisada',
  },
  
  actors: {
    residents: 5,
    leaders: 2,
    volunteers: 3,
    authorities: 'Prefeitura omissa (NPC inativo)',
    allies: 'ONG Água para Todos',
  },
  
  result: {
    states: [
      'Bairro Respirou',
      'Crise Contida',
      'Mutirão Insuficiente',
      'Abandono Venceu',
      'Cuidado Coletivo Floresceu',
    ],
    metrics: [
      'Cobertura de saneamento (%)',
      'Confiança comunitária (%)',
      'Risco de saúde pública (0-10)',
      'Ações coletivas realizadas',
      'Tempo decorrido',
    ],
  },
};

// --- Resource/Tension Model ---

export interface ResourceModel {
  // Community Resources
  confianca: {
    name: string;
    initial: number;
    max: number;
    description: string;
    decayFactors: string[];
    growthFactors: string[];
  };
  energiaVoluntaria: {
    name: string;
    initial: number;
    max: number;
    description: string;
    regenRate: number;
    depleteFactors: string[];
  };
  materiais: {
    name: string;
    types: string[];
    scarcity: 'high' | 'medium' | 'low';
    acquisition: string[];
  };
  
  // Tensions/Threats
  riscoSaude: {
    name: string;
    initial: number;
    criticalThreshold: number;
    escalationTriggers: string[];
    description: string;
  };
  pressaoTempo: {
    name: string;
    totalTurns: number;
    description: string;
  };
  abandonoEstatal: {
    name: string;
    effect: string;
    description: string;
  };
  momentumColetivo: {
    name: string;
    mechanics: string;
    description: string;
  };
}

export const MUTIRAO_RESOURCE_MODEL: ResourceModel = {
  confianca: {
    name: 'Confiança Comunitária',
    initial: 50,
    max: 100,
    description: 'O quanto os moradores acreditam que a organização coletiva funciona',
    decayFactors: ['Promessas não cumpridas', 'Crises não resolvidas', 'Lideranças em conflito'],
    growthFactors: ['Pequenas vitórias', 'Ações concretas', 'Comunicação transparente'],
  },
  
  energiaVoluntaria: {
    name: 'Energia Voluntária',
    initial: 30,
    max: 50,
    description: 'Horas de trabalho disponíveis da comunidade (cansam, têm família, trabalho)',
    regenRate: 5,
    depleteFactors: ['Ações repetitivas', 'Falta de resultados', 'Desistências'],
  },
  
  materiais: {
    name: 'Materiais',
    types: ['Tijolos', 'Cimento', 'Canos', 'Tela', 'Ferramentas'],
    scarcity: 'high',
    acquisition: ['Doações', 'Compra coletiva', 'Catador', 'Sucata'],
  },
  
  riscoSaude: {
    name: 'Risco de Saúde Pública',
    initial: 3,
    criticalThreshold: 8,
    escalationTriggers: ['Lixo acumulado', 'Água parada', 'Esgoto exposto'],
    description: 'Nível de risco sanitário (0=seguro, 10=epidemia)',
  },
  
  pressaoTempo: {
    name: 'Tempo',
    totalTurns: 12,
    description: 'Cada turno = uma semana. Epidemia de dengue chega no turno 8 se não contida.',
  },
  
  abandonoEstatal: {
    name: 'Abandono Estatal',
    effect: 'Nenhuma ajuda oficial disponível. Tudo depende da comunidade.',
    description: 'O Estado está ausente. Cada tentativa de contato é ignorada ou burocratizada.',
  },
  
  momentumColetivo: {
    name: 'Momentum Coletivo',
    mechanics: 'Consecutivos sucessos aumentam eficiência. Consecutivas falhas desmoralizam.',
    description: 'O coletivo se fortalece com vitórias, desanima com derrotas.',
  },
};

// --- Actor Types ---

export interface ActorType {
  id: string;
  name: string;
  type: 'resident' | 'leader' | 'volunteer' | 'authority' | 'ally' | 'problem';
  description: string;
  icon: string;
  role: string;
  impact: 'high' | 'medium' | 'low';
  interaction: string;
  state: 'active' | 'doubtful' | 'resistant' | 'exhausted';
}

export const MUTIRAO_ACTORS: ActorType[] = [
  {
    id: 'dona-rita',
    name: 'Dona Rita',
    type: 'leader',
    description: 'Líder comunitária, 65 anos, mora há 40 anos na Vila. Conhece todo mundo.',
    icon: '👵',
    role: 'Mobilizadora. Quando convence, traz 3-5 famílias.',
    impact: 'high',
    interaction: 'Conversar → Mobilizar → Descansar (cansa)',
    state: 'active',
  },
  {
    id: 'joao-pedreiro',
    name: 'João Pedreiro',
    type: 'volunteer',
    description: 'Trabalha na construção civil. Sabe fazer caixa d\'água, ligar encanamento.',
    icon: '👷',
    role: 'Executa obras técnicas. Sem ele, só trabalho braçal.',
    impact: 'high',
    interaction: 'Oferecer material → Executar obra → Formar outros',
    state: 'active',
  },
  {
    id: 'tia-neide',
    name: 'Tia Neide',
    type: 'resident',
    description: 'Mãe de 3, filhos com problemas de pele. Desconfiada de promessas.',
    icon: '🙋‍♀️',
    role: 'Representa os mais atingidos. Sua conversa é crucial.',
    impact: 'medium',
    interaction: 'Ouvir problema → Propor solução → Ganhar confiança',
    state: 'doubtful',
  },
  {
    id: 'prefeitura',
    name: 'Prefeitura',
    type: 'authority',
    description: 'Omisso. Protocolos, promessas, nada concreto.',
    icon: '🏛️',
    role: 'Antagonista institucional. Tenta desmobilizar.',
    impact: 'low',
    interaction: 'Pressionar → Protocolar → Ignorar',
    state: 'resistant',
  },
  {
    id: 'maria-agua',
    name: 'Maria da ONG',
    type: 'ally',
    description: 'ONG Água para Todos. Traz conhecimento técnico, poucos recursos.',
    icon: '💧',
    role: 'Aliada externa. Capacita, orienta, conecta.',
    impact: 'medium',
    interaction: 'Receber capacitação → Multiplicar conhecimento',
    state: 'active',
  },
  {
    id: 'esgoto-rua',
    name: 'Esgoto na Rua',
    type: 'problem',
    description: 'Cano estourado há 6 meses. Crianças brincam perto. Doença.',
    icon: '⚠️',
    role: 'Problema crítico. Causa risco de saúde, desanima moradores.',
    impact: 'high',
    interaction: 'Diagnosticar → Alocar recursos → Resolver',
    state: 'active',
  },
  {
    id: 'lixao',
    name: 'Lixão a Céu Aberto',
    type: 'problem',
    description: 'Terreno baldio virou lixão. Mosquitos. Prefeitura não limpa.',
    icon: '🗑️',
    role: 'Causa surto de dengue. Urgente.',
    impact: 'high',
    interaction: 'Mutirão de limpeza → Cerca → Jardim comunitário',
    state: 'active',
  },
];

// --- Territorial Atmosphere ---

export interface TerritorialAtmosphere {
  naming: {
    streets: string[];
    landmarks: string[];
    localTerms: string[];
  };
  visual: {
    colorPalette: string[];
    textures: string[];
    light: string;
  };
  sound: {
    ambient: string[];
    music: string;
  };
  storytelling: {
    graffiti: string[];
    posters: string[];
    conversations: string[];
  };
}

export const MUTIRAO_ATMOSPHERE: TerritorialAtmosphere = {
  naming: {
    streets: [
      'Rua das Palmeiras',
      'Beco da Esperança', 
      'Travessa do Sol',
      'Viela da Paz',
      'Rua Principal (sem nome oficial)',
    ],
    landmarks: [
      'Bar do Seu Jorge',
      'Creche Comunitária',
      'Campinho de terra',
      'Ponto de ônibus',
      'Igreja Nossa Senhora',
    ],
    localTerms: [
      'mutirão',
      'gambiarra',
      'se virar',
      'jeitinho',
      'comunidade',
      'bairro',
      'quintal',
      'terreno baldio',
    ],
  },
  
  visual: {
    colorPalette: [
      '#8B4513', // Terra
      '#CD853F', // Caramelo
      '#228B22', // Verde vegetação
      '#4682B4', // Azul água
      '#DC143C', // Vermelho alerta
      '#F0E68C', // Amarelo seco
    ],
    textures: [
      'terra batida',
      'concreto imperfeito',
      'tijolo aparente',
      'telha amarelada',
      'fio solto',
      'vegetação invadindo',
    ],
    light: 'Sol forte, sombras duras, claridade que cansa',
  },
  
  sound: {
    ambient: [
      'Cachorro latindo',
      'Moto passando',
      'Gritos de criança',
      'Som de obra',
      'Rádio no bar',
    ],
    music: 'Forró pé de serra, funk comunitário, hinos religiosos',
  },
  
  storytelling: {
    graffiti: [
      'SANEAMENTO É DIREITO!',
      'A PREFEITURA NÃO VAI SALVAR NÓS',
      'VILA ESPERANÇA RESISTE',
      'ÁGUA LIMPA JÁ!',
    ],
    posters: [
      'Cartaz de reunião comunitária',
      'Aviso de corte de água',
      'Campanha de vacinação',
      'Panfleto de ONG',
    ],
    conversations: [
      '"Já são 3 crianças com verme esse mês..."',
      '"A prefeitura veio, tirou foto, sumiu."',
      '"Meu João pedreiro sabe fazer caixa d\'água, mas precisa de cimento."',
      '"Mutirão sábado, quem vem?"',
    ],
  },
};

// --- Result States ---

export interface ResultState {
  id: string;
  name: string;
  severity: 'triumph' | 'success' | 'neutral' | 'struggle' | 'collapse';
  conditions: string;
  title: string;
  summary: string;
  interpretation: string;
  politicalFraming: {
    struggle: string;
    tension: string;
    reflection: string;
  };
  shareData: {
    title: string;
    description: string;
    hashtags: string[];
  };
  nextStepRecommendation: string;
}

export const MUTIRAO_RESULT_STATES: ResultState[] = [
  {
    id: 'bairro-respirou',
    name: 'Bairro Respirou',
    severity: 'success',
    conditions: 'Cobertura ≥ 70%, Confiança ≥ 60%, Risco ≤ 4',
    title: 'Bairro Respirou!',
    summary: 'A comunidade se organizou e garantiu saneamento básico para a maioria.',
    interpretation: 'Quando o povo se une, o impossível acontece. A prefeitura não veio, mas o bairro não esperou.',
    politicalFraming: {
      struggle: 'O direito à saúde e saneamento é conquistado, não concedido.',
      tension: 'O Estado abandonou, mas o coletivo respondeu.',
      reflection: 'Se cada bairro se organizasse assim, que cidade teríamos?',
    },
    shareData: {
      title: '🚰 Vila Esperança respirou!',
      description: 'Conseguimos saneamento através do mutirão comunitário. Quando o povo se une, acontece!',
      hashtags: ['MutirãoDeSaneamento', 'OrganizaçãoPopular', 'BaixadaResiste'],
    },
    nextStepRecommendation: 'Tente um território mais desafiador ou aprofunde na simulação.',
  },
  
  {
    id: 'crise-contida',
    name: 'Crise Contida',
    severity: 'neutral',
    conditions: 'Cobertura 40-70%, Confiança 30-60%, Risco 4-6',
    title: 'Crise Contida',
    summary: 'Conseguimos conter o pior, mas o bairro ainda sofre.',
    interpretation: 'A vitória foi parcial. O esforço foi heróico, mas a estrutura do abandono permanece.',
    politicalFraming: {
      struggle: 'Organização popular consegue salvar vidas, mas não substitui o Estado.',
      tension: 'Mutirão contém, mas não resolve o sistema de abandono.',
      reflection: 'Até onde o esforço comunitário pode chegar sem apoio institucional?',
    },
    shareData: {
      title: '⚠️ Contivemos a crise, mas a luta continua',
      description: 'Mutirão salvou vidas, mas o saneamento ainda é precário. Precisamos de mais!',
      hashtags: ['MutirãoDeSaneamento', 'LutaContinua'],
    },
    nextStepRecommendation: 'Tente de novo com mais planejamento ou escolha um jogo de maior escala.',
  },
  
  {
    id: 'mutirao-insuficiente',
    name: 'Mutirão Insuficiente',
    severity: 'struggle',
    conditions: 'Cobertura 20-40%, Confiança 10-30%, Risco 6-8',
    title: 'Mutirão Insuficiente',
    summary: 'A mobilização não foi suficiente. O bairro continua sofrendo.',
    interpretation: 'A intenção era boa, mas faltou coordenação, recursos ou energia. O abandono vence dessa vez.',
    politicalFraming: {
      struggle: 'Organização é necessária mas não suficiente — precisa de massa crítica.',
      tension: 'Desistência e cansaço minam o coletivo antes da vitória.',
      reflection: 'Como manter a energia do mutirão quando os resultados demoram?',
    },
    shareData: {
      title: '💔 O mutirão não foi suficiente dessa vez',
      description: 'A luta é difícil. Precisamos de mais gente, mais recursos, mais apoio.',
      hashtags: ['MutirãoDeSaneamento', 'NãoDesistimos'],
    },
    nextStepRecommendation: 'Jogue novamente, focando na mobilização inicial.',
  },
  
  {
    id: 'abandono-venceu',
    name: 'Abandono Venceu',
    severity: 'collapse',
    conditions: 'Cobertura < 20%, Confiança < 10%, Risco > 8',
    title: 'Abandono Venceu',
    summary: 'A comunidade desistiu. O Estado nunca veio. O bairro foi tragado pela crise.',
    interpretation: 'Sem organização, sem Estado, sem esperança. A morte vem de doença prevenível.',
    politicalFraming: {
      struggle: 'O abandono estatal mata. A falta de organização coletiva deixa o povo vulnerável.',
      tension: 'Individualização = vulnerabilidade. Coletividade = sobrevivência.',
      reflection: 'Quantas Vilas Esperanças existem, abandonadas e esquecidas?',
    },
    shareData: {
      title: '⚠️ O abandono venceu. Mas não desistimos.',
      description: 'A luta por saneamento é difícil. Cada tentativa ensina. A próxima vai dar certo.',
      hashtags: ['MutirãoDeSaneamento', 'NãoDesistimos', 'JustiçaAmbiental'],
    },
    nextStepRecommendation: 'Recomece, analisando onde errou. Ou tente um jogo diferente sobre o tema.',
  },
  
  {
    id: 'cuidado-coletivo-floresceu',
    name: 'Cuidado Coletivo Floresceu',
    severity: 'triumph',
    conditions: 'Cobertura ≥ 80%, Confiança ≥ 80%, Risco ≤ 2, 5+ ações coletivas',
    title: 'Cuidado Coletivo Floresceu!',
    summary: 'Além do saneamento, o bairro descobriu sua força. Nasceu um novo comum.',
    interpretation: 'Não foi só sobre encanamento. Foi sobre o povo se reconhecer como agente de transformação.',
    politicalFraming: {
      struggle: 'Saneamento foi porta de entrada para reorganização comunitária completa.',
      tension: 'Do cuidado com a água nasceu cuidado com tudo: crianças, idosos, praça, futuro.',
      reflection: 'Cuidado coletivo é semente de autonomia comunitária.',
    },
    shareData: {
      title: '🌱 Vila Esperança floresceu!',
      description: 'Do mutirão de saneamento nasceu um novo comum. Cuidado coletivo é resistência!',
      hashtags: ['MutirãoDeSaneamento', 'CuidadoColetivo', 'PoderPopular'],
    },
    nextStepRecommendation: 'Você dominou este território. Explore outros jogos de sistema.',
  },
];

// --- Art Direction Baseline ---

export interface ArtDirectionBaseline {
  uiTone: string;
  environmentStyle: string;
  iconStyle: string;
  hudStyle: string;
  colorLogic: string;
  keyScene: string;
  placeholders: {
    allowed: string[];
    mustReplace: string[];
  };
}

export const MUTIRAO_ART_DIRECTION: ArtDirectionBaseline = {
  uiTone: 'Orgânico, humano, não-corporativo. Papel, giz, tinta. Sem gradients frios.',
  environmentStyle: 'Estética de periferia realista mas não deprimente. Cores da terra, da vegetação, do sol.',
  iconStyle: 'Hand-drawn digital. Linhas imperfeitas. Humanidade.',
  hudStyle: 'Minimal, não cobre a cena. Informação contextual no lugar certo.',
  colorLogic: 'Verde = vida/solução | Vermelho = perigo | Azul = água/esperança | Marrom = terra/realidade',
  keyScene: 'Mutirão na Rua das Palmeiras: 8 pessoas trabalhando, crianças ajudando, sol forte, progresso visível.',
  placeholders: {
    allowed: ['Personagens detalhados', 'Animações complexas'],
    mustReplace: ['Ícones genéricos', 'Cores erradas', 'Tipografia corporativa'],
  },
};

// --- Controls Definition ---

export interface ControlsDefinition {
  mobile: {
    primary: string;
    gestures: string[];
    tapTargets: string;
    hints: string[];
  };
  desktop: {
    mouse: string;
    keyboard: string[];
    hints: string[];
  };
}

export const MUTIRAO_CONTROLS: ControlsDefinition = {
  mobile: {
    primary: 'Toque para selecionar, arrastar para alocar',
    gestures: [
      'Tap: Selecionar ator/problema',
      'Drag: Mover recursos',
      'Long press: Ver detalhes',
      'Swipe: Navegar entre áreas',
    ],
    tapTargets: 'Mínimo 44x44px. Botões grandes, espaçados.',
    hints: [
      'Toque em moradores para conversar',
      'Arraste energia para ações',
      'Aperte e segure para detalhes',
    ],
  },
  desktop: {
    mouse: 'Click para selecionar, drag-and-drop para alocar',
    keyboard: [
      'Tab: Navegar entre elementos',
      'Enter: Confirmar ação',
      'Space: Pausar',
      'Esc: Menu/Voltar',
    ],
    hints: [
      'Clique em moradores para interagir',
      'Drag-and-drop para alocar recursos',
      'Clique direito para cancelar',
    ],
  },
};

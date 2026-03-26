// Game Production System
// T73 — Production Blueprint + Priority Matrix

import { GameGenre, GamePace, TerritoryScope, PoliticalTheme } from '@/lib/games/catalog';
import { RuntimeType } from '@/lib/runtime/types';
import { OutcomeType } from '@/components/result/ResultScreen';

// --- 1. Game Production Blueprint ---

export type ProductionComplexity = 'low' | 'medium' | 'high' | 'very_high';
export type AssetComplexity = 'minimal' | 'moderate' | 'rich' | 'premium';
export type StrategicValue = 'critical' | 'high' | 'medium' | 'low';
export type ProductionCost = 'low' | 'medium' | 'high' | 'very_high';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface GameProductionBlueprint {
  // Basic Info
  id: string;
  title: string;
  oneLinerPremise: string;
  
  // Genre & Technical
  genre: GameGenre;
  targetPace: GamePace;
  runtimeType: RuntimeType;
  estimatedMinutes: number;
  
  // Political Framing
  politicalThemes: PoliticalTheme[];
  primaryFantasy: string; // What does the player become/do?
  corePoliticalMessage: string;
  
  // Territory
  territoryScope: TerritoryScope;
  territorialSetting: string; // Specific description
  localContext: string;
  
  // Gameplay
  coreLoop: string;
  winConditions: string[];
  failConditions: string[];
  difficulty: DifficultyLevel;
  replayability: 'none' | 'some' | 'high';
  
  // Hub Integration (from T69-T72)
  entryPageFraming: {
    whyItMattersStruggle: string;
    whyItMattersRelevance: string;
    whyItMattersInvitation: string;
  };
  resultModel: OutcomeType;
  shareabilityAngle: string;
  
  // Assets
  assetNeeds: {
    environments: AssetComplexity;
    characters: AssetComplexity;
    props: AssetComplexity;
    uiHuds: AssetComplexity;
    promoImages: AssetComplexity;
    heroMedia: AssetComplexity;
    sound: 'none' | 'sfx' | 'music' | 'full';
  };
  
  // Production
  complexity: ProductionComplexity;
  strategicValue: StrategicValue;
  productionCost: ProductionCost;
  riskLevel: RiskLevel;
  
  // Team & Timeline
  suggestedTeam: {
    designers: number;
    developers: number;
    artists: number;
    sound?: number;
  };
  estimatedWeeks: number;
  
  // Dependencies
  dependencies: string[];
  blockers: string[];
  
  // Status
  status: ReleaseStatus;
  priorityScore: number; // 0-100
}

// --- 2. Production Tracks ---

export type ProductionTrack = 'A_quick' | 'B_systems' | 'C_premium';

export interface ProductionTrackConfig {
  id: ProductionTrack;
  label: string;
  description: string;
  characteristics: {
    sessionLength: string;
    productionTime: string;
    assetLevel: AssetComplexity;
    politicalDepth: 'surface' | 'moderate' | 'deep';
    shareability: 'low' | 'medium' | 'high';
    replayability: 'none' | 'some' | 'high';
  };
  targetGamesPerQuarter: number;
  examples: string[];
}

export const PRODUCTION_TRACKS: Record<ProductionTrack, ProductionTrackConfig> = {
  A_quick: {
    id: 'A_quick',
    label: 'Track A — Quick / Shareable',
    description: 'Jogos curtos, fáceis de terminar, altamente compartilháveis. Úteis para alcance amplo e introdução ao Hub.',
    characteristics: {
      sessionLength: '30s - 3min',
      productionTime: '1-2 semanas',
      assetLevel: 'minimal',
      politicalDepth: 'surface',
      shareability: 'high',
      replayability: 'some',
    },
    targetGamesPerQuarter: 3,
    examples: ['Quiz relâmpago', 'Arcade de ação', 'Desafio reflexivo'],
  },
  B_systems: {
    id: 'B_systems',
    label: 'Track B — Mid-depth / Systems',
    description: 'Mecânicas mais fortes, mais replayabilidade, bom para pensamento político/sistêmico.',
    characteristics: {
      sessionLength: '3-8 min',
      productionTime: '3-6 semanas',
      assetLevel: 'moderate',
      politicalDepth: 'moderate',
      shareability: 'medium',
      replayability: 'high',
    },
    targetGamesPerQuarter: 2,
    examples: ['Simulação orçamentária', 'Gestão de recursos', 'Estratégia territorial'],
  },
  C_premium: {
    id: 'C_premium',
    label: 'Track C — Premium / Deep',
    description: 'Mais ambiciosos, direção de arte forte, loops ou narrativas ricas. Menos releases, maior impacto.',
    characteristics: {
      sessionLength: '8-20 min',
      productionTime: '6-12 semanas',
      assetLevel: 'rich',
      politicalDepth: 'deep',
      shareability: 'medium',
      replayability: 'high',
    },
    targetGamesPerQuarter: 1,
    examples: ['Narrativa interativa', 'Simulação complexa', 'RPG territorial'],
  },
};

// --- 3. Release Status Model ---

export type ReleaseStatus = 
  | 'concept'           // Ideia inicial
  | 'pre_production'    // Blueprint completo, recursos alocados
  | 'prototype'         // Core loop jogável
  | 'vertical_slice'    // Slice completo (definição de done)
  | 'beta'              // Feature complete, testando
  | 'release_candidate' // Pronto para lançamento
  | 'live'              // Publicado
  | 'maintenance';      // Atualizações pontuais

export interface ReleaseStatusMetadata {
  status: ReleaseStatus;
  enteredAt: number;
  exitedAt?: number;
  notes: string;
  approvedBy?: string;
}

// --- 4. Production Readiness Matrix ---

export interface ProductionReadinessScore {
  blueprint: GameProductionBlueprint;
  scores: {
    strategicValue: number;      // 1-10
    productionCost: number;      // 1-10 (inverted)
    assetComplexity: number;     // 1-10 (inverted)
    gameplayDepth: number;       // 1-10
    mobileDifficulty: number;    // 1-10 (inverted)
    desktopQuality: number;      // 1-10
    shareability: number;        // 1-10
    politicalClarity: number;    // 1-10
    territoryStrength: number;   // 1-10
  };
  totalScore: number;
  recommendedTrack: ProductionTrack;
  priorityRank: number;
  recommendation: 'build_now' | 'build_soon' | 'build_later' | 'hold';
}

// --- 5. Vertical Slice Definition of Done ---

export interface VerticalSliceChecklist {
  // Core
  coreLoopPlayable: boolean;
  coreLoopFun: boolean; // Subjective but important
  
  // Art Direction
  artDirectionBaseline: boolean;
  visualIdentityClear: boolean;
  territorialFeelPresent: boolean;
  
  // Sound
  soundBaseline: boolean;
  audioAppropriate: boolean;
  
  // Integration
  runtimeIntegrationComplete: boolean;
  entryPageComplete: boolean;
  resultLayerComplete: boolean;
  progressionIntegrationComplete: boolean;
  
  // Quality
  mobileViable: boolean;
  desktopViable: boolean;
  basicQAPass: boolean;
  performanceAcceptable: boolean;
  shareFlowUsable: boolean;
  
  // Design
  designClarityAchieved: boolean;
  controlsStable: boolean;
  pacingAcceptable: boolean;
  framingPresent: boolean;
  noMajorUIBreaks: boolean;
  noIdentityDrift: boolean;
}

export const VERTICAL_SLICE_REQUIREMENTS: (keyof VerticalSliceChecklist)[] = [
  'coreLoopPlayable',
  'artDirectionBaseline',
  'runtimeIntegrationComplete',
  'entryPageComplete',
  'resultLayerComplete',
  'mobileViable',
  'desktopViable',
  'basicQAPass',
  'designClarityAchieved',
  'controlsStable',
  'noMajorUIBreaks',
];

// --- 6. Asset Pipeline Stages ---

export type AssetStage = 'placeholder' | 'blockout' | 'style_baseline' | 'near_final' | 'production_final';

export interface AssetPipelineItem {
  id: string;
  name: string;
  type: 'environment' | 'character' | 'prop' | 'ui_hud' | 'promo' | 'hero' | 'result' | 'sound';
  currentStage: AssetStage;
  targetStage: AssetStage;
  assignedTo?: string;
  estimatedHours: number;
  actualHours?: number;
  dependencies: string[];
  blockers: string[];
  approved: boolean;
}

export const ASSET_STAGE_DEFINITIONS: Record<AssetStage, { label: string; description: string; exitCriteria: string[] }> = {
  placeholder: {
    label: 'Placeholder',
    description: 'Asset temporário para teste de gameplay',
    exitCriteria: ['Funcional para testes', 'Claro o que será substituído'],
  },
  blockout: {
    label: 'Blockout',
    description: 'Formas básicas, proporções definidas',
    exitCriteria: ['Proporções corretas', 'Silhueta legível', 'Espaço definido'],
  },
  style_baseline: {
    label: 'Style Baseline',
    description: 'Primeira versão no estilo final',
    exitCriteria: ['Paleta definida', 'Estilo consistente', 'Direção de arte aprovada'],
  },
  near_final: {
    label: 'Near Final',
    description: 'Quase completo, detalhes pendentes',
    exitCriteria: ['95% completo', 'Feedback incorporado', 'Pequenos ajustes pendentes'],
  },
  production_final: {
    label: 'Production Final',
    description: 'Pronto para release',
    exitCriteria: ['100% completo', 'Aprovado por direção', 'Otimizado para performance'],
  },
};

// --- 7. Quality Gates for Release ---

export interface QualityGate {
  id: string;
  name: string;
  description: string;
  check: (blueprint: GameProductionBlueprint, checklist: VerticalSliceChecklist) => boolean;
  requiredFor: ReleaseStatus[];
  blocking: boolean;
}

export const QUALITY_GATES: QualityGate[] = [
  {
    id: 'design_clarity',
    name: 'Design Clarity',
    description: 'O jogo tem propósito claro e loop compreensível',
    check: (_, cl) => cl.designClarityAchieved,
    requiredFor: ['prototype', 'vertical_slice', 'beta', 'release_candidate', 'live'],
    blocking: true,
  },
  {
    id: 'stable_controls',
    name: 'Stable Controls',
    description: 'Controles responsivos e confiáveis',
    check: (_, cl) => cl.controlsStable,
    requiredFor: ['vertical_slice', 'beta', 'release_candidate', 'live'],
    blocking: true,
  },
  {
    id: 'acceptable_pacing',
    name: 'Acceptable Pacing',
    description: 'Ritmo de jogo adequado',
    check: (_, cl) => cl.pacingAcceptable,
    requiredFor: ['vertical_slice', 'beta', 'release_candidate', 'live'],
    blocking: false,
  },
  {
    id: 'framing_present',
    name: 'Political Framing',
    description: 'Framing territorial/político presente',
    check: (_, cl) => cl.framingPresent,
    requiredFor: ['vertical_slice', 'beta', 'release_candidate', 'live'],
    blocking: true,
  },
  {
    id: 'runtime_respected',
    name: 'Runtime Contract',
    description: 'Segue contrato de runtime T72',
    check: (_, cl) => cl.runtimeIntegrationComplete,
    requiredFor: ['vertical_slice', 'beta', 'release_candidate', 'live'],
    blocking: true,
  },
  {
    id: 'valid_result',
    name: 'Valid Result Output',
    description: 'Emite resultados compatíveis com T71',
    check: (_, cl) => cl.resultLayerComplete,
    requiredFor: ['vertical_slice', 'beta', 'release_candidate', 'live'],
    blocking: true,
  },
  {
    id: 'responsive_pass',
    name: 'Responsive Pass',
    description: 'Funciona em mobile e desktop',
    check: (_, cl) => cl.mobileViable && cl.desktopViable,
    requiredFor: ['beta', 'release_candidate', 'live'],
    blocking: true,
  },
  {
    id: 'no_ui_breaks',
    name: 'No Major UI Breaks',
    description: 'UI estável e funcional',
    check: (_, cl) => cl.noMajorUIBreaks,
    requiredFor: ['beta', 'release_candidate', 'live'],
    blocking: true,
  },
  {
    id: 'identity_aligned',
    name: 'Identity Alignment',
    description: 'Não desvia da identidade do Hub',
    check: (_, cl) => cl.noIdentityDrift,
    requiredFor: ['vertical_slice', 'beta', 'release_candidate', 'live'],
    blocking: true,
  },
];

// --- 8. Game Scaffold Integration ---

export interface GameScaffoldConfig {
  // T70 Entry Page
  entryPage: {
    heroMediaType: 'image' | 'video';
    whyItMattersEnabled: boolean;
    genreCuesEnabled: boolean;
  };
  
  // T72 Play Shell
  playShell: {
    runtimeType: RuntimeType;
    hudZones: string[];
    inputHintsEnabled: boolean;
    autoPauseOnBlur: boolean;
  };
  
  // T71 Result Layer
  resultLayer: {
    outcomeType: OutcomeType;
    politicalFramingEnabled: boolean;
    sharePackEnabled: boolean;
    nextStepsEnabled: boolean;
  };
  
  // T69 Progression
  progression: {
    recordCompletion: boolean;
    updateAffinities: boolean;
    emitAnalytics: boolean;
  };
}

// --- 9. Scoring Functions ---

export function calculatePriorityScore(blueprint: GameProductionBlueprint): number {
  const weights = {
    strategicValue: 2.0,
    productionCost: -1.5, // Inverted
    assetComplexity: -1.0, // Inverted
    gameplayDepth: 1.5,
    shareability: 1.0,
    politicalClarity: 1.5,
    territoryStrength: 1.0,
  };
  
  const valueMap: Record<string, number> = {
    critical: 10, high: 8, medium: 5, low: 2,
    low_cost: 10, medium_cost: 6, high_cost: 3, very_high_cost: 1,
    minimal: 10, moderate: 6, rich: 3, premium: 1,
  };
  
  let score = 0;
  score += valueMap[blueprint.strategicValue] * weights.strategicValue;
  score += valueMap[`${blueprint.productionCost}_cost`] * weights.productionCost;
  score += valueMap[blueprint.assetNeeds.environments] * weights.assetComplexity;
  score += (blueprint.replayability === 'high' ? 10 : blueprint.replayability === 'some' ? 5 : 2) * weights.gameplayDepth;
  // Shareability e politicalClarity são subjetivos, usar defaults
  score += 7 * weights.shareability;
  score += 8 * weights.politicalClarity;
  score += 7 * weights.territoryStrength;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function recommendTrack(blueprint: GameProductionBlueprint): ProductionTrack {
  if (blueprint.complexity === 'low' && blueprint.estimatedMinutes <= 3) {
    return 'A_quick';
  } else if (blueprint.complexity === 'high' || blueprint.estimatedMinutes >= 8) {
    return 'C_premium';
  } else {
    return 'B_systems';
  }
}

export function generateRecommendation(score: number): ProductionReadinessScore['recommendation'] {
  if (score >= 70) return 'build_now';
  if (score >= 50) return 'build_soon';
  if (score >= 30) return 'build_later';
  return 'hold';
}

// --- 10. Factory Functions ---

export function createBlueprintTemplate(
  genre: GameGenre,
  track: ProductionTrack
): Partial<GameProductionBlueprint> {
  const trackConfig = PRODUCTION_TRACKS[track];
  
  return {
    genre,
    targetPace: track === 'A_quick' ? 'quick' : track === 'B_systems' ? 'session' : 'deep',
    runtimeType: getDefaultRuntimeType(genre),
    estimatedMinutes: parseInt(trackConfig.characteristics.sessionLength.split('-')[1]),
    complexity: track === 'A_quick' ? 'low' : track === 'B_systems' ? 'medium' : 'high',
    strategicValue: track === 'C_premium' ? 'high' : 'medium',
    productionCost: track === 'A_quick' ? 'low' : track === 'B_systems' ? 'medium' : 'high',
    riskLevel: track === 'C_premium' ? 'high' : 'low',
    assetNeeds: {
      environments: trackConfig.characteristics.assetLevel,
      characters: track === 'A_quick' ? 'minimal' : 'moderate',
      props: 'moderate',
      uiHuds: 'moderate',
      promoImages: track === 'A_quick' ? 'minimal' : 'moderate',
      heroMedia: track === 'C_premium' ? 'rich' : 'moderate',
      sound: track === 'A_quick' ? 'sfx' : 'music',
    },
    suggestedTeam: {
      designers: 1,
      developers: track === 'C_premium' ? 2 : 1,
      artists: track === 'A_quick' ? 0 : 1,
      sound: track === 'A_quick' ? 0 : 1,
    },
    estimatedWeeks: parseInt(trackConfig.characteristics.productionTime.split('-')[0]),
    status: 'concept',
  };
}

function getDefaultRuntimeType(genre: GameGenre): RuntimeType {
  switch (genre) {
    case 'arcade': return 'arcade_instant';
    case 'platform': return 'checkpoint_based';
    case 'simulation': return 'simulation_snapshot';
    case 'management': return 'stateful_session';
    case 'strategy': return 'stateful_session';
    case 'narration': return 'branching_narrative';
    case 'quiz': return 'session_based';
    default: return 'session_based';
  }
}

// --- 11. Next 3 Priorities (Curated) ---

export const NEXT_3_BUILD_PRIORITIES: GameProductionBlueprint[] = [
  // Priority 1: Quick/Shareable (Track A)
  {
    id: 'escolha-rapida-orcamento',
    title: 'Escolha Rápida: Orçamento em Crise',
    oneLinerPremise: 'Micro-simulação de 60 segundos: onde cortar quando não dá para agradar todos?',
    genre: 'quiz',
    targetPace: 'quick',
    runtimeType: 'session_based',
    estimatedMinutes: 1,
    politicalThemes: ['orcamento', 'servicos-publicos', 'cuidado'],
    primaryFantasy: 'Gestor municipal sob pressão',
    corePoliticalMessage: 'Orçamento é escolha política, não matemática neutra',
    territoryScope: 'volta-redonda',
    territorialSetting: 'Município em crise fiscal',
    localContext: 'Volta Redonda enfrenta déficits históricos',
    coreLoop: 'Ver cenário → Escolher corte → Ver consequência → Compartilhar',
    winConditions: ['Sobreviver 5 rodadas', 'Manter serviços essenciais'],
    failConditions: ['Colapso de serviços', 'Revolta popular'],
    difficulty: 'easy',
    replayability: 'high',
    entryPageFraming: {
      whyItMattersStruggle: 'Gestão fiscal municipal afeta vida real',
      whyItMattersRelevance: 'Cidades estão quebradas e precisam de escolhas',
      whyItMattersInvitation: 'Sinta o peso de cada corte em 60 segundos',
    },
    resultModel: 'archetype',
    shareabilityAngle: 'Que tipo de gestor você é?',
    assetNeeds: {
      environments: 'minimal',
      characters: 'minimal',
      props: 'minimal',
      uiHuds: 'moderate',
      promoImages: 'minimal',
      heroMedia: 'minimal',
      sound: 'sfx',
    },
    complexity: 'low',
    strategicValue: 'high',
    productionCost: 'low',
    riskLevel: 'low',
    suggestedTeam: { designers: 1, developers: 1, artists: 0 },
    estimatedWeeks: 1,
    dependencies: ['T72 runtime'],
    blockers: [],
    status: 'concept',
    priorityScore: 85,
  },
  
  // Priority 2: Systems (Track B)
  {
    id: 'mutirao-saneamento',
    title: 'Mutirão de Saneamento',
    oneLinerPremise: 'Coordene recursos comunitários para levar água e esgoto a um bairro abandonado',
    genre: 'simulation',
    targetPace: 'session',
    runtimeType: 'simulation_snapshot',
    estimatedMinutes: 5,
    politicalThemes: ['organizacao-popular', 'cuidado', 'moradia', 'servicos-publicos'],
    primaryFantasy: 'Organizador comunitário',
    corePoliticalMessage: 'Saneamento é direito e conquista coletiva',
    territoryScope: 'baixada',
    territorialSetting: 'Bairro da Baixada sem infraestrutura',
    localContext: 'Muitos bairros da Baixada carecem de saneamento básico',
    coreLoop: 'Identificar necessidade → Mobilizar recursos → Executar obra → Medir impacto',
    winConditions: ['Saneamento universal no bairro', 'Satisfação comunitária alta'],
    failConditions: ['Desistência da comunidade', 'Recursos esgotados'],
    difficulty: 'medium',
    replayability: 'high',
    entryPageFraming: {
      whyItMattersStruggle: 'Saneamento é saúde e dignidade',
      whyItMattersRelevance: 'Bairros são abandonados pelo estado',
      whyItMattersInvitation: 'Experimente organização comunitária em ação',
    },
    resultModel: 'territory_state',
    shareabilityAngle: 'Transformamos nosso bairro!',
    assetNeeds: {
      environments: 'moderate',
      characters: 'minimal',
      props: 'moderate',
      uiHuds: 'moderate',
      promoImages: 'moderate',
      heroMedia: 'moderate',
      sound: 'music',
    },
    complexity: 'medium',
    strategicValue: 'critical',
    productionCost: 'medium',
    riskLevel: 'medium',
    suggestedTeam: { designers: 1, developers: 1, artists: 1 },
    estimatedWeeks: 4,
    dependencies: ['T72 simulation runtime', 'Asset pipeline'],
    blockers: [],
    status: 'concept',
    priorityScore: 92,
  },
  
  // Priority 3: Premium (Track C)
  {
    id: 'assembleia-territorial',
    title: 'Assembleia Territorial',
    oneLinerPremise: 'Narrativa interativa sobre participação popular em decisões municipais',
    genre: 'narration',
    targetPace: 'deep',
    runtimeType: 'branching_narrative',
    estimatedMinutes: 12,
    politicalThemes: ['organizacao-popular', 'controle-popular', 'democracia-direta'],
    primaryFantasy: 'Participante ativo na democracia local',
    corePoliticalMessage: 'Democracia direta é possível e necessária',
    territoryScope: 'volta-redonda',
    territorialSetting: 'Assembleias populares de VR',
    localContext: 'VR tem tradição de assembleias de moradores',
    coreLoop: 'Ouvir posições → Deliberar → Votar → Ver consequências',
    winConditions: ['Consenso alcançado', 'Proposta aprovada'],
    failConditions: ['Divisão irreconciliável', 'Derrota da proposta'],
    difficulty: 'medium',
    replayability: 'high',
    entryPageFraming: {
      whyItMattersStruggle: 'Democracia representativa falha nos territórios',
      whyItMattersRelevance: 'Assembleias populares são alternativa real',
      whyItMattersInvitation: 'Experimente deliberar com seus vizinhos',
    },
    resultModel: 'narrative',
    shareabilityAngle: 'Minha jornada na assembleia',
    assetNeeds: {
      environments: 'rich',
      characters: 'moderate',
      props: 'moderate',
      uiHuds: 'rich',
      promoImages: 'rich',
      heroMedia: 'rich',
      sound: 'full',
    },
    complexity: 'high',
    strategicValue: 'critical',
    productionCost: 'high',
    riskLevel: 'medium',
    suggestedTeam: { designers: 2, developers: 1, artists: 1, sound: 1 },
    estimatedWeeks: 8,
    dependencies: ['T72 narrative runtime', 'Writer', 'Art direction'],
    blockers: [],
    status: 'concept',
    priorityScore: 88,
  },
];

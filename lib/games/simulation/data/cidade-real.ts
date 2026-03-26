/**
 * Simulação: Cidade Real (V2 - Visual/Tactical Rescue)
 * Foco em distritos, projetos e consequências urbanas visíveis.
 */

import { SimulationDefinition } from '../types';

export const cidadeRealSimulation: SimulationDefinition = {
  id: 'cidade-real-v1',
  title: 'Cidade Real',
  subtitle: 'Guie o desenvolvimento e o cuidado de uma cidade sob pressão',
  totalBudget: 100, // Pontos de Ação / Capacidade Coletiva
  isVisualMode: true,
  
  districts: [
    {
      id: 'vila-popular',
      name: 'Vila Popular',
      flavor: 'Periferia histórica com serviços precários e alta densidade.',
      initialHealth: 35,
      icon: '🏘️',
      needs: ['moradia', 'saude', 'manutencao'],
    },
    {
      id: 'centro-velho',
      name: 'Centro Histórico',
      flavor: 'Coração administrativo com infraestrutura envelhecida.',
      initialHealth: 55,
      icon: '🏛️',
      needs: ['manutencao', 'transporte'],
    },
    {
      id: 'polo-industrial',
      name: 'Polo Industrial',
      flavor: 'Motor econômico com desafios de logística e poluição.',
      initialHealth: 45,
      icon: '🏭',
      needs: ['transporte', 'manutencao'],
    },
    {
      id: 'parque-das-aguas',
      name: 'Residencial Nobre',
      flavor: 'Área valorizada com demandas por segurança e estética.',
      initialHealth: 70,
      icon: '🏡',
      needs: ['manutencao'],
    },
  ],

  projects: [
    {
      id: 'upa-24h',
      label: 'UPA 24h na Vila',
      description: 'Garante atendimento emergencial onde a carência é crítica.',
      cost: 25,
      icon: '🏥',
      impacts: [
        { targetDistrictId: 'vila-popular', healthValue: 20 },
        { category: 'saude' }
      ]
    },
    {
      id: 'tarifa-zero',
      label: 'Tarifa Zero Municipal',
      description: 'Ônibus gratuitos garantem o direito de circular para todos.',
      cost: 45,
      icon: '🚌',
      impacts: [
        { targetDistrictId: 'vila-popular', healthValue: 10 },
        { targetDistrictId: 'centro-velho', healthValue: 10 },
        { targetDistrictId: 'polo-industrial', healthValue: 15 },
        { category: 'transporte' }
      ]
    },
    {
      id: 'reforma-escolas',
      label: 'Reforma de Escolas',
      description: 'Infraestrutura digna para o aprendizado das crianças.',
      cost: 20,
      icon: '📚',
      impacts: [
        { targetDistrictId: 'vila-popular', healthValue: 10 },
        { targetDistrictId: 'centro-velho', healthValue: 5 },
        { category: 'educacao' }
      ]
    },
    {
      id: 'saneamento-vila',
      label: 'Saneamento na Vila',
      description: 'Água limpa e esgoto tratado: o básico que salva vidas.',
      cost: 30,
      icon: '🚰',
      impacts: [
        { targetDistrictId: 'vila-popular', healthValue: 25 },
        { category: 'manutencao' }
      ]
    },
    {
      id: 'iluminacao-led',
      label: 'Iluminação em LED',
      description: 'Ruas claras aumentam a segurança e reduzem custos.',
      cost: 15,
      icon: '💡',
      impacts: [
        { targetDistrictId: 'parque-das-aguas', healthValue: 5 },
        { targetDistrictId: 'centro-velho', healthValue: 5 },
        { targetDistrictId: 'vila-popular', healthValue: 10 },
        { category: 'manutencao' }
      ]
    },
    {
      id: 'habitacao-centro',
      label: 'Habitação no Centro',
      description: 'Ocupar prédios vazios com aluguel social e moradia popular.',
      cost: 35,
      icon: '🏠',
      impacts: [
        { targetDistrictId: 'centro-velho', healthValue: 15 },
        { targetDistrictId: 'vila-popular', healthValue: 5 },
        { category: 'moradia' }
      ]
    }
  ],

  categories: [
    {
      key: 'saude',
      label: 'Saúde',
      icon: '🏥',
      description: 'Hospitais, unidades básicas e prevenção.',
      minBudget: 15,
      criticalThreshold: 25,
    },
    {
      key: 'educacao',
      label: 'Educação',
      icon: '📚',
      description: 'Educação pública e infraestrutura educacional.',
      minBudget: 20,
      criticalThreshold: 30,
    },
    {
      key: 'transporte',
      label: 'Transporte',
      icon: '🚌',
      description: 'Mobilidade urbana e direito à cidade.',
      minBudget: 15,
      criticalThreshold: 25,
    },
    {
      key: 'moradia',
      label: 'Moradia',
      icon: '🏠',
      description: 'Habitação popular e regularização.',
      minBudget: 10,
      criticalThreshold: 18,
    },
    {
      key: 'manutencao',
      label: 'Cuidado Urbano',
      icon: '🛣️',
      description: 'Zeladoria, saneamento e serviços básicos.',
      minBudget: 10,
      criticalThreshold: 15,
    },
  ],

  pressures: [
    {
      step: 1,
      title: 'Crise Sanitária na Vila',
      description:
        'Surtos de doenças por falta de saneamento básico na Vila Popular.',
      demandCategory: 'saude',
      demandPercentage: 20,
    },
    {
      step: 2,
      title: 'Caos no Transporte',
      description:
        'Empresas de ônibus retiram frota do Polo Industrial. Trabalhadores isolados.',
      demandCategory: 'transporte',
      demandPercentage: 25,
    },
    {
      step: 3,
      title: 'Ocupação no Centro',
      description:
        'Movimentos populares ocupam imoveis vazios no Centro Histórico exigindo moradia.',
      demandCategory: 'moradia',
      demandPercentage: 30,
    },
  ],

  results: [
    {
      id: 'cidade-viva',
      title: 'Cidade Viva e Resiliente',
      axis: 'orientacao-cuidado',
      description: 'Você priorizou o cuidado territorial e a dignidade básica.',
      revelation:
        'A Vila Popular está estabilizada e o Centro voltou a ser habitado. O Polo Industrial flui melhor com o transporte gratuito. A cidade não é perfeita, mas as bases do comum estão sólidas.',
      nextAction: 'Expandir o modelo para toda a região metropolitana.',
      impacts: [
        {
          category: 'saude',
          consequence: 'Redução drástica em internações básicas.',
          severity: 'low',
        },
      ],
    },
    {
      id: 'cidade-partida',
      title: 'Cidade Partida',
      axis: 'contencao-ajuste',
      description: 'Equilíbrio precário entre as pressões da elite e da periferia.',
      revelation:
        'Você apagou incêndios, mas os problemas estruturais permanecem. A Vila ainda sofre, o Centro está estagnado. A prefeitura sobrevive, mas a cidade apenas resiste.',
      nextAction: 'Buscar financiamento coletivo e imposto progressivo.',
      impacts: [
        {
          category: 'moradia',
          consequence: 'Déficit habitacional ainda alto.',
          severity: 'medium',
        },
      ],
    },
  ],
};

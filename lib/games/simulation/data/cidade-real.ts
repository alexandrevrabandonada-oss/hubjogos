/**
 * Simulação: Cidade Real
 * Orçamento municipal limitado sob pressões políticas reais
 */

import { SimulationDefinition } from '../types';

export const cidadeRealSimulation: SimulationDefinition = {
  id: 'cidade-real-v1',
  title: 'Cidade Real',
  subtitle: 'Simule decisões orçamentárias de uma prefeitura',
  totalBudget: 100, // unidade: milhões de reais (simulado)
  categories: [
    {
      key: 'saude',
      label: 'Saúde',
      icon: '🏥',
      description: 'Hospitais, UBS, atendimento emergencial',
      minBudget: 15,
      criticalThreshold: 25,
    },
    {
      key: 'educacao',
      label: 'Educação',
      icon: '📚',
      description: 'Escolas, professores, infraestrutura escolar',
      minBudget: 20,
      criticalThreshold: 30,
    },
    {
      key: 'transporte',
      label: 'Transporte',
      icon: '🚌',
      description: 'Ônibus, manutenção de vias, mobilidade',
      minBudget: 15,
      criticalThreshold: 25,
    },
    {
      key: 'moradia',
      label: 'Moradia e Cuidado',
      icon: '🏠',
      description: 'Habitação, assistência social, acolhimento',
      minBudget: 10,
      criticalThreshold: 18,
    },
    {
      key: 'manutencao',
      label: 'Manutenção Urbana',
      icon: '🛣️',
      description: 'Infraestrutura, limpeza, serviços essenciais',
      minBudget: 10,
      criticalThreshold: 15,
    },
  ],
  pressures: [
    {
      step: 1,
      title: 'Crise de Saúde',
      description:
        'Epidemia respiratória nas periferias. Demanda urgente por leitos hospitalares e testes.',
      demandCategory: 'saude',
      demandPercentage: 30,
    },
    {
      step: 2,
      title: 'Protesto de Transportistas',
      description:
        'Frota de ônibus envelhecida causa greves. Cidade paralisa sem transporte público.',
      demandCategory: 'transporte',
      demandPercentage: 25,
    },
    {
      step: 3,
      title: 'Defict de Professores',
      description:
        'Mais de 200 salas sem professores por atraso salarial. Pais ameaçam ocupar secretaria.',
      demandCategory: 'educacao',
      demandPercentage: 20,
    },
    {
      step: 4,
      title: 'Ocupações e Moradia',
      description:
        'Famílias ocupam prédios vazios. Mídia sensacionalista vs. demanda real por casa.',
      demandCategory: 'moradia',
      demandPercentage: 25,
    },
  ],
  results: [
    {
      id: 'austeridade-extrema',
      title: 'Austeridade Extrema',
      axis: 'austeridade-extrema',
      description: 'Cortes indiscriminados em todas as áreas',
      revelation:
        'Você cortou tudo. Saúde colapsa, educação fecha, transporte paralisa, moradia piora. A cidade não funciona, mas o déficit diminui. Emergências multiplicam-se. Próxima administração herda caos.',
      nextAction: 'Estudar economia política e limite do ajuste fiscal',
      impacts: [
        {
          category: 'saude',
          consequence: 'Hospitais fecham, epidemia avança',
          severity: 'high',
        },
        {
          category: 'educacao',
          consequence: 'Escolas operando com 30% da capacidade',
          severity: 'high',
        },
        {
          category: 'transporte',
          consequence: 'Cidade paralisa, economia encolhe',
          severity: 'high',
        },
      ],
    },
    {
      id: 'colapso-estrutural',
      title: 'Colapso Estrutural',
      axis: 'colapso-estrutural',
      description: 'Sacrifício de saúde e moradia em favor de outras áreas',
      revelation:
        'Sem saúde e moradia, tudo desaba. População migrante (se pode), serviços privados pioram desigualdade. Você manteve transporte e educação, mas para quem? A cidade esvazia seus fundamentos.',
      nextAction: 'Entender interdependência de bem-estar básico',
      impacts: [
        {
          category: 'saude',
          consequence: 'Mortalidade infantil sobe 25%',
          severity: 'high',
        },
        {
          category: 'moradia',
          consequence: 'Favelas crescem, ocupações aumentam',
          severity: 'high',
        },
      ],
    },
    {
      id: 'tecnocracia-circuladora',
      title: 'Tecnocracia de Movimento',
      axis: 'tecnocracia-circuladora',
      description:
        'Ônibus novos, ruas consertadas. Mas quem paga aluguel? Quem fica doente?',
      revelation:
        'Você criou uma cidade para circular, não para viver. Transporte funciona, infraestrutura brilha. Mas crise de moradia explode, hospitais apagam. Executivos voltam para casa. Trabalhadores? Longe, em lotação, pagas propinas à polícia.',
      nextAction: 'Questionar conforto para quem é feito o planejamento urbano',
      impacts: [
        {
          category: 'moradia',
          consequence: 'Gentrificação de bairros bem conectados',
          severity: 'medium',
        },
        {
          category: 'saude',
          consequence: 'Atendimento colapsado em periferias',
          severity: 'high',
        },
      ],
    },
    {
      id: 'orientacao-cuidado',
      title: 'Orientação ao Cuidado',
      axis: 'orientacao-cuidado',
      description: 'Saúde, educação e moradia bem financiadas',
      revelation:
        'Você prioriza vidas. Hospitais atendem, crianças aprendem, famílias têm teto. Transporte funciona, ruas precisam de mais ação. Ainda há conflito (sempre há), mas a população respira. Próxima administração herda uma base de cuidado, não colapso.',
      nextAction: 'Expandir cuidado, resolver débit de manutenção urbana',
      impacts: [
        {
          category: 'saude',
          consequence: 'Cobertura de atendimento acima de 80%',
          severity: 'low',
        },
        {
          category: 'moradia',
          consequence: 'Ocupações reduzem, política habitacional avança',
          severity: 'low',
        },
      ],
    },
    {
      id: 'contencao-ajuste',
      title: 'Contenção com Ajuste',
      axis: 'contencao-ajuste',
      description: 'Sem solução mágica, sem total abandono',
      revelation:
        'Você fez escolhas pragmáticas. Alguns setores respiram, outros precisam de mais. Emergências explodiram, mas não simultaneamente. Gestão reativa, não preventiva. É o cotidiano real de muitas prefeituras: sempre em crise, nunca em colapso total, nunca realmente bem.',
      nextAction: 'Reconhecer que falta recurso. Exigir transfer federal.',
      impacts: [
        {
          category: 'transporte',
          consequence: 'Ônibus velho mas rodando',
          severity: 'medium',
        },
        {
          category: 'educacao',
          consequence: 'Escolas funcionando, professores desmoralizados',
          severity: 'medium',
        },
      ],
    },
  ],
};

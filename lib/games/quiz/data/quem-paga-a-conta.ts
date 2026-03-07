import { QuizDefinition } from '../types';

export const quemPagaAContaQuiz: QuizDefinition = {
  id: 'quem-paga-a-conta',
  title: 'Quem Paga a Conta?',
  subtitle: 'Quiz relâmpago: quem deveria pagar pelos serviços essenciais no RJ?',
  questions: [
    {
      id: 'q1-transporte',
      prompt: 'Quem deve pagar o transporte público de qualidade?',
      context: 'Ônibus lotados, metrô parado, Van irregular. Quem arca?',
      options: [
        {
          id: 'q1-a',
          label: 'Trabalhador com passagem cara',
          impact: { governance: 0 },
        },
        {
          id: 'q1-b',
          label: 'Empresa de ônibus/metrô privada',
          impact: { governance: 1 },
        },
        {
          id: 'q1-c',
          label: 'Governo via subsídio e gestão pública',
          impact: { governance: 4 },
        },
        {
          id: 'q1-d',
          label: 'Mix: usuário paga parte, Estado subsidia',
          impact: { governance: 2 },
        },
      ],
    },
    {
      id: 'q2-saude',
      prompt: 'Quem deve garantir saúde de qualidade para todos?',
      context: 'Fila no posto, hospital sem vaga, convênio caro.',
      options: [
        {
          id: 'q2-a',
          label: 'Cada um paga seu plano privado',
          impact: { governance: 0 },
        },
        {
          id: 'q2-b',
          label: 'Estado com SUS universal forte',
          impact: { governance: 4 },
        },
        {
          id: 'q2-c',
          label: 'Parceria público-privada (PPP)',
          impact: { governance: 1 },
        },
        {
          id: 'q2-d',
          label: 'Empresas pagam plano para funcionários',
          impact: { governance: 1 },
        },
      ],
    },
    {
      id: 'q3-moradia',
      prompt: 'Quem deve resolver a crise de moradia?',
      context: 'Aluguel absurdo, despejo na porta, especulação imobiliária.',
      options: [
        {
          id: 'q3-a',
          label: 'Mercado decide, cada um se vira',
          impact: { governance: 0 },
        },
        {
          id: 'q3-b',
          label: 'Estado constrói moradia popular',
          impact: { governance: 4 },
        },
        {
          id: 'q3-c',
          label: 'Construtoras com incentivo fiscal',
          impact: { governance: 1 },
        },
        {
          id: 'q3-d',
          label: 'Cooperativas e autoconstrução apoiadas',
          impact: { governance: 3 },
        },
      ],
    },
    {
      id: 'q4-educacao',
      prompt: 'Quem deve pagar educação de qualidade?',
      context: 'Escola pública sucateada, cursinho caro, universidade privada.',
      options: [
        {
          id: 'q4-a',
          label: 'Família paga escola e cursinho particular',
          impact: { governance: 0 },
        },
        {
          id: 'q4-b',
          label: 'Estado garante educação pública gratuita e forte',
          impact: { governance: 4 },
        },
        {
          id: 'q4-c',
          label: 'Voucher para escolas privadas',
          impact: { governance: 1 },
        },
        {
          id: 'q4-d',
          label: 'Filantropia e ONGs educacionais',
          impact: { governance: 1 },
        },
      ],
    },
    {
      id: 'q5-seguranca',
      prompt: 'Quem deve cuidar da segurança pública?',
      context: 'Milícia, tráfico, polícia violenta, comunidade abandonada.',
      options: [
        {
          id: 'q5-a',
          label: 'Cada bairro contrata segurança privada',
          impact: { governance: 0 },
        },
        {
          id: 'q5-b',
          label: 'Estado com polícia comunitária e prevenção',
          impact: { governance: 4 },
        },
        {
          id: 'q5-c',
          label: 'Empresas de segurança privada reguladas',
          impact: { governance: 1 },
        },
        {
          id: 'q5-d',
          label: 'Comunidade se organiza e pressiona Estado',
          impact: { governance: 3 },
        },
      ],
    },
  ],
  profiles: [
    {
      id: 'mercado-livre',
      axis: 'governance',
      title: 'Mercado Livre Total',
      description:
        'Você acha que cada um deve se virar. O problema: 90% da população não tem renda para pagar serviços privados de qualidade. Resultado real: abandono, desigualdade e explosão social.',
      nextAction: 'Repense quem realmente paga a conta',
    },
    {
      id: 'hibrido-privatista',
      axis: 'governance',
      title: 'Híbrido Privatista',
      description:
        'Você aceita algum papel do Estado, mas confia mais em empresas privadas. O risco: serviços públicos viram lucro, quem não paga fica de fora.',
      nextAction: 'Compare seu resultado com amigos',
    },
    {
      id: 'hibrido-social',
      axis: 'governance',
      title: 'Híbrido com Base Social',
      description:
        'Você valoriza organização popular e pressão por direitos. Reconhece que Estado deve agir, mas comunidade também. Caminho possível de luta e conquista.',
      nextAction: 'Organize sua comunidade',
    },
    {
      id: 'estado-forte',
      axis: 'governance',
      title: 'Estado Forte e Presente',
      description:
        'Você entende que direitos básicos não podem depender de renda. Defende Estado presente, forte e responsável por serviços universais. Posição alinhada com luta por direitos reais.',
      nextAction: 'Lute por serviços públicos universais',
    },
  ],
};

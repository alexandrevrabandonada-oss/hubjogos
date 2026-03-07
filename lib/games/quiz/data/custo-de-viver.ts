import { QuizDefinition } from '../types';

export const custodeViverQuiz: QuizDefinition = {
  id: 'custo-de-viver',
  title: 'Custo de Viver',
  subtitle: 'Quiz relâmpago: qual é seu custo real de viver bem em Volta Redonda?',
  questions: [
    {
      id: 'q1-aluguel',
      prompt: 'Qual é o valor mais realista de aluguel de um 1-quarto decente em VR?',
      context: 'Pense em bairros de classe trabalhadora, não condomínio.',
      options: [
        {
          id: 'q1-a',
          label: 'R$ 400-600',
          impact: { 'cost-of-living': 1 },
        },
        {
          id: 'q1-b',
          label: 'R$ 600-900',
          impact: { 'cost-of-living': 2 },
        },
        {
          id: 'q1-c',
          label: 'R$ 900-1200',
          impact: { 'cost-of-living': 3 },
        },
        {
          id: 'q1-d',
          label: 'R$ 1200+',
          impact: { 'cost-of-living': 4 },
        },
      ],
    },
    {
      id: 'q2-alimentacao',
      prompt: 'Quanto uma família de 4 gasta com alimentação por mês em VR?',
      options: [
        {
          id: 'q2-a',
          label: 'R$ 500-800',
          impact: { 'cost-of-living': 1 },
        },
        {
          id: 'q2-b',
          label: 'R$ 800-1200',
          impact: { 'cost-of-living': 2 },
        },
        {
          id: 'q2-c',
          label: 'R$ 1200-1800',
          impact: { 'cost-of-living': 3 },
        },
        {
          id: 'q2-d',
          label: 'R$ 1800+',
          impact: { 'cost-of-living': 4 },
        },
      ],
    },
    {
      id: 'q3-transporte',
      prompt: 'Quem usa 3 conduções por dia em VR gasta quanto por mês?',
      options: [
        {
          id: 'q3-a',
          label: 'Menos de R$ 100',
          impact: { 'cost-of-living': 1 },
        },
        {
          id: 'q3-b',
          label: 'R$ 100-200',
          impact: { 'cost-of-living': 2 },
        },
        {
          id: 'q3-c',
          label: 'R$ 200-350',
          impact: { 'cost-of-living': 3 },
        },
        {
          id: 'q3-d',
          label: 'R$ 350+',
          impact: { 'cost-of-living': 4 },
        },
      ],
    },
    {
      id: 'q4-agua-luz',
      prompt: 'Água e luz: quanto custa manter uma casa por mês em VR?',
      options: [
        {
          id: 'q4-a',
          label: 'R$ 100-200',
          impact: { 'cost-of-living': 1 },
        },
        {
          id: 'q4-b',
          label: 'R$ 200-400',
          impact: { 'cost-of-living': 2 },
        },
        {
          id: 'q4-c',
          label: 'R$ 400-600',
          impact: { 'cost-of-living': 3 },
        },
        {
          id: 'q4-d',
          label: 'R$ 600+',
          impact: { 'cost-of-living': 4 },
        },
      ],
    },
    {
      id: 'q5-saude-educacao',
      prompt: 'Saúde e educação privada: quanto dá caro para manter em VR?',
      options: [
        {
          id: 'q5-a',
          label: 'Nem gasto, dependo do SUS e escola pública',
          impact: { 'cost-of-living': 0 },
        },
        {
          id: 'q5-b',
          label: 'R$ 200-400 (seguro ou educação complementar)',
          impact: { 'cost-of-living': 2 },
        },
        {
          id: 'q5-c',
          label: 'R$ 400-800 (família e educação)',
          impact: { 'cost-of-living': 3 },
        },
        {
          id: 'q5-d',
          label: 'R$ 800+ (tudo privado)',
          impact: { 'cost-of-living': 4 },
        },
      ],
    },
  ],
  profiles: [
    {
      id: 'profile-realista',
      axis: 'cost-of-living',
      title: 'Sua Realidade Diária',
      description: 'Você conhece bem o preço de viver aqui. Todo dia é cálculo e escolha.',
      nextAction: 'Compartilhe seu resultado',
    },
    {
      id: 'profile-popular',
      axis: 'cost-of-living',
      title: 'Trabalhador Consciente',
      description:
        'Você sabe quanto custa sobreviver dignamente. A conta fecha difícil, mas você manja do jogo.',
      nextAction: 'Converse com amigos',
    },
    {
      id: 'profile-classe-media',
      axis: 'cost-of-living',
      title: 'Classe Média Local',
      description:
        'Sua vida tem folga, mas não escapa dos preços de RJ. Você tem espaço para planejar.',
      nextAction: 'Apoie quem tem menos',
    },
    {
      id: 'profile-apartado',
      axis: 'cost-of-living',
      title: 'Isolado da Realidade',
      description:
        'Seus números não batem com a maioria. Converse com quem vive na luta real de VR.',
      nextAction: 'Ouça quem está na rua',
    },
  ],
};

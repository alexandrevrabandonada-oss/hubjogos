import { QuizDefinition } from '../types';

export const votoConscienteQuiz: QuizDefinition = {
  id: 'voto-consciente',
  title: 'Voto Consciente',
  subtitle:
    'Um quiz sobre prioridades reais da cidade: orçamento, trabalho, transporte e participação.',
  questions: [
    {
      id: 'q1-orcamento-bairro',
      prompt:
        'O bairro perde verba e você só pode priorizar uma linha de gasto para o próximo ano. Qual vai primeiro?',
      context: 'A decisão impacta curto prazo e estrutura de longo prazo.',
      options: [
        {
          id: 'q1-a',
          label: 'Atenção básica de saúde e cuidado territorial.',
          impact: { services: 3, participation: 1 },
        },
        {
          id: 'q1-b',
          label: 'Mobilidade pública com tarifa social.',
          impact: { mobility: 3, labor: 1 },
        },
        {
          id: 'q1-c',
          label: 'Obras de vitrine no centro para atrair investimento.',
          impact: { participation: -1, 'urban-memory': -1 },
        },
        {
          id: 'q1-d',
          label: 'Fundo de emprego local para pequenos negócios de bairro.',
          impact: { labor: 3, services: 1 },
        },
      ],
    },
    {
      id: 'q2-transporte-trabalho',
      prompt:
        'Uma trabalhadora leva 3 conduções por dia. Qual política reduz mais a precariedade dessa rotina?',
      options: [
        {
          id: 'q2-a',
          label: 'Integração tarifária total entre ônibus, trem e metrô.',
          impact: { mobility: 3, labor: 2 },
        },
        {
          id: 'q2-b',
          label: 'Subsídio para app de transporte em horários de pico.',
          impact: { mobility: 1, services: -1 },
        },
        {
          id: 'q2-c',
          label: 'Ampliação de linhas noturnas e segurança no trajeto.',
          impact: { mobility: 2, labor: 2, services: 1 },
        },
        {
          id: 'q2-d',
          label: 'Deixar o mercado decidir as rotas mais lucrativas.',
          impact: { participation: -1, labor: -1 },
        },
      ],
    },
    {
      id: 'q3-trabalho-direitos',
      prompt:
        'No debate sobre empregos por aplicativo, qual ponto não pode ficar fora de qualquer proposta?',
      options: [
        {
          id: 'q3-a',
          label: 'Direitos mínimos: descanso, proteção social e renda previsível.',
          impact: { labor: 4, participation: 1 },
        },
        {
          id: 'q3-b',
          label: 'Incentivar só metas de produtividade das plataformas.',
          impact: { labor: -1 },
        },
        {
          id: 'q3-c',
          label: 'Negociação coletiva por território e categoria.',
          impact: { labor: 3, participation: 2 },
        },
        {
          id: 'q3-d',
          label: 'Nenhuma regulação para não “atrapalhar a inovação”.',
          impact: { labor: -2, services: -1 },
        },
      ],
    },
    {
      id: 'q4-abandono-cidade',
      prompt:
        'Um conjunto de prédios abandonados gera insegurança e vazio urbano. Qual abordagem priorizar?',
      options: [
        {
          id: 'q4-a',
          label: 'Reabilitar para moradia social e equipamentos públicos.',
          impact: { services: 3, 'urban-memory': 2 },
        },
        {
          id: 'q4-b',
          label: 'Leiloar para uso especulativo sem contrapartida.',
          impact: { participation: -1, services: -1 },
        },
        {
          id: 'q4-c',
          label: 'Mapear memória e definir uso com participação popular.',
          impact: { participation: 3, 'urban-memory': 3 },
        },
        {
          id: 'q4-d',
          label: 'Demolir tudo e abrir estacionamento.',
          impact: { 'urban-memory': -2, mobility: -1 },
        },
      ],
    },
    {
      id: 'q5-participacao',
      prompt:
        'Como tornar decisões de prefeitura menos distantes da vida real das quebradas?',
      options: [
        {
          id: 'q5-a',
          label: 'Conselhos locais com poder de decisão sobre parte do orçamento.',
          impact: { participation: 4, services: 1 },
        },
        {
          id: 'q5-b',
          label: 'Plataforma digital aberta + assembleias presenciais por território.',
          impact: { participation: 3, 'urban-memory': 1 },
        },
        {
          id: 'q5-c',
          label: 'Só comunicação institucional em rede social oficial.',
          impact: { participation: -1 },
        },
        {
          id: 'q5-d',
          label: 'Audiência pública única no centro da cidade.',
          impact: { participation: -1, mobility: -1 },
        },
      ],
    },
    {
      id: 'q6-prioridade-politica',
      prompt:
        'Entre promessas de campanha, qual critério você usa para separar discurso de compromisso real?',
      options: [
        {
          id: 'q6-a',
          label: 'Meta com prazo, fonte de recurso e transparência de execução.',
          impact: { participation: 2, services: 2, labor: 1 },
        },
        {
          id: 'q6-b',
          label: 'Narrativa forte sem detalhamento técnico.',
          impact: { participation: -1 },
        },
        {
          id: 'q6-c',
          label: 'Compromisso com redução de desigualdade territorial.',
          impact: { services: 2, mobility: 1, 'urban-memory': 1 },
        },
        {
          id: 'q6-d',
          label: 'Priorizar ações de curto prazo para gerar manchete rápida.',
          impact: { labor: -1, services: -1 },
        },
      ],
    },
  ],
  profiles: [
    {
      id: 'p-cidade-do-cuidado',
      axis: 'services',
      title: 'Cidade do cuidado como prioridade',
      description:
        'Você prioriza políticas públicas de base: saúde, moradia, educação e proteção territorial como eixo de transformação.',
      nextAction:
        'Compare propostas de orçamento e cobre metas de cuidado no seu território.',
    },
    {
      id: 'p-trabalho-com-direitos',
      axis: 'labor',
      title: 'Trabalho digno no centro da pauta',
      description:
        'Sua leitura política destaca que desenvolvimento sem direitos aprofunda precarização e desigualdade.',
      nextAction:
        'Mapeie propostas sobre renda, proteção social e negociação coletiva.',
    },
    {
      id: 'p-mobilidade-como-justica',
      axis: 'mobility',
      title: 'Mobilidade é justiça urbana',
      description:
        'Você entende transporte como tempo de vida, acesso a oportunidade e redução de desigualdade territorial.',
      nextAction:
        'Acompanhe planos de tarifa, integração e cobertura periférica das linhas.',
    },
    {
      id: 'p-participacao-com-poder',
      axis: 'participation',
      title: 'Participação com poder real',
      description:
        'Sua prioridade é democratizar decisão: menos política de gabinete, mais controle social sobre recursos.',
      nextAction:
        'Procure conselhos locais e espaços de orçamento participativo na sua cidade.',
    },
    {
      id: 'p-memoria-e-territorio',
      axis: 'urban-memory',
      title: 'Memória e território importam',
      description:
        'Você conecta política urbana com história viva dos bairros e combate a lógica de abandono e apagamento.',
      nextAction:
        'Mapeie equipamentos abandonados e pressione por reuso social dos espaços.',
    },
  ],
};

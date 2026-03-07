import { QuizDefinition } from '../types';

export const cidadeEmComumQuiz: QuizDefinition = {
  id: 'cidade-em-comum',
  title: 'Cidade em Comum',
  subtitle: 'Quiz relampago: qual solucao coletiva voce coloca em pratica primeiro?',
  questions: [
    {
      id: 'q1-transporte',
      prompt: 'No bairro, o onibus some no horario de pico. Qual resposta voce prioriza?',
      options: [
        {
          id: 'q1-a',
          label: 'Cada um resolve com app e transporte privado.',
          impact: { 'collective-power': 0 },
        },
        {
          id: 'q1-b',
          label: 'Pressao por subsidio pontual sem mudanca estrutural.',
          impact: { 'collective-power': 1 },
        },
        {
          id: 'q1-c',
          label: 'Campanha por tarifa zero com controle popular.',
          impact: { 'collective-power': 4 },
        },
        {
          id: 'q1-d',
          label: 'Mutirao de carona comunitaria organizado no territorio.',
          impact: { 'collective-power': 3 },
        },
      ],
    },
    {
      id: 'q2-trabalho',
      prompt: 'Uma fabrica fecha e deixa dezenas sem renda. O que fazer agora?',
      options: [
        {
          id: 'q2-a',
          label: 'Esperar novo investidor privado aparecer.',
          impact: { 'collective-power': 0 },
        },
        {
          id: 'q2-b',
          label: 'Cursos rapidos individuais e cada um por si.',
          impact: { 'collective-power': 1 },
        },
        {
          id: 'q2-c',
          label: 'Formar cooperativa de trabalhadores com apoio tecnico.',
          impact: { 'collective-power': 4 },
        },
        {
          id: 'q2-d',
          label: 'Fundo comunitario de ajuda mutua ate reabrir a renda.',
          impact: { 'collective-power': 3 },
        },
      ],
    },
    {
      id: 'q3-moradia',
      prompt: 'A regiao sofre com despejo e aluguel alto. Qual frente voce abre?',
      options: [
        {
          id: 'q3-a',
          label: 'Negociar caso a caso com imobiliaria.',
          impact: { 'collective-power': 1 },
        },
        {
          id: 'q3-b',
          label: 'Construir rede de defesa comunitaria contra despejo.',
          impact: { 'collective-power': 4 },
        },
        {
          id: 'q3-c',
          label: 'Mutirao de reforma e autogestao habitacional.',
          impact: { 'collective-power': 3 },
        },
        {
          id: 'q3-d',
          label: 'Financiamento individual para quem conseguir credito.',
          impact: { 'collective-power': 0 },
        },
      ],
    },
    {
      id: 'q4-saude',
      prompt: 'Posto de saude sem medico e fila longa. Qual caminho voce puxa?',
      options: [
        {
          id: 'q4-a',
          label: 'Plano privado para quem puder pagar.',
          impact: { 'collective-power': 0 },
        },
        {
          id: 'q4-b',
          label: 'Abaixo-assinado por reposicao imediata da equipe.',
          impact: { 'collective-power': 2 },
        },
        {
          id: 'q4-c',
          label: 'Conselho popular de saude com fiscalizacao permanente.',
          impact: { 'collective-power': 4 },
        },
        {
          id: 'q4-d',
          label: 'Rede de cuidado comunitario para urgencias do territorio.',
          impact: { 'collective-power': 3 },
        },
      ],
    },
    {
      id: 'q5-campanha',
      prompt: 'Para mudar o municipio, qual estrategia de campanha voce prefere?',
      options: [
        {
          id: 'q5-a',
          label: 'Apostar em promessa individual de lideranca.',
          impact: { 'collective-power': 0 },
        },
        {
          id: 'q5-b',
          label: 'Foco em propostas tecnicas sem base territorial.',
          impact: { 'collective-power': 1 },
        },
        {
          id: 'q5-c',
          label: 'Programa construido em assembleias populares.',
          impact: { 'collective-power': 4 },
        },
        {
          id: 'q5-d',
          label: 'Comites de bairro para acao direta e ajuda mutua.',
          impact: { 'collective-power': 3 },
        },
      ],
    },
  ],
  profiles: [
    {
      id: 'perfil-observador',
      axis: 'collective-power',
      title: 'Observador da Crise',
      description: 'Voce reconhece o problema, mas ainda depende de solucao individual. O risco e manter a cidade no mesmo ciclo de abandono.',
      nextAction: 'Teste uma rota de organizacao coletiva no proximo jogo',
    },
    {
      id: 'perfil-organizador-inicial',
      axis: 'collective-power',
      title: 'Organizador em Formacao',
      description: 'Voce ja combina pressao institucional com colaboracao comunitaria. Falta transformar resposta emergencial em estrutura permanente.',
      nextAction: 'Monte um comite de pauta no seu territorio',
    },
    {
      id: 'perfil-construtor-comum',
      axis: 'collective-power',
      title: 'Construtor do Comum',
      description: 'Voce aposta em cooperativa, tarifa zero, mutirao e controle popular. Leitura alinhada com solucoes de poder coletivo para a cidade real.',
      nextAction: 'Convide mais pessoas para comparar resultados e organizar o proximo passo',
    },
    {
      id: 'perfil-autogestao',
      axis: 'collective-power',
      title: 'Motor de Autogestao Popular',
      description: 'Voce prioriza auto-organizacao com horizonte de transformacao estrutural. Sua estrategia combina ajuda mutua, democracia de base e defesa dos comuns.',
      nextAction: 'Leve essa rota para uma roda de conversa no bairro',
    },
  ],
};

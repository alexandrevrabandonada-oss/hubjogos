import { BranchingStoryDefinition } from '../types';

export const transporteUrgenteStory: BranchingStoryDefinition = {
  id: 'transporte-urgente',
  title: 'Transporte Urgente',
  subtitle:
    'Você atravessa a cidade em um turno de trabalho. Cada decisão altera tempo, renda e risco.',
  startNodeId: 'inicio-turno',
  nodes: [
    {
      id: 'inicio-turno',
      title: '05h20 - início do turno',
      body:
        'Chove forte e o app aumenta demanda na região central. Você sai cedo para garantir corrida, mas o ônibus do bairro está atrasado.',
      choices: [
        {
          id: 'n1-a',
          label: 'Pegar lotação mais cara para não perder a primeira janela.',
          consequence: 'Você mantém chance de renda, mas já começa com custo alto.',
          nextId: 'pressao-plataforma',
        },
        {
          id: 'n1-b',
          label: 'Esperar o ônibus regular e reduzir custo imediato.',
          consequence: 'Você economiza agora, mas começa o dia com atraso.',
          nextId: 'pressao-plataforma',
        },
      ],
    },
    {
      id: 'pressao-plataforma',
      title: '08h40 - pressão da plataforma',
      body:
        'A plataforma dispara meta de aceitação: quem recusar corrida longa perde prioridade nas próximas chamadas.',
      choices: [
        {
          id: 'n2-a',
          label: 'Aceitar corridas longas mesmo com risco de trânsito e exaustão.',
          consequence: 'Ganha volume, mas perde tempo de pausa e segurança.',
          nextId: 'fim-exaustao',
        },
        {
          id: 'n2-b',
          label: 'Filtrar corridas curtas para manter controle da rota.',
          consequence: 'Mantém ritmo sustentável, mas pode cair no ranking.',
          nextId: 'fiscalizacao-rua',
        },
      ],
    },
    {
      id: 'fiscalizacao-rua',
      title: '13h10 - fiscalização e bloqueio de faixa',
      body:
        'A via principal trava por obra sem aviso. A fiscalização desvia motoboys para rota com maior risco e sem faixa segura.',
      choices: [
        {
          id: 'n3-a',
          label: 'Seguir o desvio para não perder corrida ativa.',
          consequence: 'Evita cancelamento, mas assume trajeto mais perigoso.',
          nextId: 'fim-risco-alto',
        },
        {
          id: 'n3-b',
          label: 'Cancelar corrida e procurar área menos arriscada.',
          consequence: 'Protege integridade, mas sofre penalidade no app.',
          nextId: 'fim-organizacao-coletiva',
        },
      ],
    },
  ],
  endings: [
    {
      id: 'fim-exaustao',
      title: 'Resultado: renda imediata, custo humano alto',
      revelation:
        'Sua escolha expôs como metas algorítmicas convertem tempo de vida em produtividade sem proteção social.',
      nextAction:
        'Compare propostas de mobilidade e regulação de plataforma com foco em jornada e segurança.',
    },
    {
      id: 'fim-risco-alto',
      title: 'Resultado: cidade hostil para quem sustenta a logística',
      revelation:
        'O desvio mostrou que infraestrutura precária transfere risco para trabalhadores e invisibiliza esse custo político.',
      nextAction:
        'Mapeie no seu território onde mobilidade e trabalho se cruzam com mais risco e cobre plano público.',
    },
    {
      id: 'fim-organizacao-coletiva',
      title: 'Resultado: autonomia parcial, punição estrutural',
      revelation:
        'Mesmo tentando reduzir risco, você foi punido por um sistema que prioriza velocidade sobre dignidade.',
      nextAction:
        'Leve esse cenário para debate local e pressione por regras de proteção para trabalho em plataforma.',
    },
  ],
};

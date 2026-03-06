/**
 * Mapa: Abandonado
 * Exploração de edifícios abandonados e leitura territorial do abandono
 */

import { MapDefinition } from '../types';

export const abandonadoMap: MapDefinition = {
  id: 'abandonado-v1',
  title: 'Abandonado: Mapa da Memória Urbana',
  description:
    'Explore edifícios abandonados na cidade e descubra padrões estruturais de abandono, desinvestimento e disputa territorial.',
  regions: [
    { id: 'centro', name: 'Centro Histórico', color: '#C97E2F' },
    { id: 'periferia', name: 'Periferia Leste', color: '#7A6A52' },
    { id: 'industrial', name: 'Zona Industrial', color: '#5A5A5A' },
    { id: 'comercio', name: 'Distrito Comercial', color: '#8B7355' },
  ],
  points: [
    {
      id: 'hospital-central',
      name: 'Hospital Central',
      region: 'centro',
      coordinates: { x: 50, y: 30 },
      type: 'abandoned',
      iconType: 'hospital',
      description: 'Prédio de 8 andares, portas fechadas desde 2018.',
      history:
        'Inaugurado em 1965, atendia 500 pacientes/dia. Fechou após cortes orçamentários estaduais.',
      politicalReading:
        'Símbolo do desmonte da saúde pública. O abandono não foi acidente: foi política fiscal.',
      discovered: false,
    },
    {
      id: 'escola-popular',
      name: 'Escola Popular Vila Nova',
      region: 'periferia',
      coordinates: { x: 80, y: 70 },
      type: 'abandoned',
      iconType: 'school',
      description: 'Escola estadual com salas grafitadas e teto parcialmente desabado.',
      history:
        'Fundada em 1978, fechada em 2020 por "falta de demanda". 450 alunos foram redistribuídos para outras escolas a 5 km de distância.',
      politicalReading:
        'O fechamento de escolas periféricas força crianças a atravessar a cidade. Educação como serviço, não como direito.',
      discovered: false,
    },
    {
      id: 'fabrica-textil',
      name: 'Fábrica Têxtil São João',
      region: 'industrial',
      coordinates: { x: 30, y: 60 },
      type: 'abandoned',
      iconType: 'factory',
      description: 'Galpão de 2000m², janelas quebradas, maquinário enferrujado.',
      history:
        'Operou entre 1952 e 2008. Empregava 320 pessoas. Faliu após abertura comercial e concorrência asiática.',
      politicalReading:
        'Desindustrialização não caiu do céu. Foi resultado de política econômica que privilegiou importação sobre produção local.',
      discovered: false,
    },
    {
      id: 'mercado-municipal',
      name: 'Mercado Municipal da Praça',
      region: 'comercio',
      coordinates: { x: 45, y: 45 },
      type: 'contested',
      iconType: 'market',
      description: 'Edifício histórico, uso disputado entre comerciantes e especuladores.',
      history:
        'Construído em 1920, mercado popular até 2015. Hoje há projeto de shopping boutique no local.',
      politicalReading:
        'Gentrificação não é revitalização. É expulsão de quem historicamente ocupava o território.',
      discovered: false,
    },
    {
      id: 'teatro-operario',
      name: 'Teatro Operário',
      region: 'industrial',
      coordinates: { x: 25, y: 55 },
      type: 'abandoned',
      iconType: 'theater',
      description: 'Palco intacto, cadeiras quebradas, pichações recentes.',
      history:
        'Espaço cultural autônomo, funcionou entre 1985 e 2012. Sediou peças, saraus e assembleias sindicais.',
      politicalReading:
        'O fim de espaços culturais autônomos é também o fim de territórios de organização política.',
      discovered: false,
    },
    {
      id: 'casarao-colonial',
      name: 'Casarão Colonial',
      region: 'centro',
      coordinates: { x: 55, y: 25 },
      type: 'contested',
      iconType: 'house',
      description: 'Sobrado histórico ocupado por famílias sem-teto desde 2019.',
      history:
        'Patrimônio histórico abandonado pelo proprietário privado. Ocupado por 18 famílias que reformaram o espaço.',
      politicalReading:
        'Ocupação urbana é forma de luta por moradia digna. O abandono privado não é protegido, mas a ocupação é criminalizada.',
      discovered: false,
    },
    {
      id: 'posto-saude',
      name: 'Posto de Saúde Jardim das Flores',
      region: 'periferia',
      coordinates: { x: 75, y: 80 },
      type: 'abandoned',
      iconType: 'hospital',
      description: 'UBS fechada, grades nas janelas, mato alto no pátio.',
      history:
        'Inaugurado em 2005 com recursos federais. Fechou em 2017 por "falta de médicos". População local depende de hospital a 12 km.',
      politicalReading:
        'A falta de profissionais é construída por políticas salariais e ausência de plano de carreira na saúde pública.',
      discovered: false,
    },
    {
      id: 'cooperativa-costura',
      name: 'Cooperativa de Costura',
      region: 'periferia',
      coordinates: { x: 70, y: 65 },
      type: 'abandoned',
      iconType: 'factory',
      description: 'Galpão coletivo, máquinas de costura paradas.',
      history:
        'Projeto de economia solidária entre 2010-2016. Acabou por falta de crédito e concorrência com grandes redes de fast fashion.',
      politicalReading:
        'Economia solidária precisa de Estado ativo. Sem política de crédito e compras públicas, cooperativas não sobrevivem ao mercado.',
      discovered: false,
    },
    {
      id: 'cinema-popular',
      name: 'Cine Popular',
      region: 'comercio',
      coordinates: { x: 40, y: 50 },
      type: 'abandoned',
      iconType: 'theater',
      description: 'Fachada art déco preservada, interior destruído.',
      history:
        'Funcionou entre 1948 e 2005. Encerrou atividades com a chegada de multiplex em shopping centers.',
      politicalReading:
        'O fim de cinemas de rua é também o fim de espaços públicos de convivência e cultura acessível.',
      discovered: false,
    },
    {
      id: 'armazem-graos',
      name: 'Armazém de Grãos',
      region: 'industrial',
      coordinates: { x: 20, y: 50 },
      type: 'abandoned',
      iconType: 'market',
      description: 'Silo desativado, estrutura de concreto íntegra.',
      history:
        'Parte de cooperativa agrícola regional, funcionou até 2014. Desativado após privatização de ferrovia que escoava produção.',
      politicalReading:
        'Privatização de infraestrutura logística destrói cadeias produtivas regionais e beneficia grandes grupos privados.',
      discovered: false,
    },
  ],
  results: [
    {
      id: 'abandono-servicos',
      title: 'Abandono de Serviços Públicos',
      pattern: 'Hospitais e escolas fechados',
      description:
        'Você descobriu um padrão claro: o Estado abandonou intencionalmente serviços de saúde e educação.',
      revelation:
        'O desmonte não foi crise. Foi política fiscal que escolheu cortar o essencial para manter privilégios fiscais de poucos.',
      nextAction:
        'Pressione por orçamento real para saúde e educação. Abandono não é acidente, é escolha política reversível.',
    },
    {
      id: 'desindustrializacao',
      title: 'Desindustrialização Programada',
      pattern: 'Fábricas e espaços produtivos destruídos',
      description:
        'A cidade perdeu capacidade produtiva. Não foi competição justa: foi abertura comercial sem proteção local.',
      revelation:
        'Desindustrialização destruiu empregos formais, organizados e com vínculos sindicais. Isso não foi acidente.',
      nextAction:
        'Exija reindustrialização sustentável e proteção de cadeias produtivas locais. Economia não é natural, é disputa.',
    },
    {
      id: 'territorio-disputa',
      title: 'Território em Disputa',
      pattern: 'Espaços ocupados e contestados',
      description:
        'Você encontrou territórios que resistem. Ocupações urbanas e disputas por uso do solo revelam conflito ativo.',
      revelation:
        'Gentrificação e especulação imobiliária expulsam população original. Ocupação é legítima defesa territorial.',
      nextAction:
        'Apoie ocupações urbanas organizadas. Moradia não é mercadoria, é direito. Território é arena de luta política.',
    },
    {
      id: 'memoria-apagada',
      title: 'Memória Cultural Apagada',
      pattern: 'Teatros e cinemas destruídos',
      description:
        'Espaços culturais autônomos foram eliminados. A cidade perdeu locais de encontro, cultura e organização.',
      revelation:
        'O fim de espaços culturais públicos não é progresso. É privatização do lazer e da convivência urbana.',
      nextAction:
        'Pressione por reabertura de espaços culturais públicos. Cultura acessível é infraestrutura democrática.',
    },
    {
      id: 'abandono-sistemico',
      title: 'Abandono Sistêmico',
      pattern: 'Abandono difuso em múltiplas áreas',
      description:
        'O abandono não escolheu uma área. Ele está em serviços, produção, moradia e cultura. É padrão estrutural.',
      revelation:
        'O abandono não é negligência. É política de Estado mínimo que transfere infraestrutura pública para o mercado privado.',
      nextAction:
        'Organize luta transversal: saúde, educação, moradia e cultura são um só conflito. Estado é arena de disputa, não inimigo natural.',
    },
  ],
  minPointsToComplete: 5,
};

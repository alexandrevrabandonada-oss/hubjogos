/**
 * Generate Campaign Links
 * Gera links prontos de campanha e pacotes de distribuição
 * 
 * Uso:
 * node tools/generate-campaign-links.js
 * node tools/generate-campaign-links.js --format=json
 * node tools/generate-campaign-links.js --territorio=estado-rj
 */

const fs = require('fs');
const path = require('path');

// Importar catálogo de jogos (via require pois é Node.js)
const catalogPath = path.join(__dirname, '../lib/games/catalog.ts');
const catalogSource = fs.readFileSync(catalogPath, 'utf-8');

// Parse simples para extrair jogos quick
const QUICK_GAMES = [
  'cidade-em-comum',
  'custo-de-viver',
  'quem-paga-a-conta',
];

const TERRITORIOS = [
  'estado-rj',
  'volta-redonda',
];

const SERIES = [
  'serie-solucoes-coletivas',
  'serie-trabalho-sobrevivencia',
];

const CHANNELS_PRIORITY = [
  'instagram',
  'whatsapp',
  'tiktok',
];

const CHANNELS_SECONDARY = [
  'bio',
  'direto',
  'telegram',
];

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub-jogos-pre-campanha.vercel.app';

// Helper para construir link com UTMs
function buildLink(path, channel, options = {}) {
  const url = new URL(path, BASE_URL);
  
  url.searchParams.set('utm_source', channel);
  url.searchParams.set('utm_medium', getChannelMedium(channel));
  url.searchParams.set('utm_campaign', options.campaign || 'pre-campanha-alexandre-fonseca');
  
  if (options.content) url.searchParams.set('utm_content', options.content);
  if (options.territorio) url.searchParams.set('territorio', options.territorio);
  if (options.serie) url.searchParams.set('serie', options.serie);
  if (options.jogo) url.searchParams.set('jogo', options.jogo);
  
  return url.toString();
}

function getChannelMedium(channel) {
  const mediumMap = {
    'instagram': 'social',
    'tiktok': 'social',
    'twitter': 'social',
    'facebook': 'social',
    'whatsapp': 'messaging',
    'telegram': 'messaging',
    'youtube': 'video',
    'direto': 'organic',
    'bio': 'bio-link',
    'linkhub': 'bio-link',
  };
  return mediumMap[channel] || 'social';
}

// Gera pacotes de distribuição
function generatePackages(options = {}) {
  const packages = [];
  
  // 1. Pacotes por território prioritário
  for (const territorio of TERRITORIOS) {
    const pkg = {
      id: `territorio-${territorio}`,
      name: `Pacote ${territorio}`,
      description: `Distribuição prioritária para ${territorio}`,
      territorio,
      priority: territorio === 'estado-rj' ? 1 : 2,
      weekFocus: territorio === 'estado-rj' ? 1 : 2,
      links: [],
    };
    
    // Links para home + explorar
    for (const channel of CHANNELS_PRIORITY) {
      pkg.links.push({
        label: `Home via ${channel}`,
        url: buildLink('/', channel, { territorio }),
      });
      pkg.links.push({
        label: `Explorar via ${channel}`,
        url: buildLink('/explorar', channel, { territorio }),
      });
    }
    
    // Links para cada quick game
    for (const gameSlug of QUICK_GAMES) {
      for (const channel of CHANNELS_PRIORITY) {
        pkg.links.push({
          label: `${gameSlug} via ${channel}`,
          url: buildLink(`/play/${gameSlug}`, channel, {
            territorio,
            jogo: gameSlug,
            content: gameSlug,
          }),
        });
      }
    }
    
    packages.push(pkg);
  }
  
  // 2. Pacotes por canal prioritário
  for (const channel of CHANNELS_PRIORITY) {
    const pkg = {
      id: `canal-${channel}`,
      name: `Pacote ${channel}`,
      description: `Links prontos para ${channel}`,
      channel,
      priority: 2,
      links: [],
    };
    
    // Links para home + explorar
    pkg.links.push({
      label: 'Home',
      url: buildLink('/', channel),
    });
    pkg.links.push({
      label: 'Explorar',
      url: buildLink('/explorar', channel),
    });
    
    // Links para cada quick game
    for (const gameSlug of QUICK_GAMES) {
      pkg.links.push({
        label: gameSlug,
        url: buildLink(`/play/${gameSlug}`, channel, {
          jogo: gameSlug,
          content: gameSlug,
        }),
      });
    }
    
    packages.push(pkg);
  }
  
  // 3. Pacotes por série
  for (const serie of SERIES) {
    const pkg = {
      id: `serie-${serie}`,
      name: `Série ${serie}`,
      description: `Links para jogos da ${serie}`,
      serie,
      priority: serie === 'serie-solucoes-coletivas' ? 1 : 2,
      weekFocus: serie === 'serie-solucoes-coletivas' ? 1 : 2,
      links: [],
    };
    
    // Para série-solucoes-coletivas, incluir os 3 quicks
    const serieGames = serie === 'serie-solucoes-coletivas' 
      ? QUICK_GAMES 
      : QUICK_GAMES.slice(0, 2);
    
    for (const gameSlug of serieGames) {
      for (const channel of CHANNELS_PRIORITY) {
        pkg.links.push({
          label: `${gameSlug} via ${channel}`,
          url: buildLink(`/play/${gameSlug}`, channel, {
            serie,
            jogo: gameSlug,
            content: gameSlug,
          }),
        });
      }
    }
    
    packages.push(pkg);
  }
  
  return packages;
}

// Formata pacotes como markdown
function formatAsMarkdown(packages) {
  let md = `# Links de Campanha - Pré-Campanha Alexandre Fonseca para Deputado\n\n`;
  md += `**Gerado em:** ${new Date().toLocaleString('pt-BR')}\n\n`;
  md += `---\n\n`;
  
  // Ordenar por prioridade
  const sorted = packages.sort((a, b) => a.priority - b.priority);
  
  for (const pkg of sorted) {
    md += `## ${pkg.name}\n\n`;
    md += `**Descrição:** ${pkg.description}\n`;
    if (pkg.weekFocus) {
      md += `**Semana de foco:** ${pkg.weekFocus}\n`;
    }
    md += `\n`;
    
    md += `| Label | Link |\n`;
    md += `|-------|------|\n`;
    
    for (const link of pkg.links) {
      md += `| ${link.label} | ${link.url} |\n`;
    }
    
    md += `\n`;
  }
  
  md += `---\n\n`;
  md += `**IMPORTANTE:** Todos os links incluem rastreamento UTM para permitir análise de origem.\n\n`;
  md += `**Uso recomendado:**\n`;
  md += `- Copiar links específicos para posts em redes sociais\n`;
  md += `- Usar links diretos em mensagens do WhatsApp/Telegram\n`;
  md += `- Incluir links de bio em Instagram/TikTok\n`;
  md += `- Acompanhar progresso em /estado após distribuição\n\n`;
  
  return md;
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const format = args.find(a => a.startsWith('--format='))?.split('=')[1] || 'md';
  
  console.log('🔗 Gerando links de campanha...\n');
  
  const packages = generatePackages();
  
  console.log(`✅ ${packages.length} pacotes gerados\n`);
  
  // Criar diretório de output
  const outputDir = path.join(__dirname, '../reports/distribution/links');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  
  if (format === 'json') {
    const outputPath = path.join(outputDir, `campaign-links-${timestamp}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(packages, null, 2));
    console.log(`📄 Salvo em: ${outputPath}\n`);
  } else {
    const outputPath = path.join(outputDir, `campaign-links-${timestamp}.md`);
    const markdown = formatAsMarkdown(packages);
    fs.writeFileSync(outputPath, markdown);
    console.log(`📄 Salvo em: ${outputPath}\n`);
  }
  
  // Exibir resumo
  console.log('📊 Resumo dos pacotes:');
  for (const pkg of packages) {
    console.log(`   ${pkg.priority === 1 ? '🔴' : '🟡'} ${pkg.name}: ${pkg.links.length} links`);
  }
  console.log('');
}

main().catch(console.error);

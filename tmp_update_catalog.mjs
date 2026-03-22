import fs from 'fs';

const p = 'c:/Projetos/Hub Jogos Pré Camp/lib/games/catalog.ts';
let content = fs.readFileSync(p, 'utf-8');

content = content.replace(
  /premiumTheme\?:\s*string;\n\s*audioProfile\?:\s*string;\n\}/,
  "premiumTheme?: string;\n  audioProfile?: string;\n  season: string;\n  campaignRole: string;\n  funRole: 'entrada' | 'retencao' | 'aprofundamento';\n}"
);

content = content.replace(/(campaignFrame: '[^']+',)([\s\S]*?)(\n  },)/g, (match, p1, p2, p3) => {
    let funRole = 'entrada';
    if (match.includes("pace: 'quick'")) {
      funRole = 'entrada';
    } else if (match.includes("kind: 'arcade'")) {
      funRole = 'retencao';
    } else {
      funRole = 'aprofundamento';
    }
    
    let campaignRole = 'Distribuição da mensagem e fixação de marca.';
    if (match.includes('tarifa-zero-corredor')) campaignRole = 'Bandeira principal de mobilidade e fundo público.';
    if (match.includes('mutirao-do-bairro')) campaignRole = 'Conexão com organização territorial e ajuda mútua.';
    if (match.includes('passe-livre-nacional')) campaignRole = 'Conexão com a luta sindical e passe livre.';
    if (match.includes('cidade-real') || match.includes('trabalho-impossivel')) campaignRole = 'Letramento sobre orçamento real e trade-offs urbanos.';
    
    return p1 + p2 + `\n    season: 's1-verao-26',\n    campaignRole: '${campaignRole}',\n    funRole: '${funRole}',` + p3;
});

fs.writeFileSync(p, content, 'utf-8');
console.log('Catalog updated!');

import fs from 'fs';
const file = 'c:/Projetos/Hub Jogos Pré Camp/lib/games/catalog.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(
  /audioProfile\?:\s*string;\r?\n\}/,
  "audioProfile?: string;\n  season: string;\n  campaignRole: string;\n  funRole: 'entrada' | 'retencao' | 'aprofundamento';\n}"
);
fs.writeFileSync(file, code, 'utf8');
console.log('Fixed interface!');

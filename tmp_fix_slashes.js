const fs = require('fs');
const filePath = 'c:/Projetos/Hub Jogos Pré Camp/components/games/arcade/BairroResisteArcadeGame.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace escaped backticks and dollar signs that were incorrectly written
content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$/g, '$');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed backslashes in BairroResisteArcadeGame.tsx');

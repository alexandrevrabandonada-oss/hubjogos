const fs = require('fs');
const path = require('path');

const basePath = 'c:/Projetos/Hub Jogos Pré Camp';

// 1. Fix BairroResiste Arcade Prop Types and Named Export
const gameFile = path.join(basePath, 'components/games/arcade/BairroResisteArcadeGame.tsx');
let gameContent = fs.readFileSync(gameFile, 'utf8');

gameContent = gameContent.replace(/export default function BairroResisteArcadeGame\(\{ gameInfo \}: BairroResisteProps\)/g, 'export function BairroResisteArcadeGame({ game }: { game: Game })');
gameContent = gameContent.replace(/interface BairroResisteProps \{\n  gameInfo: Game;\n\}\n/g, '');
gameContent = gameContent.replace(/gameInfo/g, 'game');

fs.writeFileSync(gameFile, gameContent, 'utf8');

// 2. Add to [slug]/page.tsx
const slugPage = path.join(basePath, 'app/arcade/[slug]/page.tsx');
let slugContent = fs.readFileSync(slugPage, 'utf8');

if (!slugContent.includes('BairroResisteArcadeGame')) {
  // Add import
  slugContent = slugContent.replace(
    /import \{ CooperativaNaPressaoArcadeGame \} from '@\/components\/games\/arcade\/CooperativaNaPressaoArcadeGame';/,
    `import { CooperativaNaPressaoArcadeGame } from '@/components/games/arcade/CooperativaNaPressaoArcadeGame';\nimport { BairroResisteArcadeGame } from '@/components/games/arcade/BairroResisteArcadeGame';`
  );

  // Add rendering condition
  slugContent = slugContent.replace(
    /\} else if \(game\.slug === 'cooperativa-na-pressao'\) \{\n    gameComponent = <CooperativaNaPressaoArcadeGame game=\{game\} previewFinal=\{previewFinal\} \/>;\n  \}/,
    `} else if (game.slug === 'cooperativa-na-pressao') {\n    gameComponent = <CooperativaNaPressaoArcadeGame game={game} previewFinal={previewFinal} />;\n  } else if (game.slug === 'bairro-resiste') {\n    gameComponent = <BairroResisteArcadeGame game={game} />;\n  }`
  );

  fs.writeFileSync(slugPage, slugContent, 'utf8');
}

console.log('Fixed export, prop types, and added to [slug]/page.tsx');

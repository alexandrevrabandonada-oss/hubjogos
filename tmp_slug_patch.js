const fs = require('fs');
const filePath = 'c:/Projetos/Hub Jogos Pré Camp/app/arcade/[slug]/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('game.slug === \\'bairro-resiste\\'')) {
  const target = "} else if (game.slug === 'cooperativa-na-pressao') {\\n    gameComponent = <CooperativaNaPressaoArcadeGame game={game} previewFinal={previewFinal} />;\\n  }";
  const replacement = "} else if (game.slug === 'cooperativa-na-pressao') {\\n    gameComponent = <CooperativaNaPressaoArcadeGame game={game} previewFinal={previewFinal} />;\\n  } else if (game.slug === 'bairro-resiste') {\\n    gameComponent = <BairroResisteArcadeGame game={game} />;\\n  }";
  
  // Clean CRLF to LF to match strings safely 
  content = content.replace(/\\r\\n/g, '\\n');
  content = content.replace(target, replacement);
  
  fs.writeFileSync(filePath, content, 'utf8');
}

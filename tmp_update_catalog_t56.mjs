import fs from 'fs';
import path from 'path';

const catalogPath = 'c:/Projetos/Hub Jogos Pré Camp/lib/games/catalog.ts';

if (fs.existsSync(catalogPath)) {
  let content = fs.readFileSync(catalogPath, 'utf8');
  content = content.replace(
    /status: 'pre-producao' \| 'backlog-frio';/g,
    "status: 'pre-producao' | 'backlog-frio' | 'active-build';"
  );
  content = content.replace(
    /slug: 'bairro-resiste',\s+title: 'Bairro Resiste',\s+type: 'arcade',\s+status: 'pre-producao',/,
    "slug: 'bairro-resiste',\n    title: 'Bairro Resiste',\n    type: 'arcade',\n    status: 'active-build',"
  );
  fs.writeFileSync(catalogPath, content, 'utf8');
}

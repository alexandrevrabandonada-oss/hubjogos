const fs = require('fs');
const path = require('path');

const basePath = 'c:/Projetos/Hub Jogos Pré Camp';

const docsToUpdate = [
  'README.md',
  'docs/roadmap.md',
  'docs/tijolos.md',
  'docs/catalogo-mestre-do-hub.md',
  'docs/plano-de-subida-da-proxima-leva.md'
];

const updateText = '\n\n---\n## Atualização T57: Bairro Resiste (Primeiro Commit Estrutural)\n* O Arcade **Bairro Resiste** recebeu sua fundação em `app/arcade/bairro-resiste`. A rota está funcional e blindada.\n* **Shared Modules:** Implementação da `ArcadeHUDContainer` e `ArcadeProgressBar` para UI fluída sem Boilerplate.\n* **Mecânicas Estruturais:** Mapa Base integrado ao Manifest P0 interagindo via `Hotspots` com Pressure System. \n* **Telemetria OOTB:** Logs puros `bairro_action_used` já funcionais.\n* Próxima Parada (T58): Tuning e profundidade.\n---\n';

docsToUpdate.forEach(doc => {
  const fileP = path.join(basePath, doc);
  if (fs.existsSync(fileP)) {
    fs.appendFileSync(fileP, updateText, 'utf8');
  }
});

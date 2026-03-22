import fs from 'fs';
import path from 'path';

const basePath = 'c:/Projetos/Hub Jogos Pré Camp';

// 1. Update General Docs
const docsToUpdate = [
  'README.md',
  'docs/roadmap.md',
  'docs/tijolos.md',
  'docs/linha-arcade-da-campanha.md',
  'docs/catalogo-mestre-do-hub.md',
  'docs/plano-de-subida-da-proxima-leva.md'
];

const updateText = `

---
## Atualização T55: Bairro Resiste (Gate de Subida)
* **Status de Implementação**: **NO-GO [Abortado]**. O primeiro commit estrutural do \`bairro-resiste\` não foi autorizado e a criação do código base foi suspensa.
* **Bloqueios Identificados**: 
  1. Ausência do Inventário P0 na pasta do asset pack (\`manifest.json\` foi criado, porém \`public/arcade/bairro-resiste/bg\` e demais assets contêm placeholders inexistentes que quebram o manifesto).
  2. Slot de Produção indisponível segundo governança oficial.
* **Governança Respeitada**: Nenhum código fantasma (feature parcial baseada em canvas opaco) foi deixado no hub. O jogo se mantém rigidamente como \`preproduction-strong\`.
* **Próximões Passos para T56**: Finalizar merge da arte P0 na pasta \`public/\`, acionar script de capacidade, e somente então rodar a subida de código do slice.
---
`;

docsToUpdate.forEach(doc => {
  const fullPath = path.join(basePath, doc);
  if (fs.existsSync(fullPath)) {
    fs.appendFileSync(fullPath, updateText, 'utf8');
    console.log(`Updated ${doc}`);
  } else {
    console.warn(`File not found: ${doc}`);
  }
});

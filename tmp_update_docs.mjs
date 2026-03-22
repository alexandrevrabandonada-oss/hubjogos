import fs from 'fs';
import path from 'path';

const docsToUpdate = [
  'README.md',
  'docs/roadmap.md',
  'docs/tijolos.md',
  'docs/linha-de-jogos-campanha.md',
  'docs/linha-arcade-da-campanha.md',
  'docs/catalogo-mestre-do-hub.md'
];

const updateText = `

---
## Atualização T52: Hub Jogos Pré-Campanha (Core e Portfólio)
* **Campanha em Tudo**: A identidade da pré-campanha de Alexandre Fonseca foi injetada via \`CampaignShell\` e \`CampaignPortalSection\`.
* **Lógica de Portfólio**: Reforçada com novos campos no catálogo (\`season\`, \`campaignRole\`, \`funRole\`).
* **Distinção de Linhas**: A linha "Quick" funciona como porta de entrada rápida, enquanto a linha "Arcade" consolida-se como a espinha dorsal de retenção. Jogos mais robustos e profundos figuram como horizonte estratégico.
* **Próximos Passos (Para T53)**: Expansão do portfólio com novos arcades e narrativas engajadoras, sem abrir novo art pass por enquanto, apenas crescimento sustentável sobre essa base consolidada.
---
`;

const basePath = 'c:/Projetos/Hub Jogos Pré Camp';

docsToUpdate.forEach(doc => {
  const fullPath = path.join(basePath, doc);
  if (fs.existsSync(fullPath)) {
    fs.appendFileSync(fullPath, updateText, 'utf8');
    console.log(`Updated ${doc}`);
  } else {
    console.warn(`File not found: ${fullPath}`);
  }
});

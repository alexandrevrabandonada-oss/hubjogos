import fs from 'fs';
import path from 'path';

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
## Atualização T53: Hub de Jogos como Game Studio (Readiness & Modulos)
* **Catálogo de Mecânicas**: Documentado em \`docs/catalogo-de-mecanicas-arcade.md\`. Mecânicas como Hotspot Pressure e Lane Runner catalogadas para reuso.
* **Matriz de Reutilização**: Utilitários de HUD, Timer (\`useArcadeSession\`) e Telemetry mapeados em \`docs/matriz-reutilizacao-arcade.md\` visando extração para *shared modules*.
* **Bairro Resiste Readiness**: Validação do status de \`preproduction-strong\`. Restrição explícita de subida de código até liberação de slot e P0 Asset Pack completo. Detalhes no relatório de readiness.
* **Governança Estrita**: Instituído \`docs/regra-de-subida-de-jogos.md\` proibindo inícios paralelos não autorizados.
* **O que fica para T54**: Início de código do \`bairro-resiste\` APENAS se slot for liberado; se não for, criação física dos *shared packages/modules*.
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

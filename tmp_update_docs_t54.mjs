import fs from 'fs';
import path from 'path';

const basePath = 'c:/Projetos/Hub Jogos Pré Camp';

// 1. Update Bairro Resiste Readiness
const readinessPath = path.join(basePath, 'docs/bairro-resiste-readiness.md');
if (fs.existsSync(readinessPath)) {
  const readinessContent = fs.readFileSync(readinessPath, 'utf8');
  const updatedReadiness = readinessContent.replace(
    /## 3\. Avaliação de Blocking \(T53\)/,
    "## 3. Avaliação de Blocking (Atualizado T54)\n**[RESOLVIDO] 3.1. Ausência de Shared Modules:** A T54 entregou `ArcadeHUDContainer`, `ArcadeProgressBar`, e `useArcadeTimer`. O jogo já tem a base técnica para iniciar seu primeiro commit estrutural sem duplicar código.\n\n**[BLOQUEIO ATIVO] 3.2. Asset Pack Base:** O manifest de áudio e arte final ainda não atingiram 100% de entrega no repositório. O design P0 deve estar mergeado.\n\n**[BLOQUEIO ATIVO] 3.3. Capacidade de Fabricação:** O slot atual segue em uso ou observação. Abertura do PR de código autorizada **somente após** liberação formal do slot.\n\n## 3. Avaliação de Blocking (Original T53)"
  );
  fs.writeFileSync(readinessPath, updatedReadiness, 'utf8');
  console.log('Updated readiness');
}

// 2. Update Regra de Subida de Jogos
const regrasPath = path.join(basePath, 'docs/regra-de-subida-de-jogos.md');
if (fs.existsSync(regrasPath)) {
  const regrasContent = fs.readFileSync(regrasPath, 'utf8');
  const goNoGo = `
## Go/No-Go Estrutural (Atualização T54)
Para um jogo receber seu **Primeiro Commit Estrutural (Boilerplate + Logica Base)**, ele precisa:
1. Passar em todos os gates da Fase 2 (Contrato, Assets P0, Capacidade).
2. Utilizar obrigatoriamente os **Shared Modules** se encaixarem no design (ex: \`ArcadeHUDContainer\`, \`ArcadeProgressBar\`, \`useArcadeTimer\`).
3. O PR estrutural **não deve conter** artefato final ou assets que não estejam no manifest.
`;
  fs.appendFileSync(regrasPath, goNoGo, 'utf8');
  console.log('Updated regras');
}

// 3. Update General Docs
const docsToUpdate = [
  'README.md',
  'docs/roadmap.md',
  'docs/tijolos.md',
  'docs/linha-arcade-da-campanha.md',
];

const updateText = `

---
## Atualização T54: Arcade Shared Modules & Readiness
* **Módulos Compartilhados Executados**: Implementação de \`ArcadeHUDContainer\`, \`ArcadeProgressBar\` e \`useArcadeTimer\` em \`components/games/arcade/\` e \`lib/games/arcade/\`.
* **Redução de Código Nativo**: Refatoração cirúrgica nas telas de resultado do \`TarifaZero\`, \`MutiraoDoBairro\` e \`CooperativaNaPressao\` para consumir visualmente a \`ArcadeProgressBar\`.
* **Bairro Resiste - Go/No-Go Estrutural**: Base técnica liberada. Falta exclusivamente o desbloqueio de Slot Operacional e o Merge final do Asset Pack P0 para autorizar o 1º PR de código.
---
`;

docsToUpdate.forEach(doc => {
  const fullPath = path.join(basePath, doc);
  if (fs.existsSync(fullPath)) {
    fs.appendFileSync(fullPath, updateText, 'utf8');
    console.log(`Updated ${doc}`);
  }
});

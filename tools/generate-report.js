#!/usr/bin/env node

/**
 * Generate Report Script - Hub de Jogos da Pré-Campanha
 * 
 * Gera relatório automático de Estado da Nação
 * Salva em reports/YYYY-MM-DD-HHMM-status.md
 */

const fs = require('fs');
const path = require('path');

function getFormattedDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return { 
    dateTime: `${year}-${month}-${day}-${hours}${minutes}`,
    display: now.toLocaleString('pt-BR')
  };
}

function countFiles(dir, extension = null) {
  let count = 0;
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isFile()) {
        if (!extension || file.endsWith(extension)) {
          count++;
        }
      }
    });
  } catch (err) {
    // Directory doesn't exist or can't be read
  }
  return count;
}

function getDirectorySizes() {
  const cwd = process.cwd();
  return {
    app: countFiles(path.join(cwd, 'app')),
    components: countFiles(path.join(cwd, 'components')),
    lib: countFiles(path.join(cwd, 'lib')),
    docs: countFiles(path.join(cwd, 'docs')),
  };
}

const { dateTime, display } = getFormattedDate();
const sizes = getDirectorySizes();

let packageJson = {};
try {
  packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
  );
} catch (err) {
  console.error('Could not read package.json');
}

const report = `# Estado da Nação - Hub de Jogos da Pré-Campanha

**Data:** ${display}  
**Status:** 🟡 Tijolo 01 - Estrutura Base em Andamento  

## 📊 Snapshot do Projeto

| Item | Status |
|------|--------|
| Repositório | ✅ Criado |
| Documentação Base | ✅ Completa |
| Estrutura de Pastas | ✅ Configurada |
| Convenções | ✅ Documentadas |
| npm Scripts | ✅ Definidos |
| Next.js | ⭕ Planejado (Tijolo 02) |
| Supabase | ⭕ Planejado (Tijolo 02) |
| Design System | ⭕ Planejado (Tijolo 03) |

## 📁 Estrutura Atual

\`\`\`
app/              ${sizes.app} files
components/       ${sizes.components} files
lib/              ${sizes.lib} files
docs/             ${sizes.docs} files
public/           (assets)
styles/           (CSS modules)
reports/          (progress reports)
tools/            (scripts)
\`\`\`

## 📚 Documentação Criada

- ✅ **briefing.md** - Visão de produto e objetivos
- ✅ **arquitetura.md** - Arquitetura técnica macro
- ✅ **roadmap.md** - Plano de desenvolvimento
- ✅ **tijolos.md** - Protocolo de execução
- ✅ **identidade-visual.md** - Diretrizes visuais
- ✅ **README.md** - Visão geral do projeto

## 🔧 Scripts Disponíveis

\`\`\`bash
npm run verify       # Verificar estado do projeto
npm run dev         # [Configurado em Tijolo 02]
npm run build       # [Configurado em Tijolo 02]
npm run lint        # [Configurado em Tijolo 02]
npm run type-check  # [Configurado em Tijolo 02]
npm run report      # Gerar este relatório
\`\`\`

## ✅ Checklist de Tjijolo 01

- [x] Diagnóstico do estado anterior
- [x] Documentação base completa
- [x] Estrutura de pastas criada
- [x] Convenções do projeto documentadas
- [x] Script verify implementado
- [x] Relatório de Estado da Nação gerado
- [ ] npm run verify 100% passando
- [ ] Próximo tijolo pronto

## 🎯 Próximos Passos

### Tijolo 02 - Next.js Setup
1. Scaffold completo Next.js 14+
2. Configuração TypeScript
3. Setup ESLint + Prettier
4. Supabase client integration
5. Vercel + GitHub Actions

**Estimativa:** 2 semanas  
**Pré-requisitos:** Node.js 18+, npm 9+

## 📋 Comandos Úteis

\`\`\`bash
# Verificar estado (run this!)
npm run verify

# Criar branch para Tijolo 02
git checkout -b feature/tijolo-02-nextjs-setup

# Ver documentação
cat docs/briefing.md
cat docs/arquitetura.md
\`\`\`

## 📌 Notas

- Repositório clean, sem breaking changes
- Estrutura segura para próximo desenvolvimento
- Documentação idempotente, pronta para referência
- Nenhum código dinâmico implementado (apenas fundação)

## 🚀 Stack Definido

- Next.js 14+ (framework)
- Supabase (backend)
- Vercel (hosting)
- GitHub (version control)
- TypeScript (futuro)

---

**Gerado por:** \`npm run report\`  
**Versão:** Tijolo 01  
**Próxima atualização:** Após Tijolo 02 completar
`;

const reportsDir = path.join(process.cwd(), 'reports');
const reportPath = path.join(reportsDir, `${dateTime}-tijolo-01-estado-da-nacao.md`);

try {
  fs.writeFileSync(reportPath, report);
  console.log(`✅ Relatório gerado: ${reportPath}`);
  console.log(`\nPrimeiras linhas:\n`);
  console.log(report.split('\n').slice(0, 20).join('\n'));
  console.log('\n... (relatório completo salvo em reports/)');
} catch (err) {
  console.error(`❌ Erro ao gerar relatório: ${err.message}`);
  process.exit(1);
}

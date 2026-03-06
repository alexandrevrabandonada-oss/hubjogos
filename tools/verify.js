#!/usr/bin/env node

/**
 * Verify Script - Hub de Jogos da Pré-Campanha
 * 
 * Executa verificações essenciais do projeto
 * Objetivo: Validar estado da fundação antes de prosseguir
 */

const fs = require('fs');
const path = require('path');

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';

let results = [];
let passCount = 0;
let failCount = 0;

function logSection(title) {
  console.log(`\n${BLUE}${'='.repeat(60)}${RESET}`);
  console.log(`${BLUE}${title}${RESET}`);
  console.log(`${BLUE}${'='.repeat(60)}${RESET}\n`);
}

function pass(message) {
  console.log(`${GREEN}✓${RESET} ${message}`);
  results.push({ status: 'pass', message });
  passCount++;
}

function fail(message) {
  console.log(`${RED}✗${RESET} ${message}`);
  results.push({ status: 'fail', message });
  failCount++;
}

function warn(message) {
  console.log(`${YELLOW}⚠${RESET} ${message}`);
  results.push({ status: 'warn', message });
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    pass(`${description} exists`);
    return true;
  } else {
    fail(`${description} missing`);
    return false;
  }
}

function checkDirectoryExists(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    pass(`${description} directory exists`);
    return true;
  } else {
    fail(`${description} directory missing`);
    return false;
  }
}

// ============================================================================
// VERIFICATIONS
// ============================================================================

logSection('1. PROJECT STRUCTURE');

const dirs = [
  { path: 'app', desc: 'app/' },
  { path: 'components', desc: 'components/' },
  { path: 'lib', desc: 'lib/' },
  { path: 'public', desc: 'public/' },
  { path: 'styles', desc: 'styles/' },
  { path: 'docs', desc: 'docs/' },
  { path: 'reports', desc: 'reports/' },
  { path: 'tools', desc: 'tools/' },
  { path: 'app/explorar', desc: 'app/explorar/' },
  { path: 'app/play', desc: 'app/play/[slug]/' },
  { path: 'app/sobre', desc: 'app/sobre/' },
  { path: 'app/participar', desc: 'app/participar/' },
];

dirs.forEach(({ path: dir, desc }) => {
  checkDirectoryExists(path.join(process.cwd(), dir), desc);
});

// ============================================================================

logSection('2. CONFIGURATION FILES');

const configFiles = [
  { path: 'package.json', desc: 'package.json' },
  { path: '.gitignore', desc: '.gitignore' },
  { path: 'README.md', desc: 'README.md' },
];

configFiles.forEach(({ path: file, desc }) => {
  checkFileExists(path.join(process.cwd(), file), desc);
});

// ============================================================================

logSection('3. DOCUMENTATION');

const docFiles = [
  { path: 'docs/briefing.md', desc: 'Briefing' },
  { path: 'docs/arquitetura.md', desc: 'Arquitetura' },
  { path: 'docs/roadmap.md', desc: 'Roadmap' },
  { path: 'docs/tijolos.md', desc: 'Tijolos Protocol' },
  { path: 'docs/identidade-visual.md', desc: 'Identidade Visual' },
];

docFiles.forEach(({ path: file, desc }) => {
  checkFileExists(path.join(process.cwd(), file), desc);
});

// ============================================================================

logSection('4. SCRIPTS');

try {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
  );

  const requiredScripts = [
    'verify',
    'dev',
    'build',
    'test',
    'test:unit',
    'test:e2e',
    'test:ci',
    'type-check',
    'lint',
  ];

  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      pass(`npm script '${script}' defined`);
    } else {
      fail(`npm script '${script}' missing`);
    }
  });
} catch (err) {
  fail(`Could not read package.json: ${err.message}`);
}

// ============================================================================

logSection('5. GIT SETUP');

const gitDir = path.join(process.cwd(), '.git');
if (fs.existsSync(gitDir)) {
  pass('Git repository initialized');
} else {
  warn('Git repository not initialized (recommended: git init)');
}

const gitignore = path.join(process.cwd(), '.gitignore');
if (fs.existsSync(gitignore)) {
  const content = fs.readFileSync(gitignore, 'utf8');
  if (content.includes('node_modules')) {
    pass('.gitignore properly configured');
  } else {
    warn('.gitignore exists but may be incomplete');
  }
}

// ============================================================================

logSection('6. NEXT.JS & RUNTIME');

checkFileExists(path.join(process.cwd(), 'next.config.js'), 'next.config.js');
checkFileExists(path.join(process.cwd(), 'tsconfig.json'), 'tsconfig.json');
checkFileExists(path.join(process.cwd(), '.eslintrc.json'), '.eslintrc.json');

// ============================================================================

logSection('7. APPLICATION STRUCTURE');

const appFiles = [
  { path: 'app/page.tsx', desc: 'Home page' },
  { path: 'app/layout.tsx', desc: 'Root layout' },
  { path: 'app/explorar/page.tsx', desc: 'Explore page' },
  { path: 'app/sobre/page.tsx', desc: 'About page' },
  { path: 'app/participar/page.tsx', desc: 'Participate page' },
  { path: 'app/play/[slug]/page.tsx', desc: 'Dynamic game page' },
];

appFiles.forEach(({ path: file, desc }) => {
  checkFileExists(path.join(process.cwd(), file), desc);
});

// ============================================================================

logSection('8. DESIGN SYSTEM & COMPONENTS');

const componentFiles = [
  { path: 'lib/design/tokens.ts', desc: 'Design tokens' },
  { path: 'lib/games/catalog.ts', desc: 'Games catalog' },
  { path: 'components/layout/Header.tsx', desc: 'Header component' },
  { path: 'components/hub/GameCard.tsx', desc: 'GameCard component' },
  { path: 'styles/globals.css', desc: 'Global styles' },
];

componentFiles.forEach(({ path: file, desc }) => {
  checkFileExists(path.join(process.cwd(), file), desc);
});

// ============================================================================

logSection('9. PWA, SUPABASE & CI/CD');

checkFileExists(path.join(process.cwd(), 'public/manifest.json'), 'PWA manifest');
checkFileExists(path.join(process.cwd(), 'lib/supabase/client.ts'), 'Supabase client');
checkFileExists(path.join(process.cwd(), 'lib/share/export-card.ts'), 'Share card export helper');
checkFileExists(path.join(process.cwd(), 'components/games/share/DownloadCardButton.tsx'), 'DownloadCardButton component');
checkFileExists(path.join(process.cwd(), '.github/workflows/ci.yml'), 'GitHub Actions CI workflow');
checkFileExists(path.join(process.cwd(), 'sentry.client.config.ts'), 'Sentry configuration');
checkFileExists(path.join(process.cwd(), 'tests/e2e/a11y.spec.ts'), 'A11y test specification');

// ============================================================================

logSection('SUMMARY');

const total = passCount + failCount;
const percentage = total > 0 ? Math.round((passCount / total) * 100) : 0;

console.log(`\nTotal Checks: ${total}`);
console.log(`${GREEN}Passed: ${passCount}${RESET}`);
console.log(`${RED}Failed: ${failCount}${RESET}`);
console.log(`Success Rate: ${percentage}%\n`);

if (failCount === 0) {
  console.log(`${GREEN}✓ All critical checks passed!${RESET}\n`);
  process.exit(0);
} else {
  console.log(`${RED}✗ Some critical checks failed.${RESET}\n`);
  process.exit(1);
}

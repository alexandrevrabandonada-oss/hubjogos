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

  const requiredScripts = ['verify', 'dev', 'build'];
  
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

logSection('6. NEXT.JS READINESS');

warn('Next.js not yet scaffolded (planned for Tijolo 02)');
warn('TypeScript not yet configured (planned for Tijolo 02)');
warn('ESLint not yet configured (planned for Tijolo 02)');

// ============================================================================

logSection('7. SUPABASE READINESS');

warn('Supabase client not yet configured (planned for Tijolo 02)');
warn('Environment variables not yet set (.env.local)');

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

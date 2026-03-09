const CRITICAL_PATTERNS = [
  /^public\/arcade\/[^/]+\/manifest\.json$/,
  /^public\/arcade\/[^/]+\/bg\//,
  /^public\/arcade\/[^/]+\/player\//,
  /^public\/arcade\/[^/]+\/obstacles\//,
  /^public\/arcade\/[^/]+\/pickups\//,
  /^public\/arcade\/[^/]+\/ui\//,
  /^lib\/games\/arcade\/.*assets\.ts$/,
  /^lib\/games\/assets\//,
];

function parseChangedFiles() {
  const raw = process.env.ASSET_CHANGED_FILES || '';
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function isCritical(filePath) {
  return CRITICAL_PATTERNS.some((pattern) => pattern.test(filePath));
}

function main() {
  const changedFiles = parseChangedFiles();
  const criticalFiles = changedFiles.filter(isCritical);
  const shouldRun = criticalFiles.length > 0;

  if (process.env.GITHUB_OUTPUT) {
    const lines = [
      `should_run=${shouldRun ? 'true' : 'false'}`,
      'critical_files<<EOF',
      ...criticalFiles,
      'EOF',
    ];
    require('fs').appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join('\n')}\n`);
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    const fs = require('fs');
    const summaryLines = [
      '## Critical Assets Selective Smoke',
      '',
      `- Trigger: ${shouldRun ? 'yes' : 'no'}`,
      `- Changed files in scope: ${changedFiles.length}`,
      `- Critical files detected: ${criticalFiles.length}`,
    ];

    if (criticalFiles.length > 0) {
      summaryLines.push('- Critical file list:');
      for (const file of criticalFiles) {
        summaryLines.push(`  - ${file}`);
      }
    }

    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summaryLines.join('\n')}\n`);
  }

  console.log(`[critical-smoke] should_run=${shouldRun}`);
  if (criticalFiles.length > 0) {
    console.log('[critical-smoke] critical files:');
    for (const file of criticalFiles) {
      console.log(` - ${file}`);
    }
  }
}

main();

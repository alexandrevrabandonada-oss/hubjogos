const fs = require('fs');
const path = require('path');

function fileExists(filePath) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

function parseAllowlistReviewDate(reasonText) {
  if (typeof reasonText !== 'string') {
    return null;
  }
  const match = reasonText.match(/review\s+(\d{4}-\d{2}-\d{2})/i);
  return match ? match[1] : null;
}

function loadLatestAuditReport() {
  const reportDir = path.join(process.cwd(), 'reports', 'assets');
  if (!fileExists(reportDir)) {
    return null;
  }

  const reportFiles = fs
    .readdirSync(reportDir)
    .filter((name) => name.endsWith('-assets-audit.json'))
    .sort()
    .reverse();

  if (reportFiles.length === 0) {
    return null;
  }

  const latestPath = path.join(reportDir, reportFiles[0]);
  const content = fs.readFileSync(latestPath, 'utf-8');
  return {
    path: latestPath,
    data: JSON.parse(content),
  };
}

function loadAllowlistFile() {
  const allowlistPath = path.join(process.cwd(), 'tools', 'assets-audit-allowlist.json');
  if (!fileExists(allowlistPath)) {
    return { review: null, allowlist: {} };
  }

  try {
    const content = fs.readFileSync(allowlistPath, 'utf-8');
    const parsed = JSON.parse(content);
    return {
      review: parsed.review || null,
      allowlist: parsed.allowlist || {},
    };
  } catch {
    return { review: null, allowlist: {} };
  }
}

function main() {
  const latest = loadLatestAuditReport();
  const allowlistFile = loadAllowlistFile();
  const allowlist = allowlistFile.allowlist;

  if (!latest) {
    console.log('No audit report found in reports/assets/. Run: npm run assets:audit');
    process.exit(1);
  }

  const results = latest.data.results || [];
  const byStatus = {
    ok: results.filter((r) => r.status === 'ok').length,
    warning: results.filter((r) => r.status === 'warning').length,
    error: results.filter((r) => r.status === 'error').length,
  };

  const warningIssues = results.reduce(
    (sum, r) => sum + (r.issues || []).filter((issue) => issue.severity === 'warning').length,
    0,
  );

  let allowlistEntries = 0;
  let nextReview = allowlistFile.review?.nextReviewAt || null;
  let overdue = 0;
  const today = new Date();

  for (const entries of Object.values(allowlist)) {
    for (const reason of Object.values(entries)) {
      allowlistEntries += 1;
      const reviewDate = parseAllowlistReviewDate(reason);
      if (!reviewDate) {
        continue;
      }
      const parsed = new Date(`${reviewDate}T00:00:00`);
      if (Number.isNaN(parsed.valueOf())) {
        continue;
      }
      if (!nextReview || parsed < new Date(`${nextReview}T00:00:00`)) {
        nextReview = reviewDate;
      }
      if (parsed < today) {
        overdue += 1;
      }
    }
  }

  console.log('\n=== ASSETS HEALTH REPORT ===');
  console.log(`Report: ${latest.path}`);
  console.log(`OK packs: ${byStatus.ok}`);
  console.log(`Warning packs: ${byStatus.warning}`);
  console.log(`Error packs: ${byStatus.error}`);
  console.log(`Known warning debt: ${warningIssues}`);
  console.log(`Allowlist entries: ${allowlistEntries}`);
  console.log(`Next allowlist review: ${nextReview || 'not set'}`);
  console.log(`Overdue allowlist entries: ${overdue}`);

  if (byStatus.error > 0) {
    process.exit(1);
  }
}

main();

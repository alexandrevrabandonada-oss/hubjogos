const fs = require('fs');
const path = require('path');

const REVIEW_WARNING_WINDOW_DAYS = 14;

function fileExists(filePath) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

function parseDateOnly(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

function diffDays(fromDate, toDate) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const normalizedFrom = Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), fromDate.getUTCDate());
  const normalizedTo = Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth(), toDate.getUTCDate());
  return Math.floor((normalizedTo - normalizedFrom) / msPerDay);
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

function parseChangedFilesFromEnv() {
  const raw = process.env.ASSET_CHANGED_FILES || '';
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function collectPacksAffectedByFiles(changedFiles) {
  const packs = new Set();
  for (const file of changedFiles) {
    const match = file.match(/^public\/arcade\/([^/]+)\//);
    if (match) {
      packs.add(match[1]);
    }
  }
  return Array.from(packs).sort();
}

function appendSummary(line) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) {
    return;
  }
  fs.appendFileSync(summaryPath, `${line}\n`);
}

function writeSummary({ byStatus, warningsCount, reviewState, nextReview, affectedPacks, reportPath }) {
  appendSummary('## Assets Pipeline Summary');
  appendSummary('');
  appendSummary('| Item | Value |');
  appendSummary('| --- | --- |');

  const overall = byStatus.error > 0 ? 'ERROR (blocking)' : 'PASS';
  appendSummary(`| Overall status | ${overall} |`);
  appendSummary(`| Warning issues | ${warningsCount} |`);
  appendSummary(`| Packs OK/Warning/Error | ${byStatus.ok}/${byStatus.warning}/${byStatus.error} |`);
  appendSummary(`| Allowlist review | ${reviewState} |`);
  appendSummary(`| Next review | ${nextReview || 'not set'} |`);
  appendSummary(`| Packs affected in this run | ${affectedPacks.length > 0 ? affectedPacks.join(', ') : 'none detected'} |`);
  appendSummary(`| Latest audit report | ${reportPath || 'not found'} |`);
  appendSummary('');

  if (reviewState === 'OVERDUE') {
    appendSummary('> [!WARNING] Allowlist review is overdue. This does not block merge, but review should be scheduled now.');
  } else if (reviewState === 'DUE_SOON') {
    appendSummary('> [!WARNING] Allowlist review is due soon. Prepare a hygiene pass in the next cycle.');
  } else if (reviewState === 'ON_TRACK') {
    appendSummary('> [!NOTE] Allowlist review is on track.');
  } else {
    appendSummary('> [!NOTE] Allowlist review metadata is missing or invalid.');
  }
}

function main() {
  const latest = loadLatestAuditReport();
  const allowlistFile = loadAllowlistFile();
  const changedFiles = parseChangedFilesFromEnv();
  const affectedPacks = collectPacksAffectedByFiles(changedFiles);

  const results = latest?.data?.results || [];
  const byStatus = {
    ok: results.filter((r) => r.status === 'ok').length,
    warning: results.filter((r) => r.status === 'warning').length,
    error: results.filter((r) => r.status === 'error').length,
  };

  const warningsCount = results.reduce(
    (sum, r) => sum + (r.issues || []).filter((issue) => issue.severity === 'warning').length,
    0,
  );

  const nextReview = allowlistFile.review?.nextReviewAt;
  const parsedNextReview = parseDateOnly(nextReview);
  const today = new Date();

  let reviewState = 'MISSING';
  let daysUntilReview = null;

  if (parsedNextReview) {
    daysUntilReview = diffDays(today, parsedNextReview);
    if (daysUntilReview < 0) {
      reviewState = 'OVERDUE';
    } else if (daysUntilReview <= REVIEW_WARNING_WINDOW_DAYS) {
      reviewState = 'DUE_SOON';
    } else {
      reviewState = 'ON_TRACK';
    }
  }

  writeSummary({
    byStatus,
    warningsCount,
    reviewState,
    nextReview,
    affectedPacks,
    reportPath: latest?.path,
  });

  if (reviewState === 'OVERDUE') {
    console.log(`[allowlist-review] OVERDUE: nextReviewAt=${nextReview} (${daysUntilReview} day(s) from today)`);
  } else if (reviewState === 'DUE_SOON') {
    console.log(`[allowlist-review] DUE SOON: nextReviewAt=${nextReview} (${daysUntilReview} day(s) from today)`);
  } else if (reviewState === 'ON_TRACK') {
    console.log(`[allowlist-review] ON TRACK: nextReviewAt=${nextReview} (${daysUntilReview} day(s) from today)`);
  } else {
    console.log('[allowlist-review] MISSING: review.nextReviewAt not found or invalid in allowlist file');
  }

  // Non-blocking by design: review staleness informs operators but does not fail CI.
  process.exit(0);
}

main();

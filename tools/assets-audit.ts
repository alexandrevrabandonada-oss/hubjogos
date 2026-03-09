import fs from 'fs';
import path from 'path';

interface AssetPackManifest<AssetKey extends string = string> {
  game: {
    slug: string;
    line: string;
    packSlug: string;
    title: string;
  };
  version: {
    manifestVersion: string;
    visualVersion: string;
    assetSet: string;
  };
  assets: Record<AssetKey, string>;
  fallback?: {
    default?: string;
    byKey?: Partial<Record<AssetKey, string>>;
  };
  metadata?: {
    externalPipeline?: boolean;
    runtimeFallback?: string;
    mobileSafe?: boolean;
    updatedAt?: string;
  };
}

interface AssetIssue {
  severity: 'ok' | 'warning' | 'error';
  type: string;
  message: string;
  asset?: string;
  file?: string;
}

interface AssetAuditResult {
  game: string;
  slug: string;
  packSlug: string;
  status: 'ok' | 'warning' | 'error';
  issues: AssetIssue[];
  stats: {
    totalAssets: number;
    validAssets: number;
    missingAssets: number;
    orphanFiles: number;
  };
}

function fileExists(filePath: string): boolean {
  try {
    fs.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

function getAllFilesRecursive(dir: string): string[] {
  const files: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
          files.push(...getAllFilesRecursive(fullPath));
        }
      } else {
        files.push(fullPath);
      }
    }
  } catch (e) {
    // Directory doesn't exist or can't be read
  }
  return files;
}

function auditAssetPack(manifestPath: string, gameRoot: string): AssetAuditResult {
  const issues: AssetIssue[] = [];
  let manifest: AssetPackManifest;

  // 1. Check manifest file exists
  if (!fileExists(manifestPath)) {
    return {
      game: 'unknown',
      slug: 'unknown',
      packSlug: 'unknown',
      status: 'error',
      issues: [
        {
          severity: 'error',
          type: 'manifest_missing',
          message: `Manifest file not found: ${manifestPath}`,
        },
      ],
      stats: {
        totalAssets: 0,
        validAssets: 0,
        missingAssets: 0,
        orphanFiles: 0,
      },
    };
  }

  // 2. Parse manifest
  try {
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    manifest = JSON.parse(manifestContent);
  } catch (e) {
    return {
      game: 'unknown',
      slug: 'unknown',
      packSlug: 'unknown',
      status: 'error',
      issues: [
        {
          severity: 'error',
          type: 'manifest_parse_error',
          message: `Failed to parse manifest: ${e instanceof Error ? e.message : String(e)}`,
        },
      ],
      stats: {
        totalAssets: 0,
        validAssets: 0,
        missingAssets: 0,
        orphanFiles: 0,
      },
    };
  }

  // 3. Validate manifest structure
  if (!manifest.game?.slug || !manifest.version?.manifestVersion || !manifest.assets) {
    issues.push({
      severity: 'error',
      type: 'manifest_structure',
      message: 'Manifest missing required fields: game.slug, version.manifestVersion, or assets',
    });
  }

  // 4. Check each asset path
  let validAssets = 0;
  let missingAssets = 0;

  const assetPaths = new Set<string>();

  for (const [key, assetPath] of Object.entries(manifest.assets || {})) {
    const normalizedPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
    const fullPath = path.join(process.cwd(), 'public', normalizedPath);
    assetPaths.add(normalizedPath);

    if (fileExists(fullPath)) {
      validAssets++;
    } else {
      missingAssets++;
      issues.push({
        severity: 'error',
        type: 'asset_missing',
        message: `Asset not found: ${assetPath}`,
        asset: key,
        file: normalizedPath,
      });
    }
  }

  // 5. Check fallback paths
  if (manifest.fallback?.default) {
    const normalizedPath = manifest.fallback.default.startsWith('/')
      ? manifest.fallback.default.slice(1)
      : manifest.fallback.default;
    const fullPath = path.join(process.cwd(), 'public', normalizedPath);
    assetPaths.add(normalizedPath);

    if (!fileExists(fullPath)) {
      issues.push({
        severity: 'error',
        type: 'fallback_missing',
        message: `Default fallback asset not found: ${manifest.fallback.default}`,
        file: normalizedPath,
      });
    }
  }

  if (manifest.fallback?.byKey) {
    for (const [key, fallbackPath] of Object.entries(manifest.fallback.byKey)) {
      if (fallbackPath) {
        const normalizedPath = fallbackPath.startsWith('/') ? fallbackPath.slice(1) : fallbackPath;
        const fullPath = path.join(process.cwd(), 'public', normalizedPath);
        assetPaths.add(normalizedPath);

        if (!fileExists(fullPath)) {
          issues.push({
            severity: 'warning',
            type: 'fallback_missing',
            message: `Fallback asset not found for key "${key}": ${fallbackPath}`,
            asset: key,
            file: normalizedPath,
          });
        }
      }
    }
  }

  // 6. Check for orphaned files
  let orphanCount = 0;
  if (fileExists(gameRoot)) {
    const allFiles = getAllFilesRecursive(gameRoot);
    const ignoredFiles = new Set(['.gitkeep', 'manifest.json', 'README.md', '.DS_Store']);

    for (const file of allFiles) {
      const relativeToPublic = path.relative(path.join(process.cwd(), 'public'), file);

      // Skip ignored files
      const fileName = path.basename(file);
      if (ignoredFiles.has(fileName)) {
        continue;
      }

      // Check if this file is referenced in manifest
      if (!assetPaths.has(relativeToPublic) && !assetPaths.has(`/${relativeToPublic}`)) {
        // Check if it's in subdirectories that might be work-in-progress
        const isInWorkDir = relativeToPublic.includes('fx/') || relativeToPublic.includes('audio/');
        if (!isInWorkDir) {
          orphanCount++;
          issues.push({
            severity: 'warning',
            type: 'orphan_file',
            message: `File not referenced in manifest: ${relativeToPublic}`,
            file: relativeToPublic,
          });
        }
      }
    }
  }

  // 7. Determine overall status
  const hasErrors = issues.some((i) => i.severity === 'error');
  const status = hasErrors ? 'error' : issues.length > 0 ? 'warning' : 'ok';

  return {
    game: manifest.game?.title || 'unknown',
    slug: manifest.game?.slug || 'unknown',
    packSlug: manifest.game?.packSlug || 'unknown',
    status,
    issues,
    stats: {
      totalAssets: Object.keys(manifest.assets || {}).length,
      validAssets,
      missingAssets,
      orphanFiles: orphanCount,
    },
  };
}

async function auditAllAssets() {
  const publicDir = path.join(process.cwd(), 'public', 'arcade');
  const results: AssetAuditResult[] = [];

  if (!fileExists(publicDir)) {
    console.error(`Error: ${publicDir} does not exist`);
    process.exit(1);
  }

  // Find all manifest.json files
  const gameDirectories = fs.readdirSync(publicDir, { withFileTypes: true }).filter((e) => e.isDirectory());

  for (const gameDir of gameDirectories) {
    const manifestPath = path.join(publicDir, gameDir.name, 'manifest.json');
    const gameRoot = path.join(publicDir, gameDir.name);
    const result = auditAssetPack(manifestPath, gameRoot);
    results.push(result);
  }

  // Generate console output
  console.log('\n=== ASSET PACK AUDIT REPORT ===\n');

  const summaryByStatus = {
    ok: 0,
    warning: 0,
    error: 0,
  };

  for (const result of results) {
    summaryByStatus[result.status]++;

    const statusEmoji = result.status === 'ok' ? '✓' : result.status === 'warning' ? '⚠' : '✗';
    console.log(`${statusEmoji} ${result.game} (${result.slug})`);
    console.log(`  Status: ${result.status.toUpperCase()}`);
    console.log(`  Assets: ${result.stats.validAssets}/${result.stats.totalAssets} valid`);

    if (result.stats.missingAssets > 0) {
      console.log(`  Missing: ${result.stats.missingAssets}`);
    }

    if (result.stats.orphanFiles > 0) {
      console.log(`  Orphaned: ${result.stats.orphanFiles}`);
    }

    if (result.issues.length > 0) {
      console.log(`  Issues:`);
      for (const issue of result.issues) {
        const issuePrefix =
          issue.severity === 'error' ? '    ✗' : issue.severity === 'warning' ? '    ⚠' : '    •';
        console.log(`${issuePrefix} [${issue.severity.toUpperCase()}] ${issue.type}: ${issue.message}`);
      }
    }
    console.log();
  }

  // Generate summary
  console.log('=== SUMMARY ===');
  console.log(`OK:      ${summaryByStatus.ok}`);
  console.log(`Warning: ${summaryByStatus.warning}`);
  console.log(`Error:   ${summaryByStatus.error}`);
  console.log();

  // Generate JSON report
  const reportPath = path.join(process.cwd(), 'reports', 'assets');
  const reportDir = path.dirname(reportPath);

  try {
    if (!fileExists(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const jsonReportPath = path.join(reportDir, `${timestamp}-assets-audit.json`);
    fs.writeFileSync(jsonReportPath, JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2));
    console.log(`JSON report saved: ${jsonReportPath}`);
  } catch (e) {
    console.error(`Failed to save JSON report: ${e instanceof Error ? e.message : String(e)}`);
  }

  // Exit with error code if there are errors
  const totalErrors = results.reduce((sum, r) => sum + r.stats.missingAssets, 0);
  if (totalErrors > 0) {
    console.log(`\n⚠️ Found ${totalErrors} missing assets – please review before deployment.`);
    process.exit(1);
  }
}

auditAllAssets().catch((e) => {
  console.error('Audit failed:', e);
  process.exit(1);
});

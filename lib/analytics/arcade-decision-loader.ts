import fs from 'fs';
import path from 'path';

/**
 * Load the latest arcade decision report with stability metrics
 * from reports/arcade-decision/ folder.
 * 
 * This supplements the basic arcadeFinalDecision from MetricsSnapshot
 * with T40 stability tracking data.
 */
export async function loadLatestArcadeDecision() {
  try {
    const baseDir = path.join(process.cwd(), 'reports', 'arcade-decision');
    
    if (!fs.existsSync(baseDir)) {
      return null;
    }

    const files = fs.readdirSync(baseDir)
      .filter(f => f.endsWith('-arcade-final-decision.json'))
      .sort()
      .reverse(); // Most recent first

    if (files.length === 0) {
      return null;
    }

    const latestFile = path.join(baseDir, files[0]);
    const data = JSON.parse(fs.readFileSync(latestFile, 'utf-8'));
    
    return data;
  } catch (error) {
    console.error('Error loading latest arcade decision:', error);
    return null;
  }
}

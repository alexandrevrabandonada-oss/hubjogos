import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const SCREENSHOT_DIR = path.join(process.cwd(), 'reports', 't109-screenshots');

test.describe('Bairro Resiste T109 Visual Pass', () => {
  test('captures board states for visual comparison', async ({ page }) => {
    mkdirSync(SCREENSHOT_DIR, { recursive: true });

    await page.goto('/arcade/bairro-resiste');
    await page.getByRole('button', { name: /Iniciar Defesa/i }).click();

    const board = page.locator('div[class*="mapBackground"]');
    await expect(board).toBeVisible();
    await page.waitForTimeout(600);

    await board.screenshot({ path: path.join(SCREENSHOT_DIR, '01-calm-board.png') });

    await expect
      .poll(
        async () => {
          const warningCount = await page.locator('div[class*="hotspotWarning"]').count();
          return warningCount > 0;
        },
        { timeout: 25000, intervals: [600, 1000, 1200] }
      )
      .toBeTruthy();

    await page.waitForTimeout(350);
    await board.screenshot({ path: path.join(SCREENSHOT_DIR, '02-mid-pressure.png') });

    await expect
      .poll(
        async () => {
          return page.locator('div[class*="hotspotCritical"]').count();
        },
        { timeout: 35000, intervals: [700, 1000, 1300] }
      )
      .toBeGreaterThan(0);

    await page.waitForTimeout(350);
    await board.screenshot({ path: path.join(SCREENSHOT_DIR, '03-critical-state.png') });

    const highPressureHotspot = page.locator('div[class*="hotspotCritical"], div[class*="hotspotWarning"]').first();
    if (await highPressureHotspot.count()) {
      const hotspotId = await highPressureHotspot.getAttribute('data-hotspot-id');
      if (hotspotId) {
        await page.locator(`div[data-hotspot-id="${hotspotId}"]`).dispatchEvent('click');
      } else {
        await highPressureHotspot.click({ force: true });
      }
    } else {
      const fallback = page.locator('div[class*="hotspot_"]').first();
      const hotspotId = await fallback.getAttribute('data-hotspot-id');
      if (hotspotId) {
        await page.locator(`div[data-hotspot-id="${hotspotId}"]`).dispatchEvent('click');
      } else {
        await fallback.click({ force: true });
      }
    }

    await expect
      .poll(
        async () => {
          const popup = await page.locator('div[class*="saveTextPopup"]').count();
          const memoryTag = await page.locator('div[class*="savedMemoryTag"]').count();
          return popup + memoryTag;
        },
        { timeout: 7000, intervals: [200, 350, 500] }
      )
      .toBeGreaterThan(0);
    await page.waitForTimeout(120);
    await board.screenshot({ path: path.join(SCREENSHOT_DIR, '04-save-recovery.png') });
  });
});

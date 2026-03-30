import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const SCREENSHOT_DIR = path.join(process.cwd(), 'reports', 't110-screenshots');

test.describe('Bairro Resiste T110 Signature Landmark Pass', () => {
  test('captures poster-worthy board states for comparison', async ({ page }) => {
    mkdirSync(SCREENSHOT_DIR, { recursive: true });

    await page.goto('/arcade/bairro-resiste');
    await page.getByRole('button', { name: /Iniciar Defesa/i }).click();

    const board = page.locator('div[class*="mapBackground"]');
    await expect(board).toBeVisible();
    await page.waitForTimeout(700);

    await board.screenshot({ path: path.join(SCREENSHOT_DIR, '01-calm-board.png') });

    await expect
      .poll(
        async () => (await page.locator('div[class*="hotspotWarning"]').count()) > 0,
        { timeout: 25000, intervals: [600, 1000, 1200] }
      )
      .toBeTruthy();

    await page.waitForTimeout(350);
    await board.screenshot({ path: path.join(SCREENSHOT_DIR, '02-mid-pressure.png') });

    await expect
      .poll(
        async () => page.locator('div[class*="hotspotCritical"]').count(),
        { timeout: 35000, intervals: [700, 1000, 1300] }
      )
      .toBeGreaterThan(0);

    await page.waitForTimeout(350);
    await board.screenshot({ path: path.join(SCREENSHOT_DIR, '03-critical-state.png') });

    const target = page.locator('div[class*="hotspotCritical"], div[class*="hotspotWarning"]').first();
    if (await target.count()) {
      const hotspotId = await target.getAttribute('data-hotspot-id');
      if (hotspotId) {
        await page.locator(`div[data-hotspot-id="${hotspotId}"]`).dispatchEvent('click');
      } else {
        await target.click({ force: true });
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

    await page.waitForTimeout(150);
    await board.screenshot({ path: path.join(SCREENSHOT_DIR, '04-save-recovery.png') });
  });
});

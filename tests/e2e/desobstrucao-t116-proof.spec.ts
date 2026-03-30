import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const SCREENSHOT_DIR = path.join(process.cwd(), 'reports', 't116-captures');
const ROUTE = '/arcade/desobstrucao';

const fireAndSettle = async (page: import('@playwright/test').Page) => {
  const fireButton = page.getByRole('button', { name: /FIRE RAMMER/i });
  await expect(fireButton).toBeVisible({ timeout: 6000 });
  await fireButton.click();
  await page.waitForTimeout(950);
};

const finishFlightCycle = async (page: import('@playwright/test').Page) => {
  await page.waitForTimeout(1200);
};

const enableTouchPrimer = async (page: import('@playwright/test').Page) => {
  await page.addInitScript(() => {
    const originalMatchMedia = window.matchMedia.bind(window);
    window.matchMedia = ((query: string): MediaQueryList => {
      if (query.includes('(pointer: coarse)')) {
        const listeners = new Set<(ev: MediaQueryListEvent) => void>();
        return {
          matches: true,
          media: query,
          onchange: null,
          addEventListener: (_type: string, cb: (ev: MediaQueryListEvent) => void) => listeners.add(cb),
          removeEventListener: (_type: string, cb: (ev: MediaQueryListEvent) => void) => listeners.delete(cb),
          addListener: (cb: (ev: MediaQueryListEvent) => void) => listeners.add(cb),
          removeListener: (cb: (ev: MediaQueryListEvent) => void) => listeners.delete(cb),
          dispatchEvent: () => true,
        } as MediaQueryList;
      }
      return originalMatchMedia(query);
    }) as typeof window.matchMedia;
  });
};

test.describe('T116 Desobstrucao Capture Proof', () => {
  test.beforeEach(async () => {
    mkdirSync(SCREENSHOT_DIR, { recursive: true });
  });

  test('captures primer moment on mobile', async ({ page }) => {
    await enableTouchPrimer(page);
    await page.goto(ROUTE, { waitUntil: 'networkidle' });

    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('div[class*="primerOverlay"]')).toBeVisible();
    await page.waitForTimeout(250);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'primer-moment.png'),
      fullPage: false,
    });
  });

  test('captures blockage 1 impact (concrete)', async ({ page }) => {
    await page.goto(ROUTE, { waitUntil: 'networkidle' });

    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('div[class*="blockageBadge"]')).toContainText('Concrete Barrier');

    await fireAndSettle(page);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'blockage-1-impact.png'),
      fullPage: false,
    });

    await finishFlightCycle(page);
  });

  test('captures blockage 2 impact (steel grate)', async ({ page }) => {
    await page.goto(`${ROUTE}?captureStage=steel`, { waitUntil: 'networkidle' });
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('div[class*="blockageBadge"]')).toContainText('Steel Grate');

    await fireAndSettle(page);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'blockage-2-impact.png'),
      fullPage: false,
    });

    await finishFlightCycle(page);
  });

  test('captures second blockage clear state', async ({ page }) => {
    await page.goto(`${ROUTE}?captureStage=cleared`, { waitUntil: 'networkidle' });
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('div[class*="restorationOverlay"]')).toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'second-blockage-clear.png'),
      fullPage: false,
    });
  });
});

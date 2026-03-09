import { expect, test } from '@playwright/test';

interface GameTestCase {
  slug: string;
  startButton: RegExp;
  canvasAria: RegExp;
  expectedVisualVersion?: string;
  expectedAssetSet?: string;
}

const CASES: GameTestCase[] = [
  {
    slug: 'tarifa-zero-corredor',
    startButton: /Comecar corrida|Começar corrida/i,
    canvasAria: /Jogo arcade/i,
    expectedVisualVersion: 'T35E-PREMIUM-V7',
    expectedAssetSet: 'corredor-do-povo-v6',
  },
  {
    slug: 'mutirao-do-bairro',
    startButton: /Iniciar mutirao/i,
    canvasAria: /Jogo arcade Mutirao do Bairro/i,
    expectedVisualVersion: 'T36C-PREMIUM-V1',
    expectedAssetSet: 'mutirao-bairro-premium',
  },
  {
    slug: 'cooperativa-na-pressao',
    startButton: /Iniciar cooperativa/i,
    canvasAria: /Jogo arcade Cooperativa na Pressao/i,
    expectedVisualVersion: 'T42B-TUNED',
    expectedAssetSet: 'cooperativa-p0',
  },
] as const;


test.describe('asset pipeline smoke', () => {
  for (const gameCase of CASES) {
    test(`desktop smoke - ${gameCase.slug}`, async ({ page }) => {
      const pageErrors: string[] = [];
      page.on('pageerror', (error) => {
        pageErrors.push(error.message);
      });

      await page.goto(`/arcade/${gameCase.slug}`);
      await expect(page.getByRole('button', { name: gameCase.startButton })).toBeVisible();
      await page.getByRole('button', { name: gameCase.startButton }).click();

      await expect(page.getByLabel(gameCase.canvasAria)).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(800);

      expect(pageErrors).toEqual([]);
    });

    test(`manifest awareness - ${gameCase.slug}`, async ({ page }) => {
      await page.goto(`/arcade/${gameCase.slug}`);
      await page.getByRole('button', { name: gameCase.startButton }).click();

      // Wait for game to render and HUD to be visible
      await expect(page.getByLabel(gameCase.canvasAria)).toBeVisible({ timeout: 15000 });

      // Verify manifest metadata is present in HUD badges
      if (gameCase.expectedVisualVersion) {
        const hudContent = await page.locator('body').innerText();
        expect(hudContent).toContain(gameCase.expectedVisualVersion);
      }

      if (gameCase.expectedAssetSet) {
        const hudContent = await page.locator('body').innerText();
        expect(hudContent).toContain(gameCase.expectedAssetSet);
      }
    });

    test(`mobile smoke - ${gameCase.slug}`, async ({ page }) => {
      const pageErrors: string[] = [];
      page.on('pageerror', (error) => {
        pageErrors.push(error.message);
      });

      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/arcade/${gameCase.slug}`);
      await expect(page.getByRole('button', { name: gameCase.startButton })).toBeVisible();
      await page.getByRole('button', { name: gameCase.startButton }).click();

      await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(800);

      expect(pageErrors).toEqual([]);
    });
  }
});

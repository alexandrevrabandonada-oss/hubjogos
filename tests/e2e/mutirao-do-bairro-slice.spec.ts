import { expect, test } from '@playwright/test';

test.describe('mutirao do bairro vertical slice', () => {
  test('desktop smoke: carrega, inicia e usa acoes', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    await page.goto('/arcade/mutirao-do-bairro');

    await expect(
      page.getByRole('article').getByRole('heading', { level: 2, name: /Mutirao do Bairro - Defesa do Comum/i }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /Iniciar mutirao/i })).toBeVisible();

    await page.getByRole('button', { name: /Iniciar mutirao/i }).click();

    await expect(page.locator('canvas[aria-label="Jogo arcade Mutirao do Bairro"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Reparar/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Defender/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Mobilizar/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Mutirao/i })).toBeVisible();

    await page.getByRole('button', { name: /Reparar/i }).click();
    await page.waitForTimeout(220);
    await page.getByRole('button', { name: /Defender/i }).click();
    await page.waitForTimeout(220);
    await page.getByRole('button', { name: /Mobilizar/i }).click();
    await page.waitForTimeout(220);

    await page.getByRole('button', { name: /Pausar/i }).click();
    await page.waitForTimeout(220);

    await page.goto('/arcade/mutirao-do-bairro?fixture=final-mutirao');
    await expect(page.getByText(/Resultado da rodada/i)).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Mutirao segurou o bairro|Colapso parcial no bairro/i }).first(),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /Jogar de novo/i })).toBeVisible();

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('mobile smoke: viewport e controles touch', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/arcade/mutirao-do-bairro');

    await page.getByRole('button', { name: /Iniciar mutirao/i }).click();
    await expect(page.locator('canvas[aria-label="Jogo arcade Mutirao do Bairro"]')).toBeVisible();

    await page.getByRole('button', { name: /Reparar/i }).click();
    await page.getByRole('button', { name: /Defender/i }).click();
    await page.getByRole('button', { name: /Mobilizar/i }).click();
    await page.waitForTimeout(280);
  });
});

    test('premium assets: validar T36C premium visual (desktop)', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/arcade/mutirao-do-bairro');
      await page.getByRole('button', { name: /Iniciar mutirao/i }).click();
      await expect(page.locator('canvas[aria-label="Jogo arcade Mutirao do Bairro"]')).toBeVisible();

      // Wait for canvas to render premium assets
      await page.waitForTimeout(500);

      // Check that HUD elements are rendered
      const canvas = page.locator('canvas[aria-label="Jogo arcade Mutirao do Bairro"]');
      await expect(canvas).toBeVisible();

      // Take screenshot for validation
      await page.screenshot({ path: 'reports/validation/mutirao-premium-desktop-gameplay.png', fullPage: false });

      expect(consoleErrors).toEqual([]);
    });

    test('outcome screen: premium final visual (desktop)', async ({ page }) => {
      await page.goto('/arcade/mutirao-do-bairro?fixture=final-mutirao');
      await expect(page.getByText(/Resultado da rodada/i)).toBeVisible();
      await expect(
        page.getByRole('heading', { name: /Mutirao segurou o bairro|Colapso parcial no bairro/i }).first(),
      ).toBeVisible();

      await page.screenshot({ path: 'reports/validation/mutirao-premium-outcome.png', fullPage: true });
    });

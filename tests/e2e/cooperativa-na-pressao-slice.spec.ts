import { expect, test } from '@playwright/test';

test.describe('cooperativa na pressao vertical slice', () => {
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

    await page.goto('/arcade/cooperativa-na-pressao');

    await expect(
      page
        .getByRole('article')
        .getByRole('heading', { level: 2, name: /Cooperativa na Pressao/i }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /Iniciar cooperativa/i })).toBeVisible();

    await page.getByRole('button', { name: /Iniciar cooperativa/i }).click();

    await expect(page.locator('canvas[aria-label="Jogo arcade Cooperativa na Pressao"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Organizar/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Redistribuir/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Cuidar/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Mutirao/i })).toBeVisible();

    await page.getByRole('button', { name: /Organizar/i }).click();
    await page.waitForTimeout(220);
    await page.getByRole('button', { name: /Redistribuir/i }).click();
    await page.waitForTimeout(220);
    await page.getByRole('button', { name: /Cuidar/i }).click();
    await page.waitForTimeout(220);

    await page.goto('/arcade/cooperativa-na-pressao?fixture=final-cooperativa');
    await expect(
      page.getByRole('heading', { name: /Cooperativa segurou o turno final|Operacao colapsou sob pressao/i }).first(),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /Jogar de novo|Tentar de novo|Melhorar coordenacao/i })).toBeVisible();

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('mobile smoke: viewport e controles touch', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/arcade/cooperativa-na-pressao');

    await page.getByRole('button', { name: /Iniciar cooperativa/i }).click();
    await expect(page.locator('canvas[aria-label="Jogo arcade Cooperativa na Pressao"]')).toBeVisible();

    await page.getByRole('button', { name: /Organizar/i }).click();
    await page.getByRole('button', { name: /Redistribuir/i }).click();
    await page.getByRole('button', { name: /Cuidar/i }).click();
    await page.waitForTimeout(280);
  });
});

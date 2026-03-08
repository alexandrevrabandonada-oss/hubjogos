import { expect, test } from '@playwright/test';

test('tarifa zero arcade smoke', async ({ page }) => {
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

  await page.goto('/arcade/tarifa-zero-corredor');

  await expect(
    page.getByRole('heading', { level: 2, name: /Tarifa Zero RJ — Corredor do Povo/i })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Começar corrida/i })
  ).toBeVisible();
  await expect(page.getByText(/Mobilidade como direito/i)).toBeVisible();

  await page.getByRole('button', { name: /Começar corrida/i }).click();

  await expect(page.locator('canvas[aria-label="Jogo arcade Tarifa Zero"]')).toBeVisible();
  await expect(page.getByText(/Em jogo/i)).toBeVisible();
  await expect(page.getByText(/T35E-premium-v7/i)).toBeVisible();
  await expect(page.getByText(/corredor-do-povo-v6/i)).toBeVisible();

  await page.getByRole('button', { name: /Mover para direita/i }).click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: /Mover para esquerda/i }).click();
  await page.waitForTimeout(300);

  await page.getByRole('button', { name: /Pausar jogo/i }).click();
  await expect(page.getByText(/Pausado/i)).toBeVisible();
  await page.getByRole('button', { name: /Pausar jogo/i }).click();
  await expect(page.getByText(/Em jogo/i)).toBeVisible();

  await page.waitForTimeout(2200);

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
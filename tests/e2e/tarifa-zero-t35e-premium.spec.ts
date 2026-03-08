import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';

test('tarifa zero arcade smoke - T35E premium', async ({ page }) => {
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

test('tarifa zero arcade - variantes dedicadas visíveis', async ({ page }) => {
  await page.goto('/arcade/tarifa-zero-corredor');
  
  // Validate intro screen shows updated assets
  await expect(page.getByRole('heading', { level: 2, name: /Tarifa Zero RJ — Corredor do Povo/i })).toBeVisible();
  
  // Start game
  await page.getByRole('button', { name: /Começar corrida/i }).click();
  await expect(page.locator('canvas[aria-label="Jogo arcade Tarifa Zero"]')).toBeVisible();
  
  // Verify visual version tag
  await expect(page.getByText(/T35E-premium-v7/i)).toBeVisible();
  
  // Play for a bit to see entities spawn
  await page.waitForTimeout(8000);
  
  // Canvas should still be active (no crashes from new assets)
  await expect(page.locator('canvas[aria-label="Jogo arcade Tarifa Zero"]')).toBeVisible();
});

test.describe('tarifa zero arcade - final premium', () => {
  test('validates premium final card and CTAs', async ({ page }) => {
    await page.goto('/arcade/tarifa-zero-corredor?preview=final');
    
    // Validate final card premium
    await expect(page.getByText(/Corredor concluído/i)).toBeVisible();
    await expect(page.getByText(/Score total:/i)).toBeVisible();
    await expect(page.getByText(/Premium T35F/i)).toBeVisible();
    await expect(page.getByText(/SFX base on/i)).toBeVisible();
    await expect(page.getByText(/Fase final/i)).toBeVisible();
    await expect(page.getByText('Combo pico', { exact: true }).first()).toBeVisible();
    
    // Validate CTAs presence and order
    await expect(page.getByRole('button', { name: /Jogar de novo/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Próximo jogo/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Compartilhar resultado/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Participar da campanha/i })).toBeVisible();
    
    // Validate final share card
    await expect(page.getByText(/Card de compartilhamento/i)).toBeVisible();
    await expect(page.getByText(/QR code para reentrada/i)).toBeVisible();
    
    // Test replay CTA returns to live run quickly
    const currentUrl = page.url();
    await page.getByRole('button', { name: /Jogar de novo/i }).click();
    await expect(page.locator('canvas[aria-label="Jogo arcade Tarifa Zero"]')).toBeVisible();
    expect(page.url()).toBe(currentUrl);
  });
});

test('tarifa zero arcade baseline screenshots desktop', async ({ page }) => {
  mkdirSync('reports/validation/baselines', { recursive: true });

  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('/arcade/tarifa-zero-corredor');
  await page.getByRole('button', { name: /Começar corrida/i }).click();
  await expect(page.locator('canvas[aria-label="Jogo arcade Tarifa Zero"]')).toBeVisible();
  await page.waitForTimeout(1400);
  await page.screenshot({ path: 'reports/validation/baselines/t35f-tarifa-zero-run-desktop.png', fullPage: true });

  await page.goto('/arcade/tarifa-zero-corredor?preview=final');
  await expect(page.getByText(/Corredor concluído/i)).toBeVisible();
  await page.waitForTimeout(250);
  await page.screenshot({ path: 'reports/validation/baselines/t35f-tarifa-zero-final-desktop.png', fullPage: true });
});

test('tarifa zero arcade baseline screenshots mobile', async ({ page }) => {
  mkdirSync('reports/validation/baselines', { recursive: true });

  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto('/arcade/tarifa-zero-corredor');
  await page.getByRole('button', { name: /Começar corrida/i }).click();
  await expect(page.locator('canvas[aria-label="Jogo arcade Tarifa Zero"]')).toBeVisible();
  await page.waitForTimeout(1400);
  await page.screenshot({ path: 'reports/validation/baselines/t35f-tarifa-zero-run-mobile.png', fullPage: true });

  await page.goto('/arcade/tarifa-zero-corredor?preview=final');
  await expect(page.getByText(/Corredor concluído/i)).toBeVisible();
  await page.waitForTimeout(250);
  await page.screenshot({ path: 'reports/validation/baselines/t35f-tarifa-zero-final-mobile.png', fullPage: true });
});

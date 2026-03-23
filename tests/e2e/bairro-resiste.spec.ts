import { test, expect } from '@playwright/test';

test.describe('Bairro Resiste Arcade Structural', () => {
  test('deve carregar a rota e mostrar intro screen', async ({ page }) => {
    await page.goto('/arcade/bairro-resiste');
    
    // Intro screen
    await expect(page.getByRole('heading', { name: /Bairro Resiste/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Iniciar Mutirão/i })).toBeVisible();
  });

  test('deve iniciar gameplay, mostrar hud e hotspots', async ({ page }) => {
    await page.goto('/arcade/bairro-resiste');
    await page.getByRole('button', { name: /Iniciar Mutirão/i }).click();

    // HUD Elements
    await expect(page.getByText('INTEGRIDADE')).toBeVisible();
    await expect(page.getByText('SCORE')).toBeVisible();

    // Verificar se renderizou o mapBackground e os hotspots
    const map = page.locator('div[class*="mapBackground"]');
    await expect(map).toBeVisible();

    // Ação principal: Clicar no primeiro hotspot para curá-lo (ativa cooldown)
    const firstHotspot = page.locator('div[class*="hotspot_"]').first();
    await firstHotspot.click();
    
    // Verificar se o cooldown state (grayscale/cursor-not-allowed) foi aplicado
    await expect(firstHotspot).toHaveClass(/grayscale/);
  });
});

import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Acessibilidade (Baseline)', () => {
    test('home deve ser acessível', async ({ page }) => {
        await page.goto('/');
        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
        expect(accessibilityScanResults.violations.filter(v => ['serious', 'critical'].includes(v.impact!))).toEqual([]);
    });

    test('explorar deve ser acessível', async ({ page }) => {
        await page.goto('/explorar');
        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
        expect(accessibilityScanResults.violations.filter(v => ['serious', 'critical'].includes(v.impact!))).toEqual([]);
    });

    test('quiz deve ser acessível', async ({ page }) => {
        await page.goto('/play/voto-consciente');
        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
        expect(accessibilityScanResults.violations.filter(v => ['serious', 'critical'].includes(v.impact!))).toEqual([]);
    });

    test('branching story deve ser acessível', async ({ page }) => {
        await page.goto('/play/transporte-urgente');
        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
        expect(accessibilityScanResults.violations.filter(v => ['serious', 'critical'].includes(v.impact!))).toEqual([]);
    });

    test('simulation deve ser acessível', async ({ page }) => {
        await page.goto('/play/cidade-real');
        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
        expect(accessibilityScanResults.violations.filter(v => ['serious', 'critical'].includes(v.impact!))).toEqual([]);
    });

    test('map deve ser acessível', async ({ page }) => {
        await page.goto('/play/abandonado');
        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
        expect(accessibilityScanResults.violations.filter(v => ['serious', 'critical'].includes(v.impact!))).toEqual([]);
    });

    test('share page deve ser acessível', async ({ page }) => {
        await page.goto(
            '/share/voto-consciente/p-cidade-do-cuidado?title=Resultado%20Teste&summary=Resumo%20teste'
        );
        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
        expect(accessibilityScanResults.violations.filter(v => ['serious', 'critical'].includes(v.impact!))).toEqual([]);
    });
});

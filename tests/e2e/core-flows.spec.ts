import { expect, test } from '@playwright/test';

test('home abre', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Jogue, compare, compartilhe: Missões eleitorais do RJ' })
  ).toBeVisible();
});

test('explorar abre', async ({ page }) => {
  await page.goto('/explorar');
  await expect(
    page.getByRole('heading', { name: 'Escolha um conflito e jogue agora' })
  ).toBeVisible();
});

test('/play/[slug] funciona nas 4 engines reais', async ({ page }) => {
  const slugs = [
    'voto-consciente',
    'transporte-urgente',
    'cidade-real',
    'abandonado',
  ];

  for (const slug of slugs) {
    await page.goto(`/play/${slug}`);
    await expect(page.getByRole('button', { name: 'Jogar agora' })).toBeVisible();
  }
});

test('fluxo completo de quiz até outcome', async ({ page }) => {
  await page.goto('/play/voto-consciente');
  await page.getByRole('button', { name: 'Jogar agora' }).click();

  const answers = [
    /Atenção básica de saúde e cuidado territorial/,
    /Integração tarifária total entre ônibus, trem e metrô/,
    /Direitos mínimos: descanso, proteção social e renda previsível/,
    /Reabilitar para moradia social e equipamentos públicos/,
    /Conselhos locais com poder de decisão sobre parte do orçamento/,
    /Meta com prazo, fonte de recurso e transparência de execução/,
  ];

  for (const answer of answers) {
    await page.getByRole('radio', { name: answer }).click();
    await page.getByRole('button', { name: /Próxima|Ver resultado/ }).click();
  }

  await expect(page.getByRole('button', { name: 'Jogar de novo' })).toBeVisible();
  await expect(page.locator('strong', { hasText: 'Leitura política' })).toBeVisible();
});

test('fluxo completo de branching até outcome', async ({ page }) => {
  await page.goto('/play/transporte-urgente');
  await page.getByRole('button', { name: 'Jogar agora' }).click();

  await page.locator('[role="radio"]').first().click();
  await expect(page.getByRole('heading', { name: '08h40 - pressão da plataforma' })).toBeVisible();
  await page.locator('[role="radio"]').first().click();

  await expect(page.getByRole('button', { name: 'Jogar de novo' })).toBeVisible();
  await expect(page.locator('strong', { hasText: 'Leitura política' })).toBeVisible();
});

test('smoke de simulation', async ({ page }) => {
  await page.goto('/play/cidade-real');
  await page.getByRole('button', { name: 'Jogar agora' }).click();

  await expect(page.getByText('Orçamento total:')).toBeVisible();
  await expect(page.getByRole('button', { name: /Distribua|Continuar/ })).toBeVisible();
});

test('smoke de map', async ({ page }) => {
  await page.goto('/play/abandonado');
  await page.getByRole('button', { name: 'Jogar agora' }).click();

  await page.getByRole('button', { name: /Hospital Central/ }).click();
  await expect(page.getByRole('heading', { name: 'Situação atual' })).toBeVisible();
});

test('share page abre sem quebrar', async ({ page }) => {
  await page.goto(
    '/share/voto-consciente/p-cidade-do-cuidado?title=Resultado%20Teste&summary=Resumo%20teste'
  );

  await expect(page.getByText('Como compartilhar este resultado')).toBeVisible();
});

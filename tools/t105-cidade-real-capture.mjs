import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import gifencPkg from 'gifenc';
import { chromium } from '@playwright/test';

const { GIFEncoder, quantize, applyPalette } = gifencPkg;

const BASE_URL = process.env.T105_BASE_URL || 'http://127.0.0.1:3100';
const SHOWCASE_DIR = path.resolve('public/showcase/cidade-real');
const MOTION_DIR = path.join(SHOWCASE_DIR, 'motion');
const RAW_DIR = path.resolve('reports/showcase/cidade-real/raw');

fs.mkdirSync(SHOWCASE_DIR, { recursive: true });
fs.mkdirSync(MOTION_DIR, { recursive: true });
fs.mkdirSync(RAW_DIR, { recursive: true });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function encodeGifFromPngBuffers(buffers, outPath, delay = 70) {
  if (!buffers.length) {
    throw new Error('No PNG buffers to encode');
  }

  const first = PNG.sync.read(buffers[0]);
  const gif = GIFEncoder();
  gif.writeHeader();

  for (const buffer of buffers) {
    const png = PNG.sync.read(buffer);
    const palette = quantize(png.data, 256);
    const index = applyPalette(png.data, palette);
    gif.writeFrame(index, first.width, first.height, { palette, delay });
  }

  gif.finish();
  fs.writeFileSync(outPath, Buffer.from(gif.bytesView()));
}

async function dismissIntro(page) {
  await page.goto(`${BASE_URL}/play/cidade-real`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Jogar agora' }).click();
  await page.locator('[class*="mapView"]').first().waitFor({ state: 'visible' });
  await sleep(300);
}

async function dismissCrisis(page) {
  const acknowledge = page.getByRole('button', { name: /Assumir Comando/i });
  if (await acknowledge.count()) {
    await acknowledge.first().click();
    await sleep(250);
  }
}

function getDistrictLocator(page, districtName) {
  return page.locator('[class*="districtArea"]').filter({ hasText: districtName }).first();
}

function getOutcomeHeading(page) {
  return page.getByRole('heading', { name: /Cidade Viva e Resiliente|Cidade Partida/i }).first();
}

async function getSimulationClip(page) {
  const wrap = page.locator('[class*="simulationWrap"]').first();
  if ((await wrap.count()) === 0) {
    return null;
  }
  await wrap.scrollIntoViewIfNeeded();
  const box = await wrap.boundingBox();
  if (!box) {
    return null;
  }

  return {
    x: Math.max(0, box.x),
    y: Math.max(0, box.y),
    width: box.width,
    height: box.height,
  };
}

async function captureStill(page, fileName) {
  const clip = await getSimulationClip(page);
  const outputPath = path.join(SHOWCASE_DIR, fileName);
  if (!clip) {
    await page.screenshot({ path: outputPath });
    return;
  }
  await page.screenshot({ path: outputPath, clip });
}

async function executeProject(page, label) {
  const projectButton = page.locator('button').filter({ hasText: label }).first();
  await projectButton.hover();
  await sleep(150);
  await projectButton.click();
  await sleep(150);
  await page.getByRole('button', { name: /EXECUTAR DECISÃO/i }).click();
}

async function captureGif(page, fileName, durationMs, sequence, delayMs = 70) {
  const clip = await getSimulationClip(page);
  const sequencePromise = sequence(page);
  const frames = [];
  const startedAt = Date.now();

  while (Date.now() - startedAt < durationMs) {
    frames.push(await page.screenshot({ clip }));
    await sleep(90);
  }

  await sequencePromise;
  encodeGifFromPngBuffers(frames, path.join(MOTION_DIR, fileName), delayMs);
}

async function scenarioOpening(page) {
  await dismissIntro(page);
  await captureStill(page, 'screenshot-01-opening-city.png');
}

async function scenarioMidCrisis(page) {
  await dismissIntro(page);
  await executeProject(page, 'Iluminação em LED');
  await page.getByRole('button', { name: /Impactando Território/i }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: /EXECUTAR DECISÃO|SELECIONE UMA AÇÃO/i }).waitFor({ state: 'visible' });
  await sleep(350);
  await captureStill(page, 'screenshot-02-mid-crisis.png');
}

async function scenarioNearCollapse(page) {
  await dismissIntro(page);
  await executeProject(page, 'Iluminação em LED');
  await page.getByRole('button', { name: /EXECUTAR DECISÃO|SELECIONE UMA AÇÃO/i }).waitFor({ state: 'visible' });
  await dismissCrisis(page);
  await executeProject(page, 'Reforma de Escolas');
  await page.getByRole('button', { name: /EXECUTAR DECISÃO|SELECIONE UMA AÇÃO/i }).waitFor({ state: 'visible' });
  await sleep(350);
  await captureStill(page, 'screenshot-03-near-collapse.png');
}

async function scenarioRecovery(page) {
  await dismissIntro(page);
  await getDistrictLocator(page, 'Vila Popular').click();
  await sleep(120);
  const projectButton = page.locator('button').filter({ hasText: 'Saneamento na Vila' }).first();
  await projectButton.hover();
  await sleep(180);
  await projectButton.click();
  await sleep(180);
  await page.getByRole('button', { name: /EXECUTAR DECISÃO/i }).click();
  await sleep(450);
  await captureStill(page, 'screenshot-04-intervention-recovery.png');
}

async function scenarioFinalResult(page) {
  await dismissIntro(page);
  await executeProject(page, 'Saneamento na Vila');
  await page.getByRole('button', { name: /EXECUTAR DECISÃO|SELECIONE UMA AÇÃO/i }).waitFor({ state: 'visible' });
  await dismissCrisis(page);
  await executeProject(page, 'Tarifa Zero Municipal');
  await page.getByRole('button', { name: /EXECUTAR DECISÃO|SELECIONE UMA AÇÃO/i }).waitFor({ state: 'visible' });
  await dismissCrisis(page);
  await executeProject(page, 'Habitação no Centro');
  await getOutcomeHeading(page).waitFor({ state: 'visible' });
  await sleep(350);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(200);
  await captureStill(page, 'screenshot-05-final-result.png');
}

async function generateStills(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const page = await context.newPage();

  await scenarioOpening(page);
  await scenarioMidCrisis(page);
  await scenarioNearCollapse(page);
  await scenarioRecovery(page);
  await scenarioFinalResult(page);

  await context.close();
}

async function generateGifs(browser) {
  const focusContext = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const focusPage = await focusContext.newPage();
  await dismissIntro(focusPage);
  await captureGif(focusPage, 'gif-01-district-focus.gif', 3400, async (page) => {
    await getDistrictLocator(page, 'Centro Histórico').click();
    await sleep(700);
    await page.locator('button').filter({ hasText: 'Tarifa Zero Municipal' }).first().hover();
    await sleep(900);
    await page.locator('button').filter({ hasText: 'Habitação no Centro' }).first().hover();
    await sleep(900);
  });
  await focusContext.close();

  const crisisContext = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const crisisPage = await crisisContext.newPage();
  await dismissIntro(crisisPage);
  await captureGif(crisisPage, 'gif-02-crisis-escalation.gif', 4000, async (page) => {
    await executeProject(page, 'Iluminação em LED');
    await sleep(2500);
  });
  await crisisContext.close();

  const interventionContext = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const interventionPage = await interventionContext.newPage();
  await dismissIntro(interventionPage);
  await captureGif(interventionPage, 'gif-03-intervention-impact.gif', 4000, async (page) => {
    await getDistrictLocator(page, 'Vila Popular').click();
    await sleep(200);
    await page.locator('button').filter({ hasText: 'Saneamento na Vila' }).first().click();
    await sleep(220);
    await page.getByRole('button', { name: /EXECUTAR DECISÃO/i }).click();
    await sleep(2300);
  });
  await interventionContext.close();
}

async function generateClip() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1200 },
    recordVideo: {
      dir: RAW_DIR,
      size: { width: 1440, height: 1200 },
    },
  });
  const page = await context.newPage();

  await dismissIntro(page);
  await getDistrictLocator(page, 'Vila Popular').click();
  await sleep(200);
  await executeProject(page, 'Saneamento na Vila');
  await page.getByRole('button', { name: /EXECUTAR DECISÃO|SELECIONE UMA AÇÃO/i }).waitFor({ state: 'visible' });
  await sleep(250);
  await dismissCrisis(page);
  await getDistrictLocator(page, 'Polo Industrial').click();
  await sleep(200);
  await executeProject(page, 'Tarifa Zero Municipal');
  await page.getByRole('button', { name: /EXECUTAR DECISÃO|SELECIONE UMA AÇÃO/i }).waitFor({ state: 'visible' });
  await sleep(250);
  await dismissCrisis(page);
  await getDistrictLocator(page, 'Centro Histórico').click();
  await sleep(200);
  await executeProject(page, 'Habitação no Centro');
  await getOutcomeHeading(page).waitFor({ state: 'visible' });
  await sleep(1800);

  const video = page.video();
  await context.close();
  await browser.close();

  if (!video) {
    throw new Error('Cidade Real clip was not recorded');
  }

  const videoPath = await video.path();
  fs.copyFileSync(videoPath, path.join(MOTION_DIR, 'cidade-real-official-clip-01.webm'));
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    await generateStills(browser);
    await generateGifs(browser);
  } finally {
    await browser.close();
  }

  await generateClip();
}

main().catch((error) => {
  console.error('[T105] capture failed:', error);
  process.exit(1);
});
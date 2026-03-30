import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import gifencPkg from 'gifenc';
import { chromium } from '@playwright/test';

const { GIFEncoder, quantize, applyPalette } = gifencPkg;

const BASE_URL = process.env.T106_BASE_URL || 'http://127.0.0.1:3100';
const SHOWCASE_DIR = path.resolve('public/showcase/bairro-resiste');
const MOTION_DIR = path.join(SHOWCASE_DIR, 'motion');
const RAW_DIR = path.resolve('reports/showcase/bairro-resiste/raw');
const HOTSPOT_IDS = ['agua', 'moradia', 'mobilidade', 'saude'];

fs.mkdirSync(SHOWCASE_DIR, { recursive: true });
fs.mkdirSync(MOTION_DIR, { recursive: true });
fs.mkdirSync(RAW_DIR, { recursive: true });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function encodeGifFromPngBuffers(buffers, outPath, delay = 80) {
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

async function startRun(page) {
  await page.goto(`${BASE_URL}/arcade/bairro-resiste`, { waitUntil: 'networkidle' });
  const startButton = page.getByRole('button', { name: /Iniciar Defesa/i });
  await startButton.scrollIntoViewIfNeeded();
  await startButton.click();
  await page.locator('[class*="mapBackground"]').first().waitFor({ state: 'visible' });
  await sleep(500);
}

async function getPrimaryCaptureTarget(page) {
  const map = page.locator('[class*="mapBackground"]').first();
  if (await map.count()) {
    await map.evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'center' }));
    await sleep(150);
    return map;
  }

  const result = page.locator('[class*="resultCard"]').first();
  if (await result.count()) {
    await result.evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'center' }));
    await sleep(150);
    return result;
  }

  return null;
}

async function captureStill(page, fileName) {
  const target = await getPrimaryCaptureTarget(page);
  const outputPath = path.join(SHOWCASE_DIR, fileName);

  if (!target) {
    await page.screenshot({ path: outputPath, fullPage: true });
    return;
  }

  await target.screenshot({ path: outputPath });
}

async function captureMapStill(page, fileName) {
  const map = page.locator('[class*="mapBackground"]').first();
  if ((await map.count()) === 0) {
    throw new Error(`Unable to locate map for ${fileName}`);
  }

  await map.evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'center' }));
  await sleep(150);
  await map.screenshot({ path: path.join(SHOWCASE_DIR, fileName) });
}

async function captureResultStill(page, fileName) {
  const result = page.locator('[class*="resultCard"]').first();
  if ((await result.count()) === 0) {
    throw new Error(`Unable to locate result card for ${fileName}`);
  }

  await result.evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'center' }));
  await sleep(150);
  await result.screenshot({ path: path.join(SHOWCASE_DIR, fileName) });
}

async function readHotspot(page, hotspotId) {
  const hotspot = page.locator(`[data-hotspot-id="${hotspotId}"]`).first();
  if ((await hotspot.count()) === 0) {
    return { pressure: 0, opacity: 0 };
  }

  return hotspot.evaluate((element) => {
    const title = element.getAttribute('title') || '';
    const pressureMatch = title.match(/(\d+)%/);
    const opacity = Number.parseFloat(window.getComputedStyle(element).opacity || '1');

    return {
      pressure: pressureMatch ? Number.parseInt(pressureMatch[1], 10) : 0,
      opacity,
    };
  });
}

async function dispatchHighest(page, minPressure = 45) {
  const snapshots = [];

  for (const hotspotId of HOTSPOT_IDS) {
    const snapshot = await readHotspot(page, hotspotId);
    snapshots.push({ id: hotspotId, ...snapshot });
  }

  const candidate = snapshots
    .filter((snapshot) => snapshot.opacity >= 0.8)
    .sort((left, right) => right.pressure - left.pressure)[0];

  if (!candidate || candidate.pressure < minPressure) {
    return null;
  }

  await page.locator(`[data-hotspot-id="${candidate.id}"]`).click({ force: true });
  await sleep(450);
  return candidate;
}

async function holdRun(page, durationMs, { dispatchEveryMs = 5000, minPressure = 60 } = {}) {
  const startedAt = Date.now();
  let nextDispatchAt = dispatchEveryMs;

  while (Date.now() - startedAt < durationMs) {
    if (await page.locator('[class*="resultCard"]').count()) {
      break;
    }

    const elapsed = Date.now() - startedAt;
    if (elapsed >= nextDispatchAt) {
      await dispatchHighest(page, minPressure);
      nextDispatchAt += dispatchEveryMs;
    }

    await sleep(500);
  }
}

async function waitForDangerState(page, timeoutMs = 70000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await page.locator('[class*="dangerOverlay"]').count()) {
      return true;
    }

    if (await page.locator('[class*="resultCard"]').count()) {
      return false;
    }

    await sleep(500);
  }

  return false;
}

async function waitForCriticalHotspots(page, targetCount = 2, timeoutMs = 60000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await page.locator('[class*="resultCard"]').count()) {
      return false;
    }

    const snapshots = await Promise.all(HOTSPOT_IDS.map((hotspotId) => readHotspot(page, hotspotId)));
    const criticalCount = snapshots.filter((snapshot) => snapshot.pressure >= 80).length;

    if (criticalCount >= targetCount) {
      return true;
    }

    await sleep(400);
  }

  return false;
}

async function waitForOutcome(page, timeoutMs = 120000) {
  await page.locator('[class*="resultCard"]').first().waitFor({ state: 'visible', timeout: timeoutMs });
}

async function captureGif(page, fileName, durationMs, sequence, delayMs = 80) {
  const target = await getPrimaryCaptureTarget(page);
  if (!target) {
    throw new Error(`Unable to locate gameplay clip for ${fileName}`);
  }

  const sequencePromise = sequence(page);
  const frames = [];
  const startedAt = Date.now();

  while (Date.now() - startedAt < durationMs) {
    frames.push(await target.screenshot());
    await sleep(90);
  }

  await sequencePromise;
  encodeGifFromPngBuffers(frames, path.join(MOTION_DIR, fileName), delayMs);
}

async function scenarioOpening(page) {
  await startRun(page);
  await sleep(1000);
  await captureMapStill(page, 'screenshot-01-opening-board.png');
}

async function scenarioMidCrisis(page) {
  await startRun(page);
  await holdRun(page, 12000, { dispatchEveryMs: 4000, minPressure: 35 });
  if (await page.locator('[class*="resultCard"]').count()) {
    throw new Error('Mid-crisis capture reached outcome too early');
  }
  await captureMapStill(page, 'screenshot-02-mid-crisis.png');
}

async function scenarioBrigadeResponse(page) {
  await startRun(page);
  await holdRun(page, 5000, { dispatchEveryMs: 2000, minPressure: 20 });
  await dispatchHighest(page, 25);
  await sleep(250);
  await captureMapStill(page, 'screenshot-03-brigade-response.png');
}

async function scenarioNearCollapse(page) {
  await startRun(page);
  await holdRun(page, 18000, { dispatchEveryMs: 11000, minPressure: 82 });
  const foundCriticalNetwork = await waitForCriticalHotspots(page, 2, 55000);
  if (!foundCriticalNetwork) {
    throw new Error('Failed to capture Bairro Resiste near-collapse network before outcome');
  }
  await captureMapStill(page, 'screenshot-04-near-collapse.png');
}

async function scenarioFinalResult(page) {
  await startRun(page);
  await waitForOutcome(page);
  await captureResultStill(page, 'screenshot-05-final-result.png');
}

async function generateStills(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1700 } });
  const page = await context.newPage();

  await scenarioOpening(page);
  await scenarioMidCrisis(page);
  await scenarioBrigadeResponse(page);
  await scenarioNearCollapse(page);
  await scenarioFinalResult(page);

  await context.close();
}

async function generateGifs(browser) {
  const openingContext = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const openingPage = await openingContext.newPage();
  await startRun(openingPage);
  await captureGif(openingPage, 'gif-01-opening-pressure.gif', 3400, async () => {
    await sleep(2600);
  });
  await openingContext.close();

  const dispatchContext = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const dispatchPage = await dispatchContext.newPage();
  await startRun(dispatchPage);
  await holdRun(dispatchPage, 7000, { dispatchEveryMs: 3500, minPressure: 30 });
  await captureGif(dispatchPage, 'gif-02-brigade-dispatch.gif', 3600, async (page) => {
    await dispatchHighest(page, 25);
    await sleep(900);
    await dispatchHighest(page, 42);
    await sleep(900);
  });
  await dispatchContext.close();

  const collapseContext = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const collapsePage = await collapseContext.newPage();
  await startRun(collapsePage);
  await holdRun(collapsePage, 46000, { dispatchEveryMs: 12000, minPressure: 85 });
  await waitForDangerState(collapsePage, 25000);
  await captureGif(collapsePage, 'gif-03-near-collapse-network.gif', 3600, async () => {
    await sleep(2600);
  });
  await collapseContext.close();
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

  await startRun(page);
  await holdRun(page, 28000, { dispatchEveryMs: 5000, minPressure: 40 });
  await sleep(1200);

  const video = page.video();
  await context.close();
  await browser.close();

  if (!video) {
    throw new Error('Bairro Resiste clip was not recorded');
  }

  const videoPath = await video.path();
  fs.copyFileSync(videoPath, path.join(MOTION_DIR, 'bairro-resiste-official-clip-01.webm'));
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
  console.error('[T106] capture failed:', error);
  process.exit(1);
});
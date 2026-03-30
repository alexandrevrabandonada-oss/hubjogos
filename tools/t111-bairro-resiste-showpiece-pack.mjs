import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import gifencPkg from 'gifenc';
import { chromium } from '@playwright/test';

const { GIFEncoder, quantize, applyPalette } = gifencPkg;

const BASE_URL = process.env.T111_BASE_URL || 'http://127.0.0.1:3100';
const SHOWCASE_DIR = path.resolve('public/showcase/bairro-resiste');
const MOTION_DIR = path.join(SHOWCASE_DIR, 'motion');
const RAW_DIR = path.resolve('reports/showcase/bairro-resiste/t111-raw');
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
  await sleep(600);
}

async function getMap(page) {
  const map = page.locator('[class*="mapBackground"]').first();
  if ((await map.count()) === 0) {
    throw new Error('Unable to locate Bairro Resiste map');
  }

  await map.evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'center' }));
  await sleep(150);
  return map;
}

async function captureMapStill(page, fileName) {
  const map = await getMap(page);
  await map.screenshot({ path: path.join(SHOWCASE_DIR, fileName) });
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

  await page.locator(`[data-hotspot-id="${candidate.id}"]`).dispatchEvent('click');
  await sleep(420);
  return candidate;
}

async function holdRun(page, durationMs, { dispatchEveryMs = 5000, minPressure = 55 } = {}) {
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

    await sleep(450);
  }
}

async function waitForWarning(page, timeoutMs = 30000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await page.locator('[class*="hotspotWarning"]').count()) {
      return true;
    }
    if (await page.locator('[class*="resultCard"]').count()) {
      return false;
    }
    await sleep(350);
  }

  return false;
}

async function waitForCritical(page, timeoutMs = 45000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await page.locator('[class*="hotspotCritical"]').count()) {
      return true;
    }
    if (await page.locator('[class*="resultCard"]').count()) {
      return false;
    }
    await sleep(350);
  }

  return false;
}

async function waitForSaveMarker(page, timeoutMs = 8000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const popups = await page.locator('[class*="saveTextPopup"]').count();
    const memories = await page.locator('[class*="savedMemoryTag"]').count();
    if (popups + memories > 0) {
      return true;
    }
    await sleep(150);
  }

  return false;
}

async function captureGif(page, fileName, durationMs, sequence, delayMs = 80) {
  const map = await getMap(page);
  const sequencePromise = sequence(page);
  const frames = [];
  const startedAt = Date.now();

  while (Date.now() - startedAt < durationMs) {
    frames.push(await map.screenshot());
    await sleep(90);
  }

  await sequencePromise;
  encodeGifFromPngBuffers(frames, path.join(MOTION_DIR, fileName), delayMs);
}

async function scenarioCalm(page) {
  await startRun(page);
  await sleep(900);
  await captureMapStill(page, 'screenshot-01-calm-board.png');
}

async function scenarioMidPressure(page) {
  await startRun(page);
  await waitForWarning(page, 25000);
  await sleep(450);
  await captureMapStill(page, 'screenshot-02-mid-pressure.png');
}

async function scenarioCritical(page) {
  await startRun(page);
  await holdRun(page, 18000, { dispatchEveryMs: 12000, minPressure: 85 });
  const foundCritical = await waitForCritical(page, 45000);
  if (!foundCritical) {
    throw new Error('Failed to reach critical state for still capture');
  }
  await sleep(350);
  await captureMapStill(page, 'screenshot-03-critical-state.png');
}

async function scenarioSaveRecovery(page) {
  await startRun(page);
  await holdRun(page, 7000, { dispatchEveryMs: 5000, minPressure: 70 });
  await waitForWarning(page, 18000);
  const dispatched = await dispatchHighest(page, 45);
  if (!dispatched) {
    throw new Error('Failed to dispatch brigade for recovery still');
  }
  await waitForSaveMarker(page, 7000);
  await sleep(140);
  const saveRecoveryPath = path.join(SHOWCASE_DIR, 'screenshot-04-save-recovery.png');
  const map = await getMap(page);
  await map.screenshot({ path: saveRecoveryPath });
  fs.copyFileSync(saveRecoveryPath, path.join(SHOWCASE_DIR, 'flagship-main-still.png'));
}

async function generateStills(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const page = await context.newPage();

  await scenarioCalm(page);
  await scenarioMidPressure(page);
  await scenarioCritical(page);
  await scenarioSaveRecovery(page);

  await context.close();
}

async function generateGifs(browser) {
  const openingContext = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const openingPage = await openingContext.newPage();
  await startRun(openingPage);
  await captureGif(openingPage, 'gif-01-pressure-spread.gif', 3200, async () => {
    await sleep(2400);
  });
  await openingContext.close();

  const dispatchContext = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const dispatchPage = await dispatchContext.newPage();
  await startRun(dispatchPage);
  await holdRun(dispatchPage, 6500, { dispatchEveryMs: 5000, minPressure: 65 });
  await captureGif(dispatchPage, 'gif-02-brigade-dispatch-save.gif', 3600, async (page) => {
    await dispatchHighest(page, 45);
    await sleep(1200);
  });
  await dispatchContext.close();

  const criticalContext = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const criticalPage = await criticalContext.newPage();
  await startRun(criticalPage);
  await holdRun(criticalPage, 18000, { dispatchEveryMs: 12000, minPressure: 85 });
  const foundCritical = await waitForCritical(criticalPage, 45000);
  if (!foundCritical) {
    throw new Error('Failed to reach critical state for critical hero gif');
  }
  await captureGif(criticalPage, 'gif-03-critical-hero.gif', 3400, async () => {
    await sleep(2400);
  });
  await criticalContext.close();
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
  await holdRun(page, 5000, { dispatchEveryMs: 5000, minPressure: 60 });
  await waitForWarning(page, 18000);
  await dispatchHighest(page, 40);
  await sleep(1600);
  await holdRun(page, 9000, { dispatchEveryMs: 9000, minPressure: 85 });
  await waitForCritical(page, 40000);
  await sleep(1800);

  const video = page.video();
  await context.close();
  await browser.close();

  if (!video) {
    throw new Error('Bairro Resiste official clip was not recorded');
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
  console.error('[T111] Bairro Resiste showpiece pack failed:', error);
  process.exit(1);
});

import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import gifencPkg from 'gifenc';
import { chromium } from '@playwright/test';

const { GIFEncoder, quantize, applyPalette } = gifencPkg;

const BASE_URL = process.env.T104_BASE_URL || 'http://127.0.0.1:3100';
const OUT_DIR = path.resolve('public/showcase/corredor-livre/motion');
const RAW_DIR = path.resolve('reports/showcase/corredor-livre/raw');

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(RAW_DIR, { recursive: true });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function encodeGifFromPngBuffers(buffers, outPath, delay = 70) {
  if (!buffers.length) {
    throw new Error('No buffers to encode GIF');
  }

  const first = PNG.sync.read(buffers[0]);
  const width = first.width;
  const height = first.height;

  const gif = GIFEncoder();
  gif.writeHeader();

  for (const b of buffers) {
    const png = PNG.sync.read(b);
    const rgba = png.data;
    const palette = quantize(rgba, 256);
    const index = applyPalette(rgba, palette);
    gif.writeFrame(index, width, height, { palette, delay });
  }

  gif.finish();
  fs.writeFileSync(outPath, Buffer.from(gif.bytesView()));
}

async function captureGif(page, canvas, cfg) {
  const clipBox = await canvas.boundingBox();
  if (!clipBox) throw new Error('Canvas not found for capture');

  await cfg.setup(page);

  const frames = [];
  const started = Date.now();
  while (Date.now() - started < cfg.durationMs) {
    const shot = await page.screenshot({
      clip: {
        x: Math.max(0, clipBox.x),
        y: Math.max(0, clipBox.y),
        width: clipBox.width,
        height: clipBox.height,
      },
    });
    frames.push(shot);
    await sleep(cfg.frameIntervalMs);
  }

  await cfg.teardown?.(page);
  encodeGifFromPngBuffers(frames, path.join(OUT_DIR, cfg.fileName), cfg.delayMs || 70);
}

async function captureClip() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: RAW_DIR,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();
  await page.goto(`${BASE_URL}/games/corredor-livre/play`, { waitUntil: 'networkidle' });
  await page.locator('button', { hasText: '×' }).first().click({ timeout: 3000 }).catch(() => {});

  await page.keyboard.down('ArrowRight');
  for (let i = 0; i < 4; i++) {
    await sleep(750);
    await page.keyboard.press('Space');
  }

  await page.keyboard.press('3');
  await sleep(500);
  for (let i = 0; i < 7; i++) {
    if (i % 2 === 0) {
      await page.keyboard.down('ArrowRight');
      await page.keyboard.up('ArrowLeft');
    } else {
      await page.keyboard.down('ArrowLeft');
      await page.keyboard.up('ArrowRight');
    }
    await page.keyboard.press('Space');
    await sleep(420);
  }

  await page.keyboard.up('ArrowRight');
  await page.keyboard.up('ArrowLeft');
  await page.keyboard.press('4');
  await sleep(300);
  await page.keyboard.down('ArrowRight');
  for (let i = 0; i < 6; i++) {
    await sleep(550);
    await page.keyboard.press('Space');
  }

  await sleep(3200);
  await page.keyboard.up('ArrowRight');

  const video = page.video();
  await context.close();
  await browser.close();

  if (!video) throw new Error('Clip video was not recorded');

  const videoPath = await video.path();
  const targetPath = path.join(OUT_DIR, 'corredor-livre-official-clip-01.webm');
  fs.copyFileSync(videoPath, targetPath);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/games/corredor-livre/play`, { waitUntil: 'networkidle' });
  await page.locator('button', { hasText: '×' }).first().click({ timeout: 3000 }).catch(() => {});

  const canvas = page.locator('canvas').first();
  await canvas.waitFor({ state: 'visible' });

  await captureGif(page, canvas, {
    fileName: 'gif-01-opening-run.gif',
    durationMs: 4400,
    frameIntervalMs: 95,
    delayMs: 70,
    setup: async (p) => {
      await p.keyboard.press('1');
      await sleep(250);
      await p.keyboard.down('ArrowRight');
      await sleep(4200);
    },
    teardown: async (p) => {
      await p.keyboard.up('ArrowRight');
    },
  });

  await captureGif(page, canvas, {
    fileName: 'gif-02-wall-kick-vertical.gif',
    durationMs: 4800,
    frameIntervalMs: 95,
    delayMs: 70,
    setup: async (p) => {
      await p.keyboard.press('3');
      await sleep(350);
      for (let i = 0; i < 8; i++) {
        if (i % 2 === 0) {
          await p.keyboard.down('ArrowRight');
          await p.keyboard.up('ArrowLeft');
        } else {
          await p.keyboard.down('ArrowLeft');
          await p.keyboard.up('ArrowRight');
        }
        await p.keyboard.press('Space');
        await sleep(420);
      }
      await p.keyboard.up('ArrowRight');
      await p.keyboard.up('ArrowLeft');
    },
  });

  await captureGif(page, canvas, {
    fileName: 'gif-03-fragile-hazard-pass.gif',
    durationMs: 5000,
    frameIntervalMs: 95,
    delayMs: 70,
    setup: async (p) => {
      await p.keyboard.press('4');
      await sleep(250);
      await p.keyboard.down('ArrowRight');
      for (let i = 0; i < 7; i++) {
        await sleep(520);
        await p.keyboard.press('Space');
      }
      await sleep(1200);
    },
    teardown: async (p) => {
      await p.keyboard.up('ArrowRight');
    },
  });

  await context.close();
  await browser.close();

  await captureClip();
}

main().catch((err) => {
  console.error('[T104] capture failed:', err);
  process.exit(1);
});

export type TarifaZeroAssetKey =
  | 'bg-skyline-far'
  | 'bg-skyline-mid'
  | 'bg-corredor-road'
  | 'player-bus-default'
  | 'transport-bus-main'
  | 'transport-bus-compact'
  | 'transport-bus-event'
  | 'obstacle-catraca'
  | 'obstacle-barreira-pesada'
  | 'obstacle-zona-pressao'
  | 'pickup-apoio'
  | 'pickup-apoio-cadeia'
  | 'pickup-mutirao'
  | 'pickup-chance-rara'
  | 'pickup-individualismo'
  | 'pickup-chance-virada'
  | 'ui-hud-progress-frame'
  | 'ui-hud-progress-fill'
  | 'ui-hud-meter-frame'
  | 'ui-icon-combo'
  | 'ui-icon-score'
  | 'ui-badge-phase'
  | 'ui-badge-event'
  | 'ui-final-card-premium'
  | 'ui-qr-frame'
  | 'ui-button-replay'
  | 'ui-button-next';

export const TARIFA_ZERO_ASSET_SET = 'corredor-do-povo-v1';
export const TARIFA_ZERO_VISUAL_VERSION = 'T35D-assets-v1';

const assetPaths: Record<TarifaZeroAssetKey, string> = {
  'bg-skyline-far': '/arcade/tarifa-zero/bg/bg-skyline-far.svg',
  'bg-skyline-mid': '/arcade/tarifa-zero/bg/bg-skyline-mid.svg',
  'bg-corredor-road': '/arcade/tarifa-zero/bg/bg-corredor-road.svg',
  'player-bus-default': '/arcade/tarifa-zero/player/player-bus-default.svg',
  'transport-bus-main': '/arcade/tarifa-zero/transport/transport-bus-main.svg',
  'transport-bus-compact': '/arcade/tarifa-zero/transport/transport-bus-compact.svg',
  'transport-bus-event': '/arcade/tarifa-zero/transport/transport-bus-event.svg',
  'obstacle-catraca': '/arcade/tarifa-zero/obstacles/obstacle-catraca.svg',
  'obstacle-barreira-pesada': '/arcade/tarifa-zero/obstacles/obstacle-barreira-pesada.svg',
  'obstacle-zona-pressao': '/arcade/tarifa-zero/obstacles/obstacle-zona-pressao.svg',
  'pickup-apoio': '/arcade/tarifa-zero/pickups/pickup-apoio.svg',
  'pickup-apoio-cadeia': '/arcade/tarifa-zero/pickups/pickup-apoio-cadeia.svg',
  'pickup-mutirao': '/arcade/tarifa-zero/pickups/pickup-mutirao.svg',
  'pickup-chance-rara': '/arcade/tarifa-zero/pickups/pickup-chance-rara.svg',
  'pickup-individualismo': '/arcade/tarifa-zero/pickups/pickup-individualismo.svg',
  'pickup-chance-virada': '/arcade/tarifa-zero/pickups/pickup-chance-virada.svg',
  'ui-hud-progress-frame': '/arcade/tarifa-zero/ui/ui-hud-progress-frame.svg',
  'ui-hud-progress-fill': '/arcade/tarifa-zero/ui/ui-hud-progress-fill.svg',
  'ui-hud-meter-frame': '/arcade/tarifa-zero/ui/ui-hud-meter-frame.svg',
  'ui-icon-combo': '/arcade/tarifa-zero/ui/ui-icon-combo.svg',
  'ui-icon-score': '/arcade/tarifa-zero/ui/ui-icon-score.svg',
  'ui-badge-phase': '/arcade/tarifa-zero/ui/ui-badge-phase.svg',
  'ui-badge-event': '/arcade/tarifa-zero/ui/ui-badge-event.svg',
  'ui-final-card-premium': '/arcade/tarifa-zero/ui/ui-final-card-premium.svg',
  'ui-qr-frame': '/arcade/tarifa-zero/ui/ui-qr-frame.svg',
  'ui-button-replay': '/arcade/tarifa-zero/ui/ui-button-replay.svg',
  'ui-button-next': '/arcade/tarifa-zero/ui/ui-button-next.svg',
};

type CachedAsset =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; image: HTMLImageElement };

const assetCache = new Map<TarifaZeroAssetKey, CachedAsset>();

function canUseDomImages() {
  return typeof window !== 'undefined' && typeof Image !== 'undefined';
}

function ensureAsset(key: TarifaZeroAssetKey): CachedAsset | null {
  const existing = assetCache.get(key);
  if (existing) {
    return existing;
  }

  if (!canUseDomImages()) {
    return null;
  }

  const image = new Image();
  image.decoding = 'async';
  const cached: CachedAsset = { status: 'loading' };
  assetCache.set(key, cached);

  image.onload = () => {
    assetCache.set(key, { status: 'ready', image });
  };

  image.onerror = () => {
    assetCache.set(key, { status: 'error' });
  };

  image.src = assetPaths[key];
  return cached;
}

export function getTarifaZeroAssetPath(key: TarifaZeroAssetKey) {
  return assetPaths[key];
}

export function getTarifaZeroAssetSummary() {
  const total = Object.keys(assetPaths).length;
  let ready = 0;
  let failed = 0;

  for (const key of Object.keys(assetPaths) as TarifaZeroAssetKey[]) {
    const asset = ensureAsset(key);
    if (!asset) {
      continue;
    }
    if (asset.status === 'ready') {
      ready += 1;
    }
    if (asset.status === 'error') {
      failed += 1;
    }
  }

  return {
    total,
    ready,
    failed,
  };
}

export function drawTarifaZeroAsset(
  ctx: CanvasRenderingContext2D,
  key: TarifaZeroAssetKey,
  x: number,
  y: number,
  width: number,
  height: number,
  options?: {
    alpha?: number;
    rotation?: number;
  },
) {
  const cached = ensureAsset(key);
  if (!cached || cached.status !== 'ready') {
    return false;
  }

  const { alpha = 1, rotation = 0 } = options || {};
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x + width / 2, y + height / 2);
  if (rotation !== 0) {
    ctx.rotate(rotation);
  }
  ctx.drawImage(cached.image, -width / 2, -height / 2, width, height);
  ctx.restore();
  return true;
}
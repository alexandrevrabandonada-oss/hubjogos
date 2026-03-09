import tarifaManifestJson from '@/public/arcade/tarifa-zero/manifest.json';
import {
  drawAssetFromManifest,
  getAssetLoadSummary,
  getAssetPackVersion,
  resolveAssetPath,
  type AssetPackManifest,
} from '@/lib/games/assets/asset-pack-loader';

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
    | 'obstacle-bloqueio-sequencia'
  | 'obstacle-zona-pressao'
  | 'pickup-apoio'
  | 'pickup-apoio-cadeia'
  | 'pickup-apoio-territorial'
  | 'pickup-mutirao'
  | 'pickup-mutirao-bairro'
  | 'pickup-mutirao-sindical'
  | 'pickup-chance-rara'
  | 'pickup-chance-abertura'
  | 'pickup-individualismo'
  | 'pickup-individualismo-tentador'
    | 'pickup-individualismo-cluster'
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

const tarifaManifest = tarifaManifestJson as AssetPackManifest<TarifaZeroAssetKey>;
const tarifaVisual = getAssetPackVersion(tarifaManifest);

export const TARIFA_ZERO_ASSET_SET = tarifaVisual.assetSet;
export const TARIFA_ZERO_VISUAL_VERSION = tarifaVisual.visualVersion;

const TARIFA_KEYS: readonly TarifaZeroAssetKey[] = [
  'bg-skyline-far',
  'bg-skyline-mid',
  'bg-corredor-road',
  'player-bus-default',
  'transport-bus-main',
  'transport-bus-compact',
  'transport-bus-event',
  'obstacle-catraca',
  'obstacle-barreira-pesada',
  'obstacle-bloqueio-sequencia',
  'obstacle-zona-pressao',
  'pickup-apoio',
  'pickup-apoio-cadeia',
  'pickup-apoio-territorial',
  'pickup-mutirao',
  'pickup-mutirao-bairro',
  'pickup-mutirao-sindical',
  'pickup-chance-rara',
  'pickup-chance-abertura',
  'pickup-individualismo',
  'pickup-individualismo-tentador',
  'pickup-individualismo-cluster',
  'pickup-chance-virada',
  'ui-hud-progress-frame',
  'ui-hud-progress-fill',
  'ui-hud-meter-frame',
  'ui-icon-combo',
  'ui-icon-score',
  'ui-badge-phase',
  'ui-badge-event',
  'ui-final-card-premium',
  'ui-qr-frame',
  'ui-button-replay',
  'ui-button-next',
];

export function getTarifaZeroAssetPath(key: TarifaZeroAssetKey) {
  return resolveAssetPath(tarifaManifest, key, {
    fallbackPath: '/arcade/tarifa-zero/ui/ui-icon-score.svg',
  });
}

export function getTarifaZeroAssetSummary() {
  return getAssetLoadSummary(tarifaManifest, TARIFA_KEYS);
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
    scaleX?: number;
    scaleY?: number;
  },
) {
  return drawAssetFromManifest(ctx, tarifaManifest, key, x, y, width, height, {
    alpha: options?.alpha,
    rotation: options?.rotation,
    scaleX: options?.scaleX,
    scaleY: options?.scaleY,
    fallbackPath: '/arcade/tarifa-zero/ui/ui-icon-score.svg',
  });
}
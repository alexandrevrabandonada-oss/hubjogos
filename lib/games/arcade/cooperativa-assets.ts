import cooperativaManifestJson from '@/public/arcade/cooperativa-na-pressao/manifest.json';
import {
  getAssetPackVersion,
  resolveAssetPath,
  type AssetPackManifest,
} from '@/lib/games/assets/asset-pack-loader';

export type CooperativaAssetKey =
  | 'bg-base'
  | 'player-coordenador'
  | 'entity-estacao'
  | 'ui-hud-estabilidade'
  | 'ui-hud-pressao';

const cooperativaManifest = cooperativaManifestJson as AssetPackManifest<CooperativaAssetKey>;
const cooperativaVisual = getAssetPackVersion(cooperativaManifest);

export const COOPERATIVA_ASSET_SET = cooperativaVisual.assetSet;
export const COOPERATIVA_VISUAL_VERSION = cooperativaVisual.visualVersion;

export function getCooperativaAssetPath(key: CooperativaAssetKey) {
  return resolveAssetPath(cooperativaManifest, key, {
    fallbackPath: '/arcade/cooperativa-na-pressao/bg/bg-cooperativa-base-v1.svg',
  });
}

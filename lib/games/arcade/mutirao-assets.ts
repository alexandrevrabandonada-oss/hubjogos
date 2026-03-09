import mutiraoManifestJson from '@/public/arcade/mutirao-do-bairro/manifest.json';
import {
  getAssetPackVersion,
  resolveAssetPath,
  type AssetPackManifest,
} from '@/lib/games/assets/asset-pack-loader';

export type MutiraoAssetKey =
  | 'bg-premium'
  | 'bg-base'
  | 'player-coordenador'
  | 'player-active'
  | 'hotspot-generic'
  | 'hotspot-base'
  | 'hotspot-agua'
  | 'hotspot-energia'
  | 'hotspot-mobilidade'
  | 'ui-action-reparar'
  | 'ui-action-defender'
  | 'ui-action-mobilizar'
  | 'ui-action-mutirao'
  | 'ui-hud-pressure'
  | 'ui-hud-mutirao-charge'
  | 'ui-hud-stability'
  | 'ui-event-chuva-forte'
  | 'ui-event-boato-panico'
  | 'ui-event-onda-solidaria'
  | 'ui-event-tranco-sabotagem';

const mutiraoManifest = mutiraoManifestJson as AssetPackManifest<MutiraoAssetKey>;
const mutiraoVisual = getAssetPackVersion(mutiraoManifest);

export const MUTIRAO_ASSET_SET = mutiraoVisual.assetSet;
export const MUTIRAO_VISUAL_VERSION = mutiraoVisual.visualVersion;

export function getMutiraoAssetPath(key: MutiraoAssetKey) {
  return resolveAssetPath(mutiraoManifest, key, {
    fallbackPath: '/arcade/mutirao-do-bairro/bg/bg-bairro-base-v1.svg',
  });
}

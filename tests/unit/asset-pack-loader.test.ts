import { describe, expect, it } from 'vitest';
import {
  getAssetPackVersion,
  resolveAssetPath,
  type AssetPackManifest,
} from '@/lib/games/assets/asset-pack-loader';

type TestAssetKey = 'player-main' | 'bg-main';

const manifest: AssetPackManifest<TestAssetKey> = {
  game: {
    slug: 'teste',
    line: 'arcade',
    packSlug: 'teste-pack',
    title: 'Teste',
  },
  version: {
    manifestVersion: '1.0.0',
    visualVersion: 'T44-test-v1',
    assetSet: 'test-pack-v1',
  },
  assets: {
    'player-main': '/arcade/teste/player/player-main-v1.svg',
    'bg-main': '/arcade/teste/bg/bg-main-v1.svg',
  },
  fallback: {
    default: '/arcade/teste/ui/ui-fallback-v1.svg',
    byKey: {
      'bg-main': '/arcade/teste/bg/bg-fallback-v1.svg',
    },
  },
};

describe('asset pack loader', () => {
  it('returns visual metadata from manifest', () => {
    const version = getAssetPackVersion(manifest);
    expect(version.visualVersion).toBe('T44-test-v1');
    expect(version.assetSet).toBe('test-pack-v1');
  });

  it('resolves direct asset path and keeps public slash', () => {
    expect(resolveAssetPath(manifest, 'player-main')).toBe('/arcade/teste/player/player-main-v1.svg');
  });

  it('uses key fallback when key is missing in assets map', () => {
    const withoutBg = {
      ...manifest,
      assets: {
        'player-main': '/arcade/teste/player/player-main-v1.svg',
      } as any,
    } as AssetPackManifest<TestAssetKey>;

    expect(resolveAssetPath(withoutBg, 'bg-main')).toBe('/arcade/teste/bg/bg-fallback-v1.svg');
  });

  it('uses default fallback when key and key fallback are missing', () => {
    const withoutFallbackByKey = {
      ...manifest,
      fallback: {
        default: '/arcade/teste/ui/ui-fallback-v1.svg',
      },
      assets: {
        'player-main': '/arcade/teste/player/player-main-v1.svg',
      } as any,
    } as AssetPackManifest<TestAssetKey>;

    expect(resolveAssetPath(withoutFallbackByKey, 'bg-main')).toBe('/arcade/teste/ui/ui-fallback-v1.svg');
  });
});

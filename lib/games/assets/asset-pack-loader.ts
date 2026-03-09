export interface AssetPackManifest<AssetKey extends string = string> {
  game: {
    slug: string;
    line: string;
    packSlug: string;
    title: string;
  };
  version: {
    manifestVersion: string;
    visualVersion: string;
    assetSet: string;
  };
  assets: Record<AssetKey, string>;
  fallback?: {
    default?: string;
    byKey?: Partial<Record<AssetKey, string>>;
  };
  metadata?: {
    externalPipeline?: boolean;
    runtimeFallback?: string;
    mobileSafe?: boolean;
    updatedAt?: string;
  };
}

type CachedAsset =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; image: HTMLImageElement };

const domAssetCache = new Map<string, CachedAsset>();

function canUseDomImages() {
  return typeof window !== 'undefined' && typeof Image !== 'undefined';
}

function normalizePublicPath(path: string) {
  if (!path) {
    return path;
  }
  return path.startsWith('/') ? path : `/${path}`;
}

export function resolveAssetPath<AssetKey extends string>(
  manifest: AssetPackManifest<AssetKey>,
  key: AssetKey,
  options?: { fallbackPath?: string },
) {
  const direct = manifest.assets[key];
  if (direct) {
    return normalizePublicPath(direct);
  }

  const keyFallback = manifest.fallback?.byKey?.[key];
  if (keyFallback) {
    return normalizePublicPath(keyFallback);
  }

  if (options?.fallbackPath) {
    return normalizePublicPath(options.fallbackPath);
  }

  if (manifest.fallback?.default) {
    return normalizePublicPath(manifest.fallback.default);
  }

  return null;
}

export function getAssetPackVersion<AssetKey extends string>(manifest: AssetPackManifest<AssetKey>) {
  return {
    visualVersion: manifest.version.visualVersion,
    assetSet: manifest.version.assetSet,
  };
}

function ensureAsset(path: string) {
  const normalizedPath = normalizePublicPath(path);
  if (!normalizedPath || !canUseDomImages()) {
    return null;
  }

  const existing = domAssetCache.get(normalizedPath);
  if (existing) {
    return existing;
  }

  const image = new Image();
  image.decoding = 'async';
  const loadingState: CachedAsset = { status: 'loading' };
  domAssetCache.set(normalizedPath, loadingState);

  image.onload = () => {
    domAssetCache.set(normalizedPath, { status: 'ready', image });
  };

  image.onerror = () => {
    domAssetCache.set(normalizedPath, { status: 'error' });
  };

  image.src = normalizedPath;
  return loadingState;
}

export function getAssetLoadSummary<AssetKey extends string>(
  manifest: AssetPackManifest<AssetKey>,
  keys: readonly AssetKey[],
) {
  let ready = 0;
  let failed = 0;

  for (const key of keys) {
    const path = resolveAssetPath(manifest, key);
    if (!path) {
      failed += 1;
      continue;
    }

    const cached = ensureAsset(path);
    if (!cached) {
      continue;
    }

    if (cached.status === 'ready') {
      ready += 1;
    }

    if (cached.status === 'error') {
      failed += 1;
    }
  }

  return {
    total: keys.length,
    ready,
    failed,
  };
}

export function drawAssetFromManifest<AssetKey extends string>(
  ctx: CanvasRenderingContext2D,
  manifest: AssetPackManifest<AssetKey>,
  key: AssetKey,
  x: number,
  y: number,
  width: number,
  height: number,
  options?: {
    alpha?: number;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
    fallbackPath?: string;
  },
) {
  const path = resolveAssetPath(manifest, key, { fallbackPath: options?.fallbackPath });
  if (!path) {
    return false;
  }

  const cached = ensureAsset(path);
  if (!cached || cached.status !== 'ready') {
    return false;
  }

  const { alpha = 1, rotation = 0, scaleX = 1, scaleY = 1 } = options || {};
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x + width / 2, y + height / 2);
  if (rotation !== 0) {
    ctx.rotate(rotation);
  }
  if (scaleX !== 1 || scaleY !== 1) {
    ctx.scale(scaleX, scaleY);
  }
  ctx.drawImage(cached.image, -width / 2, -height / 2, width, height);
  ctx.restore();

  return true;
}

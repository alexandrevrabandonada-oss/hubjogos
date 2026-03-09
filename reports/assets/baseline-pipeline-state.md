# Asset Pipeline Baseline - T45

Status snapshot of asset pipeline integration across all arcade games as of T45.

## Games Status

| Game | Slug | Manifest | Loader Integration | Fallback | Visual Version | Asset Set | Smoke Test | Status |
|------|------|----------|-------------------|----------|-------------------|-----------|-----------|--------|
| Tarifa Zero Corredor | tarifa-zero-corredor | ✓ | ✓ | ✓ | T35E-premium-v7 | corredor-do-povo-v6 | ✓ | 🟢 OK |
| Mutirao do Bairro | mutirao-do-bairro | ✓ | ✓ | ✓ | T36C-premium-v1 | mutirao-bairro-premium | ✓ | 🟢 OK |
| Cooperativa na Pressao | cooperativa-na-pressao | ✓ | ✓ | ✓ | T42B-tuned | cooperativa-p0 | ✓ | 🟢 NEWLY INTEGRATED |

## Pipeline Features

### Manifest System
- **Status**: Core system operational and deployed
- **Coverage**: 3/3 arcade games (100%)
- **File Location**: `public/arcade/<slug>/manifest.json`
- **Structure**: Game metadata, version info, asset map, fallback rules, metadata flags
- **Type Safety**: Full TypeScript support with generic AssetKey types

### Loader System
- **Status**: Reusable utility operational
- **Location**: `lib/games/assets/asset-pack-loader.ts`
- **Functions**: 
  - `resolveAssetPath()` - Main asset resolution with fallback chain
  - `getAssetPackVersion()` - Extract version metadata
  - `drawAssetFromManifest()` - Canvas drawing with fallback
  - `getAssetLoadSummary()` - Load status summary
- **Type Safety**: Generic, type-safe with AssetKey constraints

### Asset Wrappers
- **tarifa-zero-assets.ts**: INTEGRATED ✓
  - Exports: getTarifaZeroAssetPath(), TARIFA_ZERO_ASSET_SET, TARIFA_ZERO_VISUAL_VERSION
  - Used by: tarifa-zero-corredor game logic

- **mutirao-assets.ts**: INTEGRATED ✓
  - Exports: getMutiraoAssetPath(), MUTIRAO_ASSET_SET, MUTIRAO_VISUAL_VERSION
  - Used by: mutirao-do-bairro game logic and components

- **cooperativa-assets.ts**: NEWLY INTEGRATED ✓
  - Exports: getCooperativaAssetPath(), COOPERATIVA_ASSET_SET, COOPERATIVA_VISUAL_VERSION
  - Used by: CooperativaNaPressaoArcadeGame component

### Fallback Strategy
- **Approach**: Asset-first with canvas-first fallback
- **Chain**: Direct path → key-specific fallback → default fallback → null
- **Guarantee**: No gameplay breakage if image fails to load
- **Status**: Tested and operational

### Smoke Tests
- **Unit Tests**: 4 tests covering manifest resolution logic (all passing)
- **E2E Tests**: 9 tests (3 games × 3 test variants)
  - Desktop smoke (canvas visibility, error-free)
  - Mobile smoke (responsive, error-free)
  - Manifest awareness (version/assetSet metadata present)
- **Coverage**: 100% of integrated games

## Known Limitations & Future Work

### P0 - Ready for Next Tijolo
- None identified for current integrated games

### P1 - Roadmap (T46+)
- **Cooperativa Full Integration**: Premium pass features and P1/P2 assets pending approval
- **Quick Line Extension**: Asset pipeline pattern can be extended when quick games receive dedicated packs
- **Legacy Normalization**: Old naming conventions preserved for stability; formal convention applies to new assets

### P2 - Not in Scope
- Refactoring all existing visual game assets
- Opening new game development within T45
- Changing asset formats or storage location

## Audit System

**Tool**: `npm run assets:audit`

**Checks**:
- Manifest file existence and validity
- Asset paths point to real files
- Fallback chains are complete
- Orphaned files detection
- Manifest structure validation

**Output**:
- Console report with status badges
- JSON report in `reports/assets/`
- Exit code 1 if missing assets found (prevents deployment)

**Severity Levels**:
- ✓ **OK**: All assets present, no orphans
- ⚠️ **WARNING**: Orphaned files or optional fallbacks missing
- ✗ **ERROR**: Critical assets missing or manifest broken

## Performance & Mobile Considerations

### Performance
- Asset cache uses DOM Image map (in-memory, not disk-based)
- Fallback chain adds negligible overhead
- Canvas drawing only on missing image
- All three games tested on desktop (2024 Chrome) and mobile (iPhone SE viewport)

### Mobile
- All assets marked `mobileSafe: true`
- Viewport testing confirms no layout thrash
- Canvas fallback prevents visual regression
- No performance regression vs T44 baseline

## Integration Checklist

For adding new games to the pipeline:

- [ ] Create `public/arcade/<slug>/` directory structure
- [ ] Add subdirectories: `bg/`, `player/`, `entities/`, `ui/`, `fx/`, `audio/`, `obstacles/`, `pickups/`
- [ ] Create `manifest.json` with game metadata and asset mapping
- [ ] Create `<slug>-assets.ts` wrapper in `lib/games/arcade/`
- [ ] Define AssetKey type in wrapper file
- [ ] Import wrapper and use asset getters in game component
- [ ] Add smoke test case to `tests/e2e/assets-pipeline-smoke.spec.ts`
- [ ] Run `npm run assets:audit` to validate
- [ ] Run full test suite: `npm run verify`

## Recommendations

1. **Use manifest system for all new arcade games** - Single source of truth prevents silent asset failures
2. **Run audit before deployment** - Catches silent asset breakage that would go to production
3. **Monitor fallback activation** - If fallback triggers frequently, investigate image path or load failures
4. **Document asset versions** - visualVersion should match design docs (e.g., T35E = Tarifa Zero T35 Edition)
5. **Keep fallbacks fast** - Canvas drawing is last resort; prefer image load errors to layout thrash

---

**Generated**: 2026-03-08  
**T45 Completion**: Asset pipeline now fully operational and auditable across all integrated arcade games.

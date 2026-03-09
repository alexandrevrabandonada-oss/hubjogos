# Asset Naming Normalization Backlog

Document of legacy naming that could be normalized incrementally without breaking existing games.

## What We're NOT Doing in T45

❌ **NOT renaming existing asset files** - would require manifest updates, re-testing, potential fallback cascades, coordination with external production pipeline.

✅ **INSTEAD using this backlog** - guides future work and keeps scope controlled.

## Convention Established

Modern naming: `<categoria>-<nome>-v<versao>.<ext>`

Examples:
- ✓ `bg-bairro-base-v1.svg`
- ✓ `entity-hotspot-agua-v1.svg`
- ✓ `ui-hud-pressure-v2.svg`
- ✓ `player-coordenador-v1.svg`

## Legacy Patterns Observed

### Pattern 1: No Version Suffix
Files like:
- `bg-bairro-base.svg` (should be `bg-bairro-base-v1.svg`)
- `player-ônibus.svg` (should be `player-bus-v1.svg`)

**Impact**: Hard to track updates; unclear which version is active.

**Risk to normalize**: Medium - requires manifest audit and external coordination.

**When to do**: When game receives full asset refresh (P1/P2 cycle).

### Pattern 2: No Clear Category
Files like:
- `skyline-far.svg` (should be `bg-skyline-far-v1.svg`)
- `meter-frame.svg` (should be `ui-hud-meter-frame-v1.svg`)

**Impact**: Unclear storage location and categorization for new artists.

**Risk to normalize**: Low-medium - mostly organizational, doesn't break paths if manifests track current location.

**When to do**: During next content pass, keep old files until fully transitioned.

### Pattern 3: Portuguese vs English Mix
Examples:
- `obstáculo-catraca.svg` vs `obstacle-catraca.svg`
- `jogador-coordenador.svg` vs `player-coordenador.svg`

**Impact**: Inconsistency; hard to teach pattern to external production.

**Risk to normalize**: Medium - might be intentional for campaign UX.

**When to do**: Align with creative direction decision; probably keep Portuguese-leaning for campaign continuity.

### Pattern 4: Multiple Categories Per File
Some files used across multiple games (original approach):
- `/arcade/shared/ui-icon-score.svg` (applied to multiple games)

**Current State**: Deprecated in T44+ - each game has own manifest and fallback paths.

**Migration status**: Tarifa and Mutirao still reference some shared paths as fallback; Cooperativa fully local.

**Risk to normalize**: Low - fallback chain ensures no breakage, gradual migration possible.

## Planned Normalization (T46+)

### T46: Cooperativa P1/P2 Launch
When premium pass approved:
- New assets follow modern convention from day 1
- Old P0 assets preserved with fallback
- Manifests track both versions
- No rename of existing files

Example:
```json
{
  "assets": {
    "bg-base": "/arcade/cooperativa-na-pressao/bg/bg-cooperativa-base-v1.svg"
  },
  "fallback": {
    "byKey": {
      "bg-base": "/arcade/cooperativa-na-pressao/bg/bg-cooperativa-base-legacy.svg"
    }
  }
}
```

### T47: Quick Line Asset Packaging
When quick games receive dedicated packs:
- New structure from first day: modern naming
- No backport of old quick assets
- Establish quick-line standard separate from arcade

### T48+: Legacy Refinement (If Prioritized)
- Batch rename legacy assets when full game refresh occurs
- Update manifests
- Re-smoke test
- Coordinate with external production
- Document migration in commit message

## No Changes Required for T45 Closure

This backlog exists so we don't:
1. Break existing games with careless renames
2. Lose track of what should be normalized
3. Make scope-creep decisions ad-hoc

## External Coordination Notes

When normalizing with production pipeline:
- Notify design/art team of new file names
- Update style guide in shared docs
- Test fallback chains before deploy
- Keep old files available for 2-3 cycles before deletion
- Update README.md in each pack with migration notes

---

**Status**: Reference document for future work; not actionable in T45.  
**Owner**: Art direction + engineering lead · **Review**: Next major content cycle  
**Updated**: 2026-03-08 (T45)

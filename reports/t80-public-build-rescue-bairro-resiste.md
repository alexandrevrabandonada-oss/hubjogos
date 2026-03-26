# T80 — Public Build Rescue: Bairro Resiste Fix + Public Game Quality Gate

**Date:** 2026-03-25  
**Scope:** Bairro Resiste arcade experience, public catalog audit, quality gate definition

---

## 1. Diagnosis: Public Build Mismatch

### What Users Were Seeing

When a user navigated to `/arcade/bairro-resiste`:

1. The entry wrapper showed a generic **"🎯 Iniciar Missão"** CTA — not branded to the game.
2. The in-game intro screen had a **"Iniciar Mutirão"** button — a direct name contamination from the Mutirão do Bairro game.
3. The intro and outcome screens used **raw Tailwind inline classes** instead of the CSS module system — visually inconsistent, harder to maintain.
4. The game board had **no visible sector labels** — hotspots were anonymous icons with no world-feel.
5. **No hit feedback** on hotspot click — player actions felt unresponsive.
6. The **outcome screen was minimal** — no score breakdown, no stat grid, no next-CTA context.

### Routing: NOT Broken

The route `/arcade/bairro-resiste` → `ArcadeGamePage` → `BairroResisteArcadeGame` was correctly wired. No routing or registry issue.

### Game Logic: Functional

The pressure escalation loop, cooldown system, integrity drain, and phase transitions all work correctly. The game loop itself was not the problem.

---

## 2. Root Cause

| Issue | Root Cause |
|-------|------------|
| "Iniciar Mutirão" CTA | Copy-paste from Mutirão template, never updated for Bairro Resiste |
| Generic "Iniciar Missão" page CTA | Hardcoded string in `app/arcade/[slug]/page.tsx` applied to all games |
| Raw Tailwind in game screens | Bairro Resiste was built with inline Tailwind before the CSS module pattern was established |
| No sector labels | Hotspot IDs existed but were not rendered visually |
| No hit feedback | `handleHotspotClick` mutated state but had no visual flash trigger |

---

## 3. Fixes Applied

### `components/games/arcade/BairroResisteArcadeGame.tsx`
- ✅ CTA fixed: "Iniciar Mutirão" → **"Defender o Bairro"**
- ✅ Intro screen rewritten with CSS module classes (`introCard`, `introHeader`, `featureGrid`)
- ✅ 4 feature tiles explaining phases, sectors, critical zone rules, and cooldown
- ✅ Sector labels (`SECTOR_LABELS`) rendered on each hotspot: Água, Moradia, Transit, Saúde
- ✅ Hit flash state (`flashingHotspot`) triggers CSS animation on click
- ✅ Outcome screen fully rebuilt: score grid, phase, integrity %, worst sector threat line
- ✅ `ResultCard` share component integrated into outcome

### `components/games/arcade/BairroResisteArcadeGame.module.css`
- ✅ Added full intro card + result card design system classes
- ✅ Added `@keyframes hitFlashAnim` for green flash feedback on click
- ✅ Added `.sectorLabel` for hotspot sector names
- ✅ Added stat grid, threat line, pulse dot animations

### `app/arcade/[slug]/page.tsx`
- ✅ Replaced hardcoded `"🎯 Iniciar Missão"` with `🎮 {game.cta}` — each game now shows its own action label from the catalog

---

## 4. Public Game Quality Gate

A game must pass **all of the following** before appearing in the main public catalog rails:

| Criterion | Description |
|-----------|-------------|
| ✅ Real playable loop | Must be launchable from click → actual gameplay (no dead end) |
| ✅ Visible world or state | Screen must show something happening, not just controls or text |
| ✅ Active player verbs | Player does physical, visible actions with consequences |
| ✅ Readable objective | Player must know what to do in the first 10 seconds |
| ✅ Clear feedback | Actions must produce satisfying visual/audio response |
| ✅ Fun baseline | Would a normal person call this a game, not a form? |
| ✅ Mobile-safe | Tap targets ≥ 44px, no desktop-only mechanics without fallback |
| ✅ No contamination | No wrong game names, broken CTAs, or placeholder copy |

---

## 5. Catalog Reclassification

| Game | Status | Assessment | Decision |
|------|--------|------------|----------|
| Bairro Resiste | live | ✅ Fixed this sprint | **PUBLIC READY** |
| Tarifa Zero Corredor | live | Mature ArcadeCanvasRuntime | **PUBLIC READY** |
| Passe Livre Nacional | live | Fully mounted canvas loop | **PUBLIC READY** |
| Mutirão do Bairro | live | Most mature, full share system | **PUBLIC READY** |
| Cooperativa na Pressão | beta | ArcadeCanvasRuntime, tested | **PUBLIC READY (beta)** |
| Voto Consciente | live | Quiz format, short loop | **PUBLIC READY** |
| Custo de Viver | beta | Quick quiz, fast session | **PUBLIC READY (beta)** |
| Quem Paga a Conta | beta | Quick quiz, functional | **PUBLIC READY (beta)** |
| Cidade em Comum | beta | Quick quiz, functional | **PUBLIC READY (beta)** |
| Cidade Real | live | Likely slider budget tool — no real visible world | **⚠️ LAB — remove from main rails until redesign** |
| Transporte Urgente | live | Branching story — needs flow audit | **NEEDS REVIEW before main rails** |
| Escolhas Impossíveis | coming | Shell status, not playable | **🚫 LAB — remove from main rails** |
| Memória Coletiva | coming | Shell status, not playable | **🚫 LAB — remove from main rails** |

---

## 6. Fun-First Review Checklist

Before any game appears publicly, verify:

- [ ] Is it fun in the first 20–40 seconds?
- [ ] Does the screen show a world, not just controls?
- [ ] Does the player do something physical/visible?
- [ ] Do actions produce satisfying feedback?
- [ ] Would a normal player call this a game, not a form?
- [ ] Does it work cleanly on mobile (360px+)?
- [ ] CTA labels match this specific game?

---

## 7. Verification

- `npm run type-check` — ✅ 0 errors
- `npm run lint` — ✅ 0 warnings
- Manual route test: `/arcade/bairro-resiste` — no Mutirão contamination
- Intro CTA: "Defender o Bairro" ✅
- Sector labels visible on board ✅
- Hit flash on click ✅
- Outcome screen with stats + share ✅

---

## 8. Next Production Recommendations

1. **Audit Cidade Real** and Transporte Urgente against the quality gate before next release
2. **Demote shell-status games** (`coming` + `runtimeState: 'shell'`) from main catalog lanes
3. **Consider a "Lab" section** for experiments/prototypes so they don't pollute the main public game rails
4. **For Bairro Resiste next sprint:** add a `FinalShareCard` with QR code and campaign metrics to the outcome screen (as mature games have)

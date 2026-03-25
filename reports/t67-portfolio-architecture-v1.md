# T67 — Portfolio Architecture v1 (Alexandre VR Abandonada Hub)

## Diagnosis
The Hub was previously optimized for a single "Hero" game. As the ecosystem grows to 14+ games across different genres and territories, the hero-centric model became a bottleneck for discovery and campaign messaging.

## Architectural Changes

### 1. Unified Game Registry (`lib/games/catalog.ts`)
- Implemented rich metadata for all 14 games.
- New fields: `genre`, `territories`, `politicalThemes`, `deviceSupport`, `isFeatured`, `isNew`.
- Established a `priorityScore` for editorial sorting.

### 2. Editorial Masthead (`components/hub/EditorialMasthead.tsx`)
- Shifted from "Play Game X" to "The Movement for Popular Power".
- High-level campaign framing with dynamic stats.
- Clear Primary/Secondary CTAs for onboarding.

### 3. Lane-Based Discovery (`components/hub/PortfolioLane.tsx`)
- Organized the homepage into thematic lanes:
  - **Destaques da Campanha**: Featured high-impact games.
  - **Novos Territórios**: Discovery by RJ municipalities (Volta Redonda, Barra Mansa, etc.).
  - **Lutas e Temas**: Filtered by political themes (Tarifa Zero, Moradia, etc.).
  - **Gêneros do Arcade**: Casual vs. Strategic discovery.

### 4. Standardized Game Cards (`components/hub/GameCard.tsx`)
- New professional design with metadata badges.
- Improved visual hierarchy for mobile and desktop.
- Integrated Hub-level analytics for card impressions and clicks.

## Portfolio discovery Metrics
We now track how users discover games:
- `portfolio_lane_impression`: Which categories are most attractive?
- `portfolio_card_click`: Which specific games have the best CTR within their lanes?
- `hero_impression`: Evaluation of the new masthead engagement.

## Future Scalability
- **T68 recommendation**: Implement a "Territory Map" visual discovery layer.
- **T69 recommendation**: User-specific "Saved/Played" state using local storage to personalize lanes.

---
*Report delivered by Antigravity (T67).*

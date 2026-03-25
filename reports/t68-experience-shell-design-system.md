# T68 — Hub Experience Shell v1 (Design System + Territorial Identity)

## Diagnosis
The Hub's prior iteration successfully solved the structural information architecture (lanes, central metadata). However, there was a risk that the product could feel fragmented—like an unorganized indie jam collection or a generic dashboard—as different genres were added. 

## Design System & Tokens
To address visual fragmentation, we implemented a cohesive set of design tokens within `globals.css`:
- **Genre differentiation**: Introduced semantic variables (`--genre-arcade`, `--genre-simulation`, `--genre-narration`, etc.) mapped to distinct but harmonious colors (ruby, teal, violet).
- **Territorial accent**: Standardized a golden/amber territorial aesthetic (`--territory-accent`) used safely without visually overloading the user.

## Shell Components
- **Card Variants**: The `GameCard` component was refactored to support variants (`standard`, `featured`, `compact`). This enables varied rhythm on the homepage: 
  - `featured` cards (large view) draw attention to curated picks.
  - `compact` cards fit inside quick-play lanes, removing redundant descriptions in favor of pure action elements.
- **Editorial Masthead**: Replaced placeholder elements with animated "Civic Pillars" (`Poder Popular`, `Tarifa Zero`, `Direito à Cidade`) that slowly float on screen, grounding the Hub's purpose intentionally without reading as heavy propaganda.

## Territorial Identity Strategy
Territoriality is expressed lightly and contextually:
- Added a custom chip style (`.territoryTag`) to the `GameCard`. It uses the distinct territory color mix and a stylized `✦` emblem rather than a generic map pin.
- Instead of adding complex interactive maps immediately, the UI trusts the strong Lane headers ("Volta Redonda e Região") and the chips to create a sense of place.

## Genre Differentiation Strategy
Genres are now instantly recognizable through:
- Color-coded borders, glow effects on hover, and custom badge coloring dynamically assigned via React style attributes (`--card-accent`).
- A subtle top-bar accent that indicates the core gameplay pace before the user even reads the title.

## Responsive Layout
Tested spacing, scrolling, and card visibility limits:
- **Mobile**: Adjusted typography bounds, ensured `laneScroll` handles touch input smoothly, set `compact` lanes to smaller flex-basis for dense swiping.
- **Desktop**: Increased maximum container boundaries for featured cards to maximize screen real-estate without fatiguing the eye.

## Next Recommendations (T69)
1. Proceed with a "Territory visual map layer" (discovery by region interface) now that the base tokens support regional identities.
2. Introduce lightweight personalization (local storage saves) to remember what games the user played recently and dynamically generate a "Continue Jogando" lane.

# T69 — Hub Progression Model v1

## Diagnosis

The Hub risks feeling like a static, one-off catalog. Without a progression model, users lack clear incentives to return, explore, or deepen engagement. There’s no memory of their journey, no editorial flow, and no subtle cues guiding them across genres, territories, or political themes. This limits the Hub’s potential as a living, recurring ecosystem.

## Progression Principles
- Returnability: users should feel invited to return and continue.
- Editorial flow: movement between genres, depths, and themes is intentional.
- Privacy-light: no accounts, only local save state.
- Subtlety: badges and surfaces are elegant, not noisy.
- Extensibility: system can grow into accounts, achievements, maps, missions.

## Local Save Strategy
- Use localStorage for: recently played, completed, last session, favorites, genre/territory affinity.
- Robust, privacy-light, no server-side persistence in v1.

## Return Surfaces Created
- Continue Jogando
- Jogados Recentemente
- Próximo passo
- Você pode gostar também
- Voltar para a luta relacionada

## Recommendation Rules
- Editorial, not random.
- Prioritize unplayed, genre/territory affinity, campaign relevance.
- Progression grammar: quick → deeper, arcade → simulator, etc.
- Fallback to “novo” or “em destaque” if needed.

## Post-Game Loop Logic
- Result summary
- Why it matters
- One recommended next game
- One related issue/struggle
- Optional share CTA
- Optional campaign/civic CTA

## Analytics Events
- continue_lane_impression
- continue_card_click
- recent_lane_impression
- recommendation_click
- post_game_next_click
- save_state_created
- completion_state_seen
- share_cta_seen
- share_cta_click
- All events include: game_slug, source_surface, genre, territory, political_theme, progression_state

## Future Expansion Notes
- Accounts, achievements, territory maps, missions, seasonal campaigns, narrative journeys.
- All logic is modular for future growth.

## Risks / Follow-ups
- Privacy: localStorage only, but message if/when accounts arrive.
- Editorial curation: recommendations may need periodic review.
- Homepage bloat: surfaces only render when relevant.
- Migration: future account system must migrate local state.

## Verification Summary
- Surfaces only appear when relevant.
- Progression state persists across reloads (localStorage).
- Recommendations are editorial, not random.
- Badges/statuses are subtle and responsive.
- Analytics events fire with correct metadata.
- All new UI is mobile/tablet/desktop friendly.
- System is modular for future expansion.

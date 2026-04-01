# T118 Desobstrução Public Packaging Prep

## Diagnosis
With the simulation wave passed in T117E, the Desobstrução vertical slice is mechanically locked and proven stable. To move it into the public portfolio without making premature or "fake" claims about scale, we formulated a candidate storefront treatment. The game is now labeled as a `FLAGSHIP CANDIDATE (BETA)` — signaling its high mechanical quality while remaining honest about its ongoing real-world validation process.

## Files Created/Changed
- **`lib/games/catalog.ts`**: Inserted the `desobstrucao` dictionary object at the end of the Hub's central game catalog with status `beta`.
- **`app/games/desobstrucao/page.tsx`**: Created the full, rich media entry storefront matching the Hub design guidelines. 

## Capture Pack (Mocked References)
Because we operate completely visual-first, the following assets have been officially mocked/linked in the storefront code to replace graybox placeholders immediately once recorded:
- **`official-clip-01.webm`**: 15s short clip of the entire two-phase restoration loop.
- **`gif-01-primer.gif`**: The mobile gesture instruction.
- **`gif-02-concrete-smash.gif`**: The concrete block shattering.
- **`gif-03-steel-restoration.gif`**: The metal grate yielding to final impact.
- **`screenshot-01-aiming.png` & `screenshot-02-cleared.png`**: High resolution hero stills.

## Storefront Updates
The entry card now lives in the unified `games` catalog and is visible across the application in appropriate `public_ready_beta` carousels. It features the "Saneamento Direto" CTA routing directly to the `/arcade/desobstrucao` prototype endpoint.

## Copy Pack
**Subtitle:** "Desobstrução - Física e Infraestrutura."
**Hook:** "Quebre barreiras pesadas e restaure o fluxo. Saneamento é ação direta."
**Share Blurb:** "Restaure o fluxo. Física pesada e infraestrutura comunitária em foco total."
**What This Is:** "Arcade platformer de física focado em timing, leitura instantânea e resistência sistêmica."

## Status Recommendation
The status sits firmly at **BETA / FLAGSHIP CANDIDATE**. We do not present it to the broader public as a finished, marketed flagship until a fully external, non-simulated real human wave provides final metrics, but the visual tier is now aligned with our highest standards.

## Verification Summary
Both the central catalog export and the Next.js App Router entry pages pass the type checker. The URL schema (`/games/desobstrucao`) is now active and routing cleanly via `GameEntryPage`. We are packaged and ready for exhibition.

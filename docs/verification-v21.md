# GlorpOS 2.1 verification

Verified locally on September 7, 2026 with Chromium through Playwright CLI at http://127.0.0.1:5173. This is a local development preview, not evidence of a deployment.

## Build and data

- `npm run build`: TypeScript and Vite passed. Final app JavaScript: 51.35 kB / 18.16 kB gzip; CSS: 33.91 kB / 9.24 kB gzip. Catalog is a separate request.
- `node scripts/catalog.mjs`: retained source hash validated; 1,337 records, 1,337 unique mints, sequential IDs 1–1,337, eight trait categories; normalized JSON 494,950 bytes. CSV contains all 1,337 items.
- Final clean reload: zero collected page errors or console errors, `lang=en`, 12 cards in the first page, first eight source images loaded successfully.

## Browser checks

| Flow | Result |
| --- | --- |
| Boot | Catalog readiness and explicit entry work; sound can be disabled before entry |
| Search | Exact ID 1337 returns one card |
| Trait filtering | Body Pixel and Hat Ribbon work; Ribbon produces 59 matches |
| Sorting | HowRare rank places Glorp #892 first, with rank #1 in its detail |
| Pagination | Next displays 13–24; previous restores 1–12 |
| Favorites | Saving #1337 appears under Saved and persists after reload |
| NFT detail | Artwork, eight traits, rank and mint displayed; Escape closes the panel |
| Random discovery | Selection respects the current trait filter |
| Catalog outage | Aborted catalog request produces boot warning and in-app retry; removing interception and retrying restores the catalog |
| Image failure | Aborted source image shows Image unavailable; subsequent normal reload restores image |
| About | Token mint copied through the browser clipboard action |
| Notes | Text persists after reload; exported .txt content matches |
| Maker | English controls; edited caption exports a PNG successfully |
| Audio | All three radio stations reach a running AudioContext with respective track indices 0, 1 and 2; mute changes enabled state; closing radio clears playback state |
| Preferences | Volume 20%, Ink theme and reduced motion persist across reload; theme/motion returned to defaults afterward |
| Launcher and terminal | Ctrl K search opens Terminal; glorp command toggles the secret effect on and off |
| Arcade | Timer advances; pause freezes it; resumed 30-second round finishes with 20 points and saved best 20 |
| Desktop windows | Left/right tiling, minimize and dock restore work |
| Responsive | 390 x 844 collection and detail fit viewport; returning to 1440 x 900 restores 1050 x 690 desktop collection geometry |

The arcade test initially exposed an invalid visibility check: a fixed-position WinBox has no offsetParent. Using its client rectangles fixed the frozen game. Responsive testing also caught a mobile-sized window persisting on desktop; breakpoint restoration now uses saved desktop dimensions or app defaults. Both flows were rerun successfully.

Intentional aborted-request tests produce expected network console errors. These are separate from the final clean reload. Audio behavior was verified through browser state and controls; speaker/headphone output and subjective mix quality were not independently auditioned.

## Artifacts

Under `output/playwright/`:

- `v21-boot.png`
- `v21-collection.png`
- `v21-mobile.png`
- `v21-mobile-detail.png`
- `v21-about.png`
- `v21-catalog-error.png`
- `v21-maker.png` (actual exported image)
- `v21-notes.txt` (actual exported notes)

Desktop collection and mobile collection/detail screenshots were visually inspected. Historical v1 evidence remains in verification.md; it does not substitute for the checks above.

## Remaining boundaries

NFT artwork and Google Fonts depend on their remote hosts. Metadata is a dated snapshot, not live pricing, ownership or sales. Physical iOS/Android, Safari and Firefox were not tested. Local audio-file playback was not retested in this pass. No AI model, wallet or backend is connected. No push, PR or deployment was performed.

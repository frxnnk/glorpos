# Responsive and visual redesign verification

September 7, 2026. Local development preview at http://127.0.0.1:5173.

## Design and content

The desktop, collection, boot and program styles were revised with DM Sans for controls and Sora for headings. Font binaries and OFL licenses are served locally. Generated mascot portrait: public/glorp-hd.png, 1254 x 1254. See mascot-generation.md for prompts and provenance. The UI no longer contains the decorative GLORP / SOLANA label, eyebrow headings, version stamps or author branding. Historical repository attribution remains in source documentation.

The catalog remains the same 1,337-item snapshot. Original NFT artwork was not replaced with generated images. Collection filters collapse on narrow windows; navigation has five labeled primary apps on mobile. Remaining apps are available through Search and Home.

## Browser checks

Chromium Playwright checks confirmed the collection window stays within viewport limits at:

| Viewport | Window geometry x/y/width/height |
| --- | --- |
| 320 x 568 | 6 / 54 / 308 / 432 |
| 390 x 844 | 6 / 54 / 378 / 708 |
| 768 x 1024 | 12 / 88 / 744 / 690 (previous saved desktop height) |
| 844 x 390 | 6 / 50 / 832 / 278 |
| 1280 x 720 | 218 / 60 / 1050 / 572 |

- Visible-window reopen works without the former WinBox show().focus() error.
- Phone-to-desktop transitions restore desktop dimensions while clamping minimum sizes to the available area.
- Hat / Ribbon filtering, opening and closing filters, random selection and exact ID search work.
- NFT detail makes its background inert, keeps Tab/Shift-Tab inside, restores focus after saving and closes with Escape.
- Launcher Close activated with keyboard Enter closes the launcher instead of opening the selected result.
- Maker exports the generated portrait in an actual PNG download.
- document.fonts.check confirms DM Sans and Sora have loaded.
- Radio playback, close and clean reload checked. No collected page or console errors in the final check.
- Source scan found no FRXN, GLORP / SOLANA or decorative eyebrow labels in application source / index.html.

Screenshots inspected: v22-320x568.png, v22-844x390.png, v22-mobile-final.png, v22-desktop-final.png and v22-boot.png under output/playwright. v22-maker.png is the exported Maker output.

## Build

TypeScript and Vite passed. No new npm dependency. Final bundle approximately 60.54 kB JavaScript (20.99 kB gzip), 38.41 kB CSS (9.68 kB gzip), plus catalog, locally served fonts and the 2.38 MB mascot PNG.

## Boundaries

Desktop Chromium and emulated viewport dimensions were checked; physical mobile devices, Safari and Firefox were not. NFT artwork still depends on its source host. The mascot is an opaque portrait with CSS presentation masks, not a transparent NFT replacement. Nothing was pushed or deployed.

## Arcade redesign

Orbit Collector now has a 60-second round, three sectors, three lives, fish, asteroids, combo scoring and shields. Movement supports arrows/A-D, pointer dragging and on-screen touch controls; Canvas renders at device pixel ratio. Visibility/focus loss pauses the game. Scores persist separately from the previous arcade version.

Pure engine simulations checked scoring, combo progression and reset, shield collision, loss of lives, time completion, sector progression and movement bounds. Root visually inspected the integrated phone and landscape screens (v22-arcade-phone.png and v22-arcade-landscape.png). Mobile movement buttons are 44px high. Live gameplay verification is recorded below.

Live arcade browser result: Out of lives, 60 points, 6 fish, best 60. Play again reset the score to 0. Pause held the timer and Resume continued it. Evidence: output/playwright/v22-arcade-result.png.

## Subsequent startup and desktop changes

The user then requested a space background, no Ready message, an icon-only sound control, official links underneath, no desktop icons and About Glorp as the first open app. These changes are implemented. Startup links are accessible 44px targets for X, Telegram, Magic Eden, Dexscreener and the official Linktree. All five URLs match the captured project sources and open a new tab with noopener/noreferrer. No external action or transaction was performed through those destinations.

Fresh browser checks passed at 320x568, 390x844, 844x390 and desktop1440x900: Enter, sound and link controls remain in bounds; mute/unmute updates its accessible label; Ready and Sound on are absent from visible startup text; zero desktop icons; About Glorp opens after entry. Startup/desktop screenshots: v23-space-boot.png, v23-about-desktop.png and v23-boot-320.png / v23-boot-390.png / v23-boot-844.png. The space image is generated locally for this project; prompt at docs/space-generation.md.

# GlorpOS

A web desktop for Glorp: the complete captured NFT catalog, project information, an image maker, an arcade game and original interface sounds.

## Run

Use Node 22.12+ or a version supported by Vite 8.

```sh
npm ci
npm run dev
```

To select the host and port explicitly, including on Windows:

```sh
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 --strictPort
```

```sh
npm run build
npm run preview
```

## Inside

- Collection: 1,337 NFTs; search by number, name, mint or trait; eight trait categories; HowRare ranking; favorites; pagination; random discovery; detailed artwork, traits and source links.
- About Glorp: project identity, verified token mint, official links and catalog download.
- Maker: compose and export an 800 x 800 PNG using the generated high-resolution Glorp portrait.
- Arcade: Orbit Collector, a 60-second game with three sectors, fish, asteroids, shields, three lives, combos, pause, touch controls and a saved best score.
- Radio: three original synthesized ambient stations, plus local audio playback.
- Notes, keyboard launcher, terminal commands, three themes, reduced motion and desktop window layout controls.
- Boot, interface and game sounds with global mute and volume. Audio starts after an explicit user interaction.
- Animated spacecraft piloted by Glorp #1, #2 and #5 from the captured NFT collection. Five ships on desktop, three on compact screens; reduced-motion preferences keep them still.

Ctrl/Cmd K opens app search. Notes, favorites, preferences and desktop window geometry stay in localStorage. Clearing site data removes them. Each app has one instance; mobile apps use the available area above the dock. Startup always opens About Glorp. The desktop has no loose shortcuts; apps live in the dock and launcher.

The interface uses locally bundled DM Sans and Sora. Compact layouts include phones and short landscape viewports; the mobile dock has five labeled destinations and additional apps remain in search. Decorative labels and author branding have been removed.

## Catalog archive

The metadata snapshot was captured September 7, 2026. All 1,337 records are available as [JSON](public/data/glorp-catalog.json) and [CSV](public/data/glorp-catalog.csv). Source artwork loads from the original image host; image binaries are not mirrored. Ranking is attributed to HowRare and is not a live valuation.

Rebuild the normalized files from the retained, hash-checked source:

```sh
node scripts/catalog.mjs
```

Refresh from the public source, validating completeness before replacement:

```sh
node scripts/catalog.mjs --refresh
```

[Content sources and limits](docs/glorp-sources.md) · [UX decisions](docs/ux-v2.md) · [Original repository comparison](docs/research.md) · [Verification](docs/verification-v22.md) · [Space fleet checks](docs/verification-v24.md) · [Attribution](THIRD_PARTY_NOTICES.md)

## Deployment and history

Vercel uses the repository root, the Vite preset, `npm ci`, `npm run build` and the `dist` output directory. No environment variables are required.

The original 2024 application is preserved in [legacy/v1](legacy/v1), based on commit `e60c0190c60c38e6e864a526f905c861830a64bb`. It is excluded from the deployed application.

WinBox 0.2.82 is the only runtime dependency, used for window movement, resizing, focus and controls. TypeScript and Vite are development tools. No backend, paid service, wallet connection or model API is configured. Maker uses Canvas, not a generative model.


The startup and desktop use a generated space background. Startup has an icon-only sound toggle and direct links to X, Telegram, Magic Eden, Dexscreener and the official project directory. Generated assets and prompts: docs/mascot-generation.md and docs/space-generation.md.

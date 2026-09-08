# GlorpOS 2 — content and interaction pass

## UX findings in the first version

- The opening window repeats wallpaper slogans instead of showing what is inside.
- No collection or project information: the interface could belong to any mascot.
- Spanish and English are mixed, with vague app descriptions and decorative text.
- No real loading/error recovery, session restoration, active app state or sound controls.
- Window chrome is keyboard-operable, but focus, mobile app switching and data-heavy layouts need improvement.

## Implementation direction

Keep the desktop model and olive identity; make the NFT collection the main destination. Use short functional English labels. Put personality into the artwork, a pet interaction, boot sound, radio, game feedback and a terminal easter egg.

Collection: 1,337 real records, search by ID/name/mint/trait, trait filter, rarity/number sorting, favorites, pagination, random discovery, detail view, source attribution and external marketplace links. Catalog metadata is a dated local snapshot, not live sales data.

Boot: actual catalog preparation, explicit enter action and sound toggle; no fake loading percentages. Catalog failures allow entry and retry. Artwork: skeleton until loaded, explicit failure state. Mobile: full app area above a horizontally scrollable dock.

Audio: generated locally with Web Audio. Startup, windows, collect/favorite, errors and secret cues; global mute and volume; ambient radio with play/stop. No audio before the user's first enter/play interaction. Honor reduced motion and provide equivalent visual feedback.

Vercel Marketplace guidance was checked for external services. This is a read-only archival viewer of the existing named Glorp collection, not a new storefront or checkout. No provisioning, accounts or paid service are required for this scope.

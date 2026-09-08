# Glorp content archive

Captured September 7, 2026. Primary project identity is @glorpcatsol, the directory at https://linktr.ee/glorpcat and the community at https://t.me/GlorpCat.

| Fact | Evidence | Treatment |
| --- | --- | --- |
| Glorp token mint `FkBF9u1upwEMUPxnXjcydxxVSxgr8f3k1YXbz7G7bmtA` | Public Telegram profile, CoinGecko corroboration and original user repository | Used in About; clearly separate from NFT mints |
| Collection has 1,337 items | [LaunchMyNFT mint page](https://launchmynft.io/collections/YNzVmdaJ5FpzzN7RXi8uDHqjH2dNnfyuAfu9dihaaSc/eiyuobb65kzE4UxS3bIu), [HowRare](https://howrare.is/glorp) | Count independently checked against full metadata |
| NFT collection belongs to this Glorp project | Official Linktree links Magic Eden /glorp; LaunchMyNFT and HowRare point to @glorpcatsol | Used as identity chain; no unrelated Glorp collections imported |
| Full catalog: IDs 1–1,337, 1,337 unique mints | [HowRare JSON](https://api.howrare.is/v0.1/collections/glorp/) | Raw snapshot and SHA-256 manifest retained |
| Eight categories: Background, Body, Buddy, Shirt, Overlay, Hat, Mouth, Glasses | NFT records in same dataset | Preserved exactly; source spelling not silently corrected |
| Rarity rank | HowRare ranking algorithm | Labeled HowRare, not official rarity and not a valuation |
| Main website now linked as glorpcat.net | Current official Linktree | Included as Original GlorpOS; glorpcat.lol was unreachable |

## Official directory links captured

- https://www.glorpcat.net
- https://x.com/glorpcatsol
- https://t.me/GlorpCat
- https://dexscreener.com/solana/gzqckvytrfnuipuks5swypufb2fhqhcjazpkgywuntng
- https://t.me/bonkbot_bot?start=ref_glorp
- https://moonshot.money/glorp?ref=l0K03fqBZF
- https://magiceden.io/marketplace/glorp
- https://www.sniper.xyz/collection/glorp

Trading/referral links are preserved here as source evidence, without activating bots, connecting wallets or asserting their safety/availability. The desktop prioritizes informational links and external collection viewing.

## Files

- `docs/sources/howrare-glorp.json`: original full response, including all original ranks and attribute percentages.
- `docs/sources/linktree.html`: fetched official directory page.
- `docs/sources/capture.json`: capture date, source hash, identity sources and limitations.
- `public/data/glorp-catalog.json`: normalized catalog used by the app.
- `public/data/glorp-catalog.csv`: all 1,337 records with image URL, mint, rank and eight traits.
- `scripts/catalog.mjs`: validates and rebuilds normalized files; `--refresh` performs a bounded GET and validates the response before replacing the snapshot.

## Limits

The Magic Eden public endpoint returned HTTP 429. The historical .lol site timed out. No prices, floor, ownership, circulating supply or volume were imported as live data. Source NFT image URLs are retained and rendered lazily; the 1,337 original image binaries have not been mirrored. Missing or blocked images show an explicit unavailable state.

No primary-source founder/artist biography, formal roadmap or precise launch date was recovered. Third-party articles included contradictory token addresses, so those claims were excluded. The archive is complete for the catalog source captured, not a claim to contain every historical social post or all possible Glorp material.

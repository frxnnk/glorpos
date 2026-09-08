import { tokenMint } from "./catalog";
const links = [
  ["X / @glorpcatsol", "Community posts", "https://x.com/glorpcatsol"],
  ["Telegram", "Glorp community", "https://t.me/GlorpCat"],
  ["Magic Eden", "NFT collection", "https://magiceden.io/marketplace/glorp"],
  [
    "Dexscreener",
    "Token market",
    "https://dexscreener.com/solana/gzqckvytrfnuipuks5swypufb2fhqhcjazpkgywuntng",
  ],
  [
    "Official link directory",
    "All project links",
    "https://linktr.ee/glorpcat",
  ],
  ["Original GlorpOS", "The first desktop", "https://www.glorpcat.net"],
  [
    "LaunchMyNFT",
    "Collection mint page",
    "https://launchmynft.io/collections/YNzVmdaJ5FpzzN7RXi8uDHqjH2dNnfyuAfu9dihaaSc/eiyuobb65kzE4UxS3bIu",
  ],
  ["HowRare", "Metadata and rarity", "https://howrare.is/glorp"],
];
export function mountAbout(
  root: HTMLElement,
  open: (id: string) => void,
  notify: (message: string) => void,
) {
  root.innerHTML = `<section class="program about"><div class="about-header"><div><h2>Glorp</h2><p>Glorp is a cat-shaped alien meme, a Solana token, and a collection of 1,337 NFT characters.</p></div><img src="/glorp-hd.png" alt="Glorp"/></div><div class="about-facts"><div><b>1,337</b><span>NFTs</span></div><div><b>8</b><span>Trait categories</span></div><div><b>SOL</b><span>Network</span></div></div><section class="about-section"><h3>The collection</h3><p>The collection mixes alien cats, streetwear and internet references. Each Glorp has a body, background, clothing and accessories. Browse the original artwork and its recorded traits.</p><button class="primary" id="browse-collection">Open collection ↗</button></section><section class="about-section"><h3>$GLORP</h3><p>Solana token mint. This is separate from the individual NFT mint addresses.</p><div class="contract"><code>${tokenMint}</code><button class="secondary" id="copy-token">Copy</button></div><a class="text-link" href="https://solscan.io/token/${tokenMint}" target="_blank" rel="noopener noreferrer">View on Solscan ↗</a></section><section class="about-section"><h3>Links</h3><div class="official-links">${links.map(([name, description, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer"><span>${name}<small>${description}</small></span><b>↗</b></a>`).join("")}</div></section><details class="source-details"><summary>Sources</summary><p>Official links cross-checked against <a href="https://linktr.ee/glorpcat" target="_blank" rel="noopener noreferrer">Glorp’s Linktree</a>. Token mint cross-checked against <a href="https://t.me/GlorpCat" target="_blank" rel="noopener noreferrer">the community Telegram profile</a>. Collection identity and size corroborated by LaunchMyNFT. Trait data and ranking are a HowRare snapshot captured September 7, 2026.</p><a href="/data/glorp-catalog.json" download="glorp-catalog.json">Download JSON ↓</a><a href="/data/glorp-catalog.csv" download="glorp-catalog.csv">Download CSV ↓</a></details></section>`;
  root
    .querySelector("#browse-collection")!
    .addEventListener("click", () => open("collection"));
  root.querySelector("#copy-token")!.addEventListener("click", () =>
    navigator.clipboard
      .writeText(tokenMint)
      .then(() => notify("Token mint copied."))
      .catch(() => notify("Select the mint address to copy it.")),
  );
  return () => {};
}

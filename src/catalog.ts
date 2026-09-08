export type NFT = {
  id: number;
  name: string;
  mint: string;
  image: string;
  rank: number;
  traits: Record<string, string>;
};
export type Catalog = {
  title: string;
  count: number;
  capturedAt: string;
  source: string;
  items: NFT[];
};
let pending: Promise<Catalog> | undefined;
export function getCatalog(): Promise<Catalog> {
  return (pending ??= fetch("/data/glorp-catalog.json", {
    signal: AbortSignal.timeout(15000),
  })
    .then(async (response) => {
      if (!response.ok) throw new Error("The collection could not be loaded.");
      const data = (await response.json()) as Catalog;
      if (!Array.isArray(data.items) || data.items.length !== 1337)
        throw new Error("The collection file is incomplete.");
      return data;
    })
    .catch((error) => {
      pending = undefined;
      throw error;
    }));
}
export function escapeHTML(value: unknown) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
}
export const tokenMint = "FkBF9u1upwEMUPxnXjcydxxVSxgr8f3k1YXbz7G7bmtA";
export function artwork(nft: NFT, eager = false) {
  return `<div class="artwork loading"><img src="${escapeHTML(nft.image)}" alt="${escapeHTML(nft.name)}" loading="${eager ? "eager" : "lazy"}" decoding="async" referrerpolicy="no-referrer"/><span class="art-error" hidden>Image unavailable</span></div>`;
}
export function watchArtwork(root: HTMLElement) {
  root.querySelectorAll<HTMLImageElement>(".artwork img").forEach((img) => {
    const loaded = () => img.parentElement?.classList.remove("loading");
    const failed = () => {
      loaded();
      img.hidden = true;
      const label = img.parentElement?.querySelector<HTMLElement>(".art-error");
      if (label) label.hidden = false;
    };
    img.onload = loaded;
    img.onerror = failed;
    if (img.complete) img.naturalWidth ? loaded() : failed();
  });
}

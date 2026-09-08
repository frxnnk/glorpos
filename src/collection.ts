import {
  getCatalog,
  artwork,
  watchArtwork,
  escapeHTML as esc,
} from "./catalog";
import type { Catalog, NFT } from "./catalog";
import { read, save } from "./storage";
import { playSound } from "./sound";

export function mountCollection(
  root: HTMLElement,
  notify: (message: string) => void,
) {
  let alive = true,
    data: Catalog,
    query = "",
    trait = "",
    traitName = "Body",
    sort = "number",
    favoritesOnly = false,
    filtersOpen = false,
    page = 0,
    selected: NFT | undefined;
  const pageSize = 12,
    favorites = new Set<number>(read<number[]>("favorites", []));
  root.innerHTML = `<section class="collection-loading"><h2>Loading Glorps</h2><div class="skeleton-grid">${'<div class="skeleton"></div>'.repeat(6)}</div></section>`;
  function results() {
    return data.items
      .filter(
        (item) =>
          (!favoritesOnly || favorites.has(item.id)) &&
          (!trait || item.traits[traitName] === trait) &&
          (!query ||
            (/^#?\d+$/.test(query)
              ? String(item.id) === query.replace(/^#/, "")
              : `${item.name} ${item.mint} ${Object.values(item.traits).join(" ")}`
                  .toLowerCase()
                  .includes(query.toLowerCase()))),
      )
      .sort((a, b) => (sort === "rarity" ? a.rank - b.rank : a.id - b.id));
  }
  function toggleFavorite(id: number) {
    favorites.has(id) ? favorites.delete(id) : favorites.add(id);
    if (!save("favorites", [...favorites]))
      notify("Favorites could not be saved.");
    playSound("favorite");
    renderGrid();
    if (selected) renderDetail(selected);
  }
  function renderGrid() {
    const list = results();
    page = Math.min(page, Math.max(0, Math.ceil(list.length / pageSize) - 1));
    root.querySelector("#collection-count")!.textContent =
      `${list.length.toLocaleString("en-US")} ${favoritesOnly ? "saved" : "items"}`;
    const grid = root.querySelector<HTMLElement>("#nft-grid")!;
    grid.innerHTML = list.length
      ? list
          .slice(page * pageSize, (page + 1) * pageSize)
          .map(
            (item) =>
              `<article class="nft-card ${selected?.id === item.id ? "chosen" : ""}"><button class="nft-open" data-nft="${item.id}" aria-label="View ${esc(item.name)}">${artwork(item)}<span class="nft-caption"><strong>${esc(item.name)}</strong><small>${esc(item.traits.Body)}</small></span></button><button class="nft-favorite ${favorites.has(item.id) ? "saved" : ""}" data-favorite="${item.id}" aria-label="${favorites.has(item.id) ? "Unsave" : "Save"} ${esc(item.name)}" aria-pressed="${favorites.has(item.id)}">${favorites.has(item.id) ? "♥" : "♡"}</button></article>`,
          )
          .join("")
      : `<div class="collection-empty"><h3>${favoritesOnly ? "Nothing saved yet" : "No Glorps found"}</h3><p>${favoritesOnly ? "Tap a heart to keep a Glorp here." : "Try an ID, a trait, or a different filter."}</p><button class="secondary" id="reset-filters">Reset filters</button></div>`;
    root.querySelector("#page-label")!.textContent = list.length
      ? `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, list.length)} of ${list.length}`
      : "0 items";
    (root.querySelector("#prev-page") as HTMLButtonElement).disabled =
      page === 0;
    (root.querySelector("#next-page") as HTMLButtonElement).disabled =
      (page + 1) * pageSize >= list.length;
    root.querySelector("#saved-count")!.textContent = String(favorites.size);
    watchArtwork(grid);
    root.querySelector("#reset-filters")?.addEventListener("click", () => {
      query = "";
      trait = "";
      favoritesOnly = false;
      page = 0;
      render();
    });
  }
  function renderDetail(item: NFT) {
    selected = item;
    root.querySelectorAll<HTMLElement>(".collection-sidebar,.collection-main").forEach((el) => { el.inert = true; });
    const panel = root.querySelector<HTMLElement>("#nft-detail")!;
    panel.hidden = false;
    panel.innerHTML = `<div class="detail-top"><span>${esc(item.name)}</span><button id="close-detail" aria-label="Close NFT details">✕</button></div>${artwork(item, true)}<div class="detail-info"><h2>${esc(item.name)}</h2><div class="detail-actions"><button class="secondary" id="save-detail">${favorites.has(item.id) ? "♥ Saved" : "♡ Save"}</button><a class="primary" href="https://magiceden.io/item-details/${esc(item.mint)}" target="_blank" rel="noopener noreferrer">Magic Eden ↗</a></div><h3>Traits</h3><dl class="traits">${Object.entries(
      item.traits,
    )
      .map(
        ([key, value]) =>
          `<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`,
      )
      .join(
        "",
      )}</dl><div class="rank-row"><span>HowRare rank</span><b>#${item.rank}</b></div><label>Mint address</label><button class="mint-copy" id="copy-nft" title="Copy mint address">${esc(item.mint)} ⧉</button><p class="source-note">Metadata captured ${new Date(data.capturedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}. <a href="https://howrare.is/glorp/${item.id}" target="_blank" rel="noopener noreferrer">View source ↗</a></p></div>`;
    watchArtwork(panel);
    panel.querySelector("#close-detail")!.addEventListener("click", () => {
      selected = undefined;
      panel.hidden = true;
      root.querySelectorAll<HTMLElement>(".collection-sidebar,.collection-main").forEach((el) => { el.inert = false; });
      renderGrid();
      (root.querySelector<HTMLButtonElement>(`[data-nft="${item.id}"]`) || root.querySelector<HTMLButtonElement>("#random-nft"))?.focus();
    });
    panel
      .querySelector("#save-detail")!
      .addEventListener("click", () => { toggleFavorite(item.id); root.querySelector<HTMLButtonElement>("#save-detail")?.focus(); });
    panel.querySelector("#copy-nft")!.addEventListener("click", () =>
      navigator.clipboard
        .writeText(item.mint)
        .then(() => notify("Mint address copied."))
        .catch(() =>
          notify("Copy unavailable. Select the address to copy it."),
        ),
    );
  }
  function render() {
    root.innerHTML = `<section class="collection-app"><aside class="collection-sidebar"><h2>Collection<span>1,337</span></h2><nav class="collection-tabs" aria-label="Collection view"><button class="collection-tab ${!favoritesOnly ? "active" : ""}" id="all-nfts">All</button><button class="collection-tab ${favoritesOnly ? "active" : ""}" id="saved-nfts">Saved <span id="saved-count">${favorites.size}</span></button></nav><button class="filter-toggle" id="toggle-filters" aria-label="Show filters" aria-expanded="false" aria-controls="collection-filters">☷</button><div class="collection-filters" id="collection-filters"><label for="trait-category">Trait</label><select id="trait-category" aria-label="Trait category">${Object.keys(
      data.items[0].traits,
    )
      .map(
        (name) =>
          `<option ${name === traitName ? "selected" : ""}>${esc(name)}</option>`,
      )
      .join(
        "",
      )}</select><label for="body-filter">${esc(traitName)}</label><select id="body-filter"><option value="">All types</option>${[
      ...new Set(data.items.map((i) => i.traits[traitName])),
    ]
      .sort()
      .map(
        (value) =>
          `<option ${value === trait ? "selected" : ""} value="${esc(value)}">${esc(value)}</option>`,
      )
      .join(
        "",
      )}</select></div><button class="shuffle-button" id="random-nft" aria-label="Pick a random Glorp">Shuffle</button><div class="collection-source"><a href="https://howrare.is/glorp" target="_blank" rel="noopener noreferrer">Metadata by HowRare ↗</a></div></aside><div class="collection-main"><header class="collection-toolbar"><input type="search" id="nft-search" aria-label="Search collection" placeholder="Search Glorps" value="${esc(query)}"/><select id="nft-sort" aria-label="Sort collection"><option value="number">Number</option><option value="rarity" ${sort === "rarity" ? "selected" : ""}>HowRare rank</option></select></header><div class="collection-summary"><span id="collection-count"></span></div><div id="nft-grid" class="nft-grid"></div><footer class="collection-pagination"><span id="page-label"></span><button id="prev-page" aria-label="Previous page">←</button><button id="next-page" aria-label="Next page">→</button></footer></div><aside id="nft-detail" class="nft-detail" role="dialog" aria-modal="true" aria-label="NFT details" hidden></aside></section>`;
    renderGrid();
    root.querySelector(".collection-app")!.classList.toggle("filters-open", filtersOpen);
    const filterButton = root.querySelector<HTMLButtonElement>("#toggle-filters")!;
    filterButton.setAttribute("aria-expanded", String(filtersOpen));
    filterButton.setAttribute("aria-label", filtersOpen ? "Hide filters" : "Show filters");
    filterButton.onclick = () => {
      filtersOpen = !filtersOpen;
      root.querySelector(".collection-app")!.classList.toggle("filters-open", filtersOpen);
      filterButton.setAttribute("aria-expanded", String(filtersOpen));
      filterButton.setAttribute("aria-label", filtersOpen ? "Hide filters" : "Show filters");
    };
    if (selected) renderDetail(selected);
    root.querySelector<HTMLInputElement>("#nft-search")!.oninput = (e) => {
      query = (e.target as HTMLInputElement).value.trim();
      page = 0;
      renderGrid();
    };
    root.querySelector<HTMLSelectElement>("#trait-category")!.onchange = (
      e,
    ) => {
      traitName = (e.target as HTMLSelectElement).value;
      trait = "";
      page = 0;
      render();
    };
    root.querySelector<HTMLSelectElement>("#body-filter")!.onchange = (e) => {
      trait = (e.target as HTMLSelectElement).value;
      page = 0;
      renderGrid();
    };
    root.querySelector<HTMLSelectElement>("#nft-sort")!.onchange = (e) => {
      sort = (e.target as HTMLSelectElement).value;
      page = 0;
      renderGrid();
    };
    root.querySelector("#all-nfts")!.addEventListener("click", () => {
      favoritesOnly = false;
      page = 0;
      render();
    });
    root.querySelector("#saved-nfts")!.addEventListener("click", () => {
      favoritesOnly = true;
      page = 0;
      render();
    });
    root.querySelector("#random-nft")!.addEventListener("click", () => {
      const list = results();
      if (!list.length) {
        notify("No matches. Reset your filters first.");
        return;
      }
      renderDetail(list[Math.floor(Math.random() * list.length)]);
      root.querySelector<HTMLButtonElement>("#close-detail")?.focus();
      playSound("open");
    });
    root.querySelector("#prev-page")!.addEventListener("click", () => {
      page--;
      renderGrid();
      root.querySelector("#nft-grid")!.scrollTop = 0;
    });
    root.querySelector("#next-page")!.addEventListener("click", () => {
      page++;
      renderGrid();
      root.querySelector("#nft-grid")!.scrollTop = 0;
    });
  }
  root.addEventListener("click", handleClick);
  root.addEventListener("keydown", handleKey);
  function handleKey(event: KeyboardEvent) {
    if (event.key === "Tab" && selected) {
      const controls = [...root.querySelectorAll<HTMLElement>("#nft-detail button,#nft-detail a")].filter((el) => el.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    if (event.key === "Escape" && selected) {
      event.stopPropagation();
      root.querySelector<HTMLButtonElement>("#close-detail")?.click();
    }
  }
  function handleClick(event: MouseEvent) {
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-nft],[data-favorite]",
    );
    if (!target || !data) return;
    if (target.dataset.favorite)
      toggleFavorite(Number(target.dataset.favorite));
    else {
      const item = data.items.find((i) => i.id === Number(target.dataset.nft));
      if (item) {
        renderDetail(item);
        playSound("open");
        root.querySelector<HTMLButtonElement>("#close-detail")?.focus();
      }
    }
  }
  async function load() {
    try {
      data = await getCatalog();
      if (alive) render();
    } catch {
      if (!alive) return;
      root.innerHTML =
        '<section class="program collection-empty"><h2>Collection unavailable</h2><p>The catalog could not be loaded.</p><button class="primary" id="retry-collection">Try again</button></section>';
      root.querySelector("#retry-collection")!.addEventListener("click", load);
    }
  }
  void load();
  return () => {
    alive = false;
    root.removeEventListener("click", handleClick);
    root.removeEventListener("keydown", handleKey);
  };
}

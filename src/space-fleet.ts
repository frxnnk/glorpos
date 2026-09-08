import { getCatalog } from "./catalog";
import "./space-fleet.css";

// Reuse the same fleet when startup gives way to the desktop.
export function createSpaceFleet() {
  const fleet = document.createElement("div");
  fleet.className = "space-fleet";
  fleet.setAttribute("aria-hidden", "true");
  const flights = [
    { nft: 1, lane: 13, size: 176, duration: 72, delay: -12, rest: 9 },
    { nft: 2, lane: 64, size: 152, duration: 92, delay: -62, rest: 76 },
    { nft: 5, lane: 81, size: 132, duration: 106, delay: -33, rest: 19 },
    { nft: 1, lane: 32, size: 122, duration: 124, delay: -98, rest: 84 },
    { nft: 2, lane: 51, size: 102, duration: 138, delay: -71, rest: 4 },
  ];
  fleet.innerHTML = flights.map((flight, index) => {
    const id = `fleet-${index}`;
    return `<div class="spacecraft ${index % 2 ? "reverse" : ""}" data-pilot="${flight.nft}" style="--lane:${flight.lane}%;--ship-size:${flight.size}px;--duration:${flight.duration}s;--delay:${flight.delay}s;--rest:${flight.rest}vw;--bob-delay:${-index * 1.8}s">
      <div class="spacecraft-shell"><svg viewBox="0 0 200 145" focusable="false">
        <defs>
          <linearGradient id="${id}-hull" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a8b9ad"/><stop offset=".35" stop-color="#536d64"/><stop offset="1" stop-color="#142c2b"/></linearGradient>
          <linearGradient id="${id}-rim" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#bcd2b8"/><stop offset=".5" stop-color="#4a716a"/><stop offset="1" stop-color="#142925"/></linearGradient>
          <linearGradient id="${id}-glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b5e4d7" stop-opacity=".28"/><stop offset=".48" stop-color="#91c4bd" stop-opacity="0"/><stop offset="1" stop-color="#408677" stop-opacity=".3"/></linearGradient>
          <linearGradient id="${id}-exhaust" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#bdeba5" stop-opacity=".38"/><stop offset="1" stop-color="#8dccb4" stop-opacity="0"/></linearGradient>
          <clipPath id="${id}-cabin"><path d="M58 83V65a42 42 0 0 1 84 0v18Z"/></clipPath>
        </defs>
        <path class="ship-exhaust" d="M67 105 79 139Q100 150 121 139L133 105Z" fill="url(#${id}-exhaust)"/>
        <ellipse cx="100" cy="104" rx="48" ry="13" fill="#17362c"/>
        <ellipse cx="100" cy="111" rx="25" ry="4" fill="#c1e89c" opacity=".6"/>
        <path d="M17 87Q100 64 183 87Q169 116 100 117Q31 116 17 87Z" fill="url(#${id}-hull)" stroke="#91b2a0" stroke-opacity=".45"/>
        <path d="M55 83V64a45 45 0 0 1 90 0v19" fill="#122b27" stroke="#97c1b5" stroke-opacity=".65" stroke-width="1.4"/>
        <g clip-path="url(#${id}-cabin)"><image class="ship-pilot" href="/glorp-hd.png" x="55" y="13" width="90" height="90" preserveAspectRatio="xMidYMid slice"/></g>
        <path d="M55 83V64a45 45 0 0 1 90 0v19Z" fill="url(#${id}-glass)"/>
        <path d="M63 54Q68 31 84 28" fill="none" stroke="#d7f5e8" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="100" cy="87" rx="87" ry="15" fill="url(#${id}-rim)" stroke="#a0c9b0" stroke-opacity=".55"/>
        <path d="M17 86Q100 107 183 86" fill="none" stroke="#15312c" stroke-width="2"/>
        <ellipse cx="100" cy="82" rx="45" ry="5" fill="#91ac90" opacity=".38"/>
        <g fill="#d5edb2"><ellipse cx="41" cy="91" rx="5" ry="2"/><ellipse cx="70" cy="97" rx="5" ry="2"/><ellipse cx="101" cy="99" rx="5" ry="2"/><ellipse cx="132" cy="97" rx="5" ry="2"/><ellipse cx="160" cy="91" rx="5" ry="2"/></g>
      </svg></div>
    </div>`;
  }).join("");

  const syncVisibility = () => fleet.classList.toggle("flight-paused", document.hidden);
  document.addEventListener("visibilitychange", syncVisibility);
  syncVisibility();
  const pilots = [...fleet.querySelectorAll<SVGImageElement>(".ship-pilot")];
  let disposed = false;
  void getCatalog().then((catalog) => {
    if (disposed) return;
    pilots.forEach((image, index) => {
      const nft = catalog.items.find((item) => item.id === flights[index].nft);
      if (!nft) return;
      image.onerror = () => {
        image.onerror = null;
        image.setAttribute("href", "/glorp-hd.png");
      };
      image.setAttribute("href", nft.image);
      image.setAttribute("data-nft-name", nft.name);
    });
  }).catch(() => { /* The local mascot is already in every cockpit. */ });

  if (import.meta.hot) import.meta.hot.dispose(() => {
    disposed = true;
    document.removeEventListener("visibilitychange", syncVisibility);
    pilots.forEach((image) => { image.onerror = null; });
    fleet.remove();
  });
  return fleet;
}

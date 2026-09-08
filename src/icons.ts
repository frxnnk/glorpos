const paths: Record<string, string> = {
  x: '<path d="m5 3 14 18h-4L1 3h4Zm14 0L5 21"/>',
  telegram: '<path d="m21 3-4 18-6-5-4 3v-6L2 11l19-8ZM7 13l10-6-6 9"/>',
  marketplace: '<path d="M3 20V5l5 7 5-7v15M17 5h5M17 12h4M17 20h5M17 5v15"/>',
  chart: '<path d="M3 3v18h18M6 15l4-5 4 3 6-8M16 5h4v4"/>',
  links: '<path d="M10 14l4-4M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0M16 8l1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0"/>',
  collection:
    '<rect x="3" y="3" width="7" height="8" rx="1"/><rect x="14" y="3" width="7" height="8" rx="1"/><path d="M3 15h7v6H3zM14 15h7v6h-7z"/>',
  about: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  sound: '<path d="m11 4-6 5H2v6h3l6 5ZM15 8c3 2 3 6 0 8M18 4c6 4 6 12 0 16"/>',
  mute: '<path d="m11 4-6 5H2v6h3l6 5ZM16 9l5 6M21 9l-5 6"/>',
  welcome:
    '<path d="m12 3 2.8 6.2L21 12l-6.2 2.8L12 21l-2.8-6.2L3 12l6.2-2.8Z"/>',
  maker:
    '<path d="m4 20 12-12 4 4L8 24M5 2v6M2 5h6M18 2v4M16 4h4M20 17v5M17.5 19.5h5"/>',
  notes:
    '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
  arcade:
    '<path d="M7 7h10c2 0 3 2 4 8s-2 5-5 1H8c-3 4-6 5-5-1S5 7 7 7Z"/><path d="M7 10v5M4.5 12.5h5M16 11h.01M19 14h.01"/>',
  terminal:
    '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 9 3 3-3 3M13 15h4"/>',
  settings:
    '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/>',
  music:
    '<path d="M9 18V5l11-2v13M9 9l11-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="17" cy="16" rx="3" ry="3"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
  desktop:
    '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
};
export function icon(name: string) {
  return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.welcome}</svg>`;
}

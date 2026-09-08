import type WinBox from "winbox/src/js/winbox.js";

export type Geometry = { x: number; y: number; width: number; height: number };
export type Viewport = Geometry & { compact: boolean; short: boolean; bottom: number };

export function viewport(): Viewport {
  const visual = window.visualViewport;
  const useVisual = visual && visual.scale === 1;
  const width = Math.floor(useVisual ? visual.width : innerWidth);
  const height = Math.floor(useVisual ? visual.height : innerHeight);
  const left = useVisual ? visual.offsetLeft : 0;
  const top = useVisual ? visual.offsetTop : 0;
  const short = height < 500;
  const compact = width < 760 || short;
  const inset = compact ? 6 : 12;
  const header = short ? 50 : compact ? 54 : 60;
  const bottom = short ? 62 : compact ? 82 : 88;
  const root = document.documentElement;
  root.classList.toggle("compact", compact);
  root.classList.toggle("short-viewport", short);
  root.style.setProperty("--viewport-height", `${height}px`);
  root.style.setProperty("--viewport-top", `${top}px`);
  root.style.setProperty("--workspace-top", `${top + header}px`);
  root.style.setProperty("--workspace-bottom", `${bottom}px`);
  return {
    compact,
    short,
    bottom,
    x: left + inset,
    y: top + header,
    width: Math.max(1, width - inset * 2),
    height: Math.max(1, height - header - bottom),
  };
}

export function fitGeometry(area: Viewport, preferred: Partial<Geometry>): Geometry {
  if (area.compact) return area;
  const width = Math.min(area.width, Math.max(330, Number(preferred.width) || 700));
  const height = Math.min(area.height, Math.max(240, Number(preferred.height) || 560));
  return {
    width,
    height,
    x: Math.max(area.x, Math.min(Number(preferred.x) || (area.width - width) / 2 + area.x, area.x + area.width - width)),
    y: Math.max(area.y, Math.min(Number(preferred.y) || area.y + 28, area.y + area.height - height)),
  };
}

export function applyGeometry(win: WinBox, area: Viewport, preferred: Partial<Geometry>) {
  const next = fitGeometry(area, preferred);
  win.minwidth = Math.min(330, area.width);
  win.minheight = Math.min(240, area.height);
  win.top = area.y;
  win.bottom = Math.max(0, innerHeight - area.y - area.height);
  win.restore().resize(next.width, next.height).move(next.x, next.y);
}

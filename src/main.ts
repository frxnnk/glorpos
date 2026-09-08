import WinBox from "winbox/src/js/winbox.js";
import "winbox/dist/css/winbox.min.css";
import "./style.css";
import "./desktop.css";
import "./collection.css";
import { apps, mountApp } from "./programs";
import { read, save } from "./storage";
import { icon } from "./icons";
import { boot } from "./boot";
import { playSound, setSoundEnabled, soundState, unlockSound } from "./sound";
import { setupLauncher } from "./launcher";
import { applyGeometry, fitGeometry, viewport } from "./window-layout";
import type { Geometry } from "./window-layout";

const windows = new Map<string, WinBox>();
const mobile = () => viewport().compact;
let activeAppId = "";
let applyingLayout = false;
const app = document.querySelector<HTMLDivElement>("#app")!;
document.documentElement.dataset.theme = read("theme", "moss");
document.documentElement.classList.toggle(
  "reduce-motion",
  read("reduced-motion", false),
);
app.innerHTML = `<header class="menubar"><button class="brand" data-open="welcome" aria-label="Home"><img src="/glorp-hd.png" alt=""/>glorp<span>OS</span></button><nav aria-label="Desktop"><button id="launcher-button">Applications</button><button data-open="about">About Glorp</button></nav><div class="system"><button id="sound-toggle" aria-label="Mute sound">${icon("sound")}</button><button data-open="settings" aria-label="Settings">${icon("settings")}</button><time id="clock"></time></div></header>
<main class="desktop" aria-label="Desktop"></main>
<footer class="dock" aria-label="Applications"><button id="dock-launcher" aria-label="Search apps" data-tooltip="Search apps">${icon("grid")}<span class="dock-label">Search</span></button><div class="dock-divider"></div>${apps.map((a) => `<button data-open="${a.id}" aria-label="${a.title}" data-tooltip="${a.title}">${icon(a.id)}<span class="dock-label">${a.title}</span><span class="running-dot"></span></button>`).join("")}<div class="dock-divider"></div><button id="show-desktop" aria-label="Show desktop" data-tooltip="Show desktop">${icon("desktop")}<span class="dock-label">Desktop</span></button></footer>
<dialog id="launcher" aria-label="App search"><div class="search-head">${icon("search")}<input id="search" aria-label="Search apps" placeholder="Open an app…" autocomplete="off"/><button id="close-launcher" aria-label="Close search">Esc</button></div><div id="search-results"></div><footer>↑ ↓ select <span>Enter open</span><kbd>Ctrl / ⌘ K</kbd></footer></dialog><div id="toast" role="status"></div>`;
let toastTimer: ReturnType<typeof setTimeout>;
export function notify(message: string) {
  const toast = document.querySelector<HTMLElement>("#toast")!;
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2800);
}
function updateDock() {
  document.querySelectorAll<HTMLElement>(".dock [data-open]").forEach((el) => {
    el.classList.toggle("running", windows.has(el.dataset.open!));
    el.classList.toggle(
      "active-app",
      Boolean(windows.get(el.dataset.open!)?.focused && !windows.get(el.dataset.open!)?.hidden),
    );
  });
}
function persistSession() {
  save(
    "session",
    [...windows.keys()].filter((id) => id !== "welcome"),
  );
}
function geometry(win: WinBox, id: string) {
  if (applyingLayout || wasMobile || mobile() || win.max || win.min) return;
  save(`window-${id}`, {
    x: win.x,
    y: win.y,
    width: win.width,
    height: win.height,
  });
}
function openApp(id: string) {
  const existing = windows.get(id);
  if (existing) {
    if (mobile())
      windows.forEach((w) => {
        if (w !== existing) w.hide();
      });
    existing.show();
    existing.focus();
    existing.body.focus({ preventScroll: true });
    activeAppId = id;
    updateDock();
    return;
  }
  const info = apps.find((a) => a.id === id);
  if (!info) return;
  const area = viewport();
  if (area.compact) windows.forEach((w) => w.hide());
  const previous = read<Partial<Geometry>>(`window-${id}`, {}) || {};
  const { width, height, x, y } = fitGeometry(area, { width: info.width, height: info.height, ...previous });
  let cleanup = () => {};
  const win = new WinBox({
    title: info.title,
    id: `window-${id}`,
    width,
    height,
    x,
    y,
    top: area.y,
    bottom: Math.max(0, innerHeight - area.y - area.height),
    minwidth: Math.min(330, area.width),
    minheight: Math.min(240, area.height),
    header: 42,
    class: [
      "glorp-window",
      "no-full",
      ...(mobile() ? ["no-resize", "no-move", "no-max"] : []),
    ],
    onclose() {
      cleanup();
      windows.delete(id);
      persistSession();
      updateDock();
      playSound("close");
      document
        .querySelector<HTMLButtonElement>(`.dock [data-open="${id}"]`)
        ?.focus();
      return false;
    },
    onminimize() {
      this.restore().hide();
      updateDock();
      document.querySelector<HTMLButtonElement>(`.dock [data-open="${id}"]`)?.focus();
      playSound("close");
    },
    onfocus() {
      activeAppId = id;
      queueMicrotask(updateDock);
    },
    onblur() {
      queueMicrotask(updateDock);
    },
    onmove() {
      geometry(this, id);
    },
    onresize() {
      geometry(this, id);
    },
  });
  windows.set(id, win);
  win.dom.setAttribute("role", "dialog");
  win.dom.setAttribute("aria-label", info.title);
  for (const [control, label] of [
    ["min", "Minimize"],
    ["max", "Maximize"],
    ["close", "Close"],
  ]) {
    const button = win.dom.querySelector<HTMLElement>(`.wb-${control}`);
    if (button) {
      button.setAttribute("role", "button");
      button.tabIndex = 0;
      button.setAttribute("aria-label", `${label} ${info.title}`);
      button.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          button.click();
        }
      };
    }
  }
  const tile = document.createElement("div");
  tile.className = "window-tiles";
  tile.innerHTML =
    '<button aria-label="Tile window left" title="Tile left">◧</button><button aria-label="Tile window right" title="Tile right">◨</button>';
  tile.querySelectorAll("button").forEach(
    (button, index) =>
      (button.onclick = () => {
        const area = viewport();
        if (area.compact) return;
        const width = Math.floor((area.width - 10) / 2);
        applyGeometry(win, area, { width, height: area.height, x: area.x + (index ? width + 10 : 0), y: area.y });
      }),
  );
  win.dom.querySelector(".wb-header")?.append(tile);
  cleanup = mountApp(id, win.body, openApp, notify);
  updateDock();
  persistSession();
  playSound("open");
  win.body.tabIndex = -1;
  win.body.focus({ preventScroll: true });
}
document.addEventListener("click", (event) => {
  const trigger = (event.target as HTMLElement).closest<HTMLElement>(
    "[data-open]",
  );
  if (trigger) openApp(trigger.dataset.open!);
});
document.addEventListener("click", (event) => {
  const button = (event.target as HTMLElement).closest("button");
  if (
    button &&
    !button.closest(".boot-screen") &&
    !button.matches("[data-open],.desktop-pet,#sound-toggle,[data-favorite]")
  )
    playSound("tap");
});
setupLauncher(apps, openApp);
let desktopRestoreIds: string[] = [];
document.querySelector("#show-desktop")!.addEventListener("click", () => {
  const visible = [...windows.entries()].filter(([, w]) => !w.hidden);
  if (visible.length) {
    desktopRestoreIds = visible.map(([id]) => id);
    windows.forEach((w) => w.hide());
  } else if (mobile()) {
    const id = windows.has(activeAppId) ? activeAppId : [...windows.keys()].at(-1);
    if (id) openApp(id);
  } else {
    const ids = desktopRestoreIds.length ? desktopRestoreIds : [...windows.keys()];
    ids.forEach((id) => windows.get(id)?.show());
    windows.get(activeAppId)?.focus();
  }
  updateDock();
});
const soundButton = document.querySelector<HTMLButtonElement>("#sound-toggle")!;
function updateSound() {
  soundButton.setAttribute(
    "aria-label",
    soundState().enabled ? "Mute sound" : "Enable sound",
  );
  soundButton.setAttribute("aria-pressed", String(soundState().enabled));
  soundButton.innerHTML = icon(soundState().enabled ? "sound" : "mute");
}
soundButton.onclick = async () => {
  await unlockSound();
  setSoundEnabled(!soundState().enabled);
  playSound("tap");
};
document.addEventListener("glorp:sound", updateSound);
updateSound();
document.addEventListener("glorp:secret", () => {
  document.body.classList.toggle("alien-mode");
  playSound("secret");
  notify(
    document.body.classList.contains("alien-mode")
      ? "Alien mode enabled."
      : "Back to Earth.",
  );
});
function tick() {
  document.querySelector("#clock")!.textContent = new Date().toLocaleTimeString(
    "en-GB",
    { hour: "2-digit", minute: "2-digit" },
  );
}
tick();
setInterval(tick, 1000);
let wasMobile = mobile();
function resizeWindows() {
  const area = viewport();
  const visible = [...windows.values()].filter((w) => !w.hidden);
  const active = visible.find((w) => w.focused) || visible.at(-1);
  applyingLayout = true;
  windows.forEach((w, id) => {
    if (area.compact) {
      applyGeometry(w, area, area);
      w.addClass("no-resize").addClass("no-move").addClass("no-max");
      if (w !== active) w.hide();
    } else {
      w.removeClass("no-resize").removeClass("no-move").removeClass("no-max");
      const info = apps.find((a) => a.id === id)!;
      const preferred = wasMobile
        ? { width: info.width, height: info.height, ...(read<Partial<Geometry>>(`window-${id}`, {}) || {}) }
        : { width: w.width, height: w.height, x: w.x, y: w.y };
      applyGeometry(w, area, preferred);
    }
  });
  applyingLayout = false;
  wasMobile = area.compact;
  updateDock();
}
let resizeFrame = 0;
function scheduleResize() {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(resizeWindows);
}
window.addEventListener("resize", scheduleResize);
window.visualViewport?.addEventListener("resize", scheduleResize);
window.visualViewport?.addEventListener("scroll", scheduleResize);
void boot(() => openApp("about"));

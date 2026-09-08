import { getCatalog } from "./catalog";
import { icon } from "./icons";
import { createSpaceFleet } from "./space-fleet";
import { playSound, setSoundEnabled, soundState, unlockSound } from "./sound";

export async function boot(start: () => void) {
  const screen = document.createElement("div");
  screen.className = "boot-screen";
  screen.setAttribute("role", "dialog");
  screen.setAttribute("aria-modal", "true");
  screen.setAttribute("aria-label", "Start GlorpOS");
  const links = [
    ["x", "Glorp on X", "https://x.com/glorpcatsol"],
    ["telegram", "Glorp on Telegram", "https://t.me/GlorpCat"],
    ["marketplace", "Glorp on Magic Eden", "https://magiceden.io/marketplace/glorp"],
    ["chart", "Glorp on Dexscreener", "https://dexscreener.com/solana/gzqckvytrfnuipuks5swypufb2fhqhcjazpkgywuntng"],
    ["links", "Official Glorp links", "https://linktr.ee/glorpcat"],
  ];
  screen.innerHTML = `<div class="boot-center"><img src="/glorp-hd.png" alt="Glorp"/><h1>glorp<span>OS</span></h1><div class="boot-log" role="status"><span class="loading-dot"></span><span id="boot-status">Loading collection…</span></div><button class="primary boot-enter" disabled>Loading…</button><button class="boot-sound" aria-pressed="${soundState().enabled}"></button><nav class="boot-links" aria-label="Glorp links">${links.map(([name, label, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${label}" title="${label}">${icon(name)}</a>`).join("")}</nav></div>`;
  document.body.append(screen);
  const fleet = createSpaceFleet();
  screen.prepend(fleet);
  document.querySelector<HTMLElement>("#app")!.inert = true;
  const sound = screen.querySelector<HTMLButtonElement>(".boot-sound")!;
  function updateSound() {
    const enabled = soundState().enabled;
    sound.innerHTML = icon(enabled ? "sound" : "mute");
    sound.setAttribute("aria-pressed", String(enabled));
    sound.setAttribute("aria-label", enabled ? "Mute sound" : "Enable sound");
    sound.title = enabled ? "Mute sound" : "Enable sound";
  }
  updateSound();
  sound.onclick = () => {
    setSoundEnabled(!soundState().enabled);
    updateSound();
  };
  const button = screen.querySelector<HTMLButtonElement>(".boot-enter")!;
  try {
    await getCatalog();
    screen.querySelector<HTMLElement>(".boot-log")!.hidden = true;
  } catch {
    screen.querySelector("#boot-status")!.textContent =
      "Collection unavailable. You can retry inside.";
  }
  button.disabled = false;
  button.textContent = "Enter GlorpOS";
  button.focus();
  button.onclick = async () => {
    button.disabled = true;
    await unlockSound();
    playSound("boot");
    document.querySelector(".desktop")!.append(fleet);
    screen.classList.add("boot-exit");
    document.querySelector<HTMLElement>("#app")!.inert = false;
    start();
    setTimeout(() => screen.remove(), 400);
  };
}

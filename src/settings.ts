import { save, read } from "./storage";
import {
  soundState,
  setSoundEnabled,
  setVolume,
  unlockSound,
  playSound,
} from "./sound";
export function mountSettings(
  root: HTMLElement,
  notify: (message: string) => void,
) {
  root.innerHTML = `<section class="program"><h2>Settings</h2><h3>Appearance</h3><div class="theme-list">${[
    ["moss", "Moss", "#3a4930"],
    ["ink", "Ink", "#29384c"],
    ["clay", "Clay", "#604435"],
  ]
    .map(
      ([theme, label, color]) =>
        `<button data-theme="${theme}" style="--swatch:${color}" aria-pressed="${document.documentElement.dataset.theme === theme}">${label}</button>`,
    )
    .join(
      "",
    )}</div><h3>Sound</h3><label class="switch-row">Interface sounds<input type="checkbox" id="sound-setting" ${soundState().enabled ? "checked" : ""}/></label><label for="volume-setting">Volume <span id="volume-label">${Math.round(soundState().volume * 100)}%</span></label><input type="range" id="volume-setting" min="0" max="100" value="${soundState().volume * 100}"/><button class="secondary" id="test-sound">Play test sound</button><h3>Motion</h3><label class="switch-row">Reduce motion<input type="checkbox" id="reduce-motion" ${read("reduced-motion", false) ? "checked" : ""}/></label><p class="source-note">Your browser’s reduced-motion preference is also respected.</p><div class="welcome-rule"></div><p class="source-note">Notes, favorites and settings stay on this device. No account needed.</p></section>`;
  root.querySelectorAll<HTMLButtonElement>("[data-theme]").forEach(
    (button) =>
      (button.onclick = () => {
        document.documentElement.dataset.theme = button.dataset.theme;
        if (!save("theme", button.dataset.theme))
          notify("Theme changed, but could not be saved.");
        root
          .querySelectorAll("[data-theme]")
          .forEach((el) =>
            el.setAttribute("aria-pressed", String(el === button)),
          );
        playSound("tap");
      }),
  );
  root.querySelector<HTMLInputElement>("#sound-setting")!.onchange = async (
    e,
  ) => {
    await unlockSound();
    setSoundEnabled((e.target as HTMLInputElement).checked);
    playSound("tap");
  };
  root.querySelector<HTMLInputElement>("#volume-setting")!.oninput = (e) =>
    setVolume(Number((e.target as HTMLInputElement).value) / 100);
  root.querySelector("#test-sound")!.addEventListener("click", async () => {
    await unlockSound();
    if (!soundState().enabled) {
      notify("Turn sound on to hear the test.");
      return;
    }
    playSound("boot");
  });
  root.querySelector<HTMLInputElement>("#reduce-motion")!.onchange = (e) => {
    const value = (e.target as HTMLInputElement).checked;
    document.documentElement.classList.toggle("reduce-motion", value);
    save("reduced-motion", value);
  };
  const update = () => {
    root.querySelector<HTMLInputElement>("#sound-setting")!.checked =
      soundState().enabled;
    root.querySelector<HTMLInputElement>("#volume-setting")!.value = String(
      soundState().volume * 100,
    );
    root.querySelector("#volume-label")!.textContent =
      `${Math.round(soundState().volume * 100)}%`;
  };
  document.addEventListener("glorp:sound", update);
  return () => document.removeEventListener("glorp:sound", update);
}

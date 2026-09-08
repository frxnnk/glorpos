import { soundState, startRadio, stopRadio } from "./sound";
export function mountRadio(
  root: HTMLElement,
  notify: (message: string) => void,
) {
  root.innerHTML = `<section class="program music"><div class="music-disc"><span>g.</span></div><h2 id="track-title">Select a station.</h2><div class="radio-stations">${["Moss FM", "Low Orbit", "Night Shift"].map((title, i) => `<button data-station="${i}" aria-pressed="false"><span>0${i + 1}</span>${title}<b>▶</b></button>`).join("")}</div><button class="secondary radio-stop" id="stop-radio">Stop radio</button><details class="local-audio"><summary>Play a local file</summary><label for="audio-file">Choose audio</label><input id="audio-file" type="file" accept="audio/*"/><audio controls aria-label="Local audio player"></audio></details></section>`;
  const audio = root.querySelector("audio")!,
    input = root.querySelector<HTMLInputElement>("input")!;
  let url = "",
    localTitle = "",
    alive = true;
  root.querySelectorAll<HTMLButtonElement>("[data-station]").forEach(
    (button) =>
      (button.onclick = async () => {
        audio.pause();
        await startRadio(Number(button.dataset.station));
        if (alive) update();
      }),
  );
  root.querySelector("#stop-radio")!.addEventListener("click", () => {
    stopRadio();
    audio.pause();
  });
  function update() {
    const state = soundState();
    root
      .querySelector(".music-disc")!
      .classList.toggle(
        "playing",
        (state.radioTrack >= 0 || !audio.paused) && state.enabled,
      );
    root.querySelector("#track-title")!.textContent =
      state.radioTrack >= 0
        ? ["Moss FM", "Low Orbit", "Night Shift"][state.radioTrack]
        : localTitle || "Select a station.";
    root
      .querySelectorAll<HTMLButtonElement>("[data-station]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(Number(button.dataset.station) === state.radioTrack),
        ),
      );
    audio.muted = !state.enabled;
    audio.volume = state.volume;
  }
  document.addEventListener("glorp:sound", update);
  update();
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    stopRadio();
    audio.pause();
    if (url) URL.revokeObjectURL(url);
    url = URL.createObjectURL(file);
    audio.src = url;
    localTitle = file.name;
    update();
  };
  audio.onplay = () => {
    stopRadio();
    update();
  };
  audio.onpause = audio.onended = () =>
    root.querySelector(".music-disc")!.classList.remove("playing");
  audio.onerror = () => notify("This audio file could not be played.");
  return () => {
    alive = false;
    stopRadio();
    document.removeEventListener("glorp:sound", update);
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    if (url) URL.revokeObjectURL(url);
  };
}

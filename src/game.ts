import { read, save } from "./storage";
import { playSound } from "./sound";
import { createRound, FIELD_WIDTH, ROUND_SECONDS, sector, stepRound } from "./game-engine";
import { drawRound } from "./game-draw";
import "./game.css";

const heart = `<svg class="orbit-heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21 3.3 12.6C-2.5 6.8 6.1-1.1 12 5c5.9-6.1 14.5 1.8 8.7 7.6Z"/></svg>`;

export function mountArcade(root: HTMLElement) {
  const storedBest = Number(read("orbit-best-v2", 0));
  let best = Number.isFinite(storedBest) ? Math.max(0, storedBest) : 0;
  root.innerHTML = `<section class="orbit-game" aria-label="Orbit Collector">
    <header class="orbit-heading"><h2>Orbit Collector</h2><span class="orbit-best">Best <b data-best>${best}</b></span></header>
    <div class="orbit-hud"><strong class="orbit-score"><span data-score>0</span><span class="orbit-combo" data-combo>×1</span></strong><span class="orbit-health" aria-label="3 lives remaining">${heart.repeat(3)}</span><span class="orbit-time" data-time>60s</span></div>
    <div class="orbit-stage"><canvas tabindex="0" aria-label="Game field. Move with arrow keys, A and D, or drag. Space pauses the game."></canvas><span class="orbit-status" data-shield></span>
      <div class="orbit-overlay" data-overlay><img src="/glorp-hd.png" alt="" data-mascot><h3 data-title>How to play</h3><div class="orbit-result" data-result hidden></div><p data-description>Catch fish. Dodge asteroids.<br>Three lives. Sixty seconds.</p><div class="orbit-overlay-actions"><button class="orbit-primary" data-start>Play</button><button class="orbit-secondary" data-restart hidden>Restart</button></div></div>
    </div>
    <div class="orbit-footer"><span class="orbit-sector" data-sector>Sector 1 / 3</span><div class="orbit-progress" role="progressbar" aria-label="Round progress" aria-valuemin="0" aria-valuemax="60" aria-valuenow="0"><span></span></div></div>
    <div class="orbit-controls"><p class="orbit-help">Drag or use arrows.<br>Shields block one hit.</p><div class="orbit-touch"><button data-left aria-label="Move left">←</button><button data-right aria-label="Move right">→</button></div><button data-pause aria-label="Pause game" disabled>Pause</button></div><span class="orbit-sr" role="status" aria-live="polite" data-announcement></span>
  </section>`;
  const query = <T extends HTMLElement>(name: string) => root.querySelector<T>(`[data-${name}]`)!;
  const canvas = root.querySelector("canvas")!, ctx = canvas.getContext("2d")!;
  const stage = root.querySelector<HTMLElement>(".orbit-stage")!;
  const overlay = query("overlay"), start = query<HTMLButtonElement>("start");
  const pause = query<HTMLButtonElement>("pause"), restart = query<HTMLButtonElement>("restart");
  const progress = root.querySelector<HTMLElement>(".orbit-progress")!;
  const keys = new Set<string>();
  const controller = new AbortController(), options = { signal: controller.signal };
  const image = new Image();
  let round = createRound(), state: "ready" | "playing" | "paused" | "finished" = "ready";
  let frame = 0, last = 0, alive = true, target: number | null = null;
  let lastHud = "", lastSector = 1;

  function render() {
    const reduce = document.documentElement.classList.contains("reduce-motion") || document.body.classList.contains("reduce-motion") || matchMedia("(prefers-reduced-motion: reduce)").matches;
    drawRound(ctx, round, image, reduce);
  }
  function resize() {
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const height = Math.max(180, FIELD_WIDTH * rect.height / rect.width);
    round.drops.forEach((drop) => { drop.y *= height / round.height; });
    round.height = height;
    const scale = Math.min(devicePixelRatio || 1, 3);
    canvas.width = Math.round(rect.width * scale);
    canvas.height = Math.round(rect.height * scale);
    ctx.setTransform(canvas.width / FIELD_WIDTH, 0, 0, canvas.height / round.height, 0, 0);
    render();
  }
  function updateHud() {
    const seconds = Math.max(0, Math.ceil(ROUND_SECONDS - round.elapsed));
    const signature = `${round.score}:${round.combo}:${round.lives}:${seconds}:${Math.ceil(round.shield)}`;
    if (signature === lastHud) return;
    lastHud = signature;
    query("score").textContent = String(round.score);
    query("combo").textContent = `×${round.combo}`;
    query("combo").classList.toggle("active", round.combo > 1);
    query("time").textContent = `${seconds}s`;
    query("sector").textContent = `Sector ${sector(round)} / 3`;
    query("shield").textContent = round.shield ? `Shield · ${Math.ceil(round.shield)}s` : "";
    progress.setAttribute("aria-valuenow", String(Math.floor(round.elapsed)));
    progress.firstElementChild!.setAttribute("style", `width:${round.elapsed / ROUND_SECONDS * 100}%`);
    root.querySelector(".orbit-health")!.setAttribute("aria-label", `${round.lives} lives remaining`);
    root.querySelectorAll(".orbit-heart").forEach((element, index) => element.classList.toggle("lost", index >= round.lives));
  }
  function finish() {
    state = "finished";
    cancelAnimationFrame(frame);
    best = Math.max(best, round.score); save("orbit-best-v2", best);
    query("best").textContent = String(best);
    query("title").textContent = round.lives ? "Round complete" : "Out of lives";
    query("result").hidden = false; query("result").textContent = String(round.score);
    query("description").textContent = `${round.caught} fish · Best combo ×${round.bestCombo}`;
    query("mascot").hidden = true; restart.hidden = true;
    start.textContent = "Play again"; pause.disabled = true;
    overlay.hidden = false;
    query("announcement").textContent = `${round.lives ? "Round complete" : "Out of lives"}. ${round.score} points. ${round.caught} fish. Best score ${best}.`;
    playSound("favorite"); start.focus({ preventScroll: true });
  }
  function setPaused(value: boolean) {
    if (state !== "playing" && state !== "paused") return;
    state = value ? "paused" : "playing";
    keys.clear(); target = null; round.velocity = 0;
    pause.textContent = value ? "Resume" : "Pause";
    pause.setAttribute("aria-label", value ? "Resume game" : "Pause game");
    overlay.hidden = !value;
    if (value) {
      cancelAnimationFrame(frame);
      query("title").textContent = "Paused"; query("result").hidden = true;
      query("mascot").hidden = true; query("description").textContent = "";
      start.textContent = "Resume"; restart.hidden = false;
      query("announcement").textContent = "Game paused.";
    } else {
      canvas.focus({ preventScroll: true }); last = performance.now();
      frame = requestAnimationFrame(loop);
    }
    render();
  }
  function loop(time: number) {
    if (!alive || state !== "playing") return;
    if (document.hidden || !root.getClientRects().length || root.closest(".winbox.min")) { setPaused(true); return; }
    const dt = Math.min((time - last) / 1000, 0.04); last = time;
    const axis = Number(keys.has("right")) - Number(keys.has("left"));
    for (const event of stepRound(round, dt, axis, target)) {
      if (event === "finish") finish();
      else if (event === "hit") { playSound("error"); query("announcement").textContent = `${round.lives} lives remaining.`; }
      else if (event === "shield") { playSound("secret"); query("announcement").textContent = "Shield ready."; }
      else playSound(event === "collect" ? "collect" : "favorite");
    }
    if (sector(round) !== lastSector) { lastSector = sector(round); query("announcement").textContent = `Sector ${lastSector}.`; }
    updateHud(); render();
    if (state === "playing") frame = requestAnimationFrame(loop);
  }
  function begin() {
    cancelAnimationFrame(frame); round = createRound(round.height);
    keys.clear(); target = null; lastHud = ""; lastSector = 1;
    state = "playing"; overlay.hidden = true; pause.disabled = false;
    pause.textContent = "Pause"; pause.setAttribute("aria-label", "Pause game");
    query("announcement").textContent = "Catch fish. Dodge asteroids. Three lives. Sixty seconds.";
    updateHud(); playSound("open"); canvas.focus({ preventScroll: true });
    last = performance.now(); frame = requestAnimationFrame(loop);
  }
  start.addEventListener("click", () => state === "paused" ? setPaused(false) : begin(), options);
  restart.addEventListener("click", begin, options);
  pause.addEventListener("click", () => setPaused(state !== "paused"), options);
  const direction = (key: string) => ["ArrowLeft", "a", "A"].includes(key) ? "left" : ["ArrowRight", "d", "D"].includes(key) ? "right" : "";
  canvas.addEventListener("keydown", (event) => {
    const dir = direction(event.key);
    if (dir) { event.preventDefault(); keys.add(dir); target = null; }
    if (event.code === "Space" && !event.repeat) { event.preventDefault(); setPaused(state !== "paused"); }
  }, options);
  canvas.addEventListener("keyup", (event) => keys.delete(direction(event.key)), options);
  canvas.addEventListener("blur", () => { keys.clear(); target = null; }, options);
  function point(event: PointerEvent) {
    if (state !== "playing") return;
    const rect = canvas.getBoundingClientRect();
    target = Math.max(30, Math.min(FIELD_WIDTH - 30, (event.clientX - rect.left) / rect.width * FIELD_WIDTH));
  }
  canvas.addEventListener("pointerdown", (event) => { canvas.focus({ preventScroll: true }); canvas.setPointerCapture(event.pointerId); point(event); }, options);
  canvas.addEventListener("pointermove", (event) => { if (event.pointerType === "mouse" || event.buttons) point(event); }, options);
  for (const dir of ["left", "right"] as const) {
    const button = query<HTMLButtonElement>(dir);
    button.addEventListener("pointerdown", (event) => { event.preventDefault(); button.setPointerCapture(event.pointerId); keys.add(dir); target = null; }, options);
    button.addEventListener("pointerup", () => keys.delete(dir), options);
    button.addEventListener("pointercancel", () => keys.delete(dir), options);
    button.addEventListener("lostpointercapture", () => keys.delete(dir), options);
    button.addEventListener("keydown", (event) => { if (event.code === "Space" || event.code === "Enter") { event.preventDefault(); keys.add(dir); target = null; } }, options);
    button.addEventListener("keyup", () => keys.delete(dir), options);
    button.addEventListener("blur", () => keys.delete(dir), options);
  }
  document.addEventListener("visibilitychange", () => { if (document.hidden) setPaused(true); }, options);
  window.addEventListener("blur", () => setPaused(true), options);
  const observer = new ResizeObserver(resize); observer.observe(stage);
  image.onload = () => { if (alive) render(); };
  image.onerror = () => { image.onerror = null; image.src = "/glorp.png"; };
  image.src = "/glorp-hd.png";
  const portrait = query<HTMLImageElement>("mascot");
  portrait.onerror = () => { portrait.onerror = null; portrait.src = "/glorp.png"; };
  resize(); updateHud();
  return () => { alive = false; cancelAnimationFrame(frame); observer.disconnect(); controller.abort(); image.onload = image.onerror = portrait.onerror = null; };
}

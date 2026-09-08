import { read, save } from "./storage";
export type Cue =
  | "tap"
  | "open"
  | "close"
  | "boot"
  | "favorite"
  | "collect"
  | "error"
  | "secret";
let context: AudioContext | undefined, master: GainNode | undefined;
let enabled = read("sound-enabled", true) === true;
let volume = Math.min(1, Math.max(0, Number(read("sound-volume", 0.3)) || 0));
let radioTimer: ReturnType<typeof setInterval> | undefined;
let radioTrack = -1;
let radioRequest = 0;
const active = new Set<OscillatorNode>();
export const soundState = () => ({
  enabled,
  volume,
  radioTrack,
  ready: context?.state === "running",
});
export async function unlockSound() {
  try {
    if (!context) {
      context = new AudioContext();
      master = context.createGain();
      master.gain.value = enabled ? volume : 0;
      master.connect(context.destination);
    }
    if (context.state === "suspended") await context.resume();
  } catch {
    enabled = false;
  }
}
function tone(
  frequency: number,
  duration: number,
  offset = 0,
  type: OscillatorType = "sine",
  level = 0.13,
) {
  if (!context || !master || context.state !== "running") return;
  const oscillator = context.createOscillator(),
    envelope = context.createGain();
  const now = context.currentTime + offset;
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  envelope.gain.setValueAtTime(0, now);
  envelope.gain.linearRampToValueAtTime(level, now + 0.015);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(envelope);
  envelope.connect(master);
  active.add(oscillator);
  oscillator.onended = () => {
    active.delete(oscillator);
    oscillator.disconnect();
    envelope.disconnect();
  };
  oscillator.start(now);
  oscillator.stop(now + duration + 0.03);
}
export function playSound(cue: Cue) {
  if (!enabled) return;
  if (cue === "tap") tone(800, 0.06, 0, "sine", 0.035);
  if (cue === "open") {
    tone(440, 0.16);
    tone(660, 0.22, 0.06);
  }
  if (cue === "close") {
    tone(440, 0.13);
    tone(280, 0.18, 0.04);
  }
  if (cue === "boot")
    [220, 330, 440, 660, 880].forEach((f, i) =>
      tone(f, 0.7, i * 0.085, "sine", 0.12),
    );
  if (cue === "favorite" || cue === "collect") {
    tone(880, 0.16, 0, "sine", 0.1);
    tone(1320, 0.2, 0.045, "sine", 0.09);
  }
  if (cue === "error") {
    tone(160, 0.17, 0, "triangle", 0.08);
    tone(130, 0.2, 0.09, "triangle", 0.06);
  }
  if (cue === "secret")
    [392, 494, 587, 784, 988].forEach((f, i) =>
      tone(f, 0.3, i * 0.09, "triangle", 0.1),
    );
}
function announce() {
  document.dispatchEvent(new CustomEvent("glorp:sound"));
}
export function setSoundEnabled(value: boolean) {
  enabled = value;
  save("sound-enabled", value);
  if (master && context)
    master.gain.setTargetAtTime(
      enabled ? volume : 0,
      context.currentTime,
      0.02,
    );
  announce();
}
export function setVolume(value: number) {
  volume = Math.min(1, Math.max(0, value));
  save("sound-volume", volume);
  if (master && context)
    master.gain.setTargetAtTime(
      enabled ? volume : 0,
      context.currentTime,
      0.02,
    );
  announce();
}
export function stopRadio() {
  radioRequest++;
  if (radioTimer) clearInterval(radioTimer);
  radioTimer = undefined;
  radioTrack = -1;
  active.forEach((osc) => {
    try {
      osc.stop();
    } catch {
      /* already stopped */
    }
  });
  announce();
}
export async function startRadio(track: number) {
  stopRadio();
  const request = radioRequest;
  await unlockSound();
  if (request !== radioRequest || !context || context.state !== "running")
    return;
  radioTrack = track;
  setSoundEnabled(true);
  let step = 0;
  const scales = [
    [130.81, 164.81, 196, 261.63, 329.63],
    [146.83, 174.61, 220, 293.66, 349.23],
    [110, 164.81, 220, 277.18, 329.63],
  ];
  const phrase = () => {
    const notes = scales[track] || scales[0];
    tone(notes[step % notes.length], 2.7, 0, "sine", 0.12);
    tone(notes[(step + 2) % notes.length] * 2, 1.6, 0.35, "sine", 0.035);
    step++;
  };
  phrase();
  radioTimer = setInterval(phrase, 1800);
  announce();
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden && radioTrack >= 0) stopRadio();
});

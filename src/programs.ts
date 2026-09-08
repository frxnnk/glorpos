import { icon } from "./icons";
import { read, save } from "./storage";
import { mountMaker } from "./maker";
import { mountArcade } from "./game";
import { mountCollection } from "./collection";
import { mountAbout } from "./profile";
import { mountRadio } from "./radio";
import { mountSettings } from "./settings";
import { playSound } from "./sound";

export const apps = [
  {
    id: "welcome",
    title: "Home",
    description: "Apps and shortcuts",
    width: 560,
    height: 460,
  },
  {
    id: "collection",
    title: "Collection",
    description: "Browse all 1,337 Glorps",
    width: 1050,
    height: 740,
  },
  {
    id: "about",
    title: "About Glorp",
    description: "The project, token and official links",
    width: 760,
    height: 660,
  },
  {
    id: "maker",
    title: "Maker",
    description: "Make a Glorp image",
    width: 740,
    height: 560,
  },
  {
    id: "arcade",
    title: "Arcade",
    description: "Orbit Collector",
    width: 640,
    height: 700,
  },
  {
    id: "notes",
    title: "Notes",
    description: "Saved on this device",
    width: 520,
    height: 500,
  },
  {
    id: "music",
    title: "Radio",
    description: "Ambient stations and local audio",
    width: 440,
    height: 590,
  },
  {
    id: "terminal",
    title: "Terminal",
    description: "Commands and a few secrets",
    width: 560,
    height: 470,
  },
  {
    id: "settings",
    title: "Settings",
    description: "Appearance, sound and motion",
    width: 530,
    height: 550,
  },
];
export function mountApp(
  id: string,
  root: HTMLElement,
  open: (id: string) => void,
  notify: (message: string) => void,
): () => void {
  if (id === "collection") return mountCollection(root, notify);
  if (id === "about") return mountAbout(root, open, notify);
  if (id === "maker") return mountMaker(root, notify);
  if (id === "arcade") return mountArcade(root);
  if (id === "music") return mountRadio(root, notify);
  if (id === "settings") return mountSettings(root, notify);
  if (id === "welcome")
    root.innerHTML = `<section class="program"><h2>Applications</h2><div class="app-cards">${apps
      .filter((a) =>
        ["collection", "about", "maker", "arcade", "music", "notes"].includes(
          a.id,
        ),
      )
      .map(
        (a) =>
          `<button class="app-card" data-open="${a.id}">${icon(a.id)}<strong>${a.title}</strong><small>${a.description}</small></button>`,
      )
      .join(
        "",
      )}</div></section>`;
  if (id === "notes") {
    root.innerHTML =
      '<section class="program notes"><div class="notes-heading"><h2>Notes</h2><button class="secondary" id="export-notes">Export .txt</button></div><textarea aria-label="Your notes" placeholder="Write something…"></textarea><span class="notes-status" role="status">Saved on this device</span></section>';
    const area = root.querySelector("textarea")!;
    area.value = read("notes", "");
    area.oninput = () => {
      root.querySelector(".notes-status")!.textContent = save(
        "notes",
        area.value,
      )
        ? `${area.value.length} characters · Saved on this device`
        : "Could not save. Copy your notes before closing.";
    };
    root.querySelector("#export-notes")!.addEventListener("click", () => {
      const url = URL.createObjectURL(
          new Blob([area.value], { type: "text/plain" }),
        ),
        a = document.createElement("a");
      a.href = url;
      a.download = "glorp-notes.txt";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      playSound("favorite");
    });
  }
  if (id === "terminal") {
    root.innerHTML =
      '<section class="terminal"><span class="terminal-logo">glorpOS</span><pre aria-live="polite">Type help for commands.</pre><form><label for="terminal-input">glorp ~ $</label><input id="terminal-input" aria-label="Command" autocomplete="off" spellcheck="false"/></form></section>';
    const output = root.querySelector("pre")!,
      input = root.querySelector("input")!;
    const history: string[] = [];
    let historyIndex = 0;
    input.onkeydown = (e) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        historyIndex = Math.max(
          0,
          Math.min(
            history.length,
            historyIndex + (e.key === "ArrowUp" ? -1 : 1),
          ),
        );
        input.value = history[historyIndex] || "";
      }
    };
    root.querySelector("form")!.onsubmit = (e) => {
      e.preventDefault();
      const command = input.value.trim();
      if (!command) return;
      input.value = "";
      history.push(command);
      historyIndex = history.length;
      playSound("tap");
      if (command === "clear") {
        output.textContent = "";
        return;
      }
      let response = "Unknown command. Type help.";
      if (command === "help")
        response =
          "help · clear · date · whoami · apps\nopen <app> — open an app\nglorp — establish contact";
      if (command === "date") response = new Date().toLocaleString("en-US");
      if (command === "whoami") response = "glorp\nstatus: probably a cat";
      if (command === "apps")
        response = apps.map((a) => `${a.id.padEnd(12)}${a.title}`).join("\n");
      if (command === "glorp") {
        response = "zeep zorp.\nconnection established.";
        document.dispatchEvent(new CustomEvent("glorp:secret"));
      }
      if (command.startsWith("open ")) {
        const target = command.slice(5).trim();
        if (apps.some((a) => a.id === target)) {
          open(target);
          response = `Opening ${target}.`;
        } else response = "App not found. Type apps.";
      }
      output.textContent += `\n\n$ ${command}\n${response}`;
      root.scrollTop = root.scrollHeight;
    };
  }
  return () => {};
}

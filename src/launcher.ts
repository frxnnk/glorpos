import { icon } from "./icons";
import { playSound } from "./sound";
export function setupLauncher(
  apps: { id: string; title: string; description: string }[],
  open: (id: string) => void,
) {
  const dialog = document.querySelector<HTMLDialogElement>("#launcher")!,
    search = document.querySelector<HTMLInputElement>("#search")!;
  let selected = 0;
  function render() {
    const filtered = apps.filter((a) =>
      `${a.title} ${a.description}`
        .toLowerCase()
        .includes(search.value.toLowerCase()),
    );
    document.querySelector("#search-results")!.innerHTML = filtered.length
      ? filtered
          .map(
            (a, i) =>
              `<button class="search-result ${i === selected ? "selected" : ""}" data-launch="${a.id}">${icon(a.id)}<span>${a.title}<small>${a.description}</small></span><span>↵</span></button>`,
          )
          .join("")
      : '<p class="empty">No apps found.</p>';
  }
  function show() {
    selected = 0;
    search.value = "";
    render();
    dialog.showModal();
    search.focus();
    playSound("tap");
  }
  document.querySelector("#launcher-button")!.addEventListener("click", show);
  document.querySelector("#dock-launcher")!.addEventListener("click", show);
  document
    .querySelector("#close-launcher")!
    .addEventListener("click", () => dialog.close());
  search.oninput = () => {
    selected = 0;
    render();
  };
  dialog.onclick = (e) => {
    const button = (e.target as HTMLElement).closest<HTMLElement>(
      "[data-launch]",
    );
    if (button) {
      dialog.close();
      open(button.dataset.launch!);
    }
    if (e.target === dialog) dialog.close();
  };
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (document.querySelector(".boot-screen")) return;
      dialog.open ? dialog.close() : show();
    }
    if (!dialog.open || e.target !== search || e.isComposing) return;
    const results = [
      ...dialog.querySelectorAll<HTMLButtonElement>("[data-launch]"),
    ];
    if (["ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      selected = Math.max(
        0,
        Math.min(
          results.length - 1,
          selected + (e.key === "ArrowDown" ? 1 : -1),
        ),
      );
      render();
      dialog.querySelector(".selected")?.scrollIntoView({ block: "nearest" });
    }
    if (e.key === "Enter") {
      e.preventDefault();
      results[selected]?.click();
    }
  });
}

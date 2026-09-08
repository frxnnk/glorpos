export function mountMaker(
  root: HTMLElement,
  notify: (message: string) => void,
) {
  const colors = ["#c9f48a", "#e8b491", "#a9c8e8", "#e0d9c6"];
  root.innerHTML = `<section class="program"><h2>Maker</h2><div class="maker-layout"><canvas width="800" height="800" aria-label="Image preview"></canvas><div class="maker-controls"><label for="maker-title">Caption</label><input type="text" id="maker-title" value="glorp." maxlength="40"/><label>Background</label><div class="swatches">${colors.map((c, i) => `<button aria-label="Color ${i + 1}" aria-pressed="${i === 0}" style="--swatch:${c}" data-color="${c}"></button>`).join("")}</div><label for="maker-scale">Size</label><input id="maker-scale" type="range" min="220" max="480" value="360"/><button class="primary" id="download">Download PNG ↗</button><p>PNG · 800 × 800 px</p></div></div></section>`;
  const canvas = root.querySelector("canvas")!,
    context = canvas.getContext("2d")!;
  const title = root.querySelector<HTMLInputElement>("#maker-title")!,
    scale = root.querySelector<HTMLInputElement>("#maker-scale")!;
  let color = colors[0],
    active = true;
  const image = new Image();
  image.src = "/glorp-hd.png";
  const download = root.querySelector<HTMLButtonElement>("#download")!;
  download.disabled = true;
  function draw() {
    if (!active) return;
    context.fillStyle = color;
    context.fillRect(0, 0, 800, 800);
    context.strokeStyle = "#22321525";
    context.lineWidth = 2;
    for (let r = 120; r < 700; r += 85) {
      context.beginPath();
      context.arc(400, 410, r, 0, Math.PI * 2);
      context.stroke();
    }
    context.fillStyle = "#223215";
    context.font = "18px monospace";
    context.textAlign = "left";

    let size = 64;
    do {
      context.font = `bold ${size--}px sans-serif`;
    } while (context.measureText(title.value).width > 716 && size > 18);
    context.textAlign = "center";
    context.fillText(title.value, 400, 154);
    if (image.complete && image.naturalWidth) {
      const s = Number(scale.value);
      const ratio = image.naturalHeight / image.naturalWidth;
      const h = Math.min(s * ratio, 420);
      context.drawImage(image, 400 - s / 2, 420 - h / 2, s, h);
    }
    context.font = "18px monospace";

  }
  image.onload = () => {
    download.disabled = false;
    draw();
  };
  image.onerror = () => notify("The image could not be loaded.");
  title.oninput = scale.oninput = draw;
  root.querySelectorAll<HTMLButtonElement>("[data-color]").forEach(
    (button) =>
      (button.onclick = () => {
        color = button.dataset.color!;
        root
          .querySelectorAll("[data-color]")
          .forEach((el) =>
            el.setAttribute("aria-pressed", String(el === button)),
          );
        draw();
      }),
  );
  download.onclick = () => {
    canvas.toBlob((blob) => {
      if (!blob) {
        notify("The image could not be exported.");
        return;
      }
      const url = URL.createObjectURL(blob),
        link = document.createElement("a");
      link.href = url;
      link.download = "glorp-original.png";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  };
  draw();
  return () => {
    active = false;
    image.onload = null;
    image.onerror = null;
  };
}

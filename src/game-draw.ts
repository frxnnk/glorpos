import { FIELD_WIDTH, type Round, type Drop } from "./game-engine";

function fish(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = "#d3ee91";
  ctx.beginPath();
  ctx.ellipse(x + 2, y, 11, 7, -0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 7, y); ctx.lineTo(x - 16, y - 7); ctx.lineTo(x - 16, y + 7);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#28382b";
  ctx.beginPath(); ctx.arc(x + 7, y - 2, 1.5, 0, Math.PI * 2); ctx.fill();
}

function asteroid(ctx: CanvasRenderingContext2D, drop: Drop) {
  ctx.save(); ctx.translate(drop.x, drop.y); ctx.rotate(drop.phase);
  ctx.fillStyle = "#966b5d";
  ctx.strokeStyle = "#e2a086";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const r = drop.radius * (i % 2 ? 0.83 : 1);
    if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
    else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#674c43";
  ctx.beginPath(); ctx.arc(-5, -4, drop.radius * 0.24, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(6, 6, drop.radius * 0.16, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawRound(ctx: CanvasRenderingContext2D, round: Round, mascot: HTMLImageElement, reduceMotion: boolean) {
  const width = FIELD_WIDTH, height = round.height;
  ctx.fillStyle = "#17252a";
  ctx.fillRect(0, 0, width, height);
  const glow = ctx.createRadialGradient(width * 0.8, height * 0.12, 10, width * 0.65, height * 0.2, width * 0.9);
  glow.addColorStop(0, "#42524766"); glow.addColorStop(1, "#17252a00");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < 45; i++) {
    const x = (i * 139.31 + 19) % width;
    const y = (i * 79.23 + (reduceMotion ? 0 : round.elapsed * (i % 3 + 1) * 3)) % height;
    ctx.globalAlpha = 0.16 + (i % 4) * 0.08;
    ctx.fillStyle = "#d9e9df";
    ctx.fillRect(x, y, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1);
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "#cfdfbb12"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(width * 0.87, -70, 165, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(width * 0.87, -70, 205, 0, Math.PI * 2); ctx.stroke();
  for (const drop of round.drops) {
    if (drop.kind === "fish") fish(ctx, drop.x, drop.y);
    else if (drop.kind === "rock") asteroid(ctx, drop);
    else {
      ctx.save(); ctx.translate(drop.x, drop.y);
      ctx.strokeStyle = "#9edde8"; ctx.fillStyle = "#9edde826"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(12, -9); ctx.lineTo(10, 5);
      ctx.quadraticCurveTo(7, 12, 0, 16); ctx.quadraticCurveTo(-7, 12, -10, 5);
      ctx.lineTo(-12, -9); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-1, 5); ctx.lineTo(6, -5); ctx.stroke();
      ctx.restore();
    }
  }
  if (!reduceMotion) for (const spark of round.sparks) {
    ctx.globalAlpha = spark.life * 1.8; ctx.fillStyle = spark.color;
    ctx.beginPath(); ctx.arc(spark.x, spark.y, 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  const y = height - 48;
  ctx.save(); ctx.translate(round.x, y);
  if (!reduceMotion) ctx.rotate(round.velocity * 0.00022);
  ctx.fillStyle = "#adcaa135";
  ctx.beginPath(); ctx.ellipse(0, 22, 31, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#bdd29d"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(0, 17, 30, 6, 0, 0, Math.PI * 2); ctx.stroke();
  if (mascot.complete && mascot.naturalWidth) {
    ctx.save(); ctx.beginPath(); ctx.arc(0, -3, 27, 0, Math.PI * 2); ctx.clip();
    ctx.drawImage(mascot, -29, -32, 58, 58); ctx.restore();
  } else {
    ctx.fillStyle = "#c6de8f";
    ctx.beginPath(); ctx.ellipse(0, -3, 20, 23, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1c292b";
    ctx.beginPath(); ctx.ellipse(-8, -5, 4, 7, -0.35, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(8, -5, 4, 7, 0.35, 0, Math.PI * 2); ctx.fill();
  }
  if (round.shield > 0 || round.invulnerable > 0) {
    ctx.strokeStyle = round.shield > 0 ? "#9edde8" : "#ed967d";
    ctx.globalAlpha = round.shield > 0 ? 0.75 : 0.45;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 37, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

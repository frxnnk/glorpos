export const FIELD_WIDTH = 480;
export const ROUND_SECONDS = 60;
export type Drop = { x: number; y: number; radius: number; speed: number; spin: number; phase: number; kind: "fish" | "rock" | "shield" };
export type Spark = { x: number; y: number; vx: number; vy: number; life: number; color: string };
export type GameEvent = "collect" | "hit" | "shield" | "blocked" | "finish";
export type Round = ReturnType<typeof createRound>;

export function createRound(height = 420) {
  return {
    height, x: FIELD_WIDTH / 2, velocity: 0, elapsed: 0, score: 0, lives: 3,
    streak: 0, combo: 1, bestCombo: 1, caught: 0, shield: 0, invulnerable: 0,
    fishClock: 0.2, rockClock: 1.5, shieldClock: 8, wave: Math.random() * 5,
    finished: false, drops: [] as Drop[], sparks: [] as Spark[],
  };
}

export function sector(round: Round) {
  return Math.min(3, 1 + Math.floor(round.elapsed / 20));
}

function burst(round: Round, x: number, y: number, color: string) {
  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2;
    const speed = 30 + Math.random() * 65;
    round.sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0.5, color });
  }
}

function spawn(round: Round, kind: Drop["kind"], x: number) {
  const level = sector(round);
  round.drops.push({
    kind, x, y: -28, radius: kind === "rock" ? 18 + Math.random() * 7 : 12,
    speed: (kind === "rock" ? 120 : 115) + level * 23 + Math.random() * 25,
    spin: (Math.random() - 0.5) * 2, phase: Math.random() * Math.PI * 2,
  });
}

/** Advance active game time only; the controller owns pausing and visibility. */
export function stepRound(round: Round, dt: number, axis: number, target: number | null): GameEvent[] {
  if (round.finished) return [];
  const events: GameEvent[] = [];
  const desired = axis ? axis * 370 : target === null ? 0 : Math.max(-560, Math.min(560, (target - round.x) * 13));
  round.velocity += (desired - round.velocity) * (1 - Math.exp(-dt * 18));
  round.x = Math.max(30, Math.min(FIELD_WIDTH - 30, round.x + round.velocity * dt));
  round.elapsed = Math.min(ROUND_SECONDS, round.elapsed + dt);
  round.shield = Math.max(0, round.shield - dt);
  round.invulnerable = Math.max(0, round.invulnerable - dt);
  round.fishClock -= dt;
  round.rockClock -= dt;
  round.shieldClock -= dt;
  if (round.fishClock <= 0) {
    round.wave += 0.5;
    spawn(round, "fish", FIELD_WIDTH / 2 + Math.sin(round.wave) * 165);
    round.fishClock = 0.58 - sector(round) * 0.055;
  }
  if (round.rockClock <= 0) {
    spawn(round, "rock", 30 + Math.random() * (FIELD_WIDTH - 60));
    round.rockClock = 1.1 - sector(round) * 0.15 + Math.random() * 0.3;
  }
  if (round.shieldClock <= 0) {
    spawn(round, "shield", 60 + Math.random() * (FIELD_WIDTH - 120));
    round.shieldClock = 15;
  }
  const playerY = round.height - 48;
  round.drops = round.drops.filter((drop) => {
    drop.y += drop.speed * dt * Math.max(0.4, round.height / 420);
    drop.phase += drop.spin * dt;
    const touches = Math.hypot(drop.x - round.x, drop.y - playerY) < drop.radius + 21;
    if (touches && drop.kind === "fish") {
      round.caught++;
      round.streak++;
      round.combo = Math.min(5, 1 + Math.floor(round.streak / 4));
      round.bestCombo = Math.max(round.bestCombo, round.combo);
      round.score += 10 * round.combo;
      burst(round, drop.x, drop.y, "#d6f591");
      events.push("collect");
      return false;
    }
    if (touches && drop.kind === "shield") {
      round.shield = 10;
      round.score += 25;
      burst(round, drop.x, drop.y, "#a2e5ef");
      events.push("shield");
      return false;
    }
    if (touches && drop.kind === "rock" && round.invulnerable <= 0) {
      if (round.shield > 0) {
        round.shield = 0;
        events.push("blocked");
        burst(round, drop.x, drop.y, "#a2e5ef");
      } else {
        round.lives--;
        round.streak = 0;
        round.combo = 1;
        events.push("hit");
        burst(round, drop.x, drop.y, "#ed967d");
      }
      round.invulnerable = 1.4;
      return false;
    }
    if (drop.y > round.height + 30) {
      if (drop.kind === "fish") { round.streak = 0; round.combo = 1; }
      return false;
    }
    return true;
  });
  round.sparks = round.sparks.filter((spark) => {
    spark.x += spark.vx * dt;
    spark.y += spark.vy * dt;
    spark.life -= dt;
    return spark.life > 0;
  });
  if (round.lives <= 0 || round.elapsed >= ROUND_SECONDS) {
    round.finished = true;
    events.push("finish");
  }
  return events;
}

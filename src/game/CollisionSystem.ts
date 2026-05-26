import type { Boss, Capsule, Enemy, Projectile } from "../entities/types";

export function rectsOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function checkPlayerHits(
  px: number,
  py: number,
  pw: number,
  ph: number,
  projectiles: Projectile[]
): Projectile | null {
  for (const p of projectiles) {
    if (!p.active || p.fromPlayer) continue;
    if (rectsOverlap(px, py, pw, ph, p.x - p.w / 2, p.y - p.h / 2, p.w, p.h)) return p;
  }
  return null;
}

export function checkEnemyHits(
  projectiles: Projectile[],
  enemies: Enemy[],
  scrollX: number
): { proj: Projectile; enemy: Enemy }[] {
  const hits: { proj: Projectile; enemy: Enemy }[] = [];
  for (const p of projectiles) {
    if (!p.active || !p.fromPlayer) continue;
    for (const e of enemies) {
      if (!e.alive) continue;
      const sx = e.worldX - scrollX;
      if (rectsOverlap(p.x - p.w / 2, p.y - p.h / 2, p.w, p.h, sx, e.y, e.w, e.h)) {
        hits.push({ proj: p, enemy: e });
        if (!p.pierce) break;
      }
    }
  }
  return hits;
}

export function checkBossHits(
  projectiles: Projectile[],
  boss: Boss | null,
  scrollX: number
): number {
  if (!boss?.active) return 0;
  let dmg = 0;
  const sx = boss.worldX - scrollX;
  for (const p of projectiles) {
    if (!p.active || !p.fromPlayer) continue;
    const targetY = boss.coreExposed ? boss.y : boss.y;
    const targetH = boss.coreExposed ? boss.h * 0.4 : boss.h;
    if (rectsOverlap(p.x - p.w / 2, p.y - p.h / 2, p.w, p.h, sx, targetY, boss.w, targetH)) {
      dmg += p.damage;
      if (!p.pierce) p.active = false;
    }
  }
  return dmg;
}

export function checkCapsuleHits(
  projectiles: Projectile[],
  capsules: Capsule[],
  scrollX: number
): Capsule | null {
  for (const p of projectiles) {
    if (!p.active || !p.fromPlayer) continue;
    for (const c of capsules) {
      if (!c.active) continue;
      const sx = c.worldX - scrollX;
      if (rectsOverlap(p.x - 4, p.y - 4, 8, 8, sx, c.y, c.w, c.h)) return c;
    }
  }
  return null;
}

import { CANVAS_HEIGHT, ENEMY_BULLET_SPEED } from "../config";
import type { Difficulty } from "../config";
import type { Enemy, EnemyTypeId } from "../entities/types";
import { createProjectile } from "../combat/ProjectilePool";
import type { Projectile } from "../entities/types";

let enemyId = 1;

const ENEMY_STATS: Record<
  EnemyTypeId,
  { hp: number; score: number; w: number; h: number; drops: boolean }
> = {
  turret: { hp: 2, score: 100, w: 24, h: 20, drops: false },
  scout: { hp: 1, score: 80, w: 22, h: 18, drops: false },
  carrier: { hp: 3, score: 200, w: 28, h: 22, drops: true },
  moai: { hp: 8, score: 400, w: 28, h: 36, drops: false },
  mine: { hp: 1, score: 50, w: 14, h: 14, drops: false },
  diver: { hp: 1, score: 120, w: 20, h: 18, drops: false },
  wall: { hp: 4, score: 150, w: 30, h: 24, drops: false },
  tentacle: { hp: 5, score: 250, w: 26, h: 30, drops: false },
  crusher: { hp: 6, score: 300, w: 32, h: 28, drops: false },
  serpent: { hp: 4, score: 220, w: 24, h: 20, drops: false },
  organ: { hp: 12, score: 800, w: 40, h: 40, drops: true },
  bomber: { hp: 2, score: 180, w: 22, h: 20, drops: false },
  sineWave: { hp: 1, score: 90, w: 20, h: 16, drops: false },
  pincer: { hp: 3, score: 200, w: 26, h: 22, drops: false },
  rotator: { hp: 2, score: 160, w: 22, h: 22, drops: false },
  spawner: { hp: 5, score: 350, w: 30, h: 26, drops: true },
  crystal: { hp: 3, score: 180, w: 20, h: 20, drops: false },
  gate: { hp: 10, score: 500, w: 36, h: 50, drops: false },
  elite: { hp: 4, score: 320, w: 26, h: 22, drops: true },
  branchMarker: { hp: 1, score: 0, w: 8, h: 8, drops: false },
};

export function spawnEnemy(
  type: EnemyTypeId,
  worldX: number,
  y: number,
  capsuleRed = false
): Enemy {
  const s = ENEMY_STATS[type];
  return {
    id: enemyId++,
    type,
    alive: true,
    worldX,
    y,
    w: s.w,
    h: s.h,
    hp: s.hp,
    maxHp: s.hp,
    score: s.score,
    vx: type === "scout" ? -40 : 0,
    vy: 0,
    phase: Math.random() * Math.PI * 2,
    fireTimer: 1 + Math.random() * 2,
    dropsCapsule: s.drops,
    capsuleRed,
    onGround: type === "turret" || type === "moai",
    weakPointOnly: type === "moai",
  };
}

export class EnemyBehavior {
  updateEnemy(e: Enemy, dt: number, scrollSpeed: number, playerY: number): void {
    if (!e.alive) return;
    e.phase += dt * 2;
    if (e.type === "scout" || e.type === "sineWave") {
      e.y += Math.sin(e.phase) * 40 * dt;
      e.worldX -= scrollSpeed * dt * 0.2;
    }
    if (e.type === "diver" && e.y < playerY + 40) {
      e.vy = 120;
      e.y += e.vy * dt;
    }
    if (e.type === "turret") {
      e.worldX -= scrollSpeed * dt * 0.85;
    } else if (!e.onGround) {
      e.worldX -= scrollSpeed * dt * 0.35;
    }
    if (e.y < 10) e.y = 10;
    if (e.y > CANVAS_HEIGHT - e.h - 10) e.y = CANVAS_HEIGHT - e.h - 10;
  }

  tryFire(
    e: Enemy,
    dt: number,
    scrollX: number,
    playerScreenX: number,
    playerY: number,
    difficulty: Difficulty,
    projectiles: Projectile[]
  ): void {
    if (!e.alive || e.type === "branchMarker") return;
    e.fireTimer -= dt;
    if (e.fireTimer > 0) return;
    const chance =
      difficulty === "casual" ? 0.25 : difficulty === "insane" ? 0.65 : 0.45;
    e.fireTimer = 1.2 + Math.random() * 2;
    if (Math.random() > chance) return;
    const sx = e.worldX - scrollX;
    const dx = playerScreenX - sx;
    const dy = playerY - e.y;
    const len = Math.hypot(dx, dy) || 1;
    projectiles.push(
      createProjectile({
        fromPlayer: false,
        x: sx + e.w / 2,
        y: e.y + e.h / 2,
        vx: (dx / len) * ENEMY_BULLET_SPEED,
        vy: (dy / len) * ENEMY_BULLET_SPEED,
        w: 6,
        h: 6,
        damage: 1,
        pierce: false,
        laser: false,
        missile: false,
      })
    );
  }
}

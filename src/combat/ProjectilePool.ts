import type { Projectile } from "../entities/types";

let nextId = 1;

export function createProjectile(
  partial: Omit<Projectile, "id" | "active">
): Projectile {
  return { id: nextId++, active: true, ...partial };
}

export class ProjectilePool {
  projectiles: Projectile[] = [];
  private cap = 120;

  spawn(partial: Omit<Projectile, "id" | "active">): Projectile | null {
    const inactive = this.projectiles.find((p) => !p.active);
    const p = inactive ?? (this.projectiles.length < this.cap ? createProjectile(partial) : null);
    if (!p) return null;
    Object.assign(p, partial, { active: true });
    return p;
  }

  update(dt: number, scrollSpeed: number): void {
    for (const p of this.projectiles) {
      if (!p.active) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (!p.fromPlayer) p.x -= scrollSpeed * dt * 0.5;
      if (p.x < -40 || p.x > 600 || p.y < -20 || p.y > 320) p.active = false;
    }
  }

  clear(): void {
    for (const p of this.projectiles) p.active = false;
  }
}

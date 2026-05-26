import type { Particle } from "../entities/types";

let particleId = 1;

export class JuiceController {
  particles: Particle[] = [];
  hitStop = 0;
  private shakePending: { intensity: number; duration: number } | null = null;

  spawnExplosion(x: number, y: number, color = 0xff6644, count = 8): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      this.particles.push({
        id: particleId++,
        active: true,
        x,
        y,
        vx: Math.cos(angle) * (60 + Math.random() * 80),
        vy: Math.sin(angle) * (60 + Math.random() * 80),
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        color,
        size: 3 + Math.random() * 4,
      });
    }
  }

  triggerShake(intensity: number, duration: number): void {
    this.shakePending = { intensity, duration };
  }

  consumeShake(): { intensity: number; duration: number } | null {
    const s = this.shakePending;
    this.shakePending = null;
    return s;
  }

  update(dt: number): number {
    if (this.hitStop > 0) {
      this.hitStop -= dt;
      return 0.15;
    }
    for (const p of this.particles) {
      if (!p.active) continue;
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0) p.active = false;
    }
    this.particles = this.particles.filter((p) => p.active);
    return 1;
  }
}

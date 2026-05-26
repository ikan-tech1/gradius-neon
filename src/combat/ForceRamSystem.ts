import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../config";
import { ProjectilePool } from "./ProjectilePool";

export interface ForceRamState {
  active: boolean;
  detached: boolean;
  x: number;
  y: number;
  angle: number;
  hp: number;
}

export class ForceRamSystem {
  state: ForceRamState = {
    active: false,
    detached: false,
    x: 0,
    y: 0,
    angle: 0,
    hp: 3,
  };
  private fireCooldown = 0;
  private pool: ProjectilePool | null = null;

  bindPool(pool: ProjectilePool): void {
    this.pool = pool;
  }

  enable(): void {
    this.state.active = true;
    this.state.hp = 3;
    this.state.detached = false;
  }

  disable(): void {
    this.state.active = false;
    this.state.detached = false;
  }

  tryDetach(playerX: number, playerY: number): boolean {
    if (!this.state.active || this.state.detached) return false;
    this.state.detached = true;
    this.state.x = playerX + 40;
    this.state.y = playerY;
    this.state.angle = 0;
    return true;
  }

  tryRecall(playerX: number, playerY: number): void {
    if (!this.state.detached) return;
    const dx = playerX - this.state.x;
    const dy = playerY - this.state.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 24) {
      this.state.detached = false;
      this.state.x = playerX;
      this.state.y = playerY;
    }
  }

  update(dt: number, playerX: number, playerY: number, firing: boolean): void {
    if (!this.state.active) return;
    if (this.fireCooldown > 0) this.fireCooldown -= dt;

    if (this.state.detached) {
      this.state.angle += dt * 2.2;
      this.state.x = playerX + Math.cos(this.state.angle) * 52;
      this.state.y = playerY + Math.sin(this.state.angle) * 36;
      this.state.x = Math.max(40, Math.min(CANVAS_WIDTH - 40, this.state.x));
      this.state.y = Math.max(40, Math.min(CANVAS_HEIGHT - 40, this.state.y));

      if (firing && this.pool && this.fireCooldown <= 0) {
        this.pool.spawn({
          fromPlayer: true,
          x: this.state.x + 12,
          y: this.state.y,
          vx: 420,
          vy: 0,
          w: 8,
          h: 6,
          damage: 2,
          pierce: false,
          laser: false,
          missile: false,
        });
        this.fireCooldown = 0.12;
      }
    } else {
      this.state.x = playerX + 18;
      this.state.y = playerY;
    }
  }

  absorbHit(): boolean {
    if (!this.state.active || this.state.hp <= 0) return false;
    this.state.hp--;
    if (this.state.hp <= 0) {
      this.disable();
    }
    return true;
  }

  getBarrierRect(): { x: number; y: number; w: number; h: number } | null {
    if (!this.state.active || this.state.detached) return null;
    return { x: this.state.x - 8, y: this.state.y - 14, w: 16, h: 28 };
  }
}

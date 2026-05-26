import { BULLET_SPEED, PLAYER_W } from "../config";
import type { PrimaryWeapon } from "../config/weapons";
import { WEAPON_PROFILES } from "../config/weapons";
import type { OptionPod } from "../entities/types";
import { ProjectilePool } from "./ProjectilePool";

export class WeaponController {
  pool = new ProjectilePool();
  weapon: PrimaryWeapon = "normal";
  fireCooldown = 0;
  missileCooldown = 0;
  charge = 0;
  charging = false;

  setWeapon(w: PrimaryWeapon): void {
    this.weapon = w;
  }

  getLabel(): string {
    return WEAPON_PROFILES[this.weapon].label;
  }

  update(dt: number, scrollSpeed: number): void {
    if (this.fireCooldown > 0) this.fireCooldown -= dt;
    if (this.missileCooldown > 0) this.missileCooldown -= dt;
    if (this.charging) this.charge = Math.min(1, this.charge + dt * 0.8);
    this.pool.update(dt, scrollSpeed);
  }

  tryFire(
    screenX: number,
    y: number,
    firing: boolean,
    fireRateMult: number,
    options: OptionPod[]
  ): void {
    if (!firing) {
      this.charging = false;
      return;
    }
    const profile = WEAPON_PROFILES[this.weapon];
    const rate = profile.fireRate / fireRateMult;
    if (this.fireCooldown > 0) return;

    const damage = this.weapon === "charge" && this.charge >= 1 ? profile.damage * 2 : profile.damage;
    const spread = profile.spread;
    const shots =
      this.weapon === "double" || this.weapon === "spread"
        ? this.weapon === "spread"
          ? 3
          : 2
        : this.weapon === "ripple"
          ? 3
          : 1;

    const origins = [{ x: screenX + PLAYER_W / 2, y }];
    for (const opt of options) {
      if (opt.active) origins.push({ x: opt.x + 8, y: opt.y });
    }

    for (const origin of origins) {
      for (let i = 0; i < shots; i++) {
        const angle =
          shots === 1 ? 0 : (i - (shots - 1) / 2) * (spread / 180) * Math.PI;
        const vx = Math.cos(angle) * BULLET_SPEED;
        const vy = Math.sin(angle) * BULLET_SPEED * 0.15;
        this.pool.spawn({
          fromPlayer: true,
          x: origin.x,
          y: origin.y,
          vx,
          vy,
          w: profile.pierce ? 28 : 6,
          h: profile.pierce ? 4 : 6,
          damage,
          pierce: profile.pierce,
          laser: profile.pierce,
          missile: false,
        });
      }
    }
    this.fireCooldown = rate;
  }

  tryMissile(screenX: number, groundY: number, enabled: boolean): void {
    if (!enabled || this.missileCooldown > 0) return;
    this.pool.spawn({
      fromPlayer: true,
      x: screenX,
      y: groundY,
      vx: 280,
      vy: 0,
      w: 10,
      h: 8,
      damage: 2,
      pierce: false,
      laser: false,
      missile: true,
    });
    this.missileCooldown = 0.35;
  }
}

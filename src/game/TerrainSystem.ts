import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../config";
import type { StageTheme } from "../config";
import type { Particle, Projectile, TerrainTile } from "../entities/types";

let tileId = 1;

const TERRAIN_THEMES: StageTheme[] = ["plant", "mechanical", "organic", "fire", "moai"];

export class TerrainSystem {
  tiles: TerrainTile[] = [];
  private theme: StageTheme = "space";

  setTheme(theme: StageTheme, worldOffset: number, vertical: boolean): void {
    if (theme === this.theme && this.tiles.length) return;
    this.theme = theme;
    this.tiles = [];
    if (!TERRAIN_THEMES.includes(theme)) return;

    const count = vertical ? 14 : 18;
    for (let i = 0; i < count; i++) {
      const w = 48 + Math.floor(Math.random() * 40);
      const h = 32 + Math.floor(Math.random() * 48);
      if (vertical) {
        this.tiles.push({
          id: tileId++,
          worldX: 40 + Math.random() * (CANVAS_WIDTH - w - 80),
          y: worldOffset + 120 + i * 180 + Math.random() * 60,
          w,
          h,
          hp: 3,
          theme,
        });
      } else {
        this.tiles.push({
          id: tileId++,
          worldX: worldOffset + 800 + i * 220 + Math.random() * 80,
          y: CANVAS_HEIGHT - h - 8 - Math.random() * 40,
          w,
          h,
          hp: 3,
          theme,
        });
      }
    }
  }

  checkHits(
    projectiles: Projectile[],
    scrollX: number,
    scrollY: number,
    vertical: boolean,
    onCrack: (x: number, y: number, color: number) => void
  ): void {
    for (const p of projectiles) {
      if (!p.active || !p.fromPlayer) continue;
      if (!p.laser && !p.missile) continue;
      for (const t of this.tiles) {
        if (t.hp <= 0) continue;
        const tx = vertical ? t.worldX : t.worldX - scrollX;
        const ty = vertical ? t.y - scrollY : t.y;
        if (
          p.x < tx + t.w &&
          p.x + p.w > tx &&
          p.y < ty + t.h &&
          p.y + p.h > ty
        ) {
          t.hp--;
          if (!p.pierce) p.active = false;
          const cx = tx + t.w / 2;
          const cy = ty + t.h / 2;
          onCrack(cx, cy, themeColor(t.theme));
          if (t.hp <= 0) {
            onCrack(cx, cy, 0xff6644);
            onCrack(cx + 8, cy - 6, 0xffaa44);
          }
          break;
        }
      }
    }
    this.tiles = this.tiles.filter((t) => t.hp > 0);
  }

  getVisible(scrollX: number, scrollY: number, vertical: boolean): TerrainTile[] {
    return this.tiles.filter((t) => {
      if (vertical) {
        const sy = t.y - scrollY;
        return sy > -80 && sy < CANVAS_HEIGHT + 80;
      }
      const sx = t.worldX - scrollX;
      return sx > -60 && sx < CANVAS_WIDTH + 60;
    });
  }
}

function themeColor(theme: StageTheme): number {
  const map: Partial<Record<StageTheme, number>> = {
    plant: 0x44ff88,
    mechanical: 0x8888aa,
    organic: 0xaa44ff,
    fire: 0xff6644,
    moai: 0xc8a060,
  };
  return map[theme] ?? 0x888888;
}

export function spawnTerrainDebris(
  particles: Particle[],
  x: number,
  y: number,
  color: number,
  count = 6
): void {
  let id = particles.length ? Math.max(...particles.map((p) => p.id)) + 1 : 1;
  for (let i = 0; i < count; i++) {
    particles.push({
      id: id++,
      active: true,
      x,
      y,
      vx: (Math.random() - 0.5) * 120,
      vy: -40 - Math.random() * 80,
      life: 0.35 + Math.random() * 0.25,
      maxLife: 0.6,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

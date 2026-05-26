import type { BossId } from "../../game/stages/types";
import type { Boss } from "../../entities/types";
import type { Difficulty } from "../../config";

let bossId = 1;

const BOSS_STATS: Record<
  BossId,
  { hp: number; score: number; w: number; h: number } | null
> = {
  none: null,
  bigCore1: { hp: 80, score: 5000, w: 90, h: 50 },
  bigCore2: { hp: 120, score: 8000, w: 100, h: 55 },
  bigCore3: { hp: 160, score: 12000, w: 110, h: 60 },
  moai: { hp: 60, score: 4000, w: 70, h: 70 },
  tetran: { hp: 100, score: 6000, w: 80, h: 40 },
  intruder: { hp: 90, score: 5500, w: 85, h: 55 },
  fortressGate: { hp: 140, score: 9000, w: 120, h: 80 },
  crystal: { hp: 70, score: 4500, w: 75, h: 75 },
  gofer: { hp: 200, score: 15000, w: 100, h: 70 },
  brain: { hp: 110, score: 7000, w: 90, h: 90 },
  stomach: { hp: 95, score: 6500, w: 95, h: 70 },
  bacterian: { hp: 250, score: 25000, w: 130, h: 90 },
};

export class BossController {
  create(bossIdType: BossId, worldX: number, y: number): Boss | null {
    const stats = BOSS_STATS[bossIdType];
    if (!stats) return null;
    return {
      id: bossId++,
      bossId: bossIdType,
      active: true,
      worldX,
      y,
      w: stats.w,
      h: stats.h,
      hp: stats.hp,
      maxHp: stats.hp,
      phase: 0,
      coreExposed: false,
      barrierHp: stats.hp * 0.4,
      score: stats.score,
    };
  }

  update(boss: Boss, dt: number, scrollSpeed: number, _difficulty: Difficulty): void {
    if (!boss.active) return;
    boss.phase += dt;
    boss.worldX -= scrollSpeed * dt * 0.15;
    if (boss.barrierHp > 0) {
      boss.coreExposed = false;
    } else {
      boss.coreExposed = true;
    }
    if (boss.bossId === "bacterian" && boss.hp < boss.maxHp * 0.5) {
      boss.w = 140;
      boss.h = 100;
    }
  }

  applyDamage(boss: Boss, dmg: number): boolean {
    if (!boss.active || dmg <= 0) return false;
    if (boss.barrierHp > 0) {
      boss.barrierHp -= dmg;
      if (boss.barrierHp <= 0) boss.barrierHp = 0;
      return false;
    }
    boss.hp -= dmg;
    if (boss.hp <= 0) {
      boss.hp = 0;
      boss.active = false;
      return true;
    }
    return false;
  }

  getAnnouncer(bossIdType: BossId): string {
    switch (bossIdType) {
      case "moai":
        return "DESTROY THE EYE!";
      case "bacterian":
        return "BACTERIAN APPROACHING!";
      case "gofer":
        return "GOFER DETECTED!";
      default:
        return "DESTROY THE CORE!";
    }
  }
}

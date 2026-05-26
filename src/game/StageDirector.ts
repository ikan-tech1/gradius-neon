import type { Capsule, Enemy } from "../entities/types";
import { spawnEnemy } from "../enemies/EnemyBehavior";
import { spawnFormation } from "../enemies/formations";
import { BossController } from "../enemies/bosses/BossController";
import type { Boss } from "../entities/types";
import type { StageScript } from "./stages/types";
import { ALL_STAGES, getStage } from "./stages/stageFactory";

let capsuleId = 1;

export class StageDirector {
  stageIndex = 0;
  arc = 1;
  script: StageScript = ALL_STAGES[0]!;
  segmentIdx = 0;
  bossSpawned = false;
  stageComplete = false;
  private bossCtrl = new BossController();

  load(arc: number, index: number): void {
    this.arc = arc;
    this.stageIndex = index;
    this.script = getStage(arc, index) ?? ALL_STAGES[0]!;
    this.segmentIdx = 0;
    this.bossSpawned = false;
    this.stageComplete = false;
  }

  loadById(id: string): void {
    const s = ALL_STAGES.find((x) => x.id === id);
    if (s) {
      this.script = s;
      this.arc = s.arc;
      this.stageIndex = s.index;
    }
    this.segmentIdx = 0;
    this.bossSpawned = false;
    this.stageComplete = false;
  }

  update(
    worldOffsetX: number,
    enemies: Enemy[],
    capsules: Capsule[]
  ): { boss: Boss | null; message?: string } {
    let boss: Boss | null = null;
    let message: string | undefined;

    while (this.segmentIdx < this.script.segments.length) {
      const seg = this.script.segments[this.segmentIdx]!;
      if (worldOffsetX < seg.at) break;

      if (seg.message) message = seg.message;
      if (seg.capsule) {
        capsules.push({
          id: capsuleId++,
          active: true,
          worldX: worldOffsetX + 200,
          y: 120 + Math.random() * 80,
          red: seg.capsule === "red",
          w: 16,
          h: 20,
        });
      }
      if (seg.type && seg.count) {
        const spawned = spawnFormation(
          seg.type,
          worldOffsetX + 280,
          80 + Math.random() * 100,
          seg.count
        );
        enemies.push(...spawned);
      } else if (seg.spawn === "turretPair") {
        enemies.push(spawnEnemy("turret", worldOffsetX + 300, 220));
        enemies.push(spawnEnemy("turret", worldOffsetX + 360, 200));
      } else if (seg.spawn === "carrier") {
        enemies.push(
          spawnEnemy("carrier", worldOffsetX + 320, 140, seg.capsule !== "blue")
        );
      }
      if (seg.boss && !this.bossSpawned) {
        boss = this.bossCtrl.create(seg.boss, worldOffsetX + 400, 120);
        this.bossSpawned = true;
        message = this.bossCtrl.getAnnouncer(seg.boss);
      }
      this.segmentIdx++;
    }

    if (!this.bossSpawned && worldOffsetX >= this.script.length) {
      if (this.script.boss !== "none") {
        boss = this.bossCtrl.create(this.script.boss, worldOffsetX + 400, 120);
        this.bossSpawned = true;
        message = this.bossCtrl.getAnnouncer(this.script.boss);
      } else {
        this.stageComplete = true;
      }
    }

    return { boss, message };
  }

  onBossDefeated(): void {
    this.stageComplete = true;
  }

  nextStage(): { arc: number; index: number } | null {
    const idx = ALL_STAGES.findIndex(
      (s) => s.arc === this.arc && s.index === this.stageIndex
    );
    if (idx < 0 || idx >= ALL_STAGES.length - 1) return null;
    const next = ALL_STAGES[idx + 1]!;
    return { arc: next.arc, index: next.index };
  }
}

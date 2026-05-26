import { MAX_OPTIONS } from "../config";
import type { OptionPod } from "../entities/types";

export class OptionSystem {
  pods: OptionPod[] = [];
  private trail: { x: number; y: number }[] = [];
  private readonly trailLen = 48;
  optionCount = 0;
  mode: OptionPod["mode"] = "trail";
  returnToCore = false;

  setCount(n: number): void {
    this.optionCount = Math.min(MAX_OPTIONS, n);
    while (this.pods.length < this.optionCount) {
      this.pods.push({
        id: this.pods.length + 1,
        active: true,
        x: 0,
        y: 0,
        trailIndex: 0,
        mode: this.mode,
      });
    }
    for (let i = 0; i < this.pods.length; i++) {
      this.pods[i]!.active = i < this.optionCount;
    }
  }

  recordPosition(x: number, y: number): void {
    this.trail.unshift({ x, y });
    if (this.trail.length > this.trailLen) this.trail.pop();
  }

  update(dt: number, playerX: number, playerY: number): void {
    if (this.returnToCore) {
      this.updateReturn(dt, playerX, playerY);
      return;
    }
    this.recordPosition(playerX, playerY);
    const spacing = 6;
    for (let i = 0; i < this.pods.length; i++) {
      const pod = this.pods[i]!;
      if (!pod.active) continue;
      if (this.mode === "rotate") {
        const angle = performance.now() / 500 + i * 1.2;
        pod.x = playerX + Math.cos(angle) * (36 + i * 10);
        pod.y = playerY + Math.sin(angle) * 24;
      } else if (this.mode === "formation") {
        pod.x = playerX - 24 - i * 20;
        pod.y = playerY + (i % 2 === 0 ? -16 : 16);
      } else {
        const idx = Math.min(this.trail.length - 1, (i + 1) * spacing);
        const pos = this.trail[idx] ?? { x: playerX, y: playerY };
        pod.x += (pos.x - pod.x) * Math.min(1, dt * 12);
        pod.y += (pos.y - pod.y) * Math.min(1, dt * 12);
      }
    }
  }

  private returnTimer = 0;

  onPlayerDeath(playerX: number, playerY: number): void {
    this.returnToCore = true;
    this.returnTimer = 0.85;
    for (const pod of this.pods) {
      if (!pod.active) continue;
      pod.x += (Math.random() - 0.5) * 20;
      pod.y += (Math.random() - 0.5) * 20;
    }
    void playerX;
    void playerY;
  }

  updateReturn(dt: number, playerX: number, playerY: number): boolean {
    if (!this.returnToCore) return false;
    this.returnTimer -= dt;
    let allHome = true;
    for (const pod of this.pods) {
      if (!pod.active) continue;
      const dx = playerX - pod.x;
      const dy = playerY - pod.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 6) {
        allHome = false;
        pod.x += dx * Math.min(1, dt * 8);
        pod.y += dy * Math.min(1, dt * 8);
      } else {
        pod.x = playerX;
        pod.y = playerY;
      }
    }
    if (this.returnTimer <= 0 || allHome) {
      this.returnToCore = false;
      this.optionCount = 0;
      for (const p of this.pods) p.active = false;
      return true;
    }
    return false;
  }

  isReturning(): boolean {
    return this.returnToCore;
  }
}

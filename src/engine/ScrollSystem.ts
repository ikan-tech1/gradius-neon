import { BASE_SCROLL_SPEED } from "../config";

export class ScrollSystem {
  worldOffsetX = 0;
  worldOffsetY = 0;
  scrollSpeed = BASE_SCROLL_SPEED;
  paused = false;
  vertical = false;

  update(dt: number, stageSpeedMult = 1): void {
    if (this.paused) return;
    if (this.vertical) {
      this.worldOffsetY += this.scrollSpeed * stageSpeedMult * dt;
    } else {
      this.worldOffsetX += this.scrollSpeed * stageSpeedMult * dt;
    }
  }

  worldToScreen(worldX: number): number {
    return worldX - this.worldOffsetX;
  }

  worldToScreenY(worldY: number): number {
    return worldY - this.worldOffsetY;
  }

  screenToWorld(screenX: number): number {
    return screenX + this.worldOffsetX;
  }

  reset(): void {
    this.worldOffsetX = 0;
    this.worldOffsetY = 0;
    this.vertical = false;
  }
}

export class ChargeSystem {
  level = 0;
  charging = false;

  update(dt: number, hold: boolean): void {
    if (hold) {
      this.charging = true;
      this.level = Math.min(1, this.level + dt * 0.7);
    } else if (this.charging && this.level >= 0.35) {
      this.charging = false;
    } else {
      this.charging = false;
      this.level = Math.max(0, this.level - dt * 2);
    }
  }

  consume(): number {
    const v = this.level;
    this.level = 0;
    this.charging = false;
    return v;
  }
}

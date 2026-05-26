export class OverdriveSystem {
  gauge = 0;
  readonly max = 100;
  active = false;
  duration = 0;

  addKill(amount = 8): void {
    this.gauge = Math.min(this.max, this.gauge + amount);
  }

  canActivate(): boolean {
    return this.gauge >= this.max && !this.active;
  }

  activate(): boolean {
    if (!this.canActivate()) return false;
    this.active = true;
    this.duration = 2.5;
    this.gauge = 0;
    return true;
  }

  update(dt: number): void {
    if (!this.active) return;
    this.duration -= dt;
    if (this.duration <= 0) this.active = false;
  }

  getPct(): number {
    return this.gauge / this.max;
  }
}

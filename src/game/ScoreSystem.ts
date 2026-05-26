export class ScoreSystem {
  score = 0;
  kills = 0;
  combo = 0;
  comboTimer = 0;
  rank = "B";

  add(points: number, dt: number): void {
    const mult = 1 + Math.min(4, this.combo) * 0.1;
    this.score += Math.floor(points * mult);
    this.kills++;
    this.combo++;
    this.comboTimer = 2.5;
    void dt;
  }

  update(dt: number): void {
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }
  }

  computeRank(damageTaken: number, timeSec: number): string {
    let r = 100;
    r -= damageTaken * 8;
    r -= timeSec * 0.5;
    if (r >= 90) this.rank = "S";
    else if (r >= 75) this.rank = "A";
    else if (r >= 55) this.rank = "B";
    else if (r >= 35) this.rank = "C";
    else this.rank = "D";
    return this.rank;
  }
}

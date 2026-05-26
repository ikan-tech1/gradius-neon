import { POWER_BAR_SLOTS, POWER_SLOT_LABELS } from "../config/powerUps";
import type { GameCallbacks, GameState } from "../game/GameSession";

export class HudBridge implements GameCallbacks {
  private els: Record<string, HTMLElement | null> = {};
  private lastScore = 0;

  mount(): void {
    const ids = [
      "hud-score",
      "hud-stage",
      "hud-lives",
      "hud-power-bar",
      "hud-options",
      "hud-shield",
      "hud-weapon",
      "hud-overdrive",
      "hud-rank",
      "wave-banner",
      "pause-overlay",
      "continue-overlay",
      "interstitial-overlay",
      "interstitial-label",
      "interstitial-rank",
      "continue-timer",
      "toast",
    ];
    for (const id of ids) this.els[id] = document.getElementById(id);
    this.renderPowerBar(0, []);
  }

  onScore(score: number): void {
    const el = this.els["hud-score"];
    if (!el) return;
    el.textContent = score.toLocaleString();
    if (score > this.lastScore) {
      el.classList.remove("pop");
      void el.offsetWidth;
      el.classList.add("pop");
    }
    this.lastScore = score;
  }

  onLives(lives: number): void {
    const el = this.els["hud-lives"];
    if (!el) return;
    el.innerHTML = "";
    for (let i = 0; i < Math.max(lives, 0); i++) {
      const pip = document.createElement("span");
      pip.className = "life-pip";
      el.appendChild(pip);
    }
  }

  onStage(label: string): void {
    const stageEl = this.els["hud-stage"];
    if (stageEl) stageEl.textContent = label;
    const wb = this.els["wave-banner"];
    if (wb) {
      wb.textContent = label;
      wb.classList.remove("visible");
      void wb.offsetWidth;
      wb.classList.add("visible");
      setTimeout(() => wb.classList.remove("visible"), 1800);
    }
  }

  onPowerBar(highlight: number, activated: string[]): void {
    this.renderPowerBar(highlight, activated);
  }

  private renderPowerBar(highlight: number, activated: string[]): void {
    const bar = this.els["hud-power-bar"];
    if (!bar) return;
    bar.innerHTML = "";
    POWER_BAR_SLOTS.forEach((slot, i) => {
      const cell = document.createElement("div");
      cell.className = "power-cell";
      if (i === highlight) cell.classList.add("highlight");
      if (activated.includes(slot)) cell.classList.add("active");
      cell.textContent = POWER_SLOT_LABELS[slot].split(" ")[0] ?? slot;
      bar.appendChild(cell);
    });
  }

  onOptions(count: number): void {
    const el = this.els["hud-options"];
    if (!el) return;
    if (count === 0) {
      el.textContent = "—";
      return;
    }
    el.innerHTML = "";
    for (let i = 0; i < 4; i++) {
      const icon = document.createElement("span");
      icon.className = `option-icon${i < count ? " active" : ""}`;
      el.appendChild(icon);
    }
  }

  onShield(hits: number): void {
    const el = this.els["hud-shield"];
    if (!el) return;
    if (hits <= 0) {
      el.textContent = "—";
      return;
    }
    el.innerHTML = "";
    for (let i = 0; i < hits; i++) {
      const pip = document.createElement("span");
      pip.className = "shield-pip";
      el.appendChild(pip);
    }
  }

  onWeapon(label: string): void {
    const el = this.els["hud-weapon"];
    if (el) el.textContent = label;
  }

  onOverdrive(pct: number): void {
    const el = this.els["hud-overdrive"];
    if (el) el.style.width = `${Math.round(pct * 100)}%`;
  }

  onRank(rank: string): void {
    const el = this.els["hud-rank"];
    if (el) el.textContent = rank;
  }

  onState(state: GameState): void {
    const pause = this.els["pause-overlay"];
    const cont = this.els["continue-overlay"];
    const inter = this.els["interstitial-overlay"];
    if (pause) pause.classList.toggle("hidden", state !== "paused");
    if (cont) cont.classList.toggle("hidden", state !== "continue");
    if (inter) {
      inter.classList.toggle("hidden", state !== "interstitial");
      inter.classList.toggle("visible", state === "interstitial");
      if (state === "interstitial") {
        const label = this.els["interstitial-label"];
        const stageEl = this.els["hud-stage"];
        const rankEl = this.els["interstitial-rank"];
        if (label && stageEl) label.textContent = stageEl.textContent ?? "STAGE CLEAR";
        if (rankEl) {
          const rankBadge = this.els["hud-rank"];
          if (rankBadge) rankEl.textContent = `RANK ${rankBadge.textContent}`;
        }
      }
    }
  }

  onContinueTimer(seconds: number): void {
    const el = this.els["continue-timer"];
    if (el) el.textContent = Math.ceil(seconds).toString();
  }

  onScreenFlash(): void {
    const flash = document.getElementById("screen-flash");
    if (!flash) return;
    flash.classList.remove("active");
    void flash.offsetWidth;
    flash.classList.add("active");
  }

  onToast(msg: string): void {
    const t = this.els["toast"];
    if (!t) return;
    t.textContent = msg;
    t.classList.remove("visible");
    void t.offsetWidth;
    t.classList.add("visible");
    setTimeout(() => t.classList.remove("visible"), 2400);
  }
}

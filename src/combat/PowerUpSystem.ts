import { MAX_SHIELD_HITS, MAX_SPEED_LEVEL, POWER_BAR_SLOTS, type PowerSlotId } from "../config/powerUps";
import type { Capsule } from "../entities/types";

export class PowerUpSystem {
  highlightIndex = 0;
  activated = new Set<PowerSlotId>();
  speedLevel = 0;
  shieldHits = 0;
  missile = false;
  konami = false;
  konamiBuffer: string[] = [];
  private readonly konamiSeq = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];

  trackKonami(key: string): boolean {
    this.konamiBuffer.push(key);
    if (this.konamiBuffer.length > this.konamiSeq.length) {
      this.konamiBuffer.shift();
    }
    const match = this.konamiSeq.every((k, i) => this.konamiBuffer[i] === k);
    if (match) {
      this.konami = true;
      this.fullPower();
      return true;
    }
    return false;
  }

  fullPower(): void {
    for (const slot of POWER_BAR_SLOTS) this.activated.add(slot);
    this.speedLevel = MAX_SPEED_LEVEL;
    this.shieldHits = MAX_SHIELD_HITS;
    this.missile = true;
    this.highlightIndex = POWER_BAR_SLOTS.length - 1;
  }

  onRedCapsule(): PowerSlotId {
    const slot = POWER_BAR_SLOTS[this.highlightIndex]!;
    this.highlightIndex = (this.highlightIndex + 1) % POWER_BAR_SLOTS.length;
    return slot;
  }

  onBlueCapsule(): PowerSlotId | null {
    const slot = POWER_BAR_SLOTS[this.highlightIndex]!;
    this.activateSlot(slot);
    return slot;
  }

  activateSlot(slot: PowerSlotId): void {
    this.activated.add(slot);
    if (slot === "speed") this.speedLevel = Math.min(MAX_SPEED_LEVEL, this.speedLevel + 1);
    if (slot === "missile") this.missile = true;
    if (slot === "shield") this.shieldHits = MAX_SHIELD_HITS;
    if (slot === "mystery") {
      const roll = Math.random();
      if (roll < 0.33) this.shieldHits = MAX_SHIELD_HITS;
      else if (roll < 0.66) this.speedLevel = MAX_SPEED_LEVEL;
      else this.missile = true;
    }
  }

  getWeaponFromBar(): "normal" | "double" | "laser" {
    if (this.activated.has("laser")) return "laser";
    if (this.activated.has("double")) return "double";
    return "normal";
  }

  absorbHit(): boolean {
    if (this.shieldHits > 0) {
      this.shieldHits--;
      return true;
    }
    return false;
  }

  collectCapsule(c: Capsule): PowerSlotId | null {
    if (!c.active) return null;
    c.active = false;
    return c.red ? this.onRedCapsule() : this.onBlueCapsule();
  }
}

import type { Difficulty, ShipId } from "../config";
import { TOTAL_STAGES } from "../config";
import type { PowerSlotId } from "../config/powerUps";

export interface HangarData {
  difficulty: Difficulty;
  reducedFx: boolean;
  unlockedArcs: number[];
  unlockedStages: string[];
  unlockedShips: ShipId[];
  highScores: Record<string, number>;
  codexSeen: string[];
  editPresets: { name: string; ship: ShipId; slot: PowerSlotId; optionMode: string }[];
  campaignArc: number;
  campaignStage: number;
  loops: number;
}

const STORAGE_KEY = "gradius-neon-hangar";

const DEFAULT: HangarData = {
  difficulty: "classic",
  reducedFx: false,
  unlockedArcs: [1],
  unlockedStages: ["arc1-1"],
  unlockedShips: ["vicViper"],
  highScores: {},
  codexSeen: [],
  editPresets: [
    { name: "Balanced", ship: "vicViper", slot: "speed", optionMode: "trail" },
    { name: "Laser Start", ship: "vicViper", slot: "laser", optionMode: "trail" },
  ],
  campaignArc: 1,
  campaignStage: 1,
  loops: 0,
};

class HangarStore {
  private data: HangarData = { ...DEFAULT };

  constructor() {
    this.load();
  }

  get(): HangarData {
    return this.data;
  }

  set(partial: Partial<HangarData>): void {
    this.data = { ...this.data, ...partial };
    this.save();
  }

  unlockArc(arc: number): void {
    if (!this.data.unlockedArcs.includes(arc)) {
      this.data.unlockedArcs.push(arc);
      this.save();
    }
  }

  unlockStage(id: string): void {
    if (!this.data.unlockedStages.includes(id)) {
      this.data.unlockedStages.push(id);
      this.save();
    }
  }

  unlockShip(ship: ShipId): void {
    if (!this.data.unlockedShips.includes(ship)) {
      this.data.unlockedShips.push(ship);
      this.save();
    }
  }

  recordScore(stageId: string, score: number): void {
    const prev = this.data.highScores[stageId] ?? 0;
    if (score > prev) {
      this.data.highScores[stageId] = score;
      this.save();
    }
  }

  markCodex(id: string): void {
    if (!this.data.codexSeen.includes(id)) {
      this.data.codexSeen.push(id);
      this.save();
    }
  }

  onCampaignStageClear(arc: number, stageIndex: number, stageId: string): void {
    this.unlockStage(stageId);
    if (stageIndex >= 7 || stageIndex >= 8) this.unlockArc(Math.min(5, arc + 1));
    if (arc >= 3) this.unlockShip("lordBritish");
    if (arc >= 4) this.unlockShip("shadowGear");
    if (arc >= 5) this.unlockShip("falchionBeta");
    this.data.campaignArc = arc;
    this.data.campaignStage = stageIndex;
    this.save();
  }

  getProgressPct(): number {
    return Math.round((this.data.unlockedStages.length / TOTAL_STAGES) * 100);
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.data = { ...DEFAULT, ...JSON.parse(raw) };
    } catch {
      this.data = { ...DEFAULT };
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      /* quota */
    }
  }
}

export const hangarStore = new HangarStore();

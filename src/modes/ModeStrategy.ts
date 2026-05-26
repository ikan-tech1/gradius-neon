import type { GameModeId, ShipId } from "../config";
import type { Loadout } from "../entities/types";
import type { PowerSlotId } from "../config/powerUps";
import { hangarStore } from "../meta/HangarStore";
import { getStage } from "../game/stages/stageFactory";

export interface ModeStrategy {
  id: GameModeId;
  label: string;
  startArc: number;
  startStage: number;
  allPowerUps: boolean;
  spreadEnabled: boolean;
  chargeEnabled: boolean;
  rippleEnabled: boolean;
  isBossRush: boolean;
  loadout: Loadout;
  onStageClear?: (arc: number, stage: number) => void;
}

export function defaultLoadout(ship: ShipId = "vicViper"): Loadout {
  return {
    ship,
    primary: "normal",
    optionMode: "trail",
  };
}

export function createCampaignMode(): ModeStrategy {
  return {
    id: "campaign",
    label: "Campaign",
    startArc: 1,
    startStage: 1,
    allPowerUps: false,
    spreadEnabled: false,
    chargeEnabled: false,
    rippleEnabled: false,
    isBossRush: false,
    loadout: defaultLoadout(),
    onStageClear: (arc, stage) => {
      const s = getStage(arc, stage);
      if (s) hangarStore.onCampaignStageClear(arc, stage, s.id);
    },
  };
}

export function createArcadeMode(): ModeStrategy {
  return {
    id: "arcade",
    label: "Arcade",
    startArc: 1,
    startStage: 1,
    allPowerUps: true,
    spreadEnabled: true,
    chargeEnabled: true,
    rippleEnabled: true,
    isBossRush: false,
    loadout: defaultLoadout(),
  };
}

export function createScoreAttackMode(arc = 1, stage = 1): ModeStrategy {
  return {
    id: "scoreAttack",
    label: "Score Attack",
    startArc: arc,
    startStage: stage,
    allPowerUps: false,
    spreadEnabled: true,
    chargeEnabled: false,
    rippleEnabled: true,
    isBossRush: false,
    loadout: defaultLoadout(),
  };
}

export function createCoopMode(): ModeStrategy {
  return {
    id: "coop",
    label: "Co-op",
    startArc: 3,
    startStage: 1,
    allPowerUps: false,
    spreadEnabled: true,
    chargeEnabled: false,
    rippleEnabled: true,
    isBossRush: false,
    loadout: defaultLoadout("lordBritish"),
  };
}

export function createBossRushMode(): ModeStrategy {
  return {
    id: "bossRush",
    label: "Boss Rush",
    startArc: 1,
    startStage: 7,
    allPowerUps: true,
    spreadEnabled: true,
    chargeEnabled: true,
    rippleEnabled: true,
    isBossRush: true,
    loadout: defaultLoadout(),
  };
}

export function createModeWithEdit(
  ship: ShipId,
  startSlot?: PowerSlotId,
  optionMode: Loadout["optionMode"] = "trail"
): ModeStrategy {
  return {
    ...createCampaignMode(),
    loadout: { ship, primary: "normal", editStartSlot: startSlot, optionMode },
  };
}

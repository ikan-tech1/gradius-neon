import type { ShipId } from "./index";

export interface ShipProfile {
  id: ShipId;
  label: string;
  speedMult: number;
  fireRateMult: number;
  defaultWeapon: "normal" | "ripple" | "spread";
  unlockArc: number;
}

export const SHIP_PROFILES: Record<ShipId, ShipProfile> = {
  vicViper: {
    id: "vicViper",
    label: "Vic Viper",
    speedMult: 1,
    fireRateMult: 1,
    defaultWeapon: "normal",
    unlockArc: 0,
  },
  lordBritish: {
    id: "lordBritish",
    label: "Lord British",
    speedMult: 1.05,
    fireRateMult: 0.95,
    defaultWeapon: "ripple",
    unlockArc: 3,
  },
  shadowGear: {
    id: "shadowGear",
    label: "Shadow Gear",
    speedMult: 1.1,
    fireRateMult: 1.1,
    defaultWeapon: "spread",
    unlockArc: 4,
  },
  falchionBeta: {
    id: "falchionBeta",
    label: "Falchion β",
    speedMult: 1.08,
    fireRateMult: 1.15,
    defaultWeapon: "normal",
    unlockArc: 5,
  },
};

import { CANVAS_HEIGHT } from "./index";

export type PrimaryWeapon = "normal" | "double" | "laser" | "ripple" | "spread" | "charge";

export interface WeaponProfile {
  id: PrimaryWeapon;
  label: string;
  fireRate: number;
  damage: number;
  pierce: boolean;
  spread: number;
}

export const WEAPON_PROFILES: Record<PrimaryWeapon, WeaponProfile> = {
  normal: { id: "normal", label: "Normal", fireRate: 0.12, damage: 1, pierce: false, spread: 0 },
  double: { id: "double", label: "Double", fireRate: 0.14, damage: 1, pierce: false, spread: 12 },
  laser: { id: "laser", label: "Laser", fireRate: 0.08, damage: 2, pierce: true, spread: 0 },
  ripple: { id: "ripple", label: "Ripple Laser", fireRate: 0.16, damage: 1, pierce: false, spread: 18 },
  spread: { id: "spread", label: "Type 2", fireRate: 0.18, damage: 1, pierce: false, spread: 24 },
  charge: { id: "charge", label: "Charge Shot", fireRate: 0.35, damage: 4, pierce: true, spread: 0 },
};

export const MISSILE_SPEED = 320;
export const MISSILE_GROUND_Y = CANVAS_HEIGHT - 8;

import type { StageTheme } from "../config";
import type { BossId } from "../game/stages/types";
import type { PowerSlotId } from "../config/powerUps";
import type { PrimaryWeapon } from "../config/weapons";
import type { ShipId } from "../config/index";

export type EnemyTypeId =
  | "turret"
  | "scout"
  | "carrier"
  | "moai"
  | "mine"
  | "diver"
  | "wall"
  | "tentacle"
  | "crusher"
  | "serpent"
  | "organ"
  | "bomber"
  | "sineWave"
  | "pincer"
  | "rotator"
  | "spawner"
  | "crystal"
  | "gate"
  | "elite"
  | "branchMarker";

export interface Projectile {
  id: number;
  active: boolean;
  fromPlayer: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  damage: number;
  pierce: boolean;
  laser: boolean;
  missile: boolean;
  optionId?: number;
}

export interface Enemy {
  id: number;
  type: EnemyTypeId;
  alive: boolean;
  worldX: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  score: number;
  vx: number;
  vy: number;
  phase: number;
  fireTimer: number;
  dropsCapsule: boolean;
  capsuleRed: boolean;
  onGround: boolean;
  weakPointOnly: boolean;
}

export interface Capsule {
  id: number;
  active: boolean;
  worldX: number;
  y: number;
  red: boolean;
  w: number;
  h: number;
}

export interface OptionPod {
  id: number;
  active: boolean;
  x: number;
  y: number;
  trailIndex: number;
  mode: "trail" | "rotate" | "formation";
}

export interface Boss {
  id: number;
  bossId: BossId;
  active: boolean;
  worldX: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  phase: number;
  coreExposed: boolean;
  barrierHp: number;
  score: number;
}

export interface Particle {
  id: number;
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: number;
  size: number;
}

export interface TerrainTile {
  id: number;
  worldX: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  theme: StageTheme;
}

export interface Loadout {
  ship: ShipId;
  primary: PrimaryWeapon;
  editStartSlot?: PowerSlotId;
  optionMode: "trail" | "rotate" | "formation";
}

export interface PlayerState {
  screenX: number;
  y: number;
  speedLevel: number;
  shieldHits: number;
  missile: boolean;
  weapon: PrimaryWeapon;
  options: OptionPod[];
}

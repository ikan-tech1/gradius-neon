import type { StageTheme } from "../../config";
import type { EnemyTypeId } from "../../entities/types";

export type BossId =
  | "bigCore1"
  | "bigCore2"
  | "bigCore3"
  | "moai"
  | "tetran"
  | "intruder"
  | "fortressGate"
  | "crystal"
  | "gofer"
  | "brain"
  | "stomach"
  | "bacterian"
  | "none";

export interface StageSegment {
  at: number;
  spawn?: string;
  type?: EnemyTypeId;
  count?: number;
  x?: number;
  y?: number;
  boss?: BossId;
  capsule?: "red" | "blue";
  message?: string;
  branch?: "a" | "b";
}

export interface StageScript {
  id: string;
  arc: number;
  index: number;
  name: string;
  theme: StageTheme;
  scrollSpeed: number;
  vertical?: boolean;
  length: number;
  segments: StageSegment[];
  boss: BossId;
  music: string;
}

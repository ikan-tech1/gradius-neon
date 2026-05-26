export type Difficulty = "casual" | "classic" | "insane";
export type GameModeId = "campaign" | "arcade" | "scoreAttack" | "coop" | "bossRush";
export type ShipId = "vicViper" | "lordBritish" | "shadowGear" | "falchionBeta";
export type StageTheme =
  | "space"
  | "storm"
  | "plant"
  | "moai"
  | "fire"
  | "mechanical"
  | "cell"
  | "volcano"
  | "crystal"
  | "organic"
  | "fortress"
  | "branch";

export const CANVAS_WIDTH = 512;
export const CANVAS_HEIGHT = 288;

export const COLORS = {
  bg: "#06060f",
  accent: "#00e8ff",
  magenta: "#ff3d9a",
  gold: "#ffd24a",
  danger: "#ff4466",
  shield: "#5dffb0",
  text: "#e8f4ff",
  textDim: "#7a9bb8",
  player: "#00e8ff",
  boss: "#ff4466",
  core: "#4488ff",
  capsuleRed: "#ff2244",
  capsuleBlue: "#2266ff",
};

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { lives: number; speedMult: number; fireMult: number; enemyFireChance: number }
> = {
  casual: { lives: 5, speedMult: 0.75, fireMult: 0.7, enemyFireChance: 0.3 },
  classic: { lives: 3, speedMult: 1, fireMult: 1, enemyFireChance: 0.5 },
  insane: { lives: 2, speedMult: 1.35, fireMult: 1.3, enemyFireChance: 0.72 },
};

export const PLAYER_X_MIN = 80;
export const PLAYER_X_MAX = 160;
export const PLAYER_Y_MIN = 40;
export const PLAYER_Y_MAX = CANVAS_HEIGHT - 40;
export const PLAYER_SPEED = 220;
export const PLAYER_W = 32;
export const PLAYER_H = 20;
export const BULLET_SPEED = 480;
export const ENEMY_BULLET_SPEED = 200;
export const BASE_SCROLL_SPEED = 120;
export const INVULN_TIME = 2.5;
export const WAVE_BANNER_MS = 1600;
export const STAGE_INTERSTITIAL_MS = 3800;
export const CONTINUE_MS = 8000;
export const MAX_OPTIONS = 4;
export const TOTAL_STAGES = 35;

export const MODE_LABELS: Record<GameModeId, string> = {
  campaign: "Campaign",
  arcade: "Arcade",
  scoreAttack: "Score Attack",
  coop: "Co-op",
  bossRush: "Boss Rush",
};

export const SHIP_LABELS: Record<ShipId, string> = {
  vicViper: "Vic Viper",
  lordBritish: "Lord British",
  shadowGear: "Shadow Gear",
  falchionBeta: "Falchion β",
};

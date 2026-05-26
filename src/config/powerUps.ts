export type PowerSlotId =
  | "speed"
  | "missile"
  | "double"
  | "laser"
  | "option"
  | "mystery"
  | "shield";

export const POWER_BAR_SLOTS: PowerSlotId[] = [
  "speed",
  "missile",
  "double",
  "laser",
  "option",
  "mystery",
  "shield",
];

export const POWER_SLOT_LABELS: Record<PowerSlotId, string> = {
  speed: "SPEED UP",
  missile: "MISSILE",
  double: "DOUBLE",
  laser: "LASER",
  option: "OPTION",
  mystery: "?",
  shield: "SHIELD",
};

export const MAX_SPEED_LEVEL = 5;
export const MAX_SHIELD_HITS = 3;

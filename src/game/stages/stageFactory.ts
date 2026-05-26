import type { BossId, StageScript, StageSegment } from "./types";
import type { StageTheme } from "../../config";
function segs(...items: StageSegment[]): StageSegment[] {
  return items;
}

function stage(
  id: string,
  arc: number,
  index: number,
  name: string,
  theme: StageTheme,
  boss: BossId,
  music: string,
  length: number,
  segments: StageSegment[],
  opts?: { scrollSpeed?: number; vertical?: boolean }
): StageScript {
  return {
    id,
    arc,
    index,
    name,
    theme,
    scrollSpeed: opts?.scrollSpeed ?? 1,
    vertical: opts?.vertical,
    length,
    segments,
    boss,
    music,
  };
}

export const ARC1_STAGES: StageScript[] = [
  stage("arc1-1", 1, 1, "Space", "space", "none", "space", 14000, segs(
    { at: 400, spawn: "turretPair", type: "turret", count: 2 },
    { at: 1200, spawn: "formation", type: "scout", count: 6 },
    { at: 2800, spawn: "carrier", type: "carrier", count: 1, capsule: "red" },
    { at: 5000, spawn: "formation", type: "sineWave", count: 8 }
  )),
  stage("arc1-2", 1, 2, "Storm", "storm", "none", "storm", 15000, segs(
    { at: 600, spawn: "formation", type: "scout", count: 5 },
    { at: 2000, spawn: "turretPair", type: "turret", count: 3 },
    { at: 4000, spawn: "carrier", type: "carrier", count: 1, capsule: "blue" }
  ), { scrollSpeed: 1.1 }),
  stage("arc1-3", 1, 3, "Plant", "plant", "intruder", "plant", 16000, segs(
    { at: 800, spawn: "formation", type: "tentacle", count: 4 },
    { at: 2500, spawn: "carrier", type: "carrier", count: 1, capsule: "red" },
    { at: 6000, spawn: "formation", type: "scout", count: 8 },
    { at: 11000, boss: "intruder", message: "INTRUDER!" }
  )),
  stage("arc1-4", 1, 4, "Moai", "moai", "moai", "moai", 17000, segs(
    { at: 500, spawn: "formation", type: "moai", count: 3 },
    { at: 3000, spawn: "formation", type: "scout", count: 6 },
    { at: 7000, spawn: "carrier", type: "carrier", count: 1, capsule: "red" },
    { at: 12000, boss: "moai", message: "DESTROY THE EYE!" }
  )),
  stage("arc1-5", 1, 5, "Fire", "fire", "none", "fire", 16000, segs(
    { at: 700, spawn: "formation", type: "bomber", count: 5 },
    { at: 2800, spawn: "turretPair", type: "turret", count: 4 },
    { at: 5500, spawn: "carrier", type: "carrier", count: 1, capsule: "blue" }
  ), { scrollSpeed: 1.15 }),
  stage("arc1-6", 1, 6, "Mechanical", "mechanical", "fortressGate", "mechanical", 18000, segs(
    { at: 900, spawn: "formation", type: "crusher", count: 4 },
    { at: 3500, spawn: "formation", type: "wall", count: 6 },
    { at: 8000, spawn: "elite", type: "elite", count: 2, capsule: "red" },
    { at: 13000, boss: "fortressGate" }
  )),
  stage("arc1-7", 1, 7, "Cell", "cell", "bigCore1", "cell", 20000, segs(
    { at: 600, spawn: "formation", type: "tentacle", count: 6 },
    { at: 3000, spawn: "carrier", type: "carrier", count: 2, capsule: "red" },
    { at: 7000, spawn: "formation", type: "serpent", count: 5 },
    { at: 14000, boss: "bigCore1", message: "BIG CORE MK-I" }
  )),
];

export const ARC2_STAGES: StageScript[] = [
  stage("arc2-1", 2, 1, "Volcanic Zone", "volcano", "none", "volcano", 15000, segs(
    { at: 500, spawn: "formation", type: "scout", count: 6 },
    { at: 2500, spawn: "carrier", type: "carrier", count: 1, capsule: "red" }
  )),
  stage("arc2-2", 2, 2, "High Speed", "space", "none", "speed", 14000, segs(
    { at: 400, spawn: "formation", type: "diver", count: 8 }
  ), { scrollSpeed: 1.3 }),
  stage("arc2-3", 2, 3, "Fortress", "fortress", "tetran", "fortress", 17000, segs(
    { at: 2000, spawn: "formation", type: "wall", count: 8 },
    { at: 9000, boss: "tetran" }
  )),
  stage("arc2-4", 2, 4, "Plant II", "plant", "intruder", "plant", 16000, segs(
    { at: 1500, spawn: "formation", type: "tentacle", count: 6 },
    { at: 8000, boss: "intruder" }
  )),
  stage("arc2-5", 2, 5, "Crystal", "crystal", "crystal", "crystal", 18000, segs(
    { at: 1000, spawn: "formation", type: "crystal", count: 10 },
    { at: 10000, boss: "crystal" }
  )),
  stage("arc2-6", 2, 6, "Moai DX", "moai", "moai", "moai", 17000, segs(
    { at: 800, spawn: "formation", type: "moai", count: 5 },
    { at: 9000, boss: "moai" }
  )),
  stage("arc2-7", 2, 7, "Core Reactor", "mechanical", "bigCore2", "core", 19000, segs(
    { at: 3000, spawn: "elite", type: "elite", count: 3, capsule: "blue" },
    { at: 12000, boss: "bigCore2" }
  )),
  stage("arc2-8", 2, 8, "Gofer", "cell", "gofer", "finale", 22000, segs(
    { at: 2000, spawn: "formation", type: "serpent", count: 8 },
    { at: 12000, boss: "gofer", message: "GOFER!" }
  )),
];

export const ARC3_STAGES: StageScript[] = [
  stage("arc3-1", 3, 1, "Asteroid", "space", "none", "salamander", 14000, segs(
    { at: 600, spawn: "formation", type: "scout", count: 8 }
  )),
  stage("arc3-2", 3, 2, "Organic", "organic", "none", "organic", 15000, segs(
    { at: 800, spawn: "formation", type: "tentacle", count: 6 }
  )),
  stage("arc3-3", 3, 3, "Vertical Shaft", "mechanical", "none", "vertical", 12000, segs(
    { at: 400, spawn: "formation", type: "diver", count: 6 }
  ), { vertical: true }),
  stage("arc3-4", 3, 4, "Stomach", "organic", "stomach", "organ", 16000, segs(
    { at: 2000, spawn: "formation", type: "organ", count: 3 },
    { at: 9000, boss: "stomach", message: "LIFE FORCE" }
  )),
  stage("arc3-5", 3, 5, "Brain", "cell", "brain", "brain", 17000, segs(
    { at: 1500, spawn: "formation", type: "organ", count: 4 },
    { at: 9500, boss: "brain" }
  )),
  stage("arc3-6", 3, 6, "Fortress Core", "fortress", "bigCore2", "finale", 18000, segs(
    { at: 2500, spawn: "carrier", type: "carrier", count: 2, capsule: "red" },
    { at: 11000, boss: "bigCore2" }
  )),
];

export const ARC4_STAGES: StageScript[] = Array.from({ length: 10 }, (_, i) => {
  const n = i + 1;
  const themes: StageTheme[] = [
    "space", "storm", "plant", "moai", "fire", "mechanical", "cell", "crystal", "fortress", "cell",
  ];
  const bosses: BossId[] = [
    "none", "none", "intruder", "moai", "none", "fortressGate", "tetran", "crystal", "bigCore2", "bigCore3",
  ];
  return stage(
    `arc4-${n}`,
    4,
    n,
    `Dimensional ${n}`,
    themes[i]!,
    bosses[i]!,
    `arc4-${n}`,
    15000 + n * 500,
    segs(
      { at: 800, spawn: "formation", type: "elite", count: 4 + (n % 3) },
      { at: 3000 + n * 200, spawn: "carrier", type: "carrier", count: 1, capsule: n % 2 ? "red" : "blue" },
      ...(bosses[i] !== "none" ? [{ at: 12000, boss: bosses[i]! }] : [])
    ),
    { scrollSpeed: 1 + n * 0.03 }
  );
});

export const ARC5_STAGES: StageScript[] = [
  stage("arc5-1", 5, 1, "Branch Alpha", "branch", "none", "branch", 12000, segs(
    { at: 4000, branch: "a", message: "ROUTE A" },
    { at: 6000, spawn: "formation", type: "scout", count: 8 }
  )),
  stage("arc5-2", 5, 2, "Branch Beta", "branch", "none", "branch", 12000, segs(
    { at: 4000, branch: "b", message: "ROUTE B" },
    { at: 6000, spawn: "formation", type: "elite", count: 6 }
  )),
  stage("arc5-3", 5, 3, "Overdrive", "fire", "bigCore3", "overdrive", 16000, segs(
    { at: 2000, spawn: "formation", type: "bomber", count: 8 },
    { at: 10000, boss: "bigCore3" }
  ), { scrollSpeed: 1.2 }),
  stage("arc5-4", 5, 4, "Bacterian", "cell", "bacterian", "finale", 24000, segs(
    { at: 1500, spawn: "formation", type: "serpent", count: 10 },
    { at: 5000, spawn: "carrier", type: "carrier", count: 3, capsule: "red" },
    { at: 14000, boss: "bacterian", message: "BACTERIAN" }
  )),
];

export const ALL_STAGES: StageScript[] = [
  ...ARC1_STAGES,
  ...ARC2_STAGES,
  ...ARC3_STAGES,
  ...ARC4_STAGES,
  ...ARC5_STAGES,
];

export function getStage(arc: number, index: number): StageScript | undefined {
  return ALL_STAGES.find((s) => s.arc === arc && s.index === index);
}

export function getStageById(id: string): StageScript | undefined {
  return ALL_STAGES.find((s) => s.id === id);
}

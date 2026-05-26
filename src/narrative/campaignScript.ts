export function getArcTitle(arc: number): string {
  switch (arc) {
    case 1:
      return "ARC I — NEMESIS";
    case 2:
      return "ARC II — VULCAN";
    case 3:
      return "ARC III — SALAMANDER";
    case 4:
      return "ARC IV — DIMENSIONAL";
    case 5:
      return "ARC V — FUSION";
    default:
      return "GRADIUS NEON";
  }
}

export function getBriefing(arc: number, stage: number): string {
  const lines: Record<number, string> = {
    1: "Pierce the Bacterian front line. Destroy the core.",
    2: "Ripple lasers online. Multiple loop endings detected.",
    3: "Bio-mechanical zone. Co-op formation recommended.",
    4: "Edit Mode authorized. Shadow Gear clearance pending.",
    5: "Branch vectors open. Overdrive gauge calibrated.",
  };
  return `${getArcTitle(arc)} · Stage ${stage}\n${lines[arc] ?? "Advance. Survive. Destroy the core."}`;
}

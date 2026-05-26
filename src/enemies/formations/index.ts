import type { EnemyTypeId } from "../../entities/types";
import { spawnEnemy } from "../EnemyBehavior";

export function spawnFormation(
  type: EnemyTypeId,
  worldX: number,
  baseY: number,
  count: number
): ReturnType<typeof spawnEnemy>[] {
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(spawnEnemy(type, worldX + i * 36, baseY + Math.sin(i) * 24));
  }
  return out;
}

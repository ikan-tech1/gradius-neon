import * as THREE from "three";
import { COLORS, PLAYER_H, PLAYER_W } from "../config";
import type { EnemyTypeId } from "../entities/types";

const ENEMY_COLORS: Partial<Record<EnemyTypeId, number>> = {
  turret: 0xff6644,
  scout: 0x00e8ff,
  carrier: 0xffd24a,
  moai: 0xc8a060,
  mine: 0xff4466,
  tentacle: 0x44ff88,
  crusher: 0x8888aa,
  serpent: 0xb366ff,
  organ: 0xff3d9a,
};

export function createPlayerMesh(shipTint = 0x00e8ff): THREE.Group {
  const group = new THREE.Group();
  const glow = new THREE.Mesh(
    new THREE.CircleGeometry(22, 16),
    new THREE.MeshBasicMaterial({ color: shipTint, transparent: true, opacity: 0.2 })
  );
  glow.position.z = -2;
  group.add(glow);

  const body = new THREE.Mesh(
    new THREE.ConeGeometry(10, PLAYER_H + 6, 4),
    new THREE.MeshBasicMaterial({ color: shipTint })
  );
  body.rotation.z = Math.PI;
  body.position.y = 4;
  group.add(body);

  const wings = new THREE.Mesh(
    new THREE.BoxGeometry(PLAYER_W + 8, 8, 2),
    new THREE.MeshBasicMaterial({ color: 0x66f0ff })
  );
  group.add(wings);

  const cockpit = new THREE.Mesh(
    new THREE.BoxGeometry(10, 8, 3),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  cockpit.position.set(0, 6, 2);
  group.add(cockpit);

  const engine = new THREE.Mesh(
    new THREE.BoxGeometry(6, 10, 2),
    new THREE.MeshBasicMaterial({ color: 0xff3d9a })
  );
  engine.position.set(0, -10, 0);
  engine.name = "engine";
  group.add(engine);

  return group;
}

export function createEnemyMesh(type: EnemyTypeId): THREE.Group {
  const color = ENEMY_COLORS[type] ?? 0xff6644;
  const group = new THREE.Group();
  if (type === "moai") {
    const face = new THREE.Mesh(
      new THREE.BoxGeometry(28, 36, 4),
      new THREE.MeshBasicMaterial({ color })
    );
    group.add(face);
    const eye = new THREE.Mesh(
      new THREE.CircleGeometry(4, 8),
      new THREE.MeshBasicMaterial({ color: COLORS.core })
    );
    eye.position.set(0, 4, 3);
    eye.name = "weakPoint";
    group.add(eye);
  } else if (type === "carrier") {
    const hull = new THREE.Mesh(
      new THREE.CapsuleGeometry(14, 8, 4, 8),
      new THREE.MeshBasicMaterial({ color })
    );
    group.add(hull);
  } else {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(24, 18, 2),
      new THREE.MeshBasicMaterial({ color })
    );
    group.add(body);
  }
  return group;
}

export function createProjectileMesh(fromPlayer: boolean, laser = false): THREE.Mesh {
  if (laser) {
    return new THREE.Mesh(
      new THREE.BoxGeometry(fromPlayer ? 28 : 12, 3, 2),
      new THREE.MeshBasicMaterial({ color: fromPlayer ? 0x88ffff : COLORS.danger })
    );
  }
  return new THREE.Mesh(
    new THREE.CircleGeometry(fromPlayer ? 3 : 2.5, 8),
    new THREE.MeshBasicMaterial({ color: fromPlayer ? COLORS.accent : COLORS.danger })
  );
}

export function createCapsuleMesh(red: boolean): THREE.Group {
  const g = new THREE.Group();
  const cap = new THREE.Mesh(
    new THREE.CapsuleGeometry(6, 10, 4, 8),
    new THREE.MeshBasicMaterial({ color: red ? COLORS.capsuleRed : COLORS.capsuleBlue })
  );
  g.add(cap);
  return g;
}

export function createBossMesh(kind: string): THREE.Group {
  const group = new THREE.Group();
  const hull = new THREE.Mesh(
    new THREE.BoxGeometry(90, 50, 3),
    new THREE.MeshBasicMaterial({ color: COLORS.boss })
  );
  group.add(hull);
  const core = new THREE.Mesh(
    new THREE.CircleGeometry(12, 12),
    new THREE.MeshBasicMaterial({ color: COLORS.core })
  );
  core.name = "core";
  core.position.set(0, 0, 4);
  group.add(core);
  if (kind === "moai") {
    hull.scale.set(0.8, 1.2, 1);
  }
  return group;
}

export function createOptionMesh(): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.SphereGeometry(6, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x00e8ff, transparent: true, opacity: 0.85 })
  );
}

export function createParticleMesh(color: number): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.CircleGeometry(4, 6),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 })
  );
}

import * as THREE from "three";
import {
  createBossMesh,
  createCapsuleMesh,
  createEnemyMesh,
  createOptionMesh,
  createPlayerMesh,
  createProjectileMesh,
} from "../engine/AssetPool";
import type { SceneManager } from "../engine/SceneManager";
import type { GameSession } from "../game/GameSession";

export class EntityRenderer {
  private playerMesh = createPlayerMesh();
  private p2Mesh = createPlayerMesh(0xff3d9a);
  private chargeAura: THREE.Mesh;
  private enemyMeshes = new Map<number, THREE.Group>();
  private projectileMeshes = new Map<number, THREE.Mesh>();
  private capsuleMeshes = new Map<number, THREE.Group>();
  private optionMeshes = new Map<number, THREE.Mesh>();
  private terrainMeshes = new Map<number, THREE.Mesh>();
  private forceRamMesh: THREE.Mesh;
  private bossGroup: THREE.Group | null = null;
  private optionGlowTimers = new Map<number, number>();

  constructor(private scene: SceneManager) {
    scene.playGroup.add(this.playerMesh);
    this.p2Mesh.visible = false;
    scene.playGroup.add(this.p2Mesh);

    this.chargeAura = new THREE.Mesh(
      new THREE.RingGeometry(14, 20, 24),
      new THREE.MeshBasicMaterial({
        color: 0x00e8ff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      })
    );
    this.chargeAura.name = "chargeAura";
    scene.fxGroup.add(this.chargeAura);

    this.forceRamMesh = new THREE.Mesh(
      new THREE.CircleGeometry(10, 16),
      new THREE.MeshBasicMaterial({ color: 0x5dffb0, transparent: true, opacity: 0.65 })
    );
    this.forceRamMesh.visible = false;
    scene.playGroup.add(this.forceRamMesh);
  }

  sync(session: GameSession): void {
    const scrollX = session.getWorldOffset();
    const scrollY = session.getWorldOffsetY();
    const vertical = session.isVerticalStage();
    const { x, y, invuln } = session.getPlayerPos();
    this.playerMesh.position.copy(this.scene.simToWorld(x, y, 5));
    this.playerMesh.visible = !invuln || Math.floor(performance.now() / 100) % 2 === 0;

    const engine = this.playerMesh.getObjectByName("engine") as THREE.Mesh | undefined;
    if (engine) {
      const pulse = 0.9 + Math.sin(performance.now() / 80) * 0.15;
      engine.scale.set(1, pulse, 1);
      (engine.material as THREE.MeshBasicMaterial).color.setHex(0xff3d9a);
    }

    const charge = session.getChargeLevel();
    this.chargeAura.position.copy(this.scene.simToWorld(x, y, 7));
    const auraMat = this.chargeAura.material as THREE.MeshBasicMaterial;
    auraMat.opacity = charge > 0.1 ? 0.15 + charge * 0.45 : 0;
    this.chargeAura.scale.setScalar(0.8 + charge * 0.5);

    const p2 = session.getP2Pos();
    if (p2) {
      this.p2Mesh.visible = !p2.invuln || Math.floor(performance.now() / 100) % 2 === 0;
      this.p2Mesh.position.copy(this.scene.simToWorld(p2.x, p2.y, 4));
    } else {
      this.p2Mesh.visible = false;
    }

    const fr = session.forceRam.state;
    if (fr.active) {
      this.forceRamMesh.visible = true;
      this.forceRamMesh.position.copy(this.scene.simToWorld(fr.x, fr.y, 6));
      const mat = this.forceRamMesh.material as THREE.MeshBasicMaterial;
      mat.opacity = fr.detached ? 0.85 : 0.45;
      mat.color.setHex(fr.detached ? 0x00e8ff : 0x5dffb0);
    } else {
      this.forceRamMesh.visible = false;
    }

    this.syncEnemies(session.enemies, scrollX);
    this.syncProjectiles([
      ...session.weapons.pool.projectiles,
      ...session.p2Weapons.pool.projectiles,
    ]);
    this.syncCapsules(session.capsules, scrollX);
    this.syncOptions(session.options.pods);
    this.syncTerrain(session.getTerrainTiles(), scrollX, scrollY, vertical);
    this.syncBoss(session.boss, scrollX);
  }

  private syncTerrain(
    tiles: ReturnType<GameSession["getTerrainTiles"]>,
    scrollX: number,
    scrollY: number,
    vertical: boolean
  ): void {
    const active = new Set<number>();
    for (const t of tiles) {
      active.add(t.id);
      let mesh = this.terrainMeshes.get(t.id);
      if (!mesh) {
        mesh = new THREE.Mesh(
          new THREE.BoxGeometry(t.w, t.h, 3),
          new THREE.MeshBasicMaterial({
            color: t.hp <= 1 ? 0x444444 : 0x668866,
            transparent: true,
            opacity: t.hp <= 1 ? 0.5 : 0.85,
          })
        );
        this.scene.playGroup.add(mesh);
        this.terrainMeshes.set(t.id, mesh);
      }
      const sx = vertical ? t.worldX : t.worldX - scrollX;
      const sy = vertical ? t.y - scrollY : t.y;
      mesh.position.copy(this.scene.simToWorld(sx + t.w / 2, sy + t.h / 2, 0));
      mesh.scale.set(t.w / 48, t.h / 40, 1);
    }
    for (const [id, mesh] of this.terrainMeshes) {
      if (!active.has(id)) {
        this.scene.playGroup.remove(mesh);
        this.terrainMeshes.delete(id);
      }
    }
  }

  private syncEnemies(enemies: GameSession["enemies"], scrollX: number): void {
    const alive = new Set<number>();
    for (const e of enemies) {
      if (!e.alive) continue;
      alive.add(e.id);
      let mesh = this.enemyMeshes.get(e.id);
      if (!mesh) {
        mesh = createEnemyMesh(e.type);
        this.scene.playGroup.add(mesh);
        this.enemyMeshes.set(e.id, mesh);
      }
      const sx = e.worldX - scrollX;
      mesh.position.copy(this.scene.simToWorld(sx, e.y, 2));
    }
    for (const [id, mesh] of this.enemyMeshes) {
      if (!alive.has(id)) {
        this.scene.playGroup.remove(mesh);
        this.enemyMeshes.delete(id);
      }
    }
  }

  private syncProjectiles(
    projectiles: GameSession["weapons"]["pool"]["projectiles"]
  ): void {
    const active = new Set<number>();
    for (const p of projectiles) {
      if (!p.active) continue;
      active.add(p.id);
      let mesh = this.projectileMeshes.get(p.id);
      if (!mesh) {
        mesh = createProjectileMesh(p.fromPlayer, p.laser);
        this.scene.playGroup.add(mesh);
        this.projectileMeshes.set(p.id, mesh);
      }
      mesh.position.copy(this.scene.simToWorld(p.x, p.y, 6));
      if (p.laser) {
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.7 + Math.sin(performance.now() / 50) * 0.2;
      }
    }
    for (const [id, mesh] of this.projectileMeshes) {
      if (!active.has(id)) {
        this.scene.playGroup.remove(mesh);
        this.projectileMeshes.delete(id);
      }
    }
  }

  private syncCapsules(capsules: GameSession["capsules"], scrollX: number): void {
    const active = new Set<number>();
    for (const c of capsules) {
      if (!c.active) continue;
      active.add(c.id);
      let mesh = this.capsuleMeshes.get(c.id);
      if (!mesh) {
        mesh = createCapsuleMesh(c.red);
        this.scene.playGroup.add(mesh);
        this.capsuleMeshes.set(c.id, mesh);
      }
      mesh.position.copy(this.scene.simToWorld(c.worldX - scrollX, c.y, 3));
      mesh.rotation.z = performance.now() / 400;
    }
    for (const [id, mesh] of this.capsuleMeshes) {
      if (!active.has(id)) {
        this.scene.playGroup.remove(mesh);
        this.capsuleMeshes.delete(id);
      }
    }
  }

  private syncOptions(pods: GameSession["options"]["pods"]): void {
    const active = new Set<number>();
    for (const o of pods) {
      if (!o.active) continue;
      active.add(o.id);
      let mesh = this.optionMeshes.get(o.id);
      if (!mesh) {
        mesh = createOptionMesh();
        this.scene.playGroup.add(mesh);
        this.optionMeshes.set(o.id, mesh);
        this.optionGlowTimers.set(o.id, 0.6);
      }
      mesh.position.copy(this.scene.simToWorld(o.x, o.y, 4));
      const glowT = this.optionGlowTimers.get(o.id) ?? 0;
      if (glowT > 0) {
        this.optionGlowTimers.set(o.id, glowT - 0.016);
        mesh.scale.setScalar(1.2 + Math.sin(performance.now() / 60) * 0.15);
      } else {
        mesh.scale.setScalar(1);
      }
    }
    for (const [id, mesh] of this.optionMeshes) {
      if (!active.has(id)) {
        this.scene.playGroup.remove(mesh);
        this.optionMeshes.delete(id);
        this.optionGlowTimers.delete(id);
      }
    }
  }

  private syncBoss(boss: GameSession["boss"], scrollX: number): void {
    if (!boss?.active) {
      if (this.bossGroup) {
        this.scene.playGroup.remove(this.bossGroup);
        this.bossGroup = null;
      }
      return;
    }
    if (!this.bossGroup) {
      this.bossGroup = createBossMesh(boss.bossId);
      this.scene.playGroup.add(this.bossGroup);
    }
    const sx = boss.worldX - scrollX;
    this.bossGroup.position.copy(this.scene.simToWorld(sx, boss.y, 1));
    const core = this.bossGroup.getObjectByName("core") as THREE.Mesh | undefined;
    if (core) {
      const pulse = 0.85 + Math.sin(performance.now() / 200) * 0.15;
      core.scale.setScalar(pulse);
      (core.material as THREE.MeshBasicMaterial).color.setHex(
        boss.coreExposed ? 0x66aaff : 0x224488
      );
    }
  }

  dispose(): void {
    this.scene.playGroup.remove(this.playerMesh);
    this.scene.playGroup.remove(this.p2Mesh);
    this.scene.fxGroup.remove(this.chargeAura);
    this.scene.playGroup.remove(this.forceRamMesh);
    for (const m of this.enemyMeshes.values()) this.scene.playGroup.remove(m);
    for (const m of this.projectileMeshes.values()) this.scene.playGroup.remove(m);
    for (const m of this.capsuleMeshes.values()) this.scene.playGroup.remove(m);
    for (const m of this.optionMeshes.values()) this.scene.playGroup.remove(m);
    for (const m of this.terrainMeshes.values()) this.scene.playGroup.remove(m);
    if (this.bossGroup) this.scene.playGroup.remove(this.bossGroup);
    this.enemyMeshes.clear();
    this.projectileMeshes.clear();
    this.capsuleMeshes.clear();
    this.optionMeshes.clear();
    this.terrainMeshes.clear();
    this.bossGroup = null;
  }
}

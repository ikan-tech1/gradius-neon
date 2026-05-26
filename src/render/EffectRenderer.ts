import * as THREE from "three";
import { createParticleMesh } from "../engine/AssetPool";
import type { SceneManager } from "../engine/SceneManager";
import type { Particle } from "../entities/types";

export class EffectRenderer {
  private particleMeshes = new Map<number, THREE.Mesh>();

  constructor(private scene: SceneManager) {}

  sync(particles: Particle[]): void {
    const active = new Set<number>();
    for (const p of particles) {
      if (!p.active) continue;
      active.add(p.id);
      let mesh = this.particleMeshes.get(p.id);
      if (!mesh) {
        mesh = createParticleMesh(p.color);
        this.scene.fxGroup.add(mesh);
        this.particleMeshes.set(p.id, mesh);
      }
      mesh.position.copy(this.scene.simToWorld(p.x, p.y, 8));
      const scale = (p.life / p.maxLife) * p.size;
      mesh.scale.setScalar(scale);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = p.life / p.maxLife;
    }
    for (const [id, mesh] of this.particleMeshes) {
      if (!active.has(id)) {
        this.scene.fxGroup.remove(mesh);
        this.particleMeshes.delete(id);
      }
    }
  }

  dispose(): void {
    for (const mesh of this.particleMeshes.values()) {
      this.scene.fxGroup.remove(mesh);
    }
    this.particleMeshes.clear();
  }
}

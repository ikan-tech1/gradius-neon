import * as THREE from "three";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../config";
import type { StageTheme } from "../config";
import type { SceneManager } from "../engine/SceneManager";

const THEME_COLORS: Record<StageTheme, { bg: number; accent: number; mid: number }> = {
  space: { bg: 0x060618, accent: 0x4488ff, mid: 0x112244 },
  storm: { bg: 0x0a1020, accent: 0x88aaff, mid: 0x223355 },
  plant: { bg: 0x041208, accent: 0x44ff88, mid: 0x1a4422 },
  moai: { bg: 0x181008, accent: 0xc8a060, mid: 0x3a2818 },
  fire: { bg: 0x180804, accent: 0xff6644, mid: 0x442211 },
  mechanical: { bg: 0x101018, accent: 0x8888aa, mid: 0x2a2a3a },
  cell: { bg: 0x100818, accent: 0xff44aa, mid: 0x3a1844 },
  volcano: { bg: 0x140808, accent: 0xff4422, mid: 0x441811 },
  crystal: { bg: 0x081018, accent: 0x66ccff, mid: 0x1a3355 },
  organic: { bg: 0x081408, accent: 0xaa44ff, mid: 0x2a1844 },
  fortress: { bg: 0x0c0c14, accent: 0x6666aa, mid: 0x2a2a44 },
  branch: { bg: 0x080818, accent: 0x00e8ff, mid: 0x1a2244 },
};

export class BackgroundRenderer {
  private theme: StageTheme = "space";
  private meshes: THREE.Object3D[] = [];

  constructor(private scene: SceneManager) {}

  setTheme(theme: StageTheme): void {
    if (theme === this.theme && this.meshes.length) return;
    this.theme = theme;
    this.clear();
    const colors = THEME_COLORS[theme];
    for (let layer = 0; layer < 3; layer++) {
      const g = this.scene.parallaxLayers[layer]!;
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(CANVAS_WIDTH * 2.5, CANVAS_HEIGHT + 40),
        new THREE.MeshBasicMaterial({
          color: layer === 0 ? colors.bg : layer === 1 ? colors.mid : colors.accent,
          transparent: true,
          opacity: layer === 0 ? 1 : 0.15 + layer * 0.12,
        })
      );
      plane.position.z = -40 - layer * 15;
      plane.position.y = layer * 8;
      g.add(plane);
      this.meshes.push(plane);

      const starCount = 30 - layer * 8;
      const positions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * CANVAS_WIDTH * 2;
        positions[i * 3 + 1] = (Math.random() - 0.5) * CANVAS_HEIGHT;
        positions[i * 3 + 2] = 0;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const pts = new THREE.Points(
        geo,
        new THREE.PointsMaterial({
          color: 0xffffff,
          size: 1.2 + layer,
          transparent: true,
          opacity: 0.5,
        })
      );
      g.add(pts);
      this.meshes.push(pts);
    }
  }

  update(scrollOffset: number, dt: number, vertical = false): void {
    this.scene.updateParallax(scrollOffset, dt, vertical);
  }

  private clear(): void {
    for (const layer of this.scene.parallaxLayers) layer.clear();
    this.meshes = [];
  }
}

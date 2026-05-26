import * as THREE from "three";
import type { ShipId } from "../../config";
import { SHIP_LABELS } from "../../config";
import { createPlayerMesh } from "../../engine/AssetPool";

const SHIP_TINTS: Record<ShipId, number> = {
  vicViper: 0x00e8ff,
  lordBritish: 0xffd24a,
  shadowGear: 0xb366ff,
  falchionBeta: 0xff6644,
};

let activePreview: HangarShipPreview | null = null;

export function mountShipPreview(container: HTMLElement, shipId: ShipId): void {
  unmountShipPreview();
  const canvas = document.createElement("canvas");
  canvas.className = "ship-preview-canvas";
  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "preview-wrap";
  wrap.innerHTML = `<span class="preview-ship-label">${SHIP_LABELS[shipId]}</span>`;
  wrap.appendChild(canvas);
  container.appendChild(wrap);
  activePreview = new HangarShipPreview(canvas, shipId);
  activePreview.start();
}

export function updateShipPreview(shipId: ShipId): void {
  activePreview?.setShip(shipId);
  const label = document.querySelector(".preview-ship-label");
  if (label) label.textContent = SHIP_LABELS[shipId];
}

export function unmountShipPreview(): void {
  activePreview?.stop();
  activePreview = null;
}

class HangarShipPreview {
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private ship: THREE.Group | null = null;
  private stars: THREE.Points | null = null;
  private platform: THREE.Mesh | null = null;
  private keyLight: THREE.PointLight | null = null;
  private raf = 0;
  private clock = new THREE.Clock();
  private resizeObserver: ResizeObserver | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private shipId: ShipId
  ) {}

  start(): void {
    this.stop();
    const tint = SHIP_TINTS[this.shipId];

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06060f);
    scene.fog = new THREE.FogExp2(0x06060f, 0.014);
    this.scene = scene;

    const camera = new THREE.PerspectiveCamera(38, 1.45, 0.1, 400);
    camera.position.set(0, 10, 58);
    camera.lookAt(0, 4, 0);
    this.camera = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer = renderer;

    scene.add(new THREE.AmbientLight(0x334466, 0.55));
    const key = new THREE.PointLight(tint, 1.3, 120);
    key.position.set(16, 24, 36);
    scene.add(key);
    this.keyLight = key;

    const rim = new THREE.PointLight(0xff3d9a, 0.55, 100);
    rim.position.set(-20, -6, 28);
    scene.add(rim);

    const starGeo = new THREE.BufferGeometry();
    const count = 220;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 140;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 90;
      positions[i * 3 + 2] = -16 - Math.random() * 70;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        color: 0x88eeff,
        size: 1.1,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true,
      })
    );
    scene.add(stars);
    this.stars = stars;

    const platform = new THREE.Mesh(
      new THREE.RingGeometry(12, 20, 32),
      new THREE.MeshBasicMaterial({
        color: tint,
        transparent: true,
        opacity: 0.32,
        side: THREE.DoubleSide,
      })
    );
    platform.rotation.x = -Math.PI / 2;
    platform.position.y = -10;
    scene.add(platform);
    this.platform = platform;

    const ship = createPlayerMesh(tint);
    ship.position.y = 2;
    scene.add(ship);
    this.ship = ship;

    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas);

    const tick = () => {
      this.raf = requestAnimationFrame(tick);
      this.frame();
    };
    tick();
  }

  setShip(shipId: ShipId): void {
    if (shipId === this.shipId) return;
    this.shipId = shipId;
    const tint = SHIP_TINTS[shipId];
    if (this.ship) {
      this.scene?.remove(this.ship);
      const ship = createPlayerMesh(tint);
      ship.position.y = 2;
      this.scene?.add(ship);
      this.ship = ship;
    }
    if (this.keyLight) this.keyLight.color.setHex(tint);
    if (this.platform?.material instanceof THREE.MeshBasicMaterial) {
      this.platform.material.color.setHex(tint);
    }
  }

  private resize(): void {
    if (!this.renderer || !this.camera) return;
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width || 280));
    const h = Math.max(1, Math.floor(rect.height || w * 0.62));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private frame(): void {
    if (!this.renderer || !this.scene || !this.camera || !this.ship) return;
    const t = this.clock.getElapsedTime();
    this.ship.rotation.y = t * 0.6;
    this.ship.position.y = 2 + Math.sin(t * 1.5) * 1.6;
    this.ship.rotation.z = Math.sin(t * 0.85) * 0.05;

    if (this.stars) {
      const pos = this.stars.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        pos.setZ(i, pos.getZ(i) + 0.05);
        if (pos.getZ(i) > 8) pos.setZ(i, -80 - Math.random() * 20);
      }
      pos.needsUpdate = true;
    }

    if (this.platform) {
      this.platform.rotation.z = t * 0.22;
      const mat = this.platform.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.26 + Math.sin(t * 2) * 0.07;
    }

    this.renderer.render(this.scene, this.camera);
  }

  stop(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.renderer?.dispose();
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.ship = null;
    this.stars = null;
    this.platform = null;
    this.keyLight = null;
    this.clock = new THREE.Clock();
  }
}

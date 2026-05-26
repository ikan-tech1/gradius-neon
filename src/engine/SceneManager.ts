import * as THREE from "three";
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS } from "../config";
import { PostPipeline } from "./PostPipeline";

export class SceneManager {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.OrthographicCamera;
  readonly post: PostPipeline;
  readonly playGroup = new THREE.Group();
  readonly bgGroup = new THREE.Group();
  readonly fxGroup = new THREE.Group();
  readonly parallaxLayers: THREE.Group[] = [];

  private shakeTimer = 0;
  private shakeIntensity = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(COLORS.bg);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x06060f, 0.0008);

    const halfW = CANVAS_WIDTH / 2;
    const halfH = CANVAS_HEIGHT / 2;
    this.camera = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, 1, 800);
    this.camera.position.set(0, 0, 400);
    this.camera.lookAt(0, 0, 0);

    this.scene.add(this.bgGroup);
    this.scene.add(this.playGroup);
    this.scene.add(this.fxGroup);

    for (let i = 0; i < 3; i++) {
      const layer = new THREE.Group();
      layer.name = `parallax-${i}`;
      this.bgGroup.add(layer);
      this.parallaxLayers.push(layer);
    }

    this.post = new PostPipeline(this.renderer, this.scene, this.camera);
  }

  simToWorld(x: number, y: number, z = 0): THREE.Vector3 {
    return new THREE.Vector3(x - CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - y, z);
  }

  resize(displayW: number, displayH: number): void {
    this.renderer.setSize(displayW, displayH, false);
    const halfW = CANVAS_WIDTH / 2;
    const halfH = CANVAS_HEIGHT / 2;
    this.camera.left = -halfW;
    this.camera.right = halfW;
    this.camera.top = halfH;
    this.camera.bottom = -halfH;
    this.camera.updateProjectionMatrix();
    this.post.setSize(displayW, displayH);
  }

  updateParallax(scrollX: number, dt: number, vertical = false): void {
    const rates = [0.25, 0.55, 0.9];
    for (let i = 0; i < this.parallaxLayers.length; i++) {
      const layer = this.parallaxLayers[i]!;
      if (vertical) {
        layer.position.y = (scrollX * rates[i]!) % (CANVAS_HEIGHT * 2);
      } else {
        layer.position.x = -(scrollX * rates[i]!) % (CANVAS_WIDTH * 2);
      }
    }
    void dt;
  }

  shake(intensity: number, duration: number): void {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeTimer = Math.max(this.shakeTimer, duration);
  }

  updateCamera(dt: number): void {
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const s = this.shakeIntensity * (this.shakeTimer / 0.25);
      this.camera.position.x = (Math.random() - 0.5) * s * 8;
      this.camera.position.y = (Math.random() - 0.5) * s * 5;
    } else {
      this.camera.position.x = 0;
      this.camera.position.y = 0;
      this.shakeIntensity = 0;
    }
  }

  render(): void {
    this.post.render();
  }
}

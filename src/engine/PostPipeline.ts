import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import * as THREE from "three";

export class PostPipeline {
  private composer: EffectComposer;
  private bloomPass: UnrealBloomPass;
  reducedFx = false;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera
  ) {
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.35,
      0.3,
      0.85
    );
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(new OutputPass());
  }

  setReducedFx(reduced: boolean): void {
    this.reducedFx = reduced;
    this.bloomPass.enabled = !reduced;
    this.bloomPass.strength = reduced ? 0 : 0.35;
  }

  setSize(w: number, h: number): void {
    this.composer.setSize(w, h);
    this.bloomPass.resolution.set(w, h);
  }

  render(): void {
    this.composer.render();
  }
}

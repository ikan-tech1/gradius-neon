import type { GameModeId } from "../config";
import { AudioManager } from "../audio/AudioManager";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../config";
import { GameLoop } from "../engine/GameLoop";
import { SceneManager } from "../engine/SceneManager";
import { GameSession } from "../game/GameSession";
import {
  createArcadeMode,
  createBossRushMode,
  createCampaignMode,
  createCoopMode,
  createScoreAttackMode,
} from "../modes";
import { hangarStore } from "../meta/HangarStore";
import { EntityRenderer } from "../render/EntityRenderer";
import { BackgroundRenderer } from "../render/BackgroundRenderer";
import { EffectRenderer } from "../render/EffectRenderer";
import { HudBridge } from "../render/HudBridge";
import { InputManager } from "../input/InputManager";
import { createModeWithEdit } from "../modes/ModeStrategy";
import type { ShipId } from "../config";
import type { PowerSlotId } from "../config/powerUps";
import type { Loadout } from "../entities/types";
import { showGameOverModal } from "../ui/gameOver";

export class GameScreen {
  private loop: GameLoop | null = null;
  private scene: SceneManager | null = null;
  private session: GameSession | null = null;
  private entityRenderer: EntityRenderer | null = null;
  private bgRenderer: BackgroundRenderer | null = null;
  private fxRenderer: EffectRenderer | null = null;
  private hud = new HudBridge();
  private input = new InputManager();
  private audio = new AudioManager();
  private onExit: (() => void) | null = null;
  private ending = false;
  private wasFiring = false;
  private continueTickTimer = 0;

  start(
    modeId: GameModeId,
    onExit: () => void,
    opts?: {
      arc?: number;
      stage?: number;
      ship?: ShipId;
      editSlot?: PowerSlotId;
      optionMode?: Loadout["optionMode"];
    }
  ): void {
    this.onExit = onExit;
    const store = hangarStore.get();
    const gameLayer = document.getElementById("game-layer")!;
    const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
    gameLayer.classList.remove("hidden");
    document.getElementById("screen-root")!.classList.add("hidden");

    this.scene = new SceneManager(canvas);
    this.scene.post.setReducedFx(store.reducedFx);
    this.hud.mount();
    this.session = new GameSession({
      onScore: (v) => this.hud.onScore(v),
      onLives: (v) => this.hud.onLives(v),
      onStage: (v) => this.hud.onStage(v),
      onPowerBar: (h, a) => this.hud.onPowerBar(h, a),
      onOptions: (v) => this.hud.onOptions(v),
      onShield: (v) => this.hud.onShield(v),
      onWeapon: (v) => this.hud.onWeapon(v),
      onOverdrive: (v) => this.hud.onOverdrive(v),
      onRank: (v) => this.hud.onRank(v),
      onState: (v) => this.hud.onState(v),
      onToast: (v) => this.hud.onToast(v),
      onContinueTimer: (v) => this.hud.onContinueTimer(v),
      onScreenFlash: () => {
        this.hud.onScreenFlash();
        this.audio.coreDestroy();
      },
    });
    this.entityRenderer = new EntityRenderer(this.scene);
    this.bgRenderer = new BackgroundRenderer(this.scene);
    this.fxRenderer = new EffectRenderer(this.scene);

    const mode =
      modeId === "arcade"
        ? createArcadeMode()
        : modeId === "scoreAttack"
          ? createScoreAttackMode(opts?.arc ?? 1, opts?.stage ?? 1)
          : modeId === "coop"
            ? createCoopMode()
            : modeId === "bossRush"
              ? createBossRushMode()
              : opts?.ship
                ? createModeWithEdit(opts.ship, opts.editSlot, opts.optionMode ?? "trail")
                : createCampaignMode();

    if (modeId === "campaign") {
      mode.startArc = store.campaignArc;
      mode.startStage = store.campaignStage;
    }

    this.session.init(mode, store.difficulty, mode.loadout);
    this.bgRenderer.setTheme(this.session.getStageTheme());
    this.input.attach(canvas, (key) => this.session?.handleKonami(key));
    void this.audio.resume();
    this.audio.playBgm(this.session.getStageMusic());

    this.resize();
    window.addEventListener("resize", this.resize);

    const continueBtn = document.getElementById("continue-btn");
    continueBtn?.addEventListener("click", this.onContinue);

    this.loop = new GameLoop(
      (dt) => this.tick(dt),
      () => this.draw()
    );
    this.loop.start();
  }

  private onContinue = (): void => {
    this.session?.continuePlay();
    this.loop?.start();
    this.ending = false;
  };

  private tick(dt: number): void {
    if (!this.session || !this.scene || !this.entityRenderer || !this.bgRenderer || !this.fxRenderer)
      return;

    const inp = this.input.getState();
    if (inp.pause) {
      if (this.session.state === "playing") this.session.pause();
      else if (this.session.state === "paused") this.session.resume();
    }
    this.session.setInput(inp.moveY, inp.fire, inp.secondary, inp.ultimate, inp.moveX);
    if (this.session.modeId === "coop") {
      const p2 = this.input.getP2State();
      this.session.setP2Input(p2.moveY, p2.fire, p2.moveX);
    }

    const prevMusic = this.session.getStageMusic();
    const prevState = this.session.state;
    this.session.update(dt);

    const music = this.session.getStageMusic();
    if (music !== prevMusic) this.audio.playBgm(music);

    if (inp.fire && !this.wasFiring) this.audio.shoot();
    this.wasFiring = inp.fire;

    if (this.session.state === "continue") {
      this.continueTickTimer += dt;
      if (this.continueTickTimer >= 1) {
        this.continueTickTimer = 0;
        this.audio.beepTick();
      }
    } else {
      this.continueTickTimer = 0;
    }

    if (prevState !== "gameOver" && this.session.state === "gameOver" && !this.ending) {
      void this.handleEnd(false);
    }
    if (prevState !== "victory" && this.session.state === "victory" && !this.ending) {
      void this.handleEnd(true);
    }

    this.bgRenderer.setTheme(this.session.getStageTheme());
    const scrollOff = this.session.isVerticalStage()
      ? this.session.getWorldOffsetY()
      : this.session.getWorldOffset();
    this.bgRenderer.update(scrollOff, dt, this.session.isVerticalStage());
    this.scene.updateCamera(dt);
    const shake = this.session.getJuice().consumeShake();
    if (shake && !hangarStore.get().reducedFx) {
      this.scene.shake(shake.intensity, shake.duration);
    }
    this.fxRenderer.sync(this.session.getParticles());
  }

  private draw(): void {
    if (!this.session || !this.scene || !this.entityRenderer) return;
    this.entityRenderer.sync(this.session);
    this.scene.render();
  }

  private resize = (): void => {
    if (!this.scene) return;
    const layer = document.getElementById("game-layer");
    const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
    const availW = layer?.clientWidth ?? window.innerWidth;
    const availH = layer?.clientHeight ?? window.innerHeight;
    const scale = Math.min(availW / CANVAS_WIDTH, availH / CANVAS_HEIGHT);
    const displayW = Math.floor(CANVAS_WIDTH * scale);
    const displayH = Math.floor(CANVAS_HEIGHT * scale);
    canvas.style.width = `${displayW}px`;
    canvas.style.height = `${displayH}px`;
    this.scene.resize(displayW, displayH);
  };

  private async handleEnd(victory: boolean): Promise<void> {
    if (!this.session || this.ending) return;
    this.ending = true;
    this.loop?.stop();
    this.audio.stopBgm();

    const score = this.session.getScore();
    const meta = this.session.getDirectorMeta();
    const rank = this.session.getLastRank();
    hangarStore.recordScore(meta.stageId, score);

    if (victory) {
      hangarStore.onCampaignStageClear(meta.arc, meta.stageIndex, meta.stageId);
    }

    await showGameOverModal(score, victory, victory ? rank : undefined);
    this.stop();
    this.onExit?.();
  }

  stop(): void {
    this.loop?.stop();
    window.removeEventListener("resize", this.resize);
    document.getElementById("continue-btn")?.removeEventListener("click", this.onContinue);
    this.entityRenderer?.dispose();
    this.fxRenderer?.dispose();
    this.input.detach();
    this.audio.stopBgm();
    document.getElementById("game-layer")!.classList.add("hidden");
    document.getElementById("screen-root")!.classList.remove("hidden");
    this.loop = null;
    this.scene = null;
    this.session = null;
    this.entityRenderer = null;
    this.bgRenderer = null;
    this.fxRenderer = null;
    this.ending = false;
  }
}

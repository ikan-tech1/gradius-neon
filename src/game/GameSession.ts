import {
  CANVAS_HEIGHT,
  DIFFICULTY_CONFIG,
  INVULN_TIME,
  PLAYER_X_MAX,
  PLAYER_X_MIN,
  PLAYER_Y_MAX,
  PLAYER_Y_MIN,
  PLAYER_SPEED,
  PLAYER_W,
  PLAYER_H,
  STAGE_INTERSTITIAL_MS,
  WAVE_BANNER_MS,
  type Difficulty,
  type GameModeId,
} from "../config";
import { POWER_SLOT_LABELS } from "../config/powerUps";
import { SHIP_PROFILES } from "../config/ships";
import { WeaponController } from "../combat/WeaponController";
import { PowerUpSystem } from "../combat/PowerUpSystem";
import { OptionSystem } from "../combat/OptionSystem";
import { ChargeSystem } from "../combat/ChargeSystem";
import { OverdriveSystem } from "../combat/OverdriveSystem";
import { ForceRamSystem } from "../combat/ForceRamSystem";
import { ScrollSystem } from "../engine/ScrollSystem";
import type { Boss, Capsule, Enemy, Loadout, Particle, TerrainTile } from "../entities/types";
import { EnemyBehavior } from "../enemies/EnemyBehavior";
import { BossController } from "../enemies/bosses/BossController";
import {
  checkBossHits,
  checkCapsuleHits,
  checkEnemyHits,
  checkPlayerHits,
} from "./CollisionSystem";
import { JuiceController } from "./JuiceController";
import { ScoreSystem } from "./ScoreSystem";
import { StageDirector } from "./StageDirector";
import { TerrainSystem, spawnTerrainDebris } from "./TerrainSystem";
import type { ModeStrategy } from "../modes/ModeStrategy";

export type GameState =
  | "playing"
  | "paused"
  | "banner"
  | "interstitial"
  | "gameOver"
  | "continue"
  | "victory";

export interface GameCallbacks {
  onScore: (score: number) => void;
  onLives: (lives: number) => void;
  onStage: (label: string) => void;
  onPowerBar: (highlight: number, activated: string[]) => void;
  onOptions: (count: number) => void;
  onShield: (hits: number) => void;
  onWeapon: (label: string) => void;
  onOverdrive: (pct: number) => void;
  onRank: (rank: string) => void;
  onState: (state: GameState) => void;
  onToast: (msg: string) => void;
  onContinueTimer?: (seconds: number) => void;
  onScreenFlash?: () => void;
}

export class GameSession {
  state: GameState = "banner";
  screenX = 120;
  py = CANVAS_HEIGHT / 2;
  lives = 3;
  difficulty: Difficulty = "classic";
  modeId: GameModeId = "campaign";

  enemies: Enemy[] = [];
  capsules: Capsule[] = [];
  boss: Boss | null = null;

  readonly scroll = new ScrollSystem();
  readonly weapons = new WeaponController();
  readonly p2Weapons = new WeaponController();
  readonly powerUps = new PowerUpSystem();
  readonly options = new OptionSystem();
  readonly charge = new ChargeSystem();
  readonly overdrive = new OverdriveSystem();
  readonly forceRam = new ForceRamSystem();
  readonly terrain = new TerrainSystem();
  private director = new StageDirector();
  private scoreSys = new ScoreSystem();
  private juice = new JuiceController();
  private enemyAI = new EnemyBehavior();
  private bossCtrl = new BossController();
  private mode: ModeStrategy | null = null;

  private moveY = 0;
  private moveX = 0;
  private firing = false;
  private secondary = false;
  private ultimate = false;
  private p2MoveY = 0;
  private p2MoveX = 0;
  private p2Fire = false;
  private p2Invuln = 0;
  private invuln = 0;
  private bannerTimer = 0;
  private interstitialTimer = 0;
  private continueTimer = 0;
  private damageTaken = 0;
  private stageTime = 0;
  private loops = 0;
  private p2ScreenX = 100;
  private p2Y = CANVAS_HEIGHT / 2 - 40;
  private shipSpeedMult = 1;
  private engineTrailTimer = 0;
  private lastRank = "C";
  private secWasDown = false;

  constructor(private callbacks: GameCallbacks) {
    this.forceRam.bindPool(this.weapons.pool);
  }

  init(mode: ModeStrategy, difficulty: Difficulty, loadout: Loadout): void {
    this.mode = mode;
    this.difficulty = difficulty;
    this.lives = DIFFICULTY_CONFIG[difficulty].lives;
    this.modeId = mode.id;
    const ship = SHIP_PROFILES[loadout.ship];
    this.shipSpeedMult = ship.speedMult;
    if (loadout.editStartSlot) {
      const idx = ["speed", "missile", "double", "laser", "option", "mystery", "shield"].indexOf(
        loadout.editStartSlot
      );
      if (idx >= 0) this.powerUps.highlightIndex = idx;
    }
    this.options.mode = loadout.optionMode;
    this.weapons.setWeapon(ship.defaultWeapon === "ripple" ? "ripple" : "normal");
    this.p2Weapons.setWeapon("normal");
    this.director.load(mode.startArc, mode.startStage);
    this.scroll.reset();
    this.configureScrollForStage();
    this.terrain.setTheme(
      this.director.script.theme,
      this.scroll.worldOffsetX,
      !!this.director.script.vertical
    );
    this.scoreSys.score = 0;
    this.invuln = INVULN_TIME;
    this.p2Invuln = INVULN_TIME;
    this.startStageBanner();
    this.pushHud();
  }

  setInput(moveY: number, fire: boolean, sec: boolean, ult: boolean, moveX = 0): void {
    this.moveY = moveY;
    this.moveX = moveX;
    this.firing = fire;
    this.secondary = sec;
    this.ultimate = ult;
  }

  setP2Input(moveY: number, fire: boolean, moveX = 0): void {
    this.p2MoveY = moveY;
    this.p2MoveX = moveX;
    this.p2Fire = fire;
  }

  pause(): void {
    if (this.state === "playing") {
      this.state = "paused";
      this.callbacks.onState("paused");
    }
  }

  resume(): void {
    if (this.state === "paused") {
      this.state = "playing";
      this.callbacks.onState("playing");
    }
  }

  getScore(): number {
    return this.scoreSys.score;
  }

  getJuice(): JuiceController {
    return this.juice;
  }

  getParticles(): Particle[] {
    return this.juice.particles;
  }

  getTerrainTiles(): TerrainTile[] {
    return this.terrain.getVisible(
      this.scroll.worldOffsetX,
      this.scroll.worldOffsetY,
      !!this.director.script.vertical
    );
  }

  getChargeLevel(): number {
    return this.charge.level;
  }

  getContinueSeconds(): number {
    return Math.max(0, this.continueTimer);
  }

  getLastRank(): string {
    return this.lastRank;
  }

  isVerticalStage(): boolean {
    return !!this.director.script.vertical;
  }

  getPlayerPos(): { x: number; y: number; invuln: boolean } {
    return { x: this.screenX, y: this.py, invuln: this.invuln > 0 };
  }

  getP2Pos(): { x: number; y: number; invuln: boolean } | null {
    return this.modeId === "coop"
      ? { x: this.p2ScreenX, y: this.p2Y, invuln: this.p2Invuln > 0 }
      : null;
  }

  getWorldOffset(): number {
    return this.scroll.worldOffsetX;
  }

  getWorldOffsetY(): number {
    return this.scroll.worldOffsetY;
  }

  getStageLabel(): string {
    return `ARC ${this.director.arc} — ${this.director.script.name}`;
  }

  getStageTheme() {
    return this.director.script.theme;
  }

  getStageMusic() {
    return this.director.script.music;
  }

  getDirectorMeta() {
    return {
      arc: this.director.arc,
      stageIndex: this.director.stageIndex,
      stageId: this.director.script.id,
    };
  }

  private configureScrollForStage(): void {
    this.scroll.vertical = !!this.director.script.vertical;
    this.scroll.paused = false;
  }

  private isRippleUnlocked(): boolean {
    if (this.mode?.rippleEnabled) return true;
    if (this.modeId === "campaign" && this.director.arc >= 2) return true;
    return false;
  }

  private startStageBanner(): void {
    this.state = "banner";
    this.bannerTimer = WAVE_BANNER_MS / 1000;
    this.enemies = [];
    this.capsules = [];
    this.boss = null;
    this.configureScrollForStage();
    this.terrain.setTheme(
      this.director.script.theme,
      this.scroll.worldOffsetX,
      !!this.director.script.vertical
    );
    this.callbacks.onStage(this.getStageLabel());
    this.callbacks.onState("banner");
  }

  private pushHud(): void {
    this.callbacks.onScore(this.scoreSys.score);
    this.callbacks.onLives(this.lives);
    this.syncPowerHud();
    this.callbacks.onWeapon(this.weapons.getLabel());
    this.callbacks.onOverdrive(this.overdrive.getPct());
  }

  private syncPowerHud(): void {
    this.callbacks.onPowerBar(
      this.powerUps.highlightIndex,
      [...this.powerUps.activated]
    );
    this.callbacks.onOptions(this.options.optionCount);
    this.callbacks.onShield(this.powerUps.shieldHits + (this.forceRam.state.active ? 1 : 0));
  }

  private spawnEngineTrail(x: number, y: number): void {
    this.engineTrailTimer -= 0.016;
    if (this.engineTrailTimer > 0) return;
    this.engineTrailTimer = 0.04;
    let id = this.juice.particles.length
      ? Math.max(...this.juice.particles.map((p) => p.id)) + 1
      : 1;
    this.juice.particles.push({
      id: id++,
      active: true,
      x: x - 14,
      y: y + (Math.random() - 0.5) * 4,
      vx: -80 - Math.random() * 40,
      vy: (Math.random() - 0.5) * 30,
      life: 0.25 + Math.random() * 0.15,
      maxLife: 0.4,
      color: 0xff3d9a,
      size: 2 + Math.random() * 2,
    });
  }

  update(rawDt: number): void {
    const timeScale = this.juice.update(rawDt);
    const dt = rawDt * timeScale;

    if (this.state === "paused" || this.state === "gameOver" || this.state === "victory") return;

    if (this.state === "banner") {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) {
        this.state = "playing";
        this.callbacks.onState("playing");
      }
      return;
    }

    if (this.state === "interstitial") {
      this.interstitialTimer -= dt;
      if (this.interstitialTimer <= 0) this.advanceStage();
      return;
    }

    if (this.state === "continue") {
      this.continueTimer -= dt;
      this.callbacks.onContinueTimer?.(this.continueTimer);
      if (this.continueTimer <= 0) {
        this.state = "gameOver";
        this.callbacks.onState("gameOver");
      }
      return;
    }

    this.stageTime += dt;
    this.scoreSys.update(dt);
    if (this.invuln > 0) this.invuln -= dt;
    if (this.p2Invuln > 0) this.p2Invuln -= dt;

    const diff = DIFFICULTY_CONFIG[this.difficulty];
    const stageSpeed = this.director.script.scrollSpeed * diff.speedMult;
    this.scroll.update(dt, stageSpeed);

    this.updatePlayer(dt, diff.speedMult);
    if (this.modeId === "coop") this.updateP2(dt, diff.speedMult);

    this.options.update(dt, this.screenX, this.py);
    this.charge.update(dt, this.firing && !!this.mode?.chargeEnabled);
    this.overdrive.update(dt);
    this.forceRam.update(dt, this.screenX, this.py, this.firing && this.forceRam.state.detached);

    this.spawnEngineTrail(this.screenX, this.py);
    if (this.modeId === "coop") this.spawnEngineTrail(this.p2ScreenX, this.p2Y);

    if (this.secondary && !this.secWasDown) {
      if (this.forceRam.state.active) {
        if (this.forceRam.state.detached) this.forceRam.tryRecall(this.screenX, this.py);
        else this.forceRam.tryDetach(this.screenX, this.py);
      }
    }
    this.secWasDown = this.secondary;

    if (this.ultimate && this.overdrive.activate()) {
      for (const e of this.enemies) {
        if (e.alive) {
          e.alive = false;
          this.juice.spawnExplosion(e.worldX - this.scroll.worldOffsetX, e.y);
          this.scoreSys.add(e.score, dt);
        }
      }
      this.callbacks.onToast("OVERDRIVE!");
      this.juice.triggerShake(0.8, 0.3);
    }

    const scrollProgress = this.director.script.vertical
      ? this.scroll.worldOffsetY
      : this.scroll.worldOffsetX;

    const spawned = this.director.update(scrollProgress, this.enemies, this.capsules);
    if (spawned.message) this.callbacks.onToast(spawned.message);
    if (spawned.boss) {
      this.boss = spawned.boss;
      this.callbacks.onToast("WARNING — BOSS APPROACHING");
    }

    for (const e of this.enemies) {
      this.enemyAI.updateEnemy(e, dt, this.scroll.scrollSpeed * stageSpeed, this.py);
      this.enemyAI.tryFire(
        e,
        dt,
        this.scroll.worldOffsetX,
        this.screenX,
        this.py,
        this.difficulty,
        this.weapons.pool.projectiles
      );
    }

    if (this.boss) {
      this.bossCtrl.update(
        this.boss,
        dt,
        this.scroll.scrollSpeed * stageSpeed,
        this.difficulty
      );
    }

    this.weapons.setWeapon(this.powerUps.getWeaponFromBar());
    if (this.mode?.rippleEnabled) {
      this.weapons.setWeapon("ripple");
    } else if (this.isRippleUnlocked() && this.powerUps.activated.has("laser")) {
      this.weapons.setWeapon("ripple");
    }
    if (this.mode?.spreadEnabled && this.powerUps.activated.has("double"))
      this.weapons.setWeapon("spread");
    if (this.mode?.chargeEnabled && this.charge.level >= 0.9)
      this.weapons.setWeapon("charge");

    this.weapons.update(dt, this.scroll.scrollSpeed);
    this.p2Weapons.update(dt, this.scroll.scrollSpeed);

    if (this.firing) {
      this.weapons.tryFire(
        this.screenX,
        this.py,
        true,
        diff.fireMult * this.shipSpeedMult,
        this.options.pods
      );
    }
    if (this.modeId === "coop" && this.p2Fire) {
      this.p2Weapons.tryFire(this.p2ScreenX, this.p2Y, true, diff.fireMult, []);
    }
    if (this.secondary && this.powerUps.missile && !this.forceRam.state.detached) {
      this.weapons.tryMissile(this.screenX, CANVAS_HEIGHT - 16, this.powerUps.missile);
    }

    const scrollX = this.scroll.worldOffsetX;
    const scrollY = this.scroll.worldOffsetY;
    const vertical = !!this.director.script.vertical;

    this.terrain.checkHits(
      this.weapons.pool.projectiles,
      scrollX,
      scrollY,
      vertical,
      (x, y, color) => {
        spawnTerrainDebris(this.juice.particles, x, y, color);
        this.juice.spawnExplosion(x, y, color, 4);
      }
    );

    for (const hit of checkEnemyHits(this.weapons.pool.projectiles, this.enemies, scrollX)) {
      this.applyEnemyHit(hit.enemy, hit.proj, dt, scrollX);
    }
    if (this.modeId === "coop") {
      for (const hit of checkEnemyHits(this.p2Weapons.pool.projectiles, this.enemies, scrollX)) {
        this.applyEnemyHit(hit.enemy, hit.proj, dt, scrollX);
      }
    }

    const cap = checkCapsuleHits(this.weapons.pool.projectiles, this.capsules, scrollX);
    if (cap) this.collectCapsule(cap);

    if (this.boss) {
      const bossDmg = checkBossHits(this.weapons.pool.projectiles, this.boss, scrollX);
      const p2BossDmg =
        this.modeId === "coop"
          ? checkBossHits(this.p2Weapons.pool.projectiles, this.boss, scrollX)
          : 0;
      const totalDmg = bossDmg + p2BossDmg;
      if (totalDmg > 0) {
        const dead = this.bossCtrl.applyDamage(this.boss, totalDmg);
        this.juice.triggerShake(0.3, 0.1);
        if (dead) {
          this.scoreSys.add(this.boss.score, dt);
          this.juice.spawnExplosion(this.boss.worldX - scrollX, this.boss.y, 0x4488ff, 20);
          this.callbacks.onToast("CORE DESTROYED!");
          this.callbacks.onScreenFlash?.();
          this.director.onBossDefeated();
          this.boss = null;
        }
      }
    }

    this.checkPlayerCollision(this.screenX, this.py, () => this.takeDamage(false));
    if (this.modeId === "coop") {
      this.checkPlayerCollision(this.p2ScreenX, this.p2Y, () => this.takeDamage(true));
    }

    this.enemies = this.enemies.filter(
      (e) => e.alive || e.worldX - scrollX > -80
    );

    if (this.director.stageComplete) {
      const rank = this.scoreSys.computeRank(this.damageTaken, this.stageTime);
      this.lastRank = rank;
      this.callbacks.onRank(rank);
      this.callbacks.onToast(`STAGE CLEAR — RANK ${rank}`);
      if (this.mode?.isBossRush) {
        const next = this.director.nextStage();
        if (next) {
          this.director.load(next.arc, next.index);
          this.startStageBanner();
        } else {
          this.state = "victory";
          this.callbacks.onState("victory");
        }
      } else {
        this.state = "interstitial";
        this.interstitialTimer = STAGE_INTERSTITIAL_MS / 1000;
        this.callbacks.onState("interstitial");
      }
    }

    this.callbacks.onScore(this.scoreSys.score);
    this.callbacks.onOverdrive(this.overdrive.getPct());
  }

  private applyEnemyHit(
    enemy: Enemy,
    proj: GameSession["weapons"]["pool"]["projectiles"][0],
    dt: number,
    scrollX: number
  ): void {
    enemy.hp -= proj.damage;
    if (!proj.pierce) proj.active = false;
    if (proj.laser) {
      this.juice.spawnExplosion(proj.x, proj.y, 0x88ffff, 3);
    }
    if (enemy.hp <= 0) {
      enemy.alive = false;
      this.scoreSys.add(enemy.score, dt);
      this.overdrive.addKill();
      this.juice.spawnExplosion(enemy.worldX - scrollX, enemy.y);
      if (enemy.dropsCapsule) {
        this.capsules.push({
          id: enemy.id + 10000,
          active: true,
          worldX: enemy.worldX,
          y: enemy.y,
          red: enemy.capsuleRed,
          w: 16,
          h: 20,
        });
      }
    }
  }

  private collectCapsule(cap: Capsule): void {
    const slot = this.powerUps.collectCapsule(cap);
    if (!slot) return;
    this.powerUps.activateSlot(slot);
    if (slot === "option") this.options.setCount(this.options.optionCount + 1);
    if (slot === "laser") this.weapons.setWeapon("laser");
    if (slot === "double") this.weapons.setWeapon("double");
    if (slot === "shield") this.forceRam.enable();
    this.callbacks.onToast(POWER_SLOT_LABELS[slot]);
    this.syncPowerHud();
  }

  private checkPlayerCollision(px: number, py: number, onHit: () => void): void {
    const inv = px === this.p2ScreenX ? this.p2Invuln : this.invuln;
    const playerHit = checkPlayerHits(px, py, PLAYER_W, PLAYER_H, this.weapons.pool.projectiles);
    if (playerHit && inv <= 0) {
      playerHit.active = false;
      onHit();
    }
  }

  private updatePlayer(dt: number, speedMult: number): void {
    const speed =
      PLAYER_SPEED *
      speedMult *
      this.shipSpeedMult *
      (1 + this.powerUps.speedLevel * 0.08);

    if (this.director.script.vertical) {
      this.py += this.moveY * speed * dt;
      this.screenX += this.moveX * speed * dt;
      this.py = Math.max(PLAYER_Y_MIN, Math.min(PLAYER_Y_MAX, this.py));
      this.screenX = Math.max(PLAYER_X_MIN, Math.min(PLAYER_X_MAX, this.screenX));
    } else {
      this.py += this.moveY * speed * dt;
      this.py = Math.max(PLAYER_Y_MIN, Math.min(PLAYER_Y_MAX, this.py));
      this.screenX = Math.max(PLAYER_X_MIN, Math.min(PLAYER_X_MAX, this.screenX));
    }
  }

  private updateP2(dt: number, speedMult: number): void {
    const speed = PLAYER_SPEED * speedMult * 0.95;
    if (this.director.script.vertical) {
      this.p2Y += this.p2MoveY * speed * dt;
      this.p2ScreenX += this.p2MoveX * speed * dt;
    } else {
      this.p2Y += this.p2MoveY * speed * dt;
    }
    this.p2Y = Math.max(PLAYER_Y_MIN, Math.min(PLAYER_Y_MAX, this.p2Y));
    this.p2ScreenX = Math.max(60, Math.min(PLAYER_X_MAX, this.p2ScreenX));
  }

  private takeDamage(isP2: boolean): void {
    if (!isP2) {
      if (this.forceRam.absorbHit()) {
        this.syncPowerHud();
        this.callbacks.onToast("FORCE RAM HIT");
        return;
      }
      if (this.powerUps.absorbHit()) {
        this.syncPowerHud();
        this.callbacks.onToast("BARRIER HIT");
        return;
      }
    }
    this.damageTaken++;
    this.lives--;
    this.callbacks.onLives(this.lives);
    if (!isP2) {
      this.options.onPlayerDeath(this.screenX, this.py);
    }
    this.juice.triggerShake(0.6, 0.25);
    if (this.lives <= 0) {
      this.state = "continue";
      this.continueTimer = 8;
      this.callbacks.onState("continue");
      this.callbacks.onContinueTimer?.(this.continueTimer);
    } else if (isP2) {
      this.p2Invuln = INVULN_TIME;
    } else {
      this.invuln = INVULN_TIME;
    }
  }

  continuePlay(): void {
    if (this.state !== "continue") return;
    this.lives = 1;
    this.invuln = INVULN_TIME;
    this.state = "playing";
    this.callbacks.onLives(this.lives);
    this.callbacks.onState("playing");
  }

  private advanceStage(): void {
    const next = this.director.nextStage();
    if (!next) {
      this.loops++;
      if (this.loops >= 2) {
        this.callbacks.onToast("SPECIAL ENDING — LOOP MASTER");
      }
      this.state = "victory";
      this.callbacks.onState("victory");
      return;
    }
    this.mode?.onStageClear?.(this.director.arc, this.director.stageIndex);
    this.director.load(next.arc, next.index);
    this.stageTime = 0;
    this.damageTaken = 0;
    this.startStageBanner();
  }

  handleKonami(key: string): void {
    if (this.powerUps.trackKonami(key)) {
      this.options.setCount(4);
      this.weapons.setWeapon("laser");
      this.forceRam.enable();
      this.syncPowerHud();
      this.callbacks.onToast("KONAMI CODE — FULL POWER!");
    }
  }
}

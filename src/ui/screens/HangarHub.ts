import type { GameModeId, Difficulty, ShipId } from "../../config";
import { MODE_LABELS, SHIP_LABELS, TOTAL_STAGES } from "../../config";
import { POWER_BAR_SLOTS, POWER_SLOT_LABELS, type PowerSlotId } from "../../config/powerUps";
import { hangarStore } from "../../meta/HangarStore";
import { ALL_STAGES } from "../../game/stages/stageFactory";
import { getArcTitle } from "../../narrative/campaignScript";
import { GameScreen } from "../../screens/GameScreen";
import { showSectorBriefing } from "../sectorBriefing";
import { mountShipPreview, updateShipPreview } from "./ShipPreview";

export class HangarHub {
  private gameScreen = new GameScreen();

  constructor(private root: HTMLElement) {
    this.render();
  }

  private render(): void {
    const store = hangarStore.get();
    this.root.innerHTML = `
      <div class="hangar">
        <header class="hangar-header glass-panel">
          <div>
            <h1 class="hangar-logo">GRADIUS <span class="logo-accent">NEON</span></h1>
            <span class="hangar-tag">ANTHOLOGY · ${TOTAL_STAGES} STAGES · PROCEDURAL NEON</span>
          </div>
          <div class="hangar-meta">
            <span>Progress ${hangarStore.getProgressPct()}%</span>
          </div>
        </header>

        <section class="hangar-grid">
          <div class="hangar-panel glass-panel hangar-panel--preview">
            <h2>FIGHTER</h2>
            <div id="ship-preview" class="ship-preview-host"></div>
          </div>

          <div class="hangar-panel glass-panel">
            <h2>LAUNCH</h2>
            <div class="mode-list" id="mode-list"></div>
          </div>

          <div class="hangar-panel glass-panel">
            <h2>CONFIG</h2>
            <label>Difficulty
              <select id="diff-select">
                <option value="casual">Casual</option>
                <option value="classic" selected>Classic</option>
                <option value="insane">Insane</option>
              </select>
            </label>
            <label class="check-row">
              <input type="checkbox" id="reduced-fx" ${store.reducedFx ? "checked" : ""} /> Reduced FX
            </label>
            <h3>Ship</h3>
            <select id="ship-select"></select>
            <h3>Edit Mode — Start Slot</h3>
            <select id="edit-slot"></select>
            <h3>Option Formation</h3>
            <select id="option-mode">
              <option value="trail">Trail</option>
              <option value="rotate">Rotate</option>
              <option value="formation">Formation</option>
            </select>
          </div>

          <div class="hangar-panel glass-panel">
            <h2>STAGE SELECT</h2>
            <div class="stage-list" id="stage-list"></div>
          </div>

          <div class="hangar-panel glass-panel">
            <h2>CODEX</h2>
            <div class="codex" id="codex"></div>
          </div>
        </section>

        <footer class="hangar-footer">
          <span>W/S or ↑/↓ move · SPACE fire · SHIFT missile · Q overdrive · P pause</span>
          <span>Konami code enabled</span>
        </footer>
      </div>
    `;

    (document.getElementById("diff-select") as HTMLSelectElement).value = store.difficulty;
    this.populateShips(store.unlockedShips);
    this.populateEditSlots();
    this.populateModes();
    this.populateStages(store.unlockedStages);
    this.populateCodex(store.codexSeen);
    this.bindEvents();
    mountShipPreview(
      document.getElementById("ship-preview")!,
      (document.getElementById("ship-select") as HTMLSelectElement).value as ShipId
    );
  }

  private populateShips(unlocked: ShipId[]): void {
    const sel = document.getElementById("ship-select") as HTMLSelectElement;
    sel.innerHTML = "";
    for (const id of Object.keys(SHIP_LABELS) as ShipId[]) {
      if (!unlocked.includes(id)) continue;
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = SHIP_LABELS[id];
      sel.appendChild(opt);
    }
  }

  private populateEditSlots(): void {
    const sel = document.getElementById("edit-slot") as HTMLSelectElement;
    sel.innerHTML = "";
    for (const slot of POWER_BAR_SLOTS) {
      const opt = document.createElement("option");
      opt.value = slot;
      opt.textContent = POWER_SLOT_LABELS[slot];
      sel.appendChild(opt);
    }
  }

  private populateModes(): void {
    const list = document.getElementById("mode-list")!;
    const modes: GameModeId[] = ["campaign", "arcade", "scoreAttack", "coop", "bossRush"];
    for (const id of modes) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn-mode";
      btn.textContent = MODE_LABELS[id];
      btn.addEventListener("click", () => this.launch(id));
      list.appendChild(btn);
    }
  }

  private populateStages(_unlocked: string[]): void {
    const list = document.getElementById("stage-list")!;
    for (const stage of ALL_STAGES) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn-stage";
      const store = hangarStore.get();
      btn.disabled =
        !store.unlockedStages.includes(stage.id) &&
        !store.unlockedArcs.includes(stage.arc) &&
        store.unlockedArcs.length < stage.arc;
      btn.textContent = `${getArcTitle(stage.arc)} · ${stage.name}`;
      btn.addEventListener("click", () => {
        showSectorBriefing(stage.arc, stage.index, () =>
          this.launch("scoreAttack", stage.arc, stage.index)
        );
      });
      list.appendChild(btn);
    }
  }

  private populateCodex(seen: string[]): void {
    const el = document.getElementById("codex")!;
    const entries = [
      "Big Core — destroy the core",
      "Moai — destroy the eye",
      "Tetran — segmented serpent",
      "Intruder — plant fortress",
      "Fortress Gate — mechanical wall",
      "Bacterian — final entity",
      "Red capsule — advance power bar",
      "Blue capsule — activate slot",
    ];
    el.innerHTML = entries
      .map((e, i) => `<div class="codex-entry ${seen.includes(`c${i}`) ? "seen" : ""}">${e}</div>`)
      .join("");
  }

  private bindEvents(): void {
    document.getElementById("diff-select")?.addEventListener("change", (e) => {
      hangarStore.set({ difficulty: (e.target as HTMLSelectElement).value as Difficulty });
    });
    document.getElementById("reduced-fx")?.addEventListener("change", (e) => {
      hangarStore.set({ reducedFx: (e.target as HTMLInputElement).checked });
    });
    document.getElementById("ship-select")?.addEventListener("change", (e) => {
      updateShipPreview((e.target as HTMLSelectElement).value as ShipId);
    });
  }

  private launch(
    modeId: GameModeId,
    arc?: number,
    stage?: number
  ): void {
    const ship = (document.getElementById("ship-select") as HTMLSelectElement)
      .value as ShipId;
    const editSlot = (document.getElementById("edit-slot") as HTMLSelectElement)
      .value as PowerSlotId;
    const optionMode = (document.getElementById("option-mode") as HTMLSelectElement)
      .value as "trail" | "rotate" | "formation";

    const start = () => {
      this.gameScreen.start(modeId, () => this.render(), {
        arc,
        stage,
        ship,
        editSlot,
        optionMode,
      });
    };

    if (modeId === "campaign") {
      const store = hangarStore.get();
      showSectorBriefing(store.campaignArc, store.campaignStage, start);
    } else {
      start();
    }
  }
}

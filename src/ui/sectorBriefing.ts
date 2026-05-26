import { getBriefing } from "../narrative/campaignScript";

export function showSectorBriefing(
  arc: number,
  stage: number,
  onContinue: () => void
): void {
  const overlay = document.createElement("div");
  overlay.className = "briefing-overlay";
  overlay.innerHTML = `
    <div class="briefing-card glass-panel">
      <span class="briefing-label">SECTOR BRIEFING</span>
      <p class="briefing-text">${getBriefing(arc, stage).replace(/\n/g, "<br>")}</p>
      <button type="button" class="btn-primary" id="briefing-go">LAUNCH</button>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector("#briefing-go")?.addEventListener("click", () => {
    overlay.remove();
    onContinue();
  });
}

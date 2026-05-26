export function showGameOverModal(
  score: number,
  victory: boolean,
  rank?: string
): Promise<void> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "end-overlay";
    overlay.innerHTML = `
      <div class="end-card glass-panel ${victory ? "end-card--victory" : "end-card--defeat"}">
        <span class="end-label">${victory ? "MISSION COMPLETE" : "SIGNAL LOST"}</span>
        <h2 class="end-title">${victory ? "VICTORY" : "GAME OVER"}</h2>
        ${rank ? `<p class="end-rank">RANK ${rank}</p>` : ""}
        <p class="end-score">${score.toLocaleString()}</p>
        <p class="end-sub">${victory ? "Bacterian threat neutralized." : "Continue the fight from the hangar."}</p>
        <button type="button" class="btn-primary end-btn" id="end-hangar">RETURN TO HANGAR</button>
      </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("visible"));
    overlay.querySelector("#end-hangar")!.addEventListener("click", () => {
      overlay.classList.remove("visible");
      setTimeout(() => {
        overlay.remove();
        resolve();
      }, 280);
    });
  });
}

export function showInterstitial(
  stageLabel: string,
  rank: string,
  onDone: () => void
): void {
  const overlay = document.getElementById("interstitial-overlay");
  const label = document.getElementById("interstitial-label");
  const rankEl = document.getElementById("interstitial-rank");
  if (!overlay || !label || !rankEl) {
    onDone();
    return;
  }
  label.textContent = stageLabel;
  rankEl.textContent = `RANK ${rank}`;
  overlay.classList.remove("hidden");
  overlay.classList.add("visible");
  setTimeout(() => {
    overlay.classList.remove("visible");
    overlay.classList.add("hidden");
    onDone();
  }, 3200);
}

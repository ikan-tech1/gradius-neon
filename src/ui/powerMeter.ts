import { POWER_BAR_SLOTS, POWER_SLOT_LABELS } from "../config/powerUps";

export function renderPowerMeter(
  container: HTMLElement,
  highlight: number,
  activated: string[]
): void {
  container.innerHTML = "";
  POWER_BAR_SLOTS.forEach((slot, i) => {
    const cell = document.createElement("div");
    cell.className = "power-cell";
    if (i === highlight) cell.classList.add("highlight");
    if (activated.includes(slot)) cell.classList.add("active");
    cell.textContent = POWER_SLOT_LABELS[slot].split(" ")[0] ?? slot;
    container.appendChild(cell);
  });
}

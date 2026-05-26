import { HangarHub } from "./ui/screens/HangarHub";
import "./styles.css";

const root = document.getElementById("screen-root")!;
const splash = document.getElementById("splash-overlay")!;
const startBtn = document.getElementById("splash-start")!;

let hub: HangarHub | null = null;

startBtn.addEventListener("click", () => {
  splash.classList.add("hidden");
  if (!hub) hub = new HangarHub(root);
});

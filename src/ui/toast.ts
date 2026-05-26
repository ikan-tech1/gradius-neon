export function showToast(msg: string, ms = 2200): void {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.remove("visible");
  void t.offsetWidth;
  t.classList.add("visible");
  setTimeout(() => t.classList.remove("visible"), ms);
}

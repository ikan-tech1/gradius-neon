export interface InputState {
  moveY: number;
  moveX: number;
  fire: boolean;
  secondary: boolean;
  ultimate: boolean;
  pause: boolean;
}

export class InputManager {
  private moveY = 0;
  private moveX = 0;
  private fire = false;
  private secondary = false;
  private ultimate = false;
  private pausePressed = false;
  private keys = new Set<string>();
  private konamiListener: ((key: string) => void) | null = null;

  attach(_canvas: HTMLCanvasElement, onKonami?: (key: string) => void): void {
    this.konamiListener = onKonami ?? null;
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);

    const bindBtn = (id: string, key: "fire" | "secondary" | "ultimate") => {
      const el = document.getElementById(id);
      if (!el) return;
      const down = () => {
        if (key === "fire") this.fire = true;
        if (key === "secondary") this.secondary = true;
        if (key === "ultimate") this.ultimate = true;
      };
      const up = () => {
        if (key === "fire") this.fire = false;
        if (key === "secondary") this.secondary = false;
        if (key === "ultimate") this.ultimate = false;
      };
      el.addEventListener("touchstart", (e) => {
        e.preventDefault();
        down();
      });
      el.addEventListener("touchend", up);
      el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        down();
      });
      el.addEventListener("mouseup", up);
    };
    bindBtn("touch-fire", "fire");
    bindBtn("touch-secondary", "secondary");
    bindBtn("touch-ultimate", "ultimate");

    const touchMove = document.getElementById("touch-move");
    if (touchMove) {
      let startY = 0;
      touchMove.addEventListener("touchstart", (e) => {
        e.preventDefault();
        startY = e.touches[0]!.clientY;
      });
      touchMove.addEventListener("touchmove", (e) => {
        e.preventDefault();
        const dy = e.touches[0]!.clientY - startY;
        this.moveY = Math.max(-1, Math.min(1, dy / 40));
      });
      touchMove.addEventListener("touchend", () => {
        this.moveY = 0;
        this.moveX = 0;
      });
    }
  }

  detach(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  getP2State(): InputState & { moveX: number } {
    let moveY = 0;
    let moveX = 0;
    if (this.keys.has("i")) moveY -= 1;
    if (this.keys.has("k")) moveY += 1;
    if (this.keys.has("j")) moveX -= 1;
    if (this.keys.has("l")) moveX += 1;
    return {
      moveY,
      moveX,
      fire: this.keys.has("Enter"),
      secondary: false,
      ultimate: false,
      pause: false,
    };
  }

  getState(): InputState & { moveX: number } {
    let moveY = 0;
    let moveX = 0;
    if (this.keys.has("ArrowUp") || this.keys.has("w")) moveY -= 1;
    if (this.keys.has("ArrowDown") || this.keys.has("s")) moveY += 1;
    if (this.keys.has("ArrowLeft") || this.keys.has("a")) moveX -= 1;
    if (this.keys.has("ArrowRight") || this.keys.has("d")) moveX += 1;
    return {
      moveY: moveY || this.moveY,
      moveX: moveX || this.moveX,
      fire: this.fire || this.keys.has(" "),
      secondary: this.secondary || this.keys.has("Shift"),
      ultimate: this.ultimate || this.keys.has("q"),
      pause: this.pausePressed,
    };
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keys.add(e.key);
    this.konamiListener?.(e.key);
    if (e.key === "p" || e.key === "P") {
      this.pausePressed = true;
      e.preventDefault();
    }
    if (e.key === " ") e.preventDefault();
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.key);
    if (e.key === "p" || e.key === "P") this.pausePressed = false;
  };
}

/**
 * Pet Container Module
 * Handles restoring and ensuring visibility of the pet container element
 */

export function restorePetContainer() {
  let pc = document.getElementById("pet-container");
  if (!pc) {
    pc = document.createElement("div");
    pc.id = "pet-container";
    // ⬇️ change this mount if your HTML uses a different wrapper
    const mount =
      document.getElementById("game-area") ||
      document.getElementById("stage") ||
      document.body;
    mount.prepend(pc);
  }
  pc.classList.remove("hidden", "removed", "fade-out", "invisible");
  pc.style.display = ""; // let CSS control layout
  pc.style.visibility = "visible";
  pc.style.opacity = "1";
  pc.style.pointerEvents = "auto";
  return pc;
}

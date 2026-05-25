// Overlay management functions

export function showTranscendenceOverlay() {
  const winOverlay = document.getElementById("transcendenceOverlay");
  if (!winOverlay) return;

  document.body.classList.add("game-over-active");

  winOverlay.style.display = "flex";
  winOverlay.classList.add("show");
  winOverlay.style.pointerEvents = "auto";
  winOverlay.style.opacity = "1";
  winOverlay.style.visibility = "visible";
  const btn = document.getElementById("playAgainBtn");
  if (btn) btn.focus();
}


export function showGameOverOverlay(reason = "") {
  console.log("Game Over triggered:", reason);

  const overlay = document.getElementById("gameOverOverlay");
  if (!overlay) {
    console.error("Game Over overlay not found");
    return;
  }

  // Set the reason text
  const reasonEl = document.getElementById("gameOverReason");
  if (reasonEl) {
    reasonEl.textContent = reason;
  }

  document.body.classList.add("game-over-active");

  // Force animation restart on iOS Safari (animation won't replay without reflow)
  overlay.classList.remove("show");
  overlay.style.display = "flex";
  void overlay.offsetHeight; // reflow — triggers animation restart
  overlay.classList.add("show");
}

export function hidePageOverlay() {
  const overlay = document.getElementById("pageOverlay");
  if (overlay) {
    overlay.classList.add("hidden");
    setTimeout(() => {
      overlay.style.display = "none";
    }, 500);
  }
}


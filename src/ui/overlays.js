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

export function showGameOverOverlayLoss(reason) {
  const overlay = document.getElementById("gameOverOverlay");
  const titleEl = overlay?.querySelector("h2");
  const reasonEl = document.getElementById("gameOverReason");
  const btn = overlay?.querySelector(".game-over-button");
  if (!overlay || !titleEl || !reasonEl || !btn) return;

  overlay.classList.remove("win");

  titleEl.textContent = "GAME OVER";
  titleEl.classList.add("glitch-text");
  titleEl.classList.remove("gradient-text");

  reasonEl.textContent = reason || "Your pet has perished...";
  reasonEl.classList.remove("gradient-text");

  btn.textContent = "TRY AGAIN";
  btn.classList.remove("gradient-text");

  overlay.style.display = "flex";
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

export function showNameOverlay() {
  const nameOverlay = document.getElementById("nameOverlay");
  if (nameOverlay) {
    nameOverlay.style.display = "flex";
  }
}

export function hideNameOverlay() {
  const nameOverlay = document.getElementById("nameOverlay");
  if (nameOverlay) {
    nameOverlay.style.display = "none";
  }
}

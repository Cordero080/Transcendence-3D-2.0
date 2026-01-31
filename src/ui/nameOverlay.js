/**
 * Pet Name Overlay Module
 * Handles the pet naming screen that appears after the welcome overlay
 */

export function setupNameOverlay() {
  const overlay = document.getElementById("pageOverlay");
  const nameOverlay = document.getElementById("nameOverlay");
  const overlayBtn = document.getElementById("overlayStartButton"); // START GAME
  const confirmNameBtn = document.getElementById("confirmNameBtn"); // CONFIRM NAME
  const petNameInput = document.getElementById("petNameInput");
  const egg = document.getElementById("colorfulGlitchDiv");

  // 1) START GAME: close welcome overlay, show name input overlay
  if (overlayBtn) {
    overlayBtn.addEventListener("click", async () => {
      if (overlay) overlay.style.display = "none";
      if (nameOverlay) nameOverlay.style.display = "flex";

      // Start music on first overlay click (if not already playing)
      const theme = document.getElementById("bg-music");
      if (theme && theme.paused) {
        try {
          theme.muted = false;
          theme.volume = 0.3;
          await theme.play();
        } catch {}
      }

      // Focus the input field
      if (petNameInput) {
        setTimeout(() => petNameInput.focus(), 100);
      }
    });
  }

  // 2) CONFIRM NAME: close name overlay, show egg, save pet name
  if (confirmNameBtn && petNameInput) {
    const confirmName = async () => {
      const petName = petNameInput.value.trim() || "Coco";
      // Store the name globally for use when creating the pet
      window.petName = petName;

      if (nameOverlay) nameOverlay.style.display = "none";
      if (egg) {
        egg.style.display = "flex";
        egg.classList.remove("hatching");
      }
      // Music already playing, no need to restart
    };

    confirmNameBtn.addEventListener("click", confirmName);

    // Allow Enter key to confirm name
    petNameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        confirmName();
      }
    });
  }
}

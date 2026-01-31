/**
 * Egg Animation Module
 * Handles the glitch egg hatching animation
 */

export function hideGlitchEgg() {
  const glitchDiv = document.getElementById("colorfulGlitchDiv");
  if (!glitchDiv) return;

  // make sure it's visible before animating
  glitchDiv.style.display = "flex";

  // RESTART the CSS animation reliably
  glitchDiv.classList.remove("hatching");
  void glitchDiv.offsetWidth; // force reflow
  glitchDiv.classList.add("hatching");

  // hide after hatch duration (matches @keyframes eggHatching 1.5s)
  setTimeout(() => {
    glitchDiv.style.display = "none";
    glitchDiv.classList.remove("hatching");
  }, 1500);
}

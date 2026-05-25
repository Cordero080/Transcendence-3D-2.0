// ████████████████████████████████████████████████████████████████████████████
// ⚡  EVOLUTION VISUAL EFFECTS MODULE
// All visual-only effects triggered during pet evolution and transcendence.
// No game state here — pure visual triggers called from app.js
//
// SECTIONS IN THIS FILE:
//   1. triggerCyberpunkEvolutionEffect()  → cyberpunk flash on stage evolution
//   2. triggerMysticalTranscendence()     → white stage mandala orb + fade
//   3. triggerGlitchTransitionFlash()     → stutter orb between animations
//   4. triggerGlitchStutter()             → alias for #3
//
// CSS COUNTERPARTS:
//   effects/evolution.css       → evolution flash styles
//   effects/transcendence.css   → transcendence orb + ring styles
//   main.css → search "GLITCH STUTTER OVERLAY" → stutter orb styles
// ████████████████████████████████████████████████████████████████████████████

import { getCatMaskData } from "@/main-test.js";

// DOM element references (set on init)
let transcendenceEffect = null;

/**
 * Initialize effect elements - call once on app load
 */
export function initEffectElements() {
  transcendenceEffect = document.getElementById("transcendenceEffect");
}

// ── 1. CYBERPUNK EVOLUTION FLASH ─────────────────────────────────────────────
// Called when pet evolves to next stage. Flashes #glitchOverlay with .evolution
// CSS in: src/assets/styles/effects/evolution.css
export function triggerCyberpunkEvolutionEffect(duration = 6000) {
  console.log(
    "⚡ triggerCyberpunkEvolutionEffect called with duration:",
    duration,
  );

  const glitchOverlay = document.getElementById("glitchOverlay");
  console.log("⚡ glitchOverlay element:", glitchOverlay);

  // Do NOT play stutterMask.wav during evolution (handled by caller if needed)
  const stutterMaskAudio = document.getElementById("stutterMask");
  if (stutterMaskAudio) {
    stutterMaskAudio.currentTime = 0;
    stutterMaskAudio.volume = 1;
    stutterMaskAudio.play().catch((err) => {
      console.log("🔇 stutterMask.wav audio play() blocked:", err);
    });
  }

  if (glitchOverlay) {
    console.log(
      "🌟✨ Cyberpunk magical evolution effect triggered - overlay found!",
    );

    const catData = getCatMaskData();
    console.log("⚡ catData:", catData);

    if (catData) {
      glitchOverlay.style.left = `50%`;
      glitchOverlay.style.top = `50%`;
      glitchOverlay.style.width = `${catData.width * 1.5}px`;
      glitchOverlay.style.height = `${catData.height * 1.5}px`;
      glitchOverlay.style.transform = "translate(-50%, -50%)";

      console.log(`✨ Cyberpunk evolution effect positioned around cat`);
    }

    glitchOverlay.classList.add("active", "evolution");

    // Create pulsing effect with multiple phases
    let pulseCount = 0;
    const pulseInterval = setInterval(() => {
      pulseCount++;

      if (pulseCount % 2 === 0) {
        glitchOverlay.style.filter = `
          brightness(300%) 
          contrast(200%) 
          hue-rotate(${Math.random() * 80}deg) 
          saturate(400%)
          drop-shadow(0 0 20px #00ffff)
          drop-shadow(0 0 40px #ff00ff)
          drop-shadow(0 0 60px #ffff00)
        `;
      } else {
        glitchOverlay.style.filter = `
          brightness(500%) 
          contrast(300%) 
          hue-rotate(${180 + Math.random() * 60}deg) 
          saturate(600%)
          drop-shadow(0 0 30px #ff0080)
          drop-shadow(0 0 50px #0080ff)
          drop-shadow(0 0 70px #00ff51ff)
        `;
      }

      if (pulseCount >= 12) {
        clearInterval(pulseInterval);
      }
    }, 500);

    setTimeout(() => {
      glitchOverlay.classList.remove("active", "evolution");
      clearInterval(pulseInterval);

      setTimeout(() => {
        glitchOverlay.style.left = "50%";
        glitchOverlay.style.top = "50%";
        glitchOverlay.style.width = "280px";
        glitchOverlay.style.height = "380px";
        glitchOverlay.style.filter = "";
      }, 100);
      console.log("✨ Cyberpunk magical evolution effect ended");
    }, duration);
  }
}

// ── 2. MYSTICAL TRANSCENDENCE ORB ────────────────────────────────────────────
// White stage final ascension. Spins the mandala orb + expanding rings.
// CSS in: src/assets/styles/effects/transcendence.css
// Tune position/size with the ← arrow comments inside this function
export function triggerMysticalTranscendence(duration = 16500) {
  if (transcendenceEffect) {
    console.log(
      "🌟✨ Mystical transcendence effect with mandala glow triggered",
    );

    const catData = getCatMaskData();
    if (catData) {
      const container = document.getElementById("pet-container");
      const layoutH = container.offsetHeight || 600;
      const layoutW = container.offsetWidth || 990;
      // Use actual model center (NDC %) so the orb tracks the figure, not a
      // hardcoded 50% that was wrong + had a broken calc (missing + operator).
      // Size is the larger of bounding-box projection or 60% of container so
      // it always covers feet-to-head even if rest-pose bbox is small.
      // ── TRANSCENDENCE ORB SIZE ───────────────────────────────────────────
      // bboxSize: bounding-box * multiplier. Increase multiplier to grow orb.
      const bboxSize = Math.max(catData.width, catData.height) * 2.0; // ← multiplier
      // minSize: floor as % of container so orb never looks tiny.
      const minSize = Math.min(layoutW, layoutH) * 0.65; // ← 0.65 = 65% of container
      const size = Math.max(bboxSize, minSize);

      // ── TRANSCENDENCE ORB POSITION ───────────────────────────────────────
      // xPct/yPct = projected model center (0–100%). Adjust the offset to
      // shift the orb up (-) or down (+) relative to the figure's center.
      transcendenceEffect.style.left = `${catData.xPct}%`;
      transcendenceEffect.style.top = `${catData.yPct - 8}%`; // ← vertical offset (negative = up)
      transcendenceEffect.style.width = `${size}px`;
      transcendenceEffect.style.height = `${size}px`;
      transcendenceEffect.style.transform = "translate(-50%, -50%)";
    }

    transcendenceEffect.classList.add("active");

    let pulseCount = 0;
    const totalPhases = 66;
    const mysticalInterval = setInterval(() => {
      pulseCount++;
      const phase = pulseCount % 20;

      if (phase === 0) {
        transcendenceEffect.style.filter = `
          blur(2px) brightness(90%) saturate(110%) 
          drop-shadow(0 0 30px rgba(97, 8, 186, 0.3))
          drop-shadow(0 0 60px rgba(255, 215, 0, 0.2))
        `;
      } else if (phase === 1) {
        transcendenceEffect.style.filter = `
          blur(1.8px) brightness(100%) saturate(130%) 
          drop-shadow(0 0 40px rgba(255, 105, 180, 0.4))
          drop-shadow(0 0 80px rgba(138, 43, 226, 0.3))
        `;
      } else if (phase === 2) {
        transcendenceEffect.style.filter = `
          blur(1.5px) brightness(110%) saturate(150%) 
          drop-shadow(0 0 50px rgba(75, 0, 130, 0.5))
          drop-shadow(0 0 100px rgba(138, 43, 226, 0.3))
        `;
      } else if (phase === 3) {
        transcendenceEffect.style.filter = `
          blur(1.3px) brightness(130%) saturate(180%) 
          drop-shadow(0 0 60px rgba(0, 191, 255, 0.4))
          drop-shadow(0 0 120px rgba(147, 0, 211, 0.25))
        `;
      } else if (phase === 4) {
        transcendenceEffect.style.filter = `
          blur(1px) brightness(150%) saturate(200%) 
          drop-shadow(0 0 70px rgba(255, 215, 0, 0.6))
          drop-shadow(0 0 140px rgba(255, 255, 255, 0.3))
        `;
      } else if (phase === 5) {
        transcendenceEffect.style.filter = `
          blur(0.8px) brightness(170%) saturate(250%) 
          drop-shadow(0 0 60px rgba(255, 105, 180, 0.4))
          drop-shadow(0 0 90px rgba(138, 43, 226, 0.35))
          drop-shadow(0 0 120px rgba(0, 191, 255, 0.25))
          drop-shadow(0 0 150px rgba(255, 215, 0, 0.25))
        `;
      } else if (phase === 6) {
        transcendenceEffect.style.filter = `
          blur(1px) brightness(190%) saturate(300%) 
          drop-shadow(0 0 70px rgba(255, 105, 180, 0.5))
          drop-shadow(0 0 110px rgba(138, 43, 226, 0.4))
          drop-shadow(0 0 150px rgba(0, 191, 255, 0.3))
          drop-shadow(0 0 190px rgba(255, 215, 0, 0.3))
        `;
      } else {
        const intensity = Math.min(1.0 + (pulseCount / totalPhases) * 0.5, 1.5);
        transcendenceEffect.style.filter = `
          blur(1.2px) 
          brightness(${210 * intensity}%) 
          saturate(${350 * intensity}%) 
          drop-shadow(0 0 ${80 * intensity}px rgba(255, 105, 180, 0.6))
          drop-shadow(0 0 ${120 * intensity}px rgba(138, 43, 226, 0.5))
          drop-shadow(0 0 ${160 * intensity}px rgba(0, 191, 255, 0.4))
          drop-shadow(0 0 ${200 * intensity}px rgba(255, 215, 0, 0.4))
          drop-shadow(0 0 ${240 * intensity}px rgba(64, 224, 208, 0.3))
        `;
      }

      if (pulseCount >= totalPhases) {
        clearInterval(mysticalInterval);
      }
    }, 250);

    setTimeout(() => {
      transcendenceEffect.classList.remove("active", "transcendence");
      clearInterval(mysticalInterval);

      setTimeout(() => {
        transcendenceEffect.style.left = "50%";
        transcendenceEffect.style.top = "50%";
        transcendenceEffect.style.width = "400px";
        transcendenceEffect.style.height = "400px";
        transcendenceEffect.style.webkitMask = "";
        transcendenceEffect.style.mask = "";
        transcendenceEffect.style.filter = "";
      }, 100);
      console.log("🌟✨ Mystical transcendence effect ended");
    }, duration);
  }
}

// ============ ⚡ GLITCH TRANSITION FLASH ============ \\
// ── 3. GLITCH STUTTER TRANSITION FLASH ───────────────────────────────────────
// Spectral orb that masks model-swap between animations (teleport illusion).
// CSS in: main.css → search "GLITCH STUTTER OVERLAY"
// Tune position/size with the ← arrow comments inside this function
export function triggerGlitchTransitionFlash(duration = 120) {
  const glitchStutterAudio = document.getElementById("stutterMask");
  if (glitchStutterAudio) {
    glitchStutterAudio.currentTime = 0;
    glitchStutterAudio.volume = 0.3;
    glitchStutterAudio.play().catch((err) => {
      console.log("🔇 stutterMask.wav audio play() blocked:", err);
    });
  }

  const glitchOverlay = document.getElementById("glitchOverlay");
  if (glitchOverlay) {
    const catData = getCatMaskData();

    if (catData) {
      // Container layout dims for percentage-based minimum sizes.
      // Skinned mesh rest-pose bounding box is often much smaller than the
      // animated visual extent, so we clamp to a floor that always covers the cat.
      const container = document.getElementById("pet-container");
      const layoutW = container.offsetWidth || 990;
      const layoutH = container.offsetHeight || 600;

      // ── STUTTER ORB SIZE ─────────────────────────────────────────────────
      // bbox * multiplier vs % floor — whichever is larger wins.
      const width = Math.max(catData.width * 2.5, layoutW * 0.38); // ← 2.5× bbox or 38% container width
      const height = Math.max(catData.height * 2.5, layoutH * 0.55); // ← 2.5× bbox or 55% container height

      // ── STUTTER ORB POSITION ─────────────────────────────────────────────
      // Centered on projected model position. Add/subtract % to shift.
      glitchOverlay.style.left = `${catData.xPct}%`; // ← horizontal center
      glitchOverlay.style.top = `${catData.yPct}%`; // ← vertical center (add offset e.g. catData.yPct - 5 to move up)
      glitchOverlay.style.width = `${width}px`;
      glitchOverlay.style.height = `${height}px`;
      glitchOverlay.style.transform = "translate(-50%, -50%)";
      glitchOverlay.style.borderRadius = "50%";

      glitchOverlay.style.background = "transparent";
      glitchOverlay.style.mixBlendMode = "screen";

      const scanlines = glitchOverlay.querySelector(".stutter-scanlines");
      const staticEl = glitchOverlay.querySelector(".stutter-static");
      const flash = glitchOverlay.querySelector(".stutter-flash");

      if (scanlines) {
        scanlines.style.display = "block";
        scanlines.style.transform = "scale(1.0) rotate(-3deg)";
        scanlines.style.opacity = "1";
        scanlines.style.transition = "opacity 0.6s ease-out";
        scanlines.style.animation =
          "teleportPulse 0.12s ease-in-out, stutterScan 0.08s linear infinite, scanlinesWarp 1.2s linear infinite";
      }

      if (staticEl) {
        staticEl.style.display = "block";
        staticEl.style.transform = "scale(0.7) translateY(-3px)";
        staticEl.style.opacity = "0.9";
        staticEl.style.transition = "opacity 0.6s ease-out";
        staticEl.style.animation =
          "teleportPulse 0.12s ease-in-out 0.04s, stutterStatic 0.07s linear infinite, staticWarp 2.2s linear infinite";
      }

      if (flash) {
        flash.style.display = "block";
        flash.style.transform = "scale(0.4) rotate(3deg) translateY(3px)";
        flash.style.opacity = "1";
        flash.style.transition = "opacity 0.6s ease-out";
        flash.style.animation =
          "teleportPulse 0.12s ease-in-out 0.08s, stutterFlash 0.1s ease-out, flashWarp 1.7s linear infinite";
      }
    }

    glitchOverlay.classList.add("active");
    glitchOverlay.style.opacity = "1";
    glitchOverlay.style.transition = "opacity 0.6s ease-out";
    glitchOverlay.style.filter = `
      saturate(400%) 
      brightness(250%) 
      contrast(150%)
    `;

    setTimeout(() => {
      glitchOverlay.style.opacity = "0";
      const scanlines = glitchOverlay.querySelector(".stutter-scanlines");
      const staticEl = glitchOverlay.querySelector(".stutter-static");
      const flash = glitchOverlay.querySelector(".stutter-flash");

      if (scanlines) scanlines.style.opacity = "0";
      if (staticEl) staticEl.style.opacity = "0";
      if (flash) flash.style.opacity = "0";

      setTimeout(() => {
        glitchOverlay.classList.remove("active");
        glitchOverlay.style.transition = "";
        glitchOverlay.style.filter = "";
        glitchOverlay.style.mixBlendMode = "";
        glitchOverlay.style.background = "";

        if (scanlines) {
          scanlines.style.display = "none";
          scanlines.style.transform = "";
          scanlines.style.opacity = "";
          scanlines.style.transition = "";
        }
        if (staticEl) {
          staticEl.style.display = "none";
          staticEl.style.transform = "";
          staticEl.style.opacity = "";
          staticEl.style.transition = "";
        }
        if (flash) {
          flash.style.display = "none";
          flash.style.transform = "";
          flash.style.opacity = "";
          flash.style.transition = "";
        }
      }, 600);
    }, duration);
  }
}

// ── 4. ALIAS (app.js calls this name) ────────────────────────────────────────
export function triggerGlitchStutter(duration = 120) {
  triggerGlitchTransitionFlash(duration);
}

// Expose to window for backward compatibility (canonical name only)
window.triggerCyberpunkEvolutionEffect = triggerCyberpunkEvolutionEffect;

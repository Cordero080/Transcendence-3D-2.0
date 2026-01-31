// ============================================================================
// EVOLUTION VISUAL EFFECTS MODULE
// Pure visual effects - safe to modularize, no game state dependencies
// ============================================================================

import { getCatMaskData } from "@/main-test.js";

// DOM element references (set on init)
let transcendenceEffect = null;

/**
 * Initialize effect elements - call once on app load
 */
export function initEffectElements() {
  transcendenceEffect = document.getElementById("transcendenceEffect");
}

// ============ ⚡ CYBERPUNK EVOLUTION EFFECT ============ \\
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

// ============ ✨ MYSTICAL TRANSCENDENCE EFFECT ============ \\
export function triggerMysticalTranscendence(duration = 16500) {
  if (transcendenceEffect) {
    console.log(
      "🌟✨ Mystical transcendence effect with mandala glow triggered",
    );

    const catData = getCatMaskData();
    if (catData) {
      const size = Math.max(catData.width, catData.height) * 1.55;
      transcendenceEffect.style.left = "50%";
      transcendenceEffect.style.top = "calc(50% 40px)";
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
      const width = catData.width * 1.2;
      const height = catData.height * 1;

      glitchOverlay.style.left = "50%";
      glitchOverlay.style.top = "60%";
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
        scanlines.style.animation = "teleportPulse 0.12s ease-in-out";
      }

      if (staticEl) {
        staticEl.style.display = "block";
        staticEl.style.transform = "scale(0.7) translateY(-3px)";
        staticEl.style.opacity = "0.9";
        staticEl.style.transition = "opacity 0.6s ease-out";
        staticEl.style.animation = "teleportPulse 0.12s ease-in-out 0.04s";
      }

      if (flash) {
        flash.style.display = "block";
        flash.style.transform = "scale(0.4) rotate(3deg) translateY(3px)";
        flash.style.opacity = "1";
        flash.style.transition = "opacity 0.6s ease-out";
        flash.style.animation = "teleportPulse 0.12s ease-in-out 0.08s";
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

// ============ ⚡ QUICK MANDALA FLASH ============ \\
export function triggerQuickMandalaFlash(duration = 200) {
  const glitchStutterAudio = document.getElementById("stutterMask");
  if (glitchStutterAudio) {
    glitchStutterAudio.currentTime = 0;
    glitchStutterAudio.volume = 0.3;
    glitchStutterAudio.play().catch((err) => {
      console.log("🔇 stutterMask.wav audio play() blocked:", err);
    });
  }

  if (transcendenceEffect) {
    const catData = getCatMaskData();

    if (catData) {
      const size = Math.max(catData.width, catData.height) * 1.3;
      transcendenceEffect.style.left = "50%";
      transcendenceEffect.style.top = "calc(50% + 20px)";
      transcendenceEffect.style.width = `${size}px`;
      transcendenceEffect.style.height = `${size}px`;
      transcendenceEffect.style.transform = "translate(-50%, -50%)";
    }

    transcendenceEffect.classList.add("active");

    transcendenceEffect.style.filter = `
      blur(1px) 
      brightness(550%) 
      saturate(900%) 
      drop-shadow(0 0 60px rgba(255, 105, 180, 0.93))
      drop-shadow(0 0 100px rgba(137, 43, 226, 0.9))
      drop-shadow(0 0 140px rgba(0, 191, 255, 0.84))
    `;

    setTimeout(() => {
      transcendenceEffect.classList.remove("active");
      transcendenceEffect.style.filter = "";
    }, duration);
  }
}

// ============ LEGACY WRAPPER ============ \\
export function triggerGlitchStutter(duration = 120) {
  triggerGlitchTransitionFlash(duration);
}

// Expose to window for backward compatibility (canonical name only)
window.triggerCyberpunkEvolutionEffect = triggerCyberpunkEvolutionEffect;

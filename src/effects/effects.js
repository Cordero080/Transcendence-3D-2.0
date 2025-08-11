// src/effects/effects.js
// Purely visual helpers: glitch effects, lighting, CSS animation triggers

export function playEvolutionSound() {
  const evolutionAudio = document.getElementById("evolution-sound");
  if (evolutionAudio) {
    evolutionAudio.volume = 1.0;
    evolutionAudio.currentTime = 0;
    evolutionAudio.play().catch((error) => {
      console.log("🔇 Evolution sound autoplay blocked:", error);
    });
    console.log(
      "🔊 Evolution sound wave playing at volume:",
      evolutionAudio.volume
    );
  } else {
    console.warn("⚠️ Evolution sound element not found");
  }
}

export function triggerGlitchStutter(duration = 120) {
  const glitchStutterAudio = document.getElementById("stutterMask");
  const glitchStutterOverlay = document.getElementById("glitchStutterOverlay");
  const glitchStutterOverlay2 = document.getElementById(
    "glitchStutterOverlay2"
  );
  if (glitchStutterAudio) {
    glitchStutterAudio.currentTime = 0;
    glitchStutterAudio.volume = 0.8;
    glitchStutterAudio.play().catch((err) => {
      console.log("🔇 stutterMask.wav audio play() blocked:", err);
    });
  }
  if (glitchStutterOverlay) {
    glitchStutterOverlay.classList.add("active");
    if (glitchStutterOverlay2) glitchStutterOverlay2.classList.add("active");
    setTimeout(() => {
      glitchStutterOverlay.classList.remove("active");
      if (glitchStutterOverlay2)
        glitchStutterOverlay2.classList.remove("active");
    }, duration);
  }
}

export function triggerCyberpunkEvolutionEffect(duration = 6000) {
  const glitchStutterOverlay = document.getElementById("glitchStutterOverlay");
  if (glitchStutterOverlay) {
    glitchStutterOverlay.classList.add("active", "evolution");
    setTimeout(() => {
      glitchStutterOverlay.classList.remove("active", "evolution");
    }, duration);
  }
}

export function triggerMysticalTranscendence(duration = 16500) {
  const glitchStutterOverlay = document.getElementById("glitchStutterOverlay");
  if (glitchStutterOverlay) {
    glitchStutterOverlay.classList.add("active", "transcendence");
    setTimeout(() => {
      glitchStutterOverlay.classList.remove("active", "transcendence");
    }, duration);
  }
}

export function triggerIntergalacticBeam() {
  const beamElement = document.createElement("div");
  beamElement.className = "intergalactic-beam";
  beamElement.style.left = "50%";
  beamElement.style.top = "0px";
  beamElement.style.transform = "translate(-50%, 0)";
  beamElement.style.height = "100vh";
  document.body.appendChild(beamElement);
  setTimeout(() => {
    if (beamElement.parentNode) beamElement.parentNode.removeChild(beamElement);
  }, 9000);
}

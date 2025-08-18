// modules/ui.js
export function initUI() {
  const evolutionAudio = document.getElementById("evolution-sound");
  const evolveEffectAudio = document.getElementById("evolve_effect_2");
  const highTechAudio = document.getElementById("high-tech");
  // const gameOverOverlay = document.getElementById("gameOverOverlay");
  const reasonElement = document.getElementById("gameOverReason");
  const petChat = document.querySelector(".infoBox_petChat");
  const hungerTimer = document.getElementById("hungerTimer");
  const funTimer = document.getElementById("funTimer");
  const sleepTimer = document.getElementById("sleepTimer");
  const powerTimer = document.getElementById("powerTimer");
  const overlay = document.getElementById("pageOverlay");
  const overlayStartBtn = document.getElementById("overlayStartButton");
  const resetBtn = document.querySelector(".ResetButton");
  const buttons = document.querySelectorAll(".Buttons");
  const btn = document.getElementById("infoDropdownBtn");
  const menu = document.getElementById("infoDropdownMenu");
  const container = document.querySelector(".dropdown-container");
  const feedIndicator = document.querySelector("#hungerTimer");
  const danceIndicator = document.querySelector("#funTimer");
  const sleepIndicator = document.querySelector("#sleepTimer");
  const powerIndicator = document.querySelector("#powerTimer");
  const glitchStutterOverlay = document.getElementById("glitchStutterOverlay");
  const glitchStutterOverlay2 = document.getElementById("glitchStutterOverlay2");
  const glitchDiv = document.getElementById("colorfulGlitchDiv");
  // const winOverlay = document.getElementById("winOverlay");
  const bgMusic = document.getElementById("bg-music");
  const spaceEngineAudio = document.getElementById("space-engine");
  const feedButton = buttons[0];
const danceButton = buttons[1];
const sleepButton = buttons[2];
const trainButton = buttons[3];

  return {
    // existing returns...
    evolutionAudio, evolveEffectAudio, highTechAudio,
    // gameOverOverlay,
     reasonElement, petChat,
    hungerTimer, funTimer, sleepTimer, powerTimer,
    overlay, overlayStartBtn, resetBtn, buttons,
    btn, menu, container,
    feedIndicator, danceIndicator, sleepIndicator, powerIndicator,
    glitchStutterOverlay, glitchStutterOverlay2, glitchDiv,
    // winOverlay, 
    bgMusic, spaceEngineAudio,

    // NEW: return the individual buttons
    feedButton, danceButton, sleepButton, trainButton,
    // optional alias if your code references weakButton:
    weakButton: trainButton,
  };
}

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
  const buttons = document.querySelectorAll(".Buttons");
  const btn = document.getElementById("infoDropdownBtn");
  const menu = document.getElementById("infoDropdownMenu");
  const container = document.querySelector(".dropdown-container");
  const glitchOverlay = document.getElementById("glitchOverlay");
  const glitchOverlay2 = document.getElementById("glitchOverlay2");
  const transcendenceEffect = document.getElementById("transcendenceEffect");
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
    evolutionAudio,
    evolveEffectAudio,
    highTechAudio,
    // gameOverOverlay,
    reasonElement,
    petChat,
    hungerTimer,
    funTimer,
    sleepTimer,
    powerTimer,
    overlay,
    overlayStartBtn,
    buttons,
    btn,
    menu,
    container,
    glitchOverlay,
    glitchOverlay2,
    transcendenceEffect,
    glitchDiv,
    // winOverlay,
    bgMusic,
    spaceEngineAudio,
    feedButton,
    danceButton,
    sleepButton,
    trainButton,
  };
}

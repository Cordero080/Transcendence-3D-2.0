window.addEventListener("DOMContentLoaded", () => {
  // Set initial background music volume
  const bgMusic = document.getElementById("bg-music");
  if (bgMusic) {
    bgMusic.volume = 0.15;
  }
  // Initialize effect system DOM references
  initEffectElements();
});

// safety so missing function won't crash white-stage evolution
window.startWhiteEmissionTimer =
  window.startWhiteEmissionTimer || function () {};
// --- Debug resource loading ---
// --- Debug: catch any silent async errors ---
window.addEventListener("unhandledrejection", (e) => {
  console.error("[UNHANDLED PROMISE]", e.reason);
});

// --- imports and code ---

import { createState } from "@core/state.js";
import { initUI } from "@ui/ui.js";
import {
  loadAndDisplayFBX,
  clearActiveModel,
  setWhiteStageLighting,
  getCatMaskData,
} from "@/main-test.js";
import animationConfig from "@/annimationConfig.js";

// Import extracted modules
import {
  gameSettings,
  stageMap,
  stageEmojis,
  danceIndices,
  trainIndices,
} from "@core/config.js";
import { fadeOutBgMusic, playEvolutionSound } from "@effects/audio.js";
import {
  triggerCyberpunkEvolutionEffect,
  triggerMysticalTranscendence,
  triggerGlitchStutter,
  initEffectElements,
} from "@effects/evolutionEffects.js";
import { showTranscendenceOverlay, showGameOverOverlay } from "@ui/overlays.js";
import { setupDropdownMenu } from "@ui/dropdown.js";
import { setupNameOverlay } from "@ui/nameOverlay.js";
import { updatePetChat } from "@ui/petChat.js";
import { restorePetContainer } from "@ui/petContainer.js";

const {
  evolutionAudio,
  evolveEffectAudio,
  highTechAudio,
  // gameOverOverlay,
  reasonElement,
  petChat,
  hungerTimer,
  funTimer,
  startBtn,
  sleepTimer,
  powerTimer,
  overlay,
  overlayStartBtn,
  resetBtn,
  buttons,
  btn,
  menu,
  container,
  feedIndicator,
  danceIndicator,
  sleepIndicator,
  powerIndicator,
  glitchOverlay,
  glitchOverlay2,
  transcendenceEffect,
  glitchDiv,
  // winOverlay,
  bgMusic,
  spaceEngineAudio,

  // ⬇️ add these
  feedButton,
  danceButton,
  sleepButton,
  trainButton,
  weakButton,
} = initUI();

const state = createState();
window._state = state;
// optional: lets you inspect it in DevTools

console.log(feedButton, danceButton, sleepButton, trainButton, weakButton);

// --- Modular Care Action Handler ---
const actionConfigs = {
  feed: {
    button: feedButton,
    action: () => myPet.feed(),
    animation: (stage) => playActionThenShareIdle("feed", stage),
    message: () =>
      "🍽️ This is so good, it's actually making me angry. How dare you set the bar this high? hit the spot! ",
    available: (stage) => !!animationConfig[stage]?.feed,
  },
  dance: {
    button: danceButton,
    action: () => myPet.dance(),
    animation: (stage) => playDanceAction(stage),
    message: () => "💃 I gets BUZY! Pawz on fire!",
    available: () => true,
  },
  sleep: {
    button: sleepButton,
    action: () => myPet.sleepRest(),
    animation: (stage) => playActionThenShareIdle("sleep", stage),
    message: () => "😴 Got tickets to the blanket show...zzz",
    available: (stage) => !!animationConfig[stage]?.sleep,
  },
  train: {
    button: trainButton,
    action: () => myPet.train(),
    animation: (stage) => playActionThenShareIdle("train", stage),
    message: () =>
      "🐉 The purpose of today's training is to defeat yesterday's understanding.",
    available: () => true,
  },
};

function handleCareAction(actionName) {
  return async function () {
    const config = actionConfigs[actionName];
    if (!config) return;

    // Prevent actions before game starts (before egg hatches)
    if (!gameStarted) {
      console.log(`⚠️ Game hasn't started yet - egg must hatch first!`);
      return;
    }

    if (actionInProgress || gameOverTriggered || config.button.disabled) return;
    actionInProgress = true;
    stopWhiteEmissionTimer && stopWhiteEmissionTimer();
    try {
      if (!config.available(currentStage)) {
        console.log(
          `⚠️ ${actionName} action not available for ${currentStage} stage`,
        );
        actionInProgress = false;
        return;
      }
      config.action();
      updatePetChat(config.message());
      // Mark care action as completed for evolution tracking
      if (buttonTracker.hasOwnProperty(actionName)) {
        buttonTracker[actionName] = true;
      }

      // Restore stage message after 3 seconds
      setTimeout(() => {
        if (myPet && stageMap[myPet.evolutionLevel]) {
          updatePetChat(
            stageMap[myPet.evolutionLevel].chatMessage ||
              `${stageEmojis[myPet.stage]} ${myPet.name}${
                stageMap[myPet.evolutionLevel].message
              }`,
          );
        }
      }, 3000);

      // Play stutterMask.wav 3ms before glitch stutter (except dance, which has its own music logic)
      if (actionName !== "dance") {
        const stutterMaskAudio = document.getElementById("stutterMask");
        if (stutterMaskAudio) {
          stutterMaskAudio.currentTime = 0;
          stutterMaskAudio.volume = 1.0;
          stutterMaskAudio.play().catch((err) => {
            console.log("🔇 stutterMask.wav audio play() blocked:", err);
          });
        }
        await new Promise((resolve) => setTimeout(resolve, 3));
        triggerGlitchStutter && triggerGlitchStutter(90);
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      // Special dance music logic
      if (actionName === "dance") {
        let radianceAudio = document.getElementById("radiance-music");
        if (!radianceAudio) {
          radianceAudio = document.createElement("audio");
          radianceAudio.id = "radiance-music";
          radianceAudio.src = "music/radiance.mp3";
          radianceAudio.preload = "auto";
          document.body.appendChild(radianceAudio);
        }
        let themeAudio = document.getElementById("bg-music");
        if (themeAudio) themeAudio.pause();
        radianceAudio.pause();
        radianceAudio.currentTime = 18;
        radianceAudio.volume = 0.5;
        radianceAudio.play().catch((err) => {
          console.log("🔇 radiance.mp3 audio play() blocked:", err);
        });
        const stutterMaskAudio = document.getElementById("stutterMask");
        if (stutterMaskAudio) {
          stutterMaskAudio.currentTime = 0;
          stutterMaskAudio.volume = 1.0;
          stutterMaskAudio.play().catch((err) => {
            console.log("🔇 stutterMask.wav audio play() blocked:", err);
          });
        }
        await new Promise((resolve) => setTimeout(resolve, 3));
        triggerGlitchStutter && triggerGlitchStutter(90);
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      // Special white stage train sound
      if (actionName === "train" && currentStage === "white") {
        setTimeout(() => {
          let whiteGongAudio = document.getElementById("white-gong");
          if (!whiteGongAudio) {
            whiteGongAudio = document.createElement("audio");
            whiteGongAudio.id = "white-gong";
            whiteGongAudio.src = "music/white_gong.mp3";
            whiteGongAudio.preload = "auto";
            document.body.appendChild(whiteGongAudio);
          }
          whiteGongAudio.currentTime = 0;
          whiteGongAudio.volume = 1.0;
          whiteGongAudio.play().catch((err) => {
            console.log("🔇 white_gong.mp3 audio play() blocked:", err);
          });
        }, 1250);
      }
      // Play animation
      await config.animation(currentStage);

      // fire Cyberpunk ~3s into idle after TRAIN in WHITE
      if (actionName === "train" && currentStage === "white") {
        setTimeout(() => {
          console.log("[CYBERPUNK] firing");
          window.triggerCyberpunkEvolutionEffect(900);
        }, 3000); // ~3s into idle
      }

      checkForEvolution && checkForEvolution();
      // After dance, stop radiance and resume theme
      if (actionName === "dance") {
        let radianceAudio = document.getElementById("radiance-music");
        let themeAudio = document.getElementById("bg-music");
        if (radianceAudio) {
          radianceAudio.pause();
          radianceAudio.currentTime = 0;
        }
        if (themeAudio) {
          themeAudio.play().catch((err) => {
            console.log("🔇 3dc_theme audio play() blocked:", err);
          });
        }
      }
    } finally {
      actionInProgress = false;
      if (currentStage === "white") {
        if (actionName === "dance" || actionName === "train") {
          if (!whiteStageCareActions.dance || !whiteStageCareActions.train) {
            startWhiteEmissionTimer && startWhiteEmissionTimer();
          }
        } else {
          startWhiteEmissionTimer && startWhiteEmissionTimer();
        }
      }
      console.log(`🔓 ${actionName} button unlocked - Action available`);
    }
  };
}

// Attach modular handlers
Object.keys(actionConfigs).forEach((action) => {
  const config = actionConfigs[action];
  if (config.button) {
    config.button.removeEventListener &&
      config.button.removeEventListener("click", config._handler);
    config._handler = handleCareAction(action);
    config.button.addEventListener("click", config._handler);
  }
});

/*---------- Variables (state) ---------*/
let currentStage; //
// loadAndDisplayFBX(
//   animationConfig[currentStage].idle.file,
//   animationConfig[currentStage].idle.pose
// );

let myPet;
let gameStarted = false;
let currentAnimationTimer = null;
let backgroundMusic;
let actionInProgress = false;
let careCycles = 0;
let gameOverTriggered = false;
let gameOverTimeout = null;
let whiteEmissionTimer = null;
let petIsDead = false; // Prevents model loading after death

// Evolution System Variables
let buttonTracker = {
  feed: false,
  dance: false,
  dance2: false,
  sleep: false,
  train: false,
  train2: false,
};
let evolutionTimeout = null;
let evolutionInProgress = false;

// White Stage Animation Counter (for transcendence after 2 animations)
let whiteStageAnimationCount = 0;
// Track which care actions have been pressed in white stage
let whiteStageCareActions = {
  dance: false,
  train: false,
};
let whiteStageTranscendenceTimeout = null;

// Dance sequence tracking
let danceSequenceIndex = 0; // 0 = dance, 1 = dance2

function allCareActionsCompleted() {
  // White stage transcendence - evolve after 2 care animations
  if (myPet && myPet.stage === "white") {
    const whiteEvolutionReady = whiteStageAnimationCount >= 2;
    console.log(
      `⚪ White stage evolution check - Animation count: ${whiteStageAnimationCount}/2, Evolution ready: ${whiteEvolutionReady}`,
    );
    return whiteEvolutionReady;
  }

  // Require all care actions for evolution: feed, sleep, dance, dance2, train, train2
  const completed =
    buttonTracker.feed &&
    buttonTracker.sleep &&
    buttonTracker.dance &&
    buttonTracker.dance2 &&
    buttonTracker.train &&
    buttonTracker.train2;
  console.log(
    `🔍 Evolution requirements - Feed: ${buttonTracker.feed}, Sleep: ${buttonTracker.sleep}, Dance: ${buttonTracker.dance}, Dance2: ${buttonTracker.dance2}, Train: ${buttonTracker.train}, Train2: ${buttonTracker.train2}`,
    `Evolution ready: ${completed}`,
  );
  return completed;
}

function resetButtonTracker() {
  console.log(
    `🔄 RESETTING button tracker - Previous state:`,
    JSON.parse(JSON.stringify(buttonTracker)),
  );
  buttonTracker = {
    feed: false,
    dance: false,
    dance2: false,
    sleep: false,
    train: false,
    train2: false,
  };
  danceSequenceIndex = 0; // Reset dance sequence to start with dance
  console.log(
    `🔄 Button tracker RESET - New state:`,
    buttonTracker,
    `Dance sequence reset to: ${danceSequenceIndex}`,
  );

  // Also reset white stage care actions and transcendence timer
  whiteStageCareActions.dance = false;
  whiteStageCareActions.train = false;
  if (whiteStageTranscendenceTimeout) {
    clearTimeout(whiteStageTranscendenceTimeout);
    whiteStageTranscendenceTimeout = null;
  }
}

function updateButtonStatesForEvolution() {
  if (!myPet) return;

  // White evolution (level 4) - only dance and train are active
  if (myPet.evolutionLevel >= 4 || myPet.stage === "white") {
    // Disable and gray out feed and sleep buttons
    feedButton.disabled = true;
    sleepButton.disabled = true;
    feedButton.style.opacity = "0.3";
    sleepButton.style.opacity = "0.3";
    feedButton.style.cursor = "not-allowed";
    sleepButton.style.cursor = "not-allowed";

    // Grey out hunger and sleep bars and show 'G0DM0DE'
    const hungerValue = document.getElementById("hungerValue");
    const sleepValue = document.getElementById("sleepValue");
    const hungerBar = document.getElementById("hungerBar");
    const sleepBar = document.getElementById("sleepBar");

    if (hungerValue) {
      hungerValue.parentElement.style.opacity = "0.3";
      hungerValue.parentElement.textContent = "G0DM0DE";
    }
    if (sleepValue) {
      sleepValue.parentElement.style.opacity = "0.3";
      sleepValue.parentElement.textContent = "G0DM0DE";
    }
    if (hungerBar) hungerBar.parentElement.style.opacity = "0.3";
    if (sleepBar) sleepBar.parentElement.style.opacity = "0.3";

    // Stop hunger and sleep timers so they do not update in white stage
    if (myPet && myPet.hungerTimer) {
      clearInterval(myPet.hungerTimer);
      myPet.hungerTimer = null;
    }
    if (myPet && myPet.sleepTimer) {
      clearInterval(myPet.sleepTimer);
      myPet.sleepTimer = null;
    }
    // Also clear statTimers intervals for hunger and sleep
    if (statTimers.hunger) {
      clearInterval(statTimers.hunger);
      statTimers.hunger = null;
    }
    if (statTimers.sleep) {
      clearInterval(statTimers.sleep);
      statTimers.sleep = null;
    }

    // If both care actions are pressed, keep dance/train disabled until transcendence completes
    if (whiteStageCareActions.dance && whiteStageCareActions.train) {
      danceButton.disabled = true;
      trainButton.disabled = true;
      danceButton.style.opacity = "0.5";
      trainButton.style.opacity = "0.5";
      danceButton.style.cursor = "not-allowed";
      trainButton.style.cursor = "not-allowed";
    } else {
      // Otherwise, allow dance/train to be pressed once each
      danceButton.disabled = whiteStageCareActions.dance;
      trainButton.disabled = whiteStageCareActions.train;
      danceButton.style.opacity = whiteStageCareActions.dance ? "0.5" : "1";
      trainButton.style.opacity = whiteStageCareActions.train ? "0.5" : "1";
      danceButton.style.cursor = whiteStageCareActions.dance
        ? "not-allowed"
        : "pointer";
      trainButton.style.cursor = whiteStageCareActions.train
        ? "not-allowed"
        : "pointer";
    }

    // Restore normal opacity for fun and power timers
    if (funTimer) {
      funTimer.style.opacity = "1";
    }
    if (powerTimer) {
      powerTimer.style.opacity = "1";
    }

    console.log(
      "⚪ White evolution reached - Feed and Sleep buttons disabled, dance/train disabled after both pressed, hunger/sleep timers greyed",
    );
  } else {
    // All other evolution levels - all buttons are active
    feedButton.disabled = false;
    sleepButton.disabled = false;
    danceButton.disabled = false;
    trainButton.disabled = false;

    feedButton.style.opacity = "1";
    sleepButton.style.opacity = "1";
    danceButton.style.opacity = "1";
    trainButton.style.opacity = "1";

    feedButton.style.cursor = "pointer";
    sleepButton.style.cursor = "pointer";
    danceButton.style.cursor = "pointer";
    trainButton.style.cursor = "pointer";

    // Restore normal opacity for all timers
    if (hungerTimer) {
      hungerTimer.style.opacity = "1";
    }
    if (sleepTimer) {
      sleepTimer.style.opacity = "1";
    }
    if (funTimer) {
      funTimer.style.opacity = "1";
    }
    if (powerTimer) {
      powerTimer.style.opacity = "1";
    }
  }
}

function checkForEvolution() {
  // Prevent multiple evolution checks while one is in progress
  if (evolutionInProgress) {
    console.log(`⏳ Evolution already in progress, skipping check`);
    return;
  }

  console.log(
    `🔍 Checking evolution - Current stage: ${myPet.stage} (${myPet.evolutionLevel}), Button tracker:`,
    buttonTracker,
  );

  if (allCareActionsCompleted()) {
    careCycles++;

    console.log(
      `✅ Care cycle complete! (${careCycles} total) - Current evolution level: ${myPet.evolutionLevel}`,
    );

    // Only evolve if not at max level (4 = white)
    if (careCycles >= 1 && myPet.evolutionLevel < 4) {
      evolutionInProgress = true; // Block further evolution checks
      console.log(
        `⚡️⚡️⚡️ All care actions complete. Evolving from ${myPet.stage} (level ${myPet.evolutionLevel}) in 1 second after idle...`,
      );
      evolutionTimeout = setTimeout(() => {
        // Play evolve_effect_2.wav 500ms before pet evolution
        setTimeout(() => {
          const evolveEffectAudio = document.getElementById("evolve_effect_2");
          if (evolveEffectAudio) {
            evolveEffectAudio.currentTime = 0;
            evolveEffectAudio.volume = 1.0;
            evolveEffectAudio.play().catch((err) => {
              console.log("🔇 evolve_effect_2.wav audio play() blocked:", err);
            });
          } else {
            console.warn("⚠️ evolve_effect_2.wav audio element not found");
          }
        }, 1000); // 2 seconds before evolution (evolution in 3000ms)

        // 🔊 Play evolution sound synchronized with effect
        playEvolutionSound();

        // Play high-tech sound effect
        const highTechAudio = document.getElementById("high-tech");
        if (highTechAudio) {
          highTechAudio.currentTime = 0;
          highTechAudio.volume = 1.0;
          highTechAudio.play().catch((err) => {
            console.log("🔇 high_tech.wav audio play() blocked:", err);
          });
        } else {
          console.warn("⚠️ high_tech.wav audio element not found");
        }

        // Trigger cyberpunk magical evolution effect
        triggerCyberpunkEvolutionEffect(6000);

        // Additional regular glitch stutter for layered effect
        setTimeout(() => {
          triggerGlitchStutter(150);
        }, 1000);

        // Evolution with slight delay to sync with magical effect
        setTimeout(() => {
          const oldStage = myPet.stage;
          myPet.evolveToNextStage();
          console.log(
            `🔄 Evolution completed: ${oldStage} → ${myPet.stage} (currentStage: ${currentStage})`,
          );

          // Update button states based on new evolution level
          updateButtonStatesForEvolution();

          // Make sure currentStage is synced before loading animation
          // Trigger glitch masking for evolution idle transition
          triggerGlitchStutter(80);

          // Small delay to let masking effect start
          setTimeout(() => {
            loadAndDisplayFBX(
              animationConfig[currentStage].idle.file,
              animationConfig[currentStage].idle.pose,
            ).then(() => {
              console.log(
                `🎬 Evolution idle animation loaded for ${currentStage} stage with masking`,
              );

              // Start white emission timer if evolved to white stage
              if (currentStage === "white") {
                console.log("⚪ Reached white stage - starting emission timer");
                startWhiteEmissionTimer();
              }
            });
          }, 20);

          // Reset AFTER evolution completes to prevent race conditions
          careCycles = 0;
          resetButtonTracker();
          evolutionInProgress = false; // Allow next evolution cycle
          actionInProgress = false; // Ensure buttons can be clicked again
          console.log(
            `🔄 Post-evolution reset: careCycles=${careCycles}, buttonTracker reset for next evolution cycle`,
          );
        }, 1000); // Wait 1 second for magical effect to build up
      }, 3000); // 3 seconds after pet is idle
    } else if (myPet.evolutionLevel >= 4) {
      // White stage transcendence handling
      if (myPet.stage === "white" && whiteStageAnimationCount >= 2) {
        console.log(
          `⚪✨ White stage transcendence ready! Animation count: ${whiteStageAnimationCount}/2`,
        );

        evolutionInProgress = true; // Block further evolution checks

        // Trigger mystical transcendence and intergalactic beam together after 5s idle
        evolutionTimeout = setTimeout(() => {
          triggerMysticalTranscendence(9000);
          triggerIntergalacticBeam();
          // Show overlay after both effects complete (9 seconds)
          setTimeout(() => {
            showWhiteTranscendenceOverlay();
          }, 9000);
        }, 5000);

        console.log(
          "⚪ White stage transcendence will trigger mystical and beam in 5 seconds...",
        );
        whiteStageAnimationCount = 0;
        resetButtonTracker();
      } else {
        console.log(
          `⚪ ${myPet.name} has reached white evolution! Waiting for 2 care animations (${whiteStageAnimationCount}/2)`,
        );
        careCycles = 0; // Reset care cycles but don't evolve
        resetButtonTracker();
      }
    } else {
      resetButtonTracker(); // Ready for next cycle
    }
  }
}

// Timer System Variables
let statTimers = {
  hunger: null,
  fun: null,
  sleep: null,
  power: null,
};
let slowedTimers = {
  hunger: false,
  fun: false,
  sleep: false,
  power: false,
};

/*----- Cached Element References  -----*/

// *---------------CACHED ELEMENTS ---------------------* \\

// 🧬 Transcendence Pet Class
class Pet {
  constructor(petName = "Coco") {
    this.name = petName;
    this.age = 0;
    this.hunger = 0;
    this.fun = 10;
    this.sleep = 0;
    this.power = 10;
    this.stage = "blue"; // starts as blue after hatching
    this.evolutionLevel = 0; // 0=blue, 1=yellow, 2=green, 3=red, 4=white

    // Flags for visual messaging
    this.showingEvolutionMessage = false;
    this.showingActionMessage = false;

    // Internal timers
    this.ageInterval = null;
  }

  // 🥚 Feed Action
  feed() {
    this.hunger = Math.max(0, this.hunger - 2);
    console.log(`${this.name} is eating. Hunger: ${this.hunger}`);
    this.render();
  }

  // 🎶 Dance Action
  dance() {
    this.fun = Math.min(10, this.fun + 2);
    console.log(`${this.name} is dancing. Fun: ${this.fun}`);
    this.render();
  }

  // 💤 Sleep Action
  sleepRest() {
    this.sleep = Math.max(0, this.sleep - 2);
    console.log(`${this.name} is sleeping. Sleep: ${this.sleep}`);
    this.render();
  }
  train() {
    this.power = Math.min(10, this.power + 2);
    console.log(`${this.name} is training. Power: ${this.power}`);
    this.render();
  }

  // 🌱 Trigger Evolution
  evolveToNextStage() {
    console.log(
      `🔄 Evolution attempt: Current level ${this.evolutionLevel} (${this.stage})`,
    );

    if (this.evolutionLevel < 4) {
      // Can evolve up to level 4 (white)
      const oldStage = this.stage;
      const oldLevel = this.evolutionLevel;

      this.evolutionLevel++;
      const stages = ["blue", "yellow", "green", "red", "white"];
      this.stage = stages[this.evolutionLevel];
      currentStage = this.stage; // SYNC GLOBAL currentStage

      console.log(
        `🌟 ${this.name} evolved from ${oldStage} (Level ${oldLevel}) to ${this.stage} (Level ${this.evolutionLevel})!`,
      );
      console.log(
        `📊 Evolution progression: blue(0) → yellow(1) → green(2) → red(3) → white(4)`,
      );

      this.age += 5;
      console.log(`🐱 ${this.name} has aged to ${this.age} years old`);
      // Show chatMessage in petChat for the new stage evolution
      if (stageMap[this.evolutionLevel]) {
        updatePetChat(
          stageMap[this.evolutionLevel].chatMessage ||
            `${stageEmojis[this.stage]} ${this.name}${
              stageMap[this.evolutionLevel].message
            }`,
        );
      }
      this.render();
    } else {
      console.log(
        `✨ ${this.name} has reached the final form: ${this.stage} (Level ${this.evolutionLevel})! No further evolution possible.`,
      );
    }
  }

  // PET AGES
  startAging() {
    this.ageInterval = setInterval(() => {
      this.age++;
      console.log(`🐱 ${this.name} aged to ${this.age} year sold`);
      this.render();
    }, gameSettings.ageInterval);
  }
  // ⚰️ Game Over
  // inside class Pet { ... }
  async triggerGameOver(reason) {
    if (gameOverTriggered) {
      console.log("💀 GAME OVER already triggered, ignoring duplicate.");
      return;
    }
    gameOverTriggered = true;
    petIsDead = true; // Prevent any further model loading

    console.log(`💀 GAME OVER: ${reason}`);

    // Stop stat decay timers first
    this.stopAllTimers();
    gameStarted = false;

    // clear any previous scheduled show (belt-and-suspenders)
    if (gameOverTimeout) {
      clearTimeout(gameOverTimeout);
      gameOverTimeout = null;
    }

    // LOAD DEATH ANIMATION AND WAIT FOR IT TO COMPLETE
    const deathAnim = animationConfig[currentStage]?.death;
    if (deathAnim) {
      console.log(`🎬 Playing death animation for ${currentStage} stage...`);

      // For death animations, load with loop = false to prevent infinite looping
      const deathDuration = await loadAndDisplayFBX(
        deathAnim.file,
        deathAnim.pose,
        { loop: false },
      );

      // 1 loop + 0.5s pad, then show overlay
      const totalDeathDuration = (deathDuration || 0) + 500;

      gameOverTimeout = setTimeout(() => {
        showGameOverOverlay(reason); // << use the helper every time
        gameOverTimeout = null;
      }, totalDeathDuration);
    } else {
      // No death animation available, show overlay immediately
      showGameOverOverlay(reason); // << helper again
    }

    this.render(); // update final stat display
  }
  // ⏳ Stat decay //

  createStatTimer(type, interval = 7000) {
    console.log(
      `⏰ Creating stat timer for ${type} with interval ${interval}ms`,
    );
    const timer = setInterval(() => {
      console.log(
        `⏰ Stat timer tick: ${type} - hunger:${this.hunger} fun:${this.fun} sleep:${this.sleep} power:${this.power}`,
      );
      if (type === "hunger") this.hunger++;
      if (type === "fun") this.fun--;
      if (type === "sleep") this.sleep++;
      if (type === "power") this.power--;
      this.render();

      // Game over conditions - check if any stat triggers death
      if (this.hunger >= 10) {
        console.log(`💀 DEATH TRIGGER: hunger >= 10 (${this.hunger})`);
        this.triggerGameOver("Starved to death! Why are you like this?...lmao");
      }
      if (this.fun <= 0) {
        console.log(`💀 DEATH TRIGGER: fun <= 0 (${this.fun})`);
        this.triggerGameOver("Life was meaningless without fun :(");
      }
      if (this.sleep >= 10) {
        console.log(`💀 DEATH TRIGGER: sleep >= 10 (${this.sleep})`);
        this.triggerGameOver("Burned my life-force out!");
      }
      if (this.power <= 0) {
        console.log(`💀 DEATH TRIGGER: power <= 0 (${this.power})`);
        this.triggerGameOver("I slacked on my training!");
      }
    }, interval);

    // Store the timer in the pet instance
    this[`${type}Timer`] = timer;
    return timer;
  }

  // 🛑 Stop all stat timers
  stopAllTimers() {
    clearInterval(this.hungerTimer);
    clearInterval(this.funTimer);
    clearInterval(this.sleepTimer);
    clearInterval(this.powerTimer);
    clearInterval(this.ageInterval);
  }

  // 🖥️ Update UI or log state (placeholder)
  render() {
    console.log(
      `🧾 ${this.name} | Age: ${this.age} | Hunger: ${this.hunger} | Fun: ${this.fun} | Sleep: ${this.sleep} |Power: ${this.power} |  Stage: ${this.stage}`,
    );

    // Update energy bars and values
    const hungerBar = document.getElementById("hungerBar");
    const hungerValue = document.getElementById("hungerValue");
    const funBar = document.getElementById("funBar");
    const funValue = document.getElementById("funValue");
    const sleepBar = document.getElementById("sleepBar");
    const sleepValue = document.getElementById("sleepValue");
    const powerBar = document.getElementById("powerBar");
    const powerValue = document.getElementById("powerValue");

    // Only update hunger and sleep if not in white stage and timers are running
    if (this.stage !== "white" && this.hungerTimer) {
      if (hungerBar) hungerBar.style.width = `${(this.hunger / 10) * 100}%`;
      if (hungerValue) hungerValue.textContent = this.hunger;
    }
    if (this.stage !== "white" && this.sleepTimer) {
      if (sleepBar) sleepBar.style.width = `${(this.sleep / 10) * 100}%`;
      if (sleepValue) sleepValue.textContent = this.sleep;
    }

    // Always update fun and power
    if (funBar) funBar.style.width = `${(this.fun / 10) * 100}%`;
    if (funValue) funValue.textContent = this.fun;
    if (powerBar) powerBar.style.width = `${(this.power / 10) * 100}%`;
    if (powerValue) powerValue.textContent = this.power;

    // Note: petChat message is set during evolution/game start, not in render()
    // to avoid overwriting special messages
  }
}

// END OF PET CLASS

function startGame() {
  return new Promise((resolve) => {
    const petName = window.petName || "Coco";
    myPet = new Pet(petName);

    // Start at blue stage
    currentStage = "blue";
    myPet.stage = "blue";
    myPet.evolutionLevel = 0;
    evolutionInProgress = false; // Initialize evolution flag

    loadAndDisplayFBX(
      animationConfig[currentStage].idle.file,
      animationConfig[currentStage].idle.pose,
    ).then(() => {
      // Apply bright lighting for all stages
      setWhiteStageLighting(true);

      // (white_gong.mp3 is now only played after train in white stage)
      resetButtonTracker();
      gameStarted = true;
      document.body.classList.add("game-started");

      // Initialize button states for evolution level
      updateButtonStatesForEvolution();

      document.querySelector(".infoBox").style.display = "flex";

      // Show blue stage chatMessage after pet appears
      if (stageMap[myPet.evolutionLevel]) {
        updatePetChat(
          stageMap[myPet.evolutionLevel].chatMessage ||
            `${stageEmojis[myPet.stage]} ${myPet.name}${
              stageMap[myPet.evolutionLevel].message
            }`,
        );
      }

      myPet.render();

      statTimers.hunger = myPet.createStatTimer(
        "hunger",
        gameSettings.baseDecayRate,
      );
      statTimers.fun = myPet.createStatTimer("fun", gameSettings.baseDecayRate);
      statTimers.sleep = myPet.createStatTimer(
        "sleep",
        gameSettings.baseDecayRate,
      );
      statTimers.power = myPet.createStatTimer(
        "power",
        gameSettings.baseDecayRate,
      );

      resolve(); // ✅ tell the overlay it’s safe to hide the egg
    });
  });
}
function resetGame() {
  console.log("resetGame() called");

  // ── A) Overlays: hide safely ────────────────────────────────────────────────
  document.body.classList.remove("game-over-active");
  document.body.classList.remove("game-started");

  const gameOverOverlay = document.getElementById("gameOverOverlay");
  const transcendenceOverlay = document.getElementById("transcendenceOverlay");
  const winOverlay = document.getElementById("winOverlay");

  [gameOverOverlay, transcendenceOverlay, winOverlay].forEach((el) => {
    if (!el) return;
    el.style.display = "none";
    el.classList.remove("show", "active", "visible");
    el.style.visibility = "hidden";
    el.style.opacity = "0";
    el.style.pointerEvents = "none";
  });

  // ── B) ⭐ Ensure the render target exists & is visible again ─────────────────
  const pc = restorePetContainer(); // <- your helper, exactly as you posted
  console.log("[reset] pet-container present:", !!pc);

  // If you added ensureRendererMounted() in main-test.js, re-attach the canvas
  try {
    if (typeof ensureRendererMounted === "function") {
      const mounted = ensureRendererMounted();
      console.log("[reset] renderer re-mounted to pet-container:", mounted);
    } else {
      // Fallback: if the canvas exists globally and isn't inside #pet-container, append it
      const canvas =
        document.querySelector("#pet-container canvas") ||
        window?.renderer?.domElement;
      if (canvas && !pc.contains(canvas)) {
        pc.appendChild(canvas);
        console.log("[reset] renderer canvas appended via fallback");
      }
    }
  } catch (e) {
    console.warn("[reset] ensureRendererMounted not available:", e);
  }

  // ── C) Stop/clear timers & timeouts ─────────────────────────────────────────
  try {
    clearInterval(statTimers.hunger);
    statTimers.hunger = null;
  } catch {}
  try {
    clearInterval(statTimers.fun);
    statTimers.fun = null;
  } catch {}
  try {
    clearInterval(statTimers.sleep);
    statTimers.sleep = null;
  } catch {}
  try {
    clearInterval(statTimers.power);
    statTimers.power = null;
  } catch {}
  try {
    clearInterval(myPet?.ageInterval);
    if (myPet) myPet.ageInterval = null;
  } catch {}

  try {
    clearTimeout(evolutionTimeout);
    evolutionTimeout = null;
  } catch {}
  try {
    clearTimeout(currentAnimationTimer);
    currentAnimationTimer = null;
  } catch {}
  try {
    if (gameOverTimeout) {
      clearTimeout(gameOverTimeout);
      gameOverTimeout = null;
    }
  } catch {}
  try {
    stopWhiteEmissionTimer && stopWhiteEmissionTimer();
  } catch {}
  try {
    clearTimeout(whiteStageTranscendenceTimeout);
    whiteStageTranscendenceTimeout = null;
  } catch {}
  try {
    myPet?.stopAllTimers?.();
  } catch {}

  // ── D) Remove previous 3D model & stop old animations ───────────────────────
  try {
    myPet?.mixer?.stopAllAction?.();
  } catch {}
  try {
    clearActiveModel && clearActiveModel();
  } catch {}

  // ── E) Reset core state ─────────────────────────────────────────────────────
  const petName = window.petName || "Coco";
  myPet = new Pet(petName);
  currentStage = "blue";
  myPet.stage = "blue";
  myPet.evolutionLevel = 0; // ← Ensure evolution level is reset to 0
  careCycles = 0;
  resetButtonTracker();
  gameOverTriggered = false;
  petIsDead = false; // Reset death flag so new game can load models
  actionInProgress = false;
  evolutionInProgress = false;
  danceSequenceIndex = 0;
  whiteStageAnimationCount = 0;
  gameStarted = false; // ← Game hasn't started yet, need to click START
  updateButtonStatesForEvolution();

  // Optional: clear custom styles on the Game Over overlay
  const reasonElement = document.getElementById("gameOverReason");
  if (reasonElement) {
    reasonElement.style.color = "";
    reasonElement.style.textAlign = "";
    reasonElement.style.fontSize = "";
    reasonElement.style.lineHeight = "";
  }
  if (gameOverOverlay) {
    gameOverOverlay.style.background = "";
    gameOverOverlay.style.border = "";
    gameOverOverlay.style.boxShadow = "";
  }

  // ── F) Show the glitch egg again (back to idle state) ───────────────────────
  const egg = document.getElementById("colorfulGlitchDiv");
  if (egg) {
    egg.style.display = "flex";
    egg.classList.remove("hatching");
    console.log("[reset] Glitch egg restored to idle state");
  }

  // ── G) Clear the 3D model (pet goes back into egg) ──────────────────────────
  try {
    clearActiveModel && clearActiveModel();
    console.log("[reset] 3D model cleared, pet back in egg");
  } catch (err) {
    console.error("❌ Failed to clear 3D model:", err);
  }

  // ── H) Reset UI energy bars and values ──────────────────────────────────────
  const hungerBar = document.getElementById("hungerBar");
  const hungerValue = document.getElementById("hungerValue");
  const funBar = document.getElementById("funBar");
  const funValue = document.getElementById("funValue");
  const sleepBar = document.getElementById("sleepBar");
  const sleepValue = document.getElementById("sleepValue");
  const powerBar = document.getElementById("powerBar");
  const powerValue = document.getElementById("powerValue");

  if (hungerBar) hungerBar.style.width = "0%";
  if (hungerValue) hungerValue.textContent = "0";
  if (funBar) funBar.style.width = "100%";
  if (funValue) funValue.textContent = "10";
  if (sleepBar) sleepBar.style.width = "0%";
  if (sleepValue) sleepValue.textContent = "0";
  if (powerBar) powerBar.style.width = "100%";
  if (powerValue) powerValue.textContent = "10";

  // Reset stat label opacity if it was changed in white stage
  const statLabels = document.querySelectorAll(".stat-label");
  statLabels.forEach((label) => (label.style.opacity = "1"));
  const statBars = document.querySelectorAll(".stat-bar");
  statBars.forEach((bar) => (bar.style.opacity = "1"));

  console.log("resetGame() complete - Click START to hatch the egg again.");
}

function stopWhiteEmissionTimer() {
  if (whiteEmissionTimer) {
    clearTimeout(whiteEmissionTimer);

    console.log("⏹️ White emission timer stopped");
  }
}

// ============ ✨ TRANSCENDENCE ENDING SYSTEM ============ \\
function triggerTranscendence() {
  console.log("🌟✨⚪ TRANSCENDENCE ACHIEVED - Pet has completed its journey!");

  // Fade out background music to 20% lower than current volume before transcendence
  const bgMusic = document.getElementById("bg-music");
  let fadeTarget = 0.01;
  if (bgMusic) {
    fadeTarget = Math.max(0, bgMusic.volume * 0.8);
  }
  fadeOutBgMusic(fadeTarget, 5000); // Fade to 20% lower than current volume over 5 seconds

  // Stop all game systems
  gameStarted = false;
  actionInProgress = true; // Block all further actions
  stopWhiteEmissionTimer();

  // Stop all stat timers
  if (myPet) {
    myPet.stopAllTimers();
  }
  clearInterval(statTimers.hunger);
  clearInterval(statTimers.fun);
  clearInterval(statTimers.sleep);
  clearInterval(statTimers.power);

  // Play space_engine.wav during transcendence
  const spaceEngineAudio = document.getElementById("space-engine");
  if (spaceEngineAudio) {
    spaceEngineAudio.muted = false;
    spaceEngineAudio.volume = 1.0;
    spaceEngineAudio.currentTime = 0;
    const playPromise = spaceEngineAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("🔊 space_engine.wav audio started successfully");
        })
        .catch((error) => {
          console.error("🔇 space_engine.wav audio play() blocked:", error);
        });
    }
  } else {
    console.warn("⚠️ space_engine.wav audio element not found");
  }

  // Trigger mystical transcendence effect with mandala glow
  // Mystical effect should disappear 3ms before beam ends (beam duration: 9000ms)
  const mysticalDuration = 1000 + 9000 - 3; // 1000ms initial mystical + 9000ms beam - 3ms
  triggerMysticalTranscendence(mysticalDuration);

  // Trigger intergalactic beam 1 second after transcendence
  setTimeout(() => {
    triggerIntergalacticBeam();
  }, 1000);

  // Show transcendence overlay immediately (if needed elsewhere)
  // showTranscendenceOverlay();
}

// Fade out background music volume smoothly
// ============ ⚪ WHITE STAGE TRANSCENDENCE WITH EVOLUTION EFFECTS ============ \\
function triggerWhiteStageTranscendence() {
  console.log(
    "⚪✨ WHITE STAGE TRANSCENDENCE - Using evolution glitch effects!",
  );

  // Stop all game systems
  gameStarted = false;
  actionInProgress = true; // Block all further actions
  stopWhiteEmissionTimer();

  // Stop all stat timers
  if (myPet) {
    myPet.stopAllTimers();
  }
  clearInterval(statTimers.hunger);
  clearInterval(statTimers.fun);
  clearInterval(statTimers.sleep);
  clearInterval(statTimers.power);

  // 🔊 Play evolution sound synchronized with effect
  playEvolutionSound();

  // Trigger mystical transcendence effect with DOUBLE DURATION (100% longer)
  triggerMysticalTranscendence(80000); // Extended from 16500 to 33000ms (100% longer)

  // Add intergalactic beam effect specifically for white pet transcendence
  setTimeout(() => {
    triggerIntergalacticBeam();
  }, 8000); // Start beam effect during peak transcendence

  // Transcendence overlay will be shown at the end of triggerIntergalacticBeam (9s duration)
}

// New function for the dramatic intergalactic beam effect
function triggerIntergalacticBeam() {
  console.log("🌌⚡ Triggering dramatic intergalactic beam of light!");

  // Create the beam element
  const beamElement = document.createElement("div");
  beamElement.className = "intergalactic-beam";

  // Position the beam to originate from the cat's position
  const catData = getCatMaskData();
  // Center the beam horizontally in the viewport
  beamElement.style.left = "50%";
  beamElement.style.top = "0px";
  beamElement.style.transform = "translate(-50%, 0)";
  beamElement.style.height = "100vh";

  // Add beam to document
  document.body.appendChild(beamElement);

  // Play transcend_3.wav and transcend_4.wav sound effects
  const transcendAudio3 = document.getElementById("transcend-3");
  if (transcendAudio3) {
    transcendAudio3.currentTime = 0;
    transcendAudio3.volume = 1.0;
    transcendAudio3.play().catch((err) => {
      console.log("🔇 transcend_3.wav audio play() blocked:", err);
    });
  } else {
    console.warn("⚠️ transcend_3.wav audio element not found");
  }
  const transcendAudio4 = document.getElementById("transcend-4");
  if (transcendAudio4) {
    transcendAudio4.currentTime = 0;
    transcendAudio4.volume = 1.0;
    transcendAudio4.play().catch((err) => {
      console.log("🔇 transcend_4.wav audio play() blocked:", err);
    });
    // Play woosh.mp3 immediately after transcend_4.wav ends
    transcendAudio4.onended = function () {
      const wooshAudio = document.getElementById("woosh");
      if (wooshAudio) {
        wooshAudio.currentTime = 0;
        wooshAudio.volume = 1.0;
        wooshAudio.play().catch((err) => {
          console.log("🔇 woosh.mp3 audio play() blocked:", err);
        });
      } else {
        console.warn("⚠️ woosh.mp3 audio element not found");
      }
    };
  } else {
    console.warn("⚠️ transcend_4.wav audio element not found");
  }

  // Fade out pet container over 2 seconds
  const petContainer = document.getElementById("pet-container");
  if (petContainer) {
    petContainer.style.transition = "opacity 6s";
    petContainer.style.opacity = "0";
  }

  // Remove beam and show overlay after animation completes
  setTimeout(() => {
    if (beamElement && beamElement.parentNode) {
      beamElement.parentNode.removeChild(beamElement);
    }
    console.log("🌌⚡ Intergalactic beam effect completed and removed");
    showWhiteTranscendenceOverlay();
  }, 9000); // Match beam animation duration
}

function showWhiteTranscendenceOverlay() {
  showTranscendenceOverlay();
}

// Enhanced animation transition with cat-shaped glitch stutter masking
async function playAnimationWithStutterMask(actionType, stage) {
  // Trigger glitch stutter effect ONCE at the start of each action
  triggerGlitchStutter(320);

  // Small delay to let stutter effect start
  await new Promise((resolve) => setTimeout(resolve, 20));

  // Play the actual animation and wait for the entire sequence to complete
  const result = await playActionThenShareIdle(actionType, stage);

  return result;
}

setupDropdownMenu(btn, menu, container);

// ============ 🐾 Set Model Pose event listeners=============== \ \
async function playDanceAction(stage) {
  return new Promise(async (resolve) => {
    // Determine which dance to play based on sequence index
    const danceVariants = ["dance", "dance2"];
    const selectedAction = danceVariants[danceSequenceIndex];

    // Check if the selected dance exists for this stage

    if (!animationConfig[stage] || !animationConfig[stage][selectedAction]) {
      console.log(
        `⚠️ ${selectedAction} animation not available for ${stage} stage`,
      );
      // Try the other dance if this one doesn't exist
      const fallbackAction = danceVariants[1 - danceSequenceIndex];
      if (animationConfig[stage] && animationConfig[stage][fallbackAction]) {
        // Mark fallback as completed if tracked
        if (buttonTracker.hasOwnProperty(fallbackAction)) {
          buttonTracker[fallbackAction] = true;
        }
        console.log(
          `🎬 Playing fallback dance: ${fallbackAction} for ${stage} stage`,
        );
        const anim = animationConfig[stage][fallbackAction];
        const baseDurationMs = await loadAndDisplayFBX(anim.file, anim.pose);

        // Both dance and dance2 loop 1 time
        const totalDurationMs = baseDurationMs * 1;
        console.log(
          `🔄 Dance animation will loop 1 time, total duration: ${totalDurationMs}ms`,
        );

        // Wait for loops to complete, then transition to idle
        setTimeout(() => {
          triggerGlitchStutter(60);
          setTimeout(() => {
            // Don't load idle if pet has died
            if (petIsDead) {
              resolve(fallbackAction);
              return;
            }
            const idleAnim = animationConfig[myPet.stage]["idleAfterDance"];
            if (idleAnim) {
              console.log(
                `🎬 Transitioning to idleAfterDance for ${myPet.stage} stage with glitch masking`,
              );
              loadAndDisplayFBX(idleAnim.file, idleAnim.pose).then(() => {
                resolve(fallbackAction);
              });
            } else {
              resolve(fallbackAction);
            }
          }, 25);
        }, totalDurationMs);
        return;
      }

      console.log(`⚠️ No dance animations available for ${stage} stage`);
      resolve("dance");
      return;
    }

    console.log(
      `🎬 Playing dance sequence ${
        danceSequenceIndex + 1
      }/2: ${selectedAction} for ${stage} stage`,
    );

    // Mark the correct dance as completed for evolution tracking
    if (buttonTracker.hasOwnProperty(selectedAction)) {
      buttonTracker[selectedAction] = true;
    }

    const anim = animationConfig[stage][selectedAction];
    let loopOptions = undefined;
    if (stage === "white" && actionType === "train") {
      loopOptions = { loop: false };
    }
    const baseDurationMs = await loadAndDisplayFBX(
      anim.file,
      anim.pose,
      loopOptions,
    );

    // Both dance and dance2 loop 1 time
    const totalDurationMs = baseDurationMs * 1;
    console.log(
      `🔄 ${selectedAction} will loop 1 time, total duration: ${totalDurationMs}ms`,
    );

    // Advance to next dance in sequence (0 -> 1 -> 0 -> 1...)
    danceSequenceIndex = (danceSequenceIndex + 1) % 2;

    // Wait for all loops to complete before transitioning to idle
    setTimeout(() => {
      // Trigger glitch stutter masking for idle transition
      triggerGlitchStutter(60);

      setTimeout(() => {
        // Don't load idle if pet has died
        if (petIsDead) {
          resolve(selectedAction);
          return;
        }
        const currentActiveStage = myPet.stage;
        const idleAnim = animationConfig[currentActiveStage]["idleAfterDance"];
        if (idleAnim) {
          console.log(
            `🎬 Transitioning to idleAfterDance for ${currentActiveStage} stage with glitch masking`,
          );
          loadAndDisplayFBX(idleAnim.file, idleAnim.pose).then(() => {
            resolve(selectedAction);
          });
        } else {
          resolve(selectedAction);
        }
      }, 25);
    }, totalDurationMs);
  });
}

async function playActionThenShareIdle(actionType, stage) {
  return new Promise(async (resolve) => {
    // Remove duplicate glitch trigger - it's already called in playAnimationWithStutterMask

    const variants = [`${actionType}`, `${actionType}2`];

    // Filter variants to only include those that exist for this stage
    const availableVariants = variants.filter(
      (variant) => animationConfig[stage] && animationConfig[stage][variant],
    );

    // If no variants available, skip this action
    if (availableVariants.length === 0) {
      console.log(
        `⚠️ No ${actionType} animations available for ${stage} stage`,
      );
      resolve(actionType); // Return the base action type
      return;
    }

    let selectedAction;
    if (actionType === "train") {
      const idx = trainIndices[stage] || 0;
      selectedAction = availableVariants[idx % availableVariants.length];
      trainIndices[stage] = (idx + 1) % availableVariants.length;
    } else if (actionType === "dance") {
      const idx = danceIndices[stage] || 0;
      selectedAction = availableVariants[idx % availableVariants.length];
      danceIndices[stage] = (idx + 1) % availableVariants.length;
    } else {
      selectedAction = availableVariants[0];
    }

    // Mark the correct train as completed for evolution tracking
    if (buttonTracker.hasOwnProperty(selectedAction)) {
      buttonTracker[selectedAction] = true;
    }
    const anim = animationConfig[stage][selectedAction];
    const baseDurationMs = await loadAndDisplayFBX(anim.file, anim.pose);
    if (stage === "yellow" && selectedAction === "train") {
      setTimeout(() => {
        let yellowKickAudio = document.getElementById("yellow-kick");
        if (!yellowKickAudio) {
          yellowKickAudio = document.createElement("audio");
          yellowKickAudio.id = "yellow-kick";
          yellowKickAudio.src = "music/yellow_kick.wav";
          yellowKickAudio.preload = "auto";
          document.body.appendChild(yellowKickAudio);
        }
        yellowKickAudio.pause();
        yellowKickAudio.currentTime = 0;
        yellowKickAudio.volume = 1;
        yellowKickAudio.play().catch((err) => {
          console.log("🔇 yellow_kick.wav audio play() blocked:", err);
        });
      }, 200); // 1 second = 1000 ms
    }
    if (stage === "yellow" && selectedAction === "train2") {
      setTimeout(() => {
        let yellowKickAudio = document.getElementById("yellow-kick");
        if (!yellowKickAudio) {
          yellowKickAudio = document.createElement("audio");
          yellowKickAudio.id = "yellow-kick";
          yellowKickAudio.src = "music/yellow_kick.wav";
          yellowKickAudio.preload = "auto";
          document.body.appendChild(yellowKickAudio);
        }
        yellowKickAudio.pause();
        yellowKickAudio.currentTime = 0;
        yellowKickAudio.volume = 1;
        yellowKickAudio.play().catch((err) => {
          console.log("🔇 yellow_kick.wav audio play() blocked:", err);
        });
      }, 1800); // <-- play at 1.8 seconds for train2

      // yellow_grunt.wav at 2300ms
      setTimeout(() => {
        let yellowGruntAudio = document.getElementById("yellow-grunt");
        if (!yellowGruntAudio) {
          yellowGruntAudio = document.createElement("audio");
          yellowGruntAudio.id = "yellow-grunt";
          yellowGruntAudio.src = "music/yellow_grunt.mp3";
          yellowGruntAudio.preload = "auto";
          document.body.appendChild(yellowGruntAudio);
        }
        yellowGruntAudio.pause();
        yellowGruntAudio.currentTime = 0;
        yellowGruntAudio.volume = 1.0;
        yellowGruntAudio.play().catch(() => {});
      }, 670);
    }
    if (stage === "green" && selectedAction === "train") {
      setTimeout(() => {
        let greenGruntAudio = document.getElementById("green-grunt");
        if (!greenGruntAudio) {
          greenGruntAudio = document.createElement("audio");
          greenGruntAudio.id = "green-grunt";
          greenGruntAudio.src = "music/green_grunt2.wav";
          greenGruntAudio.preload = "auto";
          document.body.appendChild(greenGruntAudio);
        }
        greenGruntAudio.pause();
        greenGruntAudio.currentTime = 0;
        greenGruntAudio.volume = 0.8;
        greenGruntAudio.play().catch((err) => {
          console.log("🔇 green_grunt2.wav audio play() blocked:", err);
        });
      }, 700); // Adjust the delay (in ms) as needed for timing
    }
    if (stage === "green" && selectedAction === "train2") {
      setTimeout(() => {
        let greenGruntAudio = document.getElementById("green-grunt");
        if (!greenGruntAudio) {
          greenGruntAudio = document.createElement("audio");
          greenGruntAudio.id = "green-grunt";
          greenGruntAudio.src = "music/green_grunt.wav";
          greenGruntAudio.preload = "auto";
          document.body.appendChild(greenGruntAudio);
        }
        greenGruntAudio.pause();
        greenGruntAudio.currentTime = 0;
        greenGruntAudio.volume = 1.0;
        greenGruntAudio.play().catch((err) => {
          console.log("🔇 green_grunt.wav audio play() blocked:", err);
        });
      }, 990); // Adjust the delay (in ms) as needed for timing
    }
    if (stage === "red" && selectedAction === "train") {
      setTimeout(() => {
        let redJumpAudio = document.getElementById("red-jump");
        if (!redJumpAudio) {
          redJumpAudio = document.createElement("audio");
          redJumpAudio.id = "red-jump";
          redJumpAudio.src = "music/red_jump.wav";
          redJumpAudio.preload = "auto";
          document.body.appendChild(redJumpAudio);
        }
        redJumpAudio.pause();
        redJumpAudio.currentTime = 0;
        redJumpAudio.volume = 1.0;
        redJumpAudio.play().catch((err) => {
          console.log("🔇 red_jump.wav audio play() blocked:", err);
        });
      }, 900); // Adjust the delay (in ms) as needed for timing

      // Second effect at 1600ms
      setTimeout(() => {
        let redLandAudio = document.getElementById("red-hit");
        if (!redLandAudio) {
          redLandAudio = document.createElement("audio");
          redLandAudio.id = "red-hit";
          redLandAudio.src = "music/red_jump.wav";
          redLandAudio.preload = "auto";
          document.body.appendChild(redLandAudio);
        }
        redLandAudio.pause();
        redLandAudio.currentTime = 0;
        redLandAudio.volume = 1.0;
        redLandAudio.play().catch((err) => {
          console.log("🔇 red_jump.wav audio play() blocked:", err);
        });
      }, 1600);

      setTimeout(() => {
        let redLandAudio = document.getElementById("red-hit-2");
        if (!redLandAudio) {
          redLandAudio = document.createElement("audio");
          redLandAudio.id = "red-hit-2";
          redLandAudio.src = "music/red_jump.wav";
          redLandAudio.preload = "auto";
          document.body.appendChild(redLandAudio);
        }
        redLandAudio.pause();
        redLandAudio.currentTime = 0;
        redLandAudio.volume = 1.0;
        redLandAudio.play().catch((err) => {
          console.log("🔇 red_jump.wav audio play() blocked:", err);
        });
      }, 1800);

      setTimeout(() => {
        let redLandAudio = document.getElementById("red-hit-3");
        if (!redLandAudio) {
          redLandAudio = document.createElement("audio");
          redLandAudio.id = "red-hit-3";
          redLandAudio.src = "music/red_grunt2.wav";
          redLandAudio.preload = "auto";
          document.body.appendChild(redLandAudio);
        }
        redLandAudio.pause();
        redLandAudio.currentTime = 0;
        redLandAudio.volume = 0.9;
        redLandAudio.play().catch((err) => {
          console.log("🔇 red_grunt2.wav audio play() blocked:", err);
        });
      }, 2100);
    }

    if (stage === "red" && selectedAction === "train2") {
      setTimeout(() => {
        let redJumpAudio = document.getElementById("red-jump");
        if (!redJumpAudio) {
          redJumpAudio = document.createElement("audio");
          redJumpAudio.id = "red-jump";
          redJumpAudio.src = "music/red_jump.wav";
          redJumpAudio.preload = "auto";
          document.body.appendChild(redJumpAudio);
        }
        redJumpAudio.pause();
        redJumpAudio.currentTime = 0;
        redJumpAudio.volume = 1.0;
        redJumpAudio.play().catch((err) => {
          console.log("🔇 red_jump.wav audio play() blocked:", err);
        });
      }, 800); // Adjust the delay (in ms) as needed for timing

      // Second effect at 1600ms
      setTimeout(() => {
        let redLandAudio = document.getElementById("red-hit");
        if (!redLandAudio) {
          redLandAudio = document.createElement("audio");
          redLandAudio.id = "red-hit";
          redLandAudio.src = "music/red_jump.wav";
          redLandAudio.preload = "auto";
          document.body.appendChild(redLandAudio);
        }
        redLandAudio.pause();
        redLandAudio.currentTime = 0;
        redLandAudio.volume = 1.0;
        redLandAudio.play().catch((err) => {
          console.log("🔇 red_jump.wav audio play() blocked:", err);
        });
      }, 1600);

      setTimeout(() => {
        let redLandAudio = document.getElementById("red-hit");
        if (!redLandAudio) {
          redLandAudio = document.createElement("audio");
          redLandAudio.id = "red-hit";
          redLandAudio.src = "music/red_jump.wav";
          redLandAudio.preload = "auto";
          document.body.appendChild(redLandAudio);
        }
        redLandAudio.pause();
        redLandAudio.currentTime = 0;
        redLandAudio.volume = 1.0;
        redLandAudio.play().catch((err) => {
          console.log("🔇 red_jump.wav audio play() blocked:", err);
        });
      }, 1700);

      setTimeout(() => {
        let redLandAudio = document.getElementById("red-hit-2");
        if (!redLandAudio) {
          redLandAudio = document.createElement("audio");
          redLandAudio.id = "red-hit-2";
          redLandAudio.src = "music/red_jump.wav";
          redLandAudio.preload = "auto";
          document.body.appendChild(redLandAudio);
        }
        redLandAudio.pause();
        redLandAudio.currentTime = 0;
        redLandAudio.volume = 1.0;
        redLandAudio.play().catch((err) => {
          console.log("🔇 red_jump.wav audio play() blocked:", err);
        });
      }, 1800);

      setTimeout(() => {
        let redLandAudio = document.getElementById("red-hit-3");
        if (!redLandAudio) {
          redLandAudio = document.createElement("audio");
          redLandAudio.id = "red-hit-3";
          redLandAudio.src = "music/red_grunt2.wav";
          redLandAudio.preload = "auto";
          document.body.appendChild(redLandAudio);
        }
        redLandAudio.pause();
        redLandAudio.currentTime = 0;
        redLandAudio.volume = 0.9;
        redLandAudio.play().catch((err) => {
          console.log("🔇 red_grunt2.wav audio play() blocked:", err);
        });
      }, 2100);

      setTimeout(() => {
        let redLandAudio = document.getElementById("red-hit-4");
        if (!redLandAudio) {
          redLandAudio = document.createElement("audio");
          redLandAudio.id = "red-hit-4";
          redLandAudio.src = "music/red_grunt3.wav";
          redLandAudio.preload = "auto";
          document.body.appendChild(redLandAudio);
        }
        redLandAudio.pause();
        redLandAudio.currentTime = 0;
        redLandAudio.volume = 0.9;
        redLandAudio.play().catch((err) => {
          console.log("🔇 red_grunt3.wav audio play() blocked:", err);
        });
      }, 2400);
    }
    // Play fighting_voice.wav at different times for train/train2 in blue stage
    if (stage === "blue") {
      if (selectedAction === "train") {
        setTimeout(() => {
          let audio = document.getElementById("fighting-voice");
          if (!audio) {
            audio = document.createElement("audio");
            audio.id = "fighting-voice";
            audio.src = "music/fighting_voice.wav";
            audio.preload = "auto";
            document.body.appendChild(audio);
          }
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 1;
          audio.playbackRate = 3.7;
          audio.play().catch((err) => {
            console.log("🔇 fighting_voice.wav audio play() blocked:", err);
          });
        }, 2700);
      } else if (selectedAction === "train2") {
        setTimeout(() => {
          let audio = document.getElementById("fighting-voice");
          if (!audio) {
            audio = document.createElement("audio");
            audio.id = "fighting-voice";
            audio.src = "music/fighting_voice.wav";
            audio.preload = "auto";
            document.body.appendChild(audio);
          }
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 1;
          audio.playbackRate = 1.5;
          audio.play().catch((err) => {
            console.log("🔇 fighting_voice.wav audio play() blocked:", err);
          });
        }, 3200);
      }
    }

    //🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄
    // Define loop counts for different actions
    let loopCount = 1; // Default to 1 loop
    if (actionType === "sleep") {
      loopCount = 2; // Sleep loops 1 time
    } else if (actionType === "feed") {
      loopCount = 2; // Feed/eat loops 1 time
    } else if (actionType === "dance" || selectedAction === "dance2") {
      loopCount = 1; // Both dance and dance2 loop 1 time
    } else if (actionType === "train") {
      loopCount = 1; // Train loops 1 time
    }

    // Calculate total duration based on loop count
    const totalDurationMs = baseDurationMs * loopCount;
    console.log(
      `🔄 Animation will loop ${loopCount} times, total duration: ${totalDurationMs}ms`,
    );

    let idleKey = "";

    if (["dance", "dance2"].includes(selectedAction)) {
      idleKey = "idleAfterDance";
    } else if (["train", "train2"].includes(selectedAction)) {
      idleKey = stage === "white" ? "idle" : "idleAfterTrain";
    } else if (["sleep"].includes(selectedAction)) {
      idleKey = "idleAfterSleep";
    } else if (["feed"].includes(selectedAction)) {
      idleKey = "idleAfterFeed";
    } else {
      idleKey = "idle";
    }

    // Wait for all loops to complete before transitioning to idle
    setTimeout(() => {
      // Trigger glitch stutter masking for idle transition
      triggerGlitchStutter(60); // Shorter duration for idle transition

      // Small delay to sync with action completion and let stutter effect start
      setTimeout(() => {
        // Don't load idle if pet has died
        if (petIsDead) {
          resolve(selectedAction);
          return;
        }
        // Use current stage (might have evolved since action started)
        const currentActiveStage = myPet.stage;
        const idleAnim = animationConfig[currentActiveStage][idleKey];
        if (idleAnim) {
          console.log(
            `🎬 Transitioning to ${idleKey} for ${currentActiveStage} stage (action was ${stage}) with glitch masking`,
          );
          loadAndDisplayFBX(idleAnim.file, idleAnim.pose).then(() => {
            // If this was train in white stage, trigger transcendence after 3s
            if (
              stage === "white" &&
              ["train", "train2"].includes(selectedAction)
            ) {
              // Play white_shift.mp3 3 seconds before transcendence
              let whiteShiftAudio = document.getElementById("white-shift");
              if (!whiteShiftAudio) {
                whiteShiftAudio = document.createElement("audio");
                whiteShiftAudio.id = "white-shift";
                whiteShiftAudio.src = "music/white_shift.mp3";
                whiteShiftAudio.preload = "auto";
                document.body.appendChild(whiteShiftAudio);
              }
              whiteShiftAudio.currentTime = 0;
              whiteShiftAudio.volume = 0.2;
              whiteShiftAudio.play().catch((err) => {
                console.log("🔇 white_shift.mp3 audio play() blocked:", err);
              });
              setTimeout(() => {
                triggerTranscendence();
              }, 3000);
            }
            resolve(selectedAction);
          });
        } else {
          resolve(selectedAction);
        }
      }, 25);
    }, totalDurationMs);
  });
}

// *================EVENT LISTENERS ===================* \\
// Note: overlayStartBtn is now handled by setupNameOverlay() module

if (startBtn) {
  startBtn.addEventListener("click", async () => {
    const egg = document.getElementById("colorfulGlitchDiv");
    if (egg) {
      // restart hatch animation
      egg.style.display = "flex";
      egg.classList.remove("hatching");
      void egg.offsetWidth; // reflow
      egg.classList.add("hatching");

      // hide after hatch
      const hide = () => {
        egg.style.display = "none";
        egg.classList.remove("hatching");
      };
      egg.addEventListener("animationend", hide, { once: true });
      setTimeout(hide, 1600);
    }

    await startGame(); // start game AFTER triggering hatch
  });
}
// Event delegation for overlay buttons
document.addEventListener("DOMContentLoaded", () => {
  // TRY AGAIN button
  const tryAgainBtn = document.getElementById("tryAgainBtn");
  if (tryAgainBtn) {
    console.log("TRY AGAIN button found, attaching listener");
    tryAgainBtn.addEventListener("click", () => {
      console.log("TRY AGAIN button clicked");
      const gameOverOverlay = document.getElementById("gameOverOverlay");
      if (gameOverOverlay) gameOverOverlay.style.display = "none";
      resetGame();
    });
  } else {
    console.warn("TRY AGAIN button NOT found");
  }

  // PLAY AGAIN button
  const playAgainBtn = document.getElementById("playAgainBtn");
  if (playAgainBtn) {
    console.log("PLAY AGAIN button found, attaching listener");
    playAgainBtn.addEventListener("click", () => {
      console.log("PLAY AGAIN button clicked");
      const transcendenceOverlay = document.getElementById(
        "transcendenceOverlay",
      );
      if (transcendenceOverlay) transcendenceOverlay.style.display = "none";
      resetGame();
    });
  } else {
    console.warn("PLAY AGAIN button NOT found");
  }
});

document.addEventListener("click", (e) => {
  const id = e.target?.id;
  if (id === "tryAgainBtn" || id === "playAgainBtn") {
    e.preventDefault();
    e.stopPropagation();
    console.log(`[buttons] ${id} clicked`);
    resetGame();
  }
});

// === Wire buttons AFTER the DOM exists ===
window.addEventListener("DOMContentLoaded", () => {
  // Setup name overlay interactions
  setupNameOverlay();

  const startBtn = document.querySelector(".StartButton"); // START
  const egg = document.getElementById("colorfulGlitchDiv");

  // 3) START: hatch the egg, then start the game
  if (startBtn) {
    startBtn.addEventListener("click", async () => {
      // Show hatching message immediately
      const petName = window.petName || "Coco";
      updatePetChat(`${petName} is just hatching!`);

      // Play egg hatch sound
      const eggHatchAudio = document.getElementById("egg-hatch");
      if (eggHatchAudio) {
        eggHatchAudio.playbackRate = 3;
        eggHatchAudio.currentTime = 0;
        eggHatchAudio.volume = 1;
        eggHatchAudio.play().catch((err) => {
          console.log("🔇 egg_hatch.wav audio play() blocked:", err);
        });
      }
      if (egg) {
        egg.style.display = "flex";
        egg.classList.remove("hatching");
        void egg.offsetWidth; // force reflow
        egg.classList.add("hatching");

        const hide = () => {
          egg.style.display = "none";
          egg.classList.remove("hatching");
        };
        egg.addEventListener("animationend", hide, { once: true });
        setTimeout(hide, 1600);
      }

      await startGame();
    });
  }

  // 3) RESET: reset the entire game state and timers
  const resetBtn = document.querySelector(".ResetButton");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      console.log("🔄 RESET button clicked");
      resetGame();
    });
  }
});

// Safety fallback for window functions
window.startWhiteEmissionTimer = window.startWhiteEmissionTimer || (() => null);

// ============================================================
// 1. IMPORTS
// ============================================================
import { Pet } from "@core/Pet.js";
import { initUI } from "@ui/ui.js";
import {
  loadAndDisplayFBX,
  clearActiveModel,
  setWhiteStageLighting,
} from "@/animRender.js";
import animationConfig from "@/animationConfig.js";
import { gameSettings, stageMap, stageEmojis } from "@core/config.js";
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
import { renderPetStats } from "@ui/petStats.js";

// ============================================================
// 2. CONSTANTS  (pure config — no DOM refs, no runtime state)
// ============================================================
const actionConfigs = {
  feed: {
    action: () => myPet.feed(),
    animation: (stage) => playActionThenShareIdle("feed", stage),
    message: () =>
      "🍽️ This is so good, it's actually making me angry. How dare you set the bar this high? hit the spot! ",
    available: (stage) => !!animationConfig[stage]?.feed,
  },
  dance: {
    action: () => myPet.dance(),
    animation: (stage) => playDanceAction(stage),
    message: () => " I gets BUZY! Pawz on fire!",
    available: () => true,
  },
  sleep: {
    action: () => myPet.sleepRest(),
    animation: (stage) => playActionThenShareIdle("sleep", stage),
    message: () => "😴 Got tickets to the blanket show...zzz",
    available: (stage) => !!animationConfig[stage]?.sleep,
  },
  train: {
    action: () => myPet.train(),
    animation: (stage) => playActionThenShareIdle("train", stage),
    message: () =>
      "🐉 The purpose of today's training is to defeat yesterday's understanding.",
    available: () => true,
  },
};

// ============================================================
// 3. DOM REFERENCES  (declared here, assigned in INIT below)
// ============================================================
// These can't be assigned until the DOM exists, so they start
// as null and get filled inside the DOMContentLoaded block.
let feedButton, danceButton, sleepButton, trainButton;
let hungerTimer, funTimer, sleepTimer, powerTimer;
let btn, menu, container;

function handleCareAction(actionName) {
  return async function () {
    const config = actionConfigs[actionName];
    if (!config) return;

    // Prevent actions before game starts (before egg hatches)
    if (!gameStarted) {
      console.log(`⚠️ Game hasn't started yet - egg must hatch first!`);
      return;
    }

    const button = {
      feed: feedButton,
      dance: danceButton,
      sleep: sleepButton,
      train: trainButton,
    }[actionName];
    if (actionInProgress || gameOverTriggered || button?.disabled) return;
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

// ============================================================
// 4. STATE
// ============================================================
let currentStage;
let myPet;
let gameStarted = false;
let currentAnimationTimer = null;
let actionInProgress = false;
let careCycles = 0;
let gameOverTriggered = false;
let gameOverTimeout = null;
let whiteEmissionTimer = null;
let petIsDead = false;

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

let whiteStageAnimationCount = 0;
let whiteStageCareActions = { dance: false, train: false };
let whiteStageTranscendenceTimeout = null;
let danceSequenceIndex = 0;

const danceIndices = { blue: 0, yellow: 0, green: 0, red: 0, white: 0 };
const trainIndices = { blue: 0, yellow: 0, green: 0, red: 0, white: 0 };
let statTimers = { hunger: null, fun: null, sleep: null, power: null };

// ============================================================
// 5. FUNCTIONS
// ============================================================
function showTranscendenceWithName() {
  const nameEl = document.getElementById("transcendencePetName");
  if (nameEl) nameEl.textContent = myPet?.name ?? "";
  showTranscendenceOverlay();
}

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
            showTranscendenceWithName();
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
function makePetCallbacks() {
  return {
    onStageChange: (newStage) => {
      currentStage = newStage;
    },
    onStatsChange: () => renderPetStats(myPet),
    onGameOver: async (reason, stage) => {
      gameOverTriggered = true;
      petIsDead = true;
      gameStarted = false;

      if (gameOverTimeout) {
        clearTimeout(gameOverTimeout);
        gameOverTimeout = null;
      }

      const nameEl = document.getElementById("gameOverPetName");
      if (nameEl) nameEl.textContent = myPet.name;

      const deathAnim = animationConfig[stage]?.death;
      if (deathAnim) {
        console.log(`🎬 Playing death animation for ${stage} stage...`);
        const deathDuration = await loadAndDisplayFBX(
          deathAnim.file,
          deathAnim.pose,
          { loop: false },
        );
        gameOverTimeout = setTimeout(
          () => {
            showGameOverOverlay(reason);
            gameOverTimeout = null;
          },
          (deathDuration || 0) + 500,
        );
      } else {
        showGameOverOverlay(reason);
      }
    },
  };
}

function startGame() {
  return new Promise((resolve) => {
    const petName = window.petName || "Coco";
    myPet = new Pet(petName, makePetCallbacks());

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

      renderPetStats(myPet);

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

  // If you added ensureRendererMounted() in animRender.js, re-attach the canvas
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
  myPet = new Pet(petName, makePetCallbacks());
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
  const gameOverNameEl = document.getElementById("gameOverPetName");
  if (gameOverNameEl) gameOverNameEl.textContent = "";
  const transcendenceNameEl = document.getElementById("transcendencePetName");
  if (transcendenceNameEl) transcendenceNameEl.textContent = "";
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

// New function for the dramatic intergalactic beam effect
function triggerIntergalacticBeam() {
  console.log("🌌⚡ Triggering dramatic intergalactic beam of light!");

  // Create the beam element
  const beamElement = document.createElement("div");
  beamElement.className = "intergalactic-beam";

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
    showTranscendenceWithName();
  }, 9000); // Match beam animation duration
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

function playSound(id, src, delayMs, { volume = 1, playbackRate = 1 } = {}) {
  setTimeout(() => {
    let audio = document.getElementById(id);
    if (!audio) {
      audio = document.createElement("audio");
      audio.id = id;
      audio.src = src;
      audio.preload = "auto";
      document.body.appendChild(audio);
    }
    audio.pause();
    audio.currentTime = 0;
    audio.volume = volume;
    audio.playbackRate = playbackRate;
    audio.play().catch(() => {});
  }, delayMs);
}

const trainSoundCues = {
  "yellow:train": [
    {
      id: "yellow-kick",
      src: "music/yellow_kick.wav",
      delay: 200,
      volume: 1.0,
    },
  ],
  "yellow:train2": [
    {
      id: "yellow-kick",
      src: "music/yellow_kick.wav",
      delay: 1800,
      volume: 1.0,
    },
    {
      id: "yellow-grunt",
      src: "music/yellow_grunt.mp3",
      delay: 670,
      volume: 1.0,
    },
  ],
  "green:train": [
    {
      id: "green-grunt",
      src: "music/green_grunt2.wav",
      delay: 700,
      volume: 0.8,
    },
  ],
  "green:train2": [
    {
      id: "green-grunt",
      src: "music/green_grunt.wav",
      delay: 990,
      volume: 1.0,
    },
  ],
  "red:train": [
    { id: "red-jump", src: "music/red_jump.wav", delay: 900, volume: 1.0 },
    { id: "red-hit", src: "music/red_jump.wav", delay: 1600, volume: 1.0 },
    { id: "red-hit-2", src: "music/red_jump.wav", delay: 1800, volume: 1.0 },
    { id: "red-hit-3", src: "music/red_grunt2.wav", delay: 2100, volume: 0.9 },
  ],
  "red:train2": [
    { id: "red-jump", src: "music/red_jump.wav", delay: 800, volume: 1.0 },
    { id: "red-hit", src: "music/red_jump.wav", delay: 1600, volume: 1.0 },
    { id: "red-hit", src: "music/red_jump.wav", delay: 1700, volume: 1.0 },
    { id: "red-hit-2", src: "music/red_jump.wav", delay: 1800, volume: 1.0 },
    { id: "red-hit-3", src: "music/red_grunt2.wav", delay: 2100, volume: 0.9 },
    { id: "red-hit-4", src: "music/red_grunt3.wav", delay: 2400, volume: 0.9 },
  ],
  "blue:train": [
    {
      id: "fighting-voice",
      src: "music/fighting_voice.wav",
      delay: 2700,
      volume: 1.0,
      playbackRate: 3.7,
    },
  ],
  "blue:train2": [
    {
      id: "fighting-voice",
      src: "music/fighting_voice.wav",
      delay: 3200,
      volume: 1.0,
      playbackRate: 1.5,
    },
  ],
};

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
    for (const c of trainSoundCues[`${stage}:${selectedAction}`] ?? []) {
      playSound(c.id, c.src, c.delay, {
        volume: c.volume,
        playbackRate: c.playbackRate,
      });
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

// ============================================================
// 6. INIT  (runs once when the HTML is fully loaded)
// ============================================================
window.addEventListener("DOMContentLoaded", () => {
  // --- Assign DOM references ---
  // initUI() finds all the buttons and containers in the HTML.
  // It only runs here, after the DOM exists.
  ({
    hungerTimer,
    funTimer,
    sleepTimer,
    powerTimer,
    btn,
    menu,
    container,
    feedButton,
    danceButton,
    sleepButton,
    trainButton,
  } = initUI());

  // --- One-time setup ---
  const bgMusic = document.getElementById("bg-music");
  if (bgMusic) bgMusic.volume = 0.15;
  initEffectElements();
  setupDropdownMenu(btn, menu, container);
  setupNameOverlay();

  // --- Wire care action buttons ---
  // Now that we have the DOM refs, attach a click handler to each button.
  const buttonMap = {
    feed: feedButton,
    dance: danceButton,
    sleep: sleepButton,
    train: trainButton,
  };
  Object.keys(actionConfigs).forEach((action) => {
    const button = buttonMap[action];
    if (button) button.addEventListener("click", handleCareAction(action));
  });

  // --- START button ---
  const startBtn = document.querySelector(".StartButton");
  const egg = document.getElementById("colorfulGlitchDiv");
  if (startBtn) {
    startBtn.addEventListener("click", async () => {
      const petName = window.petName || "Coco";
      updatePetChat(`${petName} is just hatching!`);

      const eggHatchAudio = document.getElementById("egg-hatch");
      if (eggHatchAudio) {
        eggHatchAudio.playbackRate = 3;
        eggHatchAudio.currentTime = 0;
        eggHatchAudio.volume = 1;
        eggHatchAudio.play().catch(() => {});
      }
      if (egg) {
        egg.style.display = "flex";
        egg.classList.remove("hatching");
        void egg.offsetWidth;
        egg.classList.add("hatching");
        const hide = () => {
          egg.style.display = "none";
          egg.classList.remove("hatching");
        };
        egg.addEventListener("animationend", hide, { once: true });
        setTimeout(hide, 1600);
      }

      const resetBtn = document.querySelector(".ResetButton");
      if (resetBtn) {
        resetBtn.style.pointerEvents = "none";
        setTimeout(() => {
          resetBtn.style.pointerEvents = "";
        }, 900);
      }

      await startGame();
    });
  }

  // --- RESET button ---
  const resetBtn = document.querySelector(".ResetButton");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => resetGame());
  }

  // --- TRY AGAIN button (game over overlay) ---
  const tryAgainBtn = document.getElementById("tryAgainBtn");
  if (tryAgainBtn) {
    tryAgainBtn.addEventListener("click", () => {
      document.getElementById("gameOverOverlay").style.display = "none";
      resetGame();
    });
  }

  // --- PLAY AGAIN button (transcendence overlay) ---
  const playAgainBtn = document.getElementById("playAgainBtn");
  if (playAgainBtn) {
    playAgainBtn.addEventListener("click", () => {
      document.getElementById("transcendenceOverlay").style.display = "none";
      resetGame();
    });
  }
});

// Safety shim — startWhiteEmissionTimer is injected by the white-stage effect
window.startWhiteEmissionTimer = window.startWhiteEmissionTimer || (() => null);
window.addEventListener("unhandledrejection", (e) => {
  console.error("[UNHANDLED PROMISE]", e.reason);
});

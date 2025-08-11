import { loadAndDisplayFBX, getCatMaskData } from "./main-test.js";
import animationConfig from "./annimationConfig.js";
import { mul } from "three/tsl";

console.log("⚡️⚡️⚡️⚡️ ¡ ENGAGED ! ⚡️⚡️⚡️⚡️");

// ⚠️ BALANCED EVOLUTION AND SURVIVAL SYSTEM ⚠️
// - Game over triggers when: hunger ≥ 10, fun ≤ 0, sleep ≥ 10, power >= 0
// - Evolution: Press all 3 buttons → wait 5 seconds → evolve
// - Stat decay: Base 7s, Fast 2s (gives time for evolution)
// - Balance: Manage stats while working toward evolution!

// *-------------------------METHODS ----------------*  \\
//   - Inside petClss (what pet can do)
//   - Only availabe after you do myPet= new Pet("name")

// +-------------------------+
// |       Pet Class         |   ← 🐾 Controls PET behavior and state
// +-------------------------+
// | - name                 |
// | - age                  |   ← Tracks stats
// | - hunger               |
// | - fun                  |
// | - sleep
// | - power       |
// | - evolutionStage       |
// +-------------------------+
// | 🧠 Methods:              |
// |  • feed()              | ← Pet eats
// |  • dance()             | ← Pet has fun
// |  • sleep()             | ← Pet rests
// |  • render()            | ← Updates UI
// |  • createStatTimer()   | ← Starts stat decay
// |  • stopAllTimers()     | ← Stops stat decay
// |  • triggerGameOver()   | ← Ends the game
// |  • evolveToNextStage() | ← Evolves pet
// +-------------------------+
// *---------------------FUNCTIONS-----------------------* \\
//  Run indipendentally from Pet Class(outside petClass). Affect game logic or interface globally------- *
// +------------------------------+
// |     Global Functions         |   ← 🎮 Controls GAME
// +------------------------------+
// |  • startGame()              | ← Sets up new pet and timers
// |  • resetGame()              | ← Clears everything and restarts
// |  • updatePetVisual(stage)   | ← Changes how pet looks
// |  • updateTimers()           | ← Updates hunger/fun/sleep on screen
// |  • Event Listeners          | ← Detects clicks (feed, dance, sleep)
// |  • setInterval (age ticker) | ← Tracks cosmetic age
// +------------------------------+

/*-------------- Constants -------------*/
// DEATH MAP TESTS
// const deathTestMap = {
//   "1": "blue",
//   "2": "yellow",
//   "3": "green",
//   "4": "red",
//   "5": "white",

// }

const gameSettings = {
  ageInterval: 20000,
  baseDecayRate: 14000,
  fastDecayRate: 7000,
};
const stageMap = {
  0: {
    stage: "blue",
    message: " I've evolved into Blue Form! So, this is life!",
  },
  1: {
    stage: "yellow",
    message: " Yellow form! The wise grow joy under their feet!",
  },
  2: { stage: "green", message: "Green form! Growing stronger!" },
  3: {
    stage: "red",
    message: " 🔥 Red form! FURY and POWER surge through me!",
  },
  4: {
    stage: "white",
    message: "⚪ I have transcended to White Form! Ready for the beyond...",
  },
};
const stageEmojis = {
  blue: "🔵",
  yellow: "🟡",
  green: "🟢",
  red: "🔴",
  white: "⚪",
};
const timerMap = {
  feed: "hunger",
  dance: "fun",
  sleep: "sleep",
  train: "power",
};
const STAT_TYPES = ["hunger", "fun", "sleep", "power"];

// ===============ANIMATION MAPS ====================\\

const danceMap = {
  blue: ["dance", "dance2"],
  yellow: ["dance", "dance2"],
  green: ["dance", "dance2", "dance3"],
  red: ["dance", "dance2", "dance3"],
  white: ["dance", "dance2", "dance3", "dance4"],
};
const trainMap = {
  blue: ["train", "train2"],
  yellow: ["train", "train2"],
  green: ["train", "train2"],
  red: ["train", "train2", "train3"],
  white: ["train", "train2", "train3", "train4"],
};

// ==========KEEPS TRACK OF EACH MOVE YOUR ON FOR EACH STAGE======= \\
const danceIndices = {
  blue: 0,
  yellow: 0,
  green: 0,
  red: 0,
  white: 0,
};
const trainIndices = {
  blue: 0,
  yellow: 0,
  green: 0,
  red: 0,
  white: 0,
};

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

// 🔊 Play Evolution Sound Effect
function playEvolutionSound() {
  const evolutionAudio = document.getElementById("evolution-sound");
  if (evolutionAudio) {
    evolutionAudio.volume = 1.0; // Set volume (0.0 = silent, 1.0 = full volume)
    evolutionAudio.currentTime = 0; // Reset to beginning
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

function allCareActionsCompleted() {
  // White stage transcendence - evolve after 2 care animations
  if (myPet && myPet.stage === "white") {
    const whiteEvolutionReady = whiteStageAnimationCount >= 2;
    console.log(
      `⚪ White stage evolution check - Animation count: ${whiteStageAnimationCount}/2, Evolution ready: ${whiteEvolutionReady}`
    );
    return whiteEvolutionReady;
  }

  // Require all care actions for evolution: dance, dance2, train, train2
  const completed =
    buttonTracker.dance &&
    buttonTracker.dance2 &&
    buttonTracker.train &&
    buttonTracker.train2;
  console.log(
    `🔍 Evolution requirements - Dance: ${buttonTracker.dance}, Dance2: ${buttonTracker.dance2}, Train: ${buttonTracker.train}, Train2: ${buttonTracker.train2}`,
    `Evolution ready: ${completed}`
  );
  return completed;
}

function resetButtonTracker() {
  console.log(
    `🔄 RESETTING button tracker - Previous state:`,
    JSON.parse(JSON.stringify(buttonTracker))
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
    `Dance sequence reset to: ${danceSequenceIndex}`
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

    // Grey out hunger and sleep timer displays and show 'Stopped'
    if (hungerTimer) {
      hungerTimer.style.opacity = "0.3";
      hungerTimer.style.color;
      hungerTimer.textContent = "G0DM0DE";
    }
    if (sleepTimer) {
      sleepTimer.style.opacity = "0.3";
      sleepTimer.textContent = "G0DM0DE";
    }

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
      "⚪ White evolution reached - Feed and Sleep buttons disabled, dance/train disabled after both pressed, hunger/sleep timers greyed"
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
    buttonTracker
  );

  if (allCareActionsCompleted()) {
    careCycles++;

    console.log(
      `✅ Care cycle complete! (${careCycles} total) - Current evolution level: ${myPet.evolutionLevel}`
    );

    // Only evolve if not at max level (4 = white)
    if (careCycles >= 1 && myPet.evolutionLevel < 4) {
      evolutionInProgress = true; // Block further evolution checks
      console.log(
        `⚡️⚡️⚡️ All care actions complete. Evolving from ${myPet.stage} (level ${myPet.evolutionLevel}) in 1 second after idle...`
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
            `🔄 Evolution completed: ${oldStage} → ${myPet.stage} (currentStage: ${currentStage})`
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
              animationConfig[currentStage].idle.pose
            ).then(() => {
              console.log(
                `🎬 Evolution idle animation loaded for ${currentStage} stage with masking`
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
          console.log(
            `🔄 Post-evolution reset: careCycles=${careCycles}, buttonTracker reset for next evolution cycle`
          );
        }, 1000); // Wait 1 second for magical effect to build up
      }, 3000); // 3 seconds after pet is idle
    } else if (myPet.evolutionLevel >= 4) {
      // White stage transcendence handling
      if (myPet.stage === "white" && whiteStageAnimationCount >= 2) {
        console.log(
          `⚪✨ White stage transcendence ready! Animation count: ${whiteStageAnimationCount}/2`
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
          "⚪ White stage transcendence will trigger mystical and beam in 5 seconds..."
        );
        whiteStageAnimationCount = 0;
        resetButtonTracker();
      } else {
        console.log(
          `⚪ ${myPet.name} has reached white evolution! Waiting for 2 care animations (${whiteStageAnimationCount}/2)`
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
const gameOverOverlay = document.getElementById("gameOverOverlay");
const reasonElement = document.getElementById("gameOverReason");
const petChat = document.querySelector(".infoBox_petChat");
const hungerTimer = document.getElementById("hungerTimer");
const funTimer = document.getElementById("funTimer");
const sleepTimer = document.getElementById("sleepTimer");
const powerTimer = document.getElementById("powerTimer");
const overlayTexts = document.querySelectorAll(
  ".overlay-content h2, .overlay-content p"
);
const overlay = document.getElementById("pageOverlay");
const overlayStartBtn = document.getElementById("overlayStartButton");
const regularStartBtn = document.querySelector(
  ".startButtonContainer .StartButton"
);
const resetBtn = document.querySelector(".ResetButton");
const buttons = document.querySelectorAll(".Buttons");
const feedButton = buttons[0];
const danceButton = buttons[1];
const sleepButton = buttons[2];
const trainButton = buttons[3];
const btn = document.getElementById("infoDropdownBtn");
const menu = document.getElementById("infoDropdownMenu");
const container = document.querySelector(".dropdown-container");
const feedIndicator = document.querySelector("#hungerTimer");
const danceIndicator = document.querySelector("#funTimer");
const sleepIndicator = document.querySelector("#sleepTimer");
const powerIndicator = document.querySelector("#powerTimer");
const glitchStutterOverlay = document.getElementById("glitchStutterOverlay");
const glitchStutterOverlay2 = document.getElementById("glitchStutterOverlay2");
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
      `🔄 Evolution attempt: Current level ${this.evolutionLevel} (${this.stage})`
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
        `🌟 ${this.name} evolved from ${oldStage} (Level ${oldLevel}) to ${this.stage} (Level ${this.evolutionLevel})!`
      );
      console.log(
        `📊 Evolution progression: blue(0) → yellow(1) → green(2) → red(3) → white(4)`
      );

      this.age += 5;
      console.log(`🐱 ${this.name} has aged to ${this.age} years old`);
      this.render();
    } else {
      console.log(
        `✨ ${this.name} has reached the final form: ${this.stage} (Level ${this.evolutionLevel})! No further evolution possible.`
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
  async triggerGameOver(reason) {
    console.log(`💀 GAME OVER: ${reason}`); // Prevent multiple triggers
    gameOverTriggered = true;

    console.log(`💀 GAME OVER: ${reason}`);

    // Stop stat decay timers first
    this.stopAllTimers();
    gameStarted = false;

    // LOAD DEATH ANIMATION AND WAIT FOR IT TO COMPLETE
    const deathAnim = animationConfig[currentStage]?.death;
    if (deathAnim) {
      console.log(`🎬 Playing death animation for ${currentStage} stage...`);

      // For death animations, we need to load with loop = false to prevent infinite looping
      const deathDuration = await loadAndDisplayFBX(
        deathAnim.file,
        deathAnim.pose,
        { loop: false }
      );

      // Death animation plays exactly ONE LOOP only, then stops + 0.5s delay
      const singleLoopDuration = deathDuration; // No multiplier - just one loop
      const totalDeathDuration = singleLoopDuration + 500; // Add 0.5s delay after animation stops
      console.log(
        `⏱️ Death animation: 1 loop (${singleLoopDuration}ms) → stops → 0.5s delay → overlay (${totalDeathDuration}ms total)`
      );

      setTimeout(() => {
        // Show game over overlay AFTER single death animation loop + 0.5s delay
        gameOverOverlay.style.display = "flex";
        reasonElement.textContent = `${reason}`;
        console.log(
          `💀 Game over overlay shown after single death animation loop + 0.5s delay`
        );
      }, totalDeathDuration);
    } else {
      // No death animation available, show overlay immediately
      gameOverOverlay.style.display = "flex";
      reasonElement.textContent = `${reason}`;
    }

    this.render(); // UPDATE FINAL STAT DISPLAY
  }

  // ⏳ Stat decay
  createStatTimer(type, interval = 7000) {
    const timer = setInterval(() => {
      if (type === "hunger") this.hunger++;
      if (type === "fun") this.fun--;
      if (type === "sleep") this.sleep++;
      if (type === "power") this.power--;
      this.render();

      // Game over conditions
      if (this.hunger >= 10)
        this.triggerGameOver(
          "Starved to death! Why are you likes this?...lmao"
        );
      if (this.fun <= 0)
        this.triggerGameOver("Life was meaningless without fun :(");
      if (this.sleep >= 10) this.triggerGameOver("Burned my life-force out!");
      if (this.power <= 0) this.triggerGameOver("I slacked on my training!");
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
      `🧾 ${this.name} | Age: ${this.age} | Hunger: ${this.hunger} | Fun: ${this.fun} | Sleep: ${this.sleep} |Power: ${this.power} |  Stage: ${this.stage}`
    );

    // Only update hunger and sleep timer displays if not in white stage and timers are running
    if (this.stage !== "white" && hungerTimer && this.hungerTimer) {
      hungerTimer.textContent = `Hunger: ${this.hunger}`;
    }
    if (this.stage !== "white" && sleepTimer && this.sleepTimer) {
      sleepTimer.textContent = `Sleep: ${this.sleep}`;
    }
    // Always update fun and power
    if (funTimer) {
      funTimer.textContent = `Fun: ${this.fun}`;
    }
    if (powerTimer) {
      powerTimer.textContent = `Power: ${this.power}`;
    }

    petChat.textContent = `${stageEmojis[this.stage]} ${
      this.name
    } is evolving...`;
  }
}

// END OF PET CLASS

// ✅ Then define this after the class ends
function hideGlitchEgg() {
  const glitchDiv = document.getElementById("colorfulGlitchDiv");
  if (glitchDiv) {
    glitchDiv.classList.add("hatching");
    setTimeout(() => {
      glitchDiv.style.display = "none";
    }, 1500);
  }
}

function startGame() {
  return new Promise((resolve) => {
    myPet = new Pet("Coco");

    // TEMPORARY BYPASS to WHITE EVOLUTION

    currentStage = "blue";
    myPet.stage = "blue"; // uncomment to start at white
    evolutionInProgress = false; // Initialize evolution flag

    loadAndDisplayFBX(
      animationConfig[currentStage].idle.file,
      animationConfig[currentStage].idle.pose
    ).then(() => {
      resetButtonTracker();
      gameStarted = true;

      // Initialize button states for evolution level
      updateButtonStatesForEvolution();

      document.querySelector(".infoBox").style.display = "flex";

      myPet.render();

      statTimers.hunger = myPet.createStatTimer(
        "hunger",
        gameSettings.baseDecayRate
      );
      statTimers.fun = myPet.createStatTimer("fun", gameSettings.baseDecayRate);
      statTimers.sleep = myPet.createStatTimer(
        "sleep",
        gameSettings.baseDecayRate
      );
      statTimers.power = myPet.createStatTimer(
        "power",
        gameSettings.baseDecayRate
      );

      resolve(); // ✅ tell the overlay it’s safe to hide the egg
    });
  });
}

function resetGame() {
  // 1. Clear all timers
  clearInterval(statTimers.hunger);
  clearInterval(statTimers.fun);
  clearInterval(statTimers.sleep);
  clearInterval(statTimers.power);
  clearInterval(myPet.ageInterval);
  stopWhiteEmissionTimer(); // Stop white emission timer

  // Clear evolution timeout (handles both regular evolution and white transcendence)
  if (evolutionTimeout) {
    clearTimeout(evolutionTimeout);
    evolutionTimeout = null;
  }

  // 2. Reset state variables
  myPet = new Pet("Coco");
  currentStage = "blue";
  careCycles = 0;
  resetButtonTracker();
  gameOverTriggered = false;
  actionInProgress = false;
  evolutionInProgress = false; // Reset evolution flag
  danceSequenceIndex = 0; // Reset dance sequence
  whiteStageAnimationCount = 0; // Reset white stage animation counter  // Reset button states to initial (all enabled)
  updateButtonStatesForEvolution();

  // 3. Hide overlays
  const gameOverOverlay = document.getElementById("gameOverOverlay");
  const winOverlay = document.getElementById("winOverlay");
  if (gameOverOverlay) gameOverOverlay.style.display = "none";
  if (winOverlay) winOverlay.style.display = "none";

  // Reset game over overlay styling to default
  const reasonElement = document.getElementById("gameOverReason");
  if (reasonElement) {
    reasonElement.style.color = "";
    reasonElement.style.textAlign = "";
    reasonElement.style.fontSize = "";
    reasonElement.style.lineHeight = "";
  }
  gameOverOverlay.style.background = "";
  gameOverOverlay.style.border = "";
  gameOverOverlay.style.boxShadow = "";

  // 4. Load Blue stage idle animation
  loadAndDisplayFBX(
    animationConfig[currentStage].idle.file,
    animationConfig[currentStage].idle.pose
  );

  // 5. Restart stat timers
  statTimers.hunger = myPet.createStatTimer(
    "hunger",
    gameSettings.baseDecayRate
  );
  statTimers.fun = myPet.createStatTimer("fun", gameSettings.baseDecayRate);
  statTimers.sleep = myPet.createStatTimer("sleep", gameSettings.baseDecayRate);
  statTimers.power = myPet.createStatTimer("power", gameSettings.baseDecayRate);

  // 6. REFRESH UI TO SHOW STARTING STAT VALUES AGAIN
  myPet.render();
}

// Make resetGame available globally for the HTML onclick
window.resetGame = resetGame;

// ============ ⚪ WHITE EMISSION EFFECT SYSTEM ============ \\
let whiteEmissionTimer = null;

function startWhiteEmissionTimer() {
  // Clear any existing timer
  if (whiteEmissionTimer) {
    clearTimeout(whiteEmissionTimer);
  }

  // Set timer for 8 seconds after white idle starts
  whiteEmissionTimer = setTimeout(() => {
    if (myPet && myPet.stage === "white" && !actionInProgress) {
      console.log(
        "✨⚪ Triggering white emission animation after 8 seconds of idle"
      );

      // Load the emission animation
      const emissionAnim = animationConfig.white.emission;
      if (emissionAnim) {
        loadAndDisplayFBX(emissionAnim.file, emissionAnim.pose).then(() => {
          console.log(
            "✨ White emission animation completed - TRANSCENDENCE ACHIEVED!"
          );

          // Trigger transcendence ending after emission completes
          setTimeout(() => {
            triggerTranscendence();
          }, 1000); // Brief pause before transcendence
        });
      }
    }
  }, 8000); // 8 seconds
}

function stopWhiteEmissionTimer() {
  if (whiteEmissionTimer) {
    clearTimeout(whiteEmissionTimer);
    whiteEmissionTimer = null;
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
function fadeOutBgMusic(targetVolume = 0.05, duration = 2000) {
  const bgMusic = document.getElementById("bg-music");
  if (!bgMusic) return;
  const startVolume = bgMusic.volume;
  const steps = 30;
  const stepTime = duration / steps;
  let currentStep = 0;
  const volumeStep = (startVolume - targetVolume) / steps;
  const fadeInterval = setInterval(() => {
    currentStep++;
    bgMusic.volume = Math.max(
      targetVolume,
      startVolume - volumeStep * currentStep
    );
    if (currentStep >= steps) {
      bgMusic.volume = targetVolume;
      clearInterval(fadeInterval);
    }
  }, stepTime);
}

function showTranscendenceOverlay() {
  const winOverlay = document.getElementById("transcendenceOverlay");
  if (!winOverlay) return;
  winOverlay.style.display = "flex";
  // Optional: move focus to the button for keyboard users
  const btn = document.getElementById("playAgainBtn");
  if (btn) btn.focus();
}

function showGameOverOverlayLoss(reason) {
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

// ============ ⚪ WHITE STAGE TRANSCENDENCE WITH EVOLUTION EFFECTS ============ \\
function triggerWhiteStageTranscendence() {
  console.log(
    "⚪✨ WHITE STAGE TRANSCENDENCE - Using evolution glitch effects!"
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

  // Show transcendence overlay after extended mystical effects complete
  setTimeout(() => {
    showWhiteTranscendenceOverlay();
  }, 33500); // After the extended mystical effect completes (100% longer)
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

// ============ ⚡ CYBERPUNK EVOLUTION EFFECT SYSTEM ============ \\
function triggerCyberpunkEvolutionEffect(duration = 6000) {
  // Play stutterMask.wav whenever glitch stutter is triggered
  const stutterMaskAudio = document.getElementById("stutterMask");
  if (stutterMaskAudio) {
    stutterMaskAudio.currentTime = 0;
    stutterMaskAudio.volume = 1.0;
    stutterMaskAudio.play().catch((err) => {
      console.log("🔇 stutterMask.wav audio play() blocked:", err);
    });
  }
  if (glitchStutterOverlay) {
    console.log("🌟✨ Cyberpunk magical evolution effect triggered");

    // Get the current cat position and dimensions
    const catData = getCatMaskData();

    if (catData) {
      // Position the effect around the cat
      glitchStutterOverlay.style.left = `${catData.x}px`;
      glitchStutterOverlay.style.top = `${catData.y}px`;
      glitchStutterOverlay.style.width = `${catData.width * 1.5}px`; // Larger for particles
      glitchStutterOverlay.style.height = `${catData.height * 1.5}px`;
      glitchStutterOverlay.style.transform = "translate(-50%, -50%)";

      // Create cyberpunk magical glow mask with particles
      glitchStutterOverlay.style.webkitMask = `
        radial-gradient(ellipse 60% 70% at 50% 45%, black 0%, black 40%, transparent 80%),
        radial-gradient(circle 8px at 25% 30%, black 0%, transparent 50%),
        radial-gradient(circle 6px at 75% 25%, black 0%, transparent 50%),
        radial-gradient(circle 8px at 35% 70%, black 0%, transparent 50%),
        radial-gradient(circle 7px at 65% 75%, black 0%, transparent 50%),
        radial-gradient(circle 5px at 85% 50%, black 0%, transparent 50%),
        radial-gradient(circle 7px at 15% 60%, black 0%, transparent 50%)
      `;
      glitchStutterOverlay.style.mask = `
        radial-gradient(ellipse 60% 70% at 50% 45%, black 0%, black 40%, transparent 80%),
        radial-gradient(circle 8px at 25% 30%, black 0%, transparent 50%),
        radial-gradient(circle 6px at 75% 25%, black 0%, transparent 50%),
        radial-gradient(circle 10px at 35% 70%, black 0%, transparent 50%),
        radial-gradient(circle 7px at 65% 75%, black 0%, transparent 50%),
        radial-gradient(circle 5px at 85% 50%, black 0%, transparent 50%),
        radial-gradient(circle 9px at 15% 60%, black 0%, transparent 50%)
      `;

      console.log(`✨ Cyberpunk evolution particles applied around cat`);
    }

    // Add evolution-specific class for enhanced effect
    glitchStutterOverlay.classList.add("active", "evolution");

    // Create pulsing effect with multiple phases
    let pulseCount = 0;
    const pulseInterval = setInterval(() => {
      pulseCount++;

      // Alternate between intense glow and particle burst
      if (pulseCount % 2 === 0) {
        // Intense glow phase
        glitchStutterOverlay.style.filter = `
          brightness(300%) 
          contrast(200%) 
          hue-rotate(${Math.random() * 80}deg) 
          saturate(400%)
          drop-shadow(0 0 20px #00ffff)
          drop-shadow(0 0 40px #ff00ff)
          drop-shadow(0 0 60px #ffff00)
        `;
      } else {
        // Particle burst phase
        glitchStutterOverlay.style.filter = `
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
        // 6 seconds of pulsing
        clearInterval(pulseInterval);
      }
    }, 500);

    // Remove the effect after specified duration
    setTimeout(() => {
      glitchStutterOverlay.classList.remove("active", "evolution");
      clearInterval(pulseInterval);

      // Reset all styles after effect
      setTimeout(() => {
        glitchStutterOverlay.style.left = "50%";
        glitchStutterOverlay.style.top = "50%";
        glitchStutterOverlay.style.width = "280px";
        glitchStutterOverlay.style.height = "380px";
        glitchStutterOverlay.style.webkitMask = "";
        glitchStutterOverlay.style.mask = "";
        glitchStutterOverlay.style.filter = "";
      }, 100);
      console.log("✨ Cyberpunk magical evolution effect ended");
    }, duration);
  }
}

// ============ ✨ MYSTICAL TRANSCENDENCE EFFECT SYSTEM ============ \\
function triggerMysticalTranscendence(duration = 16500) {
  // Extended from 11000 to 16500ms (50% longer)
  if (glitchStutterOverlay) {
    console.log(
      "🌟✨ Mystical transcendence effect with mandala glow triggered"
    );

    // Get the current cat position and dimensions
    const catData = getCatMaskData();

    if (catData) {
      // Position the effect around the cat with even larger coverage for mystical aura + halo
      glitchStutterOverlay.style.left = `${catData.x}px`;
      glitchStutterOverlay.style.top = `${catData.y}px`;
      glitchStutterOverlay.style.width = `${catData.width * 4.2}px`; // 20% larger for halo effect
      glitchStutterOverlay.style.height = `${catData.height * 3.0}px`; // 20% larger for halo effect
      glitchStutterOverlay.style.transform = "translate(-50%, -50%)";

      // Create mystical mandala mask around the cat with large halo
      glitchStutterOverlay.style.webkitMask = `
        radial-gradient(circle 120% at 50% 50%, black 0%, black 15%, transparent 80%),
        radial-gradient(circle 10px at 50% 20%, black 0%, transparent 60%),
        radial-gradient(circle 8px at 80% 35%, black 0%, transparent 50%),
        radial-gradient(circle 12px at 65% 80%, black 0%, transparent 60%),
        radial-gradient(circle 6px at 20% 65%, black 0%, transparent 45%),
        radial-gradient(circle 15px at 35% 15%, black 0%, transparent 70%),
        radial-gradient(circle 9px at 85% 85%, black 0%, transparent 55%)
      `;
      glitchStutterOverlay.style.mask = `
        radial-gradient(circle 120% at 50% 50%, black 0%, black 15%, transparent 80%),
        radial-gradient(circle 10px at 50% 20%, black 0%, transparent 60%),
        radial-gradient(circle 8px at 80% 35%, black 0%, transparent 50%),
        radial-gradient(circle 12px at 65% 80%, black 0%, transparent 60%),
        radial-gradient(circle 6px at 20% 65%, black 0%, transparent 45%),
        radial-gradient(circle 15px at 35% 15%, black 0%, transparent 70%),
        radial-gradient(circle 9px at 85% 85%, black 0%, transparent 55%)
      `;

      console.log(
        `✨ Mystical mandala mask applied around cat for transcendence`
      );
    }

    // Add transcendence class for mystical effect
    glitchStutterOverlay.classList.add("active", "transcendence");

    // Create mystical pulsing pattern with color shifts - SLOW BUILD-UP
    let pulseCount = 0;
    const totalPhases = 66; // Extended from 44 to 66 phases (50% longer)
    const mysticalInterval = setInterval(() => {
      pulseCount++;

      // Much slower progression - starts very subtle, extended peak phase
      const phase = pulseCount % 20;

      if (phase === 0) {
        // Very subtle divine white-gold phase (starts almost invisible)
        glitchStutterOverlay.style.filter = `
          blur(2px) 
          brightness(90%) 
          saturate(110%) 
          drop-shadow(0 0 30px rgba(97, 8, 186, 0.3))
          drop-shadow(0 0 60px rgba(255, 215, 0, 0.2))
        `;
      } else if (phase === 1) {
        // Subtle pink-purple mystical phase
        glitchStutterOverlay.style.filter = `
          blur(1.8px) 
          brightness(100%) 
          saturate(130%) 
          drop-shadow(0 0 40px rgba(255, 105, 180, 0.4))
          drop-shadow(0 0 80px rgba(138, 43, 226, 0.3))
        `;
      } else if (phase === 2) {
        // Gentle indigo cosmic phase
        glitchStutterOverlay.style.filter = `
          blur(1.5px) 
          brightness(110%) 
          saturate(150%) 
          drop-shadow(0 0 50px rgba(75, 0, 130, 0.5))
          drop-shadow(0 0 100px rgba(138, 43, 226, 0.3))
        `;
      } else if (phase === 3) {
        // Building sky blue ethereal phase
        glitchStutterOverlay.style.filter = `
          blur(1.3px) 
          brightness(130%) 
          saturate(180%) 
          drop-shadow(0 0 60px rgba(0, 191, 255, 0.4))
          drop-shadow(0 0 120px rgba(147, 0, 211, 0.25))
        `;
      } else if (phase === 4) {
        // Gradual golden divine phase
        glitchStutterOverlay.style.filter = `
          blur(1px) 
          brightness(150%) 
          saturate(200%) 
          drop-shadow(0 0 70px rgba(255, 215, 0, 0.6))
          drop-shadow(0 0 140px rgba(255, 255, 255, 0.3))
        `;
      } else if (phase === 5) {
        // Growing rainbow harmony phase
        glitchStutterOverlay.style.filter = `
          blur(0.8px) 
          brightness(170%) 
          saturate(250%) 
          drop-shadow(0 0 60px rgba(255, 105, 180, 0.4))
          drop-shadow(0 0 90px rgba(138, 43, 226, 0.35))
          drop-shadow(0 0 120px rgba(0, 191, 255, 0.25))
          drop-shadow(0 0 150px rgba(255, 215, 0, 0.25))
        `;
      } else if (phase === 6) {
        // Intensifying cosmic phase
        glitchStutterOverlay.style.filter = `
          blur(1px) 
          brightness(190%) 
          saturate(300%) 
          drop-shadow(0 0 70px rgba(255, 105, 180, 0.5))
          drop-shadow(0 0 110px rgba(138, 43, 226, 0.4))
          drop-shadow(0 0 150px rgba(0, 191, 255, 0.3))
          drop-shadow(0 0 190px rgba(255, 215, 0, 0.3))
        `;
      } else {
        // Extended peak transcendence phase (lasts 50% longer)
        const intensity = Math.min(1.0 + (pulseCount / totalPhases) * 0.5, 1.5); // Gradual build to peak
        glitchStutterOverlay.style.filter = `
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
        // Extended mystical pulsing with longer peak phase
        clearInterval(mysticalInterval);
      }
    }, 250); // Faster pulsing for extended duration

    // Remove the effect after specified duration
    setTimeout(() => {
      glitchStutterOverlay.classList.remove("active", "transcendence");
      clearInterval(mysticalInterval);

      // Reset all styles after effect
      setTimeout(() => {
        glitchStutterOverlay.style.left = "50%";
        glitchStutterOverlay.style.top = "50%";
        glitchStutterOverlay.style.width = "280px";
        glitchStutterOverlay.style.height = "380px";
        glitchStutterOverlay.style.webkitMask = "";
        glitchStutterOverlay.style.mask = "";
        glitchStutterOverlay.style.filter = "";
      }, 100);
      console.log("🌟✨ Mystical transcendence effect ended");
    }, duration);
  }
}

// ============ ⚡ GLITCH STUTTER EFFECT SYSTEM ============ \\
function triggerGlitchStutter(duration = 120) {
  // Play stutterMask.wav every time glitchStutterOverlay is triggered
  const glitchStutterAudio = document.getElementById("stutterMask");
  if (glitchStutterAudio) {
    glitchStutterAudio.currentTime = 0;
    glitchStutterAudio.volume = 0.8;
    glitchStutterAudio.play().catch((err) => {
      console.log("🔇 stutterMask.wav audio play() blocked:", err);
    });
  }
  if (glitchStutterOverlay) {
    console.log(
      "⚡ Dynamic cat-shaped glitch stutter triggered with inverted layer"
    );

    // Get the current cat position and dimensions
    const catData = getCatMaskData();

    if (catData) {
      // Apply dynamic positioning and sizing to BOTH overlays
      const overlays = [glitchStutterOverlay, glitchStutterOverlay2].filter(
        Boolean
      );

      overlays.forEach((overlay, index) => {
        if (overlay) {
          overlay.style.left = `${catData.x}px`;
          overlay.style.top = `${catData.y}px`;

          // Increase size by 20% for white stage
          const sizeMultiplier = currentStage === "white" ? 1.2 : 1.0;
          overlay.style.width = `${catData.width * sizeMultiplier}px`;
          overlay.style.height = `${catData.height * sizeMultiplier}px`;

          // First overlay: normal transform, Second overlay: reduced size to hide outline
          if (index === 0) {
            overlay.style.transform = "translate(-50%, -50%)";
          } else {
            overlay.style.transform = "translate(-50%, -50%) scale(0.85)";
          }

          // Apply same mask shape to both overlays based on current pose
          let maskStyle = "";
          if (catData.pose.includes("sleep")) {
            // Sleeping cat - wider, shorter shape
            maskStyle = `radial-gradient(ellipse 50% 35% at 50% 55%, black 0%, black 70%, transparent 80%)`;
          } else if (
            catData.pose.includes("dance") ||
            catData.pose.includes("salsa")
          ) {
            // Dancing cat - more dynamic shape with extended limbs
            maskStyle = `
              radial-gradient(ellipse 45% 55% at 50% 45%, black 0%, black 65%, transparent 75%),
              radial-gradient(ellipse 12% 18% at 35% 25%, black 0%, transparent 70%),
              radial-gradient(ellipse 12% 18% at 65% 25%, black 0%, transparent 70%)
            `;
          } else {
            // Default cat shape
            maskStyle = `
              radial-gradient(ellipse 40% 50% at 50% 45%, black 0%, black 60%, transparent 70%),
              radial-gradient(ellipse 15% 20% at 35% 25%, black 0%, transparent 70%),
              radial-gradient(ellipse 15% 20% at 65% 25%, black 0%, transparent 70%)
            `;
          }

          overlay.style.webkitMask = maskStyle;
          overlay.style.mask = maskStyle;
        }
      });

      console.log(
        `✅ Dynamic cat mask applied to ${overlays.length} layers - Position: (${catData.x}, ${catData.y}), Size: ${catData.width}x${catData.height}, Pose: ${catData.pose}`
      );
    }

    // Add active class to trigger the effect on BOTH overlays
    glitchStutterOverlay.classList.add("active");
    if (glitchStutterOverlay2) {
      glitchStutterOverlay2.classList.add("active");
    }

    // Remove the effect after specified duration
    setTimeout(() => {
      glitchStutterOverlay.classList.remove("active");
      if (glitchStutterOverlay2) {
        glitchStutterOverlay2.classList.remove("active");
      }

      // Reset positioning after effect for BOTH overlays
      setTimeout(() => {
        const overlays = [glitchStutterOverlay, glitchStutterOverlay2].filter(
          Boolean
        );
        overlays.forEach((overlay, index) => {
          if (overlay) {
            overlay.style.left = "50%";
            overlay.style.top = "50%";
            overlay.style.width = "280px";
            overlay.style.height = "380px";
            overlay.style.webkitMask = "";
            overlay.style.mask = "";

            // Reset transform for both overlays
            if (index === 0) {
              overlay.style.transform = "translate(-50%, -50%)";
            } else {
              overlay.style.transform = "translate(-50%, -50%) scale(0.85)";
            }
          }
        });
      }, 50);
      console.log(
        "⚡ Dynamic cat-shaped glitch stutter effect ended (dual layer)"
      );
    }, duration);
  }
}

// Enhanced animation transition with cat-shaped glitch stutter masking
async function playAnimationWithStutterMask(actionType, stage) {
  // Trigger glitch stutter effect ONCE at the start of each action
  triggerGlitchStutter(90);

  // Small delay to let stutter effect start
  await new Promise((resolve) => setTimeout(resolve, 20));

  // Play the actual animation and wait for the entire sequence to complete
  const result = await playActionThenShareIdle(actionType, stage);

  return result;
}

function setupDropdownMenu() {
  if (btn && menu && container) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      menu.style.display = menu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (!container.contains(e.target)) menu.style.display = "none";
    });
  }
}

setupDropdownMenu();

// ============ 🐾 Set Model Pose event listeners=============== \ \
async function playDanceAction(stage) {
  return new Promise(async (resolve) => {
    // Determine which dance to play based on sequence index
    const danceVariants = ["dance", "dance2"];
    const selectedAction = danceVariants[danceSequenceIndex];

    // Check if the selected dance exists for this stage
    if (!animationConfig[stage] || !animationConfig[stage][selectedAction]) {
      console.log(
        `⚠️ ${selectedAction} animation not available for ${stage} stage`
      );
      // Try the other dance if this one doesn't exist
      const fallbackAction = danceVariants[1 - danceSequenceIndex];
      if (animationConfig[stage] && animationConfig[stage][fallbackAction]) {
        console.log(
          `🎬 Playing fallback dance: ${fallbackAction} for ${stage} stage`
        );
        const anim = animationConfig[stage][fallbackAction];
        const baseDurationMs = await loadAndDisplayFBX(anim.file, anim.pose);

        // Both dance and dance2 loop 1 time
        const totalDurationMs = baseDurationMs * 1;
        console.log(
          `🔄 Dance animation will loop 1 time, total duration: ${totalDurationMs}ms`
        );

        // Wait for loops to complete, then transition to idle
        setTimeout(() => {
          triggerGlitchStutter(60);
          setTimeout(() => {
            const idleAnim = animationConfig[myPet.stage]["idleAfterDance"];
            if (idleAnim) {
              console.log(
                `🎬 Transitioning to idleAfterDance for ${myPet.stage} stage with glitch masking`
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
      }/2: ${selectedAction} for ${stage} stage`
    );

    const anim = animationConfig[stage][selectedAction];
    let loopOptions = undefined;
    if (stage === "white" && actionType === "train") {
      loopOptions = { loop: false };
    }
    const baseDurationMs = await loadAndDisplayFBX(
      anim.file,
      anim.pose,
      loopOptions
    );

    // Both dance and dance2 loop 1 time
    const totalDurationMs = baseDurationMs * 1;
    console.log(
      `🔄 ${selectedAction} will loop 1 time, total duration: ${totalDurationMs}ms`
    );

    // Advance to next dance in sequence (0 -> 1 -> 0 -> 1...)
    danceSequenceIndex = (danceSequenceIndex + 1) % 2;

    // Wait for all loops to complete before transitioning to idle
    setTimeout(() => {
      // Trigger glitch stutter masking for idle transition
      triggerGlitchStutter(60);

      setTimeout(() => {
        const currentActiveStage = myPet.stage;
        const idleAnim = animationConfig[currentActiveStage]["idleAfterDance"];
        if (idleAnim) {
          console.log(
            `🎬 Transitioning to idleAfterDance for ${currentActiveStage} stage with glitch masking`
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
      (variant) => animationConfig[stage] && animationConfig[stage][variant]
    );

    // If no variants available, skip this action
    if (availableVariants.length === 0) {
      console.log(
        `⚠️ No ${actionType} animations available for ${stage} stage`
      );
      resolve(actionType); // Return the base action type
      return;
    }

    const selectedAction =
      availableVariants[Math.floor(Math.random() * availableVariants.length)];
    console.log(
      `🎬 Playing ${actionType} animation: ${selectedAction} for ${stage} stage (${availableVariants.length} variants available)`
    );

    const anim = animationConfig[stage][selectedAction];
    const baseDurationMs = await loadAndDisplayFBX(anim.file, anim.pose);

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
      `🔄 Animation will loop ${loopCount} times, total duration: ${totalDurationMs}ms`
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
        // Use current stage (might have evolved since action started)
        const currentActiveStage = myPet.stage;
        const idleAnim = animationConfig[currentActiveStage][idleKey];
        if (idleAnim) {
          console.log(
            `🎬 Transitioning to ${idleKey} for ${currentActiveStage} stage (action was ${stage}) with glitch masking`
          );
          loadAndDisplayFBX(idleAnim.file, idleAnim.pose).then(() => {
            // If this was train in white stage, trigger transcendence after 3s
            if (
              stage === "white" &&
              ["train", "train2"].includes(selectedAction)
            ) {
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

resetBtn.addEventListener("click", () => {
  resetGame();
});

overlayStartBtn.addEventListener("click", async () => {
  overlay.style.display = "none"; // Hide intro screen
  // 🧿 Show the Glitch Egg when game starts
  const glitchEgg = document.getElementById("colorfulGlitchDiv");
  glitchEgg.style.display = "flex"; // Show glitch egg
  glitchEgg.classList.add("hatching"); // Start animation
  console.log("🧿 Glitch egg shown...");

  // Load pet while glitch egg animates
  await startGame(); // Now returns a Promise after FBX idle loads

  // Wait 5s before hiding glitch egg to ensure it plays fully
  setTimeout(() => {
    glitchEgg.classList.remove("hatching");
    glitchEgg.style.display = "none";
    console.log("✨ Glitch egg hidden");
  }, 5000);
});

// Add event listener for Play Again button in winOverlay
document.addEventListener("DOMContentLoaded", () => {
  const playAgainBtn = document.querySelector("#winOverlay .game-over-button");
  if (playAgainBtn) {
    playAgainBtn.addEventListener("click", () => {
      const winOverlay = document.getElementById("winOverlay");
      if (winOverlay) winOverlay.style.display = "none";
      resetGame();
    });
  }
});

feedButton.addEventListener("click", async () => {
  if (actionInProgress || gameOverTriggered || feedButton.disabled) return;
  actionInProgress = true;
  stopWhiteEmissionTimer();
  console.log("🔒 Feed button pressed - Action locked");
  try {
    if (!animationConfig[currentStage]?.feed) {
      console.log(`⚠️ Feed action not available for ${currentStage} stage`);
      actionInProgress = false;
      return;
    }
    myPet.feed();
    buttonTracker.feed = true;
    console.log(
      `🍽️ Feed action completed. Evolution progress: ${myPet.stage} (${myPet.evolutionLevel}) | Button tracker:`,
      buttonTracker
    );
    // Play stutterMask.wav 3ms before glitch stutter
    const stutterMaskAudio = document.getElementById("stutterMask");
    if (stutterMaskAudio) {
      stutterMaskAudio.currentTime = 0;
      stutterMaskAudio.volume = 1.0;
      stutterMaskAudio.play().catch((err) => {
        console.log("🔇 stutterMask.wav audio play() blocked:", err);
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 3));
    triggerGlitchStutter(90);
    await new Promise((resolve) => setTimeout(resolve, 20));
    const selectedAction = await playActionThenShareIdle("feed", currentStage);
    checkForEvolution();
  } finally {
    actionInProgress = false;
    if (currentStage === "white") {
      startWhiteEmissionTimer();
    }
    console.log("🔓 Feed button unlocked - Action available");
  }
});

danceButton.addEventListener("click", async () => {
  if (actionInProgress || gameOverTriggered || danceButton.disabled) return;
  actionInProgress = true;
  stopWhiteEmissionTimer();
  console.log("🔒 Dance button pressed - Action locked");
  try {
    myPet.dance();
    // Play stutterMask.wav 3ms before glitch stutter
    const stutterMaskAudio = document.getElementById("stutterMask");
    if (stutterMaskAudio) {
      stutterMaskAudio.currentTime = 0;
      stutterMaskAudio.volume = 1.0;
      stutterMaskAudio.play().catch((err) => {
        console.log("🔇 stutterMask.wav audio play() blocked:", err);
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 3));
    triggerGlitchStutter(90);
    await new Promise((resolve) => setTimeout(resolve, 20));
    const selectedAction = await playDanceAction(currentStage);
    if (selectedAction === "dance") {
      buttonTracker.dance = true;
    } else if (selectedAction === "dance2") {
      buttonTracker.dance2 = true;
    }
    console.log(
      `💃 Dance action completed (${selectedAction}). Evolution progress: ${myPet.stage} (${myPet.evolutionLevel}) | Button tracker:`,
      buttonTracker
    );
    checkForEvolution();
  } finally {
    actionInProgress = false;
    if (currentStage === "white") {
      if (!whiteStageCareActions.dance || !whiteStageCareActions.train) {
        startWhiteEmissionTimer();
      }
    }
    console.log("🔓 Dance button unlocked - Action available");
  }
});

sleepButton.addEventListener("click", async () => {
  if (actionInProgress || gameOverTriggered || sleepButton.disabled) return;
  actionInProgress = true;
  stopWhiteEmissionTimer();
  console.log("🔒 Sleep button pressed - Action locked");
  try {
    if (!animationConfig[currentStage]?.sleep) {
      console.log(`⚠️ Sleep action not available for ${currentStage} stage`);
      actionInProgress = false;
      return;
    }
    myPet.sleepRest();
    buttonTracker.sleep = true;
    console.log(
      `😴 Sleep action completed. Evolution progress: ${myPet.stage} (${myPet.evolutionLevel}) | Button tracker:`,
      buttonTracker
    );
    // Play stutterMask.wav 3ms before glitch stutter
    const stutterMaskAudio = document.getElementById("stutterMask");
    if (stutterMaskAudio) {
      stutterMaskAudio.currentTime = 0;
      stutterMaskAudio.volume = 1.0;
      stutterMaskAudio.play().catch((err) => {
        console.log("🔇 stutterMask.wav audio play() blocked:", err);
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 3));
    triggerGlitchStutter(90);
    await new Promise((resolve) => setTimeout(resolve, 20));
    const selectedAction = await playActionThenShareIdle("sleep", currentStage);
    checkForEvolution();
  } finally {
    actionInProgress = false;
    if (currentStage === "white") {
      startWhiteEmissionTimer();
    }
    console.log("🔓 Sleep button unlocked - Action available");
  }
});

trainButton.addEventListener("click", async () => {
  if (actionInProgress || gameOverTriggered || trainButton.disabled) return;
  actionInProgress = true;
  stopWhiteEmissionTimer();
  console.log("🔒 Train button pressed - Action locked");
  try {
    myPet.train();
    // Play stutterMask.wav 3ms before glitch stutter
    const stutterMaskAudio = document.getElementById("stutterMask");
    if (stutterMaskAudio) {
      stutterMaskAudio.currentTime = 0;
      stutterMaskAudio.volume = 1.0;
      stutterMaskAudio.play().catch((err) => {
        console.log("🔇 stutterMask.wav audio play() blocked:", err);
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 3));
    triggerGlitchStutter(90);
    await new Promise((resolve) => setTimeout(resolve, 20));
    const selectedAction = await playActionThenShareIdle("train", currentStage);
    if (selectedAction === "train") {
      buttonTracker.train = true;
    } else if (selectedAction === "train2") {
      buttonTracker.train2 = true;
    }
    console.log(
      `💪 Train action completed (${selectedAction}). Evolution progress: ${myPet.stage} (${myPet.evolutionLevel}) | Button tracker:`,
      buttonTracker
    );
    checkForEvolution();
  } finally {
    actionInProgress = false;
    if (currentStage === "white") {
      if (!whiteStageCareActions.dance || !whiteStageCareActions.train) {
        startWhiteEmissionTimer();
      }
    }
    console.log("🔓 Train button unlocked - Action available");
  }
});

import { loadAndDisplayFBX } from "./main-test.js";
import animationConfig from "./annimationConfig.js";

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

const gameSettings = {
  ageInterval: 20000,
  baseDecayRate: 14000,
  fastDecayRate: 6000,
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
let currentStage = "white"; // second stage
loadAndDisplayFBX(
  animationConfig[currentStage].idle.file,
  animationConfig[currentStage].idle.pose
);

let myPet;
let gameStarted = false;
let currentAnimationTimer = null;
let backgroundMusic;

// Evolution System Variables
let buttonTracker = {
  feed: false,
  dance: false,
  sleep: false,
  train: false,
};
let evolutionTimeout = null;

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
const powerTimer = document.getElementById("power-timer");
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
// *---------------CACHED ELEMENTS ---------------------* \\

// 🧬 Transcendence Pet Class
class Pet {
  constructor(petName = "Coco") {
    this.name = petName;
    this.age = 0;
    this.hunger = 0;
    this.fun = 10;
    this.sleep = 0;
    this.stage = "egg"; // starts as glitch egg
    this.evolutionLevel = 0;

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
  tain() {
    this.power = Math.max(10, this.power + 2);
    console.log(`${this.name} is sleeping. Sleep: ${this.power}`);
    this.render();
  }

  // 🌱 Trigger Evolution
  evolveToNextStage() {
    if (this.evolutionLevel < 4) {
      this.evolutionLevel++;
      const stages = ["blue", "yellow", "green", "red", "white"];
      this.stage = stages[this.evolutionLevel];
      console.log(`🌟 ${this.name} evolved to ${this.stage} form!`);
      this.render();
    }
  }

  // ⚰️ Game Over
  triggerGameOver(reason) {
    console.log(`💀 GAME OVER: ${reason}`);
    // You can later link this to overlay/message logic
  }

  // ⏳ Stat decay
  createStatTimer(type, interval = 7000) {
    return setInterval(() => {
      if (type === "hunger") this.hunger++;
      if (type === "fun") this.fun--;
      if (type === "sleep") this.sleep++;
      if (type === "power") this.power++;
      this.render();

      // Game over conditions
      if (this.hunger >= 10) this.triggerGameOver("Starved");
      if (this.fun <= 0) this.triggerGameOver("Bored to death");
      if (this.sleep >= 10) this.triggerGameOver("Collapsed from exhaustion");
      if (this.power <= 0) this.triggerGameOver("Collapsed from weakness");
    }, interval);
  }

  // 🛑 Stop all stat timers
  stopAllTimers() {
    clearInterval(this.hungerTimer);
    clearInterval(this.funTimer);
    clearInterval(this.sleepTimer);
    clearInterval(this.powerTimer);
  }

  // 🖥️ Update UI or log state (placeholder)
  render() {
    console.log(
      `🧾 ${this.name} | Age: ${this.age} | Hunger: ${this.hunger} | Fun: ${this.fun} | Sleep: ${this.sleep} |Power: ${this.power} |  Stage: ${this.stage}`
    );
  }
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

// ===================IDLE AFTER TESTING
//11
// TEMPORARY: Press number keys 1–5 to test idleAfterFeed animations per color
document.addEventListener("keydown", (e) => {
  if (e.key === "1") {
    loadAndDisplayFBX(
      animationConfig["red"].idleAfterTrain.file,
      animationConfig["red"].idleAfterTrain.pose
    );
  }
  if (e.key === "2") {
    loadAndDisplayFBX(
      animationConfig["red"].idleAfterSleep.file,
      animationConfig["red"].idleAfterSleep.pose
    );
  }
  if (e.key === "3") {33
    loadAndDisplayFBX(
      animationConfig["red"].idleAfterDance.file,
      animationConfig["red"].idleAfterDance.pose
    );
  }
  if (e.key === "4") {
    loadAndDisplayFBX(
      animationConfig["red"].idleAfterFeed.file,
      animationConfig["red"].idleAfterFeed.pose
    );
  }
  if (e.key === "5") {
    loadAndDisplayFBX(
      animationConfig["white"].idleAfterFeed.file,
      animationConfig["white"].idleAfterFeed.pose
    );
  }
});11

// setting position for evolution. Comment out bottom functiona temporarily




//TEMP: Test Blue Idle
feedButton.addEventListener("click", () => {
  loadAndDisplayFBX(
    animationConfig["red"].feed.file,
    animationConfig["red"].feed.pose
  );
});

// TEMP: Test Yellow Idle
danceButton.addEventListener("click", () => {
  loadAndDisplayFBX(
    animationConfig["white"].dance.file,
    animationConfig["white"].dance.pose
  );
});

// TEMP: Test Red Idle
sleepButton.addEventListener("click", () => {
  loadAndDisplayFBX(
    animationConfig["red"].sleep.file,
    animationConfig["red"].sleep.pose
  );
});

// TEMP: Test White Idle
trainButton.addEventListener("click", () => {
  loadAndDisplayFBX(
    animationConfig["white"].train.file,
    animationConfig["white"].train.pose
  );
});

document.addEventListener("keydown", (e) => {
  if (e.key === "d") {
    console.log("🌀 Dissolve test triggered!");
    loadAndDisplayFBX("models/WHITE_emission_2.fbx", {
      scale: [0.001, 0.001, 0.001],
      position: [0, -1.6, -1],
      rotationY: 0,
    });
  }
});





//=================TO USE IN GAME

// async function playAnimation(stage, action) {
//   const { file, pose } = animationConfig[stage][action];
//   const duration = await loadAndDisplayFBX(file, pose);
//   return duration;
// }
// feedButton.addEventListener("click", async () => {
//   const duration = await playAnimation(currentStage, "feed");
//   setTimeout(() => playAnimation(currentStage, "idleAfterFeed"), duration * 2);
// });

// danceButton.addEventListener("click", async () => {
//   const danceList = danceMap[currentStage];
//   const index = danceIndices[currentStage];
//   const danceKey = danceList[index];

//   danceIndices[currentStage] = (index + 1) % danceList.length;

//   const duration = await playAnimation(currentStage, danceKey);
//   let delay;
//   // 💚 Force Green's Dance 2 to last 15 seconds
//   if (currentStage === "green" && danceKey === "dance2") {
//     delay = 20000;
//   } else {
//     delay = duration * 1000;
//   }
//   setTimeout(() => playAnimation(currentStage, "idleAfterDance"), duration);
// });

// sleepButton.addEventListener("click", async () => {
//   const duration = await playAnimation(currentStage, "sleep");
//   setTimeout(() => playAnimation(currentStage, "idleAfterSleep"), duration);
// });

// trainButton.addEventListener("click", async () => {
//   const trainList = trainMap[currentStage];
//   const index = trainIndices[currentStage];
//   const trainKey = trainList[index];

//   const duration = await playAnimation(currentStage, trainKey);
//   // now play the next train animation
//   // and set the next index for the next time
//   trainIndices[currentStage] = (index + 1) % trainList.length;

//   setTimeout(() => playAnimation(currentStage, "idleAfterTrain"), duration);
// });

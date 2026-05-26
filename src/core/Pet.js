import { gameSettings, stageMap, stageEmojis } from "@core/config.js";
import { updatePetChat } from "@ui/petChat.js";
import { loadAndDisplayFBX } from "@/animRender.js";
import animationConfig from "@/animationConfig.js";
import { showGameOverOverlay } from "@ui/overlays.js";

export class Pet {
  constructor(petName = "Coco", { onStageChange, onGameOver } = {}) {
    this.name = petName;
    this.age = 0;
    this.hunger = 0;
    this.fun = 10;
    this.sleep = 0;
    this.power = 10;
    this.stage = "blue";
    this.evolutionLevel = 0;

    this.showingEvolutionMessage = false;
    this.showingActionMessage = false;
    this.ageInterval = null;
    this._isDead = false;

    this._onStageChange = onStageChange || (() => {});
    this._onGameOver = onGameOver || (() => {});
  }

  feed() {
    this.hunger = Math.max(0, this.hunger - 2);
    console.log(`${this.name} is eating. Hunger: ${this.hunger}`);
    this.render();
  }

  dance() {
    this.fun = Math.min(10, this.fun + 2);
    console.log(`${this.name} is dancing. Fun: ${this.fun}`);
    this.render();
  }

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

  evolveToNextStage() {
    console.log(`🔄 Evolution attempt: Current level ${this.evolutionLevel} (${this.stage})`);

    if (this.evolutionLevel < 4) {
      const oldStage = this.stage;
      const oldLevel = this.evolutionLevel;

      this.evolutionLevel++;
      const stages = ["blue", "yellow", "green", "red", "white"];
      this.stage = stages[this.evolutionLevel];
      this._onStageChange(this.stage);

      console.log(`🌟 ${this.name} evolved from ${oldStage} (Level ${oldLevel}) to ${this.stage} (Level ${this.evolutionLevel})!`);
      console.log(`📊 Evolution progression: blue(0) → yellow(1) → green(2) → red(3) → white(4)`);

      this.age += 5;
      console.log(`🐱 ${this.name} has aged to ${this.age} years old`);

      if (stageMap[this.evolutionLevel]) {
        updatePetChat(
          stageMap[this.evolutionLevel].chatMessage ||
            `${stageEmojis[this.stage]} ${this.name}${stageMap[this.evolutionLevel].message}`,
        );
      }
      this.render();
    } else {
      console.log(`✨ ${this.name} has reached the final form: ${this.stage} (Level ${this.evolutionLevel})! No further evolution possible.`);
    }
  }

  startAging() {
    this.ageInterval = setInterval(() => {
      this.age++;
      console.log(`🐱 ${this.name} aged to ${this.age} year sold`);
      this.render();
    }, gameSettings.ageInterval);
  }

  async triggerGameOver(reason) {
    if (this._isDead) {
      console.log("💀 GAME OVER already triggered, ignoring duplicate.");
      return;
    }
    this._isDead = true;
    console.log(`💀 GAME OVER: ${reason}`);

    this.stopAllTimers();
    this.render();

    await this._onGameOver(reason, this.stage);
  }

  createStatTimer(type, interval = 7000) {
    console.log(`⏰ Creating stat timer for ${type} with interval ${interval}ms`);
    const timer = setInterval(() => {
      console.log(`⏰ Stat timer tick: ${type} - hunger:${this.hunger} fun:${this.fun} sleep:${this.sleep} power:${this.power}`);
      if (type === "hunger") this.hunger++;
      if (type === "fun") this.fun--;
      if (type === "sleep") this.sleep++;
      if (type === "power") this.power--;
      this.render();

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

    this[`${type}Timer`] = timer;
    return timer;
  }

  stopAllTimers() {
    clearInterval(this.hungerTimer);
    clearInterval(this.funTimer);
    clearInterval(this.sleepTimer);
    clearInterval(this.powerTimer);
    clearInterval(this.ageInterval);
  }

  render() {
    console.log(`🧾 ${this.name} | Age: ${this.age} | Hunger: ${this.hunger} | Fun: ${this.fun} | Sleep: ${this.sleep} | Power: ${this.power} | Stage: ${this.stage}`);

    const hungerBar = document.getElementById("hungerBar");
    const hungerValue = document.getElementById("hungerValue");
    const funBar = document.getElementById("funBar");
    const funValue = document.getElementById("funValue");
    const sleepBar = document.getElementById("sleepBar");
    const sleepValue = document.getElementById("sleepValue");
    const powerBar = document.getElementById("powerBar");
    const powerValue = document.getElementById("powerValue");

    if (this.stage !== "white" && this.hungerTimer) {
      if (hungerBar) hungerBar.style.width = `${(this.hunger / 10) * 100}%`;
      if (hungerValue) hungerValue.textContent = this.hunger;
    }
    if (this.stage !== "white" && this.sleepTimer) {
      if (sleepBar) sleepBar.style.width = `${(this.sleep / 10) * 100}%`;
      if (sleepValue) sleepValue.textContent = this.sleep;
    }

    if (funBar) funBar.style.width = `${(this.fun / 10) * 100}%`;
    if (funValue) funValue.textContent = this.fun;
    if (powerBar) powerBar.style.width = `${(this.power / 10) * 100}%`;
    if (powerValue) powerValue.textContent = this.power;
  }
}

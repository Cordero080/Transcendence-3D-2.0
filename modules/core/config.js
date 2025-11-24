// Configuration constants and maps
export const gameSettings = {
  MAX_STAT: 10,
  EVOLUTION_THRESHOLD: 1,
  baseDecayRate: 7000,
  ageInterval: 10000,
};

export const stageMap = {
  0: {
    message: " is just hatching!",
    chatMessage: "🔵 New life awakens... Time to grow strong!",
  },
  1: {
    message: " is growing stronger!",
    chatMessage: "🟡 Energy surges through me! I feel the power building!",
  },
  2: {
    message: " is becoming powerful!",
    chatMessage: "🟢 My strength is undeniable! The path forward is clear!",
  },
  3: {
    message: " is reaching peak form!",
    chatMessage: "🔴 This is my prime! Nothing can stop me now!",
  },
  4: {
    message: " has transcended!",
    chatMessage: "⚪ Beyond mortal limits... I have become infinite!",
  },
};

export const stageEmojis = {
  blue: "🔵",
  yellow: "🟡",
  green: "🟢",
  red: "🔴",
  white: "⚪",
};

export const timerMap = {
  hunger: "hungerTimer",
  fun: "funTimer",
  sleep: "sleepTimer",
  power: "powerTimer",
};

export const STAT_TYPES = ["hunger", "fun", "sleep", "power"];

export const danceMap = {
  blue: ["dance"],
  yellow: ["dance"],
  green: ["dance", "dance2"],
  red: ["dance", "dance2"],
  white: ["dance", "dance2"],
};

export const trainMap = {
  blue: ["train"],
  yellow: ["train", "train2"],
  green: ["train", "train2"],
  red: ["train", "train2"],
  white: ["train", "train2"],
};

export const danceIndices = {
  blue: 0,
  yellow: 0,
  green: 0,
  red: 0,
  white: 0,
};

export const trainIndices = {
  blue: 0,
  yellow: 0,
  green: 0,
  red: 0,
  white: 0,
};

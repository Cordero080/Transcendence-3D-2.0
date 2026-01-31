// modules/state.js
export function createState() {
  return {
    pet: null,             // will hold your Pet instance later
    currentStage: 'blue',  // starting stage
    timers: {},            // hunger/fun/sleep/power timers
    refs: {},              // DOM element references go here later
    flags: {}              // booleans for game state (paused, animating, etc.)
  };
}
# Xenochi — How the App Starts (Execution Order)

This document explains what happens, in order, from the moment someone opens the game
to the moment the cat is standing on screen waiting for input.

Use this as a reading map when studying `src/app.js`.

---

## The Big Picture

The browser does a lot of invisible work before any of your code runs.
There are essentially three phases:

1. The browser reads the HTML and builds the page
2. The browser downloads and runs `app.js` (defining everything, running nothing)
3. The browser fires the "page is ready" signal, and the game wires itself up

---

## Phase 1 — The Browser Reads index.html

The browser opens `index.html` and reads it top to bottom.

- It loads the CSS files (`main.css`, `mobile.css`, `evolution.css`)
- It creates all the HTML elements in memory — the buttons, the pet container,
  the overlays, the audio elements
- It finds this line near the bottom:

```html
<script type="module" src="./src/app.js"></script>
```

The `type="module"` part tells the browser: *download this file, but don't run it
until the HTML is fully parsed.* A regular script tag would run immediately and
crash because the buttons don't exist yet.

By the end of Phase 1, the DOM (the browser's live map of the page) is fully built.
Every button is a real object in memory.

---

## Phase 2 — app.js Downloads and Runs (Top to Bottom)

`app.js` uses `import` statements. Before running a single line, the browser
downloads every imported file:

| Import | What it provides |
|--------|-----------------|
| `Pet.js` | The Pet class — hunger, fun, sleep, power, evolve logic |
| `animRender.js` | Loads and displays 3D FBX models via Three.js |
| `animationConfig.js` | Maps each stage + action to the correct model file |
| `config.js` | Game constants — MAX_STAT, decay rates, stage messages |
| `audio.js` | `fadeOutBgMusic`, `playEvolutionSound` |
| `evolutionEffects.js` | Cyberpunk flash, mandala orb, glitch stutter, beam |
| `overlays.js` | Shows/hides the transcendence and game over overlays |
| `dropdown.js` | The info button in the top-right corner |
| `nameOverlay.js` | The "Name Your Pet" screen |
| `petChat.js` | Updates the chat message below the pet |
| `petContainer.js` | Restores the pet container on reset |
| `ui.js` | Finds and returns all the DOM elements (buttons, timers) |

Once everything is downloaded, `app.js` runs its own code top to bottom.
Here is what executes in order, and what is just being defined:

```
// 1. IMPORTS
//    Already handled above — files are downloaded and ready.

// 2. CONSTANTS
//    actionConfigs is created: a lookup table that maps
//    "feed" → { what to do, what animation to play, what message to show }
//    trainSoundCues is created: maps "red:train" → which .wav files fire at which ms
//    Nothing runs. These are just stored in memory.

// 3. DOM REFERENCES
//    feedButton, danceButton, sleepButton, trainButton are declared but EMPTY.
//    They're like labeled boxes with nothing in them yet.
//    They get filled in Phase 3.

// 4. STATE
//    The app's memory is initialized:
//    myPet = undefined (no pet yet)
//    gameStarted = false
//    currentStage = undefined
//    buttonTracker = { feed: false, dance: false, ... }
//    statTimers = { hunger: null, fun: null, ... }
//    etc.

// 5. FUNCTIONS
//    Every function is defined and stored in memory.
//    They are NOT called yet — just memorized.
//    This includes: handleCareAction, checkForEvolution, startGame,
//    resetGame, playDanceAction, playActionThenShareIdle,
//    triggerTranscendence, triggerIntergalacticBeam, and others.

// 6. INIT
//    window.addEventListener("DOMContentLoaded", ...) is REGISTERED.
//    The function inside is scheduled to run — but not yet.
```

At the end of Phase 2, the game knows everything it needs to know.
But nothing has happened. No pet exists. No buttons work. The screen just shows
the XENOCHI overlay.

---

## Phase 3 — DOMContentLoaded Fires

After all deferred scripts (modules) have finished running, the browser fires
the `DOMContentLoaded` event. Your registered listener runs.

This is where the game actually wires itself up:

```
initUI()             → fills feedButton, danceButton, sleepButton, trainButton,
                       hungerTimer, funTimer, sleepTimer, powerTimer,
                       btn (info button), menu, container

bg-music volume      → set to 0.15

initEffectElements() → the cyberpunk/glitch/transcendence effect system
                       caches its DOM references (glitch overlays, etc.)

setupDropdownMenu()  → the info button in the top-right corner becomes clickable

setupNameOverlay()   → the START GAME button on the opening overlay is wired:
                       clicking it shows the name input screen

care buttons wired   → FEED, DANCE, SLEEP, TRAIN each get their click handlers

START button wired   → clicking START plays the hatch animation, then calls startGame()

RESET button wired   → clicking RESET calls resetGame()

TRY AGAIN wired      → clicking TRY AGAIN (game over screen) calls resetGame()

PLAY AGAIN wired     → clicking PLAY AGAIN (transcendence screen) calls resetGame()
```

The game is now fully alive. The XENOCHI overlay is showing. The pet is inside the
egg (the colorful glitch animation). Everything is waiting for the user.

---

## Phase 4 — The User Plays

From here, everything is event-driven. Nothing runs unless the user does something.

**User clicks START GAME on the overlay**
→ `setupNameOverlay()` handles this → shows the name input screen

**User types a name and clicks CONFIRM**
→ `window.petName` is set → name overlay hides → page overlay hides
→ The XENOCHI screen is now fully visible

**User clicks START (the small button below the game)**
→ Hatch animation plays on the egg
→ `startGame()` runs:
  - Creates a new `Pet` instance with the chosen name
  - Sets `currentStage = "blue"`
  - Loads `blue_happy_idle.fbx` via `loadAndDisplayFBX()`
  - Starts four stat timers (hunger, fun, sleep, power decay every 12 seconds)
  - Sets `gameStarted = true`
  - Updates the pet chat with the blue stage message

**User clicks FEED / DANCE / SLEEP / TRAIN**
→ `handleCareAction(actionName)` runs:
  - Checks the game has started and no other action is in progress
  - Calls the pet method (`myPet.feed()`, etc.) to update stats
  - Updates the pet chat with the action message
  - Plays the glitch stutter flash
  - Loads and plays the action animation via `playActionThenShareIdle()`
  - After the animation, checks `checkForEvolution()`

**Evolution threshold reached**
→ `checkForEvolution()` triggers `myPet.evolveToNextStage()`
→ `triggerCyberpunkEvolutionEffect()` fires (6 second radial burst)
→ New stage model loads (yellow, green, red, or white)

**White stage — both DANCE and TRAIN completed**
→ `triggerTranscendence()` runs:
  - Fades out background music
  - Plays space_engine.wav, transcend_3.wav, transcend_4.wav
  - `triggerMysticalTranscendence()` shows the mandala orb (16 seconds)
  - `triggerIntergalacticBeam()` sweeps a light beam across the screen
  - Pet container fades to opacity 0 (the cat disappears)
  - `showTranscendenceWithName()` shows the TRANSCENDENCE overlay

**Stat hits 0 or 10 (neglect)**
→ `Pet.triggerGameOver()` runs
→ Death animation plays (`cat_dies.fbx`, `yellow_dies.fbx`, etc.)
→ `showGameOverOverlay()` shows the GAME OVER screen

---

## The One Rule Worth Memorizing

> **Functions are defined in Phase 2. They run in Phase 3 and 4.**

When you're reading `app.js` and see a function defined near the top,
it isn't doing anything yet. It's just being stored. The actual work
happens later, when something calls it.

---

## File Map (where to look for what)

| You want to understand... | Look in... |
|--------------------------|-----------|
| Stat decay, death, evolution logic | `src/core/Pet.js` |
| How 3D models load and animate | `src/animRender.js` |
| Which model plays for which action | `src/animationConfig.js` |
| Game constants (timers, thresholds) | `src/core/config.js` |
| The cyberpunk flash, mandala orb, glitch | `src/effects/evolutionEffects.js` |
| Music fading | `src/effects/audio.js` |
| The overlays (game over, transcendence) | `src/ui/overlays.js` |
| The pet chat messages | `src/ui/petChat.js` |
| How buttons and DOM refs are found | `src/ui/ui.js` |
| The main wiring and game flow | `src/app.js` |
| The battle arena (Easter egg) | `src/battle/` |

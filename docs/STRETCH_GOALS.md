# Stretch Goals & Future Enhancements

## High Priority - Playability Improvements

### Save/Load System (2-3 hours)

- **Goal:** Prevent players from losing progress on refresh
- **Implementation:** localStorage to save pet state, stats, evolution stage
- **Details:**
  - Save on every stat change and evolution
  - Auto-save every 30 seconds
  - Load on game start
  - Add "Continue" vs "New Game" option

### Pause Button (1-2 hours)

- **Goal:** Allow players to pause without pet dying
- **Implementation:**
  - Add pause button to UI
  - Stop all stat decay timers
  - Pause animations
  - Dim screen with "PAUSED" overlay
  - Resume on unpause

### Production Timer Values (30 minutes)

- **Goal:** Set realistic stat degradation speeds (current 30s timers are for testing)
- **Implementation:**
  - Review and set proper timer values per stage
  - Balance difficulty curve
  - Consider different modes (Chill/Normal/Hardcore)

### Critical Stat Warnings (1-2 hours)

- **Goal:** Visual feedback when stats are dangerously low
- **Implementation:**
  - Stat bars pulse red when < 20%
  - Pet animation changes (looks weak/tired)
  - Screen edge vignette effect
  - Audio cue (optional)

---

## Medium Priority - Content & Polish

### Dynamic Backgrounds (1-2 hours)

- **Goal:** Change background per evolution stage for visual variety
- **Options:**
  - Background per stage (5 backgrounds)
  - Background every 2 stages (3 backgrounds)
  - Phased backgrounds (Early/Middle/Transcendence)
- **Implementation:**
  - Layer behind or replace sine wave
  - Fade transition on evolution
  - Store backgrounds in `/images/backgrounds/`

### Branching Evolution Paths (4-6 hours)

- **Goal:** Add choice and replayability with alternate evolution branches
- **Current:** Linear path (Blue → Yellow → Green → Red → White)
- **Proposed:** Branch at Stage 3
  - Path A: Green → Red → White (current aggressive path)
  - Path B: Green → Cyan → White (new calm/peaceful path)
- **Implementation:**
  - Add 2+ colored cat models (you mentioned having 4 more available)
  - Player choice at evolution (which stat to prioritize)
  - Different animations/personality per path
  - Unique transcendence ending per path

### Random Events (3-4 hours)

- **Goal:** Break monotony with surprise moments
- **Examples:**
  - Comet passing → temporary stat boost
  - Solar flare → stats decay faster for 30s
  - "Visitor" appears → bonus fun/interaction
  - Lucky food → double hunger restoration
- **Implementation:**
  - Random chance every 2-5 minutes
  - Visual effects (particles, screen flash)
  - Chat message announces event

### Training Mini-Game (5-8 hours)

- **Goal:** Make training interactive instead of just clicking
- **Options:**
  - Rhythm game (hit beats)
  - Quick Time Events (press buttons in sequence)
  - Balance mechanic (keep indicator in zone)
- **Benefits:**
  - More engaging gameplay
  - Skill-based rewards
  - Differentiate from other care actions

---

## Lower Priority - Technical Improvements

### WebGL Fallback Message (30 minutes)

- **Goal:** Graceful error if browser doesn't support Three.js
- **Implementation:**
  - Detect WebGL support on load
  - Show friendly error message
  - Suggest compatible browsers

### Performance Optimization (2-3 hours)

- **Areas to profile:**
  - FBX model loading/switching (preload all stages?)
  - Sine wave canvas animation (reduce draw calls?)
  - Audio management (lazy load or audio sprites?)
- **Tools:**
  - Chrome DevTools Performance tab
  - Three.js stats.js library
  - Lighthouse audit

### Mobile Responsiveness (8-12 hours)

- **Goal:** Make game playable on phones/tablets
- **Challenges:**
  - Touch controls
  - Portrait vs landscape
  - Performance on mobile GPUs
- **Deferred until:** After responsive redesign (see SCALING_APPROACHES.md)

---

## Advanced Features - Post-Launch

### New Game+ Mode (2-3 hours)

- **Goal:** Reward players who transcend with harder challenge
- **Features:**
  - Faster stat decay
  - Higher evolution thresholds
  - Exclusive cosmetic rewards
  - Prestige counter

### Achievement System (4-6 hours)

- **Examples:**
  - "First Steps" - Hatch your first pet
  - "Balanced Life" - Keep all stats above 50% for 5 minutes
  - "Speed Runner" - Reach White in under X minutes
  - "Perfectionist" - Never let any stat drop below 80%
- **Implementation:**
  - Track conditions in game state
  - Visual popup on unlock
  - Achievement gallery UI

### Multiplayer Features (20+ hours)

- **Ideas:**
  - Visit friends' pets
  - Send gifts (stat boosts)
  - Compare evolution times
  - Co-op training sessions
- **Complexity:** Requires backend (Firebase/Supabase)

### Procedural Pet Variations (8-12 hours)

- **Goal:** Unique pets beyond just color
- **Features:**
  - Pattern overlays (spots, stripes, gradients)
  - Size variations
  - Accessory unlocks (hats, auras, effects)
- **Implementation:**
  - Shader modifications
  - Texture layering
  - Random generation on hatch

---

## Second Game Integration

### Easter Egg Unlock (1-2 hours)

- **Goal:** Unlock second game after transcending
- **Implementation:**
  - Show "???" button after first win
  - Click reveals second game
  - Separate game mode or full new game?

---

## Priority Order Recommendation

**Phase 1 - Essential Playability (4-8 hours total):**

1. Save/Load system ✅
2. Pause button ✅
3. Production timer values ✅
4. Critical stat warnings ✅

**Phase 2 - Content Variety (5-10 hours total):** 5. Dynamic backgrounds 6. Branching evolution (add alternate cats) 7. Random events

**Phase 3 - Polish & Features (6-12 hours total):** 8. Training mini-game 9. New Game+ mode 10. Achievement system

**Phase 4 - Technical Debt:** 11. Performance optimization 12. WebGL fallback 13. Mobile responsiveness (after responsive redesign)

---

## Notes

- **Timer values:** Current 30-second timers are for testing only
- **Available assets:** 4 additional colored cat models ready to integrate
- **Second game:** Planned to be added after core improvements
- **Responsive redesign:** See `SCALING_APPROACHES.md` - deferred until post-launch

# Refactoring Log

## Overview

This document tracks the modularization and refactoring progress for the Transcendence 3D project.

## Completed Refactoring

### Phase 1: Module Organization (Completed)

**Date:** November 16, 2025

Created organized folder structure:

- `modules/core/` - Core game logic and configuration
- `modules/pet/` - Pet-related functionality
- `modules/ui/` - UI components and interactions
- `modules/effects/` - Visual and audio effects
- `modules/utils/` - Utility functions

### Phase 2: Code Extraction (Completed)

**Status:** ✅ **STOPPED at safe extraction limit**  
**Total Reduction:** ~215 lines removed from app.js (~8% reduction)

#### Completed Extractions:

1. **modules/core/config.js** (~60 lines)

   - `gameSettings` - Game configuration constants
   - `stageMap` - Evolution stage definitions
   - `stageEmojis` - Stage emoji mappings
   - `timerMap` - Timer configurations
   - `STAT_TYPES` - Stat type array
   - `danceMap`, `trainMap` - Action mappings
   - `danceIndices`, `trainIndices` - Action indices

2. **modules/effects/audio.js** (~20 lines)

   - `fadeOutBgMusic()` - Fade background music
   - `playEvolutionSound()` - Play evolution sound effect
   - `playSound()` - Generic sound playback

3. **modules/ui/overlays.js** (~60 lines)

   - `showTranscendenceOverlay()` - Show transcendence screen
   - `showGameOverOverlayLoss()` - Show game over (loss)
   - `showGameOverOverlay()` - Show game over (generic)
   - `hidePageOverlay()` - Hide page overlay
   - `showNameOverlay()` - Show name input overlay
   - `hideNameOverlay()` - Hide name overlay

4. **modules/ui/dropdown.js** (~15 lines)

   - `setupDropdownMenu()` - Initialize info dropdown menu

5. **modules/ui/nameOverlay.js** (~50 lines)

   - `setupNameOverlay()` - Handle pet naming screen interactions
   - Manages welcome → name input → egg flow
   - **Fixed:** Music continuity (no longer restarts on overlays)

6. **modules/ui/petChat.js** (~10 lines)

   - `updatePetChat()` - Update pet chat message display

7. **modules/ui/eggAnimation.js** (~20 lines)

   - `hideGlitchEgg()` - Egg hatching animation

8. **modules/ui/petContainer.js** (~20 lines)
   - `restorePetContainer()` - Restore/ensure pet container visibility

#### Failed Extraction (Reverted):

**modules/pet/Pet.js** - Pet class extraction  
**Status:** ❌ **FAILED** - Reverted via `git stash`

**Issues Encountered:**

- Care buttons stopped working
- Stat timers not running
- Evolution system broken
- Global state dependencies too complex (`currentStage`, `gameOverTriggered`, `animationConfig`, `loadAndDisplayFBX`, etc.)

**Lesson Learned:** Pet class is too tightly coupled with global state and app.js logic to extract without major architectural refactoring.

#### Reorganized Modules:

- `modules/state.js` → `modules/core/state.js`
- `modules/ui.js` → `modules/ui/ui.js`
- `modules/spectralSineWave.js` → `modules/effects/spectralSineWave.js`

### Code Reduction

- **app.js**: Reduced by ~215 lines (from ~2625 to ~2410 lines)
- **Improvement**: ~8% reduction with better code organization
- **Zero breaking changes** after Pet class reversion

### Other Improvements

- Lowered background music volume from 0.8 to 0.3 for better user experience
- Fixed music continuity: no longer restarts when clicking through overlays
- Removed duplicate event listeners that were causing music issues
- Added safety checks in care action handlers (`!myPet` check)

## Why We Stopped Extracting

### Decision Rationale

After 8 successful extractions and 1 failed attempt (Pet class), we've reached the safe extraction limit. Further modularization is not recommended without major architectural changes.

### Reasons to Stop:

1. **Pet Class Extraction Failed**

   - Too tightly coupled with global state
   - Depends on: `currentStage`, `gameOverTriggered`, `animationConfig`, `loadAndDisplayFBX`, `buttonTracker`, etc.
   - Multiple attempts to fix with `window` globals unsuccessful
   - Breaking changes: care buttons, stat timers, evolution system all stopped working

2. **Remaining Code is Highly Interdependent**

   - Game loop, animation system, and pet logic are deeply intertwined
   - Cannot extract one without refactoring all of them
   - Incremental extraction would introduce high risk of bugs

3. **Global State Management Required**
   - Current architecture relies heavily on global variables and `window` object
   - Clean module separation requires a proper state management system
   - This is a major refactoring, not an incremental extraction

### What Would Be Needed for Further Modularization:

To continue safely, the project would need:

1. **State Management System**

   - Central `GameState` class or store
   - Eliminate global variables
   - Proper state subscription/notification pattern

2. **Dependency Injection**

   - Pass dependencies explicitly rather than relying on globals
   - Pet class should receive all needed services as constructor parameters

3. **Event/Messaging System**

   - Decouple modules via events instead of direct function calls
   - Reduce tight coupling between game loop, animations, and pet logic

4. **Major Refactoring Effort**
   - Not incremental - would require significant changes across entire codebase
   - High risk of introducing bugs
   - Would need comprehensive testing

### Recommendation:

**Accept current progress as successful incremental improvement.** The 8 extracted modules reduce app.js by ~8% with zero breaking changes. Further extraction requires architectural redesign, not incremental refactoring.

## Known Issues

### Bug: Pet Chat Shows "undefined is evolving"

**Status:** Identified, fix deferred
**Issue:** Pet name displays as "undefined" in chat messages during evolution
**Location:** Pet chat display logic
**Priority:** Medium (cosmetic issue, doesn't break gameplay)
**Fix Plan:** Will address after completing current refactoring phase

## Next Steps

### Immediate Priorities:

✅ **All safe extractions completed**  
✅ **Refactoring phase complete**

### Future Work (Requires Major Refactoring):

These items **cannot be safely extracted** without architectural changes:

- **Pet Class** - Requires state management system and dependency injection
- **Animation System** - Tightly coupled with game loop and Pet class
- **Game Loop** - Central to all game logic, needs event/messaging system
- **Evolution System** - Intertwined with Pet class and global state

### Alternative Improvements:

- **CSS Modularization** - Safe to pursue independently (see CSS_MODULARIZATION_PLAN.md)
- **Documentation** - Add JSDoc comments, API documentation
- **Testing** - Add unit tests for extracted modules
- **Performance** - Profile and optimize without structural changes

## Testing Status

✅ All extractions tested via Vite dev server  
✅ No breaking changes introduced  
✅ Dropdown menu working  
✅ Name overlay flow working  
✅ Background music volume working  
✅ Pet chat updates working (except name bug)

## Git Commit History

1. `Refactor: organize modules into folders and extract reusable code` - Initial structure + config/audio/overlays
2. `Extract dropdown menu to modules/ui/dropdown.js` - Dropdown extraction
3. `Extract name overlay to modules/ui/nameOverlay.js` - Name overlay extraction
4. `Lower background music volume to 0.3` - Audio improvement
5. `Extract updatePetChat to modules/ui/petChat.js` - Chat helper extraction
6. `Extract hideGlitchEgg to modules/ui/eggAnimation.js` - Egg animation extraction
7. `Extract restorePetContainer to modules/ui/petContainer.js` - Pet container helper
8. `Fix music continuity - prevent restart on overlay transitions` - Music bug fix

**Unpushed commits:** 5 commits ready to push  
**Stashed changes:** 1 (failed Pet class extraction - preserved for reference)

## Methodology

- **Incremental approach**: Extract small, self-contained functions first
- **Test after each change**: Use Vite dev server + Simple Browser
- **Commit frequently**: One commit per extraction for easy rollback
- **Avoid risky changes**: Defer complex extractions (Pet class, game loop, animations)

## Success Metrics

✅ **Zero breaking changes** (after Pet class reversion)  
✅ **Improved code organization** - 8 new focused modules  
✅ **Smaller main app.js file** - 8% reduction (~215 lines)  
✅ **Better separation of concerns** - UI, audio, config clearly separated  
✅ **Easier future maintenance** - Smaller, focused files  
✅ **No functionality lost** - All features working as before  
✅ **Music UX improved** - Better volume, no restarts

## Conclusion

**Phase 2 is complete.** We successfully extracted 8 self-contained modules with zero breaking changes. The failed Pet class extraction revealed the architectural limits of incremental refactoring. Further modularization requires major state management refactoring, which is beyond the scope of incremental extraction. Current progress represents a successful, safe improvement to code organization.

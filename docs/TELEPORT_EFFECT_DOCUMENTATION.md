# Teleport Effect Documentation

## Overview

The teleport effect creates a vibrant, multi-layered visual flash when the user clicks action buttons (FEED, DANCE, SLEEP, TRAIN). It consists of three concentric colored rings that pulse and fade with spectral color warping.

---

## File Locations

### JavaScript (app.js)

**Primary Function:** `triggerGlitchTransitionFlash()`

- **Location:** Lines 1536-1660
- **Called by:** `triggerGlitchStutter()` (Line 1708)
- **Trigger:** `playAnimationWithStutterMask()` (Line 1713)

**Related Helper:**

- `triggerGlitchStutter()` - Line 1708 (wrapper function)
- `playAnimationWithStutterMask()` - Line 1712 (animation handler)

### CSS (main.css)

**Layer Styles:**

- `.stutter-scanlines` - Lines 2062-2086 (outer magenta/purple layer)
- `.stutter-static` - Lines 2088-2098 (middle cyan/blue layer)
- `.stutter-flash` - Lines 2100-2115 (inner yellow/orange core)

**Animations:**

- `@keyframes scanlinesWarp` - Lines 2318-2322 (magenta hue-rotate animation)
- `@keyframes staticWarp` - Lines 2324-2328 (cyan hue-rotate animation)
- `@keyframes flashWarp` - Lines 2330-2335 (yellow hue-rotate animation)
- `@keyframes teleportPulse` - Lines 2302-2313 (scale pulse animation)

**Container Styles:**

- `#glitchOverlay` - Lines 2910-2918 (parent container)
- `#glitchOverlay.active` - Lines 2920-2923 (active state)

---

## Effect Structure

### Three Concentric Layers

1. **Outer Layer (100% size)** - Magenta/Purple Scanlines
   - Pure magenta spectrum (#ff00ff, #ff00ea, #b000ff, #d400ff)
   - Repeating horizontal gradient stripes
   - Screen blend mode
   - Saturate(3), Brightness(2)
   - Rotated -3 degrees
2. **Middle Layer (70% size)** - Cyan/Blue Gradient

   - Pure cyan spectrum (#00ffff, #00d4ff, #0080ff, #00fff7)
   - Diagonal gradient (135deg)
   - Screen blend mode
   - Saturate(3), Brightness(2)
   - Translated up 3px

3. **Inner Core (40% size)** - Yellow/Orange Radial
   - Pure yellow/orange spectrum (#ffff00, #ffe600, #ffaa00, #ff8800)
   - Radial gradient from center
   - Screen blend mode
   - Saturate(3), Brightness(2.5)
   - Rotated +3 degrees, translated down 3px

---

## Technical Details

### Timing

- **Initial Flash:** 320ms (configurable via `duration` parameter)
- **Fade Out:** 600ms smooth transition
- **Total Effect:** ~920ms from trigger to complete

### Color Warping

Each layer independently cycles through the color spectrum:

- **Scanlines:** 1.2s cycle (0-360deg hue rotation)
- **Static:** 2.2s cycle (slower warping)
- **Flash:** 1.7s cycle (fastest warping with saturation pulses)

### Pulse Animation

All layers use staggered `teleportPulse` animation:

- Scanlines: 0s delay
- Static: 0.04s delay
- Flash: 0.08s delay
- Effect: Creates rippling wave motion

### Positioning

- **Container:** Centered at 50% horizontal, 60% vertical
- **Size:** Based on cat model dimensions
  - Width: `catData.width * 1.2`
  - Height: `catData.height * 1.0`
- **Shape:** 50% border-radius (oval)

---

## Key Parameters (Adjustable)

### In app.js (Line 1560-1563):

```javascript
const width = catData.width * 1.2; // Size multiplier
const height = catData.height * 1;
glitchOverlay.style.top = "60%"; // Vertical position
```

### Layer Scales (Lines 1581-1599):

```javascript
scanlines: scale(1.0) rotate(-3deg)
staticEl:  scale(0.7) translateY(-3px)
flash:     scale(0.4) rotate(3deg) translateY(3px)
```

### Parent Filter (Lines 1606-1610):

```javascript
saturate(400%)
brightness(250%)
contrast(150%)
```

---

## Spectral Colors

### Scanlines (Magenta):

- Base: #ff00ff (pure magenta)
- Variants: #ff00ea, #b000ff, #d400ff
- No transparency - solid color stripes

### Static (Cyan):

- Base: #00ffff (pure cyan)
- Variants: #00d4ff, #0080ff, #00fff7
- Diagonal gradient across full layer

### Flash (Yellow):

- Base: #ffff00 (pure yellow)
- Variants: #ffe600, #ffaa00, #ff8800
- Radial gradient from center outward

---

## Transcendence Ending Effect

### Primary Function: `triggerMysticalTranscendence()`

**Location:** app.js Lines 1409-1523

### Visual Elements:

- **Element:** `#transcendenceEffect` with `.radial-burst-ring` child
- **Duration:** 16,500ms (extended 50% from original)
- **Size:** `max(catData.width, catData.height) * 1.55`
- **Position:** Centered at 50% horizontal, `calc(50% + 40px)` vertical

### Color Phases (20-phase cycle):

1. **Phase 0:** Divine white-gold (subtle start)

   - Blur: 2px, Brightness: 90%, Saturate: 110%
   - Drop-shadows: Purple (#6108ba) + Gold (#ffd700)

2. **Phase 1:** Pink-purple mystical

   - Blur: 1.8px, Brightness: 100%, Saturate: 130%
   - Drop-shadows: Hot pink + Blueviolet

3. **Phase 2:** Indigo cosmic

   - Blur: 1.5px, Brightness: 110%, Saturate: 150%
   - Drop-shadows: Indigo + Blueviolet

4. **Phase 3:** Sky blue ethereal

   - Blur: 1.3px, Brightness: 130%, Saturate: 180%
   - Drop-shadows: Deep sky blue + Dark violet

5. **Phase 4:** Golden divine
   - Blur: 1px, Brightness: 150%, Saturate: 200%
   - Drop-shadows: Gold + White

### CSS Styles:

- `#transcendenceEffect` - Lines 2950-2959 (container)
- `.radial-burst-ring` - Lines 2961-2978 (animated mandala ring)
- `@keyframes transcendenceRadialBurst` - Lines 2980-3009 (rotation + scale animation)

### Integration with Beam Effect:

- **Beam Duration:** 9000ms
- **Beam Start:** 1000ms after transcendence trigger
- **Mystical End:** 3ms before beam completes
- **Total Sequence:** ~10 seconds

---

## Audio Integration

- **File:** `stutterMask.wav`
- **Volume:** 0.3
- **Triggered:** Same moment as visual effect
- **Location:** app.js Line 1542-1549

---

## Usage Example

```javascript
// Triggered on every action button click
triggerGlitchStutter(320); // 320ms duration

// Which calls:
triggerGlitchTransitionFlash(320);
```

---

## Performance Notes

- Uses CSS animations (GPU accelerated)
- Screen blend mode for additive color mixing
- No canvas/WebGL - pure DOM + CSS
- Smooth 60fps performance
- Minimal memory footprint

# Battle Scenes Documentation

This folder contains documentation for studying the Battle Arena scenes in the Transcendence-3D project.

## Overview

The Battle Arena module (`/src/battle/`) contains three interactive 3D scenes built with React Three Fiber (R3F), a React renderer for Three.js.

## File Structure

```
src/battle/
├── BattleArena.jsx          # Main controller - scene routing & state management
├── BattleArena.scss         # Styles for main arena container
├── Scene2/
│   ├── Scene2FightingArena.jsx  # Cyberpunk arena scene
│   └── Scene2.scss
└── Scene3/
    ├── Scene3TrainingDojo.jsx   # Training dojo with lanterns & cherry blossoms
    └── Scene3.scss
```

## Documentation Files

1. **[COMPONENT_HIERARCHY.md](./COMPONENT_HIERARCHY.md)** - Visual tree of all components and their relationships
2. **[BATTLEARENA_EXPLAINED.md](./BATTLEARENA_EXPLAINED.md)** - Full breakdown of BattleArena.jsx (the main controller)
3. **[SCENE3_EXPLAINED.md](./SCENE3_EXPLAINED.md)** - Full breakdown of Scene3TrainingDojo.jsx
4. **[REACT_THREE_FIBER_BASICS.md](./REACT_THREE_FIBER_BASICS.md)** - Core R3F concepts used in this project

## Quick Reference

### Key Technologies

| Technology        | Purpose                     |
| ----------------- | --------------------------- |
| React Three Fiber | React renderer for Three.js |
| drei              | Helper library for R3F      |
| Three.js          | 3D graphics library         |
| SCSS              | Styling with BEM naming     |

### Important Hooks

- `useFrame` - Animation loop (runs every frame)
- `useLoader` - Load 3D models (FBX)
- `useRef` - Reference Three.js objects
- `useMemo` - Memoize expensive operations

## How to Study

1. Start with **COMPONENT_HIERARCHY.md** to understand the big picture
2. Read **REACT_THREE_FIBER_BASICS.md** if unfamiliar with R3F
3. Study **BATTLEARENA_EXPLAINED.md** to understand state flow
4. Dive into **SCENE3_EXPLAINED.md** for the 3D scene details

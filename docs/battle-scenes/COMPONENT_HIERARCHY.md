# Component Hierarchy

## Visual Tree

```
BattleArena.jsx (Main Controller)
│
├── Scene 1: Walking Cats (default)
│   ├── <Canvas>
│   │   ├── ambientLight
│   │   ├── directionalLight
│   │   ├── mesh (floor plane)
│   │   ├── Grid
│   │   ├── Character (green)
│   │   ├── Character (red)
│   │   └── OrbitControls
│   └── HTML Overlays
│       ├── battle-arena__header (title)
│       ├── battle-arena__controls-wrapper
│       └── SceneSelector (dropdown)
│
├── Scene 2: Fighting Arena
│   └── Scene2FightingArena (separate component)
│
└── Scene 3: Training Dojo
    ├── CherryBlossomCanvas (2D canvas overlay)
    │   └── 60 Petal objects (vanilla JS class)
    │
    ├── <Canvas>
    │   └── Scene3TrainingDojo
    │       ├── PanoramicBackground (spherical sky)
    │       ├── Lights (ambient + 2 directional)
    │       ├── DojoMat
    │       │   ├── Floor plane
    │       │   ├── Circular mat (cylinder)
    │       │   └── GradientRing (animated shader)
    │       ├── CenterMarker (gold ring)
    │       ├── TrainingPole × 3
    │       │   ├── Bamboo pole (cylinder)
    │       │   ├── Bamboo rings × 6 (torus)
    │       │   └── JapaneseLantern
    │       │       ├── Rope (cylinder)
    │       │       ├── Top cap (cylinder)
    │       │       ├── Flame (sphere, glowing)
    │       │       ├── Paper body (cylinder, emissive)
    │       │       ├── Bands × 2 (torus)
    │       │       ├── Bottom cap (cylinder)
    │       │       └── pointLight
    │       ├── Grid
    │       ├── TrainingCat × 3 (FBX models)
    │       └── OrbitControls
    │
    └── HTML Overlays
        ├── scene3__header (title)
        ├── scene3__controls-wrapper
        └── SceneSelector (dropdown)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     BattleArena.jsx                         │
│                                                             │
│  State:                                                     │
│  ├── currentScene (1, 2, or 3)                              │
│  ├── scene3AutoAnimate (boolean)                            │
│  ├── scene3ResetKey (number)                                │
│  ├── greenMoving, greenDirection                            │
│  ├── redMoving, redDirection                                │
│  └── blueMoving, blueDirection                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              handleAutoAnimateChange()               │    │
│  │  - Sets scene3AutoAnimate                            │    │
│  │  - Increments scene3ResetKey when enabled            │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │               Scene3TrainingDojo                     │    │
│  │                                                      │    │
│  │  Props received:                                     │    │
│  │  ├── autoAnimate                                     │    │
│  │  ├── greenMoving, greenDirection                     │    │
│  │  ├── redMoving, redDirection                         │    │
│  │  ├── blueMoving, blueDirection                       │    │
│  │  └── resetKey ─────────────────────┐                 │    │
│  │                                    ▼                 │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │             TrainingCat                       │   │    │
│  │  │  useEffect([resetKey]) → reset position       │   │    │
│  │  │  useEffect([autoAnimate]) → pause/play anim   │   │    │
│  │  │  useFrame() → update mixer, handle movement   │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## File Imports

```javascript
// BattleArena.jsx imports:
import Scene2FightingArena from './Scene2/Scene2FightingArena';
import Scene3TrainingDojo, { CherryBlossomCanvas } from './Scene3/Scene3TrainingDojo';

// Scene3TrainingDojo.jsx exports:
export function CherryBlossomCanvas()  // Named export (2D overlay)
export default function Scene3TrainingDojo()  // Default export (3D scene)
```

## Key Relationships

| Parent             | Child               | Relationship                             |
| ------------------ | ------------------- | ---------------------------------------- |
| BattleArena        | Scene3TrainingDojo  | Props: autoAnimate, movements, resetKey  |
| BattleArena        | CherryBlossomCanvas | Sibling to Canvas (outside R3F)          |
| Scene3TrainingDojo | TrainingCat × 3     | Each cat receives its own movement props |
| TrainingPole       | JapaneseLantern     | Nested at top of pole                    |
| JapaneseLantern    | pointLight          | Light source for glow effect             |

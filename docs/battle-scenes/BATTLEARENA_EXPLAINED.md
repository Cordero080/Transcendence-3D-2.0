# BattleArena.jsx Explained

The main controller component that manages scene switching and state for all battle scenes.

## File Location

`/src/battle/BattleArena.jsx`

---

## Imports Breakdown

```jsx
import React, { useRef, useState, useEffect, Suspense, useMemo } from "react";
```

- `useState` - Manage component state (current scene, movement flags)
- `useEffect` - Set up keyboard listeners
- `Suspense` - Show fallback while 3D models load
- `useMemo` - Memoize cloned 3D models

```jsx
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
```

- `Canvas` - Creates WebGL renderer and Three.js scene
- `useFrame` - Animation loop hook (runs every frame ~60fps)
- `useLoader` - Load external assets (FBX files)

```jsx
import { OrbitControls, Grid, Html } from "@react-three/drei";
```

- `OrbitControls` - Mouse-based camera rotation/zoom
- `Grid` - Visual grid helper
- `Html` - Render HTML inside 3D scene

```jsx
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
```

- `FBXLoader` - Load FBX 3D model files
- `THREE` - Three.js core library
- `SkeletonUtils` - Clone animated models properly (preserves skeleton)

```jsx
import Scene2FightingArena from "./Scene2/Scene2FightingArena";
import Scene3TrainingDojo, {
  CherryBlossomCanvas,
} from "./Scene3/Scene3TrainingDojo";
```

- Sub-scene components
- `CherryBlossomCanvas` is a named export (2D overlay used outside R3F Canvas)

---

## State Management

```jsx
// Scene selection
const [currentScene, setCurrentScene] = useState(1);

// Scene 1 movement controls
const [walking, setWalking] = useState(false);
const [retreating, setRetreating] = useState(false);
const [movingUp, setMovingUp] = useState(false);
const [movingDown, setMovingDown] = useState(false);

// UI state
const [controlsOpen, setControlsOpen] = useState(false);
const [sceneSelectorOpen, setSceneSelectorOpen] = useState(false);

// Scene 3 specific controls
const [scene3AutoAnimate, setScene3AutoAnimate] = useState(true);
const [scene3ResetKey, setScene3ResetKey] = useState(0); // Triggers position reset
const [greenMoving, setGreenMoving] = useState(false);
const [greenDirection, setGreenDirection] = useState(0); // -1 left, 0 stopped, 1 right
// ... similar for red and blue cats
```

### Reset Key Pattern

```jsx
const handleAutoAnimateChange = (enabled) => {
  setScene3AutoAnimate(enabled);
  if (enabled) {
    // Increment key to trigger useEffect in TrainingCat
    setScene3ResetKey((prev) => prev + 1);
  }
};
```

**Why use a "key" pattern?**

- When `resetKey` changes, `useEffect` in TrainingCat runs
- This resets cat positions without unmounting/remounting components
- More performant than recreating entire components

---

## Keyboard Event Handling

```jsx
useEffect(() => {
  function handleKeyDown(e) {
    // Scene 1 controls
    if (e.code === "Space") {
      e.preventDefault(); // Prevent page scroll
      setWalking(true);
    }

    // Scene 3 controls (only when manual mode)
    if (currentScene === 3 && !scene3AutoAnimate) {
      if (e.code === "KeyQ") {
        setGreenMoving(true);
        setGreenDirection(-1); // Move left
      }
      if (e.code === "KeyE") {
        setGreenMoving(true);
        setGreenDirection(1); // Move right
      }
      // ... arrow keys for red, Z/C for blue
    }
  }

  function handleKeyUp(e) {
    // Reset movement state when key released
    if (e.code === "KeyQ" || e.code === "KeyE") {
      setGreenMoving(false);
      setGreenDirection(0);
    }
  }

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  // Cleanup function
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  };
}, [currentScene, scene3AutoAnimate]); // Re-run when these change
```

---

## Scene Rendering (Conditional)

```jsx
// Scene 2
if (currentScene === 2) {
  return (
    <div className="battle-arena__container">
      <Scene2FightingArena />
      <SceneSelector />
    </div>
  );
}

// Scene 3
if (currentScene === 3) {
  return (
    <div className="scene3__container">
      {/* 2D overlay - OUTSIDE Canvas */}
      <CherryBlossomCanvas />

      {/* 3D scene */}
      <Canvas camera={{ position: [0, 8, 15], fov: 50 }}>
        <Suspense fallback={<Loader />}>
          <Scene3TrainingDojo
            autoAnimate={scene3AutoAnimate}
            greenMoving={greenMoving}
            greenDirection={greenDirection}
            redMoving={redMoving}
            redDirection={redDirection}
            blueMoving={blueMoving}
            blueDirection={blueDirection}
            resetKey={scene3ResetKey}
          />
        </Suspense>
      </Canvas>

      {/* HTML overlays */}
      <div className="scene3__header">...</div>
      <div className="scene3__controls-wrapper">...</div>
      <SceneSelector />
    </div>
  );
}

// Scene 1 (default)
return (
  <div className="battle-arena__container">
    <Canvas camera={{ position: [0, 3, 28], fov: 45 }}>
      {/* ... Scene 1 content */}
    </Canvas>
  </div>
);
```

---

## Character Component (Scene 1)

```jsx
function Character({
  url, // Path to FBX file
  position, // [x, y, z]
  color, // Material color
  isWalking, // Trigger animation
  walkDirection, // -1, 0, or 1
  zDirection, // -1, 0, or 1
  scale, // Model scale
  rotationY, // Y-axis rotation
}) {
  const groupRef = useRef();
  const mixerRef = useRef();
  const fbx = useLoader(FBXLoader, url); // Load FBX model

  // Clone model with proper skeleton handling
  const model = useMemo(() => {
    const clone = SkeletonUtils.clone(fbx);
    clone.scale.set(scale, scale, scale);
    // Apply material to all meshes
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: color,
          metalness: 0.3,
          roughness: 0.7,
        });
      }
    });
    return clone;
  }, [fbx, color, scale]);

  // Setup animation
  useEffect(() => {
    if (fbx.animations?.length > 0 && model) {
      mixerRef.current = new THREE.AnimationMixer(model);
      actionRef.current = mixerRef.current.clipAction(fbx.animations[0]);
      actionRef.current.play();
    }
  }, [fbx, model]);

  // Control animation playback
  useEffect(() => {
    if (actionRef.current) {
      actionRef.current.paused = !isWalking;
    }
  }, [isWalking]);

  // Animation loop - runs every frame
  useFrame((state, delta) => {
    // Update animation mixer
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    // Move character
    if (isWalking && groupRef.current && walkDirection !== 0) {
      groupRef.current.position.x += 0.02 * walkDirection;
    }
    if (isWalking && groupRef.current && zDirection !== 0) {
      groupRef.current.position.z += 0.02 * zDirection;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]}>
      <primitive object={model} />
    </group>
  );
}
```

---

## SceneSelector Component

```jsx
const SceneSelector = () => (
  <div className="scene-selector">
    <button
      className={`scene-selector__toggle ${sceneSelectorOpen ? "scene-selector__toggle--open" : ""}`}
      onClick={() => setSceneSelectorOpen(!sceneSelectorOpen)}
    >
      <span>Scene {currentScene}</span>
      <span className="scene-selector__icon">
        {sceneSelectorOpen ? "▲" : "▼"}
      </span>
    </button>

    {sceneSelectorOpen && (
      <div className="scene-selector__dropdown">
        <button
          className={getButtonClass(1, "green")}
          onClick={() => {
            setCurrentScene(1);
            setSceneSelectorOpen(false);
          }}
        >
          Scene 1
        </button>
        {/* ... buttons for scenes 2 and 3 */}
      </div>
    )}
  </div>
);
```

---

## Key Patterns Used

1. **Conditional Rendering** - Different JSX returned based on `currentScene`
2. **Lifting State Up** - Movement state lives in parent, passed to children as props
3. **Reset Key Pattern** - Trigger child effects by incrementing a key value
4. **Suspense Boundary** - Show loading UI while FBX models load
5. **Event Listener Cleanup** - Remove listeners in useEffect return function

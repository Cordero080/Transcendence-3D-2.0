# Scene3TrainingDojo.jsx Explained

The Training Dojo scene with Japanese lanterns, cherry blossom petals, and animated cats.

## File Location

`/src/battle/Scene3/Scene3TrainingDojo.jsx`

---

## Two Exports

```jsx
// Named export - 2D canvas overlay (used OUTSIDE R3F Canvas)
export function CherryBlossomCanvas() { ... }

// Default export - 3D scene (used INSIDE R3F Canvas)
export default function Scene3TrainingDojo({ ... }) { ... }
```

---

## CherryBlossomCanvas (2D Overlay)

A vanilla Canvas 2D animation rendered on top of the 3D scene.

### Why 2D Canvas instead of 3D?

- **Performance** - 60 independent 2D sprites are cheaper than 60 3D meshes
- **Visual Style** - 2D petals with blur/opacity look more ethereal
- **Z-Index Control** - Easy to layer on top of 3D scene

### The Petal Class

```jsx
class Petal {
  constructor() {
    this.reset(true); // true = initial spawn anywhere on screen
  }

  reset(initial = false) {
    // Position
    this.x = Math.random() * (width + 200) - 100; // Can start offscreen
    this.y = initial ? Math.random() * height : -20; // Start at top if respawning

    // Size & speed
    this.size = Math.random() * 8 + 4; // 4-12 pixels
    this.speedX = Math.random() * 1.5 - 0.5; // -0.5 to 1.0 (slight right drift)
    this.speedY = Math.random() * 1 + 0.5; // 0.5 to 1.5 (always falling)

    // Rotation
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.05;

    // Oscillation (side-to-side floating)
    this.oscillationSpeed = Math.random() * 0.02 + 0.01;
    this.oscillationDistance = Math.random() * 30 + 10;
    this.time = Math.random() * Math.PI * 2; // Random start phase

    // COLOR - Three types of pink
    const pinkType = Math.random();

    if (pinkType < 0.4) {
      // 40% - Vibrant hot pink
      // Hue 330-345, Saturation 80-100%, Lightness 55-70%
      this.color = `hsl(${330 + Math.random() * 15}, ${80 + Math.random() * 20}%, ${55 + Math.random() * 15}%)`;
    } else if (pinkType < 0.7) {
      // 30% - Medium pink
      this.color = `hsl(${340 + Math.random() * 20}, ${70 + Math.random() * 25}%, ${65 + Math.random() * 15}%)`;
    } else {
      // 30% - Soft pale pink
      this.color = `hsl(${345 + Math.random() * 20}, ${50 + Math.random() * 30}%, ${80 + Math.random() * 15}%)`;
    }

    this.opacity = Math.random() * 0.3 + 0.7; // 70-100% opacity
  }

  update() {
    this.time += this.oscillationSpeed;
    this.x += this.speedX + Math.sin(this.time) * 0.5; // Side-to-side wave
    this.y += this.speedY;
    this.rotation += this.rotationSpeed;

    // Reset when off screen
    if (this.y > height + 20 || this.x < -50 || this.x > width + 50) {
      this.reset();
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.opacity;

    // Petal shape - bezier curves for pointed ellipse
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(0, -this.size); // Top point
    ctx.bezierCurveTo(
      this.size * 0.5,
      -this.size * 0.3, // Control point 1
      this.size * 0.5,
      this.size * 0.3, // Control point 2
      0,
      this.size, // Bottom point
    );
    ctx.bezierCurveTo(
      -this.size * 0.5,
      this.size * 0.3,
      -this.size * 0.5,
      -this.size * 0.3,
      0,
      -this.size,
    );
    ctx.fill();

    // Highlight (small white ellipse)
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.ellipse(
      -this.size * 0.15,
      -this.size * 0.2,
      this.size * 0.15,
      this.size * 0.25,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.restore();
  }
}
```

### Animation Loop

```jsx
useEffect(() => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  // Create 60 petals
  const petals = [];
  for (let i = 0; i < 60; i++) {
    petals.push(new Petal());
  }

  let animationId;
  const animate = () => {
    ctx.clearRect(0, 0, width, height); // Clear canvas

    petals.forEach((petal) => {
      petal.update();
      petal.draw(ctx);
    });

    animationId = requestAnimationFrame(animate); // Loop
  };

  animate();

  return () => {
    cancelAnimationFrame(animationId); // Cleanup
  };
}, []);
```

### Canvas Positioning

```jsx
<canvas
  ref={canvasRef}
  width={1400}
  height={800}
  style={{
    position: "absolute",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    pointerEvents: "none", // Click through to 3D scene
    zIndex: 100, // On top of 3D canvas
  }}
/>
```

---

## JapaneseLantern Component

A glowing lantern with pulsating light effect.

```jsx
function JapaneseLantern({ position }) {
  const lightRef = useRef();
  const bodyRef = useRef();
  const flameRef = useRef();

  // Animation loop - flickering effect
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Combine multiple sine waves for organic flicker
    const flicker =
      Math.sin(time * 2) * 0.15 + // Slow wave
      Math.sin(time * 5) * 0.08 + // Medium wave
      Math.sin(time * 11) * 0.05; // Fast subtle wave

    // Pulsing point light
    if (lightRef.current) {
      lightRef.current.intensity = 4 + flicker * 2; // Range: ~3.5 to ~4.5
    }

    // Pulsing emissive on paper body
    if (bodyRef.current) {
      bodyRef.current.emissiveIntensity = 1.2 + flicker;
    }

    // Pulsing inner flame
    if (flameRef.current) {
      flameRef.current.emissiveIntensity = 2 + flicker * 1.5;
    }
  });

  return (
    <group position={position}>
      {/* Rope */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
        <meshStandardMaterial color="#3d2817" />
      </mesh>

      {/* Top cap */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 0.1, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Inner flame - bright yellow sphere */}
      <mesh position={[0, -0.35, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          ref={flameRef}
          color="#ffdd00" // Yellow
          emissive="#ffaa00" // Orange glow
          emissiveIntensity={2}
          toneMapped={false} // Allows overbright colors
        />
      </mesh>

      {/* Paper body - translucent white */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.6, 8]} />
        <meshStandardMaterial
          ref={bodyRef}
          color="#fffaf0" // Warm white
          emissive="#fffaf0"
          emissiveIntensity={1.2}
          transparent
          opacity={0.95}
          side={THREE.DoubleSide} // Visible from inside too
          toneMapped={false}
        />
      </mesh>

      {/* Decorative bands */}
      <mesh position={[0, -0.1, 0]}>
        <torusGeometry args={[0.36, 0.02, 8, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Point light - the actual light source */}
      <pointLight
        ref={lightRef}
        position={[0, -0.35, 0]}
        color="#fffaf0"
        intensity={4}
        distance={15} // How far light reaches
        decay={2} // Falloff rate
      />
    </group>
  );
}
```

### Key Material Properties

| Property                  | Purpose                                              |
| ------------------------- | ---------------------------------------------------- |
| `emissive`                | Self-illumination color (glows without light source) |
| `emissiveIntensity`       | Brightness of self-illumination                      |
| `toneMapped={false}`      | Allows HDR/overbright colors (>1.0)                  |
| `transparent` + `opacity` | See-through material                                 |
| `side={THREE.DoubleSide}` | Render both sides of geometry                        |

---

## TrainingPole Component

Bamboo-style pole with segment rings.

```jsx
function TrainingPole({ position }) {
  return (
    <group position={position}>
      {/* Main pole */}
      <mesh position={[0, 2.25, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 4.5, 16]} />
        <meshStandardMaterial
          color="#c4a574" // Tan/bamboo color
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Bamboo rings - map over array of Y positions */}
      {[0.5, 1.2, 1.9, 2.6, 3.3, 4.0].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.16, 0.02, 8, 16]} />
          <meshStandardMaterial color="#a08050" roughness={0.7} />
        </mesh>
      ))}

      {/* Lantern mount & base... */}
      <JapaneseLantern position={[0, 4.9, 0]} />
    </group>
  );
}
```

---

## TrainingCat Component

Animated FBX model with position reset support.

```jsx
function TrainingCat({
  modelPath,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  isMoving = false,
  moveDirection = 0,
  autoAnimate = true,
  scale = MODEL_SCALE,
  resetKey = 0, // When this changes, position resets
}) {
  const groupRef = useRef();
  const mixerRef = useRef();
  const actionRef = useRef();

  const fbx = useLoader(FBXLoader, modelPath);

  // Clone model (needed when using same FBX multiple times)
  const clonedModel = useMemo(() => {
    const clone = SkeletonUtils.clone(fbx);
    clone.scale.setScalar(scale);
    return clone;
  }, [fbx, scale]);

  // Setup animation mixer
  useEffect(() => {
    if (clonedModel && clonedModel.animations?.length > 0) {
      mixerRef.current = new THREE.AnimationMixer(clonedModel);
      actionRef.current = mixerRef.current.clipAction(
        clonedModel.animations[0],
      );
      actionRef.current.play();
    }

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, [clonedModel]);

  // RESET POSITION when resetKey changes
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
    }
  }, [resetKey, position]);

  // Pause/play based on mode
  useEffect(() => {
    if (actionRef.current) {
      if (autoAnimate) {
        actionRef.current.paused = false; // Always play in auto mode
      } else {
        actionRef.current.paused = !isMoving; // Only play when moving
      }
    }
  }, [autoAnimate, isMoving]);

  // Animation loop
  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    // Manual movement
    if (!autoAnimate && isMoving && groupRef.current && moveDirection !== 0) {
      groupRef.current.position.x += 0.02 * moveDirection;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <primitive object={clonedModel} />
    </group>
  );
}
```

---

## GradientRing (Shader)

Animated rainbow ring around the dojo mat.

```jsx
function GradientRing() {
  const materialRef = useRef();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
      <ringGeometry args={[8.45, 8.6, 64]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          time: { value: 0 },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float time;
          varying vec2 vUv;
          void main() {
            // Calculate angle around ring
            float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
            
            // Convert angle to hue, animated over time
            float hue = mod((angle + 3.14159) / (2.0 * 3.14159) + time * 0.2, 1.0);
            
            // HSV to RGB conversion
            // ... (creates rainbow gradient)
            
            gl_FragColor = vec4(color * 2.0, 1.0);  // Overbright
          }
        `}
        toneMapped={false}
      />
    </mesh>
  );
}
```

---

## Main Scene Component

```jsx
export default function Scene3TrainingDojo({
  autoAnimate = true,
  greenMoving,
  greenDirection,
  redMoving,
  redDirection,
  blueMoving,
  blueDirection,
  resetKey = 0,
}) {
  // Fixed positions for cats
  const greenPosition = [-3.3, 0, 2.2];
  const redPosition = [3.3, 1, 2.2];
  const bluePosition = [0, 1, -3.3];

  return (
    <>
      {/* Skybox */}
      <PanoramicBackground />
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
      <directionalLight position={[-5, 10, -5]} intensity={0.5} />
      {/* Environment */}
      <DojoMat />
      <CenterMarker />
      {/* Lantern poles - equilateral triangle */}
      <TrainingPole position={[0, 0, -7.5]} /> {/* North */}
      <TrainingPole position={[-6.5, 0, 3.75]} /> {/* Southwest */}
      <TrainingPole position={[6.5, 0, 3.75]} /> {/* Southeast */}
      {/* Grid helper */}
      <Grid
        args={[60, 60]}
        cellSize={1}
        cellColor="#00ffff"
        sectionColor="#ff00ff"
        fadeDistance={60}
        position={[0, 0, 0]}
      />
      {/* Animated cats */}
      <TrainingCat
        modelPath="/models/green_butterfly.fbx"
        position={greenPosition}
        autoAnimate={autoAnimate}
        isMoving={greenMoving}
        moveDirection={greenDirection}
        resetKey={resetKey}
      />
      {/* ... red and blue cats */}
      <OrbitControls target={[0, 1, 0]} />
    </>
  );
}
```

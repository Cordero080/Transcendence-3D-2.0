# React Three Fiber Basics

A quick reference for understanding R3F code in this project.

---

## What is React Three Fiber?

React Three Fiber (R3F) is a React renderer for Three.js. Instead of writing imperative Three.js code:

```javascript
// Vanilla Three.js
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: "red" });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
```

You write declarative JSX:

```jsx
// React Three Fiber
<mesh>
  <boxGeometry args={[1, 1, 1]} />
  <meshStandardMaterial color="red" />
</mesh>
```

---

## Core Components

### Canvas

The root component that creates a WebGL renderer.

```jsx
<Canvas
  camera={{ position: [0, 5, 10], fov: 50 }} // Camera settings
>
  {/* All 3D content goes here */}
</Canvas>
```

**Important:** Everything inside `<Canvas>` is in "R3F world" and uses R3F hooks. Regular React components/hooks work differently here.

### mesh

A 3D object with geometry + material.

```jsx
<mesh position={[0, 1, 0]} rotation={[0, Math.PI / 4, 0]}>
  <boxGeometry args={[width, height, depth]} />
  <meshStandardMaterial color="#ff0000" />
</mesh>
```

### group

Groups multiple objects together (like a `<div>`).

```jsx
<group position={[0, 0, 0]} rotation={[0, 0, 0]}>
  <mesh>...</mesh>
  <mesh>...</mesh>
</group>
```

### primitive

Renders an existing Three.js object (like a loaded model).

```jsx
const model = useLoader(FBXLoader, "/model.fbx");
return <primitive object={model} />;
```

---

## Common Geometries

| JSX                                             | Three.js         | Args                                |
| ----------------------------------------------- | ---------------- | ----------------------------------- |
| `<boxGeometry args={[1, 1, 1]} />`              | BoxGeometry      | width, height, depth                |
| `<sphereGeometry args={[1, 32, 32]} />`         | SphereGeometry   | radius, widthSeg, heightSeg         |
| `<cylinderGeometry args={[0.5, 0.5, 2, 16]} />` | CylinderGeometry | topR, bottomR, height, segments     |
| `<planeGeometry args={[10, 10]} />`             | PlaneGeometry    | width, height                       |
| `<torusGeometry args={[1, 0.3, 16, 32]} />`     | TorusGeometry    | radius, tube, radialSeg, tubularSeg |
| `<ringGeometry args={[0.5, 1, 32]} />`          | RingGeometry     | innerR, outerR, segments            |

---

## Common Materials

### meshStandardMaterial

Physically-based material (responds to lights).

```jsx
<meshStandardMaterial
  color="#ff0000"
  metalness={0.5} // 0 = plastic, 1 = metal
  roughness={0.5} // 0 = mirror, 1 = diffuse
  emissive="#ff0000" // Self-illumination color
  emissiveIntensity={1}
  transparent // Enable transparency
  opacity={0.5}
  side={THREE.DoubleSide} // Render both sides
  toneMapped={false} // Allow HDR colors
/>
```

### meshBasicMaterial

Unlit material (ignores lights, useful for backgrounds).

```jsx
<meshBasicMaterial color="#ffffff" map={texture} />
```

### shaderMaterial

Custom GLSL shaders.

```jsx
<shaderMaterial
  uniforms={{ time: { value: 0 } }}
  vertexShader={`...`}
  fragmentShader={`...`}
/>
```

---

## Lights

```jsx
// Ambient - fills shadows
<ambientLight intensity={0.5} />

// Directional - like the sun
<directionalLight
  position={[10, 10, 5]}
  intensity={1}
  castShadow
/>

// Point - like a light bulb
<pointLight
  position={[0, 2, 0]}
  color="#ffff00"
  intensity={5}
  distance={10}   // How far light reaches
  decay={2}       // Falloff rate
/>
```

---

## Essential Hooks

### useFrame

Runs every frame (~60fps). The animation loop.

```jsx
function AnimatedBox() {
  const meshRef = useRef();

  useFrame((state, delta) => {
    // state.clock.elapsedTime - total time elapsed
    // delta - time since last frame (for framerate-independent animation)

    meshRef.current.rotation.x += delta; // Rotate continuously
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  );
}
```

### useLoader

Loads external assets (textures, models).

```jsx
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

function Model() {
  const fbx = useLoader(FBXLoader, "/model.fbx");
  return <primitive object={fbx} />;
}
```

### useTexture (from drei)

Loads textures easily.

```jsx
const texture = useTexture("/image.png");
return <meshStandardMaterial map={texture} />;
```

### useRef

Reference Three.js objects for direct manipulation.

```jsx
const meshRef = useRef();

useFrame(() => {
  meshRef.current.position.x += 0.01;
});

return <mesh ref={meshRef}>...</mesh>;
```

---

## drei Helpers

[drei](https://github.com/pmndrs/drei) is a helper library for R3F.

### OrbitControls

Mouse-based camera controls.

```jsx
<OrbitControls
  enablePan={true}
  enableZoom={true}
  target={[0, 1, 0]} // Look-at point
  minDistance={5}
  maxDistance={50}
/>
```

### Grid

Visual grid helper.

```jsx
<Grid
  args={[50, 50]} // size, divisions
  cellSize={1}
  cellColor="#00ff00"
  sectionColor="#ff00ff"
  fadeDistance={50}
  position={[0, 0, 0]}
/>
```

### Html

Render HTML inside 3D scene.

```jsx
<Html center position={[0, 2, 0]}>
  <div className="label">Hello World</div>
</Html>
```

---

## Position & Rotation

### Position

`[x, y, z]` - Right-handed coordinate system:

- X: Right (+) / Left (-)
- Y: Up (+) / Down (-)
- Z: Toward camera (+) / Away (-)

```jsx
<mesh position={[1, 2, 3]} /> // x=1, y=2, z=3
```

### Rotation

`[x, y, z]` in radians:

```jsx
<mesh rotation={[0, Math.PI / 2, 0]} />  // 90° on Y axis
<mesh rotation={[-Math.PI / 2, 0, 0]} />  // Lay flat (rotate -90° on X)
```

---

## Animation Mixer (FBX Animations)

```jsx
const fbx = useLoader(FBXLoader, "/model.fbx");
const mixerRef = useRef();
const actionRef = useRef();

// Setup (runs once)
useEffect(() => {
  if (fbx.animations?.length > 0) {
    mixerRef.current = new THREE.AnimationMixer(fbx);
    actionRef.current = mixerRef.current.clipAction(fbx.animations[0]);
    actionRef.current.play();
  }
}, [fbx]);

// Update every frame
useFrame((_, delta) => {
  if (mixerRef.current) {
    mixerRef.current.update(delta); // Advance animation
  }
});

// Control
actionRef.current.paused = true; // Pause
actionRef.current.paused = false; // Resume
```

---

## Common Patterns

### Cloning Animated Models

When using the same FBX multiple times, clone with SkeletonUtils:

```jsx
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";

const clonedModel = useMemo(() => {
  return SkeletonUtils.clone(fbx);
}, [fbx]);
```

### Suspense for Loading

```jsx
<Canvas>
  <Suspense fallback={<LoadingSpinner />}>
    <Model /> {/* May take time to load */}
  </Suspense>
</Canvas>
```

### 2D Overlay + 3D Scene

Render 2D canvas **outside** the R3F Canvas:

```jsx
<div className="container">
  <Canvas2DOverlay /> {/* position: absolute, pointer-events: none */}
  <Canvas>
    <Scene3D />
  </Canvas>
</div>
```

---

## Debugging Tips

1. **Component not showing?**
   - Check position (might be behind camera)
   - Add `<axesHelper />` to see coordinate system
   - Check if material is transparent with opacity=0

2. **Model too big/small?**
   - Check scale: `<primitive object={model} scale={0.01} />`
   - Or modify model: `model.scale.setScalar(0.01)`

3. **Performance issues?**
   - Reduce geometry segments
   - Use `useMemo` for expensive calculations
   - Lower draw distance with `fadeDistance`

4. **Emissive not glowing?**
   - Add `toneMapped={false}` to material
   - Increase `emissiveIntensity`

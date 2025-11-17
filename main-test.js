import * as THREE from "./libs/three.module.js";
import { FBXLoader } from "./libs/FBXLoader.js";

// import { TextureLoader } from "./libs/three.module.js";
const textureLoader = new THREE.TextureLoader();
console.log("✅ Three.js and FBXLoader loaded successfully!");

// Setup scene
let currentLoadToken = 0;
let activeModel = null;
let mixer = null; // <-- NEW
let time = 0;
let currentPose = "";
let catMaskCanvas = null;
let catMaskContext = null;
let lastBaseScale = [0.001, 0.001, 0.001];
// === Responsive helpers ======================================
function resizeRendererToContainer(renderer, camera) {
  const container = document.getElementById("pet-container");
  if (!container) return;
  const width = Math.floor(container.clientWidth);
  const height = Math.floor(container.clientHeight);
  const canvas = renderer.domElement;

  // Only resize when needed
  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

// Scale the active model a bit smaller on narrow screens
// Scale the active model a bit smaller on narrow screens (multiplicative)
function fitModelForViewport(model, baseScale = [0.001, 0.001, 0.001]) {
  if (!model) return;

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  if (!isMobile) {
    // Desktop: keep your exact pose scale
    model.scale.set(baseScale[0], baseScale[1], baseScale[2]);
    return;
  }

  const container = document.getElementById("pet-container");
  const w = container ? container.clientWidth : window.innerWidth;

  // Scale factor 0.6..1.0 across 360–900px widths
  const t = Math.max(360, Math.min(900, w));
  const k = 0.6 + ((t - 360) / (900 - 360)) * 0.4;

  // Multiply original pose scale, don't overwrite
  model.scale.set(baseScale[0] * k, baseScale[1] * k, baseScale[2] * k);
}

export function clearActiveModel() {
  // remove the single tracked model
  if (activeModel) {
    // was: scene.remove(activeModel);
    petRoot.remove(activeModel);
    try {
      activeModel.traverse((child) => {
        if (child.isMesh) {
          child.geometry?.dispose?.();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose?.());
          } else {
            child.material?.dispose?.();
          }
        }
      });
    } catch {}
    activeModel = null;
    mixer = null;
  }

  // also clear anything else that might have been added into the petRoot
  while (petRoot.children.length) {
    const obj = petRoot.children.pop();
    try {
      obj.traverse?.((child) => {
        if (child.isMesh) {
          child.geometry?.dispose?.();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose?.());
          } else {
            child.material?.dispose?.();
          }
        }
      });
    } catch {}
    // was: scene.remove(obj);
    petRoot.remove(obj);
  }
}
const clock = new THREE.Clock();

// Function to get cat position and dimensions for dynamic masking
function getCatMaskData() {
  if (!activeModel) return null;

  // Get the model's bounding box
  const box = new THREE.Box3().setFromObject(activeModel);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  // Project 3D position to screen coordinates
  const vector = center.clone();
  vector.project(camera);

  // Convert to screen space (0 to 1, then to pixel coordinates)
  const containerRect = document
    .getElementById("pet-container")
    .getBoundingClientRect();
  const x = (vector.x * 0.5 + 0.5) * containerRect.width;
  const y = (-vector.y * 0.5 + 0.5) * containerRect.height;

  // Estimate cat dimensions based on the model size and current animation
  let width = Math.abs(size.x) * 100; // Convert to reasonable pixel size
  let height = Math.abs(size.y) * 100;

  // Adjust for different animations
  if (currentPose.includes("dance") || currentPose.includes("salsa")) {
    width *= 1.2; // Dancing cats spread out more
  }
  if (currentPose.includes("sleep")) {
    height *= 0.7; // Sleeping cats are shorter
    width *= 1.3; // But wider
  }

  // Ensure minimum/maximum sizes
  width = Math.max(80, Math.min(300, width));
  height = Math.max(100, Math.min(400, height));

  return {
    x: x,
    y: y,
    width: width,
    height: height,
    pose: currentPose,
    scale: activeModel.scale.x,
  };
}

function loadAndDisplayFBX(path, pose = {}, options = {}) {
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader();

    // bump token for this load to prevent overlap/race duplicates
    const myToken = ++currentLoadToken;

    // always clear anything previously in the pet slot
    clearActiveModel();

    loader.load(
      path,
      (fbx) => {
        // if a newer load started while this one was in-flight, drop this one
        if (myToken !== currentLoadToken) {
          try {
            fbx.traverse((child) => {
              if (child.isMesh) {
                child.geometry?.dispose?.();
                if (Array.isArray(child.material)) {
                  child.material.forEach((m) => m.dispose?.());
                } else {
                  child.material?.dispose?.();
                }
              }
            });
          } catch {}
          resolve(0);
          return;
        }

        // ----- apply pose -----
        const [sx, sy, sz] = pose.scale || [0.001, 0.001, 0.001];
        const [px = 0, py = -1, pz = 0] = pose.position || [];
        const rotationY = pose.rotationY || 0;

        fbx.scale.set(sx, sy, sz);
        fbx.position.set(px, py, pz);
        fbx.rotation.y = rotationY;

        lastBaseScale = [sx, sy, sz];

        fbx.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // ----- attach under a single root, not directly to scene -----
        petRoot.add(fbx);
        activeModel = fbx;
        currentPose = path;
        fitModelForViewport(activeModel, lastBaseScale);

        // ----- animation (guard if no clips) -----
        mixer = new THREE.AnimationMixer(fbx);
        const clip = fbx.animations?.[0];
        if (clip) {
          const action = mixer.clipAction(clip);
          if (options.loop === false) {
            action.setLoop(THREE.LoopOnce);
            action.clampWhenFinished = true;
          } else {
            action.setLoop(THREE.LoopRepeat);
          }
          action.play();
        }

        const duration = clip?.duration || 2.5;
        resolve(duration * 1000);
      },
      undefined,
      (err) => reject(err)
    );
  });
}

function hasActiveModel() {
  return !!activeModel;
}

// White stage lighting setup (initially off)
const whiteStageBottomLight = new THREE.PointLight(0xff99cc, 0, 35); // Lighter pink with white/yellow tones from above
whiteStageBottomLight.position.set(0, 6, 8); // Above and closer to camera

const whiteStageLeftLight = new THREE.PointLight(0x0066ff, 0, 35); // Pure deep blue from left above
whiteStageLeftLight.position.set(-8, 6, 6); // Above and closer to camera

const whiteStageTopRightLight = new THREE.PointLight(0xff0066, 0, 35); // Pure hot pink from top right
whiteStageTopRightLight.position.set(5, 10, 7); // High above and closer to camera

const whiteStageTopLeftLight = new THREE.PointLight(0x00ff66, 0, 35); // Pure spring green from top left
whiteStageTopLeftLight.position.set(-5, 10, 7); // High above and closer to camera

const whiteStageInnerLight = new THREE.PointLight(0x9966ff, 0, 15); // Purple inner glow - no white
whiteStageInnerLight.position.set(0, 2, 0); // Slightly above center

export function setWhiteStageLighting(enabled) {
  if (enabled) {
    // Maximum white light for brightness
    ambientLight.intensity = 2.5; // Very high for brightness
    directionalLight.intensity = 1.5; // Strong white light
    light.intensity = 1.2; // Strong magenta
    topLight.intensity = 1.0; // Strong pink
    sideLight.intensity = 3.5; // Ultra high blue - boosted
    backLight.intensity = 1.2; // Much higher cyan - boosted

    // Spectral rainbow lights with ultra-extreme intensity
    whiteStageBottomLight.intensity = 30; // Lighter pink - reduced from 45
    whiteStageLeftLight.intensity = 90; // Deep blue - 50% increase from 60
    whiteStageTopRightLight.intensity = 40; // Hot pink - ultra extreme
    whiteStageTopLeftLight.intensity = 82; // Spring green - 50% increase from 55
    whiteStageInnerLight.intensity = 28; // Purple inner - ultra extreme
  } else {
    // Restore default light intensities
    ambientLight.intensity = 1.4;
    directionalLight.intensity = 1;
    light.intensity = 1.5;
    topLight.intensity = 0.8;
    sideLight.intensity = 0.5;
    backLight.intensity = 0.3;

    whiteStageBottomLight.intensity = 0;
    whiteStageLeftLight.intensity = 0;
    whiteStageTopRightLight.intensity = 0;
    whiteStageTopLeftLight.intensity = 0;
    whiteStageInnerLight.intensity = 0;
  }
}
export { loadAndDisplayFBX, getCatMaskData, hasActiveModel };

const scene = new THREE.Scene();
const petRoot = new THREE.Group();
scene.add(petRoot);
// scene.background = new THREE.Color("black"); // Light gray background
// Ambient light (softens all shadows, adds base brightness)
const bgLoader = new THREE.TextureLoader();
bgLoader.load("./images/4th_.jpg", function (texture) {
  scene.background = texture;
});

const ambientLight = new THREE.AmbientLight(0x000ff, 1.4); // Soft purple ambient light
scene.add(ambientLight);

// Add white stage lights to scene
scene.add(whiteStageBottomLight);
scene.add(whiteStageLeftLight);
scene.add(whiteStageTopRightLight);
scene.add(whiteStageTopLeftLight);
scene.add(whiteStageInnerLight);

// Directional light (like sunlight)
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.castShadow = true; // Enable shadow casting
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.5, 3);

// Renderer
const petContainer = document.getElementById("pet-container");
const PET_WIDTH = petContainer.offsetWidth || 990;
const PET_HEIGHT = petContainer.offsetHeight || 600;
const renderer = new THREE.WebGLRenderer({ antialias: true }); // applies to canvas and DOM elements. This line was added to ensure the renderer is created correctly. No need for a canvas element in html because we are appending the renderer's DOM element directly to the petContainer.
renderer.setSize(PET_WIDTH, PET_HEIGHT);
renderer.shadowMap.enabled = true; // ✅ Add this line
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // (optional but softer shadows)
petContainer.appendChild(renderer.domElement);

resizeRendererToContainer(renderer, camera);

// Update camera aspect ratio to match container
camera.aspect = PET_WIDTH / PET_HEIGHT;
camera.updateProjectionMatrix();

// Light
const light = new THREE.DirectionalLight(0xff00ff, 1.5); // Saturated magenta from the right - increased
const topLight = new THREE.DirectionalLight(0xff0099, 0.8); // Saturated pink light from above - increased
topLight.position.set(0, 5, 0); // x = left/right, y = up/down, z = front/back

topLight.castShadow = true; // ✅ Enable shadow casting
topLight.shadow.mapSize.width = 512; // default is 512

const sideLight = new THREE.DirectionalLight(0x0000ff, 0.5); // Pure saturated blue from left - increased
sideLight.position.set(-5, 2, 0); // X = left/right, Y = up/down, Z = front/back
sideLight.castShadow = true; // ✅ Enable shadow casting

const backLight = new THREE.DirectionalLight(0x00ffff, 0.3); // Saturated cyan - increased
backLight.position.set(0, 2, -5);
backLight.target.position.set(0, 1, 0);
scene.add(backLight);
scene.add(backLight.target);
backLight.castShadow = true;
backLight.shadow.camera.left = -2;
backLight.shadow.camera.right = 2;
backLight.shadow.camera.top = 2;
backLight.shadow.camera.bottom = -2;
backLight.shadow.camera.near = 0.5;
backLight.shadow.camera.far = 10;
backLight.shadow.mapSize.width = 1024;
backLight.shadow.mapSize.height = 1024;

directionalLight.position.set(-2, 10, 6.5);
directionalLight.castShadow = true; // ✅ Enable shadow casting
scene.add(directionalLight);
light.position.set(2, 4, 2); //  firt is the x, second is the y, third is the z
scene.add(light);
const groundGeometry = new THREE.PlaneGeometry(10, 10);
const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1.7;
ground.receiveShadow = true;
scene.add(light, ground, topLight, sideLight, directionalLight);

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  time += delta; // Increment time

  if (activeModel && currentPose.includes("yellow_capo_wind")) {
    activeModel.position.x = Math.sin(time * 1) * 1; //slide left-right
  }
  //  💚 ✅ Green salsa dancing- side to side 💚 ✅
  if (activeModel && currentPose.includes("green_salsa")) {
    activeModel.position.x = Math.sin(time * 0.5) * 2; // tweak rang/speed
    activeModel.position.y = -1.55; // Lock Y if needed
  }
  //  💚 ✅ Green Thriller - side to side 💚 ✅
  if (activeModel && currentPose.includes("green_thriller")) {
    activeModel.position.x = Math.sin(time * -0.8) * 0.8; // tweak rang/speed
    activeModel.position.y = -2; // Lock Y if needed
  }
  // move the model if it's dancing
  if (activeModel && currentPose.includes("White_thriller")) {
    //===============TUT SETTING
    // activeModel.position.x = Math.sin(time) * 0.1;
    // activeModel.position.z = Math.cos(time * 0.4) * -0.1;
    // activeModel.position.y = -0.1;
    activeModel.position.x = 0.1;
    activeModel.position.z = -3.5;
    activeModel.position.y = -1;

    // 🔁 Reposition light slightly above and in front to cast shadow behind
    directionalLight.position.set(-2, 6, 8); // ↑ Y for overhead, -Z for front
    directionalLight.target.position.set(0, 1, 0); // aim at cat
    directionalLight.target.updateMatrixWorld();
  } else {
    // Reset after dancing
    directionalLight.position.set(-2, 10, 6.5); // original
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.target.updateMatrixWorld();
  }

  if (mixer) mixer.update(delta);

  renderer.render(scene, camera);
}

// Refit on window resizes and orientation changes
window.addEventListener("resize", () => {
  resizeRendererToContainer(renderer, camera);
  fitModelForViewport(activeModel, lastBaseScale);
});

window.addEventListener("orientationchange", () => {
  setTimeout(() => {
    resizeRendererToContainer(renderer, camera);
    fitModelForViewport(activeModel, lastBaseScale);
  }, 150); // let CSS media queries settle
});
animate();

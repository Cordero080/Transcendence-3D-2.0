import * as THREE from "@lib/three.module.js";
import { FBXLoader } from "@lib/FBXLoader.js";

// import { TextureLoader } from "@libs/three.module.js";
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

  const box = new THREE.Box3().setFromObject(activeModel);
  const center = box.getCenter(new THREE.Vector3());

  // Use offsetWidth/offsetHeight (layout/pre-transform dimensions) because:
  // - The Three.js renderer is sized from offsetWidth/offsetHeight
  // - CSS left/top on absolutely-positioned children are in layout space
  // - getBoundingClientRect() returns post-transform viewport coords (wrong for CSS)
  const container = document.getElementById("pet-container");
  const layoutW = container.offsetWidth || 990;
  const layoutH = container.offsetHeight || 600;

  // Project a 3D point to layout-pixel coords matching the Three.js canvas
  const project = (vec) => {
    const v = vec.clone().project(camera);
    return {
      x: (v.x * 0.5 + 0.5) * layoutW,
      y: (-v.y * 0.5 + 0.5) * layoutH,
    };
  };

  const screenCenter = project(center);
  const screenTop = project(new THREE.Vector3(center.x, box.max.y, center.z));
  const screenBottom = project(
    new THREE.Vector3(center.x, box.min.y, center.z),
  );
  const screenLeft = project(new THREE.Vector3(box.min.x, center.y, center.z));
  const screenRight = project(new THREE.Vector3(box.max.x, center.y, center.z));

  let width = Math.abs(screenRight.x - screenLeft.x);
  let height = Math.abs(screenBottom.y - screenTop.y);

  if (currentPose.includes("dance") || currentPose.includes("salsa")) {
    width *= 1.2;
  }
  if (currentPose.includes("sleep")) {
    height *= 0.7;
    width *= 1.3;
  }

  width = Math.max(80, width);
  height = Math.max(100, height);

  // xPct/yPct: NDC-derived percentages — coordinate-safe for CSS left/top
  // regardless of any parent CSS transform (scale, translate, etc.)
  return {
    xPct: (screenCenter.x / layoutW) * 100,
    yPct: (screenCenter.y / layoutH) * 100,
    width,
    height,
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
            // Stop mixer updates when animation finishes to freeze at death pose
            mixer.addEventListener("finished", () => {
              console.log("🛑 Animation finished, freezing at final frame");
              mixer.timeScale = 0; // Freeze the mixer to prevent any further updates
            });
          } else {
            action.setLoop(THREE.LoopRepeat);
          }
          action.play();
        }

        const duration = clip?.duration || 2.5;
        resolve(duration * 1000);
      },
      undefined,
      (err) => reject(err),
    );
  });
}

function hasActiveModel() {
  return !!activeModel;
}
// DIGITS set(X, Y, Z)
// X: Negative ----> left Positive = right
// Y: Up / Down ----> Positive = up
// Z: Forward / Back (toward or away from the camera)
// White stage lighting setup (initially off)
// Positive = toward camera, Negative = away from camera
//--------------------------------------------------------
// THREE.Point.Light(color, intensity, distance)
// Intensity: higher= brighter (max 200 +) Lower = dimmer
// Distance: This is how far the light reaches before fading out.
// Small number = tight local glow Large number = long, wide reach and 0 = infinite (no falloff)
const whiteStageBottomLight = new THREE.PointLight(0xff99cc, 0, 35); // Lighter pink with white/yellow tones from above
whiteStageBottomLight.position.set(0, 6, 8); // Above and closer to camera

const whiteStageLeftLight = new THREE.PointLight(0x00bbff, 90, 40); // Hyper Neon Blue-Aqua from left
whiteStageLeftLight.position.set(-13, 6, 6); // Above and closer to camera
whiteStageLeftLight.decay = 1.2;

const whiteStageTopRightLight = new THREE.PointLight(0xff00ff, 250, 90); // Pure hot pink from top right
whiteStageTopRightLight.position.set(0, 10, 7); // High above and closer to camera

const whiteStageTopLeftLight = new THREE.PointLight(0xff5500, 80, 35); // Tangerine Neon from top left
whiteStageTopLeftLight.position.set(-7, 10, 7); // High above and closer to camera

const whiteStageInnerLight = new THREE.PointLight(0xffcc33, 50, 15); // True Golden Yellow (warm & rich)
whiteStageInnerLight.position.set(7, 2, 0); // Slightly above center

export function setWhiteStageLighting(enabled) {
  // Apply white stage lighting as default for all stages
  ambientLight.intensity = 1.5;
  directionalLight.intensity = 1.3;
  light.intensity = 1.3;
  topLight.intensity = 0.9;
  sideLight.intensity = 2.0;
  backLight.intensity = 0.6;

  // Spectral rainbow lights always on
  whiteStageBottomLight.intensity = 12;
  whiteStageLeftLight.intensity = 50;
  whiteStageTopRightLight.intensity = 18;
  whiteStageTopLeftLight.intensity = 40;
  whiteStageInnerLight.intensity = 12;
}

export { loadAndDisplayFBX, getCatMaskData, hasActiveModel };

const scene = new THREE.Scene();
const petRoot = new THREE.Group();
scene.add(petRoot);
// scene.background = new THREE.Color("black"); // Light gray background
// Ambient light (softens all shadows, adds base brightness)
const bgLoader = new THREE.TextureLoader();
bgLoader.load("/4th_.jpg", function (texture) {
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
  1000,
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

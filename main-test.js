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

// Update camera aspect ratio to match container
camera.aspect = PET_WIDTH / PET_HEIGHT;
camera.updateProjectionMatrix();

// Light
const light = new THREE.DirectionalLight(0xff00ff, 1); // this light coms from the right
const topLight = new THREE.DirectionalLight(0xff00ff, 0.4); // pink light from above
topLight.position.set(0, 5, 0); // x = left/right, y = up/down, z = front/back

topLight.castShadow = true; // ✅ Enable shadow casting
topLight.shadow.mapSize.width = 512; // default is 512

const sideLight = new THREE.DirectionalLight(0x0000ff, 0.2); // Pink light from left
sideLight.position.set(-5, 2, 0); // X = left/right, Y = up/down, Z = front/back
sideLight.castShadow = true; // ✅ Enable shadow casting

const bottomLight = new THREE.DirectionalLight(0xff0000, 0.2); // Red from below
bottomLight.position.set(0, -3, 0); // X = left/right, Y = up/down, Z = front/back
bottomLight.castShadow = true; // ✅ Enable shadow casting

const backLight = new THREE.DirectionalLight(0x00ffff, 0.1);
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
scene.add(light, ground, topLight, bottomLight, sideLight, directionalLight);

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

  const newWidth = petContainer.offsetWidth || 900;
  const newHeight = petContainer.offsetHeight || 600;
  if (
    renderer.getSize(new THREE.Vector2()).x !== newWidth ||
    renderer.getSize(new THREE.Vector2()).y !== newHeight
  ) {
    renderer.setSize(newWidth, newHeight, false);
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
  }
  renderer.render(scene, camera);
}
animate();

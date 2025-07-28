import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TextureLoader } from "three";
console.log("✅ Three.js and FBXLoader loaded successfully!");
let catModel = null;
let time = 0;
let activeAction;
const animationActions = {}; //stores all animations

//  Public function for app.js to trigger animations
export function playAnimation(name) {
  if (animationActions[name]) {
    if (activeAction) activeAction.stop();
    activeAction = animationActions[name];
    activeAction.reset().play();

    // Only reset orientation (rotation) — not position
    if (catModel) {
      catModel.rotation.set(-0.6, -Math.PI / 9, 0);
    }
  } else {
    console.warn(`Animation "${name}" not found.`);
  }
}
// Setup scene
const scene = new THREE.Scene();
// scene.background = new THREE.Color("black"); // Light gray background
// Ambient light (softens all shadows, adds base brightness)
const bgLoader = new TextureLoader();
bgLoader.load("./models/cyberpunk-room2 .png", function (texture) {
  scene.background = texture;
});
// 🔲 Dark overlay to dim background image
// const darkOverlayGeometry = new THREE.PlaneGeometry(20, 30);
// const darkOverlayMaterial = new THREE.MeshBasicMaterial({
//   color: 0x000000,
//   transparent: true,
//   opacity: 0.2 // You can adjust this to control darkness
// });
// // const darkOverlay = new THREE.Mesh(darkOverlayGeometry, darkOverlayMaterial);
// // // darkOverlay.position.z = -5; // Push it behind everything
// // scene.add(darkOverlay);

const ambientLight = new THREE.AmbientLight(0x000ff, 1.4); // Soft purple ambient light
scene.add(ambientLight);

// Directional light (like sunlight)
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
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

// Helpers
// scene.add(new THREE.GridHelper(5, 5));
// scene.add(new THREE.AxesHelper(1));

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Animation
let mixer;
const clock = new THREE.Clock();

// Load FBX
// Load FBX model and animations
const loader = new FBXLoader();
loader.load(
  "./models/cat_hip_hop.fbx",
  (fbx) => {
    console.log("✅ Base model loaded:", fbx);

    const scaleY = PET_HEIGHT * 0.0014;
    const scaleX = PET_WIDTH * 0.0014;
    fbx.scale.set(scaleX / PET_WIDTH, scaleY / PET_HEIGHT, scaleX / PET_WIDTH);
    fbx.position.y = 1;
    fbx.rotation.x = -0.6;
    fbx.rotation.y = -Math.PI / 9;

    fbx.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene.add(fbx);
    catModel = fbx;
    mixer = new THREE.AnimationMixer(fbx);

    // Load additional animations
    loadAnimation("dance", "./models/cat_hip_hop.fbx");
    loadAnimation("sleep", "./models/cat_sleep.fbx");
    loadAnimation("eat", "./models/cat_eats.fbx");
    loadAnimation("idle-second", "./models/blue_cat_idle2.fbx");
  },
  null, // progress callback (optional)
  (err) => console.error("❌ Failed to load model:", err)
);

// ✅ Only define this ONCE
function loadAnimation(name, path) {
  const animLoader = new FBXLoader();
  animLoader.load(path, (anim) => {
    const action = mixer.clipAction(anim.animations[0]);
    animationActions[name] = action;

    if (name === "dance") {
      activeAction = action;
      action.play();
    }

    console.log(`✅ ${name} animation loaded`);
  });
}
// Scale model to fit container height

//

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  time += delta; // Increment time

  if (mixer) mixer.update(delta);
  if (catModel) {
    // Return to original hip-hop dance bounce
    // catModel.position.x = Math.sin(time * 0.5) * 0.5;
    catModel.position.z = -0.5 + Math.cos(time * 0.4) * -0.1;
    catModel.position.x = Math.sin(time) * 0.6; //side-side
    catModel.position.y = -1.5; // this
  }
  // Always resize renderer and camera to fit container
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

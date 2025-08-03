import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TextureLoader } from "three";

console.log("✅ Three.js and FBXLoader loaded successfully!");

// Setup scene
let activeModel = null;
let mixer = null; // <-- NEW
let time = 0;
let currentPose = "";
// let jumpForwardActive = false;
// let jumpStartTime = 0;
// let jumpStartPosition = { x: 0, Z: 0 };
// let redUppercutActive = false;
// let redUppercutStartTime = 0;
// let redUppercutStartX = 0;
// let redUppercutStartZ = 0;
// let redUppercutDelayStart = 0;
// let redUppercutStopTime = 0;

const clock = new THREE.Clock();

function loadAndDisplayFBX(path, pose = {}) {
  return new Promise((resolve) => {
    const loader = new FBXLoader();

    // Remove any existing model
    if (activeModel) {
      scene.remove(activeModel);
      activeModel.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      activeModel = null;
      mixer = null;
    }

    loader.load(path, (fbx) => {
      // Apply pose settings
      const [sx, sy, sz] = pose.scale || [0.0025, 0.0025, 0.0025];
      const [px = 0, py = -0.00235, pz = 0.6] = pose.position || [];
      const rotationY = pose.rotationY || 0;
      const rotationX = pose.rotationX || 0;

      fbx.scale.set(sx, sy, sz);
      fbx.position.set(px, py, pz);
      fbx.rotation.y = rotationY;
      fbx.rotation.x = rotationX;

      fbx.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      activeModel = fbx;
      scene.add(fbx);
      currentPose = path;

      // Setup animation
      mixer = new THREE.AnimationMixer(fbx);
      const action = mixer.clipAction(fbx.animations[0]);
      action.play();

      const duration = fbx.animations[0]?.duration || 2.5; //this

      // 🔴🔴🔴🔴🔴🔴🔴🔴 RED UPPERCUT LOGIC🔴🔴🔴🔴🔴🔴🔴🔴🔴

      // if (currentPose.includes("red_uppercut")) {
      //   redUppercutActive = true;
      //   redUppercutStartTime = time;

      //   redUppercutStartX = fbx.position.x;
      //   redUppercutStartZ = fbx.position.z;

      //   redUppercutDelayStart = time + 1; // Delay before sliding starts
      //   redUppercutStopTime = redUppercutDelayStart + duration;
      // }

      // 💛 YELLOW CAPO WIND SCALE
      if (currentPose.includes("yellow_capo_wind")) {
        fbx.scale.set(0.0034, 0.0034, 0.0034);
      }

      // // 💛 YELLOW JUMP FORWARD
      // if (currentPose.includes("yellow_jump_front_k")) {
      //   fbx.scale.set(0.0028, 0.0028, 0.0028);
      //   jumpForwardActive = true;
      //   jumpStartTime = time;
      //   jumpStartPosition = { x: 2, y: -1.55, z: -1 };
      // }

      // ✅ Finish: resolve with animation duration in milliseconds
      resolve(duration * 1000);
    });
  });
}

export { loadAndDisplayFBX };

const scene = new THREE.Scene();
// scene.background = new THREE.Color("black"); // Light gray background
// Ambient light (softens all shadows, adds base brightness)
const bgLoader = new TextureLoader();
bgLoader.load("./models/cyberpunk-room2 .png", function (texture) {
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

// Helpers
// scene.add(new THREE.GridHelper(5, 5));
// scene.add(new THREE.AxesHelper(1));

// Orbit Controls
// const controls = new OrbitControls(camera, renderer.domElement);
//  loadAndDisplayFBX("./models/cat_idle_chi.fbx", {
//   scale: [0.01, 0.01, 0.01],
//   position: [0, -2.5, 0],
//   rotationY: Math.PI / 9
// });

// Animation

// Scale model to fit container height

//

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  time += delta; // Increment time

  // if (activeModel && jumpForwardActive) {
  //   const elapsed = time - jumpStartTime;

  //   // set STARTING POSITION only in beginning
  //   if (elapsed < 0.05) {
  //     activeModel.position.set(
  //       jumpStartPosition.x,
  //       jumpStartPosition.y,
  //       jumpStartPosition.z
  //     );
  //     activeModel.rotation.y = Math.PI / -7; // force right angle
  //   }

  //   if (elapsed < 1.2) {
  //     const angle = activeModel.rotation.y;
  //     const distance = elapsed * 5; // adjust speed
  //     activeModel.position.x =
  //       jumpStartPosition.x - 1 + Math.sin(angle) * distance;
  //     activeModel.position.z =
  //       jumpStartPosition.z - 14.5 + Math.cos(angle) * distance;
  //   } else {
  //     jumpForwardActive = false; // Stop pushing after 1.2 seconds
  //   }

  //   activeModel.position.y = -1.55; // lock Y height
  // }

  // 🔴 RED UPPERCUT
 // 🔴 RED UPPERCUT MOVEMENT
// if (
//   activeModel &&
//   currentPose.includes("red_uppercut") &&
//   redUppercutActive
// ) {
//   const now = time;

//   if (now >= redUppercutStopTime) {
//     redUppercutActive = false;

//     // 🚫 Stop sliding by fixing the final position
//     const finalDistance = (redUppercutStopTime - redUppercutDelayStart) * 2.2;
//     const angle = activeModel.rotation.y;
//     activeModel.position.x = redUppercutStartX + Math.sin(angle) * finalDistance;
//     activeModel.position.z = redUppercutStartZ + Math.cos(angle) * finalDistance;
//     return;
//   }

//   if (now >= redUppercutDelayStart) {
//     const elapsed = now - redUppercutDelayStart;
//     const slideSpeed = 3; // ← tweak this to cover more or less

//     const distance = elapsed * slideSpeed;
//     const angle = activeModel.rotation.y;

//     activeModel.position.x = redUppercutStartX + Math.sin(angle) * distance;
//     activeModel.position.z = redUppercutStartZ + Math.cos(angle) * distance;
//     activeModel.position.y = -1.55;
//   }
// }

  if (activeModel && currentPose.includes("yellow_capo_wind")) {
    activeModel.position.x = Math.sin(time * 1) * 1; //slide left-right
  }
  //  💚 ✅ Green salsa dancing- side to side 💚 ✅
   if (activeModel && currentPose.includes("green_salsa")) {
    activeModel.position.x = Math.sin(time * .5) * 2; // tweak rang/speed
    activeModel.position.y = -1.55; // Lock Y if needed
   }
//  💚 ✅ Green Thriller - side to side 💚 ✅
   if (activeModel && currentPose.includes("green_thriller")) {
    activeModel.position.x = Math.sin(time * -.8) * .8; // tweak rang/speed
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
  // if (catModel) {
  // Return to original hip-hop dance bounce
  // catModel.position.x = Math.sin(time * 0.5) * 0.5;
  // catModel.position.z = -0.5 + Math.cos(time * 0.4) * -0.1;
  // catModel.position.x = Math.sin(time) * 0.6; //side-side
  // catModel.position.y = -1.5; // this

  //   catModel.position.z = 0.4 + Math.cos(time * 0.4) * -0.1;
  //   catModel.position.x = Math.sin(time) * 0.1; //side-side
  //   catModel.position.y = -2.5; // this
  //   catModel.rotation.y = 0.9;
  // }
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

// loadAndDisplayFBX("./models/cat_idle_chi.fbx", {
//   scale: [0.001, 0.001, 0.001],
//   position: [0, 0, 0], // move model up
//   rotationY: Math.PI / 7,

// loadAndDisplayFBX('./models/green_drunk.fbx', {
//   scale: [0.0015, 0.0015, 0.0015],
//   position: [0, -1, -1.5],
//   rotationY: Math.PI / 9,
// });

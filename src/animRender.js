import * as THREE from "@lib/three.module.js";
import { FBXLoader } from "@lib/FBXLoader.js";

console.log("✅ Three.js and FBXLoader loaded successfully!");

// ── Module-level state ────────────────────────────────────────────────────────
const textureLoader = new THREE.TextureLoader();
const clock = new THREE.Clock();

let currentLoadToken = 0;
let activeModel = null;
let mixer = null;
let time = 0;
let currentPose = "";
let catMaskCanvas = null;
let catMaskContext = null;
let lastBaseScale = [0.001, 0.001, 0.001];

// Initialized inside initRenderer()
let scene, petRoot, camera, renderer;
let ambientLight, directionalLight, light, topLight, sideLight, backLight;

// ── White stage lights (Three.js objects — no DOM) ────────────────────────────
const whiteStageBottomLight = new THREE.PointLight(0xff99cc, 0, 35);
whiteStageBottomLight.position.set(0, 6, 8);

const whiteStageLeftLight = new THREE.PointLight(0x00bbff, 90, 40);
whiteStageLeftLight.position.set(-13, 6, 6);
whiteStageLeftLight.decay = 1.2;

const whiteStageTopRightLight = new THREE.PointLight(0xff00ff, 250, 90);
whiteStageTopRightLight.position.set(0, 10, 7);

const whiteStageTopLeftLight = new THREE.PointLight(0xff5500, 80, 35);
whiteStageTopLeftLight.position.set(-7, 10, 7);

const whiteStageInnerLight = new THREE.PointLight(0xffcc33, 50, 15);
whiteStageInnerLight.position.set(7, 2, 0);

// ── Responsive helpers ────────────────────────────────────────────────────────
function resizeRendererToContainer(renderer, camera) {
  const container = document.getElementById("pet-container");
  if (!container) return;
  const width = Math.floor(container.clientWidth);
  const height = Math.floor(container.clientHeight);
  const canvas = renderer.domElement;

  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

function fitModelForViewport(model, baseScale = [0.001, 0.001, 0.001]) {
  if (!model) return;

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  if (!isMobile) {
    model.scale.set(baseScale[0], baseScale[1], baseScale[2]);
    return;
  }

  const container = document.getElementById("pet-container");
  const w = container ? container.clientWidth : window.innerWidth;

  // k=1.21 at 360px (narrowest), eases to k=1.0 at 900px
  const t = Math.max(360, Math.min(900, w));
  const k = 1.21 - ((t - 360) / (900 - 360)) * 0.21;

  model.scale.set(baseScale[0] * k, baseScale[1] * k, baseScale[2] * k);
}

// ── Functions ─────────────────────────────────────────────────────────────────
export function clearActiveModel() {
  if (activeModel) {
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
    petRoot.remove(obj);
  }
}

// DIGITS set(X, Y, Z)
// X: Negative = left, Positive = right
// Y: Positive = up
// Z: Positive = toward camera, Negative = away from camera
function getCatMaskData() {
  if (!activeModel) return null;

  const box = new THREE.Box3().setFromObject(activeModel);
  const center = box.getCenter(new THREE.Vector3());

  // offsetWidth/offsetHeight used (not getBoundingClientRect) because the
  // renderer is sized from layout dimensions, and CSS left/top are in layout space
  const container = document.getElementById("pet-container");
  const layoutW = container.offsetWidth || 990;
  const layoutH = container.offsetHeight || 600;

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
    const myToken = ++currentLoadToken;

    loader.load(
      path,
      (fbx) => {
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

        clearActiveModel();

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

        petRoot.add(fbx);
        activeModel = fbx;
        currentPose = path;
        fitModelForViewport(activeModel, lastBaseScale);

        mixer = new THREE.AnimationMixer(fbx);
        const clip = fbx.animations?.[0];
        if (clip) {
          const action = mixer.clipAction(clip);
          if (options.loop === false) {
            action.setLoop(THREE.LoopOnce);
            action.clampWhenFinished = true;
            mixer.addEventListener("finished", () => {
              console.log("🛑 Animation finished, freezing at final frame");
              mixer.timeScale = 0;
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

export function setWhiteStageLighting(enabled) {
  ambientLight.intensity = 1.5;
  directionalLight.intensity = 1.3;
  light.intensity = 1.3;
  topLight.intensity = 0.9;
  sideLight.intensity = 2.0;
  backLight.intensity = 0.6;

  whiteStageBottomLight.intensity = 12;
  whiteStageLeftLight.intensity = 50;
  whiteStageTopRightLight.intensity = 18;
  whiteStageTopLeftLight.intensity = 40;
  whiteStageInnerLight.intensity = 12;
}

export { loadAndDisplayFBX, getCatMaskData };

// ── Init ──────────────────────────────────────────────────────────────────────
export function initRenderer() {
  // Scene
  scene = new THREE.Scene();
  petRoot = new THREE.Group();
  scene.add(petRoot);

  const bgLoader = new THREE.TextureLoader();
  bgLoader.load("/4th_.jpg", (texture) => {
    scene.background = texture;
  });

  // Lights
  ambientLight = new THREE.AmbientLight(0x000ff, 1.4);
  scene.add(ambientLight);

  scene.add(
    whiteStageBottomLight,
    whiteStageLeftLight,
    whiteStageTopRightLight,
    whiteStageTopLeftLight,
    whiteStageInnerLight,
  );

  directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.castShadow = true;
  directionalLight.position.set(-2, 10, 6.5);

  light = new THREE.DirectionalLight(0xff00ff, 1.5);
  light.position.set(2, 4, 2);

  topLight = new THREE.DirectionalLight(0xff0099, 0.8);
  topLight.position.set(0, 5, 0);
  topLight.castShadow = true;
  topLight.shadow.mapSize.width = 512;

  sideLight = new THREE.DirectionalLight(0x0000ff, 0.5);
  sideLight.position.set(-5, 2, 0);
  sideLight.castShadow = true;

  backLight = new THREE.DirectionalLight(0x00ffff, 0.3);
  backLight.position.set(0, 2, -5);
  backLight.target.position.set(0, 1, 0);
  backLight.castShadow = true;
  backLight.shadow.camera.left = -2;
  backLight.shadow.camera.right = 2;
  backLight.shadow.camera.top = 2;
  backLight.shadow.camera.bottom = -2;
  backLight.shadow.camera.near = 0.5;
  backLight.shadow.camera.far = 10;
  backLight.shadow.mapSize.width = 1024;
  backLight.shadow.mapSize.height = 1024;
  scene.add(backLight, backLight.target);

  const groundGeometry = new THREE.PlaneGeometry(10, 10);
  const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.7;
  ground.receiveShadow = true;

  scene.add(light, ground, topLight, sideLight, directionalLight);

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(0, 1.5, 3);

  // Renderer — attach canvas to DOM
  const petContainer = document.getElementById("pet-container");
  const PET_WIDTH = petContainer.offsetWidth || 990;
  const PET_HEIGHT = petContainer.offsetHeight || 600;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(PET_WIDTH, PET_HEIGHT);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  petContainer.appendChild(renderer.domElement);

  resizeRendererToContainer(renderer, camera);
  camera.aspect = PET_WIDTH / PET_HEIGHT;
  camera.updateProjectionMatrix();

  // Event listeners
  window.addEventListener("resize", () => {
    resizeRendererToContainer(renderer, camera);
    fitModelForViewport(activeModel, lastBaseScale);
  });

  window.addEventListener("orientationchange", () => {
    // Wait for CSS media queries to settle before resizing
    setTimeout(() => {
      resizeRendererToContainer(renderer, camera);
      fitModelForViewport(activeModel, lastBaseScale);
    }, 150);
  });

  // Force resize after full page load — CSS media queries may not have applied
  // when the renderer was first sized, causing a blurry canvas on mobile
  window.addEventListener("load", () => {
    resizeRendererToContainer(renderer, camera);
    fitModelForViewport(activeModel, lastBaseScale);
  });

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  time += delta;

  if (activeModel && currentPose.includes("yellow_capo_wind")) {
    activeModel.position.x = Math.sin(time * 1) * 1;
  }
  if (activeModel && currentPose.includes("green_salsa")) {
    activeModel.position.x = Math.sin(time * 0.5) * 2;
    activeModel.position.y = -1.55;
  }
  if (activeModel && currentPose.includes("green_thriller")) {
    activeModel.position.x = Math.sin(time * -0.8) * 0.8;
    activeModel.position.y = -2;
  }
  if (activeModel && currentPose.includes("White_thriller")) {
    activeModel.position.x = 0.1;
    activeModel.position.z = -3.5;
    activeModel.position.y = -1;

    directionalLight.position.set(-2, 6, 8);
    directionalLight.target.position.set(0, 1, 0);
    directionalLight.target.updateMatrixWorld();
  } else {
    directionalLight.position.set(-2, 10, 6.5);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.target.updateMatrixWorld();
  }

  if (mixer) mixer.update(delta);

  renderer.render(scene, camera);
}

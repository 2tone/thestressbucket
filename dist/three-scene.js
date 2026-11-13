import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createBucket } from "./bucket.js";
import { createTap } from "./tap.js";
import { createReturnPipe } from "./return-pipe.js";
import { createRainCloud } from "./rain-cloud.js";
import { createBucketWater } from "./bucket-water.js";
import { createOverflowWater } from "./overflow-water.js";
import { createWaterMaterial } from "./water-material.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x141923);

const sceneContents = new THREE.Group();
sceneContents.rotation.y = Math.PI / 2;
sceneContents.position.y = -0.9;
scene.add(sceneContents);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(2.2, 1.8, 5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.enablePan = true;
controls.enableDamping = true;
controls.minDistance = 2;
controls.maxDistance = 15;

document.querySelector("#reset-view").addEventListener("click", () => {
  camera.position.set(2.2, 1.8, 5);
  controls.target.set(0, 0, 0);
  controls.update();
});

scene.add(new THREE.AmbientLight(0xffffff, 1.5));

const keyLight = new THREE.DirectionalLight(0xffffff, 2);
keyLight.position.set(3, 4, 5);
scene.add(keyLight);

const bucket = createBucket(THREE);
bucket.rotation.y = Math.atan2(camera.position.x, camera.position.z);
const unhealthyTap = createTap(THREE);
bucket.add(unhealthyTap);
const healthyTap = createTap(THREE, { angle: Math.PI, y: -0.36 });
bucket.add(healthyTap);
const returnPipe = createReturnPipe(THREE);
bucket.add(returnPipe.group);
const bucketWater = createBucketWater(THREE);
bucket.add(bucketWater.water);
const overflowWater = createOverflowWater(THREE);
bucket.add(overflowWater.group);
let hasHealthyDetails = false;

function updateCopingEffects({ hasUnhealthyDetails, healthyCount }) {
  returnPipe.setFlowing(hasUnhealthyDetails);
  bucketWater.setHalfFull(
    healthyCount >= 3 || (!hasUnhealthyDetails && healthyCount >= 2)
  );
  hasHealthyDetails = healthyCount > 0;
}

updateCopingEffects({
  hasUnhealthyDetails: document.querySelector(
    'tr[data-category="unhealthy"] td'
  ) !== null,
  healthyCount: document.querySelectorAll(
    'tr[data-category="healthy"] td'
  ).length,
});
window.addEventListener("coping-details-change", (event) => {
  updateCopingEffects(event.detail);
});

const drip = new THREE.Mesh(
  new THREE.SphereGeometry(0.035, 12, 10),
  createWaterMaterial(THREE)
);
drip.scale.set(0.8, 1.8, 0.8);
drip.position.set(0, -0.18, 0.44);
drip.visible = false;
healthyTap.add(drip);

function createTextLabel(text, color) {
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 512;
  labelCanvas.height = 128;
  const context = labelCanvas.getContext("2d");
  if (!context) {
    throw new Error(`Unable to create the "${text}" label canvas.`);
  }

  context.font = "700 48px system-ui, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = color;
  context.fillText(text, labelCanvas.width / 2, labelCanvas.height / 2);

  const texture = new THREE.CanvasTexture(labelCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true })
  );
}

const healthyLabel = createTextLabel("Healthy coping", "#62d957");
healthyLabel.position.set(0, -1.05, -1.15);
healthyLabel.scale.set(1.7, 0.42, 1);
sceneContents.add(healthyLabel);

const unhealthyLabel = createTextLabel("Unhealthy coping", "#ff4b4b");
unhealthyLabel.position.set(0, -1.05, 1.15);
unhealthyLabel.scale.set(2.0, 0.42, 1);
sceneContents.add(unhealthyLabel);
sceneContents.add(bucket);

const rainCloud = createRainCloud(THREE);
sceneContents.add(rainCloud.group);

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

window.addEventListener("resize", resize);

const clock = new THREE.Clock();
let dripStartedAt = null;
function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();
  rainCloud.update(elapsedTime);
  returnPipe.update(elapsedTime);
  const waterLevel = bucketWater.update(elapsedTime);
  overflowWater.setFlowing(bucketWater.isOverflowing());
  overflowWater.update(elapsedTime);
  const tapOutletLevel = healthyTap.position.y - 0.18;
  if (hasHealthyDetails && waterLevel >= tapOutletLevel) {
    if (dripStartedAt === null) {
      dripStartedAt = elapsedTime;
    }

    const dripProgress = ((elapsedTime - dripStartedAt) % 0.9) / 0.9;
    drip.visible = dripProgress < 0.75;
    drip.position.y = -0.18 - dripProgress * 0.52;
  } else {
    dripStartedAt = null;
    drip.visible = false;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

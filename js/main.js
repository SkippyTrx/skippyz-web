import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/postprocessing/OutlinePass.js";

// Audio setup
const startupSound = new Audio('./sounds/startup.mp3');
const idleSound = new Audio('./sounds/idle.mp3');
idleSound.loop = true;

let bonnetSoundPlaying = false; // tracks if startup/idle sequence is active

let paused = false;

// Scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
document.getElementById("container3D").appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 1));
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const sideLightRight = new THREE.DirectionalLight(0xffffff, 1.5);
sideLightRight.position.set(-10, 15, 0);
scene.add(sideLightRight);

const sideLightLeft = new THREE.DirectionalLight(0xffffff, 1.5);
sideLightLeft.position.set(10, 5, 0);
scene.add(sideLightLeft);

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Composer + OutlinePass
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outlinePass.edgeStrength = 4;
outlinePass.edgeGlow = 0.3;
outlinePass.edgeThickness = 2;
outlinePass.visibleEdgeColor.set("#ff0000");
outlinePass.hiddenEdgeColor.set("#000000");
outlinePass.renderToScreen = true;
composer.addPass(outlinePass);

// Load GLTF
let model, bonnet, bonnetPivot, boot, bootPivot;
let bonnetOpen = false;
let bootOpen = false;

let doorLeft, doorLeftPivot, doorLeftOpen = false;
let doorRight, doorRightPivot, doorRightOpen = false;

const loader = new GLTFLoader();
loader.load("./models/myModel.glb", (gltf) => {
  model = gltf.scene;
  model.scale.set(2,2,2);
  scene.add(model);

  // --- BONNET ---
  bonnet = model.getObjectByName("Bonnet");
  if (!bonnet) console.error("Bonnet not found!");

  bonnetPivot = new THREE.Object3D();
  model.add(bonnetPivot);

  const bboxBonnet = new THREE.Box3().setFromObject(bonnet);
  const hingeXb = (bboxBonnet.min.x + bboxBonnet.max.x)/2;
  const hingeYb = bboxBonnet.min.y;
  const hingeZb = bboxBonnet.max.z;
  bonnetPivot.position.set(hingeXb, hingeYb, hingeZb);
  bonnet.position.sub(bonnetPivot.position);
  bonnetPivot.add(bonnet);

  // --- BOOT ---
  boot = model.getObjectByName("Boot");
  if (!boot) console.error("Boot not found!");

  bootPivot = new THREE.Object3D();
  model.add(bootPivot);

  const bboxBoot = new THREE.Box3().setFromObject(boot);
  const hingeXboot = (bboxBoot.min.x + bboxBoot.max.x)/2;
  const hingeYboot = bboxBoot.min.y;
  const hingeZboot = bboxBoot.min.z;
  bootPivot.position.set(hingeXboot, hingeYboot, hingeZboot);
  boot.position.sub(bootPivot.position);
  bootPivot.add(boot);

  // --- DOOR LEFT ---
  doorLeft = model.getObjectByName("DoorLeft");
  if (!doorLeft) console.error("DoorLeft not found!");

  doorLeftPivot = new THREE.Object3D();
  model.add(doorLeftPivot);

  const bboxDoorLeft = new THREE.Box3().setFromObject(doorLeft);
  const hingeXLeft = (bboxDoorLeft.min.x)+0.5;
  const hingeYLeft = bboxDoorLeft.min.y;
  const hingeZLeft = bboxDoorLeft.min.z;

  doorLeftPivot.position.set(hingeXLeft, hingeYLeft, hingeZLeft);
  doorLeft.position.sub(doorLeftPivot.position);
  doorLeftPivot.add(doorLeft);

  // --- DOOR RIGHT ---
  doorRight = model.getObjectByName("DoorRight");
  if (!doorRight) console.error("DoorRight not found!");

  doorRightPivot = new THREE.Object3D();
  model.add(doorRightPivot);

  const bboxDoorRight = new THREE.Box3().setFromObject(doorRight);
  const hingeXRight = bboxDoorRight.max.x-0.5;
  const hingeYRight = bboxDoorRight.min.y;
  const hingeZRight = bboxDoorRight.min.z;
  doorRightPivot.position.set(hingeXRight, hingeYRight, hingeZRight);
  doorRight.position.sub(doorRightPivot.position);
  doorRightPivot.add(doorRight);

  animate();
}, undefined, (err)=>console.error(err));

// Mouse hover detection
window.addEventListener("mousemove", (event)=>{
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  let intersects = [];
  if(bonnet) intersects = raycaster.intersectObject(bonnet, true);
  if(intersects.length === 0 && boot) intersects = raycaster.intersectObject(boot, true);
  if(intersects.length === 0 && doorLeft) intersects = raycaster.intersectObject(doorLeft, true);
  if(intersects.length === 0 && doorRight) intersects = raycaster.intersectObject(doorRight, true);

  outlinePass.selectedObjects = intersects.length > 0 ? [intersects[0].object] : [];
  document.body.style.cursor = intersects.length > 0 ? "pointer" : "default";
});

window.addEventListener("click", () => {
  raycaster.setFromCamera(mouse, camera);

  let intersects = [];
  if (bonnet) intersects = raycaster.intersectObject(bonnet, true);
  if (intersects.length > 0 && bonnetPivot) {
    bonnetOpen = !bonnetOpen;
    return;
  }

  if (boot) intersects = raycaster.intersectObject(boot, true);
  if (intersects.length > 0 && bootPivot) {
    bootOpen = !bootOpen;
    return;
  }

  if (doorLeft) intersects = raycaster.intersectObject(doorLeft, true);
  if (intersects.length > 0 && doorLeftPivot) {
    doorLeftOpen = !doorLeftOpen;
    return;
  }

  if (doorRight) intersects = raycaster.intersectObject(doorRight, true);
  if (intersects.length > 0 && doorRightPivot) {
    doorRightOpen = !doorRightOpen;
    return;
  }

// If no part is clicked, toggle paused
  if (intersects.length === 0) {
    paused = !paused;
  }
});
// Spacebar to pause/resume rotation
window.addEventListener("keydown", (event) => {
  if(event.code === "Space"){
    paused = !paused;
  }
});

// Mobile tap 
renderer.domElement.addEventListener("touchstart", (e) => {
  e.preventDefault(); // prevents scrolling
  paused = !paused;
  console.log("Paused:", paused);
});

// Camera
camera.position.set(0,10,35);

// Window resize
window.addEventListener("resize", ()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// Stars
function addStars(){
  const geom = new THREE.BufferGeometry();
  const verts = [];
  for(let i=0;i<1000;i++){
    verts.push(
      THREE.MathUtils.randFloatSpread(2000),
      THREE.MathUtils.randFloatSpread(2000),
      THREE.MathUtils.randFloatSpread(2000)
    );
  }
  geom.setAttribute("position", new THREE.Float32BufferAttribute(verts,3));
  const pts = new THREE.Points(geom, new THREE.PointsMaterial({color:0xffffff, size:0.5}));
  scene.add(pts);
}
addStars();

function animate(){
  requestAnimationFrame(animate);

  if(model && !paused) model.rotation.y += 0.005;


  // Smooth bonnet rotation
  if(bonnetPivot){
    const targetRotation = bonnetOpen ? -Math.PI/4 : 0;
    bonnetPivot.rotation.x -= (targetRotation + bonnetPivot.rotation.x) * 0.05;
  }

  // Smooth boot rotation
  if(bootPivot){
    const targetRotation = bootOpen ? Math.PI/4 : 0;
    bootPivot.rotation.x -= (targetRotation + bootPivot.rotation.x) * 0.05;
  }

  // Smooth DoorLeft rotation
  if(doorLeftPivot){
    const targetRotation = doorLeftOpen ? Math.PI/3 : 0;
    doorLeftPivot.rotation.y -= (targetRotation + doorLeftPivot.rotation.y) * 0.05;
  }

  // Smooth DoorRight rotation
  if(doorRightPivot){
    const targetRotation = doorRightOpen ? -Math.PI/3 : 0;
    doorRightPivot.rotation.y -= (targetRotation + doorRightPivot.rotation.y) * 0.05;
  }
  if (bonnetPivot) {
    const targetRotation = bonnetOpen ? -Math.PI/4 : 0;
    bonnetPivot.rotation.x -= (targetRotation + bonnetPivot.rotation.x) * 0.05;

  // Audio logic
  if (bonnetOpen && !bonnetSoundPlaying) {
      bonnetSoundPlaying = true;
      startupSound.play();
      startupSound.onended = () => {
          idleSound.play(); // start looping idle after startup finishes
      };
    } else if (!bonnetOpen && bonnetSoundPlaying) {
      bonnetSoundPlaying = false;
      startupSound.pause();
      startupSound.currentTime = 0;
      idleSound.pause();
      idleSound.currentTime = 0;
    }
  }
  controls.update();
  composer.render();
}





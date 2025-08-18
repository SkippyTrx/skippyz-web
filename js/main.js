// Import modules directly from Skypack CDN
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container3D").appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // smooth movement
controls.dampingFactor = 0.05;

// Lighting
const ambientLight = new THREE.AmbientLight(0xcccccc, 3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 6);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Load GLB model
let model;
const loader = new GLTFLoader();
loader.load(
  "./models/myModel.glb", // <-- your model path
  function (gltf) {
    model = gltf.scene;

    // Optional: scale and position model
    model.scale.set(2, 2, 2); // adjust size
    model.position.set(0, 0, 0);

    scene.add(model);

    // Optionally rotate slowly
    animate();
  },
  undefined,
  function (error) {
    console.error("Error loading model:", error);
  }
);

// Camera initial position
camera.position.set(0, 10, 35);

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  if (model) {
    model.rotation.y += 0.005; // slow rotation
  }

  controls.update();
  renderer.render(scene, camera);
}

// Add stars
function addStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 1000;
  const starVertices = [];

  for (let i = 0; i < starCount; i++) {
    const x = THREE.MathUtils.randFloatSpread(2000);
    const y = THREE.MathUtils.randFloatSpread(2000);
    const z = THREE.MathUtils.randFloatSpread(2000);
    starVertices.push(x, y, z);
  }

  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}

addStars();

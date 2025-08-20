// script.js - Caravanserai frontend

import * as THREE from "https://unpkg.com/three@0.155.0/build/three.module.js";
import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

// 👉 CHANGE THIS to your real Hugging Face Space ID
const HF_SPACE = "BlueWolfCaravan/caravanserai-backend";

// If the Space is private, add your token here (⚠ not recommended for production):
// const HF_OPTIONS = { hf_token: "hf_XXXXXXXXXXXXXXXX" };
const HF_OPTIONS = {};

let hfApp = null;
async function connectToSpace() {
  try {
    hfApp = await Client.connect(HF_SPACE, HF_OPTIONS);
    console.log("✅ Connected to HF Space:", HF_SPACE);
  } catch (err) {
    console.error("❌ Failed to connect:", err);
    hfApp = null;
  }
}
connectToSpace();

// --- THREE.JS setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#world'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('pointerdown', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([cube]);
  if (intersects.length > 0) {
    handleCubeClick(intersects);
  }
});

// --- AI Call ---
let conversationHistory = "";

async function handleCubeClick(intersects) {
  try {
    const userInput = window.prompt("Ask Tariq:", "Hello, traveler!");
    if (!userInput) return;

    intersects[0].object.material.color.set(0xffff00);

    if (!hfApp) {
      await connectToSpace();
      if (!hfApp) return;
    }

    const payload = [userInput, conversationHistory];
    const result = await hfApp.predict("/predict", payload);

    console.log("Raw HF result:", result);

    if (result?.data && Array.isArray(result.data)) {
      const tariqResponse = result.data[0];
      conversationHistory = result.data[1] || conversationHistory;
      console.log("🗣 Tariq:", tariqResponse);
      alert("Tariq says: " + tariqResponse);
    }

    setTimeout(() => {
      intersects[0].object.material.color.set(0x00ff00);
      setTimeout(() => intersects[0].object.material.color.set(0x0077ff), 700);
    }, 250);

  } catch (err) {
    console.error("Error calling HF Space:", err);
    intersects[0].object.material.color.set(0xff0000);
    setTimeout(() => intersects[0].object.material.color.set(0x0077ff), 800);
  }
}

// --- Animation ---
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.008;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();

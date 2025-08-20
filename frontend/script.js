// script.js - replacement (module)
// Drop this into frontend/script.js and remove the file's '...' placeholders.

// Three.js + Gradio JS client
import * as THREE from "https://unpkg.com/three@0.155.0/build/three.module.js";
import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

const HF_SPACE = "your-username/your-space"; 
// Example formats accepted:
//   "your-username/your-space"   (recommended)
//   "https://your-username-your-space.hf.space" (full URL also works)

// If your Space is private, DO NOT hardcode a token into client-side JS in production.
// For quick testing you can add your token here (NOT recommended for production):
// const HF_OPTIONS = { hf_token: "hf_XXXXXXXXXXXXXXXX" };
// Better: call from a server or make the Space public.
const HF_OPTIONS = {}; // or { hf_token: "hf_..." }

let hfApp = null;
async function connectToSpace() {
  try {
    // Connect once on page load
    hfApp = await Client.connect(HF_SPACE, HF_OPTIONS);
    console.log("Connected to HF Space:", HF_SPACE);
    // Optional: inspect available endpoints
    // const api = await hfApp.view_api();
    // console.log("Space API:", api);
  } catch (err) {
    console.error("Failed to connect to HF Space:", err);
    hfApp = null;
  }
}
connectToSpace();

// --- THREE.JS boilerplate ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#world'),
  antialias: true
});
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

// Raycaster for clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onPointerDown(event) {
  // Normalize device coords
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects([cube]);
  if (intersects.length > 0) {
    // Cube was clicked
    handleCubeClick(intersects);
  }
}
window.addEventListener('pointerdown', onPointerDown, false);

// --- When cube clicked: ask user and call HF Space ---
let conversationHistory = ""; // keep in memory (optional)

async function handleCubeClick(intersects) {
  try {
    // Example: prompt the user for input; replace with your UI if you prefer
    const userInput = window.prompt("Ask Tariq (type your message):", "Hello, traveler!");
    if (!userInput) return;

    // Visual feedback
    intersects[0].object.material.color.set(0xffff00);

    // Ensure HF client is connected
    if (!hfApp) {
      await connectToSpace();
      if (!hfApp) {
        console.error("Cannot call HF Space: not connected.");
        return;
      }
    }

    // Call the predict endpoint. Your backend's interface has two inputs: message and history.
    // Most Gradio Spaces expose the default endpoint "/predict".
    // We pass an array matching the input component order (message, history).
    const payload = [userInput, conversationHistory];
    const result = await hfApp.predict("/predict", payload);

    // The result format depends on your Gradio app; typically it returns .data or an array
    console.log("Raw HF result:", result);

    // Try common result formats:
    let modelResponse = null;
    if (result?.data) {
      // Often result.data is an array of outputs
      modelResponse = result.data[0] ?? result.data;
    } else if (Array.isArray(result)) {
      modelResponse = result[0];
    } else {
      modelResponse = result;
    }

    // If your backend returns [response_text, updated_history], handle that:
    if (Array.isArray(modelResponse) && modelResponse.length >= 1) {
      const first = modelResponse[0];
      // If the backend returned both outputs, first may be the text response.
      console.log("Tariq:", first);
      // try to update conversationHistory with the second element if present
      if (modelResponse.length >= 2) {
        conversationHistory = modelResponse[1];
      } else if (result?.data?.length >= 2) {
        conversationHistory = result.data[1];
      }
    } else {
      // fallback
      console.log("Tariq (fallback):", modelResponse);
    }

    // Flash green to indicate success
    setTimeout(() => {
      intersects[0].object.material.color.set(0x00ff00);
      setTimeout(() => {
        intersects[0].object.material.color.set(0x0077ff);
      }, 700);
    }, 250);

  } catch (err) {
    console.error("Error calling HF Space:", err);
    // Flash red on error
    intersects[0].object.material.color.set(0xff0000);
    setTimeout(() => intersects[0].object.material.color.set(0x0077ff), 800);
  }
}

// --- Animation loop ---
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.008;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();

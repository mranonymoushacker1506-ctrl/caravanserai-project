// script.js - FINAL SIMPLIFIED VERSION

import * as THREE from "https://unpkg.com/three@0.155.0/build/three.module.js";
import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client@0.1.4/dist/index.min.js";
import { GLTFLoader } from "https://unpkg.com/three@0.155.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://unpkg.com/three@0.155.0/examples/jsm/controls/OrbitControls.js";

// --- AI Connection ---
const HF_SPACE = "BlueWolfCaravan/caravanserai-backend";
let hfApp = null;
async function connectToSpace() {
  try {
    hfApp = await Client.connect(HF_SPACE);
    console.log("✅ Connected to HF Space:", HF_SPACE);
  } catch (err) {
    console.error("❌ Failed to connect:", err);
    hfApp = null;
  }
}
connectToSpace();

// --- THREE.JS Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#world'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// --- Camera Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
// Set a generous but limited zoom range
controls.minDistance = 2;
controls.maxDistance = 20;

// --- REMOVED MY CUSTOM LIGHTING AND SHADOWS ---
// We will let the 3D model's own built-in lighting shine through.
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // Add a simple, bright ambient light
scene.add(ambientLight);

// --- Load the 3D Model ---
const loader = new GLTFLoader();
let stallModel;
loader.load('stall.glb', (gltf) => {
    stallModel = gltf.scene;
    scene.add(stallModel);
    
    // --- NEW: Simple and Direct Camera Position ---
    // This manually sets the camera to a position that frames the model well.
    camera.position.set(4, 3, 6); 
    controls.target.set(0, 1, 0); // Look at the center of the stall
    controls.update();

    console.log("3D model loaded and framed!");
});

// --- AI Call Logic ---
let conversationHistory = "";
async function handleModelClick() {
    try {
        const userInput = window.prompt("Ask Tariq:", "Tell me a story about your travels.");
        if (!userInput) return;
        document.body.style.cursor = 'wait';
        if (!hfApp) await connectToSpace();
        if (!hfApp) throw new Error("Could not connect to AI Space.");
        const result = await hfApp.predict("/predict", {
            user_input: userInput,
            history: conversationHistory,
        });
        document.body.style.cursor = 'default';
        if (result?.data && Array.isArray(result.data)) {
            const tariqResponse = result.data[0];
            conversationHistory = result.data[1] || conversationHistory;
            alert("Tariq says: " + tariqResponse);
        }
    } catch (err) {
        document.body.style.cursor = 'default';
        console.error("Error calling HF Space:", err);
        alert("An error occurred while talking to the AI.");
    }
}

// --- Making the Model Clickable ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('pointerdown', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    if (stallModel) {
        const intersects = raycaster.intersectObjects(stallModel.children, true);
        if (intersects.length > 0) {
            handleModelClick();
        }
    }
});

// --- Animation ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
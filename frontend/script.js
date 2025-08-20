// script.js - FINAL STABILIZED VERSION

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
// Set a default camera position in case auto-framing fails
camera.position.set(2, 2, 5); 
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#world'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// --- Camera Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0); // Set a default target

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// --- Load the 3D Model ---
const loader = new GLTFLoader();
let stallModel;
loader.load('stall.glb', (gltf) => {
    stallModel = gltf.scene;
    scene.add(stallModel);
    
    // --- NEW: Robust Automatic Camera Framing with Safety Checks ---
    try {
        const box = new THREE.Box3().setFromObject(stallModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Safety check to ensure the model has a valid size
        if (size.x === 0 && size.y === 0 && size.z === 0) {
            console.warn("Model has no size, using default camera position.");
            controls.update();
            return;
        }

        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

        // Safety check for calculated values
        if (isFinite(cameraZ)) {
            camera.position.set(center.x, center.y, center.z + cameraZ * 1.75);
            controls.target.copy(center);
        } else {
             console.warn("Could not calculate camera position, using default.");
        }

    } catch(e) {
        console.error("Error during camera auto-framing:", e);
    }

    controls.update();
    console.log("3D model loaded!");
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
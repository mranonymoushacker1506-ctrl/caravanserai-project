// script.js - THE FINAL, COMPLETE PROJECT

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { client } from "https://cdn.jsdelivr.net/npm/@gradio/client@0.1.4/dist/index.min.js";

// --- Basic Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2, 2, 5);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#world'),
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);

// --- Camera Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// --- Load the 3D Model ---
const loader = new GLTFLoader();
let stallModel; // A variable to hold our model
loader.load('stall.glb', (gltf) => {
    stallModel = gltf.scene;
    scene.add(stallModel);
    console.log("3D model loaded successfully!");
});

// --- State for Conversation History ---
let conversationHistory = "";

// --- Communication with the LIVE AI Backend using the Gradio Client ---
async function askAI(message) {
    try {
        document.body.style.cursor = 'wait';
        const app = await client("BlueWolfCaravan/caravanserai-backend");
        const result = await app.predict("/predict", {
            user_input: message,
            history: conversationHistory,
        });
        document.body.style.cursor = 'default';
        const tariqResponse = result.data[0];
        conversationHistory = result.data[1];
        alert("Tariq says: " + tariqResponse);
    } catch (error) {
        document.body.style.cursor = 'default';
        console.error("Error communicating with AI:", error);
        alert("Could not connect to the AI's mind.");
    }
}

// --- Making the Model Clickable ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    // Check if the ray intersects with any part of the loaded model
    if (stallModel) {
        const intersects = raycaster.intersectObjects(stallModel.children, true);
        if (intersects.length > 0) {
            console.log("Model clicked!");
            askAI("Greetings, merchant. Tell me a story about this place.");
        }
    }
});

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
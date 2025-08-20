// script.js - FINAL VERSION with Auto-Framing and Your Working AI Code

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// Using the correct import from your working code
import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client@0.1.4/dist/index.min.js";

// --- Basic Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#world'),
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);

// --- Camera Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

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
    
    // --- NEW: Automatic Camera Framing ---
    // This code runs after the model is loaded to perfectly frame it.
    const box = new THREE.Box3().setFromObject(stallModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    
    // Position the camera to fit the model
    camera.position.set(center.x, center.y, center.z + cameraZ * 1.5);
    controls.target.copy(center);
    controls.update();

    console.log("3D model loaded and framed!");
});

// --- AI Connection (Using YOUR working code) ---
let hfApp = null;
async function connectToSpace() {
  try {
    hfApp = await Client.connect("BlueWolfCaravan/caravanserai-backend");
    console.log("✅ Connected to HF Space");
  } catch (err) {
    console.error("❌ Failed to connect:", err);
    hfApp = null;
  }
}
connectToSpace(); // Connect when the page loads

let conversationHistory = "";
async function askAI(message) {
    try {
        document.body.style.cursor = 'wait';
        if (!hfApp) {
            console.log("Not connected, attempting to reconnect...");
            await connectToSpace();
            if (!hfApp) { // If still not connected, show error
                alert("Could not connect to the AI's mind.");
                document.body.style.cursor = 'default';
                return;
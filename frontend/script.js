// script.js - FINAL VERSION WITH 3D MODEL

import * as THREE from 'three';
// NEW: Import the GLTF Loader and Orbit Controls
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Basic Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2, 2, 5); // Move the camera back and up to see the model
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#world'),
    antialias: true // Makes the model look smoother
});
renderer.setSize(window.innerWidth, window.innerHeight);

// --- NEW: Camera Controls ---
// This allows you to use your mouse to pan, zoom, and rotate the camera
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Makes the movement feel smoother
controls.target.set(0, 1, 0); // Aim the camera at a point slightly above the ground

// --- NEW: Lighting ---
// We need lights to see the details of the model
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft, general light
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // A stronger, sun-like light
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// --- NEW: Load the 3D Model ---
const loader = new GLTFLoader();
loader.load(
    // The name of your model file
    'stall.glb',
    // This function runs when the model has successfully loaded
    function (gltf) {
        const model = gltf.scene;
        scene.add(model);
        console.log("3D model loaded successfully!");
    },
    // This function runs while the model is loading (optional)
    undefined,
    // This function runs if there is an error loading the model
    function (error) {
        console.error("An error happened while loading the model:", error);
        alert("Could not load the 3D model. Make sure the file is named 'stall.glb' and is in the 'frontend' folder.");
    }
);

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update camera controls every frame
    renderer.render(scene, camera);
}
animate();

// --- NOTE: The AI connection code has been removed for this step ---
// We will add it back once the world is built.
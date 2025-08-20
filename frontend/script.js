// script.js - THE FINAL, CORRECTED LIVE VERSION

import * as THREE from "https://unpkg.com/three@0.155.0/build/three.module.js";
import { client } from "https://cdn.jsdelivr.net/npm/@gradio/client@0.1.4/dist/index.min.js";

// --- Basic Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#world'),
});
renderer.setSize(window.innerWidth, window.innerHeight);

// --- 3D Object ---
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// --- State for Conversation History ---
let conversationHistory = "";

// --- Communication with the LIVE AI Backend using the Gradio Client ---
async function askAI(message) {
    try {
        document.body.style.cursor = 'wait';

        // 1. Connect to your Hugging Face Space using its name
        const app = await client("BlueWolfCaravan/caravanserai-backend");

        // 2. Call the '/predict' endpoint with the correct data structure
        const result = await app.predict("/predict", {
            user_input: message,
            history: conversationHistory,
        });

        document.body.style.cursor = 'default';

        // The result data contains the response and updated history
        const tariqResponse = result.data[0];
        conversationHistory = result.data[1];

        console.log("AI Response:", tariqResponse);
        alert("Tariq says: " + tariqResponse);

    } catch (error) {
        document.body.style.cursor = 'default';
        console.error("Error communicating with AI:", error);
        alert("Could not connect to the AI's mind. Please check the backend status.");
    }
}

// --- Making the Cube Clickable ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([cube]);
    if (intersects.length > 0) {
        console.log("Cube clicked!");
        intersects[0].object.material.color.set(0xff0000);
        askAI("I've arrived in your world. What can you tell me about this place?");
        setTimeout(() => {
            intersects[0].object.material.color.set(0x00ff00);
        }, 1000);
    }
});

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();
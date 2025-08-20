// script.js - FINAL, DEFINITIVELY CORRECTED LIVE VERSION

import * as THREE from 'three';

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

// --- Communication with the LIVE AI Backend ---
async function askAI(message) {
    try {
        // THIS IS THE DEFINITIVE, CORRECT URL FOR YOUR API
        const API_URL = "https://bluewolfcaravan-caravanserai-backend.hf.space/run/predict";

        document.body.style.cursor = 'wait';

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: [
                    message,
                    conversationHistory
                ]
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        document.body.style.cursor = 'default';
        
        const tariqResponse = data.data[0]; 
        conversationHistory = data.data[1]; 

        console.log("AI Response:", tariqResponse);
        alert("Tariq says: " + tariqResponse);

    } catch (error) {
        document.body.style.cursor = 'default';
        console.error("Error communicating with AI:", error);
        alert("Could not connect to the AI's mind. Please check the URL and backend status.");
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
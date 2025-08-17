// script.js - Phase 4

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

// --- NEW: Communication with the AI Backend ---
async function askAI(message) {
    try {
        const response = await fetch('http://localhost:5000/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        });
        const data = await response.json();
        console.log("AI Response:", data.response);
        // We will display this response on the screen later. For now, we log it.
        alert("Tariq says: " + data.response);

    } catch (error) {
        console.error("Error communicating with AI:", error);
        alert("Could not connect to the AI's mind. Is the backend server running?");
    }
}

// --- NEW: Making the Cube Clickable ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    // Convert mouse click position to 3D world coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([cube]); // Check if the ray hits our cube

    if (intersects.length > 0) {
        // If the cube is clicked, change its color and ask the AI a question
        console.log("Cube clicked!");
        intersects[0].object.material.color.set(0xff0000); // Turn red
        askAI("I've arrived in your world. What can you tell me about this place?");
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
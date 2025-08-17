// script.js - FINAL LIVE VERSION

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
// This variable will store the chat history to give the AI "memory".
let conversationHistory = "";

// --- Communication with the LIVE AI Backend ---
async function askAI(message) {
    try {
        // This is your live backend URL.
        const API_URL = "https://huggingface.co/spaces/BlueWolfCaravan/caravanserai-backend/run/predict";

        // Show a loading indicator
        document.body.style.cursor = 'wait';

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Gradio API expects data in a specific format
            body: JSON.stringify({
                data: [
                    message,
                    conversationHistory // Send the current history
                ]
            })
        });
        const data = await response.json();
        
        // Remove the loading indicator
        document.body.style.cursor = 'default';
        
        // Gradio returns data in a list; the response is the first item
        const tariqResponse = data.data[0]; 
        // The updated history is the second item
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
    // Convert mouse click position to 3D world coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([cube]);

    if (intersects.length > 0) {
        console.log("Cube clicked!");
        intersects[0].object.material.color.set(0xff0000); // Turn red temporarily
        
        // Ask a question and then reset color after a moment
        askAI("I've arrived in your world. What can you tell me about this place?");
        setTimeout(() => {
             intersects[0].object.material.color.set(0x00ff00); // Turn back to green
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
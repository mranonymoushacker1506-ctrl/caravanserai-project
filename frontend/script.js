import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// --- NEW: Enable Shadows in the Renderer ---
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#world'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enable shadow mapping

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- REMOVED OLD LIGHTS ---

// --- NEW: Realistic Lighting with Shadows ---
// A soft ambient light to fill the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// A powerful spotlight to create strong shadows and highlights
const spotLight = new THREE.SpotLight(0xffffff, 3, 30, Math.PI * 0.15, 0.2);
spotLight.position.set(5, 10, 7.5);
spotLight.castShadow = true; // This light will cast shadows
// Configure shadow quality
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
scene.add(spotLight);


// --- Load the 3D Model ---
const loader = new GLTFLoader();
loader.load('stall.glb', (gltf) => {
    const model = gltf.scene;
    
    // --- NEW: Enable Shadows for the Model ---
    // Go through every part of the model and tell it to cast and receive shadows
    model.traverse(function (node) {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    });

    scene.add(model);

    // Auto-frame the model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    camera.position.set(center.x, center.y, center.z + cameraZ * 1.5);
    controls.target.copy(center);
    
    console.log("3D model loaded!");
}, undefined, (error) => {
    console.error("Error loading model:", error);
});


// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
// A minimal, working Three.js scene
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// NEW: Import the model loader
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#world'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- REMOVED THE CUBE ---

// --- NEW: Lighting ---
// We need lights to see the new model
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// --- NEW: Load the 3D Model ---
const loader = new GLTFLoader();
loader.load('stall.glb', (gltf) => { // Make sure your model is named stall.glb
    const model = gltf.scene;
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
    alert("Could not load 'stall.glb'. Make sure it is in the frontend folder.");
});


// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
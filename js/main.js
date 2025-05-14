import { createPitch } from "./Pitch.js";
import { Game } from "./Game.js";

let scene, camera, renderer;
let gameContainer;
let clock, game;
let lastTime = 0;

function init() {
  clock = new THREE.Clock();
  gameContainer = document.getElementById("game-container");

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Sky blue background

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 50, 60); // Position camera to look down at the pitch
  camera.lookAt(0, 0, 0);

  // Make camera available globally for raycasting in PlayDesigner
  window.camera = camera;

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  gameContainer.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(50, 100, 75);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  scene.add(directionalLight);

  // Pitch
  const pitch = createPitch();
  scene.add(pitch);

  // Initialize game
  game = new Game(scene);

  // Handle window resize
  window.addEventListener("resize", onWindowResize, false);

  // Add keyboard controls for the designer
  window.addEventListener("keydown", (event) => {
    // ESC key to exit designer mode
    if (event.key === "Escape" && game.gameState === "playDesigner") {
      game.exitDesigner();
    }

    // Space to play/pause when in playing mode
    if (event.key === " " && game.gameState === "playingMove") {
      // Toggle pause (not implemented yet)
    }
  });

  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(time) {
  requestAnimationFrame(animate);

  // Calculate delta time
  const delta = clock.getDelta();

  // Update game logic
  if (game) {
    game.update(delta);
  }

  renderer.render(scene, camera);
}

// Start the game
init();

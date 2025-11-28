import * as THREE from 'three';
import { initScene, handleWindowResize } from './engine/scene';
import { createYouBoi, updateYouBoiAnimation } from './avatar/youBoi';
import {
  createBox,
  createCouch,
  createTable,
  createLamp,
  findObject,
  deleteObject,
  clearScene,
  getObjects,
} from './objects/factory';
import {
  createMoveState,
  createEditorState,
  createRoomState,
  setupKeyboardControls,
  setupMouseControls,
  playerSpeed,
  jumpForce,
  gravity,
  defaultRoomRadius,
  minRoomRadius,
  maxRoomRadius,
} from './io/controls';
import { ChatManager } from './ui/chat';
import { sendPromptToWebhook } from './network/webhookClient';
import { executeCommand } from './agent/commandExecutor';

// Initialize scene
const container = document.getElementById('canvas-container')!;
const { scene, camera, renderer } = initScene(container);

// Initialize avatar
const youBoi = createYouBoi();
scene.add(youBoi);

// Initialize state
const moveState = createMoveState();
const editorState = createEditorState();
const roomState = createRoomState();
let isMoving = false;
let isLooking = false;
let verticalVelocity = 0;
let isGrounded = true;
const cameraState = { yaw: 0, pitch: 0 };

// Initialize chat
const chatHistory = document.getElementById('chat-history')!;
const userInput = document.getElementById('user-input') as HTMLInputElement;
const chatManager = new ChatManager(chatHistory, userInput);

// Create room boundaries (4 walls)
let roomWalls: THREE.Mesh[] = [];

function createRoomBoundaries(): void {
  // Remove old walls
  roomWalls.forEach(wall => scene.remove(wall));
  roomWalls = [];

  const wallHeight = 5;
  const wallThickness = 0.2;
  const radius = roomState.radius;

  // Wall material
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.3,
    roughness: 0.7,
  });

  // North wall
  const northWall = new THREE.Mesh(
    new THREE.BoxGeometry(radius * 2, wallHeight, wallThickness),
    wallMaterial
  );
  northWall.position.set(0, wallHeight / 2, radius);
  northWall.userData.isWall = true;
  scene.add(northWall);
  roomWalls.push(northWall);

  // South wall
  const southWall = new THREE.Mesh(
    new THREE.BoxGeometry(radius * 2, wallHeight, wallThickness),
    wallMaterial
  );
  southWall.position.set(0, wallHeight / 2, -radius);
  southWall.userData.isWall = true;
  scene.add(southWall);
  roomWalls.push(southWall);

  // East wall
  const eastWall = new THREE.Mesh(
    new THREE.BoxGeometry(wallThickness, wallHeight, radius * 2),
    wallMaterial
  );
  eastWall.position.set(radius, wallHeight / 2, 0);
  eastWall.userData.isWall = true;
  scene.add(eastWall);
  roomWalls.push(eastWall);

  // West wall
  const westWall = new THREE.Mesh(
    new THREE.BoxGeometry(wallThickness, wallHeight, radius * 2),
    wallMaterial
  );
  westWall.position.set(-radius, wallHeight / 2, 0);
  westWall.userData.isWall = true;
  scene.add(westWall);
  roomWalls.push(westWall);
}

// Create UI controls for room radius
function createRadiusControls(): void {
  const controlsDiv = document.createElement('div');
  controlsDiv.id = 'room-controls';
  controlsDiv.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    padding: 15px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    z-index: 100;
    font-family: 'Inter', sans-serif;
    border: 1px solid rgba(0, 0, 0, 0.05);
  `;

  controlsDiv.innerHTML = `
    <div style="margin-bottom: 12px; font-weight: 600; color: #333; font-size: 0.9rem;">
      Room Radius: <span id="radius-value">${roomState.radius.toFixed(1)}</span>m
    </div>
    <div style="display: flex; gap: 8px; align-items: center;">
      <button id="radius-minus" style="
        padding: 6px 10px;
        background: #e53e3e;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.9rem;
      ">−</button>
      <input type="range" id="radius-slider" min="${minRoomRadius}" max="${maxRoomRadius}" 
        value="${roomState.radius}" step="1" style="
        width: 150px;
        cursor: pointer;
      ">
      <button id="radius-plus" style="
        padding: 6px 10px;
        background: #2563eb;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.9rem;
      ">+</button>
    </div>
    <div style="margin-top: 12px; font-size: 0.8rem; color: #666; line-height: 1.4;">
      <div><strong>SPACE</strong> - Jump</div>
      <div><strong>TAB</strong> - Character Editor</div>
    </div>
  `;

  document.body.appendChild(controlsDiv);

  // Setup event listeners
  const slider = document.getElementById('radius-slider') as HTMLInputElement;
  const minusBtn = document.getElementById('radius-minus') as HTMLButtonElement;
  const plusBtn = document.getElementById('radius-plus') as HTMLButtonElement;
  const radiusValue = document.getElementById('radius-value') as HTMLElement;

  function updateRadius(newRadius: number): void {
    roomState.radius = Math.max(minRoomRadius, Math.min(maxRoomRadius, newRadius));
    slider.value = roomState.radius.toString();
    radiusValue.textContent = roomState.radius.toFixed(1);
    createRoomBoundaries();
  }

  slider.addEventListener('input', (e) => {
    updateRadius(parseFloat((e.target as HTMLInputElement).value));
  });

  minusBtn.addEventListener('click', () => {
    updateRadius(roomState.radius - 5);
  });

  plusBtn.addEventListener('click', () => {
    updateRadius(roomState.radius + 5);
  });
}

// Setup controls
setupKeyboardControls(moveState, userInput, editorState, () => {
  if (editorState.isOpen) {
    chatManager.addMessage('Character editor opened (TAB to close)', 'agent');
  }
});

setupMouseControls(renderer.domElement, cameraState, (looking: boolean) => {
  if (youBoi.userData.state === 'standing') {
    isLooking = looking;
    return looking;
  }
  return false;
});

// Handle user input
userInput.addEventListener('keypress', async (e) => {
  if (e.key === 'Enter') {
    const text = chatManager.getInputValue();
    if (!text || chatManager.isProcessingCommand()) return;

    chatManager.addToCommandHistory(text);
    chatManager.addMessage(text, 'user');
    chatManager.clearInput();
    chatManager.setProcessing(true);

    const loadingMsg = chatManager.addLoadingMessage();

    try {
      const response = await sendPromptToWebhook(text, {
        objects: getObjects().map(obj => ({
          id: obj.userData.id,
          type: obj.userData.type,
          position: obj.position,
        })),
      });

      const result = executeCommand(
        response,
        scene,
        getObjects(),
        {
          box: (color?: string, scale?: number) => createBox(scene, color, scale),
          couch: (color?: string, scale?: number) => createCouch(scene, color, scale),
          table: (color?: string, scale?: number) => createTable(scene, color, scale),
          lamp: (color?: string) => createLamp(scene, color),
        }
      );

      chatManager.removeLoadingMessage(loadingMsg);
      chatManager.addMessage(result, 'agent');
    } catch (error) {
      chatManager.removeLoadingMessage(loadingMsg);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      chatManager.addMessage(`Error: ${errorMsg}`, 'agent');
    } finally {
      chatManager.setProcessing(false);
    }
  }
});

// Handle command history navigation
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    const prev = chatManager.getPreviousCommand();
    if (prev) userInput.value = prev;
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    const next = chatManager.getNextCommand();
    userInput.value = next;
  }
});

// Update player position with jumping and boundary collision
function updatePlayer(): void {
  if (youBoi.userData.state !== 'standing') return;

  const deltaX = (moveState.right ? 1 : moveState.left ? -1 : 0);
  const deltaZ = (moveState.forward ? 1 : moveState.backward ? -1 : 0);

  youBoi.rotation.y = cameraState.yaw;

  // Handle jumping
  if (moveState.jump && isGrounded) {
    verticalVelocity = jumpForce;
    isGrounded = false;
  }

  // Apply gravity
  verticalVelocity -= gravity;
  youBoi.position.y += verticalVelocity;

  // Ground collision
  if (youBoi.position.y <= 0) {
    youBoi.position.y = 0;
    verticalVelocity = 0;
    isGrounded = true;
  }

  // Horizontal movement
  if (deltaX !== 0 || deltaZ !== 0) {
    isMoving = true;

    const forwardVector = new THREE.Vector3(0, 0, 1);
    forwardVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), youBoi.rotation.y);

    const rightVector = new THREE.Vector3(1, 0, 0);
    rightVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), youBoi.rotation.y);

    const moveVector = new THREE.Vector3();
    if (deltaZ !== 0) moveVector.addScaledVector(forwardVector, deltaZ * playerSpeed);
    if (deltaX !== 0) moveVector.addScaledVector(rightVector, -deltaX * playerSpeed);

    youBoi.position.add(moveVector);
  } else {
    isMoving = false;
  }

  // Boundary collision
  const radius = roomState.radius - 1; // 1 unit buffer from wall
  const distance = Math.sqrt(youBoi.position.x ** 2 + youBoi.position.z ** 2);
  
  if (distance > radius) {
    const angle = Math.atan2(youBoi.position.z, youBoi.position.x);
    youBoi.position.x = Math.cos(angle) * radius;
    youBoi.position.z = Math.sin(angle) * radius;
  }
}

// Update camera
function updateCamera(): void {
  const targetPosition = youBoi.position.clone().add(new THREE.Vector3(0, 1.0, 0));

  const cameraDistance = 3.5;
  const cameraHeight = 1.5;

  const cameraPosition = new THREE.Vector3(
    targetPosition.x - cameraDistance * Math.sin(cameraState.yaw),
    targetPosition.y + cameraHeight,
    targetPosition.z - cameraDistance * Math.cos(cameraState.yaw)
  );

  camera.position.lerp(cameraPosition, 0.2);

  const lookAtPosition = targetPosition.clone();
  lookAtPosition.y += Math.tan(cameraState.pitch) * cameraDistance;

  camera.lookAt(lookAtPosition);
}

// Animation loop
const clock = new THREE.Clock();

function animate(): void {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  if (youBoi.userData.state === 'standing') {
    updatePlayer();
    updateCamera();
    updateYouBoiAnimation(youBoi, isMoving, delta);
  }

  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  handleWindowResize(camera, renderer);
});

// Handle tab visibility
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause rendering
  } else {
    // Resume rendering
  }
});

// Start animation loop
window.addEventListener('load', () => {
  createRoomBoundaries();
  createRadiusControls();
  updateCamera();
  animate();
});

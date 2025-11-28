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
  createCameraState,
  setupKeyboardControls,
  setupMouseControls,
  playerSpeed,
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
const cameraState = createCameraState();
let isMoving = false;
let isLooking = false;

// Initialize chat
const chatHistory = document.getElementById('chat-history')!;
const userInput = document.getElementById('user-input') as HTMLInputElement;
const chatManager = new ChatManager(chatHistory, userInput);

// Setup controls
setupKeyboardControls(moveState, userInput);
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

// Update player position
function updatePlayer(): void {
  if (youBoi.userData.state !== 'standing') return;

  const deltaX = (moveState.right ? 1 : moveState.left ? -1 : 0);
  const deltaZ = (moveState.forward ? 1 : moveState.backward ? -1 : 0);

  youBoi.rotation.y = cameraState.yaw;

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
  updateCamera();
  animate();
});

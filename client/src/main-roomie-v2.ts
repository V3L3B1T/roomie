/**
 * Roomie Main Entry Point (V2 - New Engine)
 * 
 * This version uses the new architecture:
 * - ShapeRegistry & InstanceRegistry for object tracking
 * - BehaviorEngine for interactive behaviors
 * - applyBlueprint() for declarative scene building
 * 
 * Toggle between old/new with USE_NEW_ENGINE flag
 */

import * as THREE from 'three';
import { initScene, handleWindowResize } from './engine/scene';
import { createYouBoi, updateYouBoiAnimation, updateYouBoiColors } from './avatar/youBoi';
import { ChatManager } from './ui/chat';
import { CharacterEditor } from './ui/characterEditor';
import { ObjectEditor } from './ui/objectEditor';
import { ObjectSelector } from './agent/objectSelector';

// NEW ENGINE IMPORTS
import { ShapeRegistry } from './engine/ShapeRegistry';
import { InstanceRegistry } from './engine/InstanceRegistry';
import { BehaviorEngine } from './engine/BehaviorEngine';
import { applyBlueprint } from './engine/applyBlueprint';
import type { BlueprintResponse, GameEvent } from '../../shared/types/blueprint';

// Fixture imports for testing
import { fixtureBlueprints } from './fixtures/blueprints';

// OLD ENGINE IMPORTS (for fallback)
import {
  createMoveState,
  createEditorState,
  createRoomState,
  setupKeyboardControls,
  setupMouseControls,
  defaultRoomRadius,
} from './io/controls';

// ============================================================================
// FEATURE FLAG: Toggle between old and new engine
// ============================================================================
const USE_NEW_ENGINE = true; // Set to false to use old system

console.log(`[Roomie] Using ${USE_NEW_ENGINE ? 'NEW' : 'OLD'} engine`);

// ============================================================================
// Scene Initialization
// ============================================================================
const container = document.getElementById('canvas-container')!;
const { scene, camera, renderer } = initScene(container);

// Initialize avatar
const youBoi = createYouBoi();
scene.add(youBoi);

// ============================================================================
// NEW ENGINE: Registries & Behavior System
// ============================================================================
const shapeRegistry = new ShapeRegistry();
const instanceRegistry = new InstanceRegistry();
const behaviorEngine = new BehaviorEngine(instanceRegistry);

// Set camera and character references for behaviors (e.g., vehicle)
behaviorEngine.setCamera(camera);
behaviorEngine.setCharacter(youBoi);

// ============================================================================
// State Management
// ============================================================================
const moveState = createMoveState();
const editorState = createEditorState();
const roomState = createRoomState();
let isMoving = false;
let isLooking = false;
const cameraState = { yaw: 0, pitch: 0 };

// Jump state
const JUMP_HEIGHT = 1.0;
const JUMP_DURATION = 0.4;
let jumpStartTime = 0;
let isJumping = false;
let baseYPosition = 0;

// ============================================================================
// UI Initialization
// ============================================================================
const chatHistory = document.getElementById('chat-history')!;
const userInput = document.getElementById('user-input') as HTMLInputElement;
const chatManager = new ChatManager(chatHistory, userInput);

const characterEditor = new CharacterEditor(document.body);
const objectEditor = new ObjectEditor(document.body);
const objectSelector = new ObjectSelector(scene, camera);

// ============================================================================
// Room Boundaries
// ============================================================================
let roomWalls: THREE.Mesh[] = [];

function createRoomBoundaries(): void {
  roomWalls.forEach(wall => scene.remove(wall));
  roomWalls = [];

  const wallHeight = 5;
  const wallThickness = 0.2;
  const radius = roomState.radius;

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
  northWall.castShadow = true;
  northWall.receiveShadow = true;
  scene.add(northWall);
  roomWalls.push(northWall);

  // South wall
  const southWall = new THREE.Mesh(
    new THREE.BoxGeometry(radius * 2, wallHeight, wallThickness),
    wallMaterial
  );
  southWall.position.set(0, wallHeight / 2, -radius);
  southWall.userData.isWall = true;
  southWall.castShadow = true;
  southWall.receiveShadow = true;
  scene.add(southWall);
  roomWalls.push(southWall);

  // East wall
  const eastWall = new THREE.Mesh(
    new THREE.BoxGeometry(wallThickness, wallHeight, radius * 2),
    wallMaterial
  );
  eastWall.position.set(radius, wallHeight / 2, 0);
  eastWall.userData.isWall = true;
  eastWall.castShadow = true;
  eastWall.receiveShadow = true;
  scene.add(eastWall);
  roomWalls.push(eastWall);

  // West wall
  const westWall = new THREE.Mesh(
    new THREE.BoxGeometry(wallThickness, wallHeight, radius * 2),
    wallMaterial
  );
  westWall.position.set(-radius, wallHeight / 2, 0);
  westWall.userData.isWall = true;
  westWall.castShadow = true;
  westWall.receiveShadow = true;
  scene.add(westWall);
  roomWalls.push(westWall);
}

createRoomBoundaries();

// ============================================================================
// Room Radius Controls
// ============================================================================
function createRadiusControls(): void {
  const controlsDiv = document.createElement('div');
  controlsDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 15px;
    border-radius: 8px;
    font-family: monospace;
    z-index: 100;
  `;

  const label = document.createElement('div');
  label.textContent = `Room Radius: ${roomState.radius}m`;
  label.style.marginBottom = '10px';

  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '10px';

  const decreaseBtn = document.createElement('button');
  decreaseBtn.textContent = '-';
  decreaseBtn.style.cssText = 'padding: 5px 15px; cursor: pointer;';
  decreaseBtn.onclick = () => {
    if (roomState.radius > 10) {
      roomState.radius -= 5;
      label.textContent = `Room Radius: ${roomState.radius}m`;
      createRoomBoundaries();
    }
  };

  const increaseBtn = document.createElement('button');
  increaseBtn.textContent = '+';
  increaseBtn.style.cssText = 'padding: 5px 15px; cursor: pointer;';
  increaseBtn.onclick = () => {
    if (roomState.radius < 100) {
      roomState.radius += 5;
      label.textContent = `Room Radius: ${roomState.radius}m`;
      createRoomBoundaries();
    }
  };

  buttonContainer.appendChild(decreaseBtn);
  buttonContainer.appendChild(increaseBtn);
  controlsDiv.appendChild(label);
  controlsDiv.appendChild(buttonContainer);

  document.body.appendChild(controlsDiv);
}

createRadiusControls();

// ============================================================================
// DEV FIXTURE CONTROLS (Testing without n8n)
// ============================================================================
function createFixtureControls(): void {
  const fixtureDiv = document.createElement('div');
  fixtureDiv.style.cssText = `
    position: fixed;
    top: 150px;
    right: 20px;
    background: rgba(0, 100, 200, 0.9);
    color: white;
    padding: 15px;
    border-radius: 8px;
    font-family: monospace;
    z-index: 100;
  `;

  const title = document.createElement('div');
  title.textContent = '🧪 Dev Fixtures';
  title.style.cssText = 'font-weight: bold; margin-bottom: 10px;';

  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.flexDirection = 'column';
  buttonContainer.style.gap = '8px';

  // Chessboard button
  const chessBtn = document.createElement('button');
  chessBtn.textContent = '♟️ Chessboard';
  chessBtn.style.cssText = 'padding: 8px; cursor: pointer; border-radius: 4px;';
  chessBtn.onclick = async () => {
    console.log('[Fixture] Loading chessboard...');
    await applyFixture(fixtureBlueprints.chessboard);
  };

  // Vehicle button
  const carBtn = document.createElement('button');
  carBtn.textContent = '🚗 Car';
  carBtn.style.cssText = 'padding: 8px; cursor: pointer; border-radius: 4px;';
  carBtn.onclick = async () => {
    console.log('[Fixture] Loading car...');
    await applyFixture(fixtureBlueprints.vehicle);
  };

  // Lamp button
  const lampBtn = document.createElement('button');
  lampBtn.textContent = '💡 Lamp';
  lampBtn.style.cssText = 'padding: 8px; cursor: pointer; border-radius: 4px;';
  lampBtn.onclick = async () => {
    console.log('[Fixture] Loading lamp...');
    await applyFixture(fixtureBlueprints.lamp);
  };

  buttonContainer.appendChild(chessBtn);
  buttonContainer.appendChild(carBtn);
  buttonContainer.appendChild(lampBtn);
  fixtureDiv.appendChild(title);
  fixtureDiv.appendChild(buttonContainer);

  document.body.appendChild(fixtureDiv);
}

if (USE_NEW_ENGINE) {
  createFixtureControls();
}

// ============================================================================
// Blueprint Application (NEW ENGINE)
// ============================================================================
async function applyFixture(blueprint: BlueprintResponse): Promise<void> {
  try {
    const result = await applyBlueprint(
      blueprint,
      scene,
      shapeRegistry,
      instanceRegistry,
      behaviorEngine
    );

    if (result.success) {
      chatManager.addMessage(blueprint.message, 'agent');
      console.log(`[Fixture] Applied successfully: ${result.newInstanceIds.length} new objects`);
    } else {
      chatManager.addMessage(`Failed to apply fixture: ${result.errors.join(', ')}`, 'agent');
      console.error('[Fixture] Errors:', result.errors);
    }
  } catch (error) {
    console.error('[Fixture] Fatal error:', error);
    chatManager.addMessage(`Fatal error applying fixture: ${error}`, 'agent');
  }
}

// ============================================================================
// Keyboard & Mouse Controls
// ============================================================================
setupKeyboardControls(moveState, userInput, editorState, () => {
  if (editorState.isOpen) {
    characterEditor.open((colors) => {
      updateYouBoiColors(youBoi, colors);
    });
  } else {
    characterEditor.close();
  }
});

setupMouseControls(renderer.domElement, cameraState, (looking: boolean) => {
  if (youBoi.userData.state === 'standing') {
    isLooking = looking;
    return looking;
  }
  return false;
});

// ============================================================================
// Object Selection & Click Events (NEW ENGINE)
// ============================================================================
objectSelector.setupClickHandler(renderer.domElement, (selectedObject) => {
  console.log('[Click] Click detected', selectedObject ? {
    name: selectedObject.name,
    instanceId: selectedObject.userData.instanceId,
    shapeId: selectedObject.userData.shapeId,
    selectable: selectedObject.userData.selectable,
  } : 'no object');

  if (USE_NEW_ENGINE && selectedObject) {
    // Fire click event to behavior engine
    const instanceId = selectedObject.userData.instanceId;
    if (instanceId) {
      const event: GameEvent = {
        type: 'click',
        instanceId,
        position: selectedObject.position,
      };
      console.log(`[Click] Firing GameEvent to BehaviorEngine:`, event);
      behaviorEngine.handleEvent(event);
    } else {
      console.warn('[Click] Object has no instanceId:', selectedObject);
    }
  }

  // Also handle object editor (old system)
  if (selectedObject) {
    objectEditor.selectObject(selectedObject, (state) => {
      if (state.selectedObject === null && selectedObject.userData.instanceId) {
        // Remove from registries
        const registered = instanceRegistry.remove(selectedObject.userData.instanceId);
        if (registered) {
          scene.remove(registered.object3D);
        }
        objectEditor.deselect();
      }
    });
  } else {
    objectEditor.deselect();
  }
});

// ============================================================================
// Chat Input Handler (NEW ENGINE)
// ============================================================================
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
      // TODO: Call backend /api/roomie endpoint
      // For now, this will be wired up once we test fixtures work
      
      chatManager.removeLoadingMessage(loadingMsg);
      chatManager.addMessage('Backend integration coming soon! Use fixture buttons to test.', 'agent');
      
    } catch (error) {
      chatManager.removeLoadingMessage(loadingMsg);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      chatManager.addMessage(`Error: ${errorMsg}`, 'agent');
    } finally {
      chatManager.setProcessing(false);
    }
  }
});

// Command history navigation
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

// ============================================================================
// Player Movement & Physics
// ============================================================================
function updatePlayer(delta: number): void {
  if (youBoi.userData.state !== 'standing') return;

  const deltaX = (moveState.right ? 1 : moveState.left ? -1 : 0);
  const deltaZ = (moveState.backward ? 1 : moveState.forward ? -1 : 0);

  if (deltaX !== 0 || deltaZ !== 0) {
    isMoving = true;

    const angle = cameraState.yaw;
    const moveX = deltaX * Math.cos(angle) - deltaZ * Math.sin(angle);
    const moveZ = deltaX * Math.sin(angle) + deltaZ * Math.cos(angle);

    const speed = 5;
    youBoi.position.x += moveX * speed * delta;
    youBoi.position.z += moveZ * speed * delta;

    // Boundary collision
    const radius = roomState.radius - 0.5;
    const dist = Math.sqrt(youBoi.position.x ** 2 + youBoi.position.z ** 2);
    if (dist > radius) {
      const angle = Math.atan2(youBoi.position.z, youBoi.position.x);
      youBoi.position.x = Math.cos(angle) * radius;
      youBoi.position.z = Math.sin(angle) * radius;
    }

    youBoi.rotation.y = Math.atan2(moveX, moveZ);
  } else {
    isMoving = false;
  }

  // Jumping
  if (moveState.jump && !isJumping) {
    isJumping = true;
    jumpStartTime = performance.now() / 1000;
    baseYPosition = youBoi.position.y;
  }

  if (isJumping) {
    const elapsed = (performance.now() / 1000) - jumpStartTime;
    const progress = Math.min(elapsed / JUMP_DURATION, 1);
    const jumpOffset = Math.sin(progress * Math.PI) * JUMP_HEIGHT;
    youBoi.position.y = baseYPosition + jumpOffset;

    if (progress >= 1) {
      isJumping = false;
      youBoi.position.y = baseYPosition;
      moveState.jump = false;
    }
  }
}

// ============================================================================
// Camera Update
// ============================================================================
function updateCamera(): void {
  const cameraDistance = 5;
  const cameraHeight = 2;

  const targetX = youBoi.position.x - Math.sin(cameraState.yaw) * cameraDistance;
  const targetZ = youBoi.position.z - Math.cos(cameraState.yaw) * cameraDistance;
  const targetY = youBoi.position.y + cameraHeight + Math.sin(cameraState.pitch) * 2;

  camera.position.x = targetX;
  camera.position.y = targetY;
  camera.position.z = targetZ;

  camera.lookAt(youBoi.position.x, youBoi.position.y + 1, youBoi.position.z);
}

// ============================================================================
// Main Render Loop
// ============================================================================
const clock = new THREE.Clock();

function animate(): void {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  // Update player
  updatePlayer(delta);

  // Update camera
  updateCamera();

  // Update avatar animation
  updateYouBoiAnimation(youBoi, isMoving, delta);

  // NEW ENGINE: Update behaviors
  if (USE_NEW_ENGINE) {
    behaviorEngine.update(delta);
  }

  // Render
  renderer.render(scene, camera);
}

animate();

// ============================================================================
// Window Resize
// ============================================================================
window.addEventListener('resize', () => handleWindowResize(camera, renderer));

// ============================================================================
// Export for debugging
// ============================================================================
(window as any).roomieDebug = {
  scene,
  camera,
  renderer,
  shapeRegistry,
  instanceRegistry,
  behaviorEngine,
  applyFixture,
  fixtureBlueprints,
};

console.log('[Roomie] Initialized successfully');
console.log('[Roomie] Debug tools available at window.roomieDebug');

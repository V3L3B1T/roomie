/**
 * GLB Character Loader
 * Loads the provided GLB character model with proper positioning and animations
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface CharacterState {
  id: string;
  type: 'avatar';
  state: 'standing' | 'sitting';
  walkCycle: number;
  model?: THREE.Group;
  mixer?: THREE.AnimationMixer;
  animations?: {
    idle?: THREE.AnimationAction;
    walk?: THREE.AnimationAction;
    run?: THREE.AnimationAction;
    jump?: THREE.AnimationAction;
  };
}

/**
 * Loads the GLB character model with proper positioning
 */
export async function loadGLBCharacter(): Promise<THREE.Group & { userData: CharacterState }> {
  const loader = new GLTFLoader();
  
  return new Promise((resolve, reject) => {
    loader.load(
      '/models/character.glb',
      (gltf) => {
        const character = gltf.scene as THREE.Group & { userData: CharacterState };
        character.name = 'GLBCharacter';
        
        // Calculate bounding box to find the model's bottom
        const box = new THREE.Box3().setFromObject(character);
        const height = box.max.y - box.min.y;
        const bottomOffset = -box.min.y; // Offset to put feet on ground
        
        console.log('[GLBCharacter] Model dimensions:', {
          height,
          min: box.min.y,
          max: box.max.y,
          bottomOffset,
        });

        // Set up animation mixer if animations exist
        let mixer: THREE.AnimationMixer | undefined;
        const animations: CharacterState['animations'] = {};
        
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(character);
          
          console.log('[GLBCharacter] Found animations:', gltf.animations.map(a => a.name));
          
          // Try to find common animation names
          gltf.animations.forEach((clip) => {
            const name = clip.name.toLowerCase();
            const action = mixer!.clipAction(clip);
            
            if (name.includes('idle') || name.includes('stand')) {
              animations.idle = action;
              action.play(); // Start with idle
            } else if (name.includes('walk')) {
              animations.walk = action;
            } else if (name.includes('run')) {
              animations.run = action;
            } else if (name.includes('jump')) {
              animations.jump = action;
              action.setLoop(THREE.LoopOnce, 1);
              action.clampWhenFinished = true;
            }
          });
          
          // If no named animations found, use first animation as idle
          if (!animations.idle && gltf.animations.length > 0) {
            animations.idle = mixer.clipAction(gltf.animations[0]);
            animations.idle.play();
          }
        }
        
        // Initialize userData
        character.userData = {
          id: 'glb-character',
          type: 'avatar',
          state: 'standing',
          walkCycle: 0,
          model: gltf.scene,
          mixer,
          animations,
        };

        // Enable shadows for all meshes
        character.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Position the model so feet are on the ground
        character.position.y = bottomOffset;

        console.log('[GLBCharacter] Loaded successfully', {
          children: character.children.length,
          animationCount: gltf.animations.length,
          hasIdle: !!animations.idle,
          hasWalk: !!animations.walk,
          hasJump: !!animations.jump,
          yOffset: bottomOffset,
        });

        resolve(character);
      },
      (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        console.log(`[GLBCharacter] Loading: ${percent.toFixed(0)}%`);
      },
      (error) => {
        console.error('[GLBCharacter] Failed to load:', error);
        reject(error);
      }
    );
  });
}

/**
 * Fallback: Create a simple primitive character if GLB fails to load
 */
export function createFallbackCharacter(): THREE.Group & { userData: CharacterState } {
  const character = new THREE.Group() as THREE.Group & { userData: CharacterState };
  character.name = 'FallbackCharacter';
  character.userData = {
    id: 'fallback-character',
    type: 'avatar',
    state: 'standing',
    walkCycle: 0,
  };

  // Simple box as fallback
  const geometry = new THREE.BoxGeometry(0.5, 1, 0.3);
  const material = new THREE.MeshStandardMaterial({ color: 0x2563eb });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 0.5;
  mesh.castShadow = true;
  character.add(mesh);

  return character;
}

/**
 * Update character animation based on movement state
 */
export function updateGLBCharacterAnimation(
  character: THREE.Group & { userData: CharacterState },
  isMoving: boolean,
  delta: number
): void {
  const { mixer, animations } = character.userData;
  
  if (!mixer || !animations) return;

  // Update animation mixer
  mixer.update(delta);

  // Switch between idle and walk animations
  if (isMoving) {
    // Transition to walk animation
    if (animations.walk && !animations.walk.isRunning()) {
      if (animations.idle) {
        animations.idle.fadeOut(0.2);
      }
      animations.walk.reset().fadeIn(0.2).play();
    }
  } else {
    // Transition to idle animation
    if (animations.idle && !animations.idle.isRunning()) {
      if (animations.walk) {
        animations.walk.fadeOut(0.2);
      }
      animations.idle.reset().fadeIn(0.2).play();
    }
  }

  // Update walk cycle for compatibility
  if (isMoving) {
    character.userData.walkCycle += delta * 5;
  }
}

/**
 * Trigger jump animation
 */
export function playJumpAnimation(
  character: THREE.Group & { userData: CharacterState }
): void {
  const { animations } = character.userData;
  
  if (animations?.jump) {
    animations.jump.reset().play();
  }
}

/**
 * Update character colors (not applicable for GLB, but kept for compatibility)
 */
export function updateGLBCharacterColors(
  character: THREE.Group & { userData: CharacterState },
  colors: { head: string; body: string; arms: string; legs: string }
): void {
  // GLB models have baked textures, so color changes don't apply
  // This function exists for API compatibility
  console.log('[GLBCharacter] Color changes not supported for GLB models');
}

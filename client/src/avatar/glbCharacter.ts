/**
 * GLB Character Loader
 * Loads the provided GLB character model to replace youBoi
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface CharacterState {
  id: string;
  type: 'avatar';
  state: 'standing' | 'sitting';
  walkCycle: number;
  model?: THREE.Group;
}

/**
 * Loads the GLB character model
 */
export async function loadGLBCharacter(): Promise<THREE.Group & { userData: CharacterState }> {
  const loader = new GLTFLoader();
  
  return new Promise((resolve, reject) => {
    loader.load(
      '/models/character.glb',
      (gltf) => {
        const character = gltf.scene as THREE.Group & { userData: CharacterState };
        character.name = 'GLBCharacter';
        
        // Initialize userData
        character.userData = {
          id: 'glb-character',
          type: 'avatar',
          state: 'standing',
          walkCycle: 0,
          model: gltf.scene,
        };

        // Enable shadows for all meshes
        character.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Scale and position the model (adjust as needed)
        character.scale.set(1, 1, 1);
        character.position.y = 0;

        console.log('[GLBCharacter] Loaded successfully', {
          children: character.children.length,
          animations: gltf.animations.length,
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
 * Update character animation (placeholder for now)
 */
export function updateGLBCharacterAnimation(
  character: THREE.Group & { userData: CharacterState },
  isMoving: boolean,
  delta: number
): void {
  if (!character.userData.model) return;

  // TODO: Add walking animation if GLB has animations
  // For now, just update walk cycle for future use
  if (isMoving) {
    character.userData.walkCycle += delta * 5;
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

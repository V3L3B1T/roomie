/**
 * ShapeFactory - Creates THREE.js meshes from ShapeDefinitions
 * Supports primitives and external assets (GLTF)
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { ShapeDefinition } from '../../../shared/types/blueprint';

// Asset cache to avoid loading the same file multiple times
const assetCache = new Map<string, Promise<THREE.Object3D>>();

// GLTF loader instance
const gltfLoader = new GLTFLoader();

/**
 * Creates a THREE.js mesh from a ShapeDefinition
 */
export async function createMeshFromShapeDefinition(
  shape: ShapeDefinition
): Promise<THREE.Object3D> {
  if (shape.kind === 'primitive') {
    return createPrimitive(shape);
  } else if (shape.kind === 'mesh' || shape.kind === 'external_asset') {
    return createExternalAsset(shape);
  } else {
    console.warn(`Unknown shape kind: ${shape.kind}`);
    return createFallbackMesh();
  }
}

/**
 * Creates a primitive mesh (box, sphere, cylinder, etc.)
 */
function createPrimitive(shape: ShapeDefinition): THREE.Object3D {
  let geometry: THREE.BufferGeometry;

  const dims = shape.dimensions || {};

  switch (shape.primitiveType) {
    case 'box':
      geometry = new THREE.BoxGeometry(
        dims.width || 1,
        dims.height || 1,
        dims.depth || 1
      );
      break;

    case 'sphere':
      geometry = new THREE.SphereGeometry(
        dims.radius || 0.5,
        dims.segments || 32,
        dims.segments || 32
      );
      break;

    case 'cylinder':
      geometry = new THREE.CylinderGeometry(
        dims.radius || 0.5,
        dims.radius || 0.5,
        dims.height || 1,
        dims.segments || 32
      );
      break;

    case 'cone':
      geometry = new THREE.ConeGeometry(
        dims.radius || 0.5,
        dims.height || 1,
        dims.segments || 32
      );
      break;

    case 'plane':
      geometry = new THREE.PlaneGeometry(
        dims.width || 1,
        dims.height || 1
      );
      break;

    case 'torus':
      geometry = new THREE.TorusGeometry(
        dims.radius || 0.5,
        dims.radiusTube || 0.2,
        dims.segments || 16,
        dims.segments || 100
      );
      break;

    default:
      console.warn(`Unknown primitive type: ${shape.primitiveType}`);
      geometry = new THREE.BoxGeometry(1, 1, 1);
  }

  const material = createMaterial(shape);
  const mesh = new THREE.Mesh(geometry, material);

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

/**
 * Creates a material from shape definition
 */
function createMaterial(shape: ShapeDefinition): THREE.Material {
  const mat = shape.material || {};

  const color = mat.color
    ? new THREE.Color(mat.color.r, mat.color.g, mat.color.b)
    : new THREE.Color(0x2563eb);

  const material = new THREE.MeshStandardMaterial({
    color,
    metalness: mat.metalness ?? 0.2,
    roughness: mat.roughness ?? 0.8,
    transparent: mat.transparent ?? false,
    opacity: mat.opacity ?? 1,
  });

  if (mat.emissive) {
    material.emissive = new THREE.Color(
      mat.emissive.r,
      mat.emissive.g,
      mat.emissive.b
    );
    material.emissiveIntensity = mat.emissiveIntensity ?? 0;
  }

  return material;
}

/**
 * Loads an external asset (GLTF/GLB)
 */
async function createExternalAsset(shape: ShapeDefinition): Promise<THREE.Object3D> {
  if (!shape.sourceUrl) {
    console.warn('External asset missing sourceUrl');
    return createFallbackMesh();
  }

  // Check cache
  if (assetCache.has(shape.sourceUrl)) {
    const cached = await assetCache.get(shape.sourceUrl)!;
    return cached.clone();
  }

  // Load asset
  const loadPromise = new Promise<THREE.Object3D>((resolve, reject) => {
    gltfLoader.load(
      shape.sourceUrl!,
      (gltf) => {
        const model = gltf.scene;
        
        // Enable shadows
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        resolve(model);
      },
      undefined,
      (error) => {
        console.error(`Failed to load asset: ${shape.sourceUrl}`, error);
        reject(error);
      }
    );
  });

  assetCache.set(shape.sourceUrl, loadPromise);

  try {
    const model = await loadPromise;
    return model.clone();
  } catch (error) {
    console.error('Asset loading failed, using fallback', error);
    return createFallbackMesh();
  }
}

/**
 * Creates a fallback mesh when shape creation fails
 */
function createFallbackMesh(): THREE.Object3D {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: 0xff00ff, // Magenta to indicate error
    metalness: 0.2,
    roughness: 0.8,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Clears the asset cache (useful for hot reloading)
 */
export function clearAssetCache(): void {
  assetCache.clear();
}

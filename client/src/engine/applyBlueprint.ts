/**
 * applyBlueprint - Incrementally applies BlueprintResponse to the scene
 * This is the core function that takes AI output and makes it real
 */

import * as THREE from 'three';
import type { BlueprintResponse, SceneObjectInstance } from '../../../shared/types/blueprint';
import { ShapeRegistry } from './ShapeRegistry';
import { InstanceRegistry } from './InstanceRegistry';
import { BehaviorEngine } from './BehaviorEngine';
import { createMeshFromShapeDefinition } from './ShapeFactory';

export interface ApplyBlueprintResult {
  success: boolean;
  message: string;
  newInstanceIds: string[];
  updatedInstanceIds: string[];
  errors: string[];
}

/**
 * Applies a blueprint to the scene incrementally
 * - Registers new shapes
 * - Creates or updates instances
 * - Registers behaviors
 */
export async function applyBlueprint(
  blueprint: BlueprintResponse,
  scene: THREE.Scene,
  shapeRegistry: ShapeRegistry,
  instanceRegistry: InstanceRegistry,
  behaviorEngine: BehaviorEngine
): Promise<ApplyBlueprintResult> {
  const result: ApplyBlueprintResult = {
    success: true,
    message: blueprint.message,
    newInstanceIds: [],
    updatedInstanceIds: [],
    errors: [],
  };

  try {
    // Step 1: Register new shapes
    console.log(`[applyBlueprint] Registering ${blueprint.geometry.shapes.length} shapes`);
    for (const shape of blueprint.geometry.shapes) {
      if (!shapeRegistry.has(shape.shapeId)) {
        shapeRegistry.register(shape);
        console.log(`  ✓ Registered shape: ${shape.shapeId}`);
      } else {
        console.log(`  • Shape already exists: ${shape.shapeId}`);
      }
    }

    // Step 2: Create or update instances
    console.log(`[applyBlueprint] Processing ${blueprint.geometry.instances.length} instances`);
    for (const instance of blueprint.geometry.instances) {
      try {
        if (instanceRegistry.has(instance.instanceId)) {
          // Update existing instance
          await updateInstance(instance, instanceRegistry);
          result.updatedInstanceIds.push(instance.instanceId);
          console.log(`  ✓ Updated instance: ${instance.instanceId}`);
        } else {
          // Create new instance
          await createInstance(instance, scene, shapeRegistry, instanceRegistry);
          result.newInstanceIds.push(instance.instanceId);
          console.log(`  ✓ Created instance: ${instance.instanceId}`);
        }
      } catch (error) {
        const errorMsg = `Failed to process instance ${instance.instanceId}: ${error}`;
        result.errors.push(errorMsg);
        console.error(`  ✗ ${errorMsg}`);
      }
    }

    // Step 3: Register behaviors
    console.log(`[applyBlueprint] Registering ${blueprint.behavior.behaviors.length} behaviors`);
    for (const behavior of blueprint.behavior.behaviors) {
      try {
        behaviorEngine.registerBehavior(behavior);
        console.log(`  ✓ Registered behavior: ${behavior.behaviorId} (${behavior.type})`);
      } catch (error) {
        const errorMsg = `Failed to register behavior ${behavior.behaviorId}: ${error}`;
        result.errors.push(errorMsg);
        console.error(`  ✗ ${errorMsg}`);
      }
    }

    // Mark as failure if there were errors
    if (result.errors.length > 0) {
      result.success = false;
    }

    console.log(`[applyBlueprint] Complete: ${result.newInstanceIds.length} created, ${result.updatedInstanceIds.length} updated, ${result.errors.length} errors`);

  } catch (error) {
    result.success = false;
    result.errors.push(`Blueprint application failed: ${error}`);
    console.error('[applyBlueprint] Fatal error:', error);
  }

  return result;
}

/**
 * Creates a new instance in the scene
 */
async function createInstance(
  instance: SceneObjectInstance,
  scene: THREE.Scene,
  shapeRegistry: ShapeRegistry,
  instanceRegistry: InstanceRegistry
): Promise<void> {
  // Get shape definition
  const shape = shapeRegistry.get(instance.shapeId);
  if (!shape) {
    throw new Error(`Shape ${instance.shapeId} not found in registry`);
  }

  // Create THREE.js mesh
  const object3D = await createMeshFromShapeDefinition(shape);

  // Apply transform
  applyTransform(object3D, instance);

  // Apply visibility and shadows
  object3D.visible = instance.visible ?? true;
  object3D.castShadow = instance.castShadow ?? true;
  object3D.receiveShadow = instance.receiveShadow ?? true;

  // Add to scene
  scene.add(object3D);

  // Register in instance registry
  instanceRegistry.register(instance, object3D);
}

/**
 * Updates an existing instance
 */
async function updateInstance(
  instance: SceneObjectInstance,
  instanceRegistry: InstanceRegistry
): Promise<void> {
  const object3D = instanceRegistry.getObject3D(instance.instanceId);
  if (!object3D) {
    throw new Error(`Instance ${instance.instanceId} not found in registry`);
  }

  // Update transform
  applyTransform(object3D, instance);

  // Update visibility and shadows
  object3D.visible = instance.visible ?? true;
  object3D.castShadow = instance.castShadow ?? true;
  object3D.receiveShadow = instance.receiveShadow ?? true;

  // Update definition in registry
  instanceRegistry.updateDefinition(instance.instanceId, instance);
}

/**
 * Applies transform (position, rotation, scale) to an object
 */
function applyTransform(object3D: THREE.Object3D, instance: SceneObjectInstance): void {
  // Position
  object3D.position.set(
    instance.position.x,
    instance.position.y,
    instance.position.z
  );

  // Rotation (support both Quaternion and Euler)
  if ('w' in instance.rotation) {
    // Quaternion
    object3D.quaternion.set(
      instance.rotation.x,
      instance.rotation.y,
      instance.rotation.z,
      instance.rotation.w
    );
  } else {
    // Euler angles
    object3D.rotation.set(
      instance.rotation.x,
      instance.rotation.y,
      instance.rotation.z
    );
  }

  // Scale
  object3D.scale.set(
    instance.scale.x,
    instance.scale.y,
    instance.scale.z
  );
}

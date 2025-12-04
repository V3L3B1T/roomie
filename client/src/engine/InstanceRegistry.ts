/**
 * InstanceRegistry - Manages SceneObjectInstances and their THREE.js objects
 * Links blueprint data to actual 3D objects in the scene
 */

import * as THREE from 'three';
import type { SceneObjectInstance } from '../../../shared/types/blueprint';

export interface RegisteredInstance {
  definition: SceneObjectInstance;
  object3D: THREE.Object3D;
}

export class InstanceRegistry {
  private instances = new Map<string, RegisteredInstance>();

  /**
   * Registers a new instance
   */
  register(definition: SceneObjectInstance, object3D: THREE.Object3D): void {
    // Store instance ID in object userData for easy lookup
    object3D.userData.instanceId = definition.instanceId;
    object3D.userData.shapeId = definition.shapeId;
    object3D.userData.definition = definition;

    this.instances.set(definition.instanceId, { definition, object3D });
  }

  /**
   * Gets an instance by ID
   */
  get(instanceId: string): RegisteredInstance | undefined {
    return this.instances.get(instanceId);
  }

  /**
   * Gets the THREE.Object3D for an instance
   */
  getObject3D(instanceId: string): THREE.Object3D | undefined {
    return this.instances.get(instanceId)?.object3D;
  }

  /**
   * Gets the definition for an instance
   */
  getDefinition(instanceId: string): SceneObjectInstance | undefined {
    return this.instances.get(instanceId)?.definition;
  }

  /**
   * Checks if an instance exists
   */
  has(instanceId: string): boolean {
    return this.instances.has(instanceId);
  }

  /**
   * Updates an instance definition (doesn't modify THREE.js object)
   */
  updateDefinition(instanceId: string, definition: SceneObjectInstance): void {
    const existing = this.instances.get(instanceId);
    if (existing) {
      existing.definition = definition;
      existing.object3D.userData.definition = definition;
    }
  }

  /**
   * Removes an instance
   */
  remove(instanceId: string): RegisteredInstance | undefined {
    const instance = this.instances.get(instanceId);
    if (instance) {
      this.instances.delete(instanceId);
    }
    return instance;
  }

  /**
   * Gets all instance IDs
   */
  getAllIds(): string[] {
    return Array.from(this.instances.keys());
  }

  /**
   * Gets all instances
   */
  getAll(): RegisteredInstance[] {
    return Array.from(this.instances.values());
  }

  /**
   * Finds instances by tag
   */
  findByTag(tag: string): RegisteredInstance[] {
    return this.getAll().filter((instance) =>
      instance.definition.tags?.includes(tag)
    );
  }

  /**
   * Finds instances by shape ID
   */
  findByShapeId(shapeId: string): RegisteredInstance[] {
    return this.getAll().filter(
      (instance) => instance.definition.shapeId === shapeId
    );
  }

  /**
   * Clears all instances
   */
  clear(): void {
    this.instances.clear();
  }

  /**
   * Gets the number of registered instances
   */
  get size(): number {
    return this.instances.size;
  }
}

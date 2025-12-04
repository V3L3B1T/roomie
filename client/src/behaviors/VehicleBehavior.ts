/**
 * VehicleBehavior - Drive vehicles with WASD controls
 */

import * as THREE from 'three';
import type { Behavior } from '../engine/BehaviorEngine';
import type { BehaviorDefinition, GameEvent } from '../../../shared/types/blueprint';
import type { InstanceRegistry } from '../engine/InstanceRegistry';

export class VehicleBehavior implements Behavior {
  id: string;
  type: string;
  enabled: boolean;
  
  private targetInstanceIds: string[];
  private instanceRegistry: InstanceRegistry;
  private config: any;
  
  // Vehicle state
  private isDriving: boolean = false;
  private velocity: number = 0;
  private turnAngle: number = 0;
  
  // Input state
  private keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
  };

  constructor(def: BehaviorDefinition, instanceRegistry: InstanceRegistry) {
    this.id = def.behaviorId;
    this.type = def.type;
    this.enabled = def.enabled ?? true;
    this.targetInstanceIds = def.targetInstanceIds;
    this.instanceRegistry = instanceRegistry;
    this.config = def.config || {};

    // Bind keyboard events
    this.bindKeyboard();
  }

  private bindKeyboard(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (!this.isDriving) return;

    switch (e.key.toLowerCase()) {
      case 'w':
        this.keys.forward = true;
        break;
      case 's':
        this.keys.backward = true;
        break;
      case 'a':
        this.keys.left = true;
        break;
      case 'd':
        this.keys.right = true;
        break;
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    switch (e.key.toLowerCase()) {
      case 'w':
        this.keys.forward = false;
        break;
      case 's':
        this.keys.backward = false;
        break;
      case 'a':
        this.keys.left = false;
        break;
      case 'd':
        this.keys.right = false;
        break;
      case 'e':
        // Toggle drive mode
        this.isDriving = !this.isDriving;
        console.log(`[Vehicle] Drive mode: ${this.isDriving ? 'ON' : 'OFF'}`);
        break;
    }
  };

  update(delta: number): void {
    if (!this.isDriving || this.targetInstanceIds.length === 0) return;

    const speed = this.config.speed || 5;
    const turnSpeed = this.config.turnSpeed || 2;
    const acceleration = this.config.acceleration || 2;
    const braking = this.config.braking || 3;

    // Update velocity
    if (this.keys.forward) {
      this.velocity = Math.min(this.velocity + acceleration * delta, speed);
    } else if (this.keys.backward) {
      this.velocity = Math.max(this.velocity - braking * delta, -speed * 0.5);
    } else {
      // Friction
      if (this.velocity > 0) {
        this.velocity = Math.max(0, this.velocity - braking * delta * 0.5);
      } else if (this.velocity < 0) {
        this.velocity = Math.min(0, this.velocity + braking * delta * 0.5);
      }
    }

    // Update turn angle
    if (this.keys.left) {
      this.turnAngle += turnSpeed * delta;
    } else if (this.keys.right) {
      this.turnAngle -= turnSpeed * delta;
    }

    // Move all vehicle parts together
    for (const instanceId of this.targetInstanceIds) {
      const obj = this.instanceRegistry.getObject3D(instanceId);
      if (obj) {
        // Rotate
        obj.rotation.y = this.turnAngle;

        // Move forward based on rotation
        const moveX = Math.sin(this.turnAngle) * this.velocity * delta;
        const moveZ = Math.cos(this.turnAngle) * this.velocity * delta;

        obj.position.x += moveX;
        obj.position.z += moveZ;
      }
    }

    // Rotate wheels
    this.rotateWheels(delta);
  }

  private rotateWheels(delta: number): void {
    for (const instanceId of this.targetInstanceIds) {
      const obj = this.instanceRegistry.getObject3D(instanceId);
      const def = this.instanceRegistry.getDefinition(instanceId);
      
      if (obj && def?.tags?.includes('wheel')) {
        // Rotate wheel based on velocity
        obj.rotation.x += this.velocity * delta * 2;
      }
    }
  }

  handleEvent(event: GameEvent): void {
    // Vehicle behavior is primarily keyboard-driven
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}

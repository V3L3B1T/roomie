/**
 * VehicleBehavior - Drive vehicles with WASD controls
 * Press E to enter/exit vehicle
 * Camera mounts to vehicle in third-person chase mode
 * Character hidden while driving
 */

import * as THREE from 'three';
import type { Behavior } from '../engine/BehaviorEngine';
import type { BehaviorDefinition, GameEvent } from '../../../shared/types/blueprint';
import type { InstanceRegistry } from '../engine/InstanceRegistry';

interface VehicleConfig {
  maxSpeed?: number;
  acceleration?: number;
  braking?: number;
  turnSpeed?: number;
  cameraOffset?: { x: number; y: number; z: number };
}

export class VehicleBehavior implements Behavior {
  id: string;
  type: string;
  enabled: boolean;
  
  private targetInstanceIds: string[];
  private instanceRegistry: InstanceRegistry;
  private config: VehicleConfig;
  
  // External references (set by main app)
  public camera: THREE.Camera | null = null;
  public character: THREE.Object3D | null = null;
  
  // Vehicle state
  private isDriving: boolean = false;
  private velocity: number = 0;
  private turnAngle: number = 0;
  
  // Camera state
  private originalCameraParent: THREE.Object3D | null = null;
  private cameraOffset: THREE.Vector3;
  
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
    this.config = (def.config as VehicleConfig) || {};

    // Default camera offset (behind and above vehicle)
    const offsetConfig = this.config.cameraOffset || { x: 0, y: 3, z: 6 };
    this.cameraOffset = new THREE.Vector3(offsetConfig.x, offsetConfig.y, offsetConfig.z);

    // Bind keyboard events
    this.bindKeyboard();
  }

  /**
   * Set camera reference (called by main app)
   */
  setCamera(camera: THREE.Camera): void {
    this.camera = camera;
  }

  /**
   * Set character reference (called by main app)
   */
  setCharacter(character: THREE.Object3D): void {
    this.character = character;
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
        this.toggleDriveMode();
        break;
    }
  };

  private toggleDriveMode(): void {
    this.isDriving = !this.isDriving;

    if (this.isDriving) {
      this.enterVehicle();
    } else {
      this.exitVehicle();
    }

    console.log(`[Vehicle] Drive mode: ${this.isDriving ? 'ON' : 'OFF'}`);
  }

  private enterVehicle(): void {
    // Hide character
    if (this.character) {
      this.character.visible = false;
      console.log('[Vehicle] Character hidden');
    }

    // Mount camera to vehicle (will be updated in update loop)
    console.log('[Vehicle] Camera mounted to vehicle');
  }

  private exitVehicle(): void {
    // Show character
    if (this.character) {
      this.character.visible = true;
      
      // Move character to vehicle position
      const vehicleObj = this.getMainVehicleObject();
      if (vehicleObj) {
        this.character.position.copy(vehicleObj.position);
        this.character.position.x += 2; // Offset to the side
      }
      
      console.log('[Vehicle] Character restored');
    }

    // Reset velocity
    this.velocity = 0;
    
    console.log('[Vehicle] Camera released from vehicle');
  }

  private getMainVehicleObject(): THREE.Object3D | null {
    // Get the first non-wheel part (usually the body)
    for (const instanceId of this.targetInstanceIds) {
      const def = this.instanceRegistry.getDefinition(instanceId);
      if (def && !def.tags?.includes('wheel')) {
        return this.instanceRegistry.getObject3D(instanceId) || null;
      }
    }
    return this.instanceRegistry.getObject3D(this.targetInstanceIds[0]) || null;
  }

  update(delta: number): void {
    if (!this.enabled) return;

    if (this.isDriving && this.targetInstanceIds.length > 0) {
      this.updateVehicleMovement(delta);
      this.updateCamera();
    }
  }

  private updateVehicleMovement(delta: number): void {
    // Config with higher defaults
    const maxSpeed = this.config.maxSpeed || 20; // Much faster!
    const acceleration = this.config.acceleration || 15; // Quicker acceleration
    const braking = this.config.braking || 10;
    const turnSpeed = this.config.turnSpeed || 2.5;

    // Update velocity
    if (this.keys.forward) {
      this.velocity = Math.min(this.velocity + acceleration * delta, maxSpeed);
    } else if (this.keys.backward) {
      this.velocity = Math.max(this.velocity - braking * delta, -maxSpeed * 0.5);
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

  private updateCamera(): void {
    if (!this.camera) return;

    const vehicleObj = this.getMainVehicleObject();
    if (!vehicleObj) return;

    // Third-person chase camera
    // Position camera behind and above the vehicle
    const offset = this.cameraOffset.clone();
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.turnAngle);

    this.camera.position.x = vehicleObj.position.x + offset.x;
    this.camera.position.y = vehicleObj.position.y + offset.y;
    this.camera.position.z = vehicleObj.position.z + offset.z;

    // Look at vehicle
    this.camera.lookAt(vehicleObj.position);
  }

  handleEvent(event: GameEvent): void {
    // Vehicle behavior is primarily keyboard-driven
  }

  destroy(): void {
    // Exit vehicle if currently driving
    if (this.isDriving) {
      this.exitVehicle();
    }

    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}

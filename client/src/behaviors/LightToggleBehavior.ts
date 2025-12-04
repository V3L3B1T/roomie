/**
 * LightToggleBehavior - Click to toggle lights on/off
 */

import * as THREE from 'three';
import type { Behavior } from '../engine/BehaviorEngine';
import type { BehaviorDefinition, GameEvent } from '../../../shared/types/blueprint';
import type { InstanceRegistry } from '../engine/InstanceRegistry';

export class LightToggleBehavior implements Behavior {
  id: string;
  type: string;
  enabled: boolean;
  
  private targetInstanceIds: string[];
  private instanceRegistry: InstanceRegistry;
  private config: any;
  private isOn: boolean;
  private pointLight: THREE.PointLight | null = null;

  constructor(def: BehaviorDefinition, instanceRegistry: InstanceRegistry) {
    this.id = def.behaviorId;
    this.type = def.type;
    this.enabled = def.enabled ?? true;
    this.targetInstanceIds = def.targetInstanceIds;
    this.instanceRegistry = instanceRegistry;
    this.config = def.config || {};
    this.isOn = this.config.isOn ?? true;

    // Create point light
    this.createLight();
  }

  private createLight(): void {
    const target = this.instanceRegistry.getObject3D(this.targetInstanceIds[0]);
    if (!target) return;

    const lightColor = this.config.lightColor || { r: 1, g: 0.9, b: 0.7 };
    const intensity = this.config.lightIntensity || 2;
    const distance = this.config.lightDistance || 10;

    this.pointLight = new THREE.PointLight(
      new THREE.Color(lightColor.r, lightColor.g, lightColor.b),
      intensity,
      distance
    );

    this.pointLight.castShadow = true;
    target.add(this.pointLight);

    // Set initial state
    this.setLightState(this.isOn);
  }

  private setLightState(on: boolean): void {
    this.isOn = on;

    // Update point light
    if (this.pointLight) {
      this.pointLight.intensity = on ? (this.config.lightIntensity || 2) : 0;
    }

    // Update emissive material
    const target = this.instanceRegistry.getObject3D(this.targetInstanceIds[0]);
    if (target) {
      target.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat.emissive) {
            mat.emissiveIntensity = on ? 1 : 0;
          }
        }
      });
    }
  }

  update(delta: number): void {
    // No continuous updates needed
  }

  handleEvent(event: GameEvent): void {
    if (event.type === 'click' && this.targetInstanceIds.includes(event.instanceId || '')) {
      // Toggle light
      this.setLightState(!this.isOn);
      console.log(`[LightToggle] Light ${this.isOn ? 'ON' : 'OFF'}`);
    }
  }

  destroy(): void {
    // Remove point light
    if (this.pointLight) {
      this.pointLight.removeFromParent();
      this.pointLight = null;
    }
  }
}

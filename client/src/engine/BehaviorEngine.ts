/**
 * BehaviorEngine - Runtime for interactive behaviors
 * Handles chess, vehicles, lights, and custom behaviors
 */

import type { BehaviorDefinition, GameEvent } from '../../../shared/types/blueprint';
import type { InstanceRegistry } from './InstanceRegistry';
import { ChessBoardBehavior } from '../behaviors/ChessBoardBehavior';
import { ChessPieceBehavior } from '../behaviors/ChessPieceBehavior';
import { VehicleBehavior } from '../behaviors/VehicleBehavior';
import { LightToggleBehavior } from '../behaviors/LightToggleBehavior';

export interface Behavior {
  id: string;
  type: string;
  enabled: boolean;
  update(delta: number): void;
  handleEvent(event: GameEvent): void;
  destroy(): void;
}

export class BehaviorEngine {
  private behaviors = new Map<string, Behavior>();
  private instanceRegistry: InstanceRegistry;

  constructor(instanceRegistry: InstanceRegistry) {
    this.instanceRegistry = instanceRegistry;
  }

  /**
   * Registers a new behavior from definition
   */
  registerBehavior(def: BehaviorDefinition): void {
    // Remove existing behavior with same ID
    if (this.behaviors.has(def.behaviorId)) {
      this.removeBehavior(def.behaviorId);
    }

    // Create behavior instance based on type
    let behavior: Behavior | null = null;

    switch (def.type) {
      case 'chess_board':
        behavior = new ChessBoardBehavior(def, this.instanceRegistry);
        break;

      case 'chess_piece':
        behavior = new ChessPieceBehavior(def, this.instanceRegistry);
        break;

      case 'vehicle':
        behavior = new VehicleBehavior(def, this.instanceRegistry);
        break;

      case 'light_toggle':
        behavior = new LightToggleBehavior(def, this.instanceRegistry);
        break;

      default:
        console.warn(`Unknown behavior type: ${def.type}`);
        return;
    }

    if (behavior) {
      this.behaviors.set(def.behaviorId, behavior);
      console.log(`[BehaviorEngine] Registered behavior: ${def.behaviorId} (${def.type})`);
    }
  }

  /**
   * Removes a behavior
   */
  removeBehavior(behaviorId: string): boolean {
    const behavior = this.behaviors.get(behaviorId);
    if (behavior) {
      behavior.destroy();
      this.behaviors.delete(behaviorId);
      console.log(`[BehaviorEngine] Removed behavior: ${behaviorId}`);
      return true;
    }
    return false;
  }

  /**
   * Gets a behavior by ID
   */
  getBehavior(behaviorId: string): Behavior | undefined {
    return this.behaviors.get(behaviorId);
  }

  /**
   * Updates all behaviors (called every frame)
   */
  update(delta: number): void {
    const behaviors = Array.from(this.behaviors.values());
    for (const behavior of behaviors) {
      if (behavior.enabled) {
        behavior.update(delta);
      }
    }
  }

  /**
   * Handles game events (clicks, keypresses, etc.)
   */
  handleEvent(event: GameEvent): void {
    const behaviors = Array.from(this.behaviors.values());
    for (const behavior of behaviors) {
      if (behavior.enabled) {
        behavior.handleEvent(event);
      }
    }
  }

  /**
   * Gets all behavior IDs
   */
  getAllIds(): string[] {
    return Array.from(this.behaviors.keys());
  }

  /**
   * Gets all behaviors
   */
  getAll(): Behavior[] {
    return Array.from(this.behaviors.values());
  }

  /**
   * Clears all behaviors
   */
  clear(): void {
    const behaviors = Array.from(this.behaviors.values());
    for (const behavior of behaviors) {
      behavior.destroy();
    }
    this.behaviors.clear();
  }

  /**
   * Gets the number of registered behaviors
   */
  get size(): number {
    return this.behaviors.size;
  }
}

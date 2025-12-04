/**
 * ShapeRegistry - Manages ShapeDefinitions
 * Acts as a template library for creating instances
 */

import type { ShapeDefinition } from '../../../shared/types/blueprint';

export class ShapeRegistry {
  private shapes = new Map<string, ShapeDefinition>();

  /**
   * Registers a new shape definition
   */
  register(shape: ShapeDefinition): void {
    this.shapes.set(shape.shapeId, shape);
  }

  /**
   * Gets a shape definition by ID
   */
  get(shapeId: string): ShapeDefinition | undefined {
    return this.shapes.get(shapeId);
  }

  /**
   * Checks if a shape exists
   */
  has(shapeId: string): boolean {
    return this.shapes.has(shapeId);
  }

  /**
   * Removes a shape definition
   */
  remove(shapeId: string): boolean {
    return this.shapes.delete(shapeId);
  }

  /**
   * Gets all shape IDs
   */
  getAllIds(): string[] {
    return Array.from(this.shapes.keys());
  }

  /**
   * Gets all shapes
   */
  getAll(): ShapeDefinition[] {
    return Array.from(this.shapes.values());
  }

  /**
   * Clears all shapes
   */
  clear(): void {
    this.shapes.clear();
  }

  /**
   * Gets the number of registered shapes
   */
  get size(): number {
    return this.shapes.size;
  }
}

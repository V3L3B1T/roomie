/**
 * Shared type definitions for Roomie blueprints
 * These types define the contract between the AI (G), backend, and frontend
 */

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
}

/**
 * Defines a reusable shape template
 */
export interface ShapeDefinition {
  shapeId: string;
  kind: 'primitive' | 'mesh' | 'external_asset' | 'parametric';
  
  // For primitives
  primitiveType?: 'box' | 'sphere' | 'cylinder' | 'cone' | 'plane' | 'torus';
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    radius?: number;
    radiusTube?: number;
    segments?: number;
  };
  
  // For meshes and external assets
  sourceUrl?: string; // URL to .glb/.gltf or library://path
  
  // Visual properties
  material?: {
    color?: Color;
    metalness?: number;
    roughness?: number;
    emissive?: Color;
    emissiveIntensity?: number;
    transparent?: boolean;
    opacity?: number;
  };
  
  // Physics properties
  physics?: {
    mass?: number;
    friction?: number;
    restitution?: number;
    collider?: 'box' | 'sphere' | 'cylinder' | 'mesh' | 'none';
  };
}

/**
 * Defines an instance of a shape in the scene
 */
export interface SceneObjectInstance {
  instanceId: string;
  shapeId: string; // References a ShapeDefinition
  name?: string;
  
  // Transform
  position: Vector3;
  rotation: Quaternion | Vector3; // Support both formats
  scale: Vector3;
  
  // State
  visible?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  
  // Metadata
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Defines a behavior attached to one or more instances
 */
export interface BehaviorDefinition {
  behaviorId: string;
  type: 'light_toggle' | 'vehicle' | 'chess_board' | 'chess_piece' | 'physics' | 'animation' | 'custom';
  targetInstanceIds: string[]; // Which instances this behavior applies to
  
  // Behavior-specific configuration
  config?: Record<string, any>;
  
  // Common behavior properties
  enabled?: boolean;
  priority?: number;
}

/**
 * The complete response from the AI orchestrator
 */
export interface BlueprintResponse {
  geometry: {
    shapes: ShapeDefinition[];
    instances: SceneObjectInstance[];
  };
  behavior: {
    behaviors: BehaviorDefinition[];
  };
  message: string; // Natural language explanation of what was done
}

/**
 * Game events for behavior system
 */
export interface GameEvent {
  type: 'click' | 'keypress' | 'collision' | 'turn' | 'custom';
  instanceId?: string;
  key?: string;
  position?: Vector3;
  data?: Record<string, any>;
}

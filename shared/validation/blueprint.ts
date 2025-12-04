/**
 * Runtime validation schemas for BlueprintResponse using Zod
 */

import { z } from 'zod';

// Basic types
export const Vector3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export const QuaternionSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  w: z.number(),
});

export const ColorSchema = z.object({
  r: z.number().min(0).max(1),
  g: z.number().min(0).max(1),
  b: z.number().min(0).max(1),
});

// ShapeDefinition schema
export const ShapeDefinitionSchema: z.ZodType<any> = z.object({
  shapeId: z.string(),
  kind: z.enum(['primitive', 'mesh', 'external_asset', 'parametric']),
  
  // Primitive properties
  primitiveType: z.enum(['box', 'sphere', 'cylinder', 'cone', 'plane', 'torus']).optional(),
  dimensions: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    depth: z.number().optional(),
    radius: z.number().optional(),
    radiusTube: z.number().optional(),
    segments: z.number().optional(),
  }).optional(),
  
  // Mesh properties
  sourceUrl: z.string().optional(),
  
  // Material properties
  material: z.object({
    color: ColorSchema.optional(),
    metalness: z.number().min(0).max(1).optional(),
    roughness: z.number().min(0).max(1).optional(),
    emissive: ColorSchema.optional(),
    emissiveIntensity: z.number().optional(),
    transparent: z.boolean().optional(),
    opacity: z.number().min(0).max(1).optional(),
  }).optional(),
  
  // Physics properties
  physics: z.object({
    mass: z.number().optional(),
    friction: z.number().optional(),
    restitution: z.number().optional(),
    collider: z.enum(['box', 'sphere', 'cylinder', 'mesh', 'none']).optional(),
  }).optional(),
});

// SceneObjectInstance schema
export const SceneObjectInstanceSchema: z.ZodType<any> = z.object({
  instanceId: z.string(),
  shapeId: z.string(),
  name: z.string().optional(),
  
  // Transform
  position: Vector3Schema,
  rotation: z.union([QuaternionSchema, Vector3Schema]),
  scale: Vector3Schema,
  
  // State
  visible: z.boolean().optional(),
  castShadow: z.boolean().optional(),
  receiveShadow: z.boolean().optional(),
  
  // Metadata
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// BehaviorDefinition schema
export const BehaviorDefinitionSchema = z.object({
  behaviorId: z.string(),
  type: z.enum(['light_toggle', 'vehicle', 'chess_board', 'chess_piece', 'physics', 'animation', 'custom']),
  targetInstanceIds: z.array(z.string()),
  
  // Configuration
  config: z.record(z.string(), z.any()).optional(),
  
  // Properties
  enabled: z.boolean().optional(),
  priority: z.number().optional(),
});

// BlueprintResponse schema
export const BlueprintResponseSchema = z.object({
  geometry: z.object({
    shapes: z.array(ShapeDefinitionSchema),
    instances: z.array(SceneObjectInstanceSchema),
  }),
  behavior: z.object({
    behaviors: z.array(BehaviorDefinitionSchema),
  }),
  message: z.string(),
});

/**
 * Validates a BlueprintResponse and returns validation result
 */
export function validateBlueprint(data: unknown): {
  success: boolean;
  data?: z.infer<typeof BlueprintResponseSchema>;
  error?: z.ZodError;
} {
  try {
    const parsed = BlueprintResponseSchema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

/**
 * Validates that all behavior targetInstanceIds reference existing instances
 */
export function validateBehaviorReferences(
  blueprint: z.infer<typeof BlueprintResponseSchema>
): { valid: boolean; errors: string[] } {
  const instanceIds = new Set(blueprint.geometry.instances.map(i => i.instanceId));
  const errors: string[] = [];
  
  for (const behavior of blueprint.behavior.behaviors) {
    for (const targetId of behavior.targetInstanceIds) {
      if (!instanceIds.has(targetId)) {
        errors.push(
          `Behavior ${behavior.behaviorId} references non-existent instance ${targetId}`
        );
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Validates that all instances reference existing shapes
 */
export function validateInstanceShapeReferences(
  blueprint: z.infer<typeof BlueprintResponseSchema>
): { valid: boolean; errors: string[] } {
  const shapeIds = new Set(blueprint.geometry.shapes.map(s => s.shapeId));
  const errors: string[] = [];
  
  for (const instance of blueprint.geometry.instances) {
    if (!shapeIds.has(instance.shapeId)) {
      errors.push(
        `Instance ${instance.instanceId} references non-existent shape ${instance.shapeId}`
      );
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Complete validation including schema and reference checks
 */
export function validateBlueprintComplete(data: unknown): {
  success: boolean;
  data?: z.infer<typeof BlueprintResponseSchema>;
  errors: string[];
} {
  // First validate schema
  const schemaResult = validateBlueprint(data);
  
  if (!schemaResult.success) {
    const zodError = schemaResult.error!;
    const errorMessages = zodError.issues?.map((issue: any) => 
      `${issue.path?.join('.') || 'root'}: ${issue.message}`
    ) || ['Unknown validation error'];
    
    return {
      success: false,
      errors: errorMessages,
    };
  }
  
  const blueprint = schemaResult.data!;
  const errors: string[] = [];
  
  // Validate references
  const shapeRefResult = validateInstanceShapeReferences(blueprint);
  if (!shapeRefResult.valid) {
    errors.push(...shapeRefResult.errors);
  }
  
  const behaviorRefResult = validateBehaviorReferences(blueprint);
  if (!behaviorRefResult.valid) {
    errors.push(...behaviorRefResult.errors);
  }
  
  return {
    success: errors.length === 0,
    data: blueprint,
    errors,
  };
}

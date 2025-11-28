import * as THREE from 'three';
import { SceneObject } from '../objects/factory';
import { parseAIResponse } from './aiResponseParser';
import { createComplexObject } from '../objects/complexObjectFactory';

export interface CommandResponse {
  action: 'none' | 'create' | 'move' | 'scale' | 'recolor' | 'delete' | 'clear' | 'reset';
  targetId: string;
  color?: string;
  axis?: 'x' | 'y' | 'z';
  amount?: number;
  type?: string;
  response?: string;
}

export function executeCommand(
  command: CommandResponse,
  scene: THREE.Scene,
  objects: SceneObject[],
  builders: {
    box: (color?: string, scale?: number) => string;
    couch: (color?: string, scale?: number) => string;
    table: (color?: string, scale?: number) => string;
    lamp: (color?: string) => string;
  }
): string {
  const action = (command.action || 'none').toLowerCase();

  // First, try to parse AI response for complex objects
  if (command.response) {
    const parsed = parseAIResponse(command.response);
    
    if (parsed) {
      if (parsed.type === 'complex') {
        // Create complex object from AI description
        const id = createComplexObject(scene, parsed);
        return `Created ${parsed.name}! ${parsed.description}`;
      } else if (parsed.type === 'simple' && parsed.simpleType) {
        // Create simple object using existing builders
        let newId: string | undefined;
        
        if (parsed.simpleType === 'box') {
          newId = builders.box(parsed.color, parsed.scale);
        } else if (parsed.simpleType === 'couch') {
          newId = builders.couch(parsed.color, parsed.scale);
        } else if (parsed.simpleType === 'table') {
          newId = builders.table(parsed.color, parsed.scale);
        } else if (parsed.simpleType === 'lamp') {
          newId = builders.lamp(parsed.color);
        }
        
        if (newId) {
          return `Created ${parsed.name}!`;
        }
      }
    }
  }

  if (action === 'clear' || action === 'reset') {
    objects.forEach(obj => scene.remove(obj));
    objects.length = 0;
    return command.response || 'Scene cleared.';
  }

  if (action === 'create') {
    const objectType = (command.targetId || '').toLowerCase();
    const color = command.color || '#2563eb';
    const scale = command.amount || 1;

    let newId: string | undefined;

    if (objectType === 'box' || objectType === 'cube') {
      newId = builders.box(color, scale);
    } else if (objectType === 'couch') {
      newId = builders.couch(color, scale);
    } else if (objectType === 'table') {
      newId = builders.table(color, scale);
    } else if (objectType === 'lamp') {
      newId = builders.lamp(color);
    }

    if (newId) {
      return `${command.response || 'Created object'} (ID: ${newId})`;
    } else {
      return `Cannot create ${objectType}. Try asking for a box, couch, table, or lamp.`;
    }
  }

  const target = objects.find(obj => obj.userData.id === command.targetId);

  if (!target) {
    if (action !== 'none') {
      return command.response || `Object ${command.targetId} not found.`;
    }
    return command.response || 'Command executed.';
  }

  const idTag = `${target.userData.id}`;

  if (action === 'recolor') {
    const color = new THREE.Color(command.color || '#ffffff');
    target.children.forEach(child => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            if (mat instanceof THREE.Material && 'color' in mat) {
              (mat as any).color.set(color);
            }
          });
        } else if ('color' in child.material) {
          (child.material as any).color.set(color);
        }
      }
    });

    if (target.userData.type === 'lamp') {
      const light = target.children.find(c => c instanceof THREE.Light);
      if (light instanceof THREE.PointLight) {
        light.color.set(color);
      }
    }

    return `Recolored ${idTag} to ${command.color || 'white'}.`;
  } else if (action === 'move') {
    const amount = command.amount || 1;
    const axis = (command.axis || 'z').toLowerCase();

    if (axis === 'x') target.position.x += amount;
    else if (axis === 'y') target.position.y += amount;
    else if (axis === 'z') target.position.z += amount;

    return `Moved ${idTag} on the ${axis.toUpperCase()}-axis by ${amount}.`;
  } else if (action === 'scale') {
    const factor = command.amount || 2;
    target.scale.multiplyScalar(factor);

    if (
      target.userData.type !== 'lamp' &&
      target.userData.type !== 'couch'
    ) {
      target.position.y = (target.position.y * factor) || 0.5 * factor;
    }

    return `Rescaled ${idTag} by a factor of ${factor.toFixed(2)}.`;
  } else if (action === 'delete') {
    scene.remove(target);
    const index = objects.indexOf(target);
    if (index > -1) {
      objects.splice(index, 1);
    }
    return `Deleted ${idTag}.`;
  }

  return command.response || 'Command executed.';
}

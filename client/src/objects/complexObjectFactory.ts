import * as THREE from 'three';
import type { ParsedObjectDescription } from '../agent/aiResponseParser';

export interface ComplexObject extends THREE.Group {
  userData: {
    id: string;
    type: 'complex';
    name: string;
    selectable: boolean;
  };
}

let nextComplexId = 1;

function generateComplexId(): string {
  return `complex-${nextComplexId++}`;
}

function getRandomPos(): number {
  return (Math.random() - 0.5) * 10;
}

export function createComplexObject(
  scene: THREE.Scene,
  description: ParsedObjectDescription
): string {
  const id = generateComplexId();
  const group = new THREE.Group() as ComplexObject;
  group.userData = {
    id,
    type: 'complex',
    name: description.name,
    selectable: true,
  };

  if (!description.components) {
    console.warn('No components found in description');
    return id;
  }

  // Create each component
  for (const component of description.components) {
    let geometry: THREE.BufferGeometry;

    switch (component.shape) {
      case 'box':
        geometry = new THREE.BoxGeometry(
          component.scale.x,
          component.scale.y,
          component.scale.z
        );
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(
          component.scale.x,
          32,
          32
        );
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(
          component.scale.x,
          component.scale.x,
          component.scale.y,
          32
        );
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(
          component.scale.x,
          component.scale.y,
          32
        );
        break;
      default:
        console.warn(`Unknown shape: ${component.shape}`);
        continue;
    }

    const material = new THREE.MeshStandardMaterial({
      color: component.color,
      metalness: 0.2,
      roughness: 0.8,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      component.position.x,
      component.position.y,
      component.position.z
    );

    if (component.rotation) {
      mesh.rotation.set(
        component.rotation.x || 0,
        component.rotation.y || 0,
        component.rotation.z || 0
      );
    }

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  // Position the entire group randomly in the scene
  group.position.set(getRandomPos(), 0, getRandomPos());

  scene.add(group);
  return id;
}

export function deleteComplexObject(scene: THREE.Scene, id: string): boolean {
  const object = scene.children.find(
    (child) => child.userData.id === id && child.userData.type === 'complex'
  );

  if (object) {
    scene.remove(object);
    return true;
  }

  return false;
}

export function getComplexObjects(scene: THREE.Scene): ComplexObject[] {
  return scene.children.filter(
    (child) => child.userData.type === 'complex'
  ) as ComplexObject[];
}

import * as THREE from 'three';

export interface SceneObject extends THREE.Group {
  userData: {
    id: string;
    type: 'box' | 'couch' | 'table' | 'lamp';
  };
}

let nextObjectId = 1;
const objects: SceneObject[] = [];

function generateObjectId(): string {
  return `object_${nextObjectId++}`;
}

export function createBox(scene: THREE.Scene, color: string = '#2563eb', scale: number = 1): string {
  const id = generateObjectId();
  const geometry = new THREE.BoxGeometry(1 * scale, 1 * scale, 1 * scale);
  const material = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const group = new THREE.Group() as SceneObject;
  group.userData = { id, type: 'box' };
  group.add(mesh);
  group.position.set(getRandomPos(), 0.5 * scale, getRandomPos());

  scene.add(group);
  objects.push(group);

  return id;
}

export function createCouch(scene: THREE.Scene, color: string = '#8b5a3c', scale: number = 1): string {
  const id = generateObjectId();
  const group = new THREE.Group() as SceneObject;
  group.userData = { id, type: 'couch' };

  // Seat
  const seatGeometry = new THREE.BoxGeometry(2 * scale, 0.5 * scale, 1 * scale);
  const seatMaterial = new THREE.MeshStandardMaterial({ color });
  const seat = new THREE.Mesh(seatGeometry, seatMaterial);
  seat.position.y = 0.25 * scale;
  seat.castShadow = true;
  group.add(seat);

  // Backrest
  const backGeometry = new THREE.BoxGeometry(2 * scale, 0.8 * scale, 0.2 * scale);
  const back = new THREE.Mesh(backGeometry, seatMaterial);
  back.position.set(0, 0.65 * scale, -0.4 * scale);
  back.castShadow = true;
  group.add(back);

  // Armrests
  const armGeometry = new THREE.BoxGeometry(0.2 * scale, 0.6 * scale, 1 * scale);
  const leftArm = new THREE.Mesh(armGeometry, seatMaterial);
  leftArm.position.set(-1 * scale, 0.4 * scale, 0);
  leftArm.castShadow = true;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeometry, seatMaterial);
  rightArm.position.set(1 * scale, 0.4 * scale, 0);
  rightArm.castShadow = true;
  group.add(rightArm);

  group.position.set(getRandomPos(), 0, getRandomPos());
  scene.add(group);
  objects.push(group);

  return id;
}

export function createTable(scene: THREE.Scene, color: string = '#8b7355', scale: number = 1): string {
  const id = generateObjectId();
  const group = new THREE.Group() as SceneObject;
  group.userData = { id, type: 'table' };

  // Top
  const topGeometry = new THREE.BoxGeometry(1.5 * scale, 0.1 * scale, 1 * scale);
  const topMaterial = new THREE.MeshStandardMaterial({ color });
  const top = new THREE.Mesh(topGeometry, topMaterial);
  top.position.y = 0.6 * scale;
  top.castShadow = true;
  group.add(top);

  // Legs
  const legGeometry = new THREE.BoxGeometry(0.1 * scale, 0.6 * scale, 0.1 * scale);
  const legMaterial = new THREE.MeshStandardMaterial({ color: '#654321' });

  const positions = [
    [-0.6 * scale, 0.3 * scale, -0.4 * scale],
    [0.6 * scale, 0.3 * scale, -0.4 * scale],
    [-0.6 * scale, 0.3 * scale, 0.4 * scale],
    [0.6 * scale, 0.3 * scale, 0.4 * scale],
  ];

  positions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    group.add(leg);
  });

  group.position.set(getRandomPos(), 0, getRandomPos());
  scene.add(group);
  objects.push(group);

  return id;
}

export function createLamp(scene: THREE.Scene, color: string = '#ffff00'): string {
  const id = generateObjectId();
  const group = new THREE.Group() as SceneObject;
  group.userData = { id, type: 'lamp' };

  // Base
  const baseGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32);
  const baseMaterial = new THREE.MeshStandardMaterial({ color: '#333333' });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.castShadow = true;
  group.add(base);

  // Pole
  const poleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1, 16);
  const poleMaterial = new THREE.MeshStandardMaterial({ color: '#555555' });
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.y = 0.55;
  pole.castShadow = true;
  group.add(pole);

  // Bulb
  const bulbGeometry = new THREE.SphereGeometry(0.15, 32, 32);
  const bulbMaterial = new THREE.MeshStandardMaterial({ color, emissive: color });
  const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
  bulb.position.y = 1.1;
  bulb.castShadow = true;
  group.add(bulb);

  // Light
  const light = new THREE.PointLight(color, 1, 10);
  light.position.y = 1.1;
  light.castShadow = true;
  group.add(light);

  group.position.set(getRandomPos(), 0, getRandomPos());
  scene.add(group);
  objects.push(group);

  return id;
}

export function findObject(id: string): SceneObject | undefined {
  return objects.find(obj => obj.userData.id === id);
}

export function deleteObject(scene: THREE.Scene, id: string): boolean {
  const obj = findObject(id);
  if (!obj) return false;

  scene.remove(obj);
  const index = objects.indexOf(obj);
  if (index > -1) {
    objects.splice(index, 1);
  }
  return true;
}

export function clearScene(scene: THREE.Scene): void {
  objects.forEach(obj => scene.remove(obj));
  objects.length = 0;
  nextObjectId = 1;
}

export function getObjects(): SceneObject[] {
  return [...objects];
}

function getRandomPos(): number {
  return (Math.random() - 0.5) * 8;
}

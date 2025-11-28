import * as THREE from 'three';

export interface YouBoiState {
  id: string;
  type: 'avatar';
  state: 'standing' | 'sitting';
  walkCycle: number;
  leftLeg?: THREE.Mesh;
  rightLeg?: THREE.Mesh;
  leftArm?: THREE.Mesh;
  rightArm?: THREE.Mesh;
  head?: THREE.Mesh;
  body?: THREE.Mesh;
}

export function createYouBoi(): THREE.Group & { userData: YouBoiState } {
  const youBoi = new THREE.Group() as THREE.Group & { userData: YouBoiState };
  youBoi.name = 'YouBoi';
  youBoi.userData = {
    id: 'youboi',
    type: 'avatar',
    state: 'standing',
    walkCycle: 0,
  };

  // Head
  const headGeometry = new THREE.SphereGeometry(0.25, 32, 32);
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xd4a574 });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.name = 'head';
  head.position.y = 0.75;
  head.castShadow = true;
  youBoi.add(head);
  youBoi.userData.head = head;

  // Body
  const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 32);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x2563eb });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.name = 'body';
  body.position.y = 0.4;
  body.castShadow = true;
  youBoi.add(body);
  youBoi.userData.body = body;

  // Left Leg
  const leftLegGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 16);
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x1f2937 });
  const leftLeg = new THREE.Mesh(leftLegGeometry, legMaterial);
  leftLeg.name = 'leftLeg';
  leftLeg.position.set(-0.1, 0.15, 0);
  leftLeg.castShadow = true;
  youBoi.add(leftLeg);
  youBoi.userData.leftLeg = leftLeg;

  // Right Leg
  const rightLeg = new THREE.Mesh(leftLegGeometry, legMaterial);
  rightLeg.name = 'rightLeg';
  rightLeg.position.set(0.1, 0.15, 0);
  rightLeg.castShadow = true;
  youBoi.add(rightLeg);
  youBoi.userData.rightLeg = rightLeg;

  // Left Arm
  const armGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 16);
  const armMaterial = new THREE.MeshStandardMaterial({ color: 0xd4a574 });
  const leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.name = 'leftArm';
  leftArm.position.set(-0.25, 0.5, 0);
  leftArm.castShadow = true;
  youBoi.add(leftArm);
  youBoi.userData.leftArm = leftArm;

  // Right Arm
  const rightArm = new THREE.Mesh(armGeometry, armMaterial);
  rightArm.name = 'rightArm';
  rightArm.position.set(0.25, 0.5, 0);
  rightArm.castShadow = true;
  youBoi.add(rightArm);
  youBoi.userData.rightArm = rightArm;

  return youBoi;
}

export function updateYouBoiColors(
  youBoi: THREE.Group & { userData: YouBoiState },
  colors: { head: string; body: string; arms: string; legs: string }
): void {
  if (youBoi.userData.head) {
    (youBoi.userData.head.material as THREE.MeshStandardMaterial).color.setStyle(colors.head);
  }
  if (youBoi.userData.body) {
    (youBoi.userData.body.material as THREE.MeshStandardMaterial).color.setStyle(colors.body);
  }
  if (youBoi.userData.leftArm) {
    (youBoi.userData.leftArm.material as THREE.MeshStandardMaterial).color.setStyle(colors.arms);
  }
  if (youBoi.userData.rightArm) {
    (youBoi.userData.rightArm.material as THREE.MeshStandardMaterial).color.setStyle(colors.arms);
  }
  if (youBoi.userData.leftLeg) {
    (youBoi.userData.leftLeg.material as THREE.MeshStandardMaterial).color.setStyle(colors.legs);
  }
  if (youBoi.userData.rightLeg) {
    (youBoi.userData.rightLeg.material as THREE.MeshStandardMaterial).color.setStyle(colors.legs);
  }
}

export function updateYouBoiAnimation(
  youBoi: THREE.Group & { userData: YouBoiState },
  isMoving: boolean,
  delta: number
): void {
  if (!youBoi || !youBoi.userData.leftLeg) return;

  const amplitude = 0.5;
  const speed = 8;

  if (isMoving) {
    youBoi.userData.walkCycle += delta * speed;

    const angle = Math.sin(youBoi.userData.walkCycle) * amplitude;

    youBoi.userData.leftLeg!.rotation.x = angle;
    youBoi.userData.rightLeg!.rotation.x = -angle;
    youBoi.userData.leftArm!.rotation.x = -angle;
    youBoi.userData.rightArm!.rotation.x = angle;

    const bob = Math.sin(youBoi.userData.walkCycle * 2) * 0.04;
    youBoi.position.y = bob;
  } else {
    youBoi.userData.walkCycle = 0;
    youBoi.userData.leftLeg!.rotation.x = 0;
    youBoi.userData.rightLeg!.rotation.x = 0;
    youBoi.userData.leftArm!.rotation.x = 0;
    youBoi.userData.rightArm!.rotation.x = 0;
    youBoi.position.y = 0;
  }
}

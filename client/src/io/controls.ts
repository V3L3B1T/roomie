export interface MoveState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

export interface CameraState {
  yaw: number;
  pitch: number;
}

export const playerSpeed = 0.08;
export const rotationSpeed = 0.003;
export const pitchLimit = Math.PI / 4;

export function createMoveState(): MoveState {
  return {
    forward: false,
    backward: false,
    left: false,
    right: false,
  };
}

export function createCameraState(): CameraState {
  return {
    yaw: 0,
    pitch: 0,
  };
}

export function setupKeyboardControls(
  moveState: MoveState,
  inputElement: HTMLInputElement
): void {
  document.addEventListener('keydown', (event) => {
    if (document.activeElement === inputElement) return;

    const key = event.key.toLowerCase();
    if (key === 'w' || key === 'arrowup') moveState.forward = true;
    if (key === 's' || key === 'arrowdown') moveState.backward = true;
    if (key === 'a' || key === 'arrowleft') moveState.left = true;
    if (key === 'd' || key === 'arrowright') moveState.right = true;
  });

  document.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    if (key === 'w' || key === 'arrowup') moveState.forward = false;
    if (key === 's' || key === 'arrowdown') moveState.backward = false;
    if (key === 'a' || key === 'arrowleft') moveState.left = false;
    if (key === 'd' || key === 'arrowright') moveState.right = false;
  });
}

export function setupMouseControls(
  canvas: HTMLCanvasElement,
  cameraState: CameraState,
  isLookingCallback: (isLooking: boolean) => boolean
): void {
  let isLooking = false;

  canvas.addEventListener('mousedown', () => {
    isLooking = isLookingCallback(true);
  });

  canvas.addEventListener('mouseup', () => {
    isLooking = false;
    isLookingCallback(false);
  });

  canvas.addEventListener('mouseleave', () => {
    isLooking = false;
    isLookingCallback(false);
  });

  canvas.addEventListener('mousemove', (event) => {
    if (!isLooking) return;

    cameraState.yaw -= event.movementX * rotationSpeed;
    cameraState.pitch += event.movementY * rotationSpeed;
    cameraState.pitch = Math.max(-pitchLimit, Math.min(pitchLimit, cameraState.pitch));
  });
}

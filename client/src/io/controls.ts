export interface MoveState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
}

export interface EditorState {
  isOpen: boolean;
}

export interface RoomState {
  radius: number;
}

export const playerSpeed = 0.08;
export const rotationSpeed = 0.003;
export const pitchLimit = Math.PI / 4;
export const jumpForce = 0.15;
export const gravity = 0.008;
export const minRoomRadius = 10;
export const maxRoomRadius = 100;
export const defaultRoomRadius = 50;

export function createMoveState(): MoveState {
  return {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  };
}

export function createEditorState(): EditorState {
  return {
    isOpen: false,
  };
}

export function createRoomState(): RoomState {
  return {
    radius: defaultRoomRadius,
  };
}

export function setupKeyboardControls(
  moveState: MoveState,
  inputElement: HTMLInputElement,
  editorState: EditorState,
  onEditorToggle?: () => void
): void {
  document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();

    // TAB to toggle character editor
    if (key === 'tab') {
      event.preventDefault();
      editorState.isOpen = !editorState.isOpen;
      onEditorToggle?.();
      return;
    }

    if (document.activeElement === inputElement) return;

    if (key === 'w' || key === 'arrowup') moveState.forward = true;
    if (key === 's' || key === 'arrowdown') moveState.backward = true;
    if (key === 'a' || key === 'arrowleft') moveState.left = true;
    if (key === 'd' || key === 'arrowright') moveState.right = true;
    if (key === ' ') {
      event.preventDefault();
      moveState.jump = true;
    }
  });

  document.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    if (key === 'w' || key === 'arrowup') moveState.forward = false;
    if (key === 's' || key === 'arrowdown') moveState.backward = false;
    if (key === 'a' || key === 'arrowleft') moveState.left = false;
    if (key === 'd' || key === 'arrowright') moveState.right = false;
    if (key === ' ') moveState.jump = false;
  });
}

export function setupMouseControls(
  canvas: HTMLCanvasElement,
  cameraState: { yaw: number; pitch: number },
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

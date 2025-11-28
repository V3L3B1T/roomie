import * as THREE from 'three';

export class ObjectSelector {
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private selectedObject: THREE.Object3D | null = null;
  private selectionOutline: THREE.LineSegments | null = null;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private onSelect?: (object: THREE.Object3D | null) => void;

  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.scene = scene;
    this.camera = camera;
  }

  setupClickHandler(canvas: HTMLCanvasElement, onSelect?: (object: THREE.Object3D | null) => void): void {
    this.onSelect = onSelect;

    canvas.addEventListener('click', (event) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      const selectableObjects = this.scene.children.filter(
        obj => obj.userData.selectable === true && obj.userData.isWall !== true
      );

      const intersects = this.raycaster.intersectObjects(selectableObjects, true);

      if (intersects.length > 0) {
        let selected = intersects[0].object;

        while (selected.parent && selected.parent !== this.scene) {
          if (selected.userData.selectable === true) {
            break;
          }
          selected = selected.parent;
        }

        this.selectObject(selected);
      } else {
        this.deselectObject();
      }
    });
  }

  selectObject(obj: THREE.Object3D): void {
    if (this.selectedObject === obj) return;

    this.deselectObject();
    this.selectedObject = obj;

    this.addSelectionOutline(obj);
    this.onSelect?.(obj);
  }

  deselectObject(): void {
    if (this.selectionOutline) {
      this.scene.remove(this.selectionOutline);
      this.selectionOutline = null;
    }

    this.selectedObject = null;
    this.onSelect?.(null);
  }

  private addSelectionOutline(obj: THREE.Object3D): void {
    if (obj instanceof THREE.Mesh) {
      const geometry = obj.geometry as THREE.BufferGeometry;
      const edges = new THREE.EdgesGeometry(geometry);
      const outline = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 2 })
      );

      outline.position.copy(obj.position);
      outline.rotation.copy(obj.rotation);
      outline.scale.copy(obj.scale);

      this.selectionOutline = outline;
      this.scene.add(outline);
    }
  }

  updateOutlineTransform(): void {
    if (this.selectionOutline && this.selectedObject) {
      this.selectionOutline.position.copy(this.selectedObject.position);
      this.selectionOutline.rotation.copy(this.selectedObject.rotation);
      this.selectionOutline.scale.copy(this.selectedObject.scale);
    }
  }

  getSelectedObject(): THREE.Object3D | null {
    return this.selectedObject;
  }
}

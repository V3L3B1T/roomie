import * as THREE from 'three';

export interface ObjectEditorState {
  selectedObject: THREE.Object3D | null;
  color: string;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  posX: number;
  posY: number;
  posZ: number;
}

export class ObjectEditor {
  private container: HTMLElement;
  private state: ObjectEditorState = {
    selectedObject: null,
    color: '#ffffff',
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    posX: 0,
    posY: 0,
    posZ: 0,
  };
  private onUpdate?: (state: ObjectEditorState) => void;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  selectObject(obj: THREE.Object3D, onUpdate?: (state: ObjectEditorState) => void): void {
    this.state.selectedObject = obj;
    this.onUpdate = onUpdate;

    if (obj.userData.color) {
      this.state.color = obj.userData.color;
    }

    this.state.scaleX = obj.scale.x;
    this.state.scaleY = obj.scale.y;
    this.state.scaleZ = obj.scale.z;
    this.state.posX = obj.position.x;
    this.state.posY = obj.position.y;
    this.state.posZ = obj.position.z;

    this.render();
  }

  deselect(): void {
    this.state.selectedObject = null;
    this.destroy();
  }

  private render(): void {
    if (!this.state.selectedObject) return;

    const editorDiv = document.createElement('div');
    editorDiv.id = 'object-editor-panel';
    editorDiv.style.cssText = `
      position: absolute;
      right: 20px;
      bottom: 480px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      z-index: 100;
      font-family: 'Inter', sans-serif;
      border: 1px solid rgba(0, 0, 0, 0.05);
      width: 280px;
      max-height: 400px;
      overflow-y: auto;
    `;

    editorDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h2 style="margin: 0; font-size: 1.1rem; color: #333; font-weight: 700;">Object Editor</h2>
        <button id="deselect-object" style="
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">×</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div>
          <label style="display: block; font-size: 0.85rem; color: #666; font-weight: 600; margin-bottom: 6px;">Color</label>
          <div style="display: flex; gap: 8px;">
            <input 
              type="color" 
              id="obj-color" 
              value="${this.state.color}"
              style="
                flex: 1;
                height: 36px;
                border: 2px solid #e5e7eb;
                border-radius: 6px;
                cursor: pointer;
              "
            >
            <input 
              type="text" 
              id="obj-color-text" 
              value="${this.state.color}"
              style="
                flex: 1;
                padding: 8px;
                border: 2px solid #e5e7eb;
                border-radius: 6px;
                font-size: 0.85rem;
                font-family: monospace;
              "
            >
          </div>
        </div>

        <div style="border-top: 1px solid #eee; padding-top: 12px;">
          <label style="display: block; font-size: 0.85rem; color: #666; font-weight: 600; margin-bottom: 8px;">Scale</label>
          ${this.createSliderControl('X', 'scaleX', this.state.scaleX, 0.1, 5)}
          ${this.createSliderControl('Y', 'scaleY', this.state.scaleY, 0.1, 5)}
          ${this.createSliderControl('Z', 'scaleZ', this.state.scaleZ, 0.1, 5)}
        </div>

        <div style="border-top: 1px solid #eee; padding-top: 12px;">
          <label style="display: block; font-size: 0.85rem; color: #666; font-weight: 600; margin-bottom: 8px;">Position</label>
          ${this.createNumberControl('X', 'posX', this.state.posX)}
          ${this.createNumberControl('Y', 'posY', this.state.posY)}
          ${this.createNumberControl('Z', 'posZ', this.state.posZ)}
        </div>

        <button id="delete-object" style="
          width: 100%;
          padding: 10px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 8px;
          font-size: 0.9rem;
        ">Delete Object</button>
      </div>
    `;

    this.container.appendChild(editorDiv);

    const deselectBtn = document.getElementById('deselect-object');
    if (deselectBtn) {
      deselectBtn.addEventListener('click', () => this.deselect());
    }

    const deleteBtn = document.getElementById('delete-object');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        this.onUpdate?.({ ...this.state, selectedObject: null });
        this.deselect();
      });
    }

    const colorInput = document.getElementById('obj-color') as HTMLInputElement;
    const colorText = document.getElementById('obj-color-text') as HTMLInputElement;

    if (colorInput && colorText) {
      colorInput.addEventListener('input', (e) => {
        const color = (e.target as HTMLInputElement).value;
        this.state.color = color;
        colorText.value = color;
        this.updateObject();
      });

      colorText.addEventListener('input', (e) => {
        const color = (e.target as HTMLInputElement).value;
        if (/^#[0-9A-F]{6}$/i.test(color)) {
          this.state.color = color;
          colorInput.value = color;
          this.updateObject();
        }
      });
    }

    this.setupScaleControls();
    this.setupPositionControls();
  }

  private setupScaleControls(): void {
    const props: Array<'scaleX' | 'scaleY' | 'scaleZ'> = ['scaleX', 'scaleY', 'scaleZ'];
    props.forEach(prop => {
      const slider = document.getElementById(`${prop}-slider`) as HTMLInputElement;
      const value = document.getElementById(`${prop}-value`) as HTMLElement;
      if (slider && value) {
        slider.addEventListener('input', (e) => {
          const val = parseFloat((e.target as HTMLInputElement).value);
          this.state[prop] = val;
          value.textContent = val.toFixed(2);
          this.updateObject();
        });
      }
    });
  }

  private setupPositionControls(): void {
    const props: Array<'posX' | 'posY' | 'posZ'> = ['posX', 'posY', 'posZ'];
    props.forEach(prop => {
      const input = document.getElementById(`${prop}-input`) as HTMLInputElement;
      if (input) {
        input.addEventListener('input', (e) => {
          const val = parseFloat((e.target as HTMLInputElement).value);
          this.state[prop] = val;
          this.updateObject();
        });
      }
    });
  }

  private createSliderControl(label: string, prop: string, value: number, min: number, max: number): string {
    return `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <label style="width: 20px; font-size: 0.85rem; font-weight: 600; color: #333;">${label}</label>
        <input 
          type="range" 
          id="${prop}-slider" 
          min="${min}" 
          max="${max}" 
          step="0.1"
          value="${value}"
          style="flex: 1; cursor: pointer;"
        >
        <span id="${prop}-value" style="width: 40px; text-align: right; font-size: 0.85rem; color: #666; font-weight: 500;">${value.toFixed(2)}</span>
      </div>
    `;
  }

  private createNumberControl(label: string, prop: string, value: number): string {
    return `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <label style="width: 20px; font-size: 0.85rem; font-weight: 600; color: #333;">${label}</label>
        <input 
          type="number" 
          id="${prop}-input" 
          value="${value.toFixed(2)}"
          step="0.5"
          style="
            flex: 1;
            padding: 6px 8px;
            border: 2px solid #e5e7eb;
            border-radius: 4px;
            font-size: 0.85rem;
          "
        >
      </div>
    `;
  }

  private updateObject(): void {
    if (!this.state.selectedObject) return;

    if (this.state.selectedObject instanceof THREE.Mesh) {
      const material = this.state.selectedObject.material as THREE.MeshStandardMaterial;
      if (material) {
        material.color.setStyle(this.state.color);
      }
    }

    this.state.selectedObject.scale.set(
      this.state.scaleX,
      this.state.scaleY,
      this.state.scaleZ
    );

    this.state.selectedObject.position.set(
      this.state.posX,
      this.state.posY,
      this.state.posZ
    );

    this.onUpdate?.(this.state);
  }

  private destroy(): void {
    const editor = document.getElementById('object-editor-panel');
    if (editor) {
      editor.remove();
    }
  }

  isOpen(): boolean {
    return this.state.selectedObject !== null;
  }
}

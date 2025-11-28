import * as THREE from 'three';

export interface CharacterColors {
  head: string;
  body: string;
  arms: string;
  legs: string;
}

export class CharacterEditor {
  private container: HTMLElement;
  private isOpen: boolean = false;
  private colors: CharacterColors = {
    head: '#d4a574',
    body: '#2563eb',
    arms: '#d4a574',
    legs: '#1f2937',
  };
  private onColorChange?: (colors: CharacterColors) => void;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  open(onColorChange?: (colors: CharacterColors) => void): void {
    this.isOpen = true;
    this.onColorChange = onColorChange;
    this.render();
  }

  close(): void {
    this.isOpen = false;
    this.destroy();
  }

  toggle(onColorChange?: (colors: CharacterColors) => void): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open(onColorChange);
    }
  }

  private render(): void {
    const editorDiv = document.createElement('div');
    editorDiv.id = 'character-editor-panel';
    editorDiv.style.cssText = `
      position: absolute;
      left: 20px;
      top: 20px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      z-index: 100;
      font-family: 'Inter', sans-serif;
      border: 1px solid rgba(0, 0, 0, 0.05);
      width: 280px;
      max-height: 90vh;
      overflow-y: auto;
    `;

    editorDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h2 style="margin: 0; font-size: 1.1rem; color: #333; font-weight: 700;">Character Editor</h2>
        <button id="close-editor" style="
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
        ${this.createColorControl('Head', 'head')}
        ${this.createColorControl('Body', 'body')}
        ${this.createColorControl('Arms', 'arms')}
        ${this.createColorControl('Legs', 'legs')}
      </div>

      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee;">
        <p style="margin: 0 0 8px 0; font-size: 0.8rem; color: #666; font-weight: 600;">CONTROLS</p>
        <div style="font-size: 0.85rem; color: #666; line-height: 1.6;">
          <div><strong>WASD</strong> - Move</div>
          <div><strong>SPACE</strong> - Jump</div>
          <div><strong>Mouse</strong> - Look Around</div>
          <div><strong>TAB</strong> - Close Editor</div>
        </div>
      </div>
    `;

    this.container.appendChild(editorDiv);

    // Setup event listeners
    const closeBtn = document.getElementById('close-editor');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Setup color inputs
    Object.keys(this.colors).forEach(part => {
      const input = document.getElementById(`color-${part}`) as HTMLInputElement;
      if (input) {
        input.addEventListener('input', (e) => {
          const color = (e.target as HTMLInputElement).value;
          this.colors[part as keyof CharacterColors] = color;
          this.onColorChange?.(this.colors);
        });
      }
    });
  }

  private createColorControl(label: string, part: keyof CharacterColors): string {
    return `
      <div style="display: flex; align-items: center; gap: 10px;">
        <label style="flex: 1; font-size: 0.9rem; color: #333; font-weight: 500;">${label}</label>
        <input 
          type="color" 
          id="color-${part}" 
          value="${this.colors[part]}"
          style="
            width: 50px;
            height: 36px;
            border: 2px solid #e5e7eb;
            border-radius: 6px;
            cursor: pointer;
            padding: 2px;
          "
        >
      </div>
    `;
  }

  private destroy(): void {
    const editor = document.getElementById('character-editor-panel');
    if (editor) {
      editor.remove();
    }
  }

  getColors(): CharacterColors {
    return { ...this.colors };
  }
}

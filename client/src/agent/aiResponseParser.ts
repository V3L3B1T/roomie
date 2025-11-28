export interface ParsedObjectDescription {
  type: 'complex' | 'simple';
  name: string;
  description: string;
  components?: Array<{
    shape: 'box' | 'sphere' | 'cylinder' | 'cone';
    color: string;
    position: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
  }>;
  simpleType?: 'box' | 'couch' | 'table' | 'lamp';
  color?: string;
  scale?: number;
}

export function parseAIResponse(rawOutput: string): ParsedObjectDescription | null {
  // Extract meaningful object descriptions from AI response
  const lowerOutput = rawOutput.toLowerCase();

  // Check for complex object descriptions
  if (lowerOutput.includes('dragon') || lowerOutput.includes('lego')) {
    return parseDragonDescription(rawOutput);
  }

  if (lowerOutput.includes('castle') || lowerOutput.includes('tower')) {
    return parseCastleDescription(rawOutput);
  }

  if (lowerOutput.includes('tree') || lowerOutput.includes('plant')) {
    return parseTreeDescription(rawOutput);
  }

  if (lowerOutput.includes('car') || lowerOutput.includes('vehicle')) {
    return parseCarDescription(rawOutput);
  }

  if (lowerOutput.includes('house') || lowerOutput.includes('building')) {
    return parseHouseDescription(rawOutput);
  }

  // Check for simple objects
  if (lowerOutput.includes('box') || lowerOutput.includes('cube')) {
    return {
      type: 'simple',
      name: 'box',
      description: 'A simple box',
      simpleType: 'box',
      color: extractColor(rawOutput) || '#2563eb',
      scale: extractScale(rawOutput) || 1,
    };
  }

  if (lowerOutput.includes('couch') || lowerOutput.includes('sofa')) {
    return {
      type: 'simple',
      name: 'couch',
      description: 'A couch',
      simpleType: 'couch',
      color: extractColor(rawOutput) || '#8b5a3c',
      scale: extractScale(rawOutput) || 1,
    };
  }

  if (lowerOutput.includes('table')) {
    return {
      type: 'simple',
      name: 'table',
      description: 'A table',
      simpleType: 'table',
      color: extractColor(rawOutput) || '#8b7355',
      scale: extractScale(rawOutput) || 1,
    };
  }

  if (lowerOutput.includes('lamp') || lowerOutput.includes('light')) {
    return {
      type: 'simple',
      name: 'lamp',
      description: 'A lamp',
      simpleType: 'lamp',
      color: extractColor(rawOutput) || '#ffff00',
    };
  }

  return null;
}

function parseDragonDescription(rawOutput: string): ParsedObjectDescription {
  const color = extractColor(rawOutput) || '#ff0000';

  return {
    type: 'complex',
    name: 'Lego Dragon',
    description: 'A dragon made of lego-like bricks',
    components: [
      // Body
      { shape: 'box', color, position: { x: 0, y: 0.5, z: 0 }, scale: { x: 1.5, y: 1, z: 2 } },
      // Head
      { shape: 'box', color, position: { x: 0, y: 1, z: 1.5 }, scale: { x: 1, y: 0.8, z: 1 } },
      // Eyes
      { shape: 'sphere', color: '#ffffff', position: { x: -0.3, y: 1.2, z: 2 }, scale: { x: 0.15, y: 0.15, z: 0.15 } },
      { shape: 'sphere', color: '#ffffff', position: { x: 0.3, y: 1.2, z: 2 }, scale: { x: 0.15, y: 0.15, z: 0.15 } },
      { shape: 'sphere', color: '#000000', position: { x: -0.3, y: 1.2, z: 2.1 }, scale: { x: 0.08, y: 0.08, z: 0.08 } },
      { shape: 'sphere', color: '#000000', position: { x: 0.3, y: 1.2, z: 2.1 }, scale: { x: 0.08, y: 0.08, z: 0.08 } },
      // Neck
      { shape: 'cylinder', color, position: { x: 0, y: 0.8, z: 1 }, scale: { x: 0.4, y: 0.5, z: 0.4 } },
      // Tail
      { shape: 'box', color, position: { x: 0, y: 0.4, z: -1.5 }, scale: { x: 0.6, y: 0.6, z: 1.5 } },
      { shape: 'cone', color, position: { x: 0, y: 0.4, z: -2.5 }, scale: { x: 0.4, y: 0.8, z: 0.4 }, rotation: { x: Math.PI / 2, y: 0, z: 0 } },
      // Wings
      { shape: 'box', color: darkenColor(color), position: { x: -1.2, y: 0.8, z: 0 }, scale: { x: 1, y: 0.05, z: 1.5 }, rotation: { x: 0, y: 0, z: Math.PI / 6 } },
      { shape: 'box', color: darkenColor(color), position: { x: 1.2, y: 0.8, z: 0 }, scale: { x: 1, y: 0.05, z: 1.5 }, rotation: { x: 0, y: 0, z: -Math.PI / 6 } },
      // Legs
      { shape: 'cylinder', color, position: { x: -0.6, y: 0, z: 0.5 }, scale: { x: 0.2, y: 0.5, z: 0.2 } },
      { shape: 'cylinder', color, position: { x: 0.6, y: 0, z: 0.5 }, scale: { x: 0.2, y: 0.5, z: 0.2 } },
      { shape: 'cylinder', color, position: { x: -0.6, y: 0, z: -0.5 }, scale: { x: 0.2, y: 0.5, z: 0.2 } },
      { shape: 'cylinder', color, position: { x: 0.6, y: 0, z: -0.5 }, scale: { x: 0.2, y: 0.5, z: 0.2 } },
      // Horns
      { shape: 'cone', color: '#ffaa00', position: { x: -0.4, y: 1.5, z: 1.5 }, scale: { x: 0.15, y: 0.4, z: 0.15 } },
      { shape: 'cone', color: '#ffaa00', position: { x: 0.4, y: 1.5, z: 1.5 }, scale: { x: 0.15, y: 0.4, z: 0.15 } },
    ],
  };
}

function parseCastleDescription(rawOutput: string): ParsedObjectDescription {
  const color = extractColor(rawOutput) || '#888888';

  return {
    type: 'complex',
    name: 'Castle',
    description: 'A medieval castle with towers',
    components: [
      // Main keep
      { shape: 'box', color, position: { x: 0, y: 1.5, z: 0 }, scale: { x: 2, y: 3, z: 2 } },
      // Towers
      { shape: 'cylinder', color, position: { x: -1.5, y: 2, z: -1.5 }, scale: { x: 0.6, y: 4, z: 0.6 } },
      { shape: 'cylinder', color, position: { x: 1.5, y: 2, z: -1.5 }, scale: { x: 0.6, y: 4, z: 0.6 } },
      { shape: 'cylinder', color, position: { x: -1.5, y: 2, z: 1.5 }, scale: { x: 0.6, y: 4, z: 0.6 } },
      { shape: 'cylinder', color, position: { x: 1.5, y: 2, z: 1.5 }, scale: { x: 0.6, y: 4, z: 0.6 } },
      // Tower tops
      { shape: 'cone', color: '#aa0000', position: { x: -1.5, y: 4.5, z: -1.5 }, scale: { x: 0.8, y: 1, z: 0.8 } },
      { shape: 'cone', color: '#aa0000', position: { x: 1.5, y: 4.5, z: -1.5 }, scale: { x: 0.8, y: 1, z: 0.8 } },
      { shape: 'cone', color: '#aa0000', position: { x: -1.5, y: 4.5, z: 1.5 }, scale: { x: 0.8, y: 1, z: 0.8 } },
      { shape: 'cone', color: '#aa0000', position: { x: 1.5, y: 4.5, z: 1.5 }, scale: { x: 0.8, y: 1, z: 0.8 } },
      // Gate
      { shape: 'box', color: '#654321', position: { x: 0, y: 0.5, z: 1.2 }, scale: { x: 0.8, y: 1, z: 0.2 } },
    ],
  };
}

function parseTreeDescription(rawOutput: string): ParsedObjectDescription {
  return {
    type: 'complex',
    name: 'Tree',
    description: 'A simple tree',
    components: [
      // Trunk
      { shape: 'cylinder', color: '#8b4513', position: { x: 0, y: 0.5, z: 0 }, scale: { x: 0.3, y: 1, z: 0.3 } },
      // Leaves (3 spheres)
      { shape: 'sphere', color: '#228b22', position: { x: 0, y: 1.5, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      { shape: 'sphere', color: '#228b22', position: { x: 0, y: 1.8, z: 0 }, scale: { x: 0.8, y: 0.8, z: 0.8 } },
      { shape: 'sphere', color: '#228b22', position: { x: 0, y: 2.1, z: 0 }, scale: { x: 0.6, y: 0.6, z: 0.6 } },
    ],
  };
}

function parseCarDescription(rawOutput: string): ParsedObjectDescription {
  const color = extractColor(rawOutput) || '#ff0000';

  return {
    type: 'complex',
    name: 'Car',
    description: 'A simple car',
    components: [
      // Body
      { shape: 'box', color, position: { x: 0, y: 0.4, z: 0 }, scale: { x: 1.5, y: 0.5, z: 0.8 } },
      // Cabin
      { shape: 'box', color, position: { x: 0, y: 0.8, z: -0.2 }, scale: { x: 1, y: 0.5, z: 0.7 } },
      // Wheels
      { shape: 'cylinder', color: '#333333', position: { x: -0.6, y: 0.15, z: 0.5 }, scale: { x: 0.15, y: 0.3, z: 0.15 }, rotation: { x: 0, y: 0, z: Math.PI / 2 } },
      { shape: 'cylinder', color: '#333333', position: { x: 0.6, y: 0.15, z: 0.5 }, scale: { x: 0.15, y: 0.3, z: 0.15 }, rotation: { x: 0, y: 0, z: Math.PI / 2 } },
      { shape: 'cylinder', color: '#333333', position: { x: -0.6, y: 0.15, z: -0.5 }, scale: { x: 0.15, y: 0.3, z: 0.15 }, rotation: { x: 0, y: 0, z: Math.PI / 2 } },
      { shape: 'cylinder', color: '#333333', position: { x: 0.6, y: 0.15, z: -0.5 }, scale: { x: 0.15, y: 0.3, z: 0.15 }, rotation: { x: 0, y: 0, z: Math.PI / 2 } },
      // Windows
      { shape: 'box', color: '#87ceeb', position: { x: 0, y: 0.9, z: 0.1 }, scale: { x: 0.9, y: 0.3, z: 0.02 } },
    ],
  };
}

function parseHouseDescription(rawOutput: string): ParsedObjectDescription {
  const color = extractColor(rawOutput) || '#d2b48c';

  return {
    type: 'complex',
    name: 'House',
    description: 'A simple house',
    components: [
      // Walls
      { shape: 'box', color, position: { x: 0, y: 1, z: 0 }, scale: { x: 2, y: 2, z: 2 } },
      // Roof
      { shape: 'cone', color: '#8b4513', position: { x: 0, y: 2.5, z: 0 }, scale: { x: 1.5, y: 1, z: 1.5 }, rotation: { x: 0, y: Math.PI / 4, z: 0 } },
      // Door
      { shape: 'box', color: '#654321', position: { x: 0, y: 0.5, z: 1.05 }, scale: { x: 0.5, y: 1, z: 0.1 } },
      // Windows
      { shape: 'box', color: '#87ceeb', position: { x: -0.6, y: 1.2, z: 1.05 }, scale: { x: 0.4, y: 0.4, z: 0.05 } },
      { shape: 'box', color: '#87ceeb', position: { x: 0.6, y: 1.2, z: 1.05 }, scale: { x: 0.4, y: 0.4, z: 0.05 } },
    ],
  };
}

function extractColor(text: string): string | null {
  const colorMap: Record<string, string> = {
    red: '#ff0000',
    blue: '#0000ff',
    green: '#00ff00',
    yellow: '#ffff00',
    orange: '#ffa500',
    purple: '#800080',
    pink: '#ffc0cb',
    brown: '#8b4513',
    black: '#000000',
    white: '#ffffff',
    gray: '#808080',
    grey: '#808080',
  };

  const lowerText = text.toLowerCase();
  for (const [colorName, hexValue] of Object.entries(colorMap)) {
    if (lowerText.includes(colorName)) {
      return hexValue;
    }
  }

  // Check for hex colors
  const hexMatch = text.match(/#[0-9a-fA-F]{6}/);
  if (hexMatch) {
    return hexMatch[0];
  }

  return null;
}

function extractScale(text: string): number | null {
  const scaleMatch = text.match(/\b(small|medium|large|big|tiny|huge)\b/i);
  if (scaleMatch) {
    const size = scaleMatch[1].toLowerCase();
    const scaleMap: Record<string, number> = {
      tiny: 0.5,
      small: 0.75,
      medium: 1,
      large: 1.5,
      big: 1.5,
      huge: 2,
    };
    return scaleMap[size] || 1;
  }
  return null;
}

function darkenColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - 40);
  const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - 40);
  const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - 40);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

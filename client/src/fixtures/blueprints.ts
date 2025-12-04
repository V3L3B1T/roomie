/**
 * Fixture blueprints for testing without n8n dependency
 * These represent typical responses from the AI orchestrator
 */

import type { BlueprintResponse } from '../../../shared/types/blueprint';
import { improvedChessBlueprint } from './chessImproved';

/**
 * Simple chess board with pieces
 */
export const chessboardBlueprint: BlueprintResponse = {
  geometry: {
    shapes: [
      // Board
      {
        shapeId: 'chess-board',
        kind: 'primitive',
        primitiveType: 'box',
        dimensions: { width: 8, height: 0.2, depth: 8 },
        material: {
          color: { r: 0.8, g: 0.7, b: 0.6 },
          metalness: 0.1,
          roughness: 0.8,
        },
      },
      // White pawn
      {
        shapeId: 'chess-pawn-white',
        kind: 'primitive',
        primitiveType: 'cylinder',
        dimensions: { radius: 0.3, height: 0.8 },
        material: {
          color: { r: 0.9, g: 0.9, b: 0.9 },
          metalness: 0.2,
          roughness: 0.6,
        },
      },
      // Black pawn
      {
        shapeId: 'chess-pawn-black',
        kind: 'primitive',
        primitiveType: 'cylinder',
        dimensions: { radius: 0.3, height: 0.8 },
        material: {
          color: { r: 0.1, g: 0.1, b: 0.1 },
          metalness: 0.2,
          roughness: 0.6,
        },
      },
    ],
    instances: [
      // Board instance
      {
        instanceId: 'board-1',
        shapeId: 'chess-board',
        name: 'Chess Board',
        position: { x: 0, y: 0.1, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        castShadow: false,
        receiveShadow: true,
        tags: ['chess', 'board'],
      },
      // White pawns (row 2)
      ...Array.from({ length: 8 }, (_, i) => ({
        instanceId: `white-pawn-${i}`,
        shapeId: 'chess-pawn-white',
        name: `White Pawn ${i + 1}`,
        position: { x: -3.5 + i, y: 0.5, z: -2.5 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        castShadow: true,
        receiveShadow: true,
        tags: ['chess', 'piece', 'white', 'pawn'],
        metadata: { team: 'white', pieceType: 'pawn', gridX: i, gridY: 1 },
      })),
      // Black pawns (row 7)
      ...Array.from({ length: 8 }, (_, i) => ({
        instanceId: `black-pawn-${i}`,
        shapeId: 'chess-pawn-black',
        name: `Black Pawn ${i + 1}`,
        position: { x: -3.5 + i, y: 0.5, z: 2.5 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        castShadow: true,
        receiveShadow: true,
        tags: ['chess', 'piece', 'black', 'pawn'],
        metadata: { team: 'black', pieceType: 'pawn', gridX: i, gridY: 6 },
      })),
    ],
  },
  behavior: {
    behaviors: [
      {
        behaviorId: 'chess-board-behavior',
        type: 'chess_board',
        targetInstanceIds: ['board-1'],
        config: {
          gridSize: 8,
          squareSize: 1,
          currentTurn: 'white',
        },
        enabled: true,
      },
      // White pawn behaviors
      ...Array.from({ length: 8 }, (_, i) => ({
        behaviorId: `white-pawn-${i}-behavior`,
        type: 'chess_piece' as const,
        targetInstanceIds: [`white-pawn-${i}`],
        config: {
          pieceType: 'pawn',
          team: 'white',
          gridPosition: { x: i, y: 1 },
        },
        enabled: true,
      })),
      // Black pawn behaviors
      ...Array.from({ length: 8 }, (_, i) => ({
        behaviorId: `black-pawn-${i}-behavior`,
        type: 'chess_piece' as const,
        targetInstanceIds: [`black-pawn-${i}`],
        config: {
          pieceType: 'pawn',
          team: 'black',
          gridPosition: { x: i, y: 6 },
        },
        enabled: true,
      })),
    ],
  },
  message: 'Created a chess board with white and black pawns. Click on pieces to select them!',
};

/**
 * Simple vehicle (car)
 */
export const vehicleBlueprint: BlueprintResponse = {
  geometry: {
    shapes: [
      // Car body
      {
        shapeId: 'car-body',
        kind: 'primitive',
        primitiveType: 'box',
        dimensions: { width: 2, height: 1, depth: 4 },
        material: {
          color: { r: 0.8, g: 0.1, b: 0.1 },
          metalness: 0.6,
          roughness: 0.3,
        },
      },
      // Car cabin
      {
        shapeId: 'car-cabin',
        kind: 'primitive',
        primitiveType: 'box',
        dimensions: { width: 1.8, height: 0.8, depth: 2 },
        material: {
          color: { r: 0.8, g: 0.1, b: 0.1 },
          metalness: 0.6,
          roughness: 0.3,
        },
      },
      // Wheel
      {
        shapeId: 'car-wheel',
        kind: 'primitive',
        primitiveType: 'cylinder',
        dimensions: { radius: 0.4, height: 0.3 },
        material: {
          color: { r: 0.1, g: 0.1, b: 0.1 },
          metalness: 0.3,
          roughness: 0.7,
        },
      },
    ],
    instances: [
      // Body
      {
        instanceId: 'car-body-1',
        shapeId: 'car-body',
        name: 'Car Body',
        position: { x: 5, y: 0.8, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        castShadow: true,
        receiveShadow: true,
        tags: ['vehicle', 'car', 'body'],
      },
      // Cabin
      {
        instanceId: 'car-cabin-1',
        shapeId: 'car-cabin',
        name: 'Car Cabin',
        position: { x: 5, y: 1.7, z: -0.5 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        castShadow: true,
        receiveShadow: true,
        tags: ['vehicle', 'car', 'cabin'],
      },
      // Wheels
      {
        instanceId: 'car-wheel-fl',
        shapeId: 'car-wheel',
        name: 'Front Left Wheel',
        position: { x: 4.2, y: 0.4, z: 1.2 },
        rotation: { x: 0, y: 0, z: Math.PI / 2 },
        scale: { x: 1, y: 1, z: 1 },
        castShadow: true,
        receiveShadow: true,
        tags: ['vehicle', 'car', 'wheel'],
      },
      {
        instanceId: 'car-wheel-fr',
        shapeId: 'car-wheel',
        name: 'Front Right Wheel',
        position: { x: 5.8, y: 0.4, z: 1.2 },
        rotation: { x: 0, y: 0, z: Math.PI / 2 },
        scale: { x: 1, y: 1, z: 1 },
        castShadow: true,
        receiveShadow: true,
        tags: ['vehicle', 'car', 'wheel'],
      },
      {
        instanceId: 'car-wheel-rl',
        shapeId: 'car-wheel',
        name: 'Rear Left Wheel',
        position: { x: 4.2, y: 0.4, z: -1.2 },
        rotation: { x: 0, y: 0, z: Math.PI / 2 },
        scale: { x: 1, y: 1, z: 1 },
        castShadow: true,
        receiveShadow: true,
        tags: ['vehicle', 'car', 'wheel'],
      },
      {
        instanceId: 'car-wheel-rr',
        shapeId: 'car-wheel',
        name: 'Rear Right Wheel',
        position: { x: 5.8, y: 0.4, z: -1.2 },
        rotation: { x: 0, y: 0, z: Math.PI / 2 },
        scale: { x: 1, y: 1, z: 1 },
        castShadow: true,
        receiveShadow: true,
        tags: ['vehicle', 'car', 'wheel'],
      },
    ],
  },
  behavior: {
    behaviors: [
      {
        behaviorId: 'car-vehicle-behavior',
        type: 'vehicle',
        targetInstanceIds: [
          'car-body-1',
          'car-cabin-1',
          'car-wheel-fl',
          'car-wheel-fr',
          'car-wheel-rl',
          'car-wheel-rr',
        ],
        config: {
          speed: 5,
          turnSpeed: 2,
          acceleration: 2,
          braking: 3,
        },
        enabled: true,
      },
    ],
  },
  message: 'Created a red car! Press E to enter drive mode, then use WASD to drive.',
};

/**
 * Simple lamp with toggle
 */
export const lampBlueprint: BlueprintResponse = {
  geometry: {
    shapes: [
      // Lamp base
      {
        shapeId: 'lamp-base',
        kind: 'primitive',
        primitiveType: 'cylinder',
        dimensions: { radius: 0.3, height: 0.1 },
        material: {
          color: { r: 0.3, g: 0.3, b: 0.3 },
          metalness: 0.8,
          roughness: 0.2,
        },
      },
      // Lamp pole
      {
        shapeId: 'lamp-pole',
        kind: 'primitive',
        primitiveType: 'cylinder',
        dimensions: { radius: 0.05, height: 2 },
        material: {
          color: { r: 0.3, g: 0.3, b: 0.3 },
          metalness: 0.8,
          roughness: 0.2,
        },
      },
      // Lamp bulb
      {
        shapeId: 'lamp-bulb',
        kind: 'primitive',
        primitiveType: 'sphere',
        dimensions: { radius: 0.3 },
        material: {
          color: { r: 1, g: 0.9, b: 0.7 },
          metalness: 0,
          roughness: 1,
          emissive: { r: 1, g: 0.9, b: 0.7 },
          emissiveIntensity: 1,
        },
      },
    ],
    instances: [
      {
        instanceId: 'lamp-base-1',
        shapeId: 'lamp-base',
        name: 'Lamp Base',
        position: { x: -5, y: 0.05, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        castShadow: true,
        receiveShadow: true,
        tags: ['lamp', 'furniture'],
      },
      {
        instanceId: 'lamp-pole-1',
        shapeId: 'lamp-pole',
        name: 'Lamp Pole',
        position: { x: -5, y: 1.05, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        castShadow: true,
        receiveShadow: true,
        tags: ['lamp', 'furniture'],
      },
      {
        instanceId: 'lamp-bulb-1',
        shapeId: 'lamp-bulb',
        name: 'Lamp Bulb',
        position: { x: -5, y: 2.3, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        castShadow: false,
        receiveShadow: false,
        tags: ['lamp', 'furniture', 'light'],
      },
    ],
  },
  behavior: {
    behaviors: [
      {
        behaviorId: 'lamp-toggle-behavior',
        type: 'light_toggle',
        targetInstanceIds: ['lamp-bulb-1'],
        config: {
          lightColor: { r: 1, g: 0.9, b: 0.7 },
          lightIntensity: 2,
          lightDistance: 10,
          isOn: true,
        },
        enabled: true,
      },
    ],
  },
  message: 'Created a lamp! Click on the bulb to toggle it on/off.',
};

/**
 * All fixture blueprints for easy access
 */
export const fixtureBlueprints = {
  chessboard: improvedChessBlueprint, // Using improved version with checkered board
  vehicle: vehicleBlueprint,
  lamp: lampBlueprint,
};

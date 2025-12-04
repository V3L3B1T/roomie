/**
 * Improved Chess Set with Checkered Board and Proper Piece Shapes
 */

import type { BlueprintResponse, ShapeDefinition, SceneObjectInstance } from '../../../shared/types/blueprint';

// Helper to create checkered board squares
function createBoardSquares(): { shapes: ShapeDefinition[]; instances: SceneObjectInstance[] } {
  const shapes: ShapeDefinition[] = [
    {
      shapeId: 'chess-square-white',
      kind: 'primitive',
      primitiveType: 'box',
      dimensions: { width: 1, height: 0.1, depth: 1 },
      material: {
        color: { r: 0.95, g: 0.95, b: 0.9 },
        metalness: 0.1,
        roughness: 0.7,
      },
    },
    {
      shapeId: 'chess-square-black',
      kind: 'primitive',
      primitiveType: 'box',
      dimensions: { width: 1, height: 0.1, depth: 1 },
      material: {
        color: { r: 0.2, g: 0.15, b: 0.1 },
        metalness: 0.1,
        roughness: 0.7,
      },
    },
  ];

  const instances: SceneObjectInstance[] = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const isWhite = (row + col) % 2 === 0;
      instances.push({
        instanceId: `square-${row}-${col}`,
        shapeId: isWhite ? 'chess-square-white' : 'chess-square-black',
        name: `Square ${String.fromCharCode(65 + col)}${row + 1}`,
        position: { x: -3.5 + col, y: 0.05, z: -3.5 + row },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        castShadow: false,
        receiveShadow: true,
        tags: ['chess', 'board', 'square'],
      });
    }
  }

  return { shapes, instances };
}

// Chess piece shapes
const chessPieceShapes: ShapeDefinition[] = [
  // Pawn - simple cylinder with rounded top
  {
    shapeId: 'chess-pawn',
    kind: 'primitive',
    primitiveType: 'cylinder',
    dimensions: { radius: 0.25, height: 0.7 },
    material: {
      color: { r: 0.9, g: 0.9, b: 0.9 },
      metalness: 0.3,
      roughness: 0.5,
    },
  },
  // Rook - tower shape (box on cylinder)
  {
    shapeId: 'chess-rook',
    kind: 'primitive',
    primitiveType: 'cylinder',
    dimensions: { radius: 0.3, height: 0.9 },
    material: {
      color: { r: 0.9, g: 0.9, b: 0.9 },
      metalness: 0.3,
      roughness: 0.5,
    },
  },
  // Knight - unique L-shape (using box for now)
  {
    shapeId: 'chess-knight',
    kind: 'primitive',
    primitiveType: 'box',
    dimensions: { width: 0.4, height: 0.9, depth: 0.5 },
    material: {
      color: { r: 0.9, g: 0.9, b: 0.9 },
      metalness: 0.3,
      roughness: 0.5,
    },
  },
  // Bishop - cone shape
  {
    shapeId: 'chess-bishop',
    kind: 'primitive',
    primitiveType: 'cone',
    dimensions: { radius: 0.3, height: 1.0 },
    material: {
      color: { r: 0.9, g: 0.9, b: 0.9 },
      metalness: 0.3,
      roughness: 0.5,
    },
  },
  // Queen - sphere on cylinder (taller)
  {
    shapeId: 'chess-queen',
    kind: 'primitive',
    primitiveType: 'cylinder',
    dimensions: { radius: 0.35, height: 1.1 },
    material: {
      color: { r: 0.9, g: 0.9, b: 0.9 },
      metalness: 0.3,
      roughness: 0.5,
    },
  },
  // King - tallest with cross on top
  {
    shapeId: 'chess-king',
    kind: 'primitive',
    primitiveType: 'cylinder',
    dimensions: { radius: 0.35, height: 1.2 },
    material: {
      color: { r: 0.9, g: 0.9, b: 0.9 },
      metalness: 0.3,
      roughness: 0.5,
    },
  },
];

// Create black versions
const blackPieceShapes: ShapeDefinition[] = chessPieceShapes.map(shape => ({
  ...shape,
  shapeId: shape.shapeId.replace('chess-', 'chess-black-'),
  material: {
    ...shape.material!,
    color: { r: 0.1, g: 0.1, b: 0.1 },
  },
}));

// Helper to create piece instances
function createPieceInstances(): SceneObjectInstance[] {
  const instances: SceneObjectInstance[] = [];
  
  // White pieces (rows 0-1)
  const whitePieces = [
    { type: 'rook', positions: [0, 7] },
    { type: 'knight', positions: [1, 6] },
    { type: 'bishop', positions: [2, 5] },
    { type: 'queen', positions: [3] },
    { type: 'king', positions: [4] },
  ];

  whitePieces.forEach(({ type, positions }) => {
    positions.forEach((col, idx) => {
      instances.push({
        instanceId: `white-${type}-${idx}`,
        shapeId: `chess-${type}`,
        name: `White ${type.charAt(0).toUpperCase() + type.slice(1)} ${idx + 1}`,
        position: { x: -3.5 + col, y: 0.5, z: -3.5 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        castShadow: true,
        receiveShadow: true,
        tags: ['chess', 'piece', 'white', type],
        metadata: { team: 'white', pieceType: type, gridX: col, gridY: 0 },
      });
    });
  });

  // White pawns (row 1)
  for (let i = 0; i < 8; i++) {
    instances.push({
      instanceId: `white-pawn-${i}`,
      shapeId: 'chess-pawn',
      name: `White Pawn ${i + 1}`,
      position: { x: -3.5 + i, y: 0.4, z: -2.5 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      castShadow: true,
      receiveShadow: true,
      tags: ['chess', 'piece', 'white', 'pawn'],
      metadata: { team: 'white', pieceType: 'pawn', gridX: i, gridY: 1 },
    });
  }

  // Black pieces (rows 6-7)
  const blackPieces = [
    { type: 'rook', positions: [0, 7] },
    { type: 'knight', positions: [1, 6] },
    { type: 'bishop', positions: [2, 5] },
    { type: 'queen', positions: [3] },
    { type: 'king', positions: [4] },
  ];

  blackPieces.forEach(({ type, positions }) => {
    positions.forEach((col, idx) => {
      instances.push({
        instanceId: `black-${type}-${idx}`,
        shapeId: `chess-black-${type}`,
        name: `Black ${type.charAt(0).toUpperCase() + type.slice(1)} ${idx + 1}`,
        position: { x: -3.5 + col, y: 0.5, z: 3.5 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        castShadow: true,
        receiveShadow: true,
        tags: ['chess', 'piece', 'black', type],
        metadata: { team: 'black', pieceType: type, gridX: col, gridY: 7 },
      });
    });
  });

  // Black pawns (row 6)
  for (let i = 0; i < 8; i++) {
    instances.push({
      instanceId: `black-pawn-${i}`,
      shapeId: 'chess-black-pawn',
      name: `Black Pawn ${i + 1}`,
      position: { x: -3.5 + i, y: 0.4, z: 2.5 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      castShadow: true,
      receiveShadow: true,
      tags: ['chess', 'piece', 'black', 'pawn'],
      metadata: { team: 'black', pieceType: 'pawn', gridX: i, gridY: 6 },
    });
  }

  return instances;
}

// Build the complete blueprint
const boardData = createBoardSquares();
const pieceInstances = createPieceInstances();

export const improvedChessBlueprint: BlueprintResponse = {
  message: 'Created improved chess set with checkered board and proper piece shapes',
  geometry: {
    shapes: [
      ...boardData.shapes,
      ...chessPieceShapes,
      ...blackPieceShapes,
    ],
    instances: [
      ...boardData.instances,
      ...pieceInstances,
    ],
  },
  behavior: {
    behaviors: [
      {
        behaviorId: 'chess-board-behavior',
        type: 'chess_board',
        targetInstanceIds: boardData.instances.map(sq => sq.instanceId),
        config: {
          gridSize: 8,
          squareSize: 1,
        },
        enabled: true,
      },
      ...pieceInstances.map(piece => ({
        behaviorId: `${piece.instanceId}-behavior`,
        type: 'chess_piece' as const,
        targetInstanceIds: [piece.instanceId],
        config: {
          team: piece.metadata!.team,
          pieceType: piece.metadata!.pieceType,
        },
        enabled: true,
      })),
    ],
  },
};

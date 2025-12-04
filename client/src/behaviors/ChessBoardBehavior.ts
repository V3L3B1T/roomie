/**
 * ChessBoardBehavior - Manages chess board state and turn taking
 */

import type { Behavior } from '../engine/BehaviorEngine';
import type { BehaviorDefinition, GameEvent } from '../../../shared/types/blueprint';
import type { InstanceRegistry } from '../engine/InstanceRegistry';

export class ChessBoardBehavior implements Behavior {
  id: string;
  type: string;
  enabled: boolean;
  
  private targetInstanceIds: string[];
  private instanceRegistry: InstanceRegistry;
  private config: any;
  
  // Chess state
  private currentTurn: 'white' | 'black';
  private gridSize: number;
  private squareSize: number;
  private selectedPieceId: string | null = null;

  constructor(def: BehaviorDefinition, instanceRegistry: InstanceRegistry) {
    this.id = def.behaviorId;
    this.type = def.type;
    this.enabled = def.enabled ?? true;
    this.targetInstanceIds = def.targetInstanceIds;
    this.instanceRegistry = instanceRegistry;
    this.config = def.config || {};
    
    this.currentTurn = this.config.currentTurn || 'white';
    this.gridSize = this.config.gridSize || 8;
    this.squareSize = this.config.squareSize || 1;
  }

  update(delta: number): void {
    // No continuous updates needed for board
  }

  handleEvent(event: GameEvent): void {
    if (event.type === 'click') {
      // Check if a piece was clicked
      const clickedDef = this.instanceRegistry.getDefinition(event.instanceId || '');
      
      if (clickedDef?.tags?.includes('piece')) {
        const team = clickedDef.metadata?.team;
        
        // Can only select pieces of current turn
        if (team === this.currentTurn) {
          this.selectedPieceId = event.instanceId || null;
          console.log(`[ChessBoard] Selected ${team} piece: ${this.selectedPieceId}`);
          
          // Highlight selected piece (visual feedback)
          this.highlightPiece(this.selectedPieceId);
        } else if (this.selectedPieceId) {
          // Try to capture opponent piece
          console.log(`[ChessBoard] Attempting capture`);
          this.attemptMove(event.instanceId || '');
        }
      } else if (this.selectedPieceId) {
        // Clicked on board - try to move
        this.attemptMove(null, event.position);
      }
    }
  }

  private highlightPiece(pieceId: string | null): void {
    // Remove previous highlights
    const allPieces = this.instanceRegistry.findByTag('piece');
    for (const { object3D } of allPieces) {
      object3D.scale.set(1, 1, 1);
    }

    // Highlight selected piece
    if (pieceId) {
      const obj = this.instanceRegistry.getObject3D(pieceId);
      if (obj) {
        obj.scale.set(1.1, 1.1, 1.1);
      }
    }
  }

  private attemptMove(targetPieceId: string | null, targetPosition?: { x: number; y: number; z: number }): void {
    if (!this.selectedPieceId) return;

    const piece = this.instanceRegistry.getObject3D(this.selectedPieceId);
    const pieceDef = this.instanceRegistry.getDefinition(this.selectedPieceId);
    
    if (!piece || !pieceDef) return;

    // Simple move logic (no validation for now)
    if (targetPosition) {
      // Move to position
      piece.position.x = targetPosition.x;
      piece.position.z = targetPosition.z;
      
      console.log(`[ChessBoard] Moved piece to (${targetPosition.x}, ${targetPosition.z})`);
      
      // Switch turn
      this.switchTurn();
    } else if (targetPieceId) {
      // Capture piece
      const targetObj = this.instanceRegistry.getObject3D(targetPieceId);
      const targetDef = this.instanceRegistry.getDefinition(targetPieceId);
      
      if (targetObj && targetDef?.metadata?.team !== pieceDef.metadata?.team) {
        // Move to captured piece position
        piece.position.copy(targetObj.position);
        
        // Remove captured piece
        targetObj.visible = false;
        targetObj.position.y = -100; // Hide it
        
        console.log(`[ChessBoard] Captured ${targetDef?.metadata?.team || 'unknown'} piece`);
        
        // Switch turn
        this.switchTurn();
      }
    }

    // Deselect
    this.selectedPieceId = null;
    this.highlightPiece(null);
  }

  private switchTurn(): void {
    this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
    console.log(`[ChessBoard] Turn: ${this.currentTurn}`);
  }

  destroy(): void {
    // Cleanup
  }
}

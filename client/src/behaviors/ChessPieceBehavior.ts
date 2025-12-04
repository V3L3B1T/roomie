/**
 * ChessPieceBehavior - Individual chess piece logic
 */

import type { Behavior } from '../engine/BehaviorEngine';
import type { BehaviorDefinition, GameEvent } from '../../../shared/types/blueprint';
import type { InstanceRegistry } from '../engine/InstanceRegistry';

export class ChessPieceBehavior implements Behavior {
  id: string;
  type: string;
  enabled: boolean;
  
  private targetInstanceIds: string[];
  private instanceRegistry: InstanceRegistry;
  private config: any;
  
  // Piece state
  private pieceType: string;
  private team: 'white' | 'black';
  private gridPosition: { x: number; y: number };

  constructor(def: BehaviorDefinition, instanceRegistry: InstanceRegistry) {
    this.id = def.behaviorId;
    this.type = def.type;
    this.enabled = def.enabled ?? true;
    this.targetInstanceIds = def.targetInstanceIds;
    this.instanceRegistry = instanceRegistry;
    this.config = def.config || {};
    
    this.pieceType = this.config.pieceType || 'pawn';
    this.team = this.config.team || 'white';
    this.gridPosition = this.config.gridPosition || { x: 0, y: 0 };
  }

  update(delta: number): void {
    // No continuous updates needed for pieces
  }

  handleEvent(event: GameEvent): void {
    // Piece behavior is handled by ChessBoardBehavior
  }

  destroy(): void {
    // Cleanup
  }

  /**
   * Gets legal moves for this piece (simplified)
   */
  getLegalMoves(): { x: number; y: number }[] {
    const moves: { x: number; y: number }[] = [];

    switch (this.pieceType) {
      case 'pawn':
        // Pawns move forward one square
        const direction = this.team === 'white' ? 1 : -1;
        moves.push({ x: this.gridPosition.x, y: this.gridPosition.y + direction });
        
        // First move can be two squares
        if ((this.team === 'white' && this.gridPosition.y === 1) ||
            (this.team === 'black' && this.gridPosition.y === 6)) {
          moves.push({ x: this.gridPosition.x, y: this.gridPosition.y + direction * 2 });
        }
        break;

      // Add more piece types here (rook, knight, bishop, queen, king)
    }

    return moves;
  }
}

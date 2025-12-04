/**
 * Shared type definitions for Roomie room persistence
 */

import type { ShapeDefinition, SceneObjectInstance, BehaviorDefinition, Vector3 } from './blueprint';

/**
 * Complete state of a room that can be saved and loaded
 */
export interface RoomState {
  roomId: string;
  ownerUserId: string;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  schemaVersion: number; // For future migrations
  
  // Scene content
  shapes: ShapeDefinition[];
  instances: SceneObjectInstance[];
  behaviors: BehaviorDefinition[];
  
  // Player state
  playerState: {
    position: Vector3;
    rotation: Vector3;
    activeAvatarAssetId?: string;
  };
  
  // Room settings
  settings?: {
    roomRadius?: number;
    ambientLight?: { r: number; g: number; b: number; intensity: number };
    skybox?: string;
    gravity?: number;
  };
  
  // Extensibility
  metadata?: Record<string, any>;
}

/**
 * Minimal room info for listing
 */
export interface RoomListItem {
  roomId: string;
  name?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  objectCount: number;
}

/**
 * Request to create a new room
 */
export interface CreateRoomRequest {
  name?: string;
  template?: 'empty' | 'starter' | 'chess' | 'playground';
}

/**
 * Response after creating a room
 */
export interface CreateRoomResponse {
  roomId: string;
  roomState: RoomState;
}

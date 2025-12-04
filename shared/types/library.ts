/**
 * Shared type definitions for Roomie asset library
 */

/**
 * An asset in the library (character, prop, vehicle, etc.)
 */
export interface LibraryAsset {
  assetId: string;
  name: string;
  description?: string;
  tags: string[];
  category: 'character' | 'prop' | 'vehicle' | 'environment' | 'chess_piece' | 'board' | 'furniture' | 'decoration' | string;
  sourceUrl: string; // glTF/GLB URL or library://path
  thumbnailUrl?: string;
  license: string;
  
  // Metadata
  author?: string;
  version?: string;
  fileSize?: number; // bytes
  triangleCount?: number;
  
  // Default spawn configuration
  defaultScale?: { x: number; y: number; z: number };
  defaultRotation?: { x: number; y: number; z: number };
  
  // Behavior hints (what behaviors this asset supports)
  supportedBehaviors?: string[];
}

/**
 * Query parameters for library search
 */
export interface LibraryQuery {
  query?: string;
  category?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

/**
 * Response from library list endpoint
 */
export interface LibraryListResponse {
  assets: LibraryAsset[];
  total: number;
  limit: number;
  offset: number;
}

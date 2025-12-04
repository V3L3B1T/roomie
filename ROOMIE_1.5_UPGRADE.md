# Roomie 1.5 Upgrade Plan

## Vision
Transform Roomie into an indie-game-quality 3D sandbox where players can build sophisticated scenes with AI assistance, interact with objects (chess, vehicles), and persist their creations.

## Phase 1: Shared Type System & Architecture Foundation
- [ ] Create `shared/types/blueprint.ts` with BlueprintResponse, ShapeDefinition, SceneObjectInstance, BehaviorDefinition
- [ ] Create `shared/types/roomState.ts` with RoomState interface
- [ ] Create `shared/types/library.ts` with LibraryAsset interface
- [ ] Update backend to import and use shared types
- [ ] Update frontend to import and use shared types

## Phase 2: Backend - Persistence Layer
- [ ] Design database schema for rooms (MySQL/TiDB)
- [ ] Create `rooms` table with schema
- [ ] Implement POST /api/room (create empty room)
- [ ] Implement GET /api/room/:roomId (fetch room state)
- [ ] Implement PUT /api/room/:roomId (save room state)
- [ ] Implement GET /api/my-rooms (list user rooms)
- [ ] Add basic authorization (anonymous sessions with localStorage)
- [ ] Add room ownership validation

## Phase 3: Backend - n8n Proxy & Validation
- [ ] Implement Zod schema for BlueprintResponse validation
- [ ] Add runtime validation in /api/roomie endpoint
- [ ] Validate ID references (behaviors → instances)
- [ ] Add error handling with safe fallback responses
- [ ] Add validation logging for debugging
- [ ] Normalize and strip unknown fields

## Phase 4: Backend - Asset Library API
- [ ] Create static asset library JSON (chess pieces, vehicles, furniture)
- [ ] Implement GET /api/library/list with query/category/pagination
- [ ] Implement GET /api/library/:assetId
- [ ] Add virtual URL mapping (library://chess/rook → real URLs)
- [ ] Add asset thumbnails
- [ ] Document asset license information

## Phase 5: Frontend - Core Data Model
- [ ] Create ShapeRegistry (shapeId → ShapeDefinition + THREE.Object3D)
- [ ] Create InstanceRegistry (instanceId → SceneObjectInstance + THREE.Object3D)
- [ ] Implement exportRoomState() function
- [ ] Implement applyRoomState(state) function
- [ ] Replace ad-hoc object tracking with registries

## Phase 6: Frontend - Geometry & Asset Handling
- [ ] Create ShapeFactory with createMeshFromShapeDefinition()
- [ ] Support kind: "primitive" (cube, sphere, cylinder, plane)
- [ ] Support kind: "mesh" / "external_asset" with GLTFLoader
- [ ] Implement asset caching layer
- [ ] Add drag-and-drop for .glb/.gltf files
- [ ] Create temporary ShapeDefinition on drop

## Phase 7: Frontend - Behavior Engine
- [ ] Create BehaviorEngine class with registerBehavior(), removeBehavior(), update()
- [ ] Implement handleEvent(event: GameEvent)
- [ ] Implement light_toggle behavior (click to toggle light/emissive)
- [ ] Implement vehicle behavior (WASD driving with acceleration/brake/turn)
- [ ] Implement chess_board behavior (grid management, turn taking)
- [ ] Implement chess_piece behavior (type, legal moves, position)
- [ ] Connect behavior engine to render loop
- [ ] Connect behavior engine to input system

## Phase 8: Frontend - Character Controller & Animation
- [ ] Replace WASD with proper character controller (velocity, acceleration, friction)
- [ ] Add gravity and ground detection (raycasting)
- [ ] Implement jumping with vertical impulse
- [ ] Create animation state machine (Idle, Walk, Run, Jump)
- [ ] Integrate THREE.AnimationMixer for clip management
- [ ] Make controller avatar-agnostic
- [ ] Add default rigged GLTF avatar
- [ ] Support custom avatar uploads

## Phase 9: Frontend - Blueprint Application
- [ ] Implement applyBlueprint(blueprint: BlueprintResponse)
- [ ] Handle new shapes (add to ShapeRegistry)
- [ ] Handle new instances (create and add to scene)
- [ ] Handle instance updates (adjust transforms)
- [ ] Handle behavior registration/updates/removal
- [ ] Make blueprint application incremental (delta-friendly)
- [ ] Hook into sendPromptToBackend pipeline

## Phase 10: Frontend - UI for Library, Behaviors, Save/Load
- [ ] Create Library Panel UI (search, filter by category)
- [ ] Implement asset spawning (click → spawn in front of player)
- [ ] Create Behavior Inspector UI (list behaviors per instance)
- [ ] Add behavior debug panel (board layout, piece configs)
- [ ] Create "Save Room" button (PUT /api/room/:roomId)
- [ ] Create "My Rooms" view (GET /api/my-rooms)
- [ ] Create "Load Room" functionality (GET /api/room/:roomId)
- [ ] Display BlueprintResponse.message in chat history

## Phase 11: Optimization & Polish
- [ ] Add performance debug overlay (FPS, draw calls, object count)
- [ ] Implement fail-gracefully UX (keep running on errors)
- [ ] Add helpful in-game error messages
- [ ] Ensure no progress loss on failures
- [ ] Optimize rendering for 30-60 FPS with dozens of objects

## Phase 12: Testing & Documentation
- [ ] Write unit tests for blueprint validation
- [ ] Write unit tests for blueprint → scene application (headless)
- [ ] Write unit tests for behavior logic (chess moves, vehicle state)
- [ ] Create integration test (mock n8n → apply blueprint → check RoomState)
- [ ] Document data flow diagram (Player → Client → Backend → n8n → Scene)
- [ ] Document module boundaries (engine, behavior, AI, persistence)
- [ ] Write "Dev Onboarding" doc (how to add behaviors, assets, extend schema)
- [ ] Create architecture diagrams

## Success Criteria
- ✅ Player can chat with G and see objects created
- ✅ Player can interact with objects (drive cars, play chess, toggle lights)
- ✅ Player can save and load rooms
- ✅ Player can browse and spawn assets from library
- ✅ Codebase is clean, testable, and extensible
- ✅ Performance is smooth (30-60 FPS)
- ✅ System fails gracefully with helpful messages

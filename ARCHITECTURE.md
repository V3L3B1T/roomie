# Roomie 1.5 - Architecture Documentation

## Overview

Roomie 1.5 uses a **declarative blueprint architecture** where the AI generates structured JSON blueprints that describe what to create, and the engine safely interprets and applies them to the 3D scene. No code execution—only data-driven scene building.

---

## Core Loop

```
User Prompt → Backend Validation → Blueprint → applyBlueprint() → Interactive Scene
```

1. **User types a prompt** ("create a chess board")
2. **Backend validates** the AI response as a `BlueprintResponse`
3. **Frontend applies** the blueprint using `applyBlueprint()`
4. **Objects appear** in the scene with interactive behaviors
5. **User interacts** (click, drive, play chess)

---

## Architecture Components

### 1. Shared Type System (`shared/types/`)

**Purpose:** Single source of truth for data structures used by both frontend and backend.

**Key Types:**
- `BlueprintResponse` - Complete AI response with geometry + behavior
- `ShapeDefinition` - Template for creating meshes (primitives or GLTF assets)
- `SceneObjectInstance` - Positioned instance of a shape in the scene
- `BehaviorDefinition` - Interactive behavior configuration
- `RoomState` - Complete room state for save/load

**Why:** TypeScript types flow end-to-end, ensuring frontend and backend stay in sync.

---

### 2. Validation Layer (`shared/validation/`)

**Purpose:** Runtime validation of AI responses using Zod schemas.

**Key Functions:**
- `validateBlueprintComplete()` - Validates entire BlueprintResponse
- Reference checking: behaviors → instances, instances → shapes

**Why:** AI responses can be malformed. Validation catches errors before they reach the engine.

---

### 3. Backend (`server/routers/roomie.ts`)

**Purpose:** Proxy to n8n webhook with validation and safe fallbacks.

**Flow:**
```typescript
POST /api/roomie
  → Forward to n8n webhook
  → Validate response with Zod
  → Return BlueprintResponse or safe fallback
```

**Why:** Keeps n8n URL private, validates AI output, provides graceful degradation.

---

### 4. Frontend Engine (`client/src/engine/`)

#### ShapeFactory (`ShapeFactory.ts`)

**Purpose:** Converts `ShapeDefinition` → THREE.js mesh

**Supports:**
- Primitives: box, sphere, cylinder, cone, plane, torus
- External assets: GLTF/GLB files
- Asset caching to avoid duplicate loads

**Why:** Decouples shape creation from scene management.

---

#### ShapeRegistry (`ShapeRegistry.ts`)

**Purpose:** Tracks all shape definitions (templates)

**API:**
```typescript
shapeRegistry.register(shape: ShapeDefinition)
shapeRegistry.get(shapeId: string): ShapeDefinition | undefined
```

**Why:** Shapes are templates; multiple instances can reference the same shape.

---

#### InstanceRegistry (`InstanceRegistry.ts`)

**Purpose:** Tracks all scene object instances + their THREE.js objects

**API:**
```typescript
instanceRegistry.register(definition, object3D)
instanceRegistry.get(instanceId: string): RegisteredInstance | undefined
instanceRegistry.findByTag(tag: string): RegisteredInstance[]
```

**Why:** Links blueprint data to actual 3D objects for querying and updates.

---

#### BehaviorEngine (`BehaviorEngine.ts`)

**Purpose:** Runtime for interactive behaviors

**Supported Behaviors:**
- `chess_board` - Manages chess game state, turn taking
- `chess_piece` - Individual piece logic
- `vehicle` - Drivable cars (WASD + E to enter/exit)
- `light_toggle` - Click to toggle lights on/off

**API:**
```typescript
behaviorEngine.registerBehavior(def: BehaviorDefinition)
behaviorEngine.update(delta: number) // Called every frame
behaviorEngine.handleEvent(event: GameEvent) // Click, keypress, etc.
```

**Why:** Separates interactive logic from rendering. Behaviors are data-driven and extensible.

---

#### applyBlueprint() (`applyBlueprint.ts`)

**Purpose:** The heart of the system—applies blueprints to the scene incrementally.

**Flow:**
```typescript
1. Register new shapes in ShapeRegistry
2. Create or update instances:
   - Create THREE.js mesh from shape
   - Apply transform (position, rotation, scale)
   - Add to scene
   - Register in InstanceRegistry
3. Register behaviors in BehaviorEngine
```

**Why:** Declarative, incremental application. Can update existing objects without recreating them.

---

### 5. Behavior Implementations (`client/src/behaviors/`)

#### LightToggleBehavior

**What:** Click on a light to toggle it on/off

**How:**
- Creates a `THREE.PointLight` attached to the bulb
- Listens for click events on target instances
- Toggles light intensity and emissive material

---

#### VehicleBehavior

**What:** Drive vehicles with WASD controls

**How:**
- Press **E** to enter/exit drive mode
- **WASD** to accelerate, brake, and steer
- Updates all vehicle parts together (body, cabin, wheels)
- Rotates wheels based on velocity

---

#### ChessBoardBehavior

**What:** Manages chess game state

**How:**
- Tracks current turn (white/black)
- Handles piece selection and movement
- Validates moves (simplified for now)
- Switches turn after valid move

---

#### ChessPieceBehavior

**What:** Individual chess piece logic

**How:**
- Stores piece type, team, grid position
- Can calculate legal moves (extensible)

---

### 6. Main Application (`client/src/main-roomie-v2.ts`)

**Purpose:** Wires everything together

**Key Sections:**

1. **Feature Flag**
   ```typescript
   const USE_NEW_ENGINE = true; // Toggle old/new system
   ```

2. **Initialization**
   ```typescript
   const shapeRegistry = new ShapeRegistry();
   const instanceRegistry = new InstanceRegistry();
   const behaviorEngine = new BehaviorEngine(instanceRegistry);
   ```

3. **Fixture Controls** (Dev testing)
   ```typescript
   // Buttons to load chessboard, car, lamp without n8n
   await applyFixture(fixtureBlueprints.chessboard);
   ```

4. **Click Event Handling**
   ```typescript
   // Fire click events to BehaviorEngine
   behaviorEngine.handleEvent({ type: 'click', instanceId, position });
   ```

5. **Update Loop**
   ```typescript
   function animate() {
     behaviorEngine.update(delta); // Update behaviors every frame
     renderer.render(scene, camera);
   }
   ```

---

## Testing Without n8n

**Fixture Blueprints** (`client/src/fixtures/blueprints.ts`)

Pre-built blueprints for testing:
- **Chessboard** - 8x8 board with white/black pawns
- **Vehicle** - Red car with drivable behavior
- **Lamp** - Interactive light with toggle

**How to Use:**
1. Open Roomie in browser
2. Click fixture buttons in top-right panel
3. Objects appear with full behavior

**Why:** Enables rapid iteration without waiting for AI responses.

---

## How to Add a New Behavior

1. **Create behavior class** in `client/src/behaviors/`
   ```typescript
   export class MyBehavior implements Behavior {
     id: string;
     type: string;
     enabled: boolean;
     
     update(delta: number): void { /* ... */ }
     handleEvent(event: GameEvent): void { /* ... */ }
     destroy(): void { /* ... */ }
   }
   ```

2. **Register in BehaviorEngine** (`BehaviorEngine.ts`)
   ```typescript
   case 'my_behavior':
     behavior = new MyBehavior(def, this.instanceRegistry);
     break;
   ```

3. **Add to shared types** (`shared/types/blueprint.ts`)
   ```typescript
   type: 'my_behavior';
   config: { /* your config */ };
   ```

4. **Create fixture** for testing (`client/src/fixtures/blueprints.ts`)

---

## Debugging Tools

**Console Access:**
```javascript
// Available at window.roomieDebug
roomieDebug.shapeRegistry.getAll()
roomieDebug.instanceRegistry.getAll()
roomieDebug.behaviorEngine.getAll()
roomieDebug.applyFixture(roomieDebug.fixtureBlueprints.chessboard)
```

**Logs:**
- `[applyBlueprint]` - Blueprint application progress
- `[BehaviorEngine]` - Behavior registration
- `[Click]` - Click event handling
- `[ChessBoard]`, `[Vehicle]`, `[LightToggle]` - Behavior-specific logs

---

## Next Steps

### Persistence (Priority B)
- Database schema for rooms
- Save/load room state
- Export/import RoomState JSON

### Asset Library (Priority C)
- Curated static asset library
- Backend API for asset listing
- Frontend library panel

### Advanced Character Controller (Priority D)
- Physics-based movement
- Animation state machine
- Custom avatar support

---

## Key Design Decisions

1. **No code execution** - Only declarative blueprints for security
2. **Incremental application** - Can update existing objects without recreating
3. **Behavior composition** - Behaviors are data-driven and extensible
4. **Shared types** - Single source of truth for data structures
5. **Registry pattern** - Centralized tracking of shapes, instances, behaviors
6. **Feature flag** - Safe rollback to old system during migration

---

## Performance Considerations

- **Asset caching** - GLTF files loaded once, cloned for instances
- **Behavior update loop** - Only enabled behaviors run each frame
- **Incremental updates** - Only changed objects are updated
- **Registry lookups** - O(1) access to shapes and instances

---

## Security

- **No eval()** - All code execution removed
- **Validation** - Zod schemas validate all AI responses
- **Safe fallbacks** - Invalid blueprints don't crash the app
- **Backend proxy** - n8n URL hidden from client

---

## File Structure

```
shared/
  types/
    blueprint.ts       # Core data structures
    roomState.ts       # Room state for save/load
    library.ts         # Asset library types
  validation/
    blueprint.ts       # Zod validation schemas

server/
  routers/
    roomie.ts          # Backend API endpoint

client/src/
  engine/
    ShapeFactory.ts    # Shape → THREE.js mesh
    ShapeRegistry.ts   # Shape template tracking
    InstanceRegistry.ts # Instance tracking
    BehaviorEngine.ts  # Behavior runtime
    applyBlueprint.ts  # Blueprint application
  
  behaviors/
    LightToggleBehavior.ts
    VehicleBehavior.ts
    ChessBoardBehavior.ts
    ChessPieceBehavior.ts
  
  fixtures/
    blueprints.ts      # Test fixtures
  
  main-roomie-v2.ts    # Main application
```

---

## Vertical Slice Status

✅ **Complete:**
- Shared type system
- Backend validation
- Core engine (registries, factory, applyBlueprint)
- Behavior implementations (chess, vehicle, light)
- Fixture testing system
- Integration into main app

🚧 **Next:**
- Wire up backend /api/roomie to chat input
- Test with live n8n webhook
- Add persistence layer

---

For questions or contributions, see `ROOMIE_1.5_PROGRESS.md` for detailed task tracking.

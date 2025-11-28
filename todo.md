# Roomie - Full-Stack Implementation TODO

## Phase 1: Core Architecture & Backend Setup
- [x] Extract and refactor Roomie.html into modular TypeScript structure
- [x] Create backend API proxy at `/api/roomie` endpoint
- [x] Implement webhook client to forward requests to n8n
- [x] Set up environment variables for webhook URL and API key
- [ ] Create database schema for rooms and objects persistence
- [ ] Implement room state persistence (Firestore/Database)

## Phase 2: Frontend Refactoring
- [x] Extract Three.js scene setup into `src/engine/scene.ts`
- [x] Extract avatar (YouBoi) logic into `src/avatar/youBoi.ts`
- [x] Extract object factory into `src/objects/factory.ts`
- [x] Extract keyboard/mouse controls into `src/io/controls.ts`
- [x] Extract chat UI into `src/ui/chat.ts`
- [x] Extract command executor into `src/agent/commandExecutor.ts`
- [x] Implement main-roomie.ts entry point with module integration
- [x] Create roomie.html with proper structure

## Phase 3: Security & Safety
- [x] Remove eval() and replace with safe command schema
- [x] Implement structured command validation
- [ ] Add CORS configuration for webhook
- [x] Move webhook URL to backend (hide from client)
- [ ] Add rate limiting to API endpoints
- [ ] Implement optional JWT authentication for multi-tenant usage

## Phase 4: UX & Performance
- [ ] Add pixel ratio handling for high-DPI displays
- [ ] Implement tab visibility detection (pause rendering when hidden)
- [ ] Add object limit and cleanup logic
- [ ] Polish camera controls and movement speeds
- [ ] Add UI hints for keyboard/mouse controls
- [ ] Implement status labels and loading states
- [ ] Add message timestamps and system vs agent distinction

## Phase 5: Testing & Quality
- [ ] Write Vitest tests for command executor
- [ ] Write Vitest tests for webhook client
- [ ] Write Vitest tests for object factory
- [ ] Add ESLint configuration and linting
- [ ] Add Prettier configuration for code formatting
- [ ] Set up GitHub Actions CI/CD pipeline

## Phase 6: Deployment & Documentation
- [ ] Create GitHub repository
- [ ] Set up environment variables for production
- [ ] Create deployment guide for Render/Fly.io/Railway
- [ ] Document API contract and webhook schema
- [ ] Create README with setup instructions
- [ ] Add LICENSE file

## Phase 7: Optional Enhancements
- [ ] Implement Firebase persistence (if needed)
- [ ] Add live collaboration with Firestore subscriptions
- [ ] Implement undo/redo functionality
- [ ] Add scene versioning and history
- [ ] Create admin dashboard for room management
- [ ] Add analytics and logging

## Phase 8: Vercel Deployment Fix
- [x] Create vercel.json configuration file
- [x] Create Vercel serverless function for API
- [x] Configure proper entry point for Roomie app
- [x] Test build locally
- [ ] Push changes to GitHub
- [x] Create comprehensive deployment documentation

## Phase 9: Vercel + Render Integration
- [x] Fix vercel.json runtime configuration error
- [x] Remove serverless function (use Render backend instead)
- [x] Configure frontend to point to Render backend
- [x] Update DEPLOYMENT.md with Vercel + Render architecture
- [x] Create .env.production.example file
- [ ] Push changes to GitHub

## Phase 10: Gameplay Enhancements
- [x] Hard-code webhook URL for prototype
- [x] Implement character jumping with SPACE key
- [x] Create character model editor toggle (TAB key)
- [x] Add room boundaries with 4 walls
- [x] Add radius slider control in UI
- [x] Implement boundary collision detection
- [ ] Commit to GitHub

## Phase 11: Character & Object Editor UI
- [x] Create character model editor UI panel
- [x] Add avatar color customization controls
- [x] Implement raycasting for object selection
- [x] Create object editor panel with controls
- [x] Add visual feedback for selected objects (yellow outline)
- [x] Implement color picker for objects
- [x] Implement scale slider for objects
- [x] Implement position controls (X, Y, Z)
- [x] Test all editing features
- [ ] Commit to GitHub

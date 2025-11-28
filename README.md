# Roomie - AI-Powered 3D Room Builder

A full-stack web application that combines a Three.js-based 3D room builder with AI-powered webhook integration. Users can interact with a 3D environment through natural language commands processed by an external AI service (n8n).

## Features

- **3D Interactive Environment**: Navigate a 3D room using WASD keys and mouse controls
- **AI-Powered Commands**: Send natural language prompts to create, modify, and delete 3D objects
- **Real-time Chat Interface**: Communicate with the AI agent through an integrated chat UI
- **Object Management**: Create boxes, couches, tables, and lamps with customizable colors and scales
- **Avatar System**: Control a stickman avatar that walks and animates based on player movement
- **Secure Backend Proxy**: Backend API proxy hides the n8n webhook URL and adds security layers

## Tech Stack

### Frontend
- **Vite** - Fast build tool and dev server
- **Three.js** - 3D graphics library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Node.js + Express** - Server runtime and framework
- **tRPC** - Type-safe RPC framework
- **Drizzle ORM** - Database ORM
- **MySQL/TiDB** - Database

## Project Structure

```
roomie/
├── client/
│   ├── src/
│   │   ├── engine/        # Three.js scene setup
│   │   ├── avatar/        # Avatar (YouBoi) logic
│   │   ├── objects/       # Object factory and management
│   │   ├── io/            # Keyboard and mouse controls
│   │   ├── agent/         # Command executor
│   │   ├── network/       # Webhook client
│   │   ├── ui/            # Chat UI manager
│   │   └── main-roomie.ts # Main entry point
│   ├── roomie.html        # Roomie-specific HTML
│   └── index.html         # Default React app
├── server/
│   ├── routers/
│   │   └── roomie.ts      # Roomie API routes
│   ├── db.ts              # Database helpers
│   ├── routers.ts         # Main router
│   └── _core/             # Core framework files
├── drizzle/               # Database schema
└── package.json
```

## Setup & Development

### Prerequisites
- Node.js 18+ and pnpm
- MySQL/TiDB database
- n8n webhook URL for AI processing

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Configure your environment variables:
# ROOMIE_WEBHOOK_URL=https://your-n8n-instance.com/webhook/roomie
# ROOMIE_API_KEY=your-optional-api-key
# DATABASE_URL=mysql://user:password@host:port/database
```

### Development

```bash
# Start the development server
pnpm dev

# The app will be available at:
# - Frontend: http://localhost:5173
# - Backend: http://localhost:3000
# - Roomie app: http://localhost:5173/roomie.html

# Run tests
pnpm test

# Type check
pnpm check

# Format code
pnpm format
```

### Database

```bash
# Push schema changes to database
pnpm db:push

# Generate migrations
pnpm db:generate
```

## API Endpoints

### Roomie API

**POST /api/trpc/roomie.sendPrompt**

Send a natural language prompt to the AI webhook and receive structured commands.

Request:
```json
{
  "prompt": "create a blue box",
  "sceneState": {
    "objects": [...]
  }
}
```

Response:
```json
{
  "action": "create",
  "targetId": "box",
  "color": "#2563eb",
  "amount": 1,
  "response": "Created a blue box"
}
```

## Deployment

### Frontend Deployment

The frontend can be deployed to any static hosting service:

**Netlify**
```bash
# Build
pnpm build

# Deploy dist/ folder to Netlify
# Set build command: pnpm build
# Set publish directory: dist
```

**Vercel**
```bash
# Vercel auto-detects Vite and configures automatically
# Just connect your GitHub repository
```

**Cloudflare Pages**
```bash
# Connect your GitHub repository
# Set build command: pnpm build
# Set publish directory: dist
```

### Backend Deployment

Deploy to any Node.js hosting service:

**Render**
1. Connect your GitHub repository
2. Create a new Web Service
3. Set build command: `pnpm install && pnpm build`
4. Set start command: `pnpm start`
5. Add environment variables in the dashboard

**Fly.io**
```bash
# Install Fly CLI
# Create app
fly launch

# Deploy
fly deploy
```

**Railway**
1. Connect your GitHub repository
2. Add environment variables
3. Railway auto-detects Node.js and deploys

**Heroku**
```bash
# Create Procfile with:
# web: pnpm start

# Deploy
git push heroku main
```

## Environment Variables

### Frontend
- `VITE_ROOMIE_API_URL` - Backend API URL (default: `/api/roomie`)

### Backend
- `ROOMIE_WEBHOOK_URL` - n8n webhook URL (required)
- `ROOMIE_API_KEY` - Optional API key for webhook authentication
- `DATABASE_URL` - MySQL/TiDB connection string (required)
- `JWT_SECRET` - Session cookie signing secret (required)
- `NODE_ENV` - Environment (development/production)

## Controls

### Keyboard
- **W/↑** - Move forward
- **S/↓** - Move backward
- **A/←** - Move left
- **D/→** - Move right
- **Mouse drag** - Look around (click canvas first)
- **↑/↓** - Command history navigation

### Chat
- **Enter** - Send command
- **↑/↓** - Navigate command history

## Commands

Natural language examples:
- "create a blue box"
- "move object_1 forward by 2"
- "recolor object_2 to red"
- "scale object_3 by 2"
- "delete object_1"
- "clear room"

## Architecture

### Frontend Architecture

The frontend is modular and organized by concern:

- **engine/scene.ts** - Three.js scene initialization and rendering
- **avatar/youBoi.ts** - Avatar creation and animation
- **objects/factory.ts** - Object creation and management
- **io/controls.ts** - Input handling (keyboard/mouse)
- **agent/commandExecutor.ts** - Command execution logic
- **network/webhookClient.ts** - Webhook communication
- **ui/chat.ts** - Chat interface management

### Backend Architecture

The backend uses tRPC for type-safe RPC:

- **routers/roomie.ts** - Roomie-specific procedures
- **routers.ts** - Main router combining all routers
- **db.ts** - Database query helpers
- **_core/** - Framework infrastructure

## Security Considerations

1. **No eval()** - The application does not execute arbitrary code from the webhook
2. **Structured Commands** - All commands follow a strict schema
3. **Backend Proxy** - The n8n webhook URL is hidden from the client
4. **CORS Protection** - Backend validates origins and requests
5. **Rate Limiting** - Optional rate limiting on API endpoints
6. **Environment Variables** - Secrets are stored in environment variables, not in code

## Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test server/routers/roomie.test.ts
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests for new features
4. Run `pnpm format` and `pnpm check`
5. Submit a pull request

## License

MIT

## Support

For issues and questions, please open a GitHub issue or contact the maintainers.

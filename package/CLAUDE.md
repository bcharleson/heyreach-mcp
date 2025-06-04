# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Build & Development
```bash
npm run build      # Build TypeScript to dist/
npm run dev        # Run in development mode with tsx
npm start          # Start production build from dist/
```

### Running the Server
```bash
# Development mode
npm run dev -- --api-key=YOUR_HEYREACH_API_KEY

# Production mode
npm run build
npm start -- --api-key=YOUR_HEYREACH_API_KEY

# With custom base URL
npm start -- --api-key=YOUR_API_KEY --base-url=https://api.heyreach.io/api/public
```

### Testing
No automated tests are currently configured. To test the MCP server:
```bash
# Use MCP Inspector
npx @modelcontextprotocol/inspector heyreach-mcp-server --api-key=YOUR_API_KEY
```

## Architecture Overview

### Core Components

1. **Entry Point** (`src/index.ts`):
   - Parses command-line arguments for API key and optional base URL
   - Creates HeyReachMcpServer instance
   - Sets up stdio transport for MCP communication
   - Handles graceful shutdown signals

2. **MCP Server** (`src/server.ts`):
   - Main server class that registers all MCP tools
   - Organized into tool categories:
     - Campaign Management (create, list, toggle status)
     - Lead Management (add, retrieve, update status)
     - Messaging (send messages, get templates)
     - Social Actions (like, follow, view profiles)
     - Analytics (campaign metrics, API key validation)
   - Each tool validates inputs using Zod schemas
   - Returns structured responses with error handling

3. **API Client** (`src/heyreach-client.ts`):
   - Axios-based HTTP client for HeyReach API
   - Configures authentication via X-API-KEY header
   - Implements all API endpoints with TypeScript types
   - Centralized error handling via interceptors
   - Returns standardized ApiResponse objects

4. **Type Definitions** (`src/types.ts`):
   - Comprehensive TypeScript interfaces for all data models
   - Includes Campaign, Lead, MessageTemplate, etc.
   - Defines parameter types for all API operations
   - Standardized response types (ApiResponse, PaginatedResponse)

### Key Design Patterns

- **Separation of Concerns**: MCP server logic separated from API client
- **Type Safety**: All inputs validated with Zod, all data typed with TypeScript
- **Error Handling**: Consistent error responses across all tools
- **Modular Tool Organization**: Tools grouped by functionality in setup methods

## HeyReach API Integration

This MCP server integrates with HeyReach's public API (v1) at `https://api.heyreach.io/api/public`. The API requires authentication via an X-API-KEY header. All responses follow a consistent structure with success/error states.

Key API endpoints implemented:
- `/auth/CheckApiKey` - Validate API key
- `/campaign/*` - Campaign CRUD operations
- `/lead/*` - Lead management
- `/message/*` - Messaging functionality
- `/social/*` - Social media actions
- `/analytics/*` - Performance metrics
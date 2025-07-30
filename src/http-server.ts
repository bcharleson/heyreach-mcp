#!/usr/bin/env node

import express, { Request, Response } from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { HeyReachMcpServer } from './server.js';
import { HeyReachConfig } from './types.js';

/**
 * HTTP Streaming MCP Server for HeyReach
 * Supports URL-based API key authentication: /mcp/{API_KEY}
 */

interface SessionTransport {
  transport: StreamableHTTPServerTransport;
  server: McpServer;
  heyReachServer: HeyReachMcpServer;
}

// Map to store transports by session ID
const transports: { [sessionId: string]: SessionTransport } = {};

/**
 * Extract API key from URL path or headers
 */
function extractApiKey(req: Request): string | null {
  // First try to get API key from URL path (existing method)
  const pathApiKey = extractApiKeyFromPath(req.path);
  if (pathApiKey) {
    return pathApiKey;
  }

  // Then try to get API key from headers
  const headerApiKey = req.headers['x-api-key'] || req.headers['authorization'];
  if (headerApiKey) {
    // Handle Authorization header with Bearer prefix
    if (typeof headerApiKey === 'string' && headerApiKey.startsWith('Bearer ')) {
      return headerApiKey.substring(7);
    }
    return headerApiKey as string;
  }

  return null;
}

/**
 * Extract API key from URL path
 */
function extractApiKeyFromPath(path: string): string | null {
  const match = path.match(/^\/mcp\/([^\/]+)(?:\/.*)?$/);
  return match ? match[1] : null;
}

/**
 * Create Express app with CORS and middleware
 */
function createApp(): express.Application {
  const app = express();
  
  // Enable CORS for browser-based clients
  app.use(cors({
    origin: '*', // Configure appropriately for production
    exposedHeaders: ['Mcp-Session-Id'],
    allowedHeaders: ['Content-Type', 'mcp-session-id', 'x-api-key', 'authorization'],
  }));
  
  app.use(express.json());
  
  return app;
}

/**
 * Create HeyReach MCP server instance
 */
function createHeyReachServer(apiKey: string, baseUrl?: string): HeyReachMcpServer {
  const config: HeyReachConfig = {
    apiKey,
    baseUrl
  };
  
  return new HeyReachMcpServer(config);
}

/**
 * Handle MCP requests with session management
 */
async function handleMcpRequest(req: Request, res: Response) {
  try {
    // Extract API key from URL path
    const apiKey = extractApiKey(req);
    if (!apiKey) {
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: API key required in URL path (/mcp/{API_KEY}) or header (X-API-Key or Authorization)',
        },
        id: null,
      });
      return;
    }

    // Check for existing session ID
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    let sessionTransport: SessionTransport;

    if (sessionId && transports[sessionId]) {
      // Reuse existing transport
      sessionTransport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New initialization request
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sessionId) => {
          // Store the transport by session ID
          transports[sessionId] = sessionTransport;
        },
        // Enable DNS rebinding protection for security
        enableDnsRebindingProtection: true,
        allowedHosts: ['127.0.0.1', 'localhost', 'localhost:3000', 'localhost:3001', 'localhost:3002', 'localhost:3003', 'localhost:3004', 'localhost:3005'],
      });

      // Create HeyReach MCP server
      const heyReachServer = createHeyReachServer(apiKey);
      const server = heyReachServer.getServer();

      sessionTransport = {
        transport,
        server,
        heyReachServer
      };

      // Clean up transport when closed
      transport.onclose = () => {
        if (transport.sessionId) {
          delete transports[transport.sessionId];
        }
      };

      // Connect to the MCP server
      await server.connect(transport);
      
      console.error(`HeyReach MCP HTTP Server session initialized: ${transport.sessionId}`);
      console.error(`API Key: ${apiKey.substring(0, 8)}...`);
    } else {
      // Invalid request
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided',
        },
        id: null,
      });
      return;
    }

    // Handle the request
    await sessionTransport.transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
}

/**
 * Handle session requests (GET for SSE, DELETE for termination)
 */
async function handleSessionRequest(req: Request, res: Response) {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }
  
  const sessionTransport = transports[sessionId];
  await sessionTransport.transport.handleRequest(req, res);
}

/**
 * Start HTTP streaming server
 */
export async function startHttpServer(port: number = 3000): Promise<void> {
  const app = createApp();

  // Handle POST requests for client-to-server communication
  // Support both URL path authentication (/mcp/{API_KEY}) and header authentication (/mcp)
  app.post('/mcp/:apiKey?', handleMcpRequest);
  app.post('/mcp', handleMcpRequest);

  // Handle GET requests for server-to-client notifications via SSE
  app.get('/mcp/:apiKey?', handleSessionRequest);
  app.get('/mcp', handleSessionRequest);

  // Handle DELETE requests for session termination
  app.delete('/mcp/:apiKey?', handleSessionRequest);
  app.delete('/mcp', handleSessionRequest);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      sessions: Object.keys(transports).length
    });
  });

  // Root endpoint with usage information
  app.get('/', (req, res) => {
    res.json({
      name: 'HeyReach MCP Server',
      version: '2.0.3',
      description: 'HTTP Streaming MCP Server for HeyReach LinkedIn automation with header authentication',
      usage: {
        endpoint: '/mcp/{API_KEY} or /mcp with header authentication',
        methods: ['POST', 'GET', 'DELETE'],
        authentication: [
          'URL path: /mcp/{API_KEY}',
          'Header: X-API-Key: {API_KEY}',
          'Header: Authorization: Bearer {API_KEY}'
        ],
        example: '/mcp/QGUYbd7r... or /mcp with X-API-Key header'
      },
      documentation: 'https://github.com/bcharleson/heyreach-mcp-server'
    });
  });

  return new Promise((resolve, reject) => {
    const server = app.listen(port, (error?: Error) => {
      if (error) {
        reject(error);
      } else {
        console.error(`HeyReach MCP HTTP Server listening on port ${port}`);
        console.error(`Usage: POST/GET/DELETE to /mcp/{API_KEY} or /mcp with header authentication`);
        console.error(`Header auth: X-API-Key: {API_KEY} or Authorization: Bearer {API_KEY}`);
        console.error(`Health check: GET /health`);
        resolve();
      }
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.error('Received SIGINT, shutting down gracefully...');
      server.close(() => {
        // Clean up all transports
        Object.values(transports).forEach(({ transport, server }) => {
          transport.close();
          server.close();
        });
        process.exit(0);
      });
    });

    process.on('SIGTERM', () => {
      console.error('Received SIGTERM, shutting down gracefully...');
      server.close(() => {
        // Clean up all transports
        Object.values(transports).forEach(({ transport, server }) => {
          transport.close();
          server.close();
        });
        process.exit(0);
      });
    });
  });
}

/**
 * Main function for HTTP server mode
 */
export async function main() {
  try {
    const port = parseInt(process.env.PORT || '3000', 10);
    await startHttpServer(port);
  } catch (error) {
    console.error('Failed to start HeyReach MCP HTTP Server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === __filename;

if (isMainModule) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

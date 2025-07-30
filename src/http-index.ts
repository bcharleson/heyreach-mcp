#!/usr/bin/env node

/**
 * HTTP-only entry point for HeyReach MCP Server
 * This is used for cloud deployments where only HTTP streaming transport is needed
 */

import { startHttpServer } from './http-server.js';

/**
 * Parse command line arguments for HTTP server
 */
function parseHttpArguments(): { port: number } {
  const args = process.argv.slice(2);
  let port = parseInt(process.env.PORT || '3000', 10);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--port' && i + 1 < args.length) {
      port = parseInt(args[i + 1], 10);
      i++; // Skip next argument as it's the value
    } else if (arg.startsWith('--port=')) {
      port = parseInt(arg.split('=')[1], 10);
    }
  }

  if (isNaN(port) || port < 1 || port > 65535) {
    console.error('Error: Invalid port number. Must be between 1 and 65535');
    process.exit(1);
  }

  return { port };
}

/**
 * Main function for HTTP server
 */
async function main() {
  try {
    const { port } = parseHttpArguments();
    
    console.error('Starting HeyReach MCP HTTP Server...');
    console.error(`Mode: HTTP Streaming Transport`);
    console.error(`Port: ${port}`);
    console.error(`API Key Authentication: URL-based (/mcp/{API_KEY})`);
    
    await startHttpServer(port);
  } catch (error) {
    console.error('Failed to start HeyReach MCP HTTP Server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the server
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

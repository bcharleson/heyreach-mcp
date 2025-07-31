#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { HeyReachMcpServer } from './server.js';
import { HeyReachStdioServer } from './stdio-server.js';
import { startHttpServer } from './http-server.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Handle version flag
 */
function handleVersionFlag() {
  const args = process.argv.slice(2);
  
  if (args.includes('--version') || args.includes('-v')) {
    try {
      // Read package.json from the project root (one level up from dist)
      const packageJsonPath = join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      console.log(packageJson.version);
      process.exit(0);
    } catch (error) {
      console.error('Error reading version information');
      process.exit(1);
    }
  }
}

/**
 * Parse command line arguments
 */
function parseArguments(): {
  apiKey?: string;
  baseUrl?: string;
  mode: 'stdio' | 'http';
  port?: number;
} {
  const args = process.argv.slice(2);
  let apiKey = '';
  let baseUrl = '';
  let mode: 'stdio' | 'http' = 'stdio';
  let port = 3000;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--api-key' && i + 1 < args.length) {
      apiKey = args[i + 1];
      i++; // Skip next argument as it's the value
    } else if (arg === '--base-url' && i + 1 < args.length) {
      baseUrl = args[i + 1];
      i++; // Skip next argument as it's the value
    } else if (arg === '--port' && i + 1 < args.length) {
      port = parseInt(args[i + 1], 10);
      i++; // Skip next argument as it's the value
    } else if (arg.startsWith('--api-key=')) {
      apiKey = arg.split('=')[1];
    } else if (arg.startsWith('--base-url=')) {
      baseUrl = arg.split('=')[1];
    } else if (arg.startsWith('--port=')) {
      port = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--http' || arg === '--http-server') {
      mode = 'http';
    } else if (arg === '--stdio') {
      mode = 'stdio';
    }
  }

  // For stdio mode, API key is required
  if (mode === 'stdio' && !apiKey) {
    console.error('Error: API key is required for stdio mode. Use --api-key=YOUR_API_KEY');
    console.error('Usage:');
    console.error('  Stdio mode:  heyreach-mcp-server --api-key=YOUR_API_KEY [--base-url=CUSTOM_BASE_URL]');
    console.error('  HTTP mode:   heyreach-mcp-server --http [--port=3000]');
    process.exit(1);
  }

  return {
    apiKey: apiKey || undefined,
    baseUrl: baseUrl || undefined,
    mode,
    port
  };
}

/**
 * Main function to start the MCP server
 */
async function main() {
  try {
    // Handle version flag first, before any other processing
    handleVersionFlag();

    // Parse command line arguments
    const { apiKey, baseUrl, mode, port } = parseArguments();

    if (mode === 'http') {
      // Start HTTP streaming server
      console.error('Starting HeyReach MCP HTTP Server...');
      await startHttpServer(port);
    } else {
      // Start stdio server (STDIO-optimized version)
      if (!apiKey) {
        console.error('Error: API key is required for stdio mode');
        process.exit(1);
      }

      // Create and configure the HeyReach STDIO server (uses simple HTTP client)
      const heyReachStdioServer = new HeyReachStdioServer({
        apiKey,
        baseURL: baseUrl,
        timeout: 30000
      });

      // Start the STDIO server
      await heyReachStdioServer.start();

      // Log successful startup (to stderr so it doesn't interfere with MCP communication)
      console.error('HeyReach MCP Server started successfully (stdio mode - optimized)');
      console.error(`API Key: ${apiKey.substring(0, 8)}...`);
      if (baseUrl) {
        console.error(`Base URL: ${baseUrl}`);
      }
    }

  } catch (error) {
    console.error('Failed to start HeyReach MCP Server:', error);
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

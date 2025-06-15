#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { HeyReachMcpServer } from './server.js';

/**
 * Parse command line arguments to extract API key
 */
function parseArguments(): { apiKey: string; baseUrl?: string } {
  const args = process.argv.slice(2);
  let apiKey = '';
  let baseUrl = '';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--api-key' && i + 1 < args.length) {
      apiKey = args[i + 1];
      i++; // Skip next argument as it's the value
    } else if (arg === '--base-url' && i + 1 < args.length) {
      baseUrl = args[i + 1];
      i++; // Skip next argument as it's the value
    } else if (arg.startsWith('--api-key=')) {
      apiKey = arg.substring('--api-key='.length);
    } else if (arg.startsWith('--base-url=')) {
      baseUrl = arg.substring('--base-url='.length);
    }
  }

  if (!apiKey) {
    console.error('Error: API key is required. Use --api-key=YOUR_API_KEY');
    console.error('Usage: heyreach-mcp-server --api-key=YOUR_API_KEY [--base-url=CUSTOM_BASE_URL]');
    process.exit(1);
  }

  return { 
    apiKey, 
    baseUrl: baseUrl || undefined 
  };
}

/**
 * Main function to start the MCP server
 */
async function main() {
  try {
    // Parse command line arguments
    const { apiKey, baseUrl } = parseArguments();

    // Create and configure the HeyReach MCP server
    const heyReachServer = new HeyReachMcpServer({
      apiKey,
      baseUrl
    });

    // Get the MCP server instance
    const server = heyReachServer.getServer();

    // Create stdio transport
    const transport = new StdioServerTransport();

    // Connect the server to the transport
    await server.connect(transport);

    // Log successful startup (to stderr so it doesn't interfere with MCP communication)
    console.error('HeyReach MCP Server started successfully');
    console.error(`API Key: ${apiKey.substring(0, 8)}...`);
    if (baseUrl) {
      console.error(`Base URL: ${baseUrl}`);
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

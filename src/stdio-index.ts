#!/usr/bin/env node

/**
 * HeyReach MCP Server - STDIO Transport (Isolated)
 * Entry point for STDIO transport using isolated HTTP client
 */

import { HeyReachStdioServer } from './stdio-server.js';

function parseArgs() {
  const args = process.argv.slice(2);
  let apiKey = process.env.HEYREACH_API_KEY;
  let baseURL = process.env.HEYREACH_BASE_URL;
  let showVersion = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--api-key' && i + 1 < args.length) {
      apiKey = args[i + 1];
      i++;
    } else if (arg.startsWith('--api-key=')) {
      apiKey = arg.split('=')[1];
    } else if (arg === '--base-url' && i + 1 < args.length) {
      baseURL = args[i + 1];
      i++;
    } else if (arg.startsWith('--base-url=')) {
      baseURL = arg.split('=')[1];
    } else if (arg === '--version' || arg === '-v') {
      showVersion = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
HeyReach MCP Server - STDIO Transport (Isolated)

Usage: heyreach-mcp-stdio [options]

Options:
  --api-key <key>     HeyReach API key (or set HEYREACH_API_KEY env var)
  --base-url <url>    HeyReach API base URL (optional)
  --version, -v       Show version number
  --help, -h          Show this help message

Environment Variables:
  HEYREACH_API_KEY    Your HeyReach API key
  HEYREACH_BASE_URL   HeyReach API base URL (optional)

Example:
  heyreach-mcp-stdio --api-key your-api-key-here
`);
      process.exit(0);
    }
  }

  return { apiKey, baseURL, showVersion };
}

async function main() {
  const { apiKey, baseURL, showVersion } = parseArgs();

  if (showVersion) {
    console.log('2.0.6');
    process.exit(0);
  }

  if (!apiKey) {
    console.error('Error: HeyReach API key is required');
    console.error('Provide it via --api-key argument or HEYREACH_API_KEY environment variable');
    process.exit(1);
  }

  console.error('HeyReach MCP Server (STDIO Isolated) starting...');
  console.error(`API Key: ${apiKey.substring(0, 8)}...`);
  if (baseURL) {
    console.error(`Base URL: ${baseURL}`);
  }

  try {
    const server = new HeyReachStdioServer({
      apiKey,
      baseURL,
      timeout: 30000
    });

    await server.start();

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.error('Received SIGINT, shutting down gracefully...');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.error('Received SIGTERM, shutting down gracefully...');
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start HeyReach MCP Server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

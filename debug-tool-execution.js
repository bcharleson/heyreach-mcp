#!/usr/bin/env node

/**
 * Debug the tool execution context
 */

import { HeyReachMcpServer } from './dist/server.js';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

async function debugToolExecution() {
  console.log('🔍 Debugging Tool Execution Context...\n');

  try {
    // Create MCP server
    const config = { apiKey: API_KEY };
    const mcpServer = new HeyReachMcpServer(config);
    const server = mcpServer.getServer();

    console.log('1️⃣ MCP Server created successfully');

    // List available tools
    const tools = server.listTools();
    console.log('2️⃣ Available tools:', tools.map(t => t.name));

    // Find the check-api-key tool
    const checkApiKeyTool = tools.find(t => t.name === 'check-api-key');
    if (!checkApiKeyTool) {
      console.log('❌ check-api-key tool not found');
      return;
    }

    console.log('3️⃣ Found check-api-key tool');

    // Try to call the tool directly using the server's callTool method
    console.log('4️⃣ Calling tool directly...');
    try {
      const result = await server.callTool('check-api-key', {});
      console.log('✅ Direct tool call result:', result);
    } catch (error) {
      console.log('❌ Direct tool call error:', error.message);
      console.log('Error details:', error);
    }

    // Try to access the tool handler directly
    console.log('5️⃣ Testing tool handler directly...');
    try {
      // This is a hack to access the internal tool handlers
      const toolHandlers = server._toolHandlers || server.toolHandlers;
      if (toolHandlers && toolHandlers['check-api-key']) {
        console.log('Found tool handler');
        const handler = toolHandlers['check-api-key'];
        const result = await handler({});
        console.log('✅ Direct handler result:', result);
      } else {
        console.log('❌ Could not access tool handlers');
      }
    } catch (error) {
      console.log('❌ Direct handler error:', error.message);
    }

    // Test the client directly from the server instance
    console.log('6️⃣ Testing client from server instance...');
    try {
      const client = mcpServer.heyReachClient || mcpServer['heyReachClient'];
      if (client) {
        const result = await client.checkApiKey();
        console.log('✅ Server client result:', result);
      } else {
        console.log('❌ Could not access server client');
      }
    } catch (error) {
      console.log('❌ Server client error:', error.message);
    }

  } catch (error) {
    console.log('❌ Setup error:', error.message);
    console.log('Error stack:', error.stack);
  }
}

debugToolExecution().catch(console.error);

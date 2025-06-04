#!/usr/bin/env node

/**
 * Test the MCP server directly
 */

import { HeyReachMcpServer } from './dist/server.js';

async function testMcpServer() {
  console.log('🧪 Testing MCP Server Directly...\n');

  // Create the MCP server
  const mcpServer = new HeyReachMcpServer({
    apiKey: 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M='
  });

  const server = mcpServer.getServer();

  // Test the tools directly
  console.log('1️⃣ Testing check-api-key tool...');
  try {
    // Get the tool handler
    const tools = server.listTools();
    console.log('Available tools:', tools.map(t => t.name));
    
    // Find the check-api-key tool
    const checkApiKeyTool = tools.find(t => t.name === 'check-api-key');
    if (checkApiKeyTool) {
      console.log('✅ Found check-api-key tool');
      
      // Call the tool directly (this is a bit hacky but for testing)
      const result = await server.callTool('check-api-key', {});
      console.log('✅ API Key Result:', result);
    } else {
      console.log('❌ check-api-key tool not found');
    }
  } catch (error) {
    console.log('❌ API Key Error:', error.message);
  }

  console.log('\n2️⃣ Testing get-all-campaigns tool...');
  try {
    const result = await server.callTool('get-all-campaigns', {});
    console.log('✅ Campaigns Result:', result);
  } catch (error) {
    console.log('❌ Campaigns Error:', error.message);
  }
}

testMcpServer().catch(console.error);

#!/usr/bin/env node

/**
 * Debug the exact MCP tool execution to find the authentication issue
 */

import { HeyReachMcpServer } from './dist/server.js';

async function debugMcpTool() {
  console.log('🔍 Debugging MCP Tool Execution...\n');

  const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

  // Create the MCP server exactly as it would be created
  console.log('📋 Creating MCP server...');
  const mcpServer = new HeyReachMcpServer({ apiKey: API_KEY });
  console.log('✅ MCP server created');

  // Get the underlying MCP server instance
  const server = mcpServer.getServer();
  console.log('✅ Got MCP server instance');

  // Test the HeyReach client directly first
  console.log('\n📋 Testing HeyReach client directly...');
  try {
    const client = mcpServer.heyReachClient;
    console.log('✅ Got HeyReach client from MCP server');
    
    const result = await client.checkApiKey();
    console.log('✅ Direct client call result:', result);
  } catch (error) {
    console.log('❌ Direct client call failed:', error.message);
    console.log('   Stack:', error.stack);
  }

  // Now test the MCP tool
  console.log('\n📋 Testing MCP tool execution...');
  try {
    console.log('Calling check-api-key tool...');
    const toolResult = await server.callTool('check-api-key', {});
    console.log('✅ MCP tool result:', JSON.stringify(toolResult, null, 2));
  } catch (error) {
    console.log('❌ MCP tool failed:', error.message);
    console.log('   Error type:', error.constructor.name);
    console.log('   Error code:', error.code);
    console.log('   Stack:', error.stack);
  }

  // Let's also test the tool handler directly
  console.log('\n📋 Testing tool handler directly...');
  try {
    // Get the tool list to see what's available
    const tools = server.listTools();
    console.log('Available tools:', tools.map(t => t.name));
    
    const checkApiKeyTool = tools.find(t => t.name === 'check-api-key');
    if (checkApiKeyTool) {
      console.log('✅ Found check-api-key tool');
      console.log('Tool schema:', JSON.stringify(checkApiKeyTool.inputSchema, null, 2));
    } else {
      console.log('❌ check-api-key tool not found');
    }
  } catch (error) {
    console.log('❌ Tool listing failed:', error.message);
  }

  console.log('\n🎯 Summary:');
  console.log('This test will help identify where exactly the authentication is failing');
  console.log('- If direct client works but MCP tool fails, the issue is in the tool wrapper');
  console.log('- If both fail, the issue is in the client configuration');
}

debugMcpTool().catch(console.error);

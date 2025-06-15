#!/usr/bin/env node

/**
 * Detailed MCP Server Debug
 * Step through the exact execution path to find where authentication fails
 */

import { HeyReachMcpServer } from './dist/server.js';
import { HeyReachClient } from './dist/heyreach-client.js';

async function debugMcpDetailed() {
  console.log('🔍 Detailed MCP Server Debug\n');

  const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

  // Test 1: Create HeyReachClient directly and test
  console.log('📋 TEST 1: Direct HeyReachClient Test');
  try {
    const client = new HeyReachClient({
      apiKey: API_KEY,
      baseUrl: 'https://api.heyreach.io/api/public'
    });
    
    console.log('   Created HeyReachClient successfully');
    
    const result = await client.checkApiKey();
    console.log('   ✅ Direct client checkApiKey works');
    console.log('   Result:', result);
  } catch (error) {
    console.log('   ❌ Direct client checkApiKey failed');
    console.log('   Error:', error.message);
    console.log('   Stack:', error.stack);
  }

  // Test 2: Create MCP Server and test the client inside it
  console.log('\n📋 TEST 2: MCP Server Internal Client Test');
  try {
    const mcpServer = new HeyReachMcpServer({
      apiKey: API_KEY,
      baseUrl: 'https://api.heyreach.io/api/public'
    });
    
    console.log('   Created MCP Server successfully');
    
    // Access the internal client (we need to make it accessible for debugging)
    // This is a hack for debugging - we'll access the private property
    const internalClient = mcpServer.heyReachClient;
    
    if (internalClient) {
      console.log('   Accessing internal HeyReachClient...');
      const result = await internalClient.checkApiKey();
      console.log('   ✅ MCP Server internal client works');
      console.log('   Result:', result);
    } else {
      console.log('   ❌ Could not access internal client');
    }
  } catch (error) {
    console.log('   ❌ MCP Server internal client failed');
    console.log('   Error:', error.message);
    console.log('   Stack:', error.stack);
  }

  // Test 3: Test the actual MCP tool handler
  console.log('\n📋 TEST 3: MCP Tool Handler Test');
  try {
    const mcpServer = new HeyReachMcpServer({
      apiKey: API_KEY,
      baseUrl: 'https://api.heyreach.io/api/public'
    });
    
    console.log('   Created MCP Server successfully');
    
    // Get the server instance
    const server = mcpServer.getServer();
    console.log('   Got server instance');
    
    // Try to manually call the tool handler
    // This is tricky because we need to access the internal tool handlers
    console.log('   MCP Server created, but cannot directly test tool handlers without full MCP protocol');
    
  } catch (error) {
    console.log('   ❌ MCP Tool Handler test failed');
    console.log('   Error:', error.message);
    console.log('   Stack:', error.stack);
  }

  // Test 4: Check if there's an issue with error handling
  console.log('\n📋 TEST 4: Error Handling Test');
  try {
    const client = new HeyReachClient({
      apiKey: 'INVALID_KEY',  // Use invalid key to trigger error
      baseUrl: 'https://api.heyreach.io/api/public'
    });
    
    console.log('   Created client with invalid key');
    
    const result = await client.checkApiKey();
    console.log('   ⚠️  Invalid key somehow worked:', result);
  } catch (error) {
    console.log('   ✅ Invalid key properly failed');
    console.log('   Error type:', error.constructor.name);
    console.log('   Error message:', error.message);
    console.log('   Has response:', !!error.response);
    if (error.response) {
      console.log('   Response status:', error.response.status);
      console.log('   Response data:', error.response.data);
    }
  }
}

debugMcpDetailed().catch(console.error);

#!/usr/bin/env node

/**
 * Test MCP Server Instantiation
 * Replicate the exact way the MCP server creates HeyReachClient
 */

import { HeyReachMcpServer } from './dist/server.js';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

async function testMcpServerInstantiation() {
  console.log('🔍 Testing MCP Server Instantiation\n');

  try {
    // Create HeyReachMcpServer instance (exactly like in index.ts)
    console.log('1. Creating HeyReachMcpServer instance...');
    const heyReachServer = new HeyReachMcpServer({
      apiKey: API_KEY
    });
    console.log('✅ HeyReachMcpServer instance created');

    // Get the internal HeyReachClient
    console.log('\n2. Accessing internal HeyReachClient...');
    // We need to access the private heyReachClient property
    // Let's test the tools instead
    
    const server = heyReachServer.getServer();
    console.log('✅ MCP Server instance obtained');

    // Test by calling the tool directly
    console.log('\n3. Testing check-api-key tool...');
    try {
      // We can't directly call the tool, but we can test the server setup
      const tools = server.listTools();
      console.log('📊 Available tools:', tools.map(t => t.name));
      
      if (tools.find(t => t.name === 'check-api-key')) {
        console.log('✅ check-api-key tool is registered');
      } else {
        console.log('❌ check-api-key tool is NOT registered');
      }
      
    } catch (error) {
      console.log('❌ Error testing tools:', error.message);
    }

  } catch (error) {
    console.error('❌ Error testing MCP server instantiation:', error);
  }
}

testMcpServerInstantiation().catch(console.error);

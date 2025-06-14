#!/usr/bin/env node

/**
 * Test MCP Server Directly
 * Test the server without error handling to see what's really happening
 */

import { HeyReachMcpServer } from './dist/server.js';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

async function testMcpServerDirect() {
  console.log('🔍 Testing MCP Server Directly\n');

  try {
    // Create server instance
    console.log('📋 Creating MCP server instance...');
    const server = new HeyReachMcpServer({ apiKey: API_KEY });
    console.log('✅ Server created successfully');

    // Test the HeyReach client directly
    console.log('\n📋 Testing HeyReach client directly...');
    const client = server.heyReachClient;
    
    try {
      const result = await client.checkApiKey();
      console.log('✅ HeyReach client checkApiKey works');
      console.log('   Success:', result.success);
      console.log('   Data:', result.data);
      console.log('   Message:', result.message);
    } catch (error) {
      console.log('❌ HeyReach client checkApiKey failed');
      console.log('   Error:', error.message);
      console.log('   Stack:', error.stack);
    }

    // Test getAllCampaigns directly
    console.log('\n📋 Testing getAllCampaigns directly...');
    try {
      const result = await client.getAllCampaigns(0, 5);
      console.log('✅ HeyReach client getAllCampaigns works');
      console.log('   Success:', result.success);
      console.log('   Data length:', result.data?.length || 0);
      console.log('   Message:', result.message);
    } catch (error) {
      console.log('❌ HeyReach client getAllCampaigns failed');
      console.log('   Error:', error.message);
      console.log('   Stack:', error.stack);
    }

    // Test the MCP server tools directly (bypassing MCP protocol)
    console.log('\n📋 Testing MCP server tools directly...');
    
    // Get the server instance
    const mcpServer = server.getServer();
    console.log('✅ Got MCP server instance');

    // Try to call tools directly if possible
    console.log('\n📋 Testing server initialization...');
    console.log('Server name:', mcpServer.name);
    console.log('Server version:', mcpServer.version);

  } catch (error) {
    console.log('❌ Server test failed');
    console.log('   Error:', error.message);
    console.log('   Stack:', error.stack);
  }
}

// Run the test
testMcpServerDirect().catch(console.error);

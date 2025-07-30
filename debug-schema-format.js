#!/usr/bin/env node

/**
 * Debug script to check the actual schema format being returned by the MCP server
 */

import { HeyReachMcpServer } from './dist/server.js';

async function debugSchemaFormat() {
  console.log('🔍 Debugging MCP Server Schema Format...\n');

  try {
    // Create MCP server instance
    const config = { apiKey: 'test-key' };
    const mcpServer = new HeyReachMcpServer(config);
    const server = mcpServer.getServer();

    console.log('✅ MCP Server created successfully\n');

    // Get the tools list
    const tools = server.listTools();
    console.log(`📋 Found ${tools.length} tools\n`);

    // Check the first few tools
    const toolsToCheck = ['check-api-key', 'get-all-campaigns', 'get-campaign-details'];
    
    toolsToCheck.forEach(toolName => {
      const tool = tools.find(t => t.name === toolName);
      if (tool) {
        console.log(`🔧 Tool: ${tool.name}`);
        console.log(`   Description: ${tool.description || 'No description'}`);
        console.log(`   Input Schema Type: ${typeof tool.inputSchema}`);
        console.log(`   Input Schema:`, JSON.stringify(tool.inputSchema, null, 2));
        console.log('');
      } else {
        console.log(`❌ Tool ${toolName} not found`);
      }
    });

    // Check if the schema has the problematic ZodNever structure
    const checkApiKeyTool = tools.find(t => t.name === 'check-api-key');
    if (checkApiKeyTool && checkApiKeyTool.inputSchema) {
      const schema = checkApiKeyTool.inputSchema;
      console.log('🔍 Detailed check-api-key schema analysis:');
      console.log(`   Has _def: ${!!schema._def}`);
      console.log(`   Has typeName: ${schema._def?.typeName || 'none'}`);
      console.log(`   Has catchall: ${!!schema._def?.catchall}`);
      console.log(`   Catchall typeName: ${schema._def?.catchall?._def?.typeName || 'none'}`);
      
      if (schema._def?.catchall?._def?.typeName === 'ZodNever') {
        console.log('   ⚠️  FOUND ZODNEVER ISSUE - This is the n8n compatibility problem!');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugSchemaFormat().catch(console.error);

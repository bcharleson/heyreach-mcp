#!/usr/bin/env node

/**
 * Test script to verify JSON Schema conversion is working
 */

import { spawn } from 'child_process';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

async function testJsonSchemaConversion() {
  console.log('🧪 Testing JSON Schema conversion for n8n compatibility...\n');

  const serverProcess = spawn('npx', [
    'heyreach-mcp-server',
    `--api-key=${API_KEY}`
  ], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let serverReady = false;
  let toolsResponse = null;

  serverProcess.stderr.on('data', (data) => {
    const text = data.toString();
    if (text.includes('HeyReach MCP Server started successfully')) {
      console.log('✅ Server started successfully\n');
      serverReady = true;
      
      // Initialize the server
      const initMessage = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          clientInfo: { name: 'test-client', version: '1.0.0' }
        }
      }) + '\n';

      serverProcess.stdin.write(initMessage);
      
      setTimeout(() => {
        // List tools to check schema format
        const listToolsMessage = JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/list',
          params: {}
        }) + '\n';

        console.log('📤 Requesting tools list...');
        serverProcess.stdin.write(listToolsMessage);
      }, 1000);
    }
  });

  serverProcess.stdout.on('data', (data) => {
    const text = data.toString().trim();
    if (!text) return;

    try {
      const response = JSON.parse(text);
      
      if (response.id === 2 && response.result && response.result.tools) {
        toolsResponse = response.result.tools;
        console.log('✅ Received tools list\n');
        
        // Check the first few tools for proper JSON Schema format
        const checkApiKeyTool = toolsResponse.find(t => t.name === 'check-api-key');
        const getAllCampaignsTool = toolsResponse.find(t => t.name === 'get-all-campaigns');
        
        console.log('🔍 Analyzing tool schemas...\n');
        
        if (checkApiKeyTool) {
          console.log('📋 check-api-key tool:');
          console.log('   Description:', checkApiKeyTool.description);
          console.log('   Schema type:', typeof checkApiKeyTool.inputSchema);
          console.log('   Schema format:', checkApiKeyTool.inputSchema?.type || 'unknown');
          console.log('   Has properties:', !!checkApiKeyTool.inputSchema?.properties);
          console.log('');
        }
        
        if (getAllCampaignsTool) {
          console.log('📋 get-all-campaigns tool:');
          console.log('   Description:', getAllCampaignsTool.description);
          console.log('   Schema type:', typeof getAllCampaignsTool.inputSchema);
          console.log('   Schema format:', getAllCampaignsTool.inputSchema?.type || 'unknown');
          console.log('   Has properties:', !!getAllCampaignsTool.inputSchema?.properties);
          if (getAllCampaignsTool.inputSchema?.properties) {
            console.log('   Properties:', Object.keys(getAllCampaignsTool.inputSchema.properties));
          }
          console.log('');
        }
        
        // Test tool execution with check-api-key
        console.log('🧪 Testing check-api-key tool execution...');
        const toolCallMessage = JSON.stringify({
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'check-api-key',
            arguments: {}
          }
        }) + '\n';

        serverProcess.stdin.write(toolCallMessage);
      }
      
      if (response.id === 3) {
        console.log('✅ Tool execution result:');
        if (response.result) {
          console.log('   Success:', !!response.result.content);
          console.log('   Content type:', response.result.content?.[0]?.type);
        } else if (response.error) {
          console.log('   Error:', response.error.message);
        }
        
        // Clean up
        serverProcess.kill();
        process.exit(0);
      }
      
    } catch (error) {
      // Ignore JSON parse errors for partial responses
    }
  });

  // Timeout after 10 seconds
  setTimeout(() => {
    console.log('⏰ Test timeout');
    serverProcess.kill();
    process.exit(1);
  }, 10000);
}

testJsonSchemaConversion().catch(console.error);

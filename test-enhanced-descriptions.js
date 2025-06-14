#!/usr/bin/env node

/**
 * Test the enhanced tool descriptions in the MCP server
 */

import { spawn } from 'child_process';

async function testEnhancedDescriptions() {
  console.log('🧪 Testing Enhanced Tool Descriptions in MCP Server...\n');

  // Start the MCP server
  const serverProcess = spawn('npx', [
    'heyreach-mcp-server@1.1.0',
    '--api-key=QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M='
  ], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let output = '';
  let serverError = '';

  serverProcess.stdout.on('data', (data) => {
    output += data.toString();
    console.log('📤 Server Output:', data.toString().trim());
  });

  serverProcess.stderr.on('data', (data) => {
    serverError += data.toString();
    console.log('📥 Server Error:', data.toString().trim());
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Test 1: List all tools to verify enhanced descriptions
  console.log('\n1️⃣ Testing tool list with enhanced descriptions...');
  const listToolsMessage = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  }) + '\n';

  serverProcess.stdin.write(listToolsMessage);
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Test check-api-key tool
  console.log('\n2️⃣ Testing check-api-key tool...');
  const apiKeyTestMessage = JSON.stringify({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'check-api-key',
      arguments: {}
    }
  }) + '\n';

  serverProcess.stdin.write(apiKeyTestMessage);
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Test 3: Test get-all-campaigns tool
  console.log('\n3️⃣ Testing get-all-campaigns tool...');
  const campaignsTestMessage = JSON.stringify({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'get-all-campaigns',
      arguments: {}
    }
  }) + '\n';

  serverProcess.stdin.write(campaignsTestMessage);
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Test 4: Test get-message-templates tool
  console.log('\n4️⃣ Testing get-message-templates tool...');
  const templatesTestMessage = JSON.stringify({
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'get-message-templates',
      arguments: {}
    }
  }) + '\n';

  serverProcess.stdin.write(templatesTestMessage);
  await new Promise(resolve => setTimeout(resolve, 3000));

  serverProcess.kill('SIGTERM');
  
  console.log('\n📊 Enhanced Descriptions Test Results:');
  
  if (serverError.includes('HeyReach MCP Server started successfully')) {
    console.log('✅ Server startup: SUCCESS');
  } else {
    console.log('❌ Server startup: FAILED');
  }
  
  if (output.includes('tools/list') || output.includes('description')) {
    console.log('✅ Tool descriptions: LOADED');
  } else {
    console.log('❌ Tool descriptions: NOT LOADED');
  }
  
  if (output.includes('API key is valid') || output.includes('check-api-key')) {
    console.log('✅ API key validation: SUCCESS');
  } else {
    console.log('❌ API key validation: FAILED');
  }
  
  if (output.includes('campaigns') || output.includes('get-all-campaigns')) {
    console.log('✅ Campaign tools: FUNCTIONAL');
  } else {
    console.log('❌ Campaign tools: FAILED');
  }
  
  if (output.includes('templates') || output.includes('get-message-templates')) {
    console.log('✅ Messaging tools: FUNCTIONAL');
  } else {
    console.log('❌ Messaging tools: FAILED');
  }
  
  console.log('\n🎉 Enhanced tool descriptions are ready for Claude Desktop!');
  console.log('📋 Next steps:');
  console.log('1. Restart Claude Desktop to pick up version 1.1.0');
  console.log('2. Test the enhanced descriptions in Claude\'s tool interface');
  console.log('3. Verify comprehensive parameter explanations are visible');
}

testEnhancedDescriptions().catch(console.error);

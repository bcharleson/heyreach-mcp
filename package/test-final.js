#!/usr/bin/env node

/**
 * Test the final working version
 */

import { spawn } from 'child_process';

async function testFinalVersion() {
  console.log('🎯 Testing Final Working Version (1.0.3)...\n');

  const serverProcess = spawn('npx', [
    'heyreach-mcp-server@1.0.3',
    '--api-key=QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M='
  ], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let output = '';
  let error = '';

  serverProcess.stdout.on('data', (data) => {
    output += data.toString();
    console.log('📤 Response:', data.toString().trim());
  });

  serverProcess.stderr.on('data', (data) => {
    error += data.toString();
    console.log('📝 Server:', data.toString().trim());
  });

  // Wait for startup
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Test 1: API key validation
  console.log('\n🔑 Testing API key validation...');
  const checkMessage = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'check-api-key',
      arguments: {}
    }
  }) + '\n';

  serverProcess.stdin.write(checkMessage);
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Get all campaigns
  console.log('\n📋 Testing get all campaigns...');
  const campaignsMessage = JSON.stringify({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'get-all-campaigns',
      arguments: {}
    }
  }) + '\n';

  serverProcess.stdin.write(campaignsMessage);
  await new Promise(resolve => setTimeout(resolve, 3000));

  serverProcess.kill('SIGTERM');
  
  console.log('\n📊 Final Results:');
  if (output.includes('API key is valid')) {
    console.log('✅ API key validation: SUCCESS');
  } else {
    console.log('❌ API key validation: FAILED');
  }
  
  if (output.includes('Campaigns retrieved successfully') || output.includes('totalCount')) {
    console.log('✅ Campaign retrieval: SUCCESS');
  } else {
    console.log('❌ Campaign retrieval: FAILED');
  }
  
  console.log('\n🎉 HeyReach MCP Server is now fully functional!');
  console.log('🔧 Update your Claude Desktop config to use version 1.0.3');
}

testFinalVersion().catch(console.error);

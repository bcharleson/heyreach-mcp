#!/usr/bin/env node

/**
 * Test script to verify Bearer token is automatically added
 */

import { spawn } from 'child_process';

async function testBearerToken() {
  console.log('🧪 Testing Bearer Token Auto-Addition...\n');

  const apiKey = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';
  
  console.log('Starting MCP server with updated Bearer token handling...');
  
  const serverProcess = spawn('npx', [
    'heyreach-mcp-server@1.0.1',
    `--api-key=${apiKey}`
  ], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let serverOutput = '';
  let serverError = '';

  serverProcess.stdout.on('data', (data) => {
    serverOutput += data.toString();
  });

  serverProcess.stderr.on('data', (data) => {
    serverError += data.toString();
  });

  // Give the server a moment to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Test API key validation with Bearer token
  console.log('Testing API key validation with Bearer token...');
  const apiKeyTestMessage = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'check-api-key',
      arguments: {}
    }
  }) + '\n';

  serverProcess.stdin.write(apiKeyTestMessage);

  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Check results
  console.log('\n📊 Test Results:');
  
  if (serverError.includes('HeyReach MCP Server started successfully')) {
    console.log('✅ Server started successfully');
  } else {
    console.log('❌ Server failed to start');
  }

  if (serverOutput.includes('valid')) {
    console.log('✅ API key validation successful');
  } else if (serverOutput.includes('401')) {
    console.log('⚠️  Still getting 401 - may need different API endpoint or format');
  } else {
    console.log('⚠️  No clear API response detected');
  }

  // Clean up
  serverProcess.kill('SIGTERM');

  console.log('\n📝 Server Response:');
  console.log('STDOUT:', serverOutput);
  console.log('STDERR:', serverError);
}

testBearerToken().catch(console.error);

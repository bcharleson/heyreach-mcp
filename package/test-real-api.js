#!/usr/bin/env node

/**
 * Test script to verify the HeyReach MCP server works with real API key
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testRealAPI() {
  console.log('🧪 Testing HeyReach MCP Server with Real API Key...\n');

  const apiKey = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';
  
  console.log('Starting MCP server with real API key...');
  
  const serverProcess = spawn('npx', [
    'heyreach-mcp-server',
    `--api-key=${apiKey}`
  ], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let serverOutput = '';
  let serverError = '';

  serverProcess.stdout.on('data', (data) => {
    serverOutput += data.toString();
    console.log('STDOUT:', data.toString());
  });

  serverProcess.stderr.on('data', (data) => {
    serverError += data.toString();
    console.log('STDERR:', data.toString());
  });

  // Give the server a moment to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Send MCP initialize message
  console.log('\nSending MCP initialize message...');
  const initMessage = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  }) + '\n';

  serverProcess.stdin.write(initMessage);

  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Send tools/list request
  console.log('\nSending tools/list request...');
  const toolsMessage = JSON.stringify({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list'
  }) + '\n';

  serverProcess.stdin.write(toolsMessage);

  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test API key validation
  console.log('\nTesting API key validation...');
  const apiKeyTestMessage = JSON.stringify({
    jsonrpc: '2.0',
    id: 3,
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

  if (serverOutput.includes('jsonrpc')) {
    console.log('✅ MCP protocol communication working');
  } else {
    console.log('⚠️  No MCP responses detected');
  }

  if (serverOutput.includes('tools')) {
    console.log('✅ Tools are available');
  } else {
    console.log('⚠️  Tools list not detected');
  }

  // Clean up
  serverProcess.kill('SIGTERM');

  console.log('\n🎉 Real API test completed!');
  console.log('\nServer Output:');
  console.log(serverOutput);
  console.log('\nServer Errors:');
  console.log(serverError);
}

testRealAPI().catch(console.error);

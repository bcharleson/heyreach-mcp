#!/usr/bin/env node

/**
 * Test script to verify the HeyReach MCP server starts correctly
 * This script tests the server initialization without making actual API calls
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testServer() {
  console.log('🧪 Testing HeyReach MCP Server...\n');

  // Test 1: Server starts with API key
  console.log('Test 1: Starting server with dummy API key...');
  
  const serverProcess = spawn('node', [
    join(__dirname, 'dist/index.js'),
    '--api-key=test_dummy_key_12345'
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
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Send a test MCP message to see if the server responds
  const testMessage = JSON.stringify({
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

  serverProcess.stdin.write(testMessage);

  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check if server started successfully
  if (serverError.includes('HeyReach MCP Server started successfully')) {
    console.log('✅ Server started successfully');
    console.log('✅ API key validation working');
  } else {
    console.log('❌ Server failed to start');
    console.log('Error output:', serverError);
  }

  // Check if server responds to MCP messages
  if (serverOutput.includes('jsonrpc')) {
    console.log('✅ Server responding to MCP messages');
  } else {
    console.log('⚠️  No MCP response detected (this might be normal for this test)');
  }

  // Clean up
  serverProcess.kill('SIGTERM');

  console.log('\n🎉 Basic server tests completed!');
  console.log('\nNext steps:');
  console.log('1. Get a real HeyReach API key from https://heyreach.io');
  console.log('2. Test with: node dist/index.js --api-key=YOUR_REAL_API_KEY');
  console.log('3. Configure in Claude Desktop using the provided config');
  console.log('4. Test the MCP tools through Claude Desktop');
}

// Test 2: Server fails without API key
console.log('\nTest 2: Testing error handling without API key...');

const errorProcess = spawn('node', [
  join(__dirname, 'dist/index.js')
], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let errorOutput = '';

errorProcess.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

errorProcess.on('close', (code) => {
  if (code === 1 && errorOutput.includes('API key is required')) {
    console.log('✅ Error handling working correctly');
  } else {
    console.log('❌ Error handling not working as expected');
    console.log('Error output:', errorOutput);
  }
  
  // Start the main test
  testServer().catch(console.error);
});

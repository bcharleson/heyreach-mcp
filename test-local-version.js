#!/usr/bin/env node

/**
 * Test the local development version of the MCP server
 */

import { spawn } from 'child_process';

async function testLocalMcpServer() {
  console.log('🧪 Testing Local MCP Server (v1.1.8)...\n');

  // Start the local MCP server
  const serverProcess = spawn('node', [
    'dist/index.js',
    '--api-key=QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M='
  ], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: process.cwd()
  });

  let output = '';
  
  serverProcess.stdout.on('data', (data) => {
    output += data.toString();
    console.log('📤 Server Output:', data.toString().trim());
  });

  serverProcess.stderr.on('data', (data) => {
    output += data.toString();
    console.log('📝 Server Log:', data.toString().trim());
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test API key validation
  console.log('\n🔑 Testing API key validation...');
  const message = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'check-api-key',
      arguments: {}
    }
  }) + '\n';

  serverProcess.stdin.write(message);
  
  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Test get-all-campaigns
  console.log('\n📋 Testing get-all-campaigns...');
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
  
  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 3000));

  serverProcess.kill('SIGTERM');
  
  console.log('\n📊 Results:');
  if (output.includes('"success":true') || output.includes('valid')) {
    console.log('✅ Local version (1.1.8) is working correctly!');
    console.log('✅ Authentication is functioning properly');
  } else if (output.includes('401') || output.includes('Invalid API key')) {
    console.log('❌ Still getting authentication errors');
  } else {
    console.log('⚠️  Unclear response - check output above');
  }

  console.log('\n💡 Next Steps:');
  console.log('1. Publish version 1.1.8 to npm');
  console.log('2. Update Claude config to use latest version');
  console.log('3. Or use local path in Claude config for development');
}

testLocalMcpServer().catch(console.error);

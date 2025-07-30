#!/usr/bin/env node

/**
 * Simple test to verify n8n fix - check tool descriptions and empty parameter execution
 */

import { spawn } from 'child_process';

async function testSimpleN8nFix() {
  console.log('🔧 Simple n8n Fix Test\n');

  const serverProcess = spawn('node', ['./dist/index.js', '--api-key=QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M='], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let output = '';
  let serverStarted = false;

  serverProcess.stdout.on('data', (data) => {
    output += data.toString();
    console.log('📤 OUT:', data.toString().trim());
  });

  serverProcess.stderr.on('data', (data) => {
    const text = data.toString();
    console.log('📥 ERR:', text.trim());
    if (text.includes('HeyReach MCP Server started successfully')) {
      serverStarted = true;
      console.log('✅ Server started - testing tools...\n');
      setTimeout(testTools, 2000);
    }
  });

  async function testTools() {
    // Initialize
    console.log('🔄 Initializing MCP connection...');
    const initMessage = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        clientInfo: { name: 'test', version: '1.0.0' }
      }
    }) + '\n';

    serverProcess.stdin.write(initMessage);
    await sleep(1000);

    // List tools to check descriptions
    console.log('📋 Listing tools...');
    const listMessage = JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    }) + '\n';

    serverProcess.stdin.write(listMessage);
    await sleep(1000);

    // Test check-api-key with empty params
    console.log('🔐 Testing check-api-key with empty parameters...');
    const checkMessage = JSON.stringify({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'check-api-key',
        arguments: {}
      }
    }) + '\n';

    serverProcess.stdin.write(checkMessage);
    await sleep(2000);

    // Analyze and cleanup
    setTimeout(() => {
      console.log('\n📊 Test Results:');
      
      if (output.includes('"description"') && output.includes('check-api-key')) {
        console.log('✅ Tool descriptions added successfully');
      } else {
        console.log('❌ Tool descriptions missing');
      }

      if (output.includes('"valid": true') || output.includes('"valid":true')) {
        console.log('✅ check-api-key executes with empty parameters');
        console.log('🎉 n8n fix should work!');
      } else {
        console.log('❌ check-api-key execution failed');
      }

      serverProcess.kill('SIGTERM');
    }, 1000);
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setTimeout(() => {
    if (!serverStarted) {
      console.log('⏰ Server startup timeout');
      serverProcess.kill('SIGTERM');
    }
  }, 10000);
}

testSimpleN8nFix().catch(console.error);

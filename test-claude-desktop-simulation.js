#!/usr/bin/env node

/**
 * Test that simulates exactly what Claude Desktop does
 * This will help us identify if the issue is with the published package vs local version
 */

import { spawn } from 'child_process';

async function testClaudeDesktopSimulation() {
  console.log('🔍 Testing Claude Desktop Simulation\n');

  // Test 1: Test with local built version (like our working tests)
  console.log('📋 TEST 1: Local Built Version');
  await testMcpServer('./dist/index.js', 'Local');

  // Test 2: Test with npx published version (like Claude Desktop config)
  console.log('\n📋 TEST 2: Published NPX Version');
  await testMcpServer('npx', 'Published');
}

async function testMcpServer(command, label) {
  return new Promise((resolve) => {
    console.log(`   Starting ${label} MCP server...`);
    
    const args = command === 'npx' ?
      ['heyreach-mcp-server@1.1.8', '--api-key=QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M='] :
      [command, '--api-key=QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M='];

    const serverProcess = spawn(command === 'npx' ? 'npx' : 'node', args, {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    serverProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Wait for startup
    setTimeout(() => {
      console.log(`   ${label} server startup output:`, errorOutput);
      
      // Test API key validation
      console.log(`   Testing ${label} check-api-key tool...`);
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
      setTimeout(() => {
        console.log(`   ${label} tool response:`, output);
        
        if (output.includes('"valid":true') || output.includes('"data":true')) {
          console.log(`   ✅ ${label} version works!`);
        } else if (output.includes('Invalid API key') || output.includes('401')) {
          console.log(`   ❌ ${label} version has auth issues`);
          console.log(`   Full response: ${output}`);
        } else {
          console.log(`   ⚠️  ${label} version unclear response`);
          console.log(`   Full response: ${output}`);
        }
        
        serverProcess.kill('SIGTERM');
        resolve();
      }, 3000);
    }, 3000);
  });
}

testClaudeDesktopSimulation().catch(console.error);

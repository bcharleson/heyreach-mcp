#!/usr/bin/env node

/**
 * Test key tools in HeyReach MCP Server v2.0.0
 */

import { spawn } from 'child_process';

async function testKeyTools() {
  console.log('🧪 Testing Key Tools in HeyReach MCP Server v2.0.0\n');

  return new Promise((resolve) => {
    const serverProcess = spawn('node', ['./dist/index.js', '--api-key=QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M='], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let testResults = [];

    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    serverProcess.stderr.on('data', (data) => {
      const text = data.toString();
      if (text.includes('HeyReach MCP Server started successfully')) {
        console.log('✅ Server started successfully\n');
        runTests();
      }
    });

    async function runTests() {
      // Initialize
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
      
      await sleep(1000);

      // Test 1: check-api-key (should work)
      console.log('🧪 Test 1: check-api-key');
      await testTool('check-api-key', {});

      // Test 2: get-linkedin-accounts (new tool)
      console.log('🧪 Test 2: get-linkedin-accounts');
      await testTool('get-linkedin-accounts', { limit: 5 });

      // Test 3: get-all-campaigns (should work)
      console.log('🧪 Test 3: get-all-campaigns');
      await testTool('get-all-campaigns', { limit: 3 });

      // Test 4: create-empty-list (should work)
      console.log('🧪 Test 4: create-empty-list');
      await testTool('create-empty-list', { name: 'Test List v2.0' });

      // Test 5: pause-campaign (new tool - will likely fail but should not be auth error)
      console.log('🧪 Test 5: pause-campaign');
      await testTool('pause-campaign', { campaignId: 1 });

      // Results
      setTimeout(() => {
        console.log('\n📊 Test Results:');
        const working = testResults.filter(r => r.success).length;
        const total = testResults.length;
        
        testResults.forEach(result => {
          const status = result.success ? '✅' : '❌';
          console.log(`${status} ${result.tool}: ${result.message}`);
        });
        
        console.log(`\n📈 Success rate: ${working}/${total} (${((working/total)*100).toFixed(1)}%)`);
        
        if (working >= 3) {
          console.log('🎉 Core functionality working!');
        }
        
        serverProcess.kill('SIGTERM');
        resolve();
      }, 8000);
    }

    async function testTool(toolName, args) {
      const message = JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        }
      }) + '\n';

      const beforeLength = output.length;
      serverProcess.stdin.write(message);
      
      await sleep(1500);
      
      const newOutput = output.substring(beforeLength);
      
      if (newOutput.includes('"valid": true') || newOutput.includes('retrieved successfully') || newOutput.includes('created successfully')) {
        testResults.push({ tool: toolName, success: true, message: 'Working correctly' });
        console.log(`   ✅ ${toolName} working`);
      } else if (newOutput.includes('Invalid API key')) {
        testResults.push({ tool: toolName, success: false, message: 'Authentication error' });
        console.log(`   ❌ ${toolName} auth error`);
      } else if (newOutput.includes('not found') || newOutput.includes('does not exist')) {
        testResults.push({ tool: toolName, success: true, message: 'Working (expected data error)' });
        console.log(`   ✅ ${toolName} working (expected data error)`);
      } else {
        testResults.push({ tool: toolName, success: false, message: 'Unknown error' });
        console.log(`   ❌ ${toolName} unknown error`);
      }
    }

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    setTimeout(() => {
      console.log('⏰ Timeout - killing server');
      serverProcess.kill('SIGTERM');
      resolve();
    }, 20000);
  });
}

testKeyTools().catch(console.error);

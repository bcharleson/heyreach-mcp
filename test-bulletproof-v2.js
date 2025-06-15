#!/usr/bin/env node

/**
 * Comprehensive test of HeyReach MCP Server v2.0.0 - Bulletproof Edition
 * Tests all existing working tools + new critical endpoints
 */

import { spawn } from 'child_process';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

const results = {
  working: [],
  failing: [],
  total: 0
};

async function testMCPTool(serverProcess, toolName, args = {}) {
  console.log(`\n🧪 Testing MCP tool: ${toolName}...`);
  
  const toolMessage = JSON.stringify({
    jsonrpc: '2.0',
    id: Date.now() + Math.random(),
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: args
    }
  }) + '\n';

  return new Promise((resolve) => {
    let responseReceived = false;
    let output = '';

    const responseHandler = (data) => {
      output += data.toString();
      
      // Look for JSON response
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.trim().startsWith('{"result"') || line.trim().startsWith('{"error"')) {
          try {
            const response = JSON.parse(line.trim());
            if (!responseReceived) {
              responseReceived = true;
              
              if (response.result?.isError || response.error) {
                console.log(`   ❌ FAILED: ${response.result?.content?.[0]?.text || response.error?.message || 'Unknown error'}`);
                results.failing.push(toolName);
              } else {
                console.log(`   ✅ SUCCESS: ${response.result?.content?.[0]?.text?.substring(0, 100) || 'Tool executed successfully'}...`);
                results.working.push(toolName);
              }
              results.total++;
              resolve();
            }
          } catch (e) {
            // Not valid JSON, continue
          }
        }
      }
    };

    serverProcess.stdout.on('data', responseHandler);
    
    // Send the tool request
    serverProcess.stdin.write(toolMessage);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if (!responseReceived) {
        console.log(`   ⏰ TIMEOUT: No response received`);
        results.failing.push(toolName);
        results.total++;
        resolve();
      }
    }, 10000);
  });
}

async function testBulletproofV2() {
  console.log('🚀 Testing HeyReach MCP Server v2.0.0 - Bulletproof Edition\n');

  return new Promise((resolve) => {
    console.log('📋 Starting MCP Server v2.0.0...');
    
    const serverProcess = spawn('node', ['./dist/index.js', `--api-key=${API_KEY}`], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let serverReady = false;

    serverProcess.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('HeyReach MCP Server started successfully')) {
        serverReady = true;
        console.log('✅ Server started successfully\n');
        runTests();
      }
    });

    async function runTests() {
      console.log('🔍 PHASE 1: Testing Existing Working Tools (Should all pass)');
      
      // Test existing working tools
      await testMCPTool(serverProcess, 'check-api-key', {});
      await testMCPTool(serverProcess, 'get-all-campaigns', { limit: 3 });
      await testMCPTool(serverProcess, 'get-active-campaigns', { limit: 3 });
      await testMCPTool(serverProcess, 'get-conversations', { limit: 3 });
      await testMCPTool(serverProcess, 'get-overall-stats', {});
      await testMCPTool(serverProcess, 'get-all-lists', { limit: 3 });
      await testMCPTool(serverProcess, 'create-empty-list', { name: 'Test List v2.0' });

      console.log('\n🆕 PHASE 2: Testing New Critical Tools');
      
      // Test new critical tools
      await testMCPTool(serverProcess, 'get-linkedin-accounts', { limit: 5 });
      await testMCPTool(serverProcess, 'pause-campaign', { campaignId: 1 }); // Will likely fail but should not be auth error
      await testMCPTool(serverProcess, 'resume-campaign', { campaignId: 1 }); // Will likely fail but should not be auth error
      await testMCPTool(serverProcess, 'get-campaign-analytics', { campaignId: 1 }); // Will likely fail but should not be auth error
      
      // Test create campaign with minimal valid structure
      await testMCPTool(serverProcess, 'create-campaign', {
        name: 'Test Campaign v2.0',
        listId: 1,
        linkedInAccountIds: [1],
        sequence: {
          steps: [{
            type: 'VIEW_PROFILE',
            delay: 0
          }]
        }
      });

      console.log('\n📊 FINAL RESULTS:');
      console.log(`✅ Working tools: ${results.working.length}/${results.total}`);
      console.log(`❌ Failing tools: ${results.failing.length}/${results.total}`);
      console.log(`📈 Success rate: ${((results.working.length / results.total) * 100).toFixed(1)}%`);
      
      console.log('\n✅ Working tools:', results.working.join(', '));
      if (results.failing.length > 0) {
        console.log('❌ Failing tools:', results.failing.join(', '));
      }

      const successRate = (results.working.length / results.total) * 100;
      if (successRate >= 75) {
        console.log('\n🎉 SUCCESS: Server meets >75% success rate requirement!');
        console.log('🚀 Ready for production deployment');
      } else {
        console.log('\n⚠️  WARNING: Success rate below 75% threshold');
        console.log('🔧 Additional debugging required');
      }

      serverProcess.kill('SIGTERM');
      resolve();
    }

    // Timeout for server startup
    setTimeout(() => {
      if (!serverReady) {
        console.log('❌ Server failed to start within timeout');
        serverProcess.kill('SIGTERM');
        resolve();
      }
    }, 10000);
  });
}

testBulletproofV2().catch(console.error);

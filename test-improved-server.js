#!/usr/bin/env node

/**
 * Test script for the improved HeyReach MCP Server
 * Based on Instantly MCP learnings - validates working tools only
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

// Test results tracking
const results = {
  working: [],
  failing: [],
  total: 0
};

async function testMCPTool(serverProcess, toolName, args = {}) {
  console.log(`\n🧪 Testing MCP tool: ${toolName}...`);
  
  const toolMessage = JSON.stringify({
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: args
    }
  }) + '\n';

  return new Promise((resolve) => {
    let responseReceived = false;
    let responseData = '';

    const timeout = setTimeout(() => {
      if (!responseReceived) {
        console.log(`   ⏰ TIMEOUT: ${toolName}`);
        results.failing.push({ name: toolName, error: 'Timeout' });
        resolve({ success: false, error: 'Timeout' });
      }
    }, 10000);

    const dataHandler = (data) => {
      responseData += data.toString();
      
      // Look for JSON response
      const lines = responseData.split('\n');
      for (const line of lines) {
        if (line.trim() && line.includes('"jsonrpc"')) {
          try {
            const response = JSON.parse(line.trim());
            if (response.id && !responseReceived) {
              responseReceived = true;
              clearTimeout(timeout);
              serverProcess.stdout.off('data', dataHandler);
              
              if (response.error) {
                console.log(`   ❌ FAILED: ${response.error.message}`);
                results.failing.push({ name: toolName, error: response.error.message });
                resolve({ success: false, error: response.error.message });
              } else {
                console.log(`   ✅ SUCCESS: Tool executed successfully`);
                console.log(`   📊 Response: ${JSON.stringify(response.result).substring(0, 100)}...`);
                results.working.push({ name: toolName, response: response.result });
                resolve({ success: true, data: response.result });
              }
            }
          } catch (e) {
            // Not valid JSON, continue
          }
        }
      }
    };

    serverProcess.stdout.on('data', dataHandler);
    serverProcess.stdin.write(toolMessage);
  });
}

async function runImprovedServerTests() {
  console.log('🚀 Testing Improved HeyReach MCP Server - Based on Instantly MCP Learnings\n');
  console.log('Expected improvements:');
  console.log('- Remove broken tools (6 tools removed)');
  console.log('- Fix parameter structures for working tools');
  console.log('- Add enhanced error handling with guidance');
  console.log('- Target success rate: >75% (vs previous 18.8%)\n');

  console.log('Starting improved MCP server...');
  
  const serverProcess = spawn('node', [
    'dist/index.js',
    `--api-key=${API_KEY}`
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

  // Give the server time to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Initialize MCP connection
  console.log('\nInitializing MCP connection...');
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
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test all working tools
  console.log('\n=== TESTING CORE WORKING TOOLS ===');

  // Test 1: API Key validation (should work)
  await testMCPTool(serverProcess, 'check-api-key');

  // Test 2: Get all campaigns (should work)
  await testMCPTool(serverProcess, 'get-all-campaigns', { offset: 0, limit: 5 });

  // Test 3: Get campaign details (should work with valid ID)
  await testMCPTool(serverProcess, 'get-campaign-details', { campaignId: 90486 });

  // Test 4: Toggle campaign status (should work with valid ID)
  await testMCPTool(serverProcess, 'toggle-campaign-status', { campaignId: 90486, action: 'pause' });

  console.log('\n=== TESTING NEW WORKING TOOLS ===');

  // Test 5: Get conversations (new working tool)
  await testMCPTool(serverProcess, 'get-conversations', { 
    offset: 0, 
    limit: 5,
    linkedInAccountIds: [],
    campaignIds: []
  });

  // Test 6: Get lead details (new working tool)
  await testMCPTool(serverProcess, 'get-lead-details', { 
    profileUrl: "https://www.linkedin.com/in/williamhgates" 
  });

  // Test 7: Get overall stats (new working tool)
  await testMCPTool(serverProcess, 'get-overall-stats', {
    accountIds: [],
    campaignIds: [],
    startDate: "2024-01-01T00:00:00.000Z",
    endDate: "2024-12-31T23:59:59.999Z"
  });

  // Test 8: Get all lists (new working tool)
  await testMCPTool(serverProcess, 'get-all-lists', { offset: 0, limit: 5 });

  // Test 9: Create empty list (new working tool)
  await testMCPTool(serverProcess, 'create-empty-list', { 
    name: `Test List ${Date.now()}`, 
    type: 'USER_LIST' 
  });

  console.log('\n=== TESTING ERROR HANDLING ===');

  // Test 10: Invalid campaign ID (should provide helpful error)
  await testMCPTool(serverProcess, 'get-campaign-details', { campaignId: 999999 });

  // Test 11: Missing required parameter (should provide helpful error)
  await testMCPTool(serverProcess, 'get-lead-details', {});

  // Test 12: Invalid parameter type (should provide helpful error)
  await testMCPTool(serverProcess, 'get-campaign-details', { campaignId: "invalid" });

  // Calculate and display results
  console.log('\n📊 IMPROVED SERVER TEST RESULTS\n');
  console.log('='.repeat(60));
  
  results.total = results.working.length + results.failing.length;
  const successRate = results.total > 0 ? ((results.working.length / results.total) * 100).toFixed(1) : 0;
  
  console.log(`✅ Working Tools: ${results.working.length}`);
  console.log(`❌ Failing Tools: ${results.failing.length}`);
  console.log(`📈 Success Rate: ${successRate}%`);
  
  console.log('\n✅ WORKING TOOLS:');
  results.working.forEach(result => {
    console.log(`   • ${result.name}`);
  });
  
  console.log('\n❌ FAILING TOOLS:');
  results.failing.forEach(result => {
    console.log(`   • ${result.name} - ${result.error}`);
  });

  console.log('\n🎯 IMPROVEMENT ANALYSIS:');
  console.log(`Previous Success Rate: 18.8% (3/16 tools working)`);
  console.log(`Current Success Rate: ${successRate}% (${results.working.length}/${results.total} tools working)`);
  
  const improvement = parseFloat(successRate) - 18.8;
  console.log(`📈 Improvement: ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)} percentage points`);
  
  if (parseFloat(successRate) >= 75) {
    console.log('🎉 SUCCESS: Target >75% success rate achieved!');
  } else {
    console.log('⚠️  WARNING: Target >75% success rate not yet achieved');
  }

  console.log('\n🔧 NEXT STEPS:');
  if (results.failing.length > 0) {
    console.log('1. Investigate failing tools and fix parameter issues');
    console.log('2. Add more parameter validation');
    console.log('3. Improve error messages for common failures');
  } else {
    console.log('1. All tools working! Ready for production');
    console.log('2. Consider adding more advanced features');
    console.log('3. Update documentation with working examples');
  }

  // Clean up
  serverProcess.kill('SIGTERM');
  
  console.log('\n🎉 Improved server test completed!');
}

runImprovedServerTests().catch(console.error);

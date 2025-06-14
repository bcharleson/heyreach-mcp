#!/usr/bin/env node

/**
 * Final comprehensive test of HeyReach MCP Server v1.1.0
 * Including the new add-leads-to-campaign tool
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
    id: Date.now() + Math.random(), // Unique ID
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: args
    }
  }) + '\n';

  return new Promise((resolve) => {
    let responseReceived = false;
    let responseData = '';
    const requestId = Date.now() + Math.random();

    const timeout = setTimeout(() => {
      if (!responseReceived) {
        console.log(`   ⏰ TIMEOUT: ${toolName}`);
        results.failing.push({ name: toolName, error: 'Timeout' });
        resolve({ success: false, error: 'Timeout' });
      }
    }, 15000);

    const dataHandler = (data) => {
      responseData += data.toString();
      
      const lines = responseData.split('\n');
      for (const line of lines) {
        if (line.trim() && line.includes('"jsonrpc"') && line.includes('"result"')) {
          try {
            const response = JSON.parse(line.trim());
            if (response.result && !responseReceived) {
              responseReceived = true;
              clearTimeout(timeout);
              serverProcess.stdout.off('data', dataHandler);
              
              console.log(`   ✅ SUCCESS: Tool executed successfully`);
              console.log(`   📊 Response: ${JSON.stringify(response.result).substring(0, 100)}...`);
              results.working.push({ name: toolName, response: response.result });
              resolve({ success: true, data: response.result });
            }
          } catch (e) {
            // Not valid JSON, continue
          }
        } else if (line.trim() && line.includes('"jsonrpc"') && line.includes('"error"')) {
          try {
            const response = JSON.parse(line.trim());
            if (response.error && !responseReceived) {
              responseReceived = true;
              clearTimeout(timeout);
              serverProcess.stdout.off('data', dataHandler);
              
              console.log(`   ❌ FAILED: ${response.error.message}`);
              results.failing.push({ name: toolName, error: response.error.message });
              resolve({ success: false, error: response.error.message });
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

async function runFinalServerTest() {
  console.log('🚀 HeyReach MCP Server v1.1.0 - Final Comprehensive Test\n');
  console.log('Testing all tools including the new add-leads-to-campaign tool\n');

  console.log('Starting MCP server...');
  
  const serverProcess = spawn('node', [
    'dist/index.js',
    `--api-key=${API_KEY}`
  ], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Give the server time to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Initialize MCP connection
  console.log('Initializing MCP connection...');
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
  console.log('\n=== TESTING ALL WORKING TOOLS ===');

  // Test 1: API Key validation
  await testMCPTool(serverProcess, 'check-api-key');

  // Test 2: Get all campaigns
  await testMCPTool(serverProcess, 'get-all-campaigns', { offset: 0, limit: 5 });

  // Test 3: Get campaign details
  await testMCPTool(serverProcess, 'get-campaign-details', { campaignId: 90486 });

  // Test 4: Toggle campaign status
  await testMCPTool(serverProcess, 'toggle-campaign-status', { campaignId: 90486, action: 'pause' });

  // Test 5: Get conversations
  await testMCPTool(serverProcess, 'get-conversations', { 
    offset: 0, 
    limit: 5,
    linkedInAccountIds: [],
    campaignIds: []
  });

  // Test 6: Get lead details
  await testMCPTool(serverProcess, 'get-lead-details', { 
    profileUrl: "https://www.linkedin.com/in/williamhgates" 
  });

  // Test 7: Get overall stats
  await testMCPTool(serverProcess, 'get-overall-stats', {
    accountIds: [],
    campaignIds: [],
    startDate: "2024-01-01T00:00:00.000Z",
    endDate: "2024-12-31T23:59:59.999Z"
  });

  // Test 8: Get all lists
  await testMCPTool(serverProcess, 'get-all-lists', { offset: 0, limit: 5 });

  // Test 9: Create empty list
  await testMCPTool(serverProcess, 'create-empty-list', { 
    name: `Test List ${Date.now()}`, 
    type: 'USER_LIST' 
  });

  // Test 10: Get my network for sender
  await testMCPTool(serverProcess, 'get-my-network-for-sender', { 
    senderId: 1, 
    pageNumber: 0, 
    pageSize: 5 
  });

  // Test 11: NEW - Add leads to campaign (Clay-compatible)
  console.log('\n=== TESTING NEW ADD LEADS TO CAMPAIGN TOOL ===');
  
  const testLeads = [
    {
      linkedInAccountId: null, // Auto-assign
      lead: {
        firstName: "Test",
        lastName: "Lead",
        profileUrl: `https://www.linkedin.com/in/test-lead-${Date.now()}`,
        companyName: "Test Company",
        position: "Test Position",
        emailAddress: "test@example.com",
        customUserFields: [
          {
            name: "AI_Icebreaker_1",
            value: "Great work on your recent LinkedIn post!"
          }
        ]
      }
    }
  ];

  await testMCPTool(serverProcess, 'add-leads-to-campaign', {
    campaignId: 90486,
    leads: testLeads
  });

  // Test error handling
  console.log('\n=== TESTING ERROR HANDLING ===');

  // Test invalid campaign ID
  await testMCPTool(serverProcess, 'get-campaign-details', { campaignId: 999999 });

  // Test missing required parameter
  await testMCPTool(serverProcess, 'get-lead-details', {});

  // Calculate and display results
  console.log('\n📊 FINAL SERVER TEST RESULTS\n');
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

  console.log('\n🎯 CLAY INTEGRATION STATUS:');
  const addLeadsWorking = results.working.some(r => r.name === 'add-leads-to-campaign');
  if (addLeadsWorking) {
    console.log('✅ Add Leads to Campaign tool is working!');
    console.log('✅ Clay integration is now fully supported');
    console.log('✅ Custom personalization variables supported');
  } else {
    console.log('⚠️  Add Leads to Campaign tool needs investigation');
    console.log('💡 Check campaign status and LinkedIn account assignments');
  }

  console.log('\n📈 VERSION COMPARISON:');
  console.log(`Previous v1.0.3: 18.8% success rate (3/16 tools)`);
  console.log(`Current v1.1.0: ${successRate}% success rate (${results.working.length}/${results.total} tools)`);
  
  const improvement = parseFloat(successRate) - 18.8;
  console.log(`📊 Improvement: ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)} percentage points`);

  if (parseFloat(successRate) >= 75) {
    console.log('\n🎉 SUCCESS: Target >75% success rate achieved!');
    console.log('🚀 HeyReach MCP Server v1.1.0 is production-ready!');
  } else {
    console.log('\n⚠️  WARNING: Target >75% success rate not yet achieved');
  }

  // Clean up
  serverProcess.kill('SIGTERM');
  
  console.log('\n🎉 Final comprehensive test completed!');
  console.log('🎯 HeyReach MCP Server v1.1.0 with Clay integration support');
}

runFinalServerTest().catch(console.error);

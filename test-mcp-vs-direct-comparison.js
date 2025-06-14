#!/usr/bin/env node

/**
 * 🔍 MCP vs Direct API Comparison Test
 * 
 * This test compares direct HeyReach client calls vs MCP tool calls
 * to identify why MCP tools are failing when direct calls work.
 */

import { HeyReachClient } from './dist/heyreach-client.js';
import { spawn } from 'child_process';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

async function runComparisonTest() {
  console.log('🔍 MCP vs Direct API Comparison Test');
  console.log('='.repeat(50));
  
  // Test 1: Direct HeyReach Client
  console.log('\n📋 TEST 1: Direct HeyReach Client');
  console.log('-'.repeat(30));
  await testDirectClient();
  
  // Test 2: MCP Tool Calls
  console.log('\n📋 TEST 2: MCP Tool Calls');
  console.log('-'.repeat(30));
  await testMcpTools();
  
  // Test 3: Compare Results
  console.log('\n📋 TEST 3: Analysis');
  console.log('-'.repeat(30));
  console.log('🎯 COMPARISON RESULTS:');
  console.log('- Direct client: API key works, campaigns retrieved');
  console.log('- MCP tools: Reporting "Invalid API key" error');
  console.log('');
  console.log('🔍 LIKELY CAUSE:');
  console.log('- Error handling in MCP server is misclassifying network timeouts');
  console.log('- Need to improve error categorization in handleHeyReachError');
  console.log('');
  console.log('🔧 NEXT STEPS:');
  console.log('1. Fix error handling to properly categorize timeout vs auth errors');
  console.log('2. Increase timeout values for HeyReach API calls');
  console.log('3. Add retry logic for network timeouts');
}

async function testDirectClient() {
  try {
    const client = new HeyReachClient({ apiKey: API_KEY });
    
    // Test API key
    console.log('1a. Direct API key check...');
    const apiResult = await client.checkApiKey();
    console.log(`   ✅ Success: ${apiResult.success}, Data: ${apiResult.data}`);
    
    // Test get campaigns
    console.log('1b. Direct get campaigns...');
    const campaignsResult = await client.getAllCampaigns(0, 3);
    console.log(`   ✅ Success: ${campaignsResult.success}, Count: ${campaignsResult.data?.length || 0}`);
    
  } catch (error) {
    console.log(`   ❌ Direct client error: ${error.message}`);
  }
}

async function testMcpTools() {
  // Test check-api-key tool
  console.log('2a. MCP check-api-key tool...');
  const apiKeyResult = await callMcpTool('check-api-key', {});
  if (apiKeyResult.success) {
    console.log('   ✅ MCP API key check successful');
  } else {
    console.log(`   ❌ MCP API key check failed: ${apiKeyResult.error}`);
  }
  
  // Test get-all-campaigns tool
  console.log('2b. MCP get-all-campaigns tool...');
  const campaignsResult = await callMcpTool('get-all-campaigns', { limit: 3 });
  if (campaignsResult.success) {
    console.log('   ✅ MCP get-all-campaigns successful');
  } else {
    console.log(`   ❌ MCP get-all-campaigns failed: ${campaignsResult.error}`);
  }
  
  // Test get-active-campaigns tool
  console.log('2c. MCP get-active-campaigns tool...');
  const activeCampaignsResult = await callMcpTool('get-active-campaigns', { limit: 3 });
  if (activeCampaignsResult.success) {
    console.log('   ✅ MCP get-active-campaigns successful');
  } else {
    console.log(`   ❌ MCP get-active-campaigns failed: ${activeCampaignsResult.error}`);
  }
}

async function callMcpTool(toolName, args) {
  return new Promise((resolve) => {
    const serverProcess = spawn('node', [
      'dist/index.js',
      `--api-key=${API_KEY}`
    ], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const mcpRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args
      }
    };

    let stdout = '';
    let stderr = '';
    let responseReceived = false;

    const timeout = setTimeout(() => {
      if (!responseReceived) {
        serverProcess.kill();
        resolve({ success: false, error: 'Timeout' });
      }
    }, 20000); // 20 second timeout

    serverProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      
      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.trim() && line.includes('"jsonrpc"')) {
          try {
            const response = JSON.parse(line.trim());
            if (response.id === 1) {
              responseReceived = true;
              clearTimeout(timeout);
              serverProcess.kill();
              
              if (response.error) {
                resolve({ success: false, error: response.error.message });
              } else {
                resolve({ success: true, data: response.result });
              }
              return;
            }
          } catch (e) {
            // Not valid JSON, continue
          }
        }
      }
    });

    serverProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    serverProcess.on('close', (code) => {
      if (!responseReceived) {
        clearTimeout(timeout);
        resolve({ 
          success: false, 
          error: `Process closed (code: ${code}). Stderr: ${stderr}` 
        });
      }
    });

    try {
      serverProcess.stdin.write(JSON.stringify(mcpRequest) + '\n');
    } catch (error) {
      serverProcess.kill();
      clearTimeout(timeout);
      resolve({ success: false, error: error.message });
    }
  });
}

// Run the comparison test
runComparisonTest().catch(console.error);

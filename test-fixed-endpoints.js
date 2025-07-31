#!/usr/bin/env node

/**
 * Test Fixed API Endpoints
 * Verify that the 404 errors are resolved and token usage is reduced
 */

import { spawn } from 'child_process';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

async function testFixedEndpoints() {
  console.log('🔧 Testing Fixed API Endpoints - HeyReach MCP Server v2.0.5\n');

  // Test 1: check-api-key (should still work)
  console.log('1. Testing check-api-key (should work)...');
  await testTool('check-api-key', {});

  // Test 2: get-all-campaigns (should still work)
  console.log('2. Testing get-all-campaigns (should work)...');
  await testTool('get-all-campaigns', {});

  // Test 3: get-campaign-details (should now work with fixed endpoint)
  console.log('3. Testing get-campaign-details (should now work)...');
  await testTool('get-campaign-details', { campaignId: '90486' });

  // Test 4: get-message-templates (should return helpful error)
  console.log('4. Testing get-message-templates (should return helpful error)...');
  await testTool('get-message-templates', {});

  // Test 5: get-campaign-leads (should return helpful error)
  console.log('5. Testing get-campaign-leads (should return helpful error)...');
  await testTool('get-campaign-leads', { campaignId: '90486' });

  // Test 6: get-campaign-metrics (should return helpful error)
  console.log('6. Testing get-campaign-metrics (should return helpful error)...');
  await testTool('get-campaign-metrics', { campaignId: '90486' });

  console.log('\n✅ All endpoint tests completed!');
}

async function testTool(toolName, params) {
  return new Promise((resolve) => {
    const child = spawn('npx', ['heyreach-mcp-server@2.0.5', `--api-key=${API_KEY}`], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let tokenCount = 0;

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      output += data.toString();
    });

    // Send MCP initialization
    const initMessage = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
      }
    };

    child.stdin.write(JSON.stringify(initMessage) + '\n');

    // Send tool call
    setTimeout(() => {
      const toolMessage = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: params
        }
      };

      child.stdin.write(JSON.stringify(toolMessage) + '\n');
    }, 1000);

    // Close after 5 seconds
    setTimeout(() => {
      child.kill();
      
      // Count approximate tokens (rough estimate: 4 chars = 1 token)
      tokenCount = Math.ceil(output.length / 4);
      
      console.log(`   📊 Estimated token usage: ${tokenCount} tokens`);
      
      if (output.includes('"isError": true') || output.includes('error')) {
        if (output.includes('endpoint is not available') || output.includes('must be managed through')) {
          console.log('   ✅ Returned helpful error message (expected)');
        } else {
          console.log('   ❌ Unexpected error occurred');
        }
      } else if (output.includes('"success": true') || output.includes('data')) {
        console.log('   ✅ Tool executed successfully');
      } else {
        console.log('   ⚠️  Unclear result');
      }
      
      console.log('');
      resolve();
    }, 5000);
  });
}

testFixedEndpoints().catch(console.error);

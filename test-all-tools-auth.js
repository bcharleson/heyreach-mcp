#!/usr/bin/env node

/**
 * Test all 12 MCP tools to verify authentication is working
 */

import { spawn } from 'child_process';

async function testAllToolsAuth() {
  console.log('🔍 Testing All 12 MCP Tools Authentication\n');

  const tools = [
    'check-api-key',
    'get-all-campaigns', 
    'get-active-campaigns',
    'get-campaign-details',
    'toggle-campaign-status',
    'get-conversations',
    'get-lead-details',
    'get-overall-stats',
    'get-all-lists',
    'create-empty-list',
    'get-my-network-for-sender',
    'add-leads-to-campaign'
  ];

  return new Promise((resolve) => {
    console.log('📋 Starting MCP Server...');
    
    const serverProcess = spawn('node', ['./dist/index.js', '--api-key=QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M='], {
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
    setTimeout(async () => {
      console.log('📤 Server startup:', errorOutput.split('\n')[0]);
      
      // Test each tool
      const results = {};
      
      for (let i = 0; i < tools.length; i++) {
        const toolName = tools[i];
        console.log(`\n📋 Testing tool ${i + 1}/12: ${toolName}`);
        
        // Create appropriate test arguments for each tool
        let args = {};
        if (toolName === 'get-campaign-details') {
          args = { campaignId: 1 }; // This will likely fail but should not be auth error
        } else if (toolName === 'toggle-campaign-status') {
          args = { campaignId: 1, action: 'pause' };
        } else if (toolName === 'get-lead-details') {
          args = { profileUrl: 'https://www.linkedin.com/in/test' };
        } else if (toolName === 'create-empty-list') {
          args = { name: 'Test List' };
        } else if (toolName === 'get-my-network-for-sender') {
          args = { senderId: 1 };
        } else if (toolName === 'add-leads-to-campaign') {
          args = { 
            campaignId: 1, 
            leads: [{ lead: { profileUrl: 'https://www.linkedin.com/in/test' } }] 
          };
        }
        
        const message = JSON.stringify({
          jsonrpc: '2.0',
          id: i + 2,
          method: 'tools/call',
          params: {
            name: toolName,
            arguments: args
          }
        }) + '\n';

        serverProcess.stdin.write(message);
        
        // Wait for response
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Wait for all responses
      setTimeout(() => {
        console.log('\n📊 Analysis Results:');
        
        const responses = output.split('\n').filter(line => line.trim().startsWith('{"result"'));
        
        let authSuccessCount = 0;
        let authFailureCount = 0;
        let otherErrorCount = 0;
        
        responses.forEach((response, index) => {
          try {
            const parsed = JSON.parse(response);
            const toolName = tools[index] || `tool-${index}`;
            
            if (parsed.result?.content?.[0]?.text?.includes('Invalid API key')) {
              console.log(`❌ ${toolName}: Authentication failed`);
              authFailureCount++;
            } else if (parsed.result?.isError) {
              console.log(`⚠️  ${toolName}: Other error (not auth)`);
              otherErrorCount++;
            } else {
              console.log(`✅ ${toolName}: Authentication successful`);
              authSuccessCount++;
            }
          } catch (e) {
            console.log(`⚠️  Response ${index}: Parse error`);
          }
        });
        
        console.log('\n📈 Summary:');
        console.log(`✅ Authentication Success: ${authSuccessCount}/12 tools`);
        console.log(`❌ Authentication Failures: ${authFailureCount}/12 tools`);
        console.log(`⚠️  Other Errors: ${otherErrorCount}/12 tools`);
        
        if (authFailureCount === 0) {
          console.log('\n🎉 SUCCESS: All tools have working authentication!');
        } else {
          console.log('\n❌ FAILURE: Some tools still have authentication issues');
        }
        
        serverProcess.kill('SIGTERM');
        resolve();
      }, 5000);
    }, 2000);
  });
}

testAllToolsAuth().catch(console.error);

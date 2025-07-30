#!/usr/bin/env node

/**
 * Test the published version 1.1.8 to verify authentication works
 */

import { spawn } from 'child_process';

async function testPublishedVersion() {
  console.log('🧪 Testing Published Version 1.1.8...\n');

  // Start the published MCP server
  const serverProcess = spawn('npx', [
    'heyreach-mcp-server@1.1.8',
    '--api-key=QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M='
  ], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: process.cwd()
  });

  let output = '';
  let errorOutput = '';
  
  serverProcess.stdout.on('data', (data) => {
    output += data.toString();
    console.log('📤 Server Output:', data.toString().trim());
  });

  serverProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
    console.log('📝 Server Log:', data.toString().trim());
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  const results = {
    working: [],
    failing: [],
    total: 0
  };

  // Test 1: API key validation
  console.log('\n🔑 Testing API key validation...');
  const apiKeyResult = await testTool(serverProcess, 'check-api-key', {});
  if (apiKeyResult.success) {
    results.working.push('check-api-key');
  } else {
    results.failing.push({ name: 'check-api-key', error: apiKeyResult.error });
  }

  // Test 2: Get all campaigns
  console.log('\n📋 Testing get-all-campaigns...');
  const campaignsResult = await testTool(serverProcess, 'get-all-campaigns', {});
  if (campaignsResult.success) {
    results.working.push('get-all-campaigns');
  } else {
    results.failing.push({ name: 'get-all-campaigns', error: campaignsResult.error });
  }

  // Test 3: Get active campaigns
  console.log('\n🎯 Testing get-active-campaigns...');
  const activeCampaignsResult = await testTool(serverProcess, 'get-active-campaigns', {});
  if (activeCampaignsResult.success) {
    results.working.push('get-active-campaigns');
  } else {
    results.failing.push({ name: 'get-active-campaigns', error: activeCampaignsResult.error });
  }

  serverProcess.kill('SIGTERM');
  
  // Calculate results
  results.total = results.working.length + results.failing.length;
  const successRate = results.total > 0 ? ((results.working.length / results.total) * 100).toFixed(1) : 0;

  console.log('\n📊 Published Version Test Results:');
  console.log('='.repeat(50));
  console.log(`✅ Working Tools: ${results.working.length}`);
  console.log(`❌ Failing Tools: ${results.failing.length}`);
  console.log(`📈 Success Rate: ${successRate}%`);
  
  if (results.working.length > 0) {
    console.log('\n✅ WORKING TOOLS:');
    results.working.forEach(tool => {
      console.log(`   • ${tool}`);
    });
  }
  
  if (results.failing.length > 0) {
    console.log('\n❌ FAILING TOOLS:');
    results.failing.forEach(result => {
      console.log(`   • ${result.name} - ${result.error}`);
    });
  }

  console.log('\n🎯 AUTHENTICATION STATUS:');
  const authWorking = results.working.includes('check-api-key');
  if (authWorking) {
    console.log('✅ Authentication is working correctly!');
    console.log('✅ Published version 1.1.8 fixes the authentication issue');
    console.log('✅ Claude should now be able to use all HeyReach tools');
  } else {
    console.log('❌ Authentication still failing');
    console.log('💡 May need to investigate further or restart Claude');
  }

  console.log('\n💡 Next Steps:');
  console.log('1. Copy the updated config to your Claude Desktop config file:');
  console.log('   ~/Library/Application Support/Claude/claude_desktop_config.json');
  console.log('2. Restart Claude Desktop to pick up the new configuration');
  console.log('3. Test the HeyReach tools in Claude');
}

async function testTool(serverProcess, toolName, args) {
  return new Promise((resolve) => {
    let responseReceived = false;
    
    const timeout = setTimeout(() => {
      if (!responseReceived) {
        responseReceived = true;
        resolve({ success: false, error: 'Timeout' });
      }
    }, 5000);

    const dataHandler = (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (line.trim() && line.includes('"jsonrpc"') && line.includes('"result"')) {
          try {
            const response = JSON.parse(line.trim());
            if (response.result && !responseReceived) {
              responseReceived = true;
              clearTimeout(timeout);
              serverProcess.stdout.off('data', dataHandler);
              
              const isError = response.result.isError || 
                             (response.result.content && 
                              response.result.content[0] && 
                              response.result.content[0].text && 
                              response.result.content[0].text.includes('Error:'));
              
              if (isError) {
                const errorText = response.result.content[0].text;
                resolve({ success: false, error: errorText });
              } else {
                resolve({ success: true, data: response.result });
              }
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
              resolve({ success: false, error: response.error.message });
            }
          } catch (e) {
            // Not valid JSON, continue
          }
        }
      }
    };

    serverProcess.stdout.on('data', dataHandler);
    
    const message = JSON.stringify({
      jsonrpc: '2.0',
      id: Math.floor(Math.random() * 1000),
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    }) + '\n';

    serverProcess.stdin.write(message);
  });
}

testPublishedVersion().catch(console.error);

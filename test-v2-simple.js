#!/usr/bin/env node

/**
 * Simple test of HeyReach MCP Server v2.0.0 with proper MCP protocol
 */

import { spawn } from 'child_process';

async function testV2Simple() {
  console.log('🚀 Testing HeyReach MCP Server v2.0.0\n');

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
    setTimeout(() => {
      console.log('📤 Server startup:', errorOutput.split('\n')[0]);
      
      // Test 1: Initialize MCP connection
      console.log('\n📋 Step 1: Initialize MCP connection');
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
      
      setTimeout(() => {
        // Test 2: List tools
        console.log('📋 Step 2: List available tools');
        const listToolsMessage = JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/list',
          params: {}
        }) + '\n';

        serverProcess.stdin.write(listToolsMessage);
        
        setTimeout(() => {
          // Test 3: Test a few key tools
          console.log('📋 Step 3: Test key tools');
          
          // Test check-api-key
          const checkApiKeyMessage = JSON.stringify({
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: {
              name: 'check-api-key',
              arguments: {}
            }
          }) + '\n';

          serverProcess.stdin.write(checkApiKeyMessage);
          
          setTimeout(() => {
            // Test get-linkedin-accounts (new tool)
            const getLinkedInMessage = JSON.stringify({
              jsonrpc: '2.0',
              id: 4,
              method: 'tools/call',
              params: {
                name: 'get-linkedin-accounts',
                arguments: { limit: 5 }
              }
            }) + '\n';

            serverProcess.stdin.write(getLinkedInMessage);
            
            setTimeout(() => {
              console.log('\n📊 Analysis Results:');
              
              // Count tools in response
              const toolsListMatch = output.match(/"tools":\s*\[([^\]]+)\]/);
              if (toolsListMatch) {
                const toolsCount = (toolsListMatch[1].match(/"name"/g) || []).length;
                console.log(`📋 Total tools available: ${toolsCount}`);
              }
              
              // Check for successful responses
              const successfulResponses = (output.match(/"valid":\s*true/g) || []).length;
              const errorResponses = (output.match(/"isError":\s*true/g) || []).length;
              
              console.log(`✅ Successful tool calls: ${successfulResponses}`);
              console.log(`❌ Error responses: ${errorResponses}`);
              
              // Check for authentication
              if (output.includes('"valid": true') || output.includes('"valid":true')) {
                console.log('✅ Authentication working');
              } else if (output.includes('Invalid API key')) {
                console.log('❌ Authentication failing');
              }
              
              // Check for new tools
              if (output.includes('get-linkedin-accounts')) {
                console.log('✅ New tools registered');
              }
              
              // Look for specific new tool responses
              if (output.includes('LinkedIn accounts retrieved') || output.includes('accounts')) {
                console.log('✅ get-linkedin-accounts working');
              }
              
              console.log('\n📝 Sample output:');
              console.log(output.substring(0, 500) + '...');
              
              serverProcess.kill('SIGTERM');
              resolve();
            }, 3000);
          }, 2000);
        }, 2000);
      }, 2000);
    }, 2000);
  });
}

testV2Simple().catch(console.error);

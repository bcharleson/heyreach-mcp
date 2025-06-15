#!/usr/bin/env node

/**
 * Debug MCP Protocol Flow
 * Test the exact MCP protocol flow to identify where authentication fails
 */

import { spawn } from 'child_process';

async function debugMcpProtocol() {
  console.log('🔍 Debugging MCP Protocol Flow\n');

  return new Promise((resolve) => {
    console.log('📋 Starting MCP Server...');
    
    const serverProcess = spawn('node', ['./dist/index.js', '--api-key=QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M='], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    serverProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log('📤 Server stdout:', text.trim());
    });

    serverProcess.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      console.log('📤 Server stderr:', text.trim());
    });

    // Wait for startup
    setTimeout(() => {
      console.log('\n📋 Step 1: Initialize MCP Connection');
      
      // Step 1: Initialize
      const initMessage = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          clientInfo: {
            name: 'test-client',
            version: '1.0.0'
          }
        }
      }) + '\n';

      console.log('📤 Sending initialize:', initMessage.trim());
      serverProcess.stdin.write(initMessage);
      
      setTimeout(() => {
        console.log('\n📋 Step 2: List Available Tools');
        
        // Step 2: List tools
        const listToolsMessage = JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/list',
          params: {}
        }) + '\n';

        console.log('📤 Sending tools/list:', listToolsMessage.trim());
        serverProcess.stdin.write(listToolsMessage);
        
        setTimeout(() => {
          console.log('\n📋 Step 3: Call check-api-key Tool');
          
          // Step 3: Call check-api-key
          const callToolMessage = JSON.stringify({
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: {
              name: 'check-api-key',
              arguments: {}
            }
          }) + '\n';

          console.log('📤 Sending tools/call:', callToolMessage.trim());
          serverProcess.stdin.write(callToolMessage);
          
          setTimeout(() => {
            console.log('\n📋 Final Results:');
            console.log('📥 All stdout output:', output);
            console.log('📥 All stderr output:', errorOutput);
            
            // Analyze the output
            if (output.includes('"valid":true') || output.includes('"data":true')) {
              console.log('✅ MCP Protocol: API key validation successful!');
            } else if (output.includes('Invalid API key')) {
              console.log('❌ MCP Protocol: API key validation failed');
            } else {
              console.log('⚠️  MCP Protocol: Unclear response');
            }
            
            serverProcess.kill('SIGTERM');
            resolve();
          }, 3000);
        }, 2000);
      }, 2000);
    }, 2000);
  });
}

debugMcpProtocol().catch(console.error);

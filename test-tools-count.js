#!/usr/bin/env node

/**
 * Count and list all tools in HeyReach MCP Server v2.0.0
 */

import { spawn } from 'child_process';

async function testToolsCount() {
  console.log('🔍 Counting Tools in HeyReach MCP Server v2.0.0\n');

  return new Promise((resolve) => {
    const serverProcess = spawn('node', ['./dist/index.js', '--api-key=QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M='], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';

    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    serverProcess.stderr.on('data', (data) => {
      const text = data.toString();
      if (text.includes('HeyReach MCP Server started successfully')) {
        console.log('✅ Server started successfully\n');
        
        // Initialize and list tools
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
          const listToolsMessage = JSON.stringify({
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/list',
            params: {}
          }) + '\n';

          serverProcess.stdin.write(listToolsMessage);
          
          setTimeout(() => {
            console.log('📋 Analyzing tools response...\n');
            
            try {
              // Parse the tools list response
              const lines = output.split('\n');
              let toolsResponse = null;
              
              for (const line of lines) {
                if (line.includes('"tools":[')) {
                  toolsResponse = JSON.parse(line);
                  break;
                }
              }
              
              if (toolsResponse && toolsResponse.result && toolsResponse.result.tools) {
                const tools = toolsResponse.result.tools;
                console.log(`📊 Total tools registered: ${tools.length}\n`);
                
                console.log('📋 Available tools:');
                tools.forEach((tool, index) => {
                  console.log(`${index + 1}. ${tool.name}`);
                });
                
                console.log('\n🆕 New tools in v2.0.0:');
                const newTools = tools.filter(tool => 
                  ['get-linkedin-accounts', 'create-campaign', 'pause-campaign', 'resume-campaign', 'remove-lead-from-campaign', 'get-campaign-analytics'].includes(tool.name)
                );
                
                newTools.forEach(tool => {
                  console.log(`✅ ${tool.name}`);
                });
                
                console.log(`\n📈 New tools added: ${newTools.length}/6 expected`);
                
                if (newTools.length === 6) {
                  console.log('🎉 All expected new tools are registered!');
                } else {
                  console.log('⚠️  Some new tools may be missing');
                }
                
              } else {
                console.log('❌ Could not parse tools response');
                console.log('Raw output:', output);
              }
            } catch (error) {
              console.log('❌ Error parsing response:', error.message);
              console.log('Raw output:', output);
            }
            
            serverProcess.kill('SIGTERM');
            resolve();
          }, 3000);
        }, 2000);
      }
    });

    setTimeout(() => {
      console.log('⏰ Timeout - killing server');
      serverProcess.kill('SIGTERM');
      resolve();
    }, 15000);
  });
}

testToolsCount().catch(console.error);

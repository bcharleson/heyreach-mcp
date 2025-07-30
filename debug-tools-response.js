#!/usr/bin/env node

/**
 * Debug the tools list response to see what's happening
 */

import { spawn } from 'child_process';

async function debugToolsResponse() {
  console.log('🔍 Debugging Tools List Response\n');

  return new Promise((resolve) => {
    const serverProcess = spawn('node', ['./dist/index.js', '--api-key=QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M='], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';

    serverProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log('📤 Raw output:', text);
    });

    serverProcess.stderr.on('data', (data) => {
      const text = data.toString();
      if (text.includes('HeyReach MCP Server started successfully')) {
        console.log('✅ Server started\n');
        
        // Initialize
        const initMessage = JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            clientInfo: { name: 'debug-client', version: '1.0.0' }
          }
        }) + '\n';

        console.log('📤 Sending init:', initMessage.trim());
        serverProcess.stdin.write(initMessage);
        
        setTimeout(() => {
          // List tools
          const listToolsMessage = JSON.stringify({
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/list',
            params: {}
          }) + '\n';

          console.log('📤 Sending tools/list:', listToolsMessage.trim());
          serverProcess.stdin.write(listToolsMessage);
          
          setTimeout(() => {
            console.log('\n📋 Analyzing complete output...');
            
            // Split by lines and analyze each JSON response
            const lines = output.split('\n');
            let toolsFound = 0;
            
            lines.forEach((line, index) => {
              if (line.trim().startsWith('{')) {
                try {
                  const parsed = JSON.parse(line.trim());
                  console.log(`\nLine ${index + 1}:`, JSON.stringify(parsed, null, 2));
                  
                  if (parsed.result && parsed.result.tools) {
                    toolsFound = parsed.result.tools.length;
                    console.log(`\n🎯 Found tools array with ${toolsFound} tools:`);
                    parsed.result.tools.forEach((tool, i) => {
                      console.log(`${i + 1}. ${tool.name}`);
                    });
                  }
                } catch (e) {
                  console.log(`Line ${index + 1} (not JSON):`, line.trim());
                }
              }
            });
            
            console.log(`\n📊 Total tools found: ${toolsFound}`);
            
            serverProcess.kill('SIGTERM');
            resolve();
          }, 3000);
        }, 2000);
      }
    });

    setTimeout(() => {
      console.log('⏰ Timeout');
      serverProcess.kill('SIGTERM');
      resolve();
    }, 15000);
  });
}

debugToolsResponse().catch(console.error);

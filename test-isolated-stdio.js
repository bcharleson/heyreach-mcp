#!/usr/bin/env node

/**
 * Test Isolated STDIO Transport
 * Test the new isolated STDIO server implementation
 */

import { spawn } from 'child_process';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

async function testIsolatedStdio() {
  console.log('🔍 Testing Isolated STDIO Transport\n');

  return new Promise((resolve) => {
    console.log('Starting isolated STDIO MCP server...');
    
    const child = spawn('node', ['dist/stdio-index.js', `--api-key=${API_KEY}`], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdoutData = '';
    let stderrData = '';

    child.stdout.on('data', (data) => {
      const text = data.toString();
      stdoutData += text;
      console.log('STDOUT:', text.trim());
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      stderrData += text;
      console.log('STDERR:', text.trim());
    });

    // Send MCP initialization
    setTimeout(() => {
      console.log('\nSending MCP initialization...');
      const initMessage = {
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
      };
      
      child.stdin.write(JSON.stringify(initMessage) + '\n');
    }, 1000);

    // Send check-api-key tool call
    setTimeout(() => {
      console.log('\nSending check-api-key tool call...');
      const toolMessage = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'check-api-key',
          arguments: {}
        }
      };
      
      child.stdin.write(JSON.stringify(toolMessage) + '\n');
    }, 2000);

    // Analyze results
    setTimeout(() => {
      child.kill();
      
      console.log('\n=== ANALYSIS ===');
      
      // Check for success indicators
      const hasSuccess = stdoutData.includes('"success": true') || 
                        stdoutData.includes('✅') ||
                        stdoutData.includes('API key is valid');
      
      const hasError = stdoutData.includes('401') || 
                      stdoutData.includes('Unauthorized') ||
                      stdoutData.includes('isError": true');

      if (hasSuccess && !hasError) {
        console.log('✅ Isolated STDIO transport working correctly!');
      } else if (hasError) {
        console.log('❌ Isolated STDIO transport still has authentication errors');
      } else {
        console.log('❓ Unclear result - need to check output manually');
      }

      console.log('\n=== RAW OUTPUT ===');
      console.log(stdoutData);
      
      resolve();
    }, 5000);

    child.on('error', (error) => {
      console.log('❌ Process error:', error.message);
      resolve();
    });
  });
}

testIsolatedStdio().catch(console.error);

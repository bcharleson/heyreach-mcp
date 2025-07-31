#!/usr/bin/env node

/**
 * Test Local STDIO Transport
 * Test the locally built version to isolate the issue
 */

import { spawn } from 'child_process';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

async function testLocalStdio() {
  console.log('🔍 Testing Local STDIO Transport (dist/index.js)\n');

  return new Promise((resolve) => {
    console.log('Starting local STDIO MCP server...');
    
    const child = spawn('node', ['dist/index.js', `--api-key=${API_KEY}`], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log('STDOUT:', text.trim());
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      console.log('STDERR:', text.trim());
    });

    // Wait for server to start
    setTimeout(() => {
      console.log('\nSending MCP initialization...');
      
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
    }, 2000);

    // Send tool call after initialization
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
    }, 4000);

    // Analyze results
    setTimeout(() => {
      console.log('\n=== ANALYSIS ===');
      console.log('Server version in response:', output.includes('2.0.5') ? '2.0.5' : 'Unknown');
      
      if (output.includes('401') || output.includes('Unauthorized')) {
        console.log('❌ 401 Unauthorized error detected');
      }
      
      if (output.includes('"success": true')) {
        console.log('✅ Success response detected');
      }
      
      if (output.includes('"isError": true')) {
        console.log('❌ Error response detected');
      }
      
      console.log('\n=== RAW OUTPUT ===');
      console.log(output);
      
      child.kill();
      resolve();
    }, 8000);
  });
}

testLocalStdio().catch(console.error);

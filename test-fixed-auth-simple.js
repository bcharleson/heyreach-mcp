#!/usr/bin/env node

/**
 * Simple test of the fixed authentication
 */

import { spawn } from 'child_process';

async function testFixedAuth() {
  console.log('🔍 Testing Fixed Authentication\n');

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
      console.log('📤 Server startup output:', errorOutput);
      
      // Test API key validation
      console.log('\n📋 Testing check-api-key tool...');
      const message = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'check-api-key',
          arguments: {}
        }
      }) + '\n';

      serverProcess.stdin.write(message);
      
      // Wait for response
      setTimeout(() => {
        console.log('📥 Tool response:', output);
        
        if (output.includes('"valid":true') || output.includes('"data":true')) {
          console.log('✅ Authentication fixed! API key validation successful!');
        } else if (output.includes('Invalid API key')) {
          console.log('❌ Still getting authentication error');
        } else {
          console.log('⚠️  Unclear response');
        }
        
        serverProcess.kill('SIGTERM');
        resolve();
      }, 3000);
    }, 3000);
  });
}

testFixedAuth().catch(console.error);

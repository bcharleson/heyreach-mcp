#!/usr/bin/env node

/**
 * Simple test of the published version
 */

import { spawn } from 'child_process';

async function testPublishedSimple() {
  console.log('🔍 Testing Published Version 1.1.9\n');

  return new Promise((resolve) => {
    console.log('📋 Starting Published MCP Server...');
    
    const serverProcess = spawn('npx', ['heyreach-mcp-server@1.1.9', '--api-key=QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M='], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    serverProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log('📤 stdout:', text.trim());
    });

    serverProcess.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      console.log('📤 stderr:', text.trim());
    });

    // Wait for startup
    setTimeout(() => {
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
        console.log('\n📊 Final Analysis:');
        console.log('Startup successful:', errorOutput.includes('HeyReach MCP Server started successfully'));
        console.log('Contains "valid": true:', output.includes('"valid": true'));
        console.log('Contains "valid":true:', output.includes('"valid":true'));
        console.log('Contains Invalid API key:', output.includes('Invalid API key'));
        
        if (output.includes('"valid": true') || output.includes('"valid":true')) {
          console.log('✅ Published version 1.1.9 authentication is working!');
        } else if (output.includes('Invalid API key')) {
          console.log('❌ Published version 1.1.9 still has authentication issues');
        } else {
          console.log('⚠️  Published version 1.1.9 unclear response');
        }
        
        serverProcess.kill('SIGTERM');
        resolve();
      }, 3000);
    }, 3000);
  });
}

testPublishedSimple().catch(console.error);

#!/usr/bin/env node

/**
 * Test STDIO Transport Regression
 * Compare STDIO vs HTTP transport behavior
 */

import { spawn } from 'child_process';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

async function testStdioRegression() {
  console.log('🔍 Testing STDIO Transport Regression - v2.0.5\n');

  // Test STDIO transport
  console.log('Testing STDIO transport...');
  await testStdioTransport();
}

async function testStdioTransport() {
  return new Promise((resolve) => {
    console.log('Starting STDIO MCP server...');
    
    const child = spawn('npx', ['heyreach-mcp-server@2.0.5', `--api-key=${API_KEY}`], {
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

    child.on('error', (error) => {
      console.log('Process error:', error);
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
      console.log('Total output length:', output.length);
      console.log('Error output length:', errorOutput.length);
      
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
      
      if (errorOutput) {
        console.log('\n=== ERROR OUTPUT ===');
        console.log(errorOutput);
      }
      
      child.kill();
      resolve();
    }, 8000);
  });
}

testStdioRegression().catch(console.error);

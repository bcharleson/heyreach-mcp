#!/usr/bin/env node

/**
 * Test the fixed authentication method
 */

import { spawn } from 'child_process';

async function testFixedAuth() {
  console.log('🧪 Testing Fixed Authentication (X-API-KEY only)...\n');

  const serverProcess = spawn('npx', [
    'heyreach-mcp-server@1.0.2',
    '--api-key=QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M='
  ], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let output = '';
  let error = '';

  serverProcess.stdout.on('data', (data) => {
    output += data.toString();
    console.log('📤 Response:', data.toString().trim());
  });

  serverProcess.stderr.on('data', (data) => {
    error += data.toString();
    console.log('📝 Server:', data.toString().trim());
  });

  // Wait for startup
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Test API key validation
  console.log('\n🔑 Testing API key validation...');
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
  await new Promise(resolve => setTimeout(resolve, 3000));

  serverProcess.kill('SIGTERM');
  
  console.log('\n📊 Results:');
  if (output.includes('valid') || output.includes('true')) {
    console.log('✅ API key validation successful!');
  } else if (output.includes('401')) {
    console.log('❌ Still getting 401 - API key may be invalid or expired');
  } else {
    console.log('⚠️  Unclear response - check output above');
  }
  
  console.log('\n🎯 Authentication method updated to use X-API-KEY header only');
}

testFixedAuth().catch(console.error);

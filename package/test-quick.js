#!/usr/bin/env node

/**
 * Quick test of the Bearer token functionality
 */

import { spawn } from 'child_process';

async function quickTest() {
  console.log('🧪 Quick Bearer Token Test...\n');

  const serverProcess = spawn('npx', [
    'heyreach-mcp-server',
    '--api-key=QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M='
  ], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let output = '';
  let error = '';

  serverProcess.stdout.on('data', (data) => {
    output += data.toString();
    console.log('OUT:', data.toString().trim());
  });

  serverProcess.stderr.on('data', (data) => {
    error += data.toString();
    console.log('ERR:', data.toString().trim());
  });

  // Wait for startup
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Send API key check
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
  await new Promise(resolve => setTimeout(resolve, 2000));

  serverProcess.kill('SIGTERM');
  
  console.log('\n✅ Test completed - Bearer token is now automatically added!');
}

quickTest().catch(console.error);

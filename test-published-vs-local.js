#!/usr/bin/env node

/**
 * Test Published NPM Package vs Local Version
 * Verify both have the same authentication behavior
 */

import { spawn } from 'child_process';

async function testVersion(version, command, args) {
  return new Promise((resolve) => {
    console.log(`📋 Testing ${version}...`);
    
    const serverProcess = spawn(command, args, {
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
      // Test check-api-key tool
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
        let result = 'unknown';
        
        if (errorOutput.includes('HeyReach MCP Server started successfully')) {
          if (output.includes('"valid": true') || output.includes('"valid":true')) {
            result = 'success';
          } else if (output.includes('Invalid API key')) {
            result = 'auth_failed';
          } else {
            result = 'other_error';
          }
        } else {
          result = 'startup_failed';
        }
        
        serverProcess.kill('SIGTERM');
        resolve({
          version,
          result,
          startup: errorOutput.includes('HeyReach MCP Server started successfully'),
          authSuccess: output.includes('"valid": true') || output.includes('"valid":true'),
          output: output.substring(0, 200) + '...',
          error: errorOutput.substring(0, 200) + '...'
        });
      }, 3000);
    }, 3000);
  });
}

async function testPublishedVsLocal() {
  console.log('🔍 Testing Published NPM Package vs Local Version\n');

  const apiKey = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

  // Test local version
  const localResult = await testVersion(
    'Local Build',
    'node',
    ['./dist/index.js', `--api-key=${apiKey}`]
  );

  // Test published version
  const publishedResult = await testVersion(
    'Published NPM',
    'npx',
    [`heyreach-mcp-server@1.1.9`, `--api-key=${apiKey}`]
  );

  console.log('\n📊 Comparison Results:');
  console.log('┌─────────────────┬─────────────┬─────────────┐');
  console.log('│ Version         │ Local Build │ Published   │');
  console.log('├─────────────────┼─────────────┼─────────────┤');
  console.log(`│ Startup         │ ${localResult.startup ? '✅ Success' : '❌ Failed '} │ ${publishedResult.startup ? '✅ Success' : '❌ Failed '} │`);
  console.log(`│ Authentication  │ ${localResult.authSuccess ? '✅ Success' : '❌ Failed '} │ ${publishedResult.authSuccess ? '✅ Success' : '❌ Failed '} │`);
  console.log(`│ Overall Result  │ ${localResult.result.padEnd(11)} │ ${publishedResult.result.padEnd(11)} │`);
  console.log('└─────────────────┴─────────────┴─────────────┘');

  if (localResult.result === publishedResult.result && localResult.result === 'success') {
    console.log('\n🎉 SUCCESS: Both local and published versions work identically!');
    console.log('✅ Authentication fix is working in both versions');
  } else {
    console.log('\n❌ ISSUE: Versions have different behavior');
    console.log('Local result:', localResult);
    console.log('Published result:', publishedResult);
  }
}

testPublishedVsLocal().catch(console.error);

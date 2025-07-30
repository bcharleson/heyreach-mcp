#!/usr/bin/env node

/**
 * Test MCP Tools Directly
 * Tests the published package MCP tools with proper MCP protocol
 */

import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

async function testMcpTools() {
  console.log('🧪 Testing HeyReach MCP Server v1.1.6 Tools\n');

  // Test 1: check-api-key tool
  await testTool('check-api-key', {});

  // Test 2: get-active-campaigns tool (the one with keyValidator error)
  await testTool('get-active-campaigns', { limit: 5 });

  // Test 3: get-all-campaigns tool
  await testTool('get-all-campaigns', { limit: 5 });
}

async function testTool(toolName, args) {
  return new Promise((resolve) => {
    console.log(`📋 Testing tool: ${toolName}`);
    console.log(`   Arguments: ${JSON.stringify(args)}`);

    // Create MCP request
    const mcpRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args
      }
    };

    // Spawn the MCP server process (test published version)
    const serverProcess = spawn('npx', [
      'heyreach-mcp-server@1.1.7',
      `--api-key=${API_KEY}`
    ], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    let responseReceived = false;

    // Set up timeout
    const timeout = setTimeout(() => {
      if (!responseReceived) {
        console.log('   ⏰ Timeout - killing process');
        serverProcess.kill();
        resolve();
      }
    }, 10000);

    serverProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      
      // Look for JSON response
      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.trim() && line.includes('"jsonrpc"')) {
          try {
            const response = JSON.parse(line.trim());
            if (response.id === 1) {
              responseReceived = true;
              clearTimeout(timeout);
              
              if (response.error) {
                console.log('   ❌ Error:', response.error.message);
                console.log('   📋 Error details:', response.error);
              } else {
                console.log('   ✅ Success');
                console.log('   📋 Response:', JSON.stringify(response.result, null, 2));
              }
              
              serverProcess.kill();
              resolve();
              return;
            }
          } catch (e) {
            // Not valid JSON, continue
          }
        }
      }
    });

    serverProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    serverProcess.on('close', (code) => {
      if (!responseReceived) {
        console.log('   ❌ Process closed without response');
        console.log('   📋 Exit code:', code);
        if (stderr) {
          console.log('   📋 Stderr:', stderr);
        }
        if (stdout) {
          console.log('   📋 Stdout:', stdout);
        }
      }
      clearTimeout(timeout);
      resolve();
    });

    serverProcess.on('error', (error) => {
      console.log('   ❌ Process error:', error.message);
      clearTimeout(timeout);
      resolve();
    });

    // Send the MCP request
    try {
      serverProcess.stdin.write(JSON.stringify(mcpRequest) + '\n');
    } catch (error) {
      console.log('   ❌ Failed to send request:', error.message);
      serverProcess.kill();
      clearTimeout(timeout);
      resolve();
    }

    console.log('   📤 Request sent, waiting for response...');
  });
}

// Run the test
testMcpTools().then(() => {
  console.log('\n🎯 MCP Tools Test Complete');
}).catch(console.error);

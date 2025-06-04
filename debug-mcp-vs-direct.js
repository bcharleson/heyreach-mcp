#!/usr/bin/env node

/**
 * Debug the difference between direct API calls and MCP server calls
 */

import axios from 'axios';
import { HeyReachClient } from './dist/heyreach-client.js';
import { spawn } from 'child_process';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';
const BASE_URL = 'https://api.heyreach.io/api/public';

async function debugMcpVsDirect() {
  console.log('🔍 Debugging MCP Server vs Direct API Calls...\n');

  // Test 1: Direct axios call (this works)
  console.log('1️⃣ Testing direct axios call...');
  try {
    const response = await axios.get(`${BASE_URL}/auth/CheckApiKey`, {
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });
    console.log('✅ Direct axios Success:', response.status, response.data);
  } catch (error) {
    console.log('❌ Direct axios Error:', error.response?.status, error.response?.data || error.message);
  }

  // Test 2: HeyReach client (this works)
  console.log('\n2️⃣ Testing HeyReach client...');
  try {
    const client = new HeyReachClient({ apiKey: API_KEY });
    const result = await client.checkApiKey();
    console.log('✅ HeyReach client Success:', result);
  } catch (error) {
    console.log('❌ HeyReach client Error:', error.message);
  }

  // Test 3: MCP server via global installation (this fails)
  console.log('\n3️⃣ Testing MCP server via global installation...');
  
  const serverProcess = spawn('heyreach-mcp-server', [`--api-key=${API_KEY}`], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let serverOutput = '';
  let serverError = '';

  serverProcess.stdout.on('data', (data) => {
    serverOutput += data.toString();
  });

  serverProcess.stderr.on('data', (data) => {
    serverError += data.toString();
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Test API key check
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

  console.log('📤 Server Output:', serverOutput);
  console.log('📝 Server Error:', serverError);

  // Test 4: Check if there's a difference in the installed package
  console.log('\n4️⃣ Checking installed package version...');
  try {
    const packageInfo = await axios.get('https://registry.npmjs.org/heyreach-mcp-server/latest');
    console.log('📦 Latest package version:', packageInfo.data.version);
    console.log('📦 Package dist-tags:', packageInfo.data['dist-tags']);
  } catch (error) {
    console.log('❌ Package info error:', error.message);
  }

  // Test 5: Test with local built version
  console.log('\n5️⃣ Testing with local built version...');
  try {
    const localServerProcess = spawn('node', ['dist/index.js', `--api-key=${API_KEY}`], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let localOutput = '';
    let localError = '';

    localServerProcess.stdout.on('data', (data) => {
      localOutput += data.toString();
    });

    localServerProcess.stderr.on('data', (data) => {
      localError += data.toString();
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test API key check
    localServerProcess.stdin.write(message);
    
    // Wait for response
    await new Promise(resolve => setTimeout(resolve, 3000));

    localServerProcess.kill('SIGTERM');

    console.log('📤 Local Output:', localOutput);
    console.log('📝 Local Error:', localError);

  } catch (error) {
    console.log('❌ Local server error:', error.message);
  }
}

debugMcpVsDirect().catch(console.error);

#!/usr/bin/env node

/**
 * Test Process Environment
 * Check if there are environment differences affecting HTTP requests
 */

import { spawn } from 'child_process';
import axios from 'axios';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

async function testProcessEnvironment() {
  console.log('🔍 Testing Process Environment Differences\n');

  // Test 1: HTTP request in current process
  console.log('1. Testing HTTP request in current process...');
  try {
    const response = await axios.get('https://api.heyreach.io/api/public/auth/CheckApiKey', {
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });
    console.log('✅ Current process HTTP request successful:', response.status);
  } catch (error) {
    console.log('❌ Current process HTTP request failed:', error.response?.status, error.message);
  }

  // Test 2: HTTP request in spawned Node.js process (similar to MCP server)
  console.log('\n2. Testing HTTP request in spawned Node.js process...');
  
  const testScript = `
    import axios from 'axios';
    
    const API_KEY = '${API_KEY}';
    
    async function testInSpawnedProcess() {
      try {
        console.log('🔧 Making HTTP request from spawned process...');
        const response = await axios.get('https://api.heyreach.io/api/public/auth/CheckApiKey', {
          headers: {
            'X-API-KEY': API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 30000,
        });
        console.log('✅ Spawned process HTTP request successful:', response.status);
        process.exit(0);
      } catch (error) {
        console.log('❌ Spawned process HTTP request failed:', error.response?.status, error.message);
        process.exit(1);
      }
    }
    
    testInSpawnedProcess();
  `;

  return new Promise((resolve) => {
    const child = spawn('node', ['--input-type=module', '-e', testScript], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log('SPAWNED STDOUT:', text.trim());
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      console.log('SPAWNED STDERR:', text.trim());
    });

    child.on('close', (code) => {
      console.log(`\n📊 Spawned process exited with code: ${code}`);
      if (code === 0) {
        console.log('✅ Spawned process HTTP request succeeded');
      } else {
        console.log('❌ Spawned process HTTP request failed');
      }
      resolve();
    });

    child.on('error', (error) => {
      console.log('❌ Spawned process error:', error.message);
      resolve();
    });
  });
}

testProcessEnvironment().catch(console.error);

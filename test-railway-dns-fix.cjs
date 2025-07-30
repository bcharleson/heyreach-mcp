#!/usr/bin/env node

// Test script to verify DNS rebinding protection fix for Railway deployment
const { spawn } = require('child_process');
const http = require('http');

console.log('🧪 Testing HeyReach MCP Server DNS Rebinding Protection Fix\n');

// Test configuration
const testConfig = {
  port: 3001,
  allowedHosts: 'heyreach-mcp-production.up.railway.app,localhost:3001,127.0.0.1:3001,localhost,127.0.0.1',
  enableDnsRebindingProtection: 'true',
  apiKey: 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M='
};

console.log('📋 Test Configuration:');
console.log(`  Port: ${testConfig.port}`);
console.log(`  Allowed Hosts: ${testConfig.allowedHosts}`);
console.log(`  DNS Rebinding Protection: ${testConfig.enableDnsRebindingProtection}`);
console.log('');

// Start the server with Railway-like environment
console.log('🚀 Starting HeyReach MCP Server with Railway configuration...');

const serverProcess = spawn('npm', ['run', 'start:http'], {
  env: {
    ...process.env,
    PORT: testConfig.port,
    ALLOWED_HOSTS: testConfig.allowedHosts,
    ENABLE_DNS_REBINDING_PROTECTION: testConfig.enableDnsRebindingProtection,
    NODE_ENV: 'production'
  },
  stdio: 'pipe'
});

let serverReady = false;

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('Server:', output.trim());
  
  if (output.includes('Server running on port') || output.includes('listening on port')) {
    serverReady = true;
    setTimeout(runTests, 2000); // Wait 2 seconds for server to be fully ready
  }
});

serverProcess.stderr.on('data', (data) => {
  console.error('Server Error:', data.toString().trim());
});

// Test functions
async function runTests() {
  console.log('\n🧪 Running DNS Rebinding Protection Tests...\n');
  
  // Test 1: localhost (should work)
  await testEndpoint('localhost', testConfig.port, 'localhost (should work)');
  
  // Test 2: 127.0.0.1 (should work)
  await testEndpoint('127.0.0.1', testConfig.port, '127.0.0.1 (should work)');
  
  // Test 3: Railway domain via Host header (should work with fix)
  await testEndpointWithHost('localhost', testConfig.port, 'heyreach-mcp-production.up.railway.app', 'Railway domain via Host header (should work with fix)');
  
  // Test 4: Unauthorized domain (should be blocked)
  await testEndpointWithHost('localhost', testConfig.port, 'evil.example.com', 'Unauthorized domain (should be blocked)');
  
  console.log('\n🏁 Tests completed!');
  
  // Cleanup
  serverProcess.kill();
  process.exit(0);
}

async function testEndpoint(host, port, description) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-03-26',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
      }
    });

    const options = {
      hostname: host,
      port: port,
      path: '/mcp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'X-API-Key': testConfig.apiKey,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`Testing: ${description}`);
    console.log(`  URL: http://${host}:${port}/mcp`);

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`  Status: ${res.statusCode}`);
        console.log(`  Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
        
        if (res.statusCode === 200) {
          console.log('  Result: ✅ SUCCESS - Server accepted request');
        } else if (data.includes('Invalid Host header')) {
          console.log('  Result: ❌ BLOCKED - DNS rebinding protection active');
        } else {
          console.log('  Result: ⚠️ OTHER - Unexpected response');
        }
        console.log('');
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`  Result: ❌ ERROR - ${err.message}`);
      console.log('');
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

async function testEndpointWithHost(actualHost, port, hostHeader, description) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-03-26',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
      }
    });

    const options = {
      hostname: actualHost,
      port: port,
      path: '/mcp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Host': hostHeader, // This simulates the Railway domain
        'X-API-Key': testConfig.apiKey,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`Testing: ${description}`);
    console.log(`  URL: http://${actualHost}:${port}/mcp`);
    console.log(`  Host Header: ${hostHeader}`);

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`  Status: ${res.statusCode}`);
        console.log(`  Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
        
        if (res.statusCode === 200) {
          console.log('  Result: ✅ SUCCESS - Server accepted request');
        } else if (data.includes('Invalid Host header')) {
          console.log('  Result: ❌ BLOCKED - DNS rebinding protection active');
        } else {
          console.log('  Result: ⚠️ OTHER - Unexpected response');
        }
        console.log('');
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`  Result: ❌ ERROR - ${err.message}`);
      console.log('');
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping server...');
  serverProcess.kill();
  process.exit(0);
});

// Timeout after 30 seconds
setTimeout(() => {
  console.log('\n⏰ Test timeout - stopping server...');
  serverProcess.kill();
  process.exit(1);
}, 30000);

#!/usr/bin/env node

/**
 * Debug Published Package Issues
 * Tests the published npm package with real API key
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

async function debugPublishedPackage() {
  console.log('🔍 HeyReach MCP Server v1.1.6 - Debug Published Package\n');

  // Test 1: Check if package can be installed and run
  console.log('📋 TEST 1: Package Installation and Basic Execution');
  try {
    console.log('Installing package globally...');
    execSync('npm install -g heyreach-mcp-server@1.1.6', { stdio: 'pipe' });
    console.log('✅ Package installed successfully');
    
    // Test basic execution
    console.log('Testing basic execution...');
    const result = execSync(`heyreach-mcp-server --api-key=${API_KEY} 2>&1 | head -5 || true`, { 
      encoding: 'utf8',
      timeout: 5000 
    });
    console.log('Basic execution result:', result);
    
  } catch (error) {
    console.log('❌ Package installation/execution failed:', error.message);
  }

  // Test 2: Test with npx (Claude Desktop method)
  console.log('\n📋 TEST 2: NPX Execution (Claude Desktop Method)');
  try {
    console.log('Testing npx execution...');
    const result = execSync(`timeout 5 npx heyreach-mcp-server@1.1.6 --api-key=${API_KEY} 2>&1 || echo "Timeout expected"`, { 
      encoding: 'utf8' 
    });
    console.log('NPX execution result:', result);
    
  } catch (error) {
    console.log('❌ NPX execution failed:', error.message);
  }

  // Test 3: Check package contents
  console.log('\n📋 TEST 3: Package Contents Analysis');
  try {
    const packageInfo = execSync('npm view heyreach-mcp-server@1.1.6 --json', { encoding: 'utf8' });
    const info = JSON.parse(packageInfo);
    
    console.log('Package version:', info.version);
    console.log('Main entry:', info.main);
    console.log('Binary:', info.bin);
    console.log('Dependencies:', Object.keys(info.dependencies || {}));
    
    // Check if files are included
    console.log('Files included:', info.files);
    
  } catch (error) {
    console.log('❌ Package analysis failed:', error.message);
  }

  // Test 4: Test API key validation directly
  console.log('\n📋 TEST 4: Direct API Key Test');
  try {
    console.log('Testing API key with HeyReach API directly...');
    
    // Create a simple test script with correct endpoint and auth
    const testScript = `
import axios from 'axios';

async function testApiKey() {
  console.log('Testing with correct HeyReach API endpoint and auth method...');

  try {
    // Test 1: Check API key validation endpoint (correct endpoint)
    console.log('Test 1: API Key validation...');
    const response1 = await axios.get('https://api.heyreach.io/api/public/auth/CheckApiKey', {
      headers: {
        'X-API-KEY': '${API_KEY}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    console.log('✅ API Key validation works - Status:', response1.status);
    console.log('Response:', response1.data);
  } catch (error1) {
    console.log('❌ API Key validation failed');
    console.log('Status:', error1.response?.status);
    console.log('Message:', error1.response?.data?.message || error1.message);
  }

  try {
    // Test 2: Get campaigns endpoint (correct method and endpoint)
    console.log('\\nTest 2: Get campaigns...');
    const response2 = await axios.post('https://api.heyreach.io/api/public/campaign/GetAll', {
      offset: 0,
      limit: 10
    }, {
      headers: {
        'X-API-KEY': '${API_KEY}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    console.log('✅ Get campaigns works - Status:', response2.status);
    console.log('Campaigns found:', response2.data?.data?.length || 0);
    if (response2.data?.data?.length > 0) {
      console.log('First campaign:', response2.data.data[0]);
    }
  } catch (error2) {
    console.log('❌ Get campaigns failed');
    console.log('Status:', error2.response?.status);
    console.log('Message:', error2.response?.data?.message || error2.message);
  }
}

testApiKey();
`;
    
    writeFileSync('./test-api-key.mjs', testScript);
    const apiResult = execSync('node test-api-key.mjs', { encoding: 'utf8' });
    console.log('API test result:', apiResult);
    
  } catch (error) {
    console.log('❌ Direct API test failed:', error.message);
  }

  // Test 5: Check for specific error patterns
  console.log('\n📋 TEST 5: Error Pattern Analysis');
  try {
    console.log('Testing specific tools that are failing...');
    
    // Test check-api-key tool specifically
    console.log('Testing check-api-key tool...');
    const checkKeyResult = execSync(`echo '{"method": "tools/call", "params": {"name": "check-api-key", "arguments": {}}}' | npx heyreach-mcp-server@1.1.6 --api-key=${API_KEY} 2>&1 | head -10 || true`, { 
      encoding: 'utf8',
      timeout: 10000
    });
    console.log('check-api-key result:', checkKeyResult);
    
  } catch (error) {
    console.log('❌ Error pattern analysis failed:', error.message);
  }

  // Test 6: Check Claude Desktop configuration format
  console.log('\n📋 TEST 6: Claude Desktop Configuration Validation');
  
  const claudeConfig = {
    "mcpServers": {
      "heyreach": {
        "command": "npx",
        "args": [
          "heyreach-mcp-server@1.1.6",
          `--api-key=${API_KEY}`
        ]
      }
    }
  };
  
  console.log('Recommended Claude Desktop configuration:');
  console.log(JSON.stringify(claudeConfig, null, 2));
  
  // Test 7: Version comparison
  console.log('\n📋 TEST 7: Version Comparison');
  try {
    const latestVersion = execSync('npm view heyreach-mcp-server version', { encoding: 'utf8' }).trim();
    console.log('Latest published version:', latestVersion);
    
    if (latestVersion !== '1.1.6') {
      console.log('⚠️  Warning: Latest version is not 1.1.6');
    } else {
      console.log('✅ Version 1.1.6 is the latest');
    }
    
  } catch (error) {
    console.log('❌ Version check failed:', error.message);
  }

  console.log('\n🎯 DEBUG SUMMARY');
  console.log('================');
  console.log('1. Check if package installation works');
  console.log('2. Verify API key format and authentication');
  console.log('3. Test Claude Desktop configuration');
  console.log('4. Identify specific error patterns');
  console.log('\n💡 Next steps based on results above...');
}

// Run debug
debugPublishedPackage().catch(console.error);

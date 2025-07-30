#!/usr/bin/env node

/**
 * Detailed API Key Test
 * Compare direct API calls vs MCP server calls
 */

import { HeyReachClient } from './dist/heyreach-client.js';
import axios from 'axios';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

async function testApiKeyDetailed() {
  console.log('🔍 Detailed API Key Test\n');

  // Test 1: Direct axios call (like our debug script)
  console.log('📋 TEST 1: Direct Axios Call');
  try {
    const response = await axios.get('https://api.heyreach.io/api/public/auth/CheckApiKey', {
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    console.log('✅ Direct axios call works');
    console.log('   Status:', response.status);
    console.log('   Data:', response.data);
  } catch (error) {
    console.log('❌ Direct axios call failed');
    console.log('   Status:', error.response?.status);
    console.log('   Message:', error.response?.data?.message || error.message);
  }

  // Test 2: HeyReach client call
  console.log('\n📋 TEST 2: HeyReach Client Call');
  try {
    const client = new HeyReachClient({ apiKey: API_KEY });
    const result = await client.checkApiKey();
    console.log('✅ HeyReach client call works');
    console.log('   Success:', result.success);
    console.log('   Data:', result.data);
    console.log('   Message:', result.message);
  } catch (error) {
    console.log('❌ HeyReach client call failed');
    console.log('   Error:', error.message);
    console.log('   Stack:', error.stack);
  }

  // Test 3: Check client configuration
  console.log('\n📋 TEST 3: Client Configuration Check');
  try {
    const client = new HeyReachClient({ apiKey: API_KEY });
    console.log('Client created successfully');
    
    // Check the axios instance configuration
    console.log('Base URL:', client.client.defaults.baseURL);
    console.log('Headers:', client.client.defaults.headers);
    
    // Test a simple request to see what happens
    console.log('\nTesting direct client request...');
    const response = await client.client.get('/auth/CheckApiKey');
    console.log('✅ Direct client request works');
    console.log('   Status:', response.status);
    console.log('   Data:', response.data);
    
  } catch (error) {
    console.log('❌ Client configuration test failed');
    console.log('   Error:', error.message);
    console.log('   Response status:', error.response?.status);
    console.log('   Response data:', error.response?.data);
    console.log('   Request headers:', error.config?.headers);
  }

  // Test 4: Compare headers
  console.log('\n📋 TEST 4: Header Comparison');
  
  console.log('Direct axios headers:');
  console.log({
    'X-API-KEY': API_KEY,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });
  
  const client = new HeyReachClient({ apiKey: API_KEY });
  console.log('\nHeyReach client headers:');
  console.log(client.client.defaults.headers);

  // Test 5: Test with different API key formats
  console.log('\n📋 TEST 5: API Key Format Test');
  
  console.log('Original API key length:', API_KEY.length);
  console.log('API key starts with:', API_KEY.substring(0, 10) + '...');
  console.log('API key ends with:', '...' + API_KEY.substring(API_KEY.length - 10));
  console.log('Contains base64 chars:', /^[A-Za-z0-9+/=]+$/.test(API_KEY));
}

// Run the test
testApiKeyDetailed().catch(console.error);

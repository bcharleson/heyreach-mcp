#!/usr/bin/env node

/**
 * Debug Authentication Flow
 * Compare direct API calls vs MCP server calls to identify the difference
 */

import axios from 'axios';
import { HeyReachClient } from './dist/heyreach-client.js';

async function debugAuthFlow() {
  console.log('🔍 Debugging Authentication Flow\n');

  const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';
  const BASE_URL = 'https://api.heyreach.io/api/public';

  // Test 1: Direct axios call (we know this works)
  console.log('📋 TEST 1: Direct Axios Call');
  try {
    const response = await axios.get(`${BASE_URL}/auth/CheckApiKey`, {
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    console.log('✅ Direct axios call works');
    console.log('   Status:', response.status);
    console.log('   Headers sent:', {
      'X-API-KEY': API_KEY.substring(0, 8) + '...',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  } catch (error) {
    console.log('❌ Direct axios call failed');
    console.log('   Status:', error.response?.status);
    console.log('   Message:', error.response?.data?.message || error.message);
  }

  // Test 2: HeyReachClient call (this should work too)
  console.log('\n📋 TEST 2: HeyReachClient Call');
  try {
    const client = new HeyReachClient({
      apiKey: API_KEY,
      baseUrl: BASE_URL
    });
    
    const result = await client.checkApiKey();
    console.log('✅ HeyReachClient call works');
    console.log('   Success:', result.success);
    console.log('   Data:', result.data);
    console.log('   Message:', result.message);
  } catch (error) {
    console.log('❌ HeyReachClient call failed');
    console.log('   Error:', error.message);
    console.log('   Stack:', error.stack);
  }

  // Test 3: Check what headers HeyReachClient is actually sending
  console.log('\n📋 TEST 3: Inspect HeyReachClient Headers');
  try {
    // Create a client and inspect its configuration
    const client = new HeyReachClient({
      apiKey: API_KEY,
      baseUrl: BASE_URL
    });
    
    // Access the private client property to inspect headers
    console.log('   Client base URL:', client.client?.defaults?.baseURL);
    console.log('   Client headers:', {
      ...client.client?.defaults?.headers,
      'X-API-KEY': API_KEY.substring(0, 8) + '...'
    });
    
  } catch (error) {
    console.log('❌ Could not inspect client configuration');
    console.log('   Error:', error.message);
  }
}

debugAuthFlow().catch(console.error);

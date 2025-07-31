#!/usr/bin/env node

/**
 * Test Isolated HTTP Direct
 * Test the isolated HTTP wrapper directly (not through MCP server)
 */

import { executeIsolatedHttpRequest } from './dist/http-isolation-wrapper.js';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

async function testIsolatedHttpDirect() {
  console.log('🔍 Testing Isolated HTTP Request Directly\n');

  try {
    console.log('Making isolated HTTP request...');
    
    const result = await executeIsolatedHttpRequest({
      url: 'https://api.heyreach.io/api/public/auth/CheckApiKey',
      method: 'GET',
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000
    });

    console.log('📊 Result:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✅ Isolated HTTP request successful!');
    } else {
      console.log('❌ Isolated HTTP request failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Error testing isolated HTTP:', error);
  }
}

testIsolatedHttpDirect().catch(console.error);

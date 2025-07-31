#!/usr/bin/env node

/**
 * Test Simple HTTP Client Direct
 * Test the simple HTTP client directly
 */

import { makeSimpleHttpRequest } from './dist/simple-http-client.js';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

async function testSimpleHttpDirect() {
  console.log('🔍 Testing Simple HTTP Client Directly\n');

  try {
    console.log('Making simple HTTP request...');
    
    const result = await makeSimpleHttpRequest({
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
      console.log('✅ Simple HTTP request successful!');
    } else {
      console.log('❌ Simple HTTP request failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Error testing simple HTTP:', error);
  }
}

testSimpleHttpDirect().catch(console.error);

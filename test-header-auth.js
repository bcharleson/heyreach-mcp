#!/usr/bin/env node

/**
 * Test script for header authentication
 */

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';
const BASE_URL = 'https://heyreach-mcp-production.up.railway.app';

async function testHeaderAuth() {
  console.log('🧪 Testing Header Authentication...\n');

  // Test 1: X-API-Key header
  console.log('1️⃣ Testing X-API-Key header...');
  try {
    const response = await fetch(`${BASE_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {}
      })
    });

    const result = await response.json();
    console.log('✅ X-API-Key header test:', response.status, result.success ? 'SUCCESS' : 'FAILED');
    if (result.error) {
      console.log('❌ Error:', result.error);
    }
  } catch (error) {
    console.log('❌ X-API-Key header test failed:', error.message);
  }

  console.log('');

  // Test 2: Authorization Bearer header
  console.log('2️⃣ Testing Authorization Bearer header...');
  try {
    const response = await fetch(`${BASE_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {}
      })
    });

    const result = await response.json();
    console.log('✅ Authorization Bearer header test:', response.status, result.success ? 'SUCCESS' : 'FAILED');
    if (result.error) {
      console.log('❌ Error:', result.error);
    }
  } catch (error) {
    console.log('❌ Authorization Bearer header test failed:', error.message);
  }

  console.log('');

  // Test 3: URL path authentication (existing method)
  console.log('3️⃣ Testing URL path authentication...');
  try {
    const response = await fetch(`${BASE_URL}/mcp/${encodeURIComponent(API_KEY)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {}
      })
    });

    const result = await response.json();
    console.log('✅ URL path authentication test:', response.status, result.success ? 'SUCCESS' : 'FAILED');
    if (result.error) {
      console.log('❌ Error:', result.error);
    }
  } catch (error) {
    console.log('❌ URL path authentication test failed:', error.message);
  }

  console.log('\n🎉 Header authentication tests completed!');
}

// Run the test
testHeaderAuth().catch(console.error); 
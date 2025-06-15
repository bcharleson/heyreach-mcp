#!/usr/bin/env node

/**
 * Test a potential fix for the empty response issue
 */

import axios from 'axios';

async function testEmptyResponseFix() {
  console.log('🔍 Testing Empty Response Handling...\n');

  const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';
  const BASE_URL = 'https://api.heyreach.io/api/public';

  // Create axios client similar to HeyReachClient
  const client = axios.create({
    baseURL: BASE_URL,
    headers: {
      'X-API-KEY': API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 30000,
  });

  // Test the current implementation
  console.log('📋 TEST 1: Current Implementation');
  try {
    const response = await client.get('/auth/CheckApiKey');
    console.log('✅ API call successful');
    console.log('   Status:', response.status);
    console.log('   Data:', response.data);
    console.log('   Data type:', typeof response.data);
    console.log('   Data === "":', response.data === '');
    
    // This is what the current checkApiKey method returns
    const result = {
      success: true,
      data: response.status === 200,
      message: `API key is valid (Status: ${response.status})`
    };
    console.log('   Current result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.log('❌ API call failed');
    console.log('   Error:', error.message);
    console.log('   Status:', error.response?.status);
  }

  // Test with response interceptor that might be causing issues
  console.log('\n📋 TEST 2: With Response Interceptor');
  const clientWithInterceptor = axios.create({
    baseURL: BASE_URL,
    headers: {
      'X-API-KEY': API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 30000,
  });

  // Add the same interceptor as HeyReachClient
  clientWithInterceptor.interceptors.response.use(
    (response) => {
      console.log('   📥 Interceptor - Success response:', response.status);
      return response;
    },
    (error) => {
      console.log('   📥 Interceptor - Error response:', error.message);
      throw error;
    }
  );

  try {
    const response = await clientWithInterceptor.get('/auth/CheckApiKey');
    console.log('✅ API call with interceptor successful');
    console.log('   Status:', response.status);
    console.log('   Data:', response.data);
    
  } catch (error) {
    console.log('❌ API call with interceptor failed');
    console.log('   Error:', error.message);
  }

  // Test potential issue with empty string handling
  console.log('\n📋 TEST 3: Empty String Handling');
  const emptyData = '';
  console.log('   Empty string truthy?', !!emptyData);
  console.log('   Empty string === ""?', emptyData === '');
  console.log('   Empty string length:', emptyData.length);
  
  // Test if this could cause JSON parsing issues
  try {
    const parsed = JSON.parse(emptyData || '{}');
    console.log('   Parsed empty string:', parsed);
  } catch (error) {
    console.log('   JSON parse error:', error.message);
  }

  console.log('\n🎯 Conclusion:');
  console.log('The HeyReach API returns an empty response body (content-length: 0)');
  console.log('This should not cause authentication failures if handled correctly');
  console.log('The issue might be in the MCP server tool execution or error handling');
}

testEmptyResponseFix().catch(console.error);

#!/usr/bin/env node

/**
 * Test Axios POST to campaigns endpoint
 * Compare with working curl request
 */

import axios from 'axios';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

async function testAxiosPostCampaigns() {
  console.log('🔍 Testing Axios POST to /campaign/GetAll\n');

  // Test 1: Basic Axios POST request
  console.log('1. Testing basic Axios POST request...');
  try {
    const response = await axios.post('https://api.heyreach.io/api/public/campaign/GetAll', {}, {
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });
    console.log('✅ Basic Axios POST successful:', response.status);
    console.log('📊 Response data length:', JSON.stringify(response.data).length);
  } catch (error) {
    console.log('❌ Basic Axios POST failed:', error.code, error.message);
    if (error.response) {
      console.log('   Response status:', error.response.status);
      console.log('   Response data:', error.response.data);
    }
  }

  // Test 2: Axios with HeyReachClient-style configuration
  console.log('\n2. Testing Axios with HeyReachClient config...');
  try {
    const client = axios.create({
      baseURL: 'https://api.heyreach.io/api/public',
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });

    // Add response interceptor (like HeyReachClient)
    client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.log('🔍 Interceptor caught error:', error.code, error.message);
        if (error.response) {
          throw new Error(`HeyReach API Error: ${error.response.status} - ${error.response.data?.message || error.message}`);
        } else if (error.request) {
          throw new Error('HeyReach API Error: No response received');
        } else {
          throw new Error(`HeyReach API Error: ${error.message}`);
        }
      }
    );

    const response = await client.post('/campaign/GetAll', {});
    console.log('✅ HeyReachClient-style POST successful:', response.status);
    console.log('📊 Response data length:', JSON.stringify(response.data).length);
  } catch (error) {
    console.log('❌ HeyReachClient-style POST failed:', error.message);
  }

  // Test 3: Axios with longer timeout
  console.log('\n3. Testing Axios with longer timeout...');
  try {
    const response = await axios.post('https://api.heyreach.io/api/public/campaign/GetAll', {}, {
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 60000, // 60 seconds
    });
    console.log('✅ Long timeout Axios POST successful:', response.status);
    console.log('📊 Response data length:', JSON.stringify(response.data).length);
  } catch (error) {
    console.log('❌ Long timeout Axios POST failed:', error.code, error.message);
  }
}

testAxiosPostCampaigns().catch(console.error);

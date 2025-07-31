#!/usr/bin/env node

/**
 * Test Axios vs Curl
 * Compare the exact requests being made
 */

import axios from 'axios';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

async function testAxiosVsCurl() {
  console.log('🔍 Testing Axios vs Curl Request Differences\n');

  // Test 1: Basic Axios request (similar to HeyReachClient)
  console.log('1. Testing basic Axios request...');
  try {
    const response = await axios.get('https://api.heyreach.io/api/public/auth/CheckApiKey', {
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });
    console.log('✅ Basic Axios request successful:', response.status);
  } catch (error) {
    console.log('❌ Basic Axios request failed:', error.response?.status, error.response?.data || error.message);
  }

  // Test 2: Axios with exact HeyReachClient configuration
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
        if (error.response) {
          throw new Error(`HeyReach API Error: ${error.response.status} - ${error.response.data?.message || error.message}`);
        } else if (error.request) {
          throw new Error('HeyReach API Error: No response received');
        } else {
          throw new Error(`HeyReach API Error: ${error.message}`);
        }
      }
    );

    const response = await client.get('/auth/CheckApiKey');
    console.log('✅ HeyReachClient-style Axios request successful:', response.status);
  } catch (error) {
    console.log('❌ HeyReachClient-style Axios request failed:', error.message);
  }

  // Test 3: Axios with request logging
  console.log('\n3. Testing Axios with request logging...');
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

    // Add request interceptor for logging
    client.interceptors.request.use(
      (config) => {
        console.log('📤 Request details:');
        console.log('  URL:', config.baseURL + config.url);
        console.log('  Method:', config.method?.toUpperCase());
        console.log('  Headers:', JSON.stringify(config.headers, null, 2));
        return config;
      },
      (error) => Promise.reject(error)
    );

    const response = await client.get('/auth/CheckApiKey');
    console.log('✅ Logged Axios request successful:', response.status);
  } catch (error) {
    console.log('❌ Logged Axios request failed:', error.response?.status, error.response?.data || error.message);
  }
}

testAxiosVsCurl().catch(console.error);

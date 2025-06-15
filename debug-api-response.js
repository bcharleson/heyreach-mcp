#!/usr/bin/env node

/**
 * Debug the exact API response to understand why authentication fails in MCP but works directly
 */

import axios from 'axios';
import { HeyReachClient } from './dist/heyreach-client.js';

async function debugApiResponse() {
  console.log('🔍 Debugging API Response Details...\n');

  const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';
  const BASE_URL = 'https://api.heyreach.io/api/public';

  // Test 1: Raw axios call (exactly like our working test)
  console.log('📋 TEST 1: Raw Axios Call');
  try {
    const response = await axios.get(`${BASE_URL}/auth/CheckApiKey`, {
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    console.log('✅ Raw axios call success');
    console.log('   Status:', response.status);
    console.log('   Headers:', JSON.stringify(response.headers, null, 2));
    console.log('   Data:', JSON.stringify(response.data, null, 2));
    console.log('   Data type:', typeof response.data);
    console.log('   Data is empty?', response.data === '' || response.data === null || response.data === undefined);
  } catch (error) {
    console.log('❌ Raw axios call failed');
    console.log('   Status:', error.response?.status);
    console.log('   Data:', error.response?.data);
    console.log('   Message:', error.message);
  }

  // Test 2: HeyReach client call with detailed logging
  console.log('\n📋 TEST 2: HeyReach Client Call with Logging');
  try {
    const client = new HeyReachClient({ apiKey: API_KEY });
    
    // Add request interceptor to log what's being sent
    client.client.interceptors.request.use(
      (config) => {
        console.log('📤 Request Config:');
        console.log('   URL:', config.url);
        console.log('   Method:', config.method);
        console.log('   Headers:', JSON.stringify(config.headers, null, 2));
        console.log('   Base URL:', config.baseURL);
        return config;
      },
      (error) => {
        console.log('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor to log what's being received
    client.client.interceptors.response.use(
      (response) => {
        console.log('📥 Response Received:');
        console.log('   Status:', response.status);
        console.log('   Headers:', JSON.stringify(response.headers, null, 2));
        console.log('   Data:', JSON.stringify(response.data, null, 2));
        console.log('   Data type:', typeof response.data);
        return response;
      },
      (error) => {
        console.log('❌ Response Error:');
        console.log('   Status:', error.response?.status);
        console.log('   Data:', error.response?.data);
        console.log('   Message:', error.message);
        console.log('   Error type:', error.constructor.name);
        return Promise.reject(error);
      }
    );

    const result = await client.checkApiKey();
    console.log('✅ HeyReach client call success');
    console.log('   Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ HeyReach client call failed');
    console.log('   Error message:', error.message);
    console.log('   Error type:', error.constructor.name);
    console.log('   Stack:', error.stack);
  }

  // Test 3: Check if the API returns empty response
  console.log('\n📋 TEST 3: Check API Response Content');
  try {
    const response = await axios.get(`${BASE_URL}/auth/CheckApiKey`, {
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Response analysis:');
    console.log('   Status code:', response.status);
    console.log('   Status text:', response.statusText);
    console.log('   Data:', response.data);
    console.log('   Data === "":', response.data === '');
    console.log('   Data === null:', response.data === null);
    console.log('   Data === undefined:', response.data === undefined);
    console.log('   Data length:', response.data?.length);
    console.log('   Response.status === 200:', response.status === 200);
    
    // This is what the checkApiKey method does
    const apiKeyValid = response.status === 200;
    console.log('   API key would be considered valid:', apiKeyValid);
    
  } catch (error) {
    console.log('❌ API response check failed');
    console.log('   Error:', error.message);
  }

  console.log('\n🎯 Analysis:');
  console.log('This test will help identify if:');
  console.log('1. The API returns different responses in different contexts');
  console.log('2. There are timing or network issues');
  console.log('3. The axios interceptors are causing problems');
  console.log('4. The error handling logic is incorrect');
}

debugApiResponse().catch(console.error);

#!/usr/bin/env node

/**
 * Debug HeyReach API authentication
 */

import axios from 'axios';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';
const BASE_URL = 'https://api.heyreach.io/api/public';

async function debugAPI() {
  console.log('🔍 Debugging HeyReach API Authentication...\n');

  const client = axios.create({
    baseURL: BASE_URL,
    headers: {
      'X-API-KEY': API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 30000,
  });

  // Test 1: Check API Key endpoint
  console.log('1️⃣ Testing CheckApiKey endpoint...');
  try {
    const response = await client.get('/auth/CheckApiKey');
    console.log('✅ CheckApiKey Success:', response.status, response.data);
  } catch (error) {
    console.log('❌ CheckApiKey Error:', error.response?.status, error.response?.data || error.message);
  }

  // Test 2: Try different authentication headers
  console.log('\n2️⃣ Testing with different header formats...');
  
  // Test with Authorization header
  try {
    const response = await axios.get(`${BASE_URL}/auth/CheckApiKey`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      }
    });
    console.log('✅ Bearer Auth Success:', response.status, response.data);
  } catch (error) {
    console.log('❌ Bearer Auth Error:', error.response?.status, error.response?.data || error.message);
  }

  // Test with API-KEY header (different format)
  try {
    const response = await axios.get(`${BASE_URL}/auth/CheckApiKey`, {
      headers: {
        'API-KEY': API_KEY,
        'Content-Type': 'application/json',
      }
    });
    console.log('✅ API-KEY Success:', response.status, response.data);
  } catch (error) {
    console.log('❌ API-KEY Error:', error.response?.status, error.response?.data || error.message);
  }

  // Test 3: Try campaigns endpoint directly
  console.log('\n3️⃣ Testing campaigns endpoint...');
  try {
    const response = await client.post('/campaign/GetAll', {});
    console.log('✅ Campaigns Success:', response.status, response.data);
  } catch (error) {
    console.log('❌ Campaigns Error:', error.response?.status, error.response?.data || error.message);
  }

  // Test 4: Try GET campaigns
  console.log('\n4️⃣ Testing GET campaigns...');
  try {
    const response = await client.get('/campaigns');
    console.log('✅ GET Campaigns Success:', response.status, response.data);
  } catch (error) {
    console.log('❌ GET Campaigns Error:', error.response?.status, error.response?.data || error.message);
  }

  // Test 5: Check if API key format is correct
  console.log('\n5️⃣ API Key Analysis:');
  console.log('API Key Length:', API_KEY.length);
  console.log('API Key Format:', API_KEY.slice(0, 10) + '...' + API_KEY.slice(-5));
  console.log('Contains Base64 chars:', /^[A-Za-z0-9+/=]+$/.test(API_KEY));
}

debugAPI().catch(console.error);

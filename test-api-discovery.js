#!/usr/bin/env node

/**
 * HeyReach API Discovery Script
 * Discovers actual working endpoints and parameter structures
 */

import axios from 'axios';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';
const BASE_URL = 'https://api.heyreach.io/api/public';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-API-KEY': API_KEY,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

async function testEndpoint(name, method, endpoint, data = null) {
  console.log(`\n🧪 Testing ${name}...`);
  console.log(`   ${method} ${endpoint}`);
  
  try {
    let response;
    if (method === 'GET') {
      response = await client.get(endpoint);
    } else if (method === 'POST') {
      response = await client.post(endpoint, data);
    }
    
    console.log(`   ✅ SUCCESS: ${response.status}`);
    if (response.data) {
      const dataStr = JSON.stringify(response.data, null, 2);
      console.log(`   📊 Response structure:`);
      console.log(`   ${dataStr.substring(0, 500)}${dataStr.length > 500 ? '...' : ''}`);
    }
    
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.response?.status || 'Network Error'}`);
    console.log(`   💬 Error: ${error.response?.data?.message || error.message}`);
    return { success: false, error: error.message };
  }
}

async function discoverWorkingEndpoints() {
  console.log('🔍 HeyReach API Discovery - Finding Working Endpoints\n');

  // Test working endpoints we know about
  console.log('=== CONFIRMED WORKING ENDPOINTS ===');
  
  await testEndpoint(
    'check-api-key',
    'GET',
    '/auth/CheckApiKey'
  );

  const conversationsResult = await testEndpoint(
    'get-conversations',
    'POST',
    '/inbox/GetConversationsV2',
    {
      filters: {
        linkedInAccountIds: [],
        campaignIds: []
      },
      offset: 0,
      limit: 5
    }
  );

  await testEndpoint(
    'get-overall-stats',
    'POST',
    '/stats/GetOverallStats',
    {
      accountIds: [],
      campaignIds: [],
      startDate: "2024-01-01T00:00:00.000Z",
      endDate: "2024-12-31T23:59:59.999Z"
    }
  );

  // Try different campaign endpoint variations
  console.log('\n=== TESTING CAMPAIGN ENDPOINT VARIATIONS ===');
  
  // Try with empty body
  await testEndpoint(
    'get-all-campaigns-empty',
    'POST',
    '/campaign/GetAll',
    {}
  );

  // Try with minimal parameters
  await testEndpoint(
    'get-all-campaigns-minimal',
    'POST',
    '/campaign/GetAll',
    {
      offset: 0,
      limit: 10
    }
  );

  // Try different campaign endpoints
  await testEndpoint(
    'get-campaign-by-id-alt',
    'POST',
    '/campaign/GetById',
    { campaignId: 1 }
  );

  // Test lead endpoints
  console.log('\n=== TESTING LEAD ENDPOINT VARIATIONS ===');
  
  await testEndpoint(
    'get-lead-alt',
    'POST',
    '/lead/GetLead',
    {
      profileUrl: "https://www.linkedin.com/in/williamhgates"
    }
  );

  // Test list endpoints (might be the key)
  console.log('\n=== TESTING LIST ENDPOINTS ===');
  
  await testEndpoint(
    'get-all-lists',
    'POST',
    '/list/GetAll',
    {
      offset: 0,
      limit: 10
    }
  );

  await testEndpoint(
    'create-empty-list',
    'POST',
    '/list/CreateEmptyList',
    {
      name: "Test List",
      type: "USER_LIST"
    }
  );

  // Test LinkedIn account endpoints
  console.log('\n=== TESTING LINKEDIN ACCOUNT ENDPOINTS ===');
  
  await testEndpoint(
    'get-linkedin-accounts',
    'POST',
    '/linkedinaccount/GetAll',
    {}
  );

  // Test webhook endpoints
  console.log('\n=== TESTING WEBHOOK ENDPOINTS ===');
  
  await testEndpoint(
    'get-all-webhooks',
    'GET',
    '/webhooks/GetAllWebhooks'
  );

  // Test MyNetwork endpoints
  console.log('\n=== TESTING MYNETWORK ENDPOINTS ===');
  
  await testEndpoint(
    'get-my-network',
    'POST',
    '/MyNetwork/GetMyNetworkForSender',
    {
      pageNumber: 0,
      pageSize: 10,
      senderId: 1
    }
  );

  console.log('\n🎯 DISCOVERY COMPLETE');
  console.log('Focus on implementing only the working endpoints found above.');
}

discoverWorkingEndpoints().catch(console.error);

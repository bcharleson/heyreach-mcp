#!/usr/bin/env node

/**
 * HeyReach API Validation Script
 * Tests each endpoint against real API to identify working vs broken tools
 * Based on Instantly MCP learnings - API-first validation approach
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

// Test results tracking
const results = {
  working: [],
  failing: [],
  total: 0
};

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
    console.log(`   📊 Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
    
    results.working.push({
      name,
      method,
      endpoint,
      status: response.status,
      hasData: !!response.data
    });
    
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.response?.status || 'Network Error'}`);
    console.log(`   💬 Error: ${error.response?.data?.message || error.message}`);
    
    results.failing.push({
      name,
      method,
      endpoint,
      error: error.response?.status || 'Network Error',
      message: error.response?.data?.message || error.message
    });
    
    return { success: false, error: error.message };
  }
}

async function runValidationTests() {
  console.log('🚀 HeyReach API Validation - Based on Instantly MCP Learnings\n');
  console.log('Testing endpoints against real API documentation...\n');

  // Test 1: API Key Validation (SHOULD WORK)
  await testEndpoint(
    'check-api-key',
    'GET',
    '/auth/CheckApiKey'
  );

  // Test 2: Get All Campaigns (SHOULD WORK)
  await testEndpoint(
    'get-all-campaigns',
    'POST',
    '/campaign/GetAll',
    { offset: 0, limit: 10 }
  );

  // Test 3: Get Campaign By ID (SHOULD WORK - but need real campaign ID)
  await testEndpoint(
    'get-campaign-details',
    'GET',
    '/campaign/GetById?campaignId=1'
  );

  // Test 4: Campaign Pause (SHOULD WORK - but need real campaign ID)
  await testEndpoint(
    'pause-campaign',
    'POST',
    '/campaign/Pause?campaignId=1'
  );

  // Test 5: Campaign Resume (SHOULD WORK - but need real campaign ID)  
  await testEndpoint(
    'resume-campaign',
    'POST',
    '/campaign/Resume?campaignId=1'
  );

  // Test 6: Add Leads to Campaign V2 (SHOULD WORK - but need proper structure)
  await testEndpoint(
    'add-leads-to-campaign',
    'POST',
    '/campaign/AddLeadsToCampaignV2',
    {
      campaignId: 1,
      accountLeadPairs: [{
        linkedInAccountId: 123,
        lead: {
          firstName: "Test",
          lastName: "User",
          profileUrl: "https://www.linkedin.com/in/test-user"
        }
      }]
    }
  );

  // Test 7: Get Leads from Campaign (SHOULD WORK)
  await testEndpoint(
    'get-campaign-leads',
    'POST',
    '/campaign/GetLeadsFromCampaign',
    {
      campaignId: 1,
      offset: 0,
      limit: 10
    }
  );

  // Test 8: Get Conversations (SHOULD WORK)
  await testEndpoint(
    'get-conversations',
    'POST',
    '/inbox/GetConversationsV2',
    {
      filters: {
        linkedInAccountIds: [],
        campaignIds: []
      },
      offset: 0,
      limit: 10
    }
  );

  // Test 9: Get Lead Details (SHOULD WORK)
  await testEndpoint(
    'get-lead-details',
    'POST',
    '/lead/GetLead',
    {
      profileUrl: "https://www.linkedin.com/in/test-user"
    }
  );

  // Test 10: Get Overall Stats (SHOULD WORK)
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

  // BROKEN ENDPOINTS (These should fail - not in API docs)
  console.log('\n🔍 Testing endpoints that should NOT exist...\n');

  await testEndpoint(
    'create-campaign-BROKEN',
    'POST',
    '/campaign/Create',
    { name: "Test Campaign" }
  );

  await testEndpoint(
    'send-message-BROKEN',
    'POST',
    '/message/Send',
    { leadId: "123", message: "Test" }
  );

  await testEndpoint(
    'get-templates-BROKEN',
    'GET',
    '/templates/GetAll'
  );

  await testEndpoint(
    'social-action-BROKEN',
    'POST',
    '/social/Action',
    { action: "like", targetUrl: "https://linkedin.com/test" }
  );

  await testEndpoint(
    'campaign-metrics-BROKEN',
    'GET',
    '/analytics/campaign/1'
  );

  await testEndpoint(
    'update-lead-status-BROKEN',
    'POST',
    '/lead/UpdateStatus',
    { leadId: "123", status: "contacted" }
  );

  // Print Results Summary
  console.log('\n📊 VALIDATION RESULTS SUMMARY\n');
  console.log('='.repeat(50));
  
  results.total = results.working.length + results.failing.length;
  const successRate = ((results.working.length / results.total) * 100).toFixed(1);
  
  console.log(`✅ Working Endpoints: ${results.working.length}`);
  console.log(`❌ Failing Endpoints: ${results.failing.length}`);
  console.log(`📈 Success Rate: ${successRate}%`);
  
  console.log('\n✅ WORKING ENDPOINTS:');
  results.working.forEach(result => {
    console.log(`   • ${result.name} (${result.method} ${result.endpoint})`);
  });
  
  console.log('\n❌ FAILING ENDPOINTS:');
  results.failing.forEach(result => {
    console.log(`   • ${result.name} (${result.method} ${result.endpoint}) - ${result.error}`);
  });

  console.log('\n🎯 RECOMMENDATIONS:');
  console.log('1. Remove all failing endpoints from MCP server');
  console.log('2. Fix parameter structures for working endpoints');
  console.log('3. Add proper error handling with user guidance');
  console.log('4. Update tool descriptions with prerequisites');
  console.log(`5. Target success rate: >75% (currently ${successRate}%)`);
}

runValidationTests().catch(console.error);

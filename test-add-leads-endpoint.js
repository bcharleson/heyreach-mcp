#!/usr/bin/env node

/**
 * Test the Add Leads to Campaign endpoint with correct structure
 * Based on Clay integration documentation and HeyReach API docs
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

async function testAddLeadsEndpoint() {
  console.log('🔍 Testing Add Leads to Campaign Endpoint - Clay Integration Structure\n');

  // First, get a valid campaign ID
  console.log('1. Getting valid campaign ID...');
  try {
    const campaignsResponse = await client.post('/campaign/GetAll', {});
    const campaigns = campaignsResponse.data?.items || [];
    
    if (campaigns.length === 0) {
      console.log('❌ No campaigns found. Cannot test add leads.');
      return;
    }

    const testCampaign = campaigns[0];
    console.log(`✅ Found campaign: ${testCampaign.name} (ID: ${testCampaign.id})`);

    // Test the AddLeadsToCampaignV2 endpoint with correct structure
    console.log('\n2. Testing AddLeadsToCampaignV2 with correct structure...');
    
    // Structure based on Clay documentation and HeyReach API docs
    const addLeadsPayload = {
      campaignId: testCampaign.id,
      accountLeadPairs: [
        {
          linkedInAccountId: null, // Optional - if null, auto-assigns to available sender
          lead: {
            firstName: "Test",
            lastName: "Lead",
            profileUrl: "https://www.linkedin.com/in/test-lead-" + Date.now(),
            location: "Test Location",
            summary: "Test Summary",
            companyName: "Test Company",
            position: "Test Position",
            about: "Test About",
            emailAddress: "test@example.com",
            customUserFields: [
              {
                name: "test_field",
                value: "test_value"
              }
            ]
          }
        }
      ]
    };

    console.log('Payload structure:');
    console.log(JSON.stringify(addLeadsPayload, null, 2));

    try {
      const addLeadsResponse = await client.post('/campaign/AddLeadsToCampaignV2', addLeadsPayload);
      console.log('\n✅ SUCCESS: AddLeadsToCampaignV2 endpoint works!');
      console.log('Response:', JSON.stringify(addLeadsResponse.data, null, 2));
      
      return { success: true, endpoint: '/campaign/AddLeadsToCampaignV2', data: addLeadsResponse.data };
    } catch (error) {
      console.log('\n❌ AddLeadsToCampaignV2 failed:');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data?.message || error.message);
    }

    // Also test the original AddLeadsToCampaign endpoint
    console.log('\n3. Testing original AddLeadsToCampaign endpoint...');
    try {
      const addLeadsResponse2 = await client.post('/campaign/AddLeadsToCampaign', addLeadsPayload);
      console.log('\n✅ SUCCESS: AddLeadsToCampaign endpoint works!');
      console.log('Response:', JSON.stringify(addLeadsResponse2.data, null, 2));
      
      return { success: true, endpoint: '/campaign/AddLeadsToCampaign', data: addLeadsResponse2.data };
    } catch (error) {
      console.log('\n❌ AddLeadsToCampaign failed:');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data?.message || error.message);
    }

    // Test with different parameter variations
    console.log('\n4. Testing with minimal parameters...');
    const minimalPayload = {
      campaignId: testCampaign.id,
      accountLeadPairs: [
        {
          lead: {
            firstName: "Minimal",
            lastName: "Test",
            profileUrl: "https://www.linkedin.com/in/minimal-test-" + Date.now()
          }
        }
      ]
    };

    try {
      const minimalResponse = await client.post('/campaign/AddLeadsToCampaignV2', minimalPayload);
      console.log('\n✅ SUCCESS: Minimal parameters work!');
      console.log('Response:', JSON.stringify(minimalResponse.data, null, 2));
      
      return { success: true, endpoint: '/campaign/AddLeadsToCampaignV2', data: minimalResponse.data };
    } catch (error) {
      console.log('\n❌ Minimal parameters failed:');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.log('❌ Failed to get campaigns:', error.message);
  }

  return { success: false };
}

async function investigateClayIntegration() {
  console.log('\n🔍 Investigating Clay Integration Requirements...\n');
  
  // Based on Clay documentation, let's check what might be missing
  console.log('Clay integration requirements:');
  console.log('1. Campaign ID (number)');
  console.log('2. LinkedIn account ID (optional)');
  console.log('3. Lead data with specific structure');
  console.log('4. Custom fields must use alpha-numeric + underscore names only');
  
  console.log('\nPossible issues with our previous implementation:');
  console.log('1. ❌ Used simple "leads" array instead of "accountLeadPairs"');
  console.log('2. ❌ Missing proper lead object structure');
  console.log('3. ❌ Incorrect parameter names');
  console.log('4. ❌ Missing linkedInAccountId field');
  
  console.log('\nClay-compatible structure should be:');
  console.log(`{
    "campaignId": number,
    "accountLeadPairs": [{
      "linkedInAccountId": number | null,
      "lead": {
        "firstName": string,
        "lastName": string,
        "profileUrl": string,
        "location": string,
        "summary": string,
        "companyName": string,
        "position": string,
        "about": string,
        "emailAddress": string,
        "customUserFields": [{"name": string, "value": string}]
      }
    }]
  }`);
}

async function main() {
  await investigateClayIntegration();
  const result = await testAddLeadsEndpoint();
  
  console.log('\n📊 CONCLUSION:');
  if (result.success) {
    console.log('✅ Add Leads to Campaign endpoint DOES work!');
    console.log(`✅ Working endpoint: ${result.endpoint}`);
    console.log('✅ Clay integration structure is correct');
    console.log('✅ We should add this tool back to the MCP server');
  } else {
    console.log('❌ Add Leads to Campaign endpoint still not working');
    console.log('❌ May require different authentication or permissions');
    console.log('❌ API key might not have campaign modification permissions');
  }
}

main().catch(console.error);

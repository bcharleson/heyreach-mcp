#!/usr/bin/env node

/**
 * Debug the specific 400 error for Add Leads to Campaign
 * Get detailed error messages to understand what's wrong
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

async function debugAddLeadsError() {
  console.log('🔍 Debugging Add Leads to Campaign 400 Error\n');

  // Get campaign details first
  try {
    const campaignsResponse = await client.post('/campaign/GetAll', {});
    const campaigns = campaignsResponse.data?.items || [];
    
    if (campaigns.length === 0) {
      console.log('❌ No campaigns found');
      return;
    }

    const testCampaign = campaigns[0];
    console.log('📋 Campaign Details:');
    console.log(JSON.stringify(testCampaign, null, 2));

    // Check if campaign is in correct status
    console.log(`\n📊 Campaign Status: ${testCampaign.status}`);
    console.log(`📊 Campaign Accounts: ${JSON.stringify(testCampaign.campaignAccountIds)}`);

    // Test with very minimal payload
    console.log('\n🧪 Testing with absolute minimal payload...');
    const minimalPayload = {
      campaignId: testCampaign.id,
      accountLeadPairs: [
        {
          lead: {
            profileUrl: "https://www.linkedin.com/in/test-minimal"
          }
        }
      ]
    };

    try {
      const response = await client.post('/campaign/AddLeadsToCampaignV2', minimalPayload);
      console.log('✅ SUCCESS with minimal payload!');
      console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Minimal payload failed:');
      console.log('Status:', error.response?.status);
      console.log('Headers:', error.response?.headers);
      console.log('Full error response:', JSON.stringify(error.response?.data, null, 2));
      
      // Try to get more detailed error info
      if (error.response?.data) {
        console.log('\n🔍 Detailed Error Analysis:');
        const errorData = error.response.data;
        
        if (errorData.message) {
          console.log('Error Message:', errorData.message);
        }
        if (errorData.errors) {
          console.log('Validation Errors:', JSON.stringify(errorData.errors, null, 2));
        }
        if (errorData.details) {
          console.log('Error Details:', JSON.stringify(errorData.details, null, 2));
        }
      }
    }

    // Test if we need LinkedIn account IDs
    console.log('\n🧪 Testing with LinkedIn account ID...');
    
    // First get LinkedIn accounts
    try {
      const accountsResponse = await client.post('/linkedinaccount/GetAll', {});
      console.log('\n📋 LinkedIn Accounts:');
      console.log(JSON.stringify(accountsResponse.data, null, 2));
      
      if (accountsResponse.data?.items && accountsResponse.data.items.length > 0) {
        const linkedInAccount = accountsResponse.data.items[0];
        
        const payloadWithAccount = {
          campaignId: testCampaign.id,
          accountLeadPairs: [
            {
              linkedInAccountId: linkedInAccount.id,
              lead: {
                profileUrl: "https://www.linkedin.com/in/test-with-account"
              }
            }
          ]
        };

        try {
          const response = await client.post('/campaign/AddLeadsToCampaignV2', payloadWithAccount);
          console.log('✅ SUCCESS with LinkedIn account ID!');
          console.log(JSON.stringify(response.data, null, 2));
        } catch (error) {
          console.log('❌ With LinkedIn account ID failed:');
          console.log('Status:', error.response?.status);
          console.log('Error:', JSON.stringify(error.response?.data, null, 2));
        }
      }
    } catch (error) {
      console.log('❌ Failed to get LinkedIn accounts:', error.response?.data?.message || error.message);
    }

    // Test different campaign statuses
    console.log('\n🧪 Testing campaign status requirements...');
    
    // Check if campaign needs to be in specific status
    if (testCampaign.status === 'DRAFT') {
      console.log('⚠️  Campaign is in DRAFT status - this might be the issue');
      console.log('💡 Clay might require campaigns to be ACTIVE or IN_PROGRESS');
    }

    // Test with a different campaign if available
    if (campaigns.length > 1) {
      const activeCampaign = campaigns.find(c => c.status === 'IN_PROGRESS' || c.status === 'ACTIVE');
      if (activeCampaign) {
        console.log(`\n🧪 Testing with active campaign: ${activeCampaign.name} (${activeCampaign.status})`);
        
        const activePayload = {
          campaignId: activeCampaign.id,
          accountLeadPairs: [
            {
              lead: {
                profileUrl: "https://www.linkedin.com/in/test-active-campaign"
              }
            }
          ]
        };

        try {
          const response = await client.post('/campaign/AddLeadsToCampaignV2', activePayload);
          console.log('✅ SUCCESS with active campaign!');
          console.log(JSON.stringify(response.data, null, 2));
        } catch (error) {
          console.log('❌ Active campaign also failed:');
          console.log('Status:', error.response?.status);
          console.log('Error:', JSON.stringify(error.response?.data, null, 2));
        }
      }
    }

  } catch (error) {
    console.log('❌ Failed to get campaigns:', error.message);
  }
}

async function checkAPIPermissions() {
  console.log('\n🔍 Checking API Key Permissions...\n');
  
  const endpoints = [
    { name: 'Check API Key', method: 'GET', url: '/auth/CheckApiKey' },
    { name: 'Get Campaigns', method: 'POST', url: '/campaign/GetAll', data: {} },
    { name: 'Get LinkedIn Accounts', method: 'POST', url: '/linkedinaccount/GetAll', data: {} },
    { name: 'Get Lists', method: 'POST', url: '/list/GetAll', data: {} }
  ];

  for (const endpoint of endpoints) {
    try {
      let response;
      if (endpoint.method === 'GET') {
        response = await client.get(endpoint.url);
      } else {
        response = await client.post(endpoint.url, endpoint.data || {});
      }
      console.log(`✅ ${endpoint.name}: Working (${response.status})`);
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Failed (${error.response?.status}) - ${error.response?.data?.message || error.message}`);
    }
  }
}

async function main() {
  await checkAPIPermissions();
  await debugAddLeadsError();
  
  console.log('\n💡 POSSIBLE SOLUTIONS:');
  console.log('1. Campaign might need to be in ACTIVE/IN_PROGRESS status');
  console.log('2. API key might need additional permissions for campaign modification');
  console.log('3. LinkedIn account ID might be required');
  console.log('4. Lead data might need additional required fields');
  console.log('5. Custom fields might have naming restrictions');
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Check with HeyReach support about API key permissions');
  console.log('2. Test with an active campaign');
  console.log('3. Review Clay\'s exact implementation');
  console.log('4. Check if there are undocumented required fields');
}

main().catch(console.error);

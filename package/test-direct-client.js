#!/usr/bin/env node

/**
 * Test the HeyReach client directly
 */

import { HeyReachClient } from './dist/heyreach-client.js';

async function testDirectClient() {
  console.log('🧪 Testing HeyReach Client Directly...\n');

  const client = new HeyReachClient({
    apiKey: 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M='
  });

  // Test 1: Check API Key
  console.log('1️⃣ Testing API Key Check...');
  try {
    const result = await client.checkApiKey();
    console.log('✅ API Key Result:', result);
  } catch (error) {
    console.log('❌ API Key Error:', error.message);
  }

  // Test 2: Get All Campaigns
  console.log('\n2️⃣ Testing Get All Campaigns...');
  try {
    const result = await client.getAllCampaigns();
    console.log('✅ Campaigns Result:', result);
    if (result.success && result.data) {
      console.log(`📊 Found ${result.data.length} campaigns`);
      result.data.forEach((campaign, index) => {
        console.log(`   ${index + 1}. ${campaign.name} (ID: ${campaign.id}, Status: ${campaign.status})`);
      });
    }
  } catch (error) {
    console.log('❌ Campaigns Error:', error.message);
  }
}

testDirectClient().catch(console.error);

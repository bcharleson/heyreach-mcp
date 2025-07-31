#!/usr/bin/env node

/**
 * Test HeyReachClient Directly
 * Test the HeyReachClient class directly to isolate the issue
 */

import { HeyReachClient } from './dist/heyreach-client.js';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

async function testHeyReachClientDirect() {
  console.log('🔍 Testing HeyReachClient Directly\n');

  try {
    // Create HeyReachClient instance
    console.log('1. Creating HeyReachClient instance...');
    const client = new HeyReachClient({
      apiKey: API_KEY
    });
    console.log('✅ HeyReachClient instance created');

    // Test checkApiKey method
    console.log('\n2. Testing checkApiKey method...');
    const result = await client.checkApiKey();
    
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ checkApiKey method successful');
    } else {
      console.log('❌ checkApiKey method failed:', result.error);
    }

    // Test getAllCampaigns method
    console.log('\n3. Testing getAllCampaigns method...');
    const campaignsResult = await client.getAllCampaigns();
    
    console.log('📊 Campaigns Result:', JSON.stringify(campaignsResult, null, 2));
    
    if (campaignsResult.success) {
      console.log('✅ getAllCampaigns method successful');
    } else {
      console.log('❌ getAllCampaigns method failed:', campaignsResult.error);
    }

  } catch (error) {
    console.error('❌ Error testing HeyReachClient:', error);
  }
}

testHeyReachClientDirect().catch(console.error);

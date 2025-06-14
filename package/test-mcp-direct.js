#!/usr/bin/env node

/**
 * Test the MCP server by directly calling the client
 */

import { HeyReachClient } from './dist/heyreach-client.js';

async function testMcpDirect() {
  console.log('🧪 Testing MCP Server Client Directly...\n');

  // Create the client exactly as the MCP server does
  const client = new HeyReachClient({
    apiKey: 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M='
  });

  console.log('1️⃣ Testing API Key Check (as MCP server would)...');
  try {
    const result = await client.checkApiKey();
    console.log('✅ API Key Result:', result);
    
    if (!result.success) {
      console.log('❌ MCP would return error:', result.error);
    } else {
      console.log('✅ MCP would return: API Key is valid');
    }
  } catch (error) {
    console.log('❌ API Key Error:', error.message);
  }

  console.log('\n2️⃣ Testing Get All Campaigns (as MCP server would)...');
  try {
    const result = await client.getAllCampaigns();
    console.log('✅ Campaigns Result:', result);
    
    if (!result.success) {
      console.log('❌ MCP would return error:', result.error);
    } else {
      console.log('✅ MCP would return campaign data');
      console.log(`📊 Found ${result.data.length} campaigns`);
    }
  } catch (error) {
    console.log('❌ Campaigns Error:', error.message);
  }

  console.log('\n🔍 Debugging: Let\'s check the exact error handling...');
  
  // Test with a method that might fail to see error handling
  console.log('\n3️⃣ Testing a method that might fail...');
  try {
    const result = await client.getCampaignDetails('invalid-id');
    console.log('Campaign Details Result:', result);
  } catch (error) {
    console.log('Campaign Details Error:', error.message);
  }
}

testMcpDirect().catch(console.error);

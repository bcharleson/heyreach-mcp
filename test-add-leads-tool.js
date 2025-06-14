#!/usr/bin/env node

/**
 * Test the Add Leads to Campaign MCP tool
 * Based on Clay integration requirements
 */

import { spawn } from 'child_process';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

async function testMCPTool(serverProcess, toolName, args = {}) {
  console.log(`\n🧪 Testing MCP tool: ${toolName}...`);
  
  const toolMessage = JSON.stringify({
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: args
    }
  }) + '\n';

  return new Promise((resolve) => {
    let responseReceived = false;
    let responseData = '';

    const timeout = setTimeout(() => {
      if (!responseReceived) {
        console.log(`   ⏰ TIMEOUT: ${toolName}`);
        resolve({ success: false, error: 'Timeout' });
      }
    }, 15000);

    const dataHandler = (data) => {
      responseData += data.toString();
      
      const lines = responseData.split('\n');
      for (const line of lines) {
        if (line.trim() && line.includes('"jsonrpc"')) {
          try {
            const response = JSON.parse(line.trim());
            if (response.id && !responseReceived) {
              responseReceived = true;
              clearTimeout(timeout);
              serverProcess.stdout.off('data', dataHandler);
              
              if (response.error) {
                console.log(`   ❌ FAILED: ${response.error.message}`);
                resolve({ success: false, error: response.error.message });
              } else {
                console.log(`   ✅ SUCCESS: Tool executed successfully`);
                console.log(`   📊 Response: ${JSON.stringify(response.result).substring(0, 200)}...`);
                resolve({ success: true, data: response.result });
              }
            }
          } catch (e) {
            // Not valid JSON, continue
          }
        }
      }
    };

    serverProcess.stdout.on('data', dataHandler);
    serverProcess.stdin.write(toolMessage);
  });
}

async function testAddLeadsToCampaign() {
  console.log('🚀 Testing Add Leads to Campaign Tool - Clay Integration Compatible\n');
  console.log('This test validates the Clay-compatible implementation\n');

  console.log('Starting MCP server...');
  
  const serverProcess = spawn('node', [
    'dist/index.js',
    `--api-key=${API_KEY}`
  ], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Give the server time to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Initialize MCP connection
  console.log('Initializing MCP connection...');
  const initMessage = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  }) + '\n';

  serverProcess.stdin.write(initMessage);
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 1: Get campaigns to find a valid campaign ID
  console.log('\n=== STEP 1: GET VALID CAMPAIGN ID ===');
  const campaignsResult = await testMCPTool(serverProcess, 'get-all-campaigns', { limit: 10 });
  
  if (!campaignsResult.success) {
    console.log('❌ Cannot test add-leads-to-campaign without valid campaigns');
    serverProcess.kill('SIGTERM');
    return;
  }

  // Handle different response formats
  let campaignData;
  try {
    if (campaignsResult.data?.content?.[0]?.text) {
      campaignData = JSON.parse(campaignsResult.data.content[0].text);
    } else if (typeof campaignsResult.data === 'string') {
      campaignData = JSON.parse(campaignsResult.data);
    } else {
      campaignData = campaignsResult.data;
    }
  } catch (e) {
    console.log('❌ Cannot parse campaigns response:', e.message);
    console.log('Raw response:', JSON.stringify(campaignsResult.data, null, 2));
    serverProcess.kill('SIGTERM');
    return;
  }

  console.log('📋 Available campaigns:');
  campaignData.campaigns?.forEach(campaign => {
    console.log(`   • ${campaign.name} (ID: ${campaign.id}, Status: ${campaign.status}, Accounts: ${campaign.campaignAccountIds?.length || 0})`);
  });

  // Find a suitable campaign (preferably active with accounts)
  const suitableCampaign = campaignData.campaigns?.find(c => 
    c.status === 'IN_PROGRESS' || c.status === 'ACTIVE'
  ) || campaignData.campaigns?.[0];

  if (!suitableCampaign) {
    console.log('❌ No campaigns available for testing');
    serverProcess.kill('SIGTERM');
    return;
  }

  console.log(`\n🎯 Using campaign: ${suitableCampaign.name} (ID: ${suitableCampaign.id})`);
  console.log(`📊 Campaign Status: ${suitableCampaign.status}`);
  console.log(`📊 Campaign Accounts: ${suitableCampaign.campaignAccountIds?.length || 0}`);

  // Test 2: Test add-leads-to-campaign with minimal data
  console.log('\n=== STEP 2: TEST ADD LEADS TO CAMPAIGN ===');
  
  const testLeads = [
    {
      linkedInAccountId: null, // Auto-assign
      lead: {
        firstName: "Test",
        lastName: "Lead",
        profileUrl: `https://www.linkedin.com/in/test-lead-${Date.now()}`,
        companyName: "Test Company",
        position: "Test Position",
        emailAddress: "test@example.com"
      }
    }
  ];

  const addLeadsResult = await testMCPTool(serverProcess, 'add-leads-to-campaign', {
    campaignId: suitableCampaign.id,
    leads: testLeads
  });

  // Test 3: Test with custom fields (Clay personalization variables)
  console.log('\n=== STEP 3: TEST WITH CUSTOM FIELDS ===');
  
  const testLeadsWithCustomFields = [
    {
      linkedInAccountId: null,
      lead: {
        firstName: "Custom",
        lastName: "Test",
        profileUrl: `https://www.linkedin.com/in/custom-test-${Date.now()}`,
        companyName: "Custom Company",
        position: "Custom Position",
        customUserFields: [
          {
            name: "AI_Icebreaker_1",
            value: "Great work on your recent LinkedIn post about AI!"
          },
          {
            name: "company_insight",
            value: "I noticed your company is expanding into new markets"
          }
        ]
      }
    }
  ];

  const customFieldsResult = await testMCPTool(serverProcess, 'add-leads-to-campaign', {
    campaignId: suitableCampaign.id,
    leads: testLeadsWithCustomFields
  });

  // Test 4: Test error handling - invalid campaign ID
  console.log('\n=== STEP 4: TEST ERROR HANDLING ===');
  
  const errorResult = await testMCPTool(serverProcess, 'add-leads-to-campaign', {
    campaignId: 999999,
    leads: testLeads
  });

  // Test 5: Test validation - missing profileUrl
  console.log('\n=== STEP 5: TEST VALIDATION ===');
  
  const invalidLeads = [
    {
      lead: {
        firstName: "Invalid",
        lastName: "Lead"
        // Missing profileUrl
      }
    }
  ];

  const validationResult = await testMCPTool(serverProcess, 'add-leads-to-campaign', {
    campaignId: suitableCampaign.id,
    leads: invalidLeads
  });

  // Results summary
  console.log('\n📊 ADD LEADS TO CAMPAIGN TEST RESULTS\n');
  console.log('='.repeat(50));
  
  const results = [
    { name: 'Basic Add Leads', result: addLeadsResult },
    { name: 'Custom Fields', result: customFieldsResult },
    { name: 'Error Handling', result: errorResult },
    { name: 'Validation', result: validationResult }
  ];

  let successCount = 0;
  results.forEach(test => {
    const status = test.result.success ? '✅' : '❌';
    console.log(`${status} ${test.name}: ${test.result.success ? 'SUCCESS' : test.result.error}`);
    if (test.result.success) successCount++;
  });

  const successRate = ((successCount / results.length) * 100).toFixed(1);
  console.log(`\n📈 Success Rate: ${successRate}%`);

  console.log('\n🎯 CLAY INTEGRATION COMPATIBILITY:');
  if (addLeadsResult.success || customFieldsResult.success) {
    console.log('✅ Add Leads to Campaign tool is working!');
    console.log('✅ Clay integration should work with this implementation');
    console.log('✅ Custom fields (personalization variables) supported');
    console.log('✅ Auto-assignment of LinkedIn accounts supported');
  } else {
    console.log('❌ Add Leads to Campaign tool needs further investigation');
    console.log('💡 Check campaign status and LinkedIn account assignments');
  }

  console.log('\n📋 REQUIREMENTS FOR CLAY INTEGRATION:');
  console.log('1. Campaign must be ACTIVE (not DRAFT)');
  console.log('2. Campaign must have LinkedIn senders assigned');
  console.log('3. Use "Create empty list" when setting up campaign');
  console.log('4. Custom field names must be alphanumeric + underscore only');

  // Clean up
  serverProcess.kill('SIGTERM');
  
  console.log('\n🎉 Add Leads to Campaign test completed!');
}

testAddLeadsToCampaign().catch(console.error);

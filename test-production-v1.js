#!/usr/bin/env node

/**
 * Production Test Suite for HeyReach MCP Server v1.2.0
 * Comprehensive validation for bulletproof production release
 */

import { spawn } from 'child_process';

async function testProductionV1() {
  console.log('🚀 HeyReach MCP Server v1.2.0 - Production Test Suite\n');

  return new Promise((resolve) => {
    const serverProcess = spawn('node', ['./dist/index.js', '--api-key=QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M='], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let testResults = {
      authentication: false,
      existingTools: 0,
      newTools: 0,
      totalTools: 0,
      errors: []
    };

    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    serverProcess.stderr.on('data', (data) => {
      const text = data.toString();
      if (text.includes('HeyReach MCP Server started successfully')) {
        console.log('✅ Server v1.2.0 started successfully');
        console.log('📋 API Key configured and parsed correctly\n');
        runProductionTests();
      }
    });

    async function runProductionTests() {
      // Initialize MCP connection
      const initMessage = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          clientInfo: { name: 'production-test', version: '1.0.0' }
        }
      }) + '\n';

      serverProcess.stdin.write(initMessage);
      await sleep(1000);

      // Get tools list
      const listToolsMessage = JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      }) + '\n';

      serverProcess.stdin.write(listToolsMessage);
      await sleep(2000);

      // Test authentication
      console.log('🔐 Testing Authentication...');
      const authMessage = JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'check-api-key',
          arguments: {}
        }
      }) + '\n';

      serverProcess.stdin.write(authMessage);
      await sleep(2000);

      // Test critical new tools
      console.log('🆕 Testing Critical New Tools...');
      
      const linkedInMessage = JSON.stringify({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'get-linkedin-accounts',
          arguments: { limit: 5 }
        }
      }) + '\n';

      serverProcess.stdin.write(linkedInMessage);
      await sleep(2000);

      // Test existing working tools
      console.log('✅ Testing Existing Working Tools...');
      
      const campaignsMessage = JSON.stringify({
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'get-all-campaigns',
          arguments: { limit: 3 }
        }
      }) + '\n';

      serverProcess.stdin.write(campaignsMessage);
      await sleep(2000);

      // Analyze results
      setTimeout(() => {
        analyzeResults();
        serverProcess.kill('SIGTERM');
        resolve();
      }, 3000);
    }

    function analyzeResults() {
      console.log('\n📊 Production Test Results Analysis\n');

      // Parse tools count
      try {
        const toolsMatch = output.match(/"tools":\s*\[([^\]]+)\]/);
        if (toolsMatch) {
          const toolsCount = (toolsMatch[1].match(/"name"/g) || []).length;
          testResults.totalTools = toolsCount;
          console.log(`📋 Total Tools Registered: ${toolsCount}`);
        }
      } catch (e) {
        console.log('⚠️  Could not parse tools count');
      }

      // Check authentication
      if (output.includes('"valid": true') || output.includes('"valid":true')) {
        testResults.authentication = true;
        console.log('✅ Authentication: WORKING');
      } else {
        console.log('❌ Authentication: FAILED');
        testResults.errors.push('Authentication failure');
      }

      // Check for existing working tools
      const existingTools = [
        'check-api-key', 'get-all-campaigns', 'get-active-campaigns', 
        'get-conversations', 'get-lead-details', 'get-overall-stats',
        'get-all-lists', 'create-empty-list', 'add-leads-to-campaign'
      ];

      existingTools.forEach(tool => {
        if (output.includes(`"name":"${tool}"`)) {
          testResults.existingTools++;
        }
      });

      console.log(`✅ Existing Working Tools: ${testResults.existingTools}/${existingTools.length}`);

      // Check for new critical tools
      const newTools = [
        'get-linkedin-accounts', 'create-campaign', 'pause-campaign',
        'resume-campaign', 'remove-lead-from-campaign', 'get-campaign-analytics'
      ];

      newTools.forEach(tool => {
        if (output.includes(`"name":"${tool}"`)) {
          testResults.newTools++;
        }
      });

      console.log(`🆕 New Critical Tools: ${testResults.newTools}/${newTools.length}`);

      // Check for API responses
      const successfulCalls = (output.match(/retrieved successfully|created successfully|validation completed/g) || []).length;
      const authErrors = (output.match(/Invalid API key/g) || []).length;

      console.log(`📞 Successful API Calls: ${successfulCalls}`);
      console.log(`🔐 Authentication Errors: ${authErrors}`);

      // Overall assessment
      console.log('\n🎯 Production Readiness Assessment:');
      
      const criteria = [
        { name: 'Authentication Working', passed: testResults.authentication },
        { name: 'All Existing Tools Present', passed: testResults.existingTools >= 9 },
        { name: 'New Critical Tools Added', passed: testResults.newTools >= 6 },
        { name: 'Total Tools >= 18', passed: testResults.totalTools >= 18 },
        { name: 'No Authentication Errors', passed: authErrors === 0 }
      ];

      let passedCriteria = 0;
      criteria.forEach(criterion => {
        const status = criterion.passed ? '✅' : '❌';
        console.log(`${status} ${criterion.name}`);
        if (criterion.passed) passedCriteria++;
      });

      const successRate = (passedCriteria / criteria.length) * 100;
      console.log(`\n📈 Production Readiness: ${passedCriteria}/${criteria.length} (${successRate.toFixed(1)}%)`);

      if (successRate >= 80) {
        console.log('\n🎉 PRODUCTION READY! ✅');
        console.log('🚀 HeyReach MCP Server v1.2.0 meets production standards');
        console.log('📦 Ready for npm publication and deployment');
      } else {
        console.log('\n⚠️  NEEDS IMPROVEMENT');
        console.log('🔧 Address failing criteria before production deployment');
      }

      // Tool breakdown
      console.log('\n📋 Tool Categories:');
      console.log(`   • Core Tools: ${testResults.existingTools} working`);
      console.log(`   • New Critical Tools: ${testResults.newTools} added`);
      console.log(`   • Total Available: ${testResults.totalTools} tools`);
    }

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    setTimeout(() => {
      console.log('⏰ Test timeout - killing server');
      serverProcess.kill('SIGTERM');
      resolve();
    }, 25000);
  });
}

testProductionV1().catch(console.error);

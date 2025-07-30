#!/usr/bin/env node

/**
 * Test n8n Agent compatibility with HeyReach MCP Server
 * Simulates how n8n's community MCP node would interact with our server
 */

import { spawn } from 'child_process';

async function testN8nCompatibility() {
  console.log('🧪 Testing n8n Agent Compatibility with HeyReach MCP Server\n');

  return new Promise((resolve) => {
    console.log('📋 Starting HeyReach MCP Server in STDIO mode (n8n compatible)...');
    
    // Spawn the server exactly as n8n would
    const serverProcess = spawn('node', ['./dist/index.js', '--api-key=QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M='], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let testResults = {
      serverStarted: false,
      initializeSuccess: false,
      toolsListSuccess: false,
      authenticationSuccess: false,
      toolCallSuccess: false,
      totalTools: 0
    };

    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    serverProcess.stderr.on('data', (data) => {
      const text = data.toString();
      if (text.includes('HeyReach MCP Server started successfully')) {
        testResults.serverStarted = true;
        console.log('✅ Server started in STDIO mode');
        runN8nTests();
      }
    });

    async function runN8nTests() {
      console.log('\n🔄 Running n8n Agent compatibility tests...\n');

      // Test 1: Initialize MCP connection (as n8n would)
      console.log('1️⃣ Testing MCP initialization...');
      const initMessage = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          clientInfo: { name: 'n8n-agent', version: '1.0.0' }
        }
      }) + '\n';

      serverProcess.stdin.write(initMessage);
      await sleep(1000);

      // Test 2: List available tools
      console.log('2️⃣ Testing tools list...');
      const listToolsMessage = JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      }) + '\n';

      serverProcess.stdin.write(listToolsMessage);
      await sleep(1500);

      // Test 3: Test authentication tool
      console.log('3️⃣ Testing authentication...');
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
      await sleep(1500);

      // Test 4: Test critical new tool
      console.log('4️⃣ Testing critical new tool (get-linkedin-accounts)...');
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

      // Analyze results
      setTimeout(() => {
        analyzeResults();
        serverProcess.kill('SIGTERM');
        resolve();
      }, 2000);
    }

    function analyzeResults() {
      console.log('\n📊 n8n Agent Compatibility Analysis\n');

      // Check initialization
      if (output.includes('"protocolVersion"') && output.includes('"capabilities"')) {
        testResults.initializeSuccess = true;
        console.log('✅ MCP Initialization: SUCCESS');
      } else {
        console.log('❌ MCP Initialization: FAILED');
      }

      // Check tools list
      const toolsMatch = output.match(/"tools":\s*\[([^\]]+)\]/);
      if (toolsMatch) {
        testResults.toolsListSuccess = true;
        const toolsCount = (toolsMatch[1].match(/"name"/g) || []).length;
        testResults.totalTools = toolsCount;
        console.log(`✅ Tools List: SUCCESS (${toolsCount} tools available)`);
      } else {
        console.log('❌ Tools List: FAILED');
      }

      // Check authentication
      if (output.includes('"valid": true') || output.includes('"valid":true')) {
        testResults.authenticationSuccess = true;
        console.log('✅ Authentication: SUCCESS');
      } else {
        console.log('❌ Authentication: FAILED');
      }

      // Check tool calls
      if (output.includes('retrieved successfully') || output.includes('validation completed')) {
        testResults.toolCallSuccess = true;
        console.log('✅ Tool Execution: SUCCESS');
      } else {
        console.log('❌ Tool Execution: FAILED');
      }

      // Overall assessment
      console.log('\n🎯 n8n Agent Compatibility Assessment:');
      
      const criteria = [
        { name: 'Server Startup (STDIO)', passed: testResults.serverStarted },
        { name: 'MCP Protocol Initialization', passed: testResults.initializeSuccess },
        { name: 'Tools Discovery', passed: testResults.toolsListSuccess },
        { name: 'Authentication Working', passed: testResults.authenticationSuccess },
        { name: 'Tool Execution', passed: testResults.toolCallSuccess }
      ];

      let passedCriteria = 0;
      criteria.forEach(criterion => {
        const status = criterion.passed ? '✅' : '❌';
        console.log(`${status} ${criterion.name}`);
        if (criterion.passed) passedCriteria++;
      });

      const compatibilityRate = (passedCriteria / criteria.length) * 100;
      console.log(`\n📈 n8n Compatibility: ${passedCriteria}/${criteria.length} (${compatibilityRate.toFixed(1)}%)`);

      if (compatibilityRate >= 80) {
        console.log('\n🎉 EXCELLENT n8n AGENT COMPATIBILITY! ✅');
        console.log('🚀 Ready for n8n Agent integration');
        console.log('📦 Current version (1.2.0) works with n8n community MCP node');
      } else {
        console.log('\n⚠️  COMPATIBILITY ISSUES DETECTED');
        console.log('🔧 Additional work needed for n8n Agent support');
      }

      // Tool availability summary
      console.log('\n📋 Tool Availability:');
      console.log(`   • Total Tools: ${testResults.totalTools}`);
      console.log(`   • Expected: 18 tools`);
      console.log(`   • Status: ${testResults.totalTools >= 18 ? '✅ Complete' : '⚠️ Missing tools'}`);

      // Configuration guidance
      console.log('\n🔧 n8n Agent Configuration:');
      console.log('```json');
      console.log('{');
      console.log('  "command": "npx",');
      console.log('  "args": [');
      console.log('    "heyreach-mcp-server@1.2.0",');
      console.log('    "--api-key=YOUR_HEYREACH_API_KEY"');
      console.log('  ],');
      console.log('  "transport": "stdio"');
      console.log('}');
      console.log('```');
    }

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    setTimeout(() => {
      console.log('⏰ Test timeout - killing server');
      serverProcess.kill('SIGTERM');
      resolve();
    }, 15000);
  });
}

testN8nCompatibility().catch(console.error);

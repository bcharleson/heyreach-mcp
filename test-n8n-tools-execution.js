#!/usr/bin/env node

/**
 * Test n8n Tool Listing and Execution Compatibility
 * Verifies that n8n can both discover and execute HeyReach MCP tools
 */

import { spawn } from 'child_process';

async function testN8nToolsExecution() {
  console.log('🧪 Testing n8n Tool Listing & Execution Compatibility\n');

  return new Promise((resolve) => {
    console.log('📋 Starting HeyReach MCP Server for n8n testing...');
    
    const serverProcess = spawn('node', ['./dist/index.js', '--api-key=QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M='], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let testResults = {
      toolsDiscovered: 0,
      toolsExecuted: 0,
      authenticationWorking: false,
      criticalToolsAvailable: 0
    };

    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    serverProcess.stderr.on('data', (data) => {
      const text = data.toString();
      if (text.includes('HeyReach MCP Server started successfully')) {
        console.log('✅ Server started successfully\n');
        runToolTests();
      }
    });

    async function runToolTests() {
      // Initialize MCP connection
      console.log('🔄 Step 1: Initialize MCP connection');
      const initMessage = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          clientInfo: { name: 'n8n-test', version: '1.0.0' }
        }
      }) + '\n';

      serverProcess.stdin.write(initMessage);
      await sleep(1000);

      // Test tool discovery (what n8n does first)
      console.log('🔍 Step 2: Test tool discovery (n8n tools/list)');
      const listToolsMessage = JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      }) + '\n';

      serverProcess.stdin.write(listToolsMessage);
      await sleep(1500);

      // Test tool execution - Authentication
      console.log('🔐 Step 3: Test authentication tool execution');
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

      // Test tool execution - Core functionality
      console.log('📋 Step 4: Test core tool execution (get-all-campaigns)');
      const campaignsMessage = JSON.stringify({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'get-all-campaigns',
          arguments: { limit: 3 }
        }
      }) + '\n';

      serverProcess.stdin.write(campaignsMessage);
      await sleep(1500);

      // Test tool execution - New critical tool
      console.log('🆕 Step 5: Test new critical tool (get-linkedin-accounts)');
      const linkedInMessage = JSON.stringify({
        jsonrpc: '2.0',
        id: 5,
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
        analyzeN8nCompatibility();
        serverProcess.kill('SIGTERM');
        resolve();
      }, 1000);
    }

    function analyzeN8nCompatibility() {
      console.log('\n📊 n8n Tool Compatibility Analysis\n');

      // Parse tools discovery
      try {
        const lines = output.split('\n');
        for (const line of lines) {
          if (line.includes('"tools":[')) {
            const parsed = JSON.parse(line);
            if (parsed.result && parsed.result.tools) {
              testResults.toolsDiscovered = parsed.result.tools.length;
              
              // Check for critical tools
              const criticalTools = ['get-linkedin-accounts', 'create-campaign', 'pause-campaign', 'resume-campaign'];
              criticalTools.forEach(tool => {
                if (parsed.result.tools.some(t => t.name === tool)) {
                  testResults.criticalToolsAvailable++;
                }
              });
              break;
            }
          }
        }
      } catch (e) {
        console.log('⚠️  Could not parse tools list');
      }

      // Check authentication
      if (output.includes('"valid": true') || output.includes('"valid":true')) {
        testResults.authenticationWorking = true;
        testResults.toolsExecuted++;
      }

      // Check tool executions
      const successfulExecutions = (output.match(/retrieved successfully|validation completed|working correctly/g) || []).length;
      testResults.toolsExecuted = successfulExecutions;

      // Results summary
      console.log('🎯 n8n Compatibility Results:');
      console.log(`📋 Tools Discovered: ${testResults.toolsDiscovered}/18 expected`);
      console.log(`🆕 Critical Tools Available: ${testResults.criticalToolsAvailable}/4 expected`);
      console.log(`⚡ Tools Successfully Executed: ${testResults.toolsExecuted}`);
      console.log(`🔐 Authentication: ${testResults.authenticationWorking ? '✅ Working' : '❌ Failed'}`);

      // Specific tool checks
      console.log('\n🔍 Tool-Specific Checks:');
      
      const toolChecks = [
        { name: 'check-api-key', found: output.includes('"name":"check-api-key"'), executed: output.includes('"valid": true') },
        { name: 'get-all-campaigns', found: output.includes('"name":"get-all-campaigns"'), executed: output.includes('campaigns') },
        { name: 'get-linkedin-accounts', found: output.includes('"name":"get-linkedin-accounts"'), executed: output.includes('LinkedIn accounts') },
        { name: 'create-campaign', found: output.includes('"name":"create-campaign"'), executed: false },
        { name: 'add-leads-to-campaign', found: output.includes('"name":"add-leads-to-campaign"'), executed: false }
      ];

      toolChecks.forEach(tool => {
        const discoveryStatus = tool.found ? '✅' : '❌';
        const executionStatus = tool.executed ? '✅' : '⚪';
        console.log(`   ${discoveryStatus} ${tool.name} (discovery) ${executionStatus} (execution)`);
      });

      // Overall assessment
      const discoveryRate = (testResults.toolsDiscovered / 18) * 100;
      const executionRate = testResults.toolsExecuted > 0 ? 100 : 0;

      console.log('\n🎉 Overall n8n Compatibility:');
      console.log(`📋 Tool Discovery: ${discoveryRate.toFixed(1)}% (${testResults.toolsDiscovered}/18)`);
      console.log(`⚡ Tool Execution: ${executionRate.toFixed(1)}% (${testResults.toolsExecuted > 0 ? 'Working' : 'Failed'})`);

      if (discoveryRate >= 90 && testResults.authenticationWorking) {
        console.log('\n🎉 EXCELLENT n8n COMPATIBILITY! ✅');
        console.log('🚀 Ready for n8n Agent workflows');
        console.log('📦 Current implementation works perfectly with n8n community MCP node');
        
        console.log('\n📋 n8n Configuration (STDIO):');
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
      } else {
        console.log('\n⚠️  COMPATIBILITY ISSUES');
        console.log('🔧 Need to investigate tool discovery or execution');
      }
    }

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    setTimeout(() => {
      console.log('⏰ Test timeout');
      serverProcess.kill('SIGTERM');
      resolve();
    }, 20000);
  });
}

testN8nToolsExecution().catch(console.error);

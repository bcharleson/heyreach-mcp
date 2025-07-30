#!/usr/bin/env node

/**
 * Post-Publication Test Suite
 * Tests the published npm package functionality
 */

import { execSync } from 'child_process';

async function testPublishedPackage() {
  console.log('🧪 HeyReach MCP Server v1.1.6 - Post-Publication Test Suite\n');

  let testsPassed = 0;
  let testsTotal = 0;

  function runTest(testName, testFn) {
    testsTotal++;
    console.log(`📋 TEST ${testsTotal}: ${testName}`);
    try {
      testFn();
      console.log('✅ PASSED\n');
      testsPassed++;
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}\n`);
    }
  }

  // Test 1: Package is available on npm
  runTest('Package availability on npm', () => {
    const result = execSync('npm view heyreach-mcp-server@1.1.6 version', { encoding: 'utf8' });
    if (result.trim() !== '1.1.6') {
      throw new Error(`Expected version 1.1.6, got ${result.trim()}`);
    }
  });

  // Test 2: Package metadata is correct
  runTest('Package metadata validation', () => {
    const result = execSync('npm view heyreach-mcp-server@1.1.6 --json', { encoding: 'utf8' });
    const packageInfo = JSON.parse(result);
    
    if (!packageInfo.description.includes('Production-ready Model Context Protocol')) {
      throw new Error('Description does not match expected content');
    }
    
    if (!packageInfo.keywords.includes('mcp')) {
      throw new Error('Missing MCP keyword');
    }
    
    if (!packageInfo.keywords.includes('claude')) {
      throw new Error('Missing Claude keyword');
    }
    
    if (!packageInfo.keywords.includes('cursor')) {
      throw new Error('Missing Cursor keyword');
    }
    
    if (!packageInfo.keywords.includes('windsurf')) {
      throw new Error('Missing Windsurf keyword');
    }
  });

  // Test 3: Binary is executable
  runTest('Binary executable test', () => {
    try {
      const result = execSync('heyreach-mcp-server 2>&1 || true', { encoding: 'utf8' });
      if (!result.includes('API key is required')) {
        throw new Error('Binary not showing correct usage message');
      }
    } catch (error) {
      throw new Error(`Binary execution failed: ${error.message}`);
    }
  });

  // Test 4: Package size is reasonable
  runTest('Package size validation', () => {
    const result = execSync('npm view heyreach-mcp-server@1.1.6 dist.unpackedSize', { encoding: 'utf8' });
    const size = parseInt(result.trim());
    
    if (size > 100000) { // 100KB limit
      throw new Error(`Package too large: ${size} bytes (limit: 100KB)`);
    }
  });

  // Test 5: Dependencies are correct
  runTest('Dependencies validation', () => {
    const result = execSync('npm view heyreach-mcp-server@1.1.6 dependencies --json', { encoding: 'utf8' });
    const deps = JSON.parse(result);
    
    const expectedDeps = ['@modelcontextprotocol/sdk', 'axios', 'zod'];
    for (const dep of expectedDeps) {
      if (!deps[dep]) {
        throw new Error(`Missing dependency: ${dep}`);
      }
    }
    
    if (Object.keys(deps).length !== expectedDeps.length) {
      throw new Error(`Unexpected number of dependencies: ${Object.keys(deps).length}`);
    }
  });

  // Test 6: No Clay references in published package
  runTest('Clay references removal validation', () => {
    const result = execSync('npm view heyreach-mcp-server@1.1.6 --json', { encoding: 'utf8' });
    const packageInfo = JSON.parse(result);
    
    const textToCheck = JSON.stringify(packageInfo).toLowerCase();
    if (textToCheck.includes('clay')) {
      throw new Error('Clay references still present in published package');
    }
  });

  // Test 7: MCP client keywords present
  runTest('MCP client keywords validation', () => {
    const result = execSync('npm view heyreach-mcp-server@1.1.6 keywords --json', { encoding: 'utf8' });
    const keywords = JSON.parse(result);
    
    const mcpClientKeywords = ['claude', 'cursor', 'windsurf', 'chatgpt', 'n8n'];
    for (const keyword of mcpClientKeywords) {
      if (!keywords.includes(keyword)) {
        throw new Error(`Missing MCP client keyword: ${keyword}`);
      }
    }
  });

  // Summary
  console.log('🎯 POST-PUBLICATION TEST SUMMARY');
  console.log('=====================================');
  console.log(`✅ Tests Passed: ${testsPassed}/${testsTotal}`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ HeyReach MCP Server v1.1.6 is successfully published and working!');
    console.log('\n📋 Ready for use with:');
    console.log('- Claude Desktop');
    console.log('- Cursor IDE');
    console.log('- Windsurf IDE');
    console.log('- ChatGPT (with MCP support)');
    console.log('- n8n Agent');
    console.log('- Any MCP-compatible client');
    console.log('\n🚀 Installation: npm install -g heyreach-mcp-server@1.1.6');
    console.log('🚀 Usage: heyreach-mcp-server --api-key=YOUR_HEYREACH_API_KEY');
  } else {
    console.log('❌ Some tests failed. Please investigate.');
    process.exit(1);
  }
}

// Run the test
testPublishedPackage().catch(console.error);

#!/usr/bin/env node

/**
 * Test Environment Comparison
 * Compare environment between direct execution and MCP server context
 */

import { executeIsolatedHttpRequest } from './dist/http-isolation-wrapper.js';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

async function testEnvironmentComparison() {
  console.log('🔍 Testing Environment Comparison\n');

  // Test 1: Direct execution environment
  console.log('1. Testing in direct execution environment...');
  try {
    const result = await executeIsolatedHttpRequest({
      url: 'https://api.heyreach.io/api/public/auth/CheckApiKey',
      method: 'GET',
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000
    });

    console.log('📊 Direct execution result:', result.success ? '✅ SUCCESS' : '❌ FAILED');
    if (!result.success) {
      console.log('   Error:', result.error);
    }
  } catch (error) {
    console.log('❌ Direct execution error:', error.message);
  }

  // Test 2: Create a minimal MCP server context and test
  console.log('\n2. Testing in MCP server context...');
  try {
    // Import MCP SDK components
    const { McpServer } = await import('@modelcontextprotocol/sdk/server/mcp.js');
    
    // Create MCP server
    const server = new McpServer({
      name: 'test-server',
      version: '1.0.0'
    });

    // Register a test tool that makes the HTTP request
    server.tool(
      'test-http',
      {
        description: 'Test HTTP request in MCP context'
      },
      async () => {
        console.log('🔧 Inside MCP tool context...');
        
        const result = await executeIsolatedHttpRequest({
          url: 'https://api.heyreach.io/api/public/auth/CheckApiKey',
          method: 'GET',
          headers: {
            'X-API-KEY': API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 30000
        });

        console.log('📊 MCP context result:', result.success ? '✅ SUCCESS' : '❌ FAILED');
        if (!result.success) {
          console.log('   Error:', result.error);
        }

        return {
          content: [{
            type: 'text',
            text: result.success ? 'SUCCESS' : `FAILED: ${result.error}`
          }]
        };
      }
    );

    // Simulate tool execution (without transport)
    console.log('🔧 Simulating tool execution...');
    
    // We can't directly call the tool, but we can test the environment
    // by creating the same context as the MCP server
    const result = await executeIsolatedHttpRequest({
      url: 'https://api.heyreach.io/api/public/auth/CheckApiKey',
      method: 'GET',
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000
    });

    console.log('📊 MCP server context result:', result.success ? '✅ SUCCESS' : '❌ FAILED');
    if (!result.success) {
      console.log('   Error:', result.error);
    }

  } catch (error) {
    console.log('❌ MCP server context error:', error.message);
  }

  console.log('\n✅ Environment comparison completed');
}

testEnvironmentComparison().catch(console.error);

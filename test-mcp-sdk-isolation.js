#!/usr/bin/env node

/**
 * Test MCP SDK Isolation
 * Test if the MCP SDK itself affects HTTP requests
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import axios from 'axios';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

async function testMcpSdkIsolation() {
  console.log('🔍 Testing MCP SDK Isolation\n');

  // Test 1: HTTP request BEFORE MCP server initialization
  console.log('1. Testing HTTP request BEFORE MCP server initialization...');
  try {
    const response = await axios.get('https://api.heyreach.io/api/public/auth/CheckApiKey', {
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });
    console.log('✅ HTTP request BEFORE MCP init successful:', response.status);
  } catch (error) {
    console.log('❌ HTTP request BEFORE MCP init failed:', error.response?.status, error.message);
  }

  // Test 2: Create MCP server (but don't connect transport)
  console.log('\n2. Creating MCP server instance...');
  try {
    const server = new McpServer({
      name: 'test-server',
      version: '1.0.0',
    });
    console.log('✅ MCP server instance created');

    // Test HTTP request AFTER MCP server creation
    console.log('\n3. Testing HTTP request AFTER MCP server creation...');
    const response = await axios.get('https://api.heyreach.io/api/public/auth/CheckApiKey', {
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });
    console.log('✅ HTTP request AFTER MCP server creation successful:', response.status);
  } catch (error) {
    console.log('❌ HTTP request AFTER MCP server creation failed:', error.response?.status, error.message);
  }

  // Test 3: Create STDIO transport (but don't connect)
  console.log('\n4. Creating STDIO transport...');
  try {
    const transport = new StdioServerTransport();
    console.log('✅ STDIO transport created');

    // Test HTTP request AFTER STDIO transport creation
    console.log('\n5. Testing HTTP request AFTER STDIO transport creation...');
    const response = await axios.get('https://api.heyreach.io/api/public/auth/CheckApiKey', {
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });
    console.log('✅ HTTP request AFTER STDIO transport creation successful:', response.status);
  } catch (error) {
    console.log('❌ HTTP request AFTER STDIO transport creation failed:', error.response?.status, error.message);
  }

  console.log('\n✅ MCP SDK isolation test completed');
}

testMcpSdkIsolation().catch(console.error);

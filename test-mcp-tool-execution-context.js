#!/usr/bin/env node

/**
 * Test MCP Tool Execution Context
 * Test if the MCP tool execution context affects HTTP requests
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import axios from 'axios';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

async function testMcpToolExecutionContext() {
  console.log('🔍 Testing MCP Tool Execution Context\n');

  // Create MCP server
  const server = new McpServer({
    name: 'test-server',
    version: '1.0.0',
  });

  // Register a test tool that makes HTTP requests
  server.tool(
    'test-http-request',
    {
      description: 'Test HTTP request within MCP tool context'
    },
    async () => {
      console.log('🔧 Inside MCP tool execution context...');
      
      try {
        console.log('🔧 Making HTTP request from within tool...');
        const response = await axios.get('https://api.heyreach.io/api/public/auth/CheckApiKey', {
          headers: {
            'X-API-KEY': API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 30000,
        });
        
        console.log('✅ HTTP request from within tool successful:', response.status);
        
        return {
          content: [{
            type: 'text',
            text: `HTTP request successful: ${response.status}`
          }]
        };
      } catch (error) {
        console.log('❌ HTTP request from within tool failed:', error.response?.status, error.message);
        
        return {
          content: [{
            type: 'text',
            text: `HTTP request failed: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  // Test tool execution directly (without transport)
  console.log('1. Testing tool execution directly (no transport)...');
  try {
    const result = await server.callTool('test-http-request', {});
    console.log('📊 Direct tool execution result:', result.content[0].text);
  } catch (error) {
    console.log('❌ Direct tool execution failed:', error.message);
  }

  console.log('\n✅ MCP tool execution context test completed');
}

testMcpToolExecutionContext().catch(console.error);

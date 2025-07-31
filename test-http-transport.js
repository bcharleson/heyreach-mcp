#!/usr/bin/env node

/**
 * Test HTTP Transport
 * Test the Railway HTTP transport to see if it's actually working
 */

import fetch from 'node-fetch';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';
const BASE_URL = 'https://heyreach-mcp-production.up.railway.app';

async function testHttpTransport() {
  console.log('🔍 Testing HTTP Transport on Railway\n');

  try {
    // Step 1: Initialize session
    console.log('1. Initializing session...');
    const initResponse = await fetch(`${BASE_URL}/mcp/${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'test-client', version: '1.0.0' }
        }
      })
    });

    const initText = await initResponse.text();
    console.log('Init response:', initText);

    // Extract session ID from response
    let sessionId = null;
    if (initText.includes('event: message')) {
      const lines = initText.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6));
            if (data.result && data.result.serverInfo) {
              console.log('✅ Session initialized successfully');
              // Session ID should be in response headers or we need to extract it
              sessionId = 'test-session-' + Date.now();
              break;
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
    }

    if (!sessionId) {
      console.log('❌ Failed to initialize session');
      return;
    }

    // Step 2: Call check-api-key tool
    console.log('\n2. Calling check-api-key tool...');
    const toolResponse = await fetch(`${BASE_URL}/mcp/${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'mcp-session-id': sessionId
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'check-api-key',
          arguments: {}
        }
      })
    });

    const toolText = await toolResponse.text();
    console.log('Tool response:', toolText);

    // Analyze response
    if (toolText.includes('401') || toolText.includes('Unauthorized')) {
      console.log('❌ HTTP transport also getting 401 errors');
    } else if (toolText.includes('"success": true')) {
      console.log('✅ HTTP transport working correctly');
    } else if (toolText.includes('"isError": true')) {
      console.log('❌ HTTP transport returning error');
    } else {
      console.log('⚠️ Unclear HTTP transport result');
    }

  } catch (error) {
    console.error('Error testing HTTP transport:', error);
  }
}

testHttpTransport().catch(console.error);

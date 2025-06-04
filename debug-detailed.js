#!/usr/bin/env node

/**
 * Detailed debugging to find the exact difference
 */

import axios from 'axios';
import { HeyReachClient } from './dist/heyreach-client.js';
import { HeyReachMcpServer } from './dist/server.js';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

async function debugDetailed() {
  console.log('🔍 Detailed Debugging...\n');

  // Test 1: Create HeyReach client exactly as MCP server does
  console.log('1️⃣ Testing HeyReach client (as MCP server creates it)...');
  try {
    const config = { apiKey: API_KEY };
    console.log('Config object:', config);
    
    const client = new HeyReachClient(config);
    console.log('Client created successfully');
    
    const result = await client.checkApiKey();
    console.log('✅ HeyReach client result:', result);
  } catch (error) {
    console.log('❌ HeyReach client error:', error.message);
    console.log('Error stack:', error.stack);
  }

  // Test 2: Create MCP server and test the client directly
  console.log('\n2️⃣ Testing MCP server client directly...');
  try {
    const config = { apiKey: API_KEY };
    const mcpServer = new HeyReachMcpServer(config);
    
    // Access the private client (this is a hack for debugging)
    const client = mcpServer.heyReachClient || mcpServer['heyReachClient'];
    
    if (client) {
      console.log('MCP server client found');
      const result = await client.checkApiKey();
      console.log('✅ MCP server client result:', result);
    } else {
      console.log('❌ Could not access MCP server client');
    }
  } catch (error) {
    console.log('❌ MCP server client error:', error.message);
    console.log('Error stack:', error.stack);
  }

  // Test 3: Check if there's a difference in the axios configuration
  console.log('\n3️⃣ Testing axios configuration differences...');
  try {
    // Create axios client exactly as HeyReachClient does
    const axiosClient = axios.create({
      baseURL: 'https://api.heyreach.io/api/public',
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });

    console.log('Axios config:', {
      baseURL: axiosClient.defaults.baseURL,
      headers: axiosClient.defaults.headers,
      timeout: axiosClient.defaults.timeout
    });

    const response = await axiosClient.get('/auth/CheckApiKey');
    console.log('✅ Direct axios with same config:', response.status, response.data);
  } catch (error) {
    console.log('❌ Direct axios error:', error.response?.status, error.response?.data || error.message);
  }

  // Test 4: Check if there's an environment difference
  console.log('\n4️⃣ Checking environment...');
  console.log('Node version:', process.version);
  console.log('Platform:', process.platform);
  console.log('Working directory:', process.cwd());
  console.log('API Key length:', API_KEY.length);
  console.log('API Key first 10 chars:', API_KEY.substring(0, 10));
  console.log('API Key last 5 chars:', API_KEY.substring(API_KEY.length - 5));

  // Test 5: Test with different base URLs
  console.log('\n5️⃣ Testing different base URLs...');
  const baseUrls = [
    'https://api.heyreach.io/api/public',
    'https://api.heyreach.io/api/public/',
    'https://api.heyreach.io',
  ];

  for (const baseUrl of baseUrls) {
    try {
      const response = await axios.get(`${baseUrl}/auth/CheckApiKey`, {
        headers: {
          'X-API-KEY': API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 30000,
      });
      console.log(`✅ ${baseUrl}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${baseUrl}: ${error.response?.status || error.message}`);
    }
  }
}

debugDetailed().catch(console.error);

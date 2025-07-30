#!/usr/bin/env node

/**
 * Check Railway deployment status
 */

const BASE_URL = 'https://heyreach-mcp-production.up.railway.app';

async function checkDeployment() {
  console.log('🔍 Checking Railway Deployment Status...\n');

  try {
    // Check main endpoint
    console.log('1️⃣ Checking main endpoint...');
    const mainResponse = await fetch(BASE_URL);
    const mainData = await mainResponse.json();
    
    console.log('📊 Current Deployment Info:');
    console.log(`   Version: ${mainData.version}`);
    console.log(`   Description: ${mainData.description}`);
    console.log(`   Endpoint: ${mainData.usage?.endpoint || 'N/A'}`);
    
    // Check if it's the new version with header auth
    const hasHeaderAuth = mainData.usage?.authentication?.includes('Header: X-API-Key');
    console.log(`   Header Auth Support: ${hasHeaderAuth ? '✅ Yes' : '❌ No'}`);
    
    // Check health endpoint
    console.log('\n2️⃣ Checking health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log(`   Status: ${healthData.status}`);
    console.log(`   Timestamp: ${healthData.timestamp}`);
    console.log(`   Active Sessions: ${healthData.sessions}`);
    
    // Determine deployment status
    console.log('\n📋 Deployment Analysis:');
    if (mainData.version === '2.0.3') {
      console.log('   ✅ Latest version (2.0.3) is deployed');
      console.log('   ✅ Header authentication is available');
    } else if (mainData.version === '2.0.2') {
      console.log('   ⚠️  Old version (2.0.2) is still deployed');
      console.log('   ⏳ Railway might still be building the new version');
      console.log('   💡 Check Railway dashboard for build status');
    } else {
      console.log(`   ❓ Unknown version: ${mainData.version}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking deployment:', error.message);
  }
}

checkDeployment(); 
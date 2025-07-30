#!/usr/bin/env node

// Comprehensive deployment configuration testing script
const fs = require('fs');
const path = require('path');
const https = require('https');

function testDeploymentConfig() {
  console.log('🧪 Testing HeyReach MCP Server v2.0.4 Deployment Configuration\n');
  
  // Test 1: Validate railway.toml
  console.log('1️⃣ Testing railway.toml configuration...');
  testRailwayToml();
  
  // Test 2: Validate vercel.json
  console.log('\n2️⃣ Testing vercel.json configuration...');
  testVercelJson();
  
  // Test 3: Test deployment URLs
  console.log('\n3️⃣ Testing deployment URLs...');
  testDeploymentUrls();
  
  // Test 4: Validate environment variables
  console.log('\n4️⃣ Testing environment variable configuration...');
  testEnvironmentVariables();
  
  console.log('\n🎉 Deployment configuration testing complete!');
}

function testRailwayToml() {
  const tomlPath = path.join(__dirname, 'railway.toml');
  
  if (!fs.existsSync(tomlPath)) {
    console.log('❌ railway.toml not found');
    return;
  }
  
  const content = fs.readFileSync(tomlPath, 'utf8');
  
  // Check for required sections
  const requiredSections = [
    '[build]',
    '[deploy]', 
    '[environments.production]',
    '[[services]]'
  ];
  
  const missingSections = requiredSections.filter(section => !content.includes(section));
  
  if (missingSections.length > 0) {
    console.log('❌ Missing required sections:', missingSections.join(', '));
  } else {
    console.log('✅ All required sections present');
  }
  
  // Check for environment variables
  const requiredEnvVars = [
    'ENABLE_DNS_REBINDING_PROTECTION',
    'ALLOWED_HOSTS',
    'RAILWAY_PUBLIC_DOMAIN'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !content.includes(envVar));
  
  if (missingEnvVars.length > 0) {
    console.log('❌ Missing environment variables:', missingEnvVars.join(', '));
  } else {
    console.log('✅ All required environment variables configured');
  }
  
  // Check for duplicate sections
  const sections = content.match(/^\[.*\]$/gm) || [];
  const duplicates = sections.filter((section, index) => sections.indexOf(section) !== index);
  
  if (duplicates.length > 0) {
    console.log('❌ Duplicate sections found:', [...new Set(duplicates)].join(', '));
  } else {
    console.log('✅ No duplicate sections');
  }
}

function testVercelJson() {
  const vercelPath = path.join(__dirname, 'vercel.json');
  
  if (!fs.existsSync(vercelPath)) {
    console.log('❌ vercel.json not found');
    return;
  }
  
  try {
    const content = fs.readFileSync(vercelPath, 'utf8');
    const config = JSON.parse(content);
    
    // Check required properties
    const requiredProps = ['builds', 'routes', 'env', 'headers'];
    const missingProps = requiredProps.filter(prop => !config[prop]);
    
    if (missingProps.length > 0) {
      console.log('❌ Missing required properties:', missingProps.join(', '));
    } else {
      console.log('✅ All required properties present');
    }
    
    // Check environment variables
    if (config.env && config.env.ALLOWED_HOSTS) {
      console.log('✅ ALLOWED_HOSTS environment variable configured');
    } else {
      console.log('❌ ALLOWED_HOSTS environment variable missing');
    }
    
    console.log('✅ vercel.json is valid JSON');
    
  } catch (error) {
    console.log('❌ vercel.json is invalid JSON:', error.message);
  }
}

function testDeploymentUrls() {
  const urls = [
    'https://railway.com/new',
    'https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbcharleson%2Fheyreach-mcp'
  ];
  
  urls.forEach((url, index) => {
    const platform = index === 0 ? 'Railway' : 'Vercel';
    console.log(`Testing ${platform} URL: ${url}`);
    
    // Simple URL validation
    try {
      new URL(url);
      console.log(`✅ ${platform} URL is valid`);
    } catch (error) {
      console.log(`❌ ${platform} URL is invalid:`, error.message);
    }
  });
}

function testEnvironmentVariables() {
  const envExamplePath = path.join(__dirname, '.env.example');
  
  if (!fs.existsSync(envExamplePath)) {
    console.log('❌ .env.example not found');
    return;
  }
  
  const content = fs.readFileSync(envExamplePath, 'utf8');
  
  const requiredVars = [
    'ENABLE_DNS_REBINDING_PROTECTION',
    'ALLOWED_HOSTS',
    'NODE_ENV',
    'PORT'
  ];
  
  const missingVars = requiredVars.filter(envVar => !content.includes(envVar));
  
  if (missingVars.length > 0) {
    console.log('❌ Missing environment variables in .env.example:', missingVars.join(', '));
  } else {
    console.log('✅ All required environment variables documented');
  }
  
  // Check for DNS rebinding protection configuration
  if (content.includes('ALLOWED_HOSTS=') && content.includes('ENABLE_DNS_REBINDING_PROTECTION=')) {
    console.log('✅ DNS rebinding protection properly configured');
  } else {
    console.log('❌ DNS rebinding protection configuration incomplete');
  }
}

// Run the tests
testDeploymentConfig();

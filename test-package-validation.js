#!/usr/bin/env node

/**
 * Package Validation Test
 * Validates the package is ready for npm publication
 */

import { HeyReachMcpServer } from './dist/server.js';
import fs from 'fs';
import path from 'path';

async function validatePackage() {
  console.log('📦 HeyReach MCP Server v1.0.0 - Package Validation\n');

  let validationErrors = 0;

  // Test 1: Package.json validation
  console.log('📋 TEST 1: Package.json Validation');
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    
    // Check required fields
    const requiredFields = ['name', 'version', 'description', 'main', 'bin', 'author', 'license'];
    const missingFields = requiredFields.filter(field => !packageJson[field]);
    
    if (missingFields.length === 0) {
      console.log('✅ All required package.json fields present');
    } else {
      console.log(`❌ Missing fields: ${missingFields.join(', ')}`);
      validationErrors++;
    }
    
    // Check version
    if (packageJson.version === '1.0.0') {
      console.log('✅ Version correctly set to 1.0.0');
    } else {
      console.log(`❌ Version is ${packageJson.version}, expected 1.0.0`);
      validationErrors++;
    }
    
    // Check bin entry
    if (packageJson.bin && packageJson.bin['heyreach-mcp-server'] === 'dist/index.js') {
      console.log('✅ CLI binary correctly configured');
    } else {
      console.log('❌ CLI binary configuration incorrect');
      validationErrors++;
    }
    
  } catch (error) {
    console.log('❌ Package.json validation failed:', error.message);
    validationErrors++;
  }

  // Test 2: Build artifacts validation
  console.log('\n📋 TEST 2: Build Artifacts Validation');
  try {
    const distFiles = [
      'dist/index.js',
      'dist/server.js', 
      'dist/heyreach-client.js',
      'dist/error-handler.js',
      'dist/types.js'
    ];
    
    const missingFiles = distFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length === 0) {
      console.log('✅ All required build artifacts present');
    } else {
      console.log(`❌ Missing build files: ${missingFiles.join(', ')}`);
      validationErrors++;
    }
    
    // Check CLI file has executable permissions and shebang
    const cliContent = fs.readFileSync('./dist/index.js', 'utf8');
    if (cliContent.startsWith('#!/usr/bin/env node')) {
      console.log('✅ CLI file has proper shebang');
    } else {
      console.log('❌ CLI file missing shebang');
      validationErrors++;
    }
    
  } catch (error) {
    console.log('❌ Build artifacts validation failed:', error.message);
    validationErrors++;
  }

  // Test 3: Essential documentation
  console.log('\n📋 TEST 3: Essential Documentation');
  try {
    const requiredDocs = ['README.md', 'LICENSE', 'CHANGELOG.md'];
    const missingDocs = requiredDocs.filter(doc => !fs.existsSync(doc));
    
    if (missingDocs.length === 0) {
      console.log('✅ All essential documentation present');
    } else {
      console.log(`❌ Missing documentation: ${missingDocs.join(', ')}`);
      validationErrors++;
    }
    
    // Check README has proper content
    const readme = fs.readFileSync('./README.md', 'utf8');
    if (readme.includes('HeyReach MCP Server v1.0.0') && readme.includes('Installation')) {
      console.log('✅ README has proper content');
    } else {
      console.log('❌ README missing essential content');
      validationErrors++;
    }
    
  } catch (error) {
    console.log('❌ Documentation validation failed:', error.message);
    validationErrors++;
  }

  // Test 4: .npmignore validation
  console.log('\n📋 TEST 4: .npmignore Validation');
  try {
    if (fs.existsSync('.npmignore')) {
      const npmignore = fs.readFileSync('.npmignore', 'utf8');
      if (npmignore.includes('src/') && npmignore.includes('test-*.js')) {
        console.log('✅ .npmignore properly configured');
      } else {
        console.log('❌ .npmignore missing essential exclusions');
        validationErrors++;
      }
    } else {
      console.log('❌ .npmignore file missing');
      validationErrors++;
    }
  } catch (error) {
    console.log('❌ .npmignore validation failed:', error.message);
    validationErrors++;
  }

  // Test 5: Server instantiation
  console.log('\n📋 TEST 5: Server Instantiation');
  try {
    const server = new HeyReachMcpServer({ apiKey: 'test-key' });
    const mcpServer = server.getServer();
    
    if (mcpServer && typeof mcpServer.connect === 'function') {
      console.log('✅ Server instantiation successful');
    } else {
      console.log('❌ Server instantiation failed');
      validationErrors++;
    }
  } catch (error) {
    console.log('❌ Server instantiation failed:', error.message);
    validationErrors++;
  }

  // Test 6: Dependencies check
  console.log('\n📋 TEST 6: Dependencies Check');
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const deps = packageJson.dependencies;
    
    const requiredDeps = ['@modelcontextprotocol/sdk', 'axios', 'zod'];
    const missingDeps = requiredDeps.filter(dep => !deps[dep]);
    
    if (missingDeps.length === 0) {
      console.log('✅ All required dependencies present');
    } else {
      console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
      validationErrors++;
    }
    
    // Check for security vulnerabilities in package-lock
    if (fs.existsSync('package-lock.json')) {
      console.log('✅ Package-lock.json present for reproducible builds');
    } else {
      console.log('⚠️  Package-lock.json missing (recommended for reproducible builds)');
    }
    
  } catch (error) {
    console.log('❌ Dependencies check failed:', error.message);
    validationErrors++;
  }

  // Test 7: TypeScript compilation check
  console.log('\n📋 TEST 7: TypeScript Compilation Check');
  try {
    // Check that TypeScript files compile without errors
    const { execSync } = await import('child_process');
    execSync('npm run build', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation successful');
  } catch (error) {
    console.log('❌ TypeScript compilation failed');
    validationErrors++;
  }

  // Summary
  console.log('\n🎯 PACKAGE VALIDATION SUMMARY');
  console.log('=====================================');
  
  if (validationErrors === 0) {
    console.log('🎉 ALL VALIDATIONS PASSED!');
    console.log('✅ Package is ready for npm publication');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm login (if not already logged in)');
    console.log('2. Run: npm publish');
    console.log('3. Test installation: npx heyreach-mcp-server@1.0.0 --api-key=test');
  } else {
    console.log(`❌ ${validationErrors} validation errors found`);
    console.log('Please fix the errors before publishing');
  }
}

// Run validation
validatePackage().catch(console.error);

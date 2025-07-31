#!/usr/bin/env node

/**
 * Test MCP SDK Versions
 * Systematically test intermediate MCP SDK versions to find the breaking change
 */

import { spawn } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';

const API_KEY = 'QGUYbd7rkBqswN0otgk8KvzCVRZ+h7Tiz0onFETzF6M=';

// Versions to test in order
const VERSIONS_TO_TEST = [
  '1.12.0', // Known working baseline
  '1.12.1',
  '1.12.2', 
  '1.12.3',
  '1.13.0',
  '1.13.1',
  '1.13.2',
  '1.13.3',
  '1.14.0',
  '1.15.0',
  '1.15.1',
  '1.16.0',
  '1.17.0'  // Known broken
];

async function testMcpSdkVersion(version) {
  console.log(`\n🔍 Testing MCP SDK version ${version}...`);
  
  return new Promise((resolve) => {
    // Install the specific version
    console.log(`📦 Installing @modelcontextprotocol/sdk@${version}...`);
    
    const installChild = spawn('npm', ['install', `@modelcontextprotocol/sdk@${version}`], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let installOutput = '';
    let installError = '';

    installChild.stdout.on('data', (data) => {
      installOutput += data.toString();
    });

    installChild.stderr.on('data', (data) => {
      installError += data.toString();
    });

    installChild.on('close', async (installCode) => {
      if (installCode !== 0) {
        console.log(`❌ Failed to install version ${version}:`, installError);
        resolve({ version, status: 'install_failed', error: installError });
        return;
      }

      console.log(`✅ Installed version ${version}`);

      // Try to build
      console.log(`🔨 Building with version ${version}...`);
      
      const buildChild = spawn('npm', ['run', 'build'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let buildOutput = '';
      let buildError = '';

      buildChild.stdout.on('data', (data) => {
        buildOutput += data.toString();
      });

      buildChild.stderr.on('data', (data) => {
        buildError += data.toString();
      });

      buildChild.on('close', async (buildCode) => {
        if (buildCode !== 0) {
          console.log(`❌ Build failed for version ${version}:`, buildError);
          resolve({ version, status: 'build_failed', error: buildError });
          return;
        }

        console.log(`✅ Build successful for version ${version}`);

        // Test STDIO transport
        console.log(`🧪 Testing STDIO transport with version ${version}...`);
        
        const testChild = spawn('node', ['test-local-stdio.js'], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let testOutput = '';
        let testError = '';

        testChild.stdout.on('data', (data) => {
          testOutput += data.toString();
        });

        testChild.stderr.on('data', (data) => {
          testError += data.toString();
        });

        testChild.on('close', (testCode) => {
          // Analyze the test output
          const success = testOutput.includes('✅ Success response detected') || 
                         testOutput.includes('"success": true');
          const unauthorized = testOutput.includes('401') || 
                              testOutput.includes('Unauthorized');

          let status;
          if (success) {
            status = 'working';
          } else if (unauthorized) {
            status = 'auth_failed';
          } else {
            status = 'unknown_error';
          }

          console.log(`📊 Version ${version} result: ${status}`);
          
          resolve({ 
            version, 
            status, 
            testOutput: testOutput.substring(0, 500), // First 500 chars
            testError: testError.substring(0, 500)
          });
        });

        // Send test input after delay
        setTimeout(() => {
          testChild.kill();
        }, 10000); // 10 second timeout
      });
    });
  });
}

async function runVersionTests() {
  console.log('🚀 Starting MCP SDK Version Investigation\n');
  console.log(`Testing ${VERSIONS_TO_TEST.length} versions to find the breaking change...\n`);

  const results = [];

  for (const version of VERSIONS_TO_TEST) {
    const result = await testMcpSdkVersion(version);
    results.push(result);
    
    // Log immediate result
    console.log(`📋 ${version}: ${result.status}`);
    
    // If this is the first broken version, we found our culprit
    if (result.status === 'auth_failed' && results.length > 1) {
      const previousResult = results[results.length - 2];
      if (previousResult.status === 'working') {
        console.log(`\n🎯 BREAKING CHANGE IDENTIFIED!`);
        console.log(`✅ Last working version: ${previousResult.version}`);
        console.log(`❌ First broken version: ${version}`);
        break;
      }
    }
  }

  // Summary report
  console.log('\n📊 FINAL RESULTS:');
  console.log('='.repeat(50));
  
  results.forEach(result => {
    const emoji = result.status === 'working' ? '✅' : 
                  result.status === 'auth_failed' ? '❌' : 
                  result.status === 'build_failed' ? '🔨' : 
                  result.status === 'install_failed' ? '📦' : '❓';
    console.log(`${emoji} ${result.version}: ${result.status}`);
  });

  // Save detailed results
  writeFileSync('mcp-sdk-version-test-results.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Detailed results saved to mcp-sdk-version-test-results.json');

  return results;
}

runVersionTests().catch(console.error);

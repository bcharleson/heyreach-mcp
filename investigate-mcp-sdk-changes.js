#!/usr/bin/env node

/**
 * Investigate MCP SDK Changes
 * Download and compare MCP SDK source code between versions
 */

import { spawn } from 'child_process';
import { mkdirSync, existsSync } from 'fs';

async function downloadMcpSdkSource(version) {
  console.log(`📥 Downloading MCP SDK ${version} source...`);
  
  const dir = `mcp-sdk-${version}`;
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  return new Promise((resolve) => {
    // Download the tarball and extract it
    const child = spawn('npm', ['pack', `@modelcontextprotocol/sdk@${version}`], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: dir
    });

    let output = '';
    let error = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      error += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Downloaded MCP SDK ${version}`);
        
        // Extract the tarball
        const tarFile = output.trim();
        const extractChild = spawn('tar', ['-xzf', tarFile], {
          stdio: ['pipe', 'pipe', 'pipe'],
          cwd: dir
        });

        extractChild.on('close', (extractCode) => {
          if (extractCode === 0) {
            console.log(`✅ Extracted MCP SDK ${version}`);
            resolve({ success: true, dir });
          } else {
            console.log(`❌ Failed to extract MCP SDK ${version}`);
            resolve({ success: false, error: 'Extract failed' });
          }
        });
      } else {
        console.log(`❌ Failed to download MCP SDK ${version}:`, error);
        resolve({ success: false, error });
      }
    });
  });
}

async function compareStdioTransport() {
  console.log('🔍 Investigating MCP SDK STDIO Transport Changes\n');

  // Download key versions for comparison
  const versions = ['1.12.0', '1.13.3'];
  
  for (const version of versions) {
    await downloadMcpSdkSource(version);
  }

  console.log('\n📊 Downloaded versions for comparison');
  console.log('Next steps:');
  console.log('1. Compare mcp-sdk-1.12.0/package/dist/server/stdio.js');
  console.log('2. Compare mcp-sdk-1.13.3/package/dist/server/stdio.js');
  console.log('3. Look for changes in request handling, async context, or error handling');
}

compareStdioTransport().catch(console.error);

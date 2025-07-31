/**
 * HTTP Isolation Wrapper
 * Isolates HTTP requests from MCP execution context to work around SDK issues
 */

import { spawn } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

export interface IsolatedHttpRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  data?: any;
  timeout?: number;
}

export interface IsolatedHttpResponse {
  success: boolean;
  status?: number;
  data?: any;
  error?: string;
}

/**
 * Execute HTTP request in isolated Node.js process to avoid MCP context issues
 */
export async function executeIsolatedHttpRequest(request: IsolatedHttpRequest): Promise<IsolatedHttpResponse> {
  return new Promise((resolve) => {
    // Create temporary script file
    const scriptPath = join(tmpdir(), `http-request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.mjs`);
    
    const script = `
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const axios = require('axios');

async function makeRequest() {
  try {
    const config = {
      method: '${request.method}',
      url: '${request.url}',
      headers: ${JSON.stringify(request.headers || {})},
      timeout: ${request.timeout || 30000},
    };

    if (${JSON.stringify(request.data)} && '${request.method}' !== 'GET') {
      config.data = ${JSON.stringify(request.data)};
    }

    const response = await axios(config);

    console.log(JSON.stringify({
      success: true,
      status: response.status,
      data: response.data
    }));
  } catch (error) {
    console.log(JSON.stringify({
      success: false,
      status: error.response?.status,
      error: error.message,
      data: error.response?.data
    }));
  }
}

makeRequest();
`;

    // Write script to temporary file
    writeFileSync(scriptPath, script);

    // Execute script in isolated process
    const child = spawn('node', [scriptPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_PATH: process.cwd() + '/node_modules'
      }
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      // Clean up temporary file
      try {
        unlinkSync(scriptPath);
      } catch (e) {
        // Ignore cleanup errors
      }

      try {
        if (output.trim()) {
          const result = JSON.parse(output.trim());
          resolve(result);
        } else {
          resolve({
            success: false,
            error: `Process exited with code ${code}. Error: ${errorOutput}`
          });
        }
      } catch (parseError: any) {
        resolve({
          success: false,
          error: `Failed to parse response: ${parseError.message}. Output: ${output}. Error: ${errorOutput}`
        });
      }
    });

    child.on('error', (error) => {
      // Clean up temporary file
      try {
        unlinkSync(scriptPath);
      } catch (e) {
        // Ignore cleanup errors
      }

      resolve({
        success: false,
        error: `Process error: ${error.message}`
      });
    });

    // Set timeout
    setTimeout(() => {
      child.kill();
      resolve({
        success: false,
        error: 'Request timeout'
      });
    }, (request.timeout || 30000) + 5000); // Add 5 seconds buffer
  });
}

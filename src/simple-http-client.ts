/**
 * Simple HTTP Client
 * Uses Node.js built-in modules to avoid axios issues
 */

import https from 'https';
import { URL } from 'url';

export interface SimpleHttpRequest {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  data?: any;
  timeout?: number;
}

export interface SimpleHttpResponse {
  success: boolean;
  status?: number;
  data?: any;
  error?: string;
}

export async function makeSimpleHttpRequest(request: SimpleHttpRequest): Promise<SimpleHttpResponse> {
  return new Promise((resolve) => {
    try {
      const url = new URL(request.url);
      const method = request.method || 'GET';
      const timeout = request.timeout || 30000;

      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          'User-Agent': 'HeyReach-MCP-Server/2.0.6',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...request.headers
        },
        timeout: timeout
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            let parsedData;
            if (data.trim()) {
              try {
                parsedData = JSON.parse(data);
              } catch (e) {
                parsedData = data;
              }
            } else {
              parsedData = null;
            }

            resolve({
              success: res.statusCode! >= 200 && res.statusCode! < 300,
              status: res.statusCode,
              data: parsedData
            });
          } catch (error) {
            resolve({
              success: false,
              error: `Response parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
          }
        });
      });

      req.on('error', (error) => {
        resolve({
          success: false,
          error: `Request error: ${error.message}`
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          success: false,
          error: 'Request timeout'
        });
      });

      // Send request data if present
      if (request.data && method !== 'GET') {
        const postData = typeof request.data === 'string' ? request.data : JSON.stringify(request.data);
        req.write(postData);
      }

      req.end();

    } catch (error) {
      resolve({
        success: false,
        error: `Request setup error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });
}

# HeyReach MCP Server - Deployment Guide

## Overview

The HeyReach MCP Server v2.0.0 supports dual transport modes:
- **Stdio Transport**: For local use with Claude Desktop, Cursor, etc.
- **HTTP Streaming Transport**: For cloud deployment and remote access

## Quick Start

### Local Development
```bash
# Stdio mode (original)
npm run dev -- --api-key=YOUR_API_KEY

# HTTP mode (new)
npm run dev:http
```

### Production Deployment
```bash
# Build the project
npm run build

# Start HTTP server
npm run start:http
```

## Transport Modes

### 1. Stdio Transport (Local)
**Use Case**: Local MCP clients (Claude Desktop, Cursor, Windsurf)
**Command**: `heyreach-mcp-server --api-key=YOUR_API_KEY`
**Configuration**: API key required as command line argument

### 2. HTTP Streaming Transport (Cloud)
**Use Case**: Remote access, n8n integration, cloud deployment
**Command**: `heyreach-mcp-http` or `heyreach-mcp-server --http`
**Configuration**: API key provided in URL path `/mcp/{API_KEY}`

## Cloud Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   ./scripts/deploy-vercel.sh
   ```

3. **Usage**:
   ```
   https://your-deployment.vercel.app/mcp/{API_KEY}
   ```

### Option 2: Railway

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy**:
   ```bash
   ./scripts/deploy-railway.sh
   ```

3. **Usage**:
   ```
   https://your-app.railway.app/mcp/{API_KEY}
   ```

### Option 3: Docker

1. **Build and Deploy**:
   ```bash
   ./scripts/deploy-docker.sh
   ```

2. **Usage**:
   ```
   http://localhost:3000/mcp/{API_KEY}
   ```

## API Endpoints

### Health Check
```bash
GET /health
```
Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-07-30T01:05:50.982Z",
  "sessions": 0
}
```

### MCP Endpoint
```bash
POST/GET/DELETE /mcp/{API_KEY}
```

**Headers Required**:
- `Content-Type: application/json`
- `Accept: application/json, text/event-stream`
- `mcp-session-id: {session-id}` (after initialization)

### Root Information
```bash
GET /
```
Response:
```json
{
  "name": "HeyReach MCP Server",
  "version": "2.0.0",
  "description": "HTTP Streaming MCP Server for HeyReach LinkedIn automation",
  "usage": {
    "endpoint": "/mcp/{API_KEY}",
    "methods": ["POST", "GET", "DELETE"],
    "example": "/mcp/QGUYbd7r..."
  }
}
```

## Configuration

### Environment Variables
```bash
# Server Configuration
NODE_ENV=production
PORT=3000

# CORS Configuration
CORS_ORIGIN=*
CORS_METHODS=GET,POST,DELETE,OPTIONS
CORS_HEADERS=Content-Type,mcp-session-id
CORS_EXPOSE_HEADERS=Mcp-Session-Id

# Security Configuration
ENABLE_DNS_REBINDING_PROTECTION=true
ALLOWED_HOSTS=127.0.0.1,localhost
```

### Client Configuration

#### Claude Desktop
```json
{
  "mcpServers": {
    "heyreach-http": {
      "command": "curl",
      "args": [
        "-X", "POST",
        "https://your-deployment.vercel.app/mcp/YOUR_API_KEY",
        "-H", "Content-Type: application/json",
        "-H", "Accept: application/json, text/event-stream"
      ]
    }
  }
}
```

#### n8n Integration
1. Use HTTP Request node
2. Set URL: `https://your-deployment.vercel.app/mcp/{API_KEY}`
3. Method: POST
4. Headers:
   - `Content-Type: application/json`
   - `Accept: application/json, text/event-stream`
5. Body: MCP JSON-RPC payload

## Testing

### Local Testing
```bash
# Start server
npm run start:http -- --port=3001

# Test health
curl http://localhost:3001/health

# Test MCP initialization
curl -X POST http://localhost:3001/mcp/YOUR_API_KEY \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test-client", "version": "1.0.0"}}}'
```

### Production Testing
```bash
# Test deployed instance
curl https://your-deployment.vercel.app/health

# Test MCP endpoint
curl -X POST https://your-deployment.vercel.app/mcp/YOUR_API_KEY \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'
```

## Security Considerations

1. **API Key Protection**: API keys are passed in URL path, ensure HTTPS in production
2. **DNS Rebinding Protection**: Enabled by default for security
3. **CORS Configuration**: Configure appropriately for your use case
4. **Rate Limiting**: Consider implementing rate limiting for production
5. **SSL/TLS**: Always use HTTPS in production deployments

## Troubleshooting

### Common Issues

1. **Port Already in Use**:
   ```bash
   # Use different port
   npm run start:http -- --port=3001
   ```

2. **DNS Rebinding Error**:
   - Add your domain to `allowedHosts` in `src/http-server.ts`

3. **CORS Issues**:
   - Check CORS headers in browser developer tools
   - Verify `Access-Control-Expose-Headers` includes `Mcp-Session-Id`

4. **Session Management**:
   - Ensure session ID is passed in subsequent requests
   - Check `mcp-session-id` header

### Logs and Monitoring

```bash
# Docker logs
docker-compose logs -f

# Application logs
# Check stderr output for server logs
```

## Migration from v1.x

1. **Backward Compatibility**: Stdio mode unchanged
2. **New Features**: HTTP streaming transport added
3. **Configuration**: No changes needed for existing stdio usage
4. **Deployment**: New deployment options available

## Support

- **GitHub Issues**: https://github.com/bcharleson/heyreach-mcp-server/issues
- **Documentation**: https://github.com/bcharleson/heyreach-mcp-server#readme
- **MCP Specification**: https://modelcontextprotocol.io/

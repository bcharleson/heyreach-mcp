# HeyReach MCP Server v2.0.0 - Deployment Guide for HeyReach Team

## 🚀 Executive Summary

The HeyReach MCP Server has been successfully modernized with dual transport support:
- **Stdio Transport**: Maintains backward compatibility for local MCP clients
- **HTTP Streaming Transport**: Enables cloud deployment and remote access for n8n integration

## 🎯 Key Achievements

### ✅ MCP SDK Update
- Updated to latest MCP TypeScript SDK v1.17.0
- Full compatibility with current MCP protocol specifications
- No breaking changes for existing stdio usage

### ✅ HTTP Streaming Transport
- Implemented URL-based API key authentication: `/mcp/{API_KEY}`
- Session management with proper cleanup
- CORS support for browser-based clients
- DNS rebinding protection for security

### ✅ Cloud Deployment Ready
- Docker containerization with multi-stage builds
- Vercel and Railway configuration files
- Environment variable handling
- Health check endpoints

### ✅ Production Features
- Graceful shutdown handling
- Error handling and logging
- Security headers and CORS configuration
- Concurrent session support

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐
│   Local Clients │    │  Remote Clients │
│ (Claude Desktop)│    │     (n8n)       │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          │ stdio                │ HTTP
          │                      │
    ┌─────▼──────────────────────▼─────┐
    │     HeyReach MCP Server v2.0     │
    │                                  │
    │  ┌─────────────┐ ┌─────────────┐ │
    │  │   Stdio     │ │    HTTP     │ │
    │  │ Transport   │ │  Streaming  │ │
    │  │             │ │  Transport  │ │
    │  └─────────────┘ └─────────────┘ │
    │                                  │
    │        HeyReach Tools            │
    │    (Campaign Management)         │
    └──────────────┬───────────────────┘
                   │
                   │ API Calls
                   │
    ┌──────────────▼───────────────────┐
    │         HeyReach API             │
    │      (api.heyreach.io)           │
    └──────────────────────────────────┘
```

## 🚀 Deployment Options for HeyReach

### Option 1: Deploy at heyreach.io/mcp/{API_KEY} (Recommended)

1. **Add to existing infrastructure**:
   ```bash
   # Clone the repository
   git clone https://github.com/bcharleson/heyreach-mcp-server.git
   cd heyreach-mcp-server
   
   # Install dependencies
   npm install
   
   # Build the project
   npm run build
   
   # Start HTTP server
   npm run start:http
   ```

2. **Configure reverse proxy** (nginx example):
   ```nginx
   location /mcp/ {
       proxy_pass http://localhost:3000/mcp/;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
       
       # CORS headers for MCP
       add_header Access-Control-Allow-Origin "*";
       add_header Access-Control-Allow-Methods "GET, POST, DELETE, OPTIONS";
       add_header Access-Control-Allow-Headers "Content-Type, mcp-session-id";
       add_header Access-Control-Expose-Headers "Mcp-Session-Id";
   }
   ```

3. **Usage**:
   ```
   https://heyreach.io/mcp/{API_KEY}
   ```

### Option 2: Standalone Cloud Deployment

1. **Vercel** (Fastest):
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Railway**:
   ```bash
   npm install -g @railway/cli
   railway up
   ```

3. **Docker**:
   ```bash
   docker build -t heyreach-mcp-server .
   docker run -p 3000:3000 heyreach-mcp-server
   ```

## 🔧 Configuration

### Environment Variables
```bash
# Server Configuration
NODE_ENV=production
PORT=3000

# CORS Configuration (adjust for your domain)
CORS_ORIGIN=https://heyreach.io,https://app.heyreach.io
CORS_METHODS=GET,POST,DELETE,OPTIONS
CORS_HEADERS=Content-Type,mcp-session-id
CORS_EXPOSE_HEADERS=Mcp-Session-Id

# Security Configuration
ENABLE_DNS_REBINDING_PROTECTION=true
ALLOWED_HOSTS=heyreach.io,app.heyreach.io
```

## 🧪 Testing the Deployment

### Health Check
```bash
curl https://your-domain.com/health
# Expected: {"status":"healthy","timestamp":"...","sessions":0}
```

### MCP Initialization
```bash
curl -X POST https://your-domain.com/mcp/QGUYbd7r... \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test-client", "version": "1.0.0"}}}'
```

### Tool Listing
```bash
# Use session ID from initialization response
curl -X POST https://your-domain.com/mcp/QGUYbd7r... \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: {session-id}" \
  -d '{"jsonrpc": "2.0", "id": 2, "method": "tools/list"}'
```

## 🔌 n8n Integration

### HTTP Request Node Configuration
1. **URL**: `https://heyreach.io/mcp/{API_KEY}`
2. **Method**: POST
3. **Headers**:
   - `Content-Type: application/json`
   - `Accept: application/json, text/event-stream`
   - `mcp-session-id: {session-id}` (after initialization)
4. **Body**: MCP JSON-RPC payload

### Example n8n Workflow
```json
{
  "nodes": [
    {
      "name": "Initialize MCP",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://heyreach.io/mcp/{{$env.HEYREACH_API_KEY}}",
        "method": "POST",
        "headers": {
          "Content-Type": "application/json",
          "Accept": "application/json, text/event-stream"
        },
        "body": {
          "jsonrpc": "2.0",
          "id": 1,
          "method": "initialize",
          "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "n8n", "version": "1.0.0"}
          }
        }
      }
    }
  ]
}
```

## 📊 Benefits for HeyReach

### 1. **Enhanced Integration Capabilities**
- n8n workflows can directly call HeyReach MCP tools
- Remote access enables cloud-based automation
- RESTful HTTP interface for broader compatibility

### 2. **Maintained Backward Compatibility**
- Existing Claude Desktop users unaffected
- Stdio transport remains unchanged
- Seamless upgrade path

### 3. **Production-Ready Features**
- Health monitoring endpoints
- Session management
- Error handling and logging
- Security best practices

### 4. **Scalability**
- Concurrent session support
- Stateless operation option
- Cloud deployment flexibility

## 🔒 Security Considerations

1. **API Key Protection**: Keys in URL path require HTTPS
2. **CORS Configuration**: Restrict origins in production
3. **DNS Rebinding Protection**: Enabled by default
4. **Rate Limiting**: Consider implementing for production
5. **SSL/TLS**: Always use HTTPS in production

## 📈 Next Steps

1. **Deploy to heyreach.io**: Integrate with existing infrastructure
2. **Update Documentation**: Add MCP HTTP endpoint to API docs
3. **Create n8n Templates**: Provide ready-to-use workflow templates
4. **Monitor Usage**: Track MCP endpoint usage and performance
5. **Gather Feedback**: Collect user feedback for future improvements

## 🆘 Support & Maintenance

- **Repository**: https://github.com/bcharleson/heyreach-mcp-server
- **Issues**: GitHub Issues for bug reports and feature requests
- **Documentation**: README.md and DEPLOYMENT.md for detailed setup
- **MCP Specification**: https://modelcontextprotocol.io/

## 📋 Checklist for HeyReach Team

- [ ] Review deployment architecture
- [ ] Choose deployment option (integrated vs standalone)
- [ ] Configure environment variables
- [ ] Set up monitoring and logging
- [ ] Test with n8n integration
- [ ] Update customer documentation
- [ ] Announce new HTTP streaming capability

---

**The HeyReach MCP Server v2.0.0 is ready for production deployment with full HTTP streaming support while maintaining complete backward compatibility.**

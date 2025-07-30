# Railway Deployment Template

This template provides one-click deployment of the HeyReach MCP Server to Railway with automatic DNS rebinding protection configuration.

## Template Configuration

The Railway template automatically configures:

- **Environment Variables**: Proper DNS rebinding protection settings
- **Health Checks**: Automatic health monitoring at `/health`
- **Auto-scaling**: 1-3 replicas based on CPU/memory usage
- **Custom Domains**: Support for your own domain names
- **CORS Headers**: Proper headers for n8n MCP Client compatibility

## Required Environment Variables

The template will prompt you to set:

1. **ALLOWED_HOSTS** (Required)
   - Your custom domain(s) for DNS rebinding protection
   - Example: `mcp.yourdomain.com,127.0.0.1,localhost`
   - Multiple domains separated by commas

2. **HEYREACH_API_KEY** (Optional)
   - Your HeyReach API key for testing
   - Can be set later via Railway dashboard

## Automatic Configuration

The template automatically sets:

```bash
NODE_ENV=production
ENABLE_DNS_REBINDING_PROTECTION=true
CORS_ORIGIN=*
CORS_METHODS=GET,POST,DELETE,OPTIONS
CORS_HEADERS=Content-Type,mcp-session-id,x-api-key,authorization
CORS_EXPOSE_HEADERS=Mcp-Session-Id
```

## Post-Deployment Steps

1. **Get your Railway domain**:
   ```bash
   # Your app will be available at:
   https://your-app-name.up.railway.app
   ```

2. **Add custom domain** (recommended):
   - Go to Railway Dashboard > Settings > Networking
   - Click "Custom Domain"
   - Add your domain (e.g., `mcp.yourdomain.com`)
   - Configure DNS CNAME record

3. **Update ALLOWED_HOSTS**:
   ```bash
   # Include both Railway and custom domains
   ALLOWED_HOSTS=mcp.yourdomain.com,your-app.up.railway.app,127.0.0.1,localhost
   ```

4. **Test deployment**:
   ```bash
   curl https://mcp.yourdomain.com/health
   ```

## n8n Integration

After deployment, use in n8n:

- **Endpoint**: `https://mcp.yourdomain.com/mcp`
- **Transport**: `HTTP Streamable`
- **Authentication**: `Header Auth` with `X-API-Key`

## Deployment URL

Use this URL for Railway deployment from GitHub:

```
https://railway.com/new?template=https://github.com/bcharleson/heyreach-mcp
```

## Button Code

```markdown
[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new?template=https://github.com/bcharleson/heyreach-mcp)
```

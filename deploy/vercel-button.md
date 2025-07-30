# Vercel Deployment Template

This template provides one-click deployment of the HeyReach MCP Server to Vercel with automatic DNS rebinding protection configuration.

## Template Configuration

The Vercel template automatically configures:

- **Build Settings**: Optimized Node.js build with TypeScript compilation
- **Routing**: Proper routing for MCP endpoints (`/mcp`, `/mcp/*`, `/health`)
- **Environment Variables**: DNS rebinding protection and CORS settings
- **Headers**: CORS headers for n8n MCP Client compatibility
- **Custom Domains**: Easy custom domain integration

## Required Environment Variables

The template will prompt you to set:

1. **ALLOWED_HOSTS** (Required)
   - Your custom domain(s) for DNS rebinding protection
   - Example: `mcp.yourdomain.com,your-app.vercel.app,127.0.0.1,localhost`
   - Multiple domains separated by commas

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

1. **Get your Vercel domain**:
   ```bash
   # Your app will be available at:
   https://your-app-name.vercel.app
   ```

2. **Add custom domain** (recommended):
   - Go to Vercel Dashboard > Project > Settings > Domains
   - Add your domain (e.g., `mcp.yourdomain.com`)
   - Follow DNS configuration instructions
   - Verify domain ownership

3. **Update ALLOWED_HOSTS**:
   ```bash
   # Include both Vercel and custom domains
   ALLOWED_HOSTS=mcp.yourdomain.com,your-app.vercel.app,127.0.0.1,localhost
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

## Template URL

Use this URL for the Vercel template:

```
https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbcharleson%2Fheyreach-mcp&env=ALLOWED_HOSTS&envDescription=Your%20custom%20domain%20for%20DNS%20rebinding%20protection&envLink=https%3A%2F%2Fgithub.com%2Fbcharleson%2Fheyreach-mcp%2Fblob%2Fmain%2Fdeploy%2FDEPLOYMENT_GUIDE.md
```

## Button Code

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbcharleson%2Fheyreach-mcp&env=ALLOWED_HOSTS&envDescription=Your%20custom%20domain%20for%20DNS%20rebinding%20protection&envLink=https%3A%2F%2Fgithub.com%2Fbcharleson%2Fheyreach-mcp%2Fblob%2Fmain%2Fdeploy%2FDEPLOYMENT_GUIDE.md)
```

## Build Configuration

The template uses these build settings:

```json
{
  "builds": [
    {
      "src": "dist/http-index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/mcp/(.*)",
      "dest": "/dist/http-index.js"
    },
    {
      "src": "/mcp",
      "dest": "/dist/http-index.js"
    },
    {
      "src": "/health",
      "dest": "/dist/http-index.js"
    },
    {
      "src": "/",
      "dest": "/dist/http-index.js"
    }
  ]
}
```

## Custom Domain Setup

1. **Add domain in Vercel**:
   - Dashboard > Project > Settings > Domains
   - Enter your domain: `mcp.yourdomain.com`

2. **Configure DNS**:
   - **CNAME Record**: `mcp` → `cname.vercel-dns.com`
   - Or follow Vercel's specific instructions

3. **Verify setup**:
   - Wait for DNS propagation (5-30 minutes)
   - Check SSL certificate is issued automatically
   - Test endpoint: `https://mcp.yourdomain.com/health`

## Troubleshooting

### Build Failures
- Ensure `npm run build` works locally
- Check TypeScript compilation errors
- Verify all dependencies are in `package.json`

### DNS Issues
- Use `dig mcp.yourdomain.com` to check DNS propagation
- Verify CNAME record points to correct Vercel target
- Wait up to 24 hours for full propagation

### Environment Variables
- Check variables are set in Vercel Dashboard
- Redeploy after changing environment variables
- Use Vercel CLI: `vercel env ls` to list variables

# 🚀 One-Click Deployment Guide

Deploy your HeyReach MCP Server to the cloud with a single click! This guide provides instant deployment options for Railway and Vercel with automatic DNS rebinding protection configuration.

## 🎯 Quick Deploy Options

### 🚂 Railway (Recommended for n8n)

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new)

**Deployment Steps:**
1. Click the "Deploy on Railway" button above
2. Sign in to Railway and connect your GitHub account
3. Select "Deploy from GitHub repo"
4. Search for and select `bcharleson/heyreach-mcp`
5. Railway will automatically detect the `railway.toml` configuration
6. Click "Deploy" - environment variables will be configured automatically

**Why Railway?**
- ✅ Automatic domain configuration with `${{RAILWAY_PUBLIC_DOMAIN}}`
- ✅ Built-in environment variable management
- ✅ Perfect for n8n MCP Client integration
- ✅ Auto-scaling and health checks included

### ▲ Vercel (Fastest Deployment)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbcharleson%2Fheyreach-mcp&env=ALLOWED_HOSTS&envDescription=Your%20custom%20domain%20for%20DNS%20rebinding%20protection&envLink=https%3A%2F%2Fgithub.com%2Fbcharleson%2Fheyreach-mcp%2Fblob%2Fmain%2Fdeploy%2FDEPLOYMENT_GUIDE.md)

**Why Vercel?**
- ⚡ Instant global deployment
- 🌐 Automatic HTTPS and CDN
- 🔧 Easy custom domain setup
- 📊 Built-in analytics

## 📋 Pre-Deployment Checklist

Before clicking deploy, ensure you have:

1. **HeyReach API Key** 
   - Log into your HeyReach account
   - Navigate to Settings > API Keys
   - Generate a new API key
   - Copy the key (format: `QGUYbd7r...`)

2. **Custom Domain** (Optional but recommended)
   - A domain you own (e.g., `mcp.yourdomain.com`)
   - Access to your DNS provider (Cloudflare, Namecheap, etc.)

## 🔧 Post-Deployment Configuration

### Step 1: Set Environment Variables

After deployment, configure these environment variables in your platform:

#### Railway Configuration
```bash
# In Railway Dashboard > Variables
ENABLE_DNS_REBINDING_PROTECTION=true
ALLOWED_HOSTS=your-app.railway.app,mcp.yourdomain.com,127.0.0.1,localhost
CORS_ORIGIN=*
```

#### Vercel Configuration
```bash
# In Vercel Dashboard > Settings > Environment Variables
ALLOWED_HOSTS=your-app.vercel.app,mcp.yourdomain.com,127.0.0.1,localhost
ENABLE_DNS_REBINDING_PROTECTION=true
```

### Step 2: Add Custom Domain (Optional)

#### Railway Custom Domain
1. Go to Railway Dashboard > Your Service > Settings
2. Click "Custom Domain" in Networking section
3. Add your domain (e.g., `mcp.yourdomain.com`)
4. Copy the CNAME target provided
5. In your DNS provider, create a CNAME record:
   - **Name**: `mcp` (or your subdomain)
   - **Target**: `your-cname.railway.app`
6. Wait for DNS propagation (5-30 minutes)

#### Vercel Custom Domain
1. Go to Vercel Dashboard > Your Project > Settings > Domains
2. Add your domain (e.g., `mcp.yourdomain.com`)
3. Follow Vercel's DNS configuration instructions
4. Verify domain ownership

### Step 3: Update Environment Variables with Custom Domain

After adding your custom domain, update the `ALLOWED_HOSTS` variable:

```bash
# Railway
ALLOWED_HOSTS=mcp.yourdomain.com,your-app.railway.app,127.0.0.1,localhost

# Vercel  
ALLOWED_HOSTS=mcp.yourdomain.com,your-app.vercel.app,127.0.0.1,localhost
```

## 🧪 Testing Your Deployment

### Health Check
```bash
curl https://mcp.yourdomain.com/health
# Expected: {"status":"healthy","timestamp":"...","sessions":0}
```

### MCP Endpoint Test
```bash
curl -X POST https://mcp.yourdomain.com/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "X-API-Key: YOUR_HEYREACH_API_KEY" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}'
```

## 🔌 n8n Integration

### MCP Client Configuration

After successful deployment, configure n8n:

1. **Create MCP Client Credentials**:
   - **Type**: `MCP Client (HTTP)`
   - **Name**: `HeyReach MCP`

2. **Configuration**:
   - **Endpoint**: `https://mcp.yourdomain.com/mcp`
   - **Server Transport**: `HTTP Streamable`
   - **Authentication**: `Header Auth`

3. **Header Authentication**:
   - **Header Name**: `X-API-Key`
   - **Header Value**: `YOUR_HEYREACH_API_KEY`

### Test n8n Connection

1. Add **MCP Client** node to your workflow
2. Select your HeyReach MCP credentials
3. Set **Tools to Include**: `All`
4. Execute the node - you should see all 12 HeyReach tools available

## 🔒 Security Best Practices

### DNS Rebinding Protection
- ✅ Always keep `ENABLE_DNS_REBINDING_PROTECTION=true`
- ✅ Only include necessary domains in `ALLOWED_HOSTS`
- ✅ Use specific domains, avoid wildcards

### API Key Security
- 🔐 Never commit API keys to version control
- 🔐 Use environment variables for API keys
- 🔐 Rotate API keys regularly
- 🔐 Monitor API key usage in HeyReach dashboard

### HTTPS Configuration
- 🔒 Always use HTTPS in production
- 🔒 Railway and Vercel provide automatic SSL certificates
- 🔒 Verify SSL certificate validity after custom domain setup

## 🚨 Troubleshooting

### Common Issues

#### "Could not connect to MCP server" in n8n
**Solution**: Check `ALLOWED_HOSTS` environment variable includes your domain

#### "Invalid Host header" errors
**Solution**: Add your deployment domain to `ALLOWED_HOSTS`

#### Custom domain not working
**Solution**: 
1. Verify DNS propagation: `dig mcp.yourdomain.com`
2. Check CNAME record points to correct target
3. Wait up to 24 hours for full DNS propagation

#### API key authentication failing
**Solution**:
1. Verify API key is correct in HeyReach dashboard
2. Check environment variables are set correctly
3. Test API key with direct curl request

### Getting Help

- **GitHub Issues**: [Report deployment issues](https://github.com/bcharleson/heyreach-mcp/issues)
- **Railway Support**: [Railway Help Center](https://help.railway.app/)
- **Vercel Support**: [Vercel Documentation](https://vercel.com/docs)

## 🎉 Success!

Once deployed and configured, your HeyReach MCP Server will be:
- ✅ Accessible via HTTPS with custom domain
- ✅ Protected against DNS rebinding attacks
- ✅ Compatible with n8n MCP Client
- ✅ Auto-scaling and monitored
- ✅ Ready for production LinkedIn automation workflows

Your MCP server endpoint: `https://mcp.yourdomain.com/mcp`

Use this endpoint in n8n with header authentication for seamless LinkedIn automation! 🚀

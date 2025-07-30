# Railway Template Creation Guide

This guide explains how to create an official Railway template for the HeyReach MCP Server, which will provide a true one-click deployment experience.

## 🎯 Benefits of Creating a Railway Template

- **True One-Click Deployment**: Users get direct `railway.com/new/template/{ID}` URL
- **No Manual Repository Selection**: Template automatically uses our repository
- **Kickback Program**: Earn 50% of usage costs from template deployments
- **Marketplace Visibility**: Listed in Railway's template marketplace
- **Professional Presentation**: Better branding and description

## 📋 Prerequisites

- Railway account with GitHub connected
- Admin access to `bcharleson/heyreach-mcp` repository
- Working `railway.toml` configuration (✅ already implemented)

## 🛠️ Step-by-Step Template Creation

### Step 1: Access Template Composer

1. Go to [Railway Template Composer](https://railway.com/compose)
2. Sign in to your Railway account
3. Click "Add New" to add a service

### Step 2: Configure Service

1. **Select Source**: Choose "GitHub Repository"
2. **Repository**: Enter `https://github.com/bcharleson/heyreach-mcp`
3. **Branch**: Leave as `main` (default)
4. **Service Name**: `heyreach-mcp-server`

### Step 3: Configure Variables

Add these environment variables in the **Variables** tab:

```bash
# Required Variables (will be auto-configured)
NODE_ENV=production
ENABLE_DNS_REBINDING_PROTECTION=true
ALLOWED_HOSTS=${{RAILWAY_PUBLIC_DOMAIN}},127.0.0.1,localhost

# CORS Configuration
CORS_ORIGIN=*
CORS_METHODS=GET,POST,DELETE,OPTIONS
CORS_HEADERS=Content-Type,mcp-session-id,x-api-key,authorization
CORS_EXPOSE_HEADERS=Mcp-Session-Id

# Optional: Port (Railway auto-detects from railway.toml)
PORT=3000
```

### Step 4: Configure Settings

In the **Settings** tab:

1. **Public Networking**: Enable HTTP (port 3000)
2. **Healthcheck Path**: `/health`
3. **Start Command**: `npm run start:http` (auto-detected from railway.toml)

### Step 5: Template Metadata

1. **Template Name**: `HeyReach MCP Server`
2. **Description**: 
   ```
   Deploy HeyReach MCP Server for LinkedIn automation with n8n integration. 
   Includes automatic DNS rebinding protection, CORS configuration, and 
   HTTP Streamable transport for seamless n8n MCP Client connectivity.
   ```
3. **Tags**: `mcp`, `n8n`, `linkedin`, `automation`, `api`, `typescript`
4. **Category**: `API & Backend`

### Step 6: Create Template

1. Click **"Create Template"**
2. Review the configuration
3. Save the template

### Step 7: Publish Template

1. Go to [Workspace Templates](https://railway.com/workspace/templates)
2. Find your "HeyReach MCP Server" template
3. Click **"Publish"**
4. Fill out the publishing form:
   - **Icon**: Upload HeyReach logo or use default
   - **Demo URL**: Optional - link to live demo
   - **Documentation**: Link to GitHub repository
   - **Support**: Link to GitHub issues

## 🎉 Result

After publishing, you'll get:

- **Template URL**: `https://railway.com/new/template/{UNIQUE_ID}`
- **Marketplace Listing**: Visible in Railway templates
- **Deploy Button**: 
  ```markdown
  [![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/{UNIQUE_ID})
  ```

## 💰 Kickback Program

Once published, you'll automatically earn:
- **50% of usage costs** from template deployments
- **Railway credits** or **cash withdrawals**
- **Minimum payout**: $100 increments
- **Processing time**: 5-7 business days

## 🔄 Template Updates

Railway templates support **updatable templates**:
- When you update the GitHub repository, Railway detects changes
- Users get notified of updates via pull requests
- They can review and merge updates to their deployments

## 📊 Template Analytics

Track your template performance:
- **Deployment count**: How many times deployed
- **Usage statistics**: Resource consumption
- **Earnings**: Kickback amounts
- **User feedback**: Ratings and reviews

## 🚀 Next Steps

1. **Create the template** using the steps above
2. **Update deployment buttons** in README.md and documentation
3. **Test the template** by deploying it yourself
4. **Share with community** on Discord, Twitter, etc.
5. **Monitor performance** and iterate based on feedback

## 📝 Template Configuration Reference

The template will automatically use our existing `railway.toml`:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run start:http"
healthcheckPath = "/health"

[environments.production]
variables = {
  NODE_ENV = "production",
  ENABLE_DNS_REBINDING_PROTECTION = "true",
  ALLOWED_HOSTS = "${{RAILWAY_PUBLIC_DOMAIN}},127.0.0.1,localhost",
  # ... other variables
}
```

This ensures consistent deployment behavior and automatic environment configuration.

---

**Ready to create the template?** Visit [railway.com/compose](https://railway.com/compose) and follow the steps above!

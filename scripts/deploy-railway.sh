#!/bin/bash

# HeyReach MCP Server - Railway Deployment Script
# This script deploys the HeyReach MCP Server to Railway with proper environment configuration

set -e

echo "🚂 Deploying HeyReach MCP Server to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo "Please login to Railway:"
    railway login
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

# Set environment variables
echo "⚙️ Configuring environment variables..."

# Get the Railway domain
RAILWAY_DOMAIN=$(railway domain | grep -o 'https://[^[:space:]]*' | sed 's/https:\/\///')

if [ -z "$RAILWAY_DOMAIN" ]; then
    echo "⚠️ Could not detect Railway domain. Please set ALLOWED_HOSTS manually."
    echo "Go to Railway Dashboard > Variables and set:"
    echo "ALLOWED_HOSTS=your-app.up.railway.app,127.0.0.1,localhost"
else
    echo "🌐 Detected Railway domain: $RAILWAY_DOMAIN"
    railway variables set ALLOWED_HOSTS="$RAILWAY_DOMAIN,127.0.0.1,localhost"
fi

# Set other required environment variables
railway variables set ENABLE_DNS_REBINDING_PROTECTION=true
railway variables set NODE_ENV=production
railway variables set CORS_ORIGIN="*"
railway variables set CORS_METHODS="GET,POST,DELETE,OPTIONS"
railway variables set CORS_HEADERS="Content-Type,mcp-session-id,x-api-key,authorization"
railway variables set CORS_EXPOSE_HEADERS="Mcp-Session-Id"

echo "✅ Deployment complete!"
echo ""
echo "🎉 Your HeyReach MCP Server is now deployed!"
echo "📍 URL: https://$RAILWAY_DOMAIN"
echo "🏥 Health Check: https://$RAILWAY_DOMAIN/health"
echo "🔌 MCP Endpoint: https://$RAILWAY_DOMAIN/mcp"
echo ""
echo "📋 Next Steps:"
echo "1. Test the deployment: curl https://$RAILWAY_DOMAIN/health"
echo "2. Configure n8n MCP Client with:"
echo "   - Endpoint: https://$RAILWAY_DOMAIN/mcp"
echo "   - Transport: HTTP Streamable"
echo "   - Authentication: Header Auth (X-API-Key)"
echo "3. Add custom domain (optional): railway domain add your-domain.com"
echo ""
echo "📖 For detailed setup instructions, see: deploy/DEPLOYMENT_GUIDE.md"

# Deploy HeyReach MCP Server to Railway

set -e

echo "🚀 Deploying HeyReach MCP Server to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo "Please login to Railway:"
    railway login
fi

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to Railway
echo "🌐 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Check deployment status: railway status"
echo "2. Get deployment URL: railway domain"
echo "3. Test the deployment: curl https://your-app.railway.app/health"
echo "4. Use MCP endpoint: https://your-app.railway.app/mcp/{API_KEY}"
echo ""
echo "📖 Documentation:"
echo "- Railway Dashboard: https://railway.app/dashboard"
echo "- MCP Usage: POST/GET/DELETE to /mcp/{API_KEY}"
echo "- Health Check: GET /health"

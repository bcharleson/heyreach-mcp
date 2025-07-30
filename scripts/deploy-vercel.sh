#!/bin/bash

# HeyReach MCP Server - Vercel Deployment Script
# This script deploys the HeyReach MCP Server to Vercel with proper environment configuration

set -e

echo "▲ Deploying HeyReach MCP Server to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel:"
    vercel login
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

# Get the Vercel domain
VERCEL_DOMAIN=$(vercel ls | grep -o 'https://[^[:space:]]*' | head -1 | sed 's/https:\/\///')

if [ -z "$VERCEL_DOMAIN" ]; then
    echo "⚠️ Could not detect Vercel domain. Please set ALLOWED_HOSTS manually."
    echo "Go to Vercel Dashboard > Project > Settings > Environment Variables and set:"
    echo "ALLOWED_HOSTS=your-app.vercel.app,127.0.0.1,localhost"
else
    echo "🌐 Detected Vercel domain: $VERCEL_DOMAIN"

    # Set environment variables
    echo "⚙️ Configuring environment variables..."
    vercel env add ALLOWED_HOSTS production <<< "$VERCEL_DOMAIN,127.0.0.1,localhost"
    vercel env add ENABLE_DNS_REBINDING_PROTECTION production <<< "true"
    vercel env add NODE_ENV production <<< "production"
    vercel env add CORS_ORIGIN production <<< "*"
    vercel env add CORS_METHODS production <<< "GET,POST,DELETE,OPTIONS"
    vercel env add CORS_HEADERS production <<< "Content-Type,mcp-session-id,x-api-key,authorization"
    vercel env add CORS_EXPOSE_HEADERS production <<< "Mcp-Session-Id"

    # Redeploy with new environment variables
    echo "🔄 Redeploying with environment variables..."
    vercel --prod
fi

echo "✅ Deployment complete!"
echo ""
echo "🎉 Your HeyReach MCP Server is now deployed!"
echo "📍 URL: https://$VERCEL_DOMAIN"
echo "🏥 Health Check: https://$VERCEL_DOMAIN/health"
echo "🔌 MCP Endpoint: https://$VERCEL_DOMAIN/mcp"
echo ""
echo "📋 Next Steps:"
echo "1. Test the deployment: curl https://$VERCEL_DOMAIN/health"
echo "2. Configure n8n MCP Client with:"
echo "   - Endpoint: https://$VERCEL_DOMAIN/mcp"
echo "   - Transport: HTTP Streamable"
echo "   - Authentication: Header Auth (X-API-Key)"
echo "3. Add custom domain (optional): vercel domains add your-domain.com"
echo ""
echo "📖 For detailed setup instructions, see: deploy/DEPLOYMENT_GUIDE.md"

# Deploy HeyReach MCP Server to Vercel

set -e

echo "🚀 Deploying HeyReach MCP Server to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Note the deployment URL from Vercel"
echo "2. Test the deployment: curl https://your-deployment-url.vercel.app/health"
echo "3. Use MCP endpoint: https://your-deployment-url.vercel.app/mcp/{API_KEY}"
echo ""
echo "📖 Documentation:"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo "- MCP Usage: POST/GET/DELETE to /mcp/{API_KEY}"
echo "- Health Check: GET /health"

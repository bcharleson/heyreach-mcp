#!/bin/bash

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

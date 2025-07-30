#!/bin/bash

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

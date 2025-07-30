#!/bin/bash

# Deploy HeyReach MCP Server using Docker

set -e

echo "🚀 Deploying HeyReach MCP Server with Docker..."

# Build Docker image
echo "📦 Building Docker image..."
docker build -t heyreach-mcp-server:latest .

# Tag for registry (optional)
if [ ! -z "$DOCKER_REGISTRY" ]; then
    echo "🏷️  Tagging for registry: $DOCKER_REGISTRY"
    docker tag heyreach-mcp-server:latest $DOCKER_REGISTRY/heyreach-mcp-server:latest
    
    echo "📤 Pushing to registry..."
    docker push $DOCKER_REGISTRY/heyreach-mcp-server:latest
fi

# Run with Docker Compose
echo "🐳 Starting services with Docker Compose..."
docker-compose up -d

# Wait for health check
echo "⏳ Waiting for health check..."
sleep 10

# Test deployment
echo "🧪 Testing deployment..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Deployment successful!"
    echo ""
    echo "📋 Service Information:"
    echo "- Health Check: http://localhost:3000/health"
    echo "- MCP Endpoint: http://localhost:3000/mcp/{API_KEY}"
    echo "- Docker Logs: docker-compose logs -f"
    echo "- Stop Services: docker-compose down"
else
    echo "❌ Health check failed!"
    echo "📋 Troubleshooting:"
    echo "- Check logs: docker-compose logs"
    echo "- Check status: docker-compose ps"
    exit 1
fi

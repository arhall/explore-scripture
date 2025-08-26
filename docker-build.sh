#!/bin/bash

# Bible Static Site Docker Build Script
set -e

echo "🐳 Building Bible Static Site Docker image..."

# Build production image
docker build -t bible-static-site:latest .

echo "✅ Build complete!"
echo ""
echo "🚀 To run the container:"
echo "  docker run -p 8080:80 bible-static-site:latest"
echo ""
echo "📋 Or use docker-compose:"
echo "  docker-compose up"
echo ""
echo "🔧 For development with live reloading:"
echo "  docker-compose --profile dev up bible-site-dev"
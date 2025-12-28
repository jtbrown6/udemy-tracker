#!/bin/bash

# Build and push script for Udemy Tracker
# Usage: ./scripts/build-and-push.sh <registry> <version>
# Example: ./scripts/build-and-push.sh ghcr.io/yourusername v1.0.0

set -e

if [ -z "$1" ]; then
  echo "Error: Registry not specified"
  echo "Usage: $0 <registry> [version]"
  echo "Example: $0 ghcr.io/yourusername v1.0.0"
  exit 1
fi

REGISTRY=$1
VERSION=${2:-latest}
API_URL=${VITE_API_URL:-""}

echo "========================================="
echo "Building Udemy Tracker"
echo "Registry: $REGISTRY"
echo "Version: $VERSION"
echo "API URL: $API_URL"
echo "========================================="

# Build backend
echo ""
echo "Building backend..."
docker build -t ${REGISTRY}/udemy-tracker-backend:${VERSION} ./server
docker tag ${REGISTRY}/udemy-tracker-backend:${VERSION} ${REGISTRY}/udemy-tracker-backend:latest

# Build frontend
echo ""
echo "Building frontend..."
if [ -n "$API_URL" ]; then
  docker build --build-arg VITE_API_URL=${API_URL} -t ${REGISTRY}/udemy-tracker-frontend:${VERSION} .
else
  echo "Warning: VITE_API_URL not set. Frontend will use default (http://localhost:3001)"
  docker build -t ${REGISTRY}/udemy-tracker-frontend:${VERSION} .
fi
docker tag ${REGISTRY}/udemy-tracker-frontend:${VERSION} ${REGISTRY}/udemy-tracker-frontend:latest

# Push images
echo ""
echo "Pushing images..."
docker push ${REGISTRY}/udemy-tracker-backend:${VERSION}
docker push ${REGISTRY}/udemy-tracker-backend:latest
docker push ${REGISTRY}/udemy-tracker-frontend:${VERSION}
docker push ${REGISTRY}/udemy-tracker-frontend:latest

echo ""
echo "========================================="
echo "Build and push completed!"
echo "Backend: ${REGISTRY}/udemy-tracker-backend:${VERSION}"
echo "Frontend: ${REGISTRY}/udemy-tracker-frontend:${VERSION}"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Update image references in k8s/*-deployment.yaml"
echo "2. Apply manifests: kubectl apply -f k8s/"


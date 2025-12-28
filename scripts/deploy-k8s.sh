#!/bin/bash

# Deploy to Kubernetes
# Usage: ./scripts/deploy-k8s.sh

set -e

echo "========================================="
echo "Deploying Udemy Tracker to Kubernetes"
echo "========================================="

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl not found. Please install kubectl."
    exit 1
fi

# Apply manifests
echo ""
echo "Creating namespace..."
kubectl apply -f k8s/namespace.yaml

echo ""
echo "Creating PVC..."
kubectl apply -f k8s/pvc.yaml

echo ""
echo "Deploying backend..."
kubectl apply -f k8s/backend-deployment.yaml

echo ""
echo "Deploying frontend..."
kubectl apply -f k8s/frontend-deployment.yaml

# Optional: Deploy ingress
if [ -f k8s/ingress.yaml ]; then
  read -p "Deploy ingress? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deploying ingress..."
    kubectl apply -f k8s/ingress.yaml
  fi
fi

echo ""
echo "========================================="
echo "Deployment initiated!"
echo "========================================="
echo ""
echo "Check status:"
echo "  kubectl get all -n udemy-tracker"
echo ""
echo "Check PVC:"
echo "  kubectl get pvc -n udemy-tracker"
echo ""
echo "View logs:"
echo "  kubectl logs -n udemy-tracker -l app=udemy-tracker-backend -f"
echo "  kubectl logs -n udemy-tracker -l app=udemy-tracker-frontend -f"
echo ""
echo "Port forward for testing:"
echo "  kubectl port-forward -n udemy-tracker svc/udemy-tracker-frontend 3000:80"


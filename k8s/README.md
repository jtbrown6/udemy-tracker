# Kubernetes Deployment Guide

This guide will help you deploy the Udemy Tracker to your private Kubernetes cluster.

## Prerequisites

- Kubernetes cluster up and running
- `kubectl` configured to access your cluster
- Docker registry access (or use local images with kind/minikube)

## Quick Start

### 1. Build and Push Images

```bash
# Build backend
cd server
docker build -t your-registry/udemy-tracker-backend:latest .
docker push your-registry/udemy-tracker-backend:latest

# Build frontend (set API URL based on your deployment)
cd ..
docker build \
  --build-arg VITE_API_URL=http://udemy-tracker-backend.udemy-tracker.svc.cluster.local:3001 \
  -t your-registry/udemy-tracker-frontend:latest .
docker push your-registry/udemy-tracker-frontend:latest
```

**Note:** If using Ingress, set `VITE_API_URL` to your public domain (e.g., `https://udemy-tracker.yourdomain.com`)

### 2. Update Kubernetes Manifests

Edit the deployment files to use your Docker registry:

```bash
# Update image references in:
# - k8s/backend-deployment.yaml
# - k8s/frontend-deployment.yaml

# Replace "your-registry" with your actual registry
sed -i 's|your-registry|ghcr.io/yourusername|g' k8s/*-deployment.yaml
```

If using a storage class other than default, update `k8s/pvc.yaml`:

```yaml
spec:
  storageClassName: your-storage-class  # e.g., longhorn, nfs-client, etc.
```

### 3. Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/pvc.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# Optional: If using Ingress instead of LoadBalancer
# kubectl apply -f k8s/ingress.yaml
```

### 4. Verify Deployment

```bash
# Check all resources
kubectl get all -n udemy-tracker

# Check PVC status
kubectl get pvc -n udemy-tracker

# Check logs
kubectl logs -n udemy-tracker -l app=udemy-tracker-backend
kubectl logs -n udemy-tracker -l app=udemy-tracker-frontend

# Check backend health
kubectl port-forward -n udemy-tracker svc/udemy-tracker-backend 3001:3001
curl http://localhost:3001/health
```

### 5. Access the Application

**If using LoadBalancer:**
```bash
kubectl get svc -n udemy-tracker udemy-tracker-frontend
# Note the EXTERNAL-IP and access via browser
```

**If using Ingress:**
- Update DNS to point to your Ingress controller
- Access via your configured domain (e.g., `https://udemy-tracker.yourdomain.com`)

**For local testing:**
```bash
kubectl port-forward -n udemy-tracker svc/udemy-tracker-frontend 3000:80
# Access at http://localhost:3000
```

## Storage Details

### PersistentVolumeClaim

- **Name:** `udemy-tracker-data`
- **Size:** 1Gi (more than enough for SQLite database)
- **Access Mode:** ReadWriteOnce (single pod access)
- **Location:** `/data/courses.db` in the backend pod

### Important Notes

1. **Single Backend Replica:** The backend runs with `replicas: 1` because SQLite is file-based and cannot be shared across multiple pods.

2. **Recreate Strategy:** The deployment uses `Recreate` strategy to ensure the old pod releases the PVC before a new one starts.

3. **Data Persistence:** All course data is stored in the SQLite database on the PVC. If you delete the PVC, you'll lose all data.

4. **Backup Strategy:** Since it's a single SQLite file, you can easily back it up:
   ```bash
   kubectl exec -n udemy-tracker deployment/udemy-tracker-backend -- cat /data/courses.db > backup.db
   ```

5. **Restore from Backup:**
   ```bash
   kubectl cp backup.db udemy-tracker/udemy-tracker-backend-pod:/data/courses.db
   ```

## Scaling

- **Frontend:** Can scale horizontally (increase replicas)
  ```bash
  kubectl scale -n udemy-tracker deployment/udemy-tracker-frontend --replicas=3
  ```

- **Backend:** Should remain at 1 replica (SQLite limitation)

## Updating the Application

```bash
# Build and push new images
docker build -t your-registry/udemy-tracker-backend:v2 ./server
docker push your-registry/udemy-tracker-backend:v2

docker build -t your-registry/udemy-tracker-frontend:v2 .
docker push your-registry/udemy-tracker-frontend:v2

# Update deployments
kubectl set image -n udemy-tracker deployment/udemy-tracker-backend backend=your-registry/udemy-tracker-backend:v2
kubectl set image -n udemy-tracker deployment/udemy-tracker-frontend nginx=your-registry/udemy-tracker-frontend:v2

# Or edit the manifests and re-apply
kubectl apply -f k8s/
```

## Troubleshooting

### Backend not starting
```bash
kubectl describe pod -n udemy-tracker -l app=udemy-tracker-backend
kubectl logs -n udemy-tracker -l app=udemy-tracker-backend
```

Common issues:
- PVC not bound (check storage class availability)
- Image pull errors (check registry credentials)
- Permission issues (SQLite needs write access to `/data`)

### Frontend can't connect to backend
- Check that `VITE_API_URL` was set correctly during build
- Verify backend service is accessible:
  ```bash
  kubectl run -n udemy-tracker -it --rm debug --image=alpine --restart=Never -- sh
  apk add curl
  curl http://udemy-tracker-backend:3001/health
  ```

### Data not syncing across devices
- Verify backend is receiving requests (check logs)
- Check browser console for API errors
- Ensure API URL is reachable from your browser

## Clean Up

```bash
# Delete everything (WARNING: This will delete your data!)
kubectl delete namespace udemy-tracker

# Or delete individual resources
kubectl delete -f k8s/
```


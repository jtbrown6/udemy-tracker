# Quick Start Guide

Get your Udemy Tracker running in 5 minutes!

## Local Development (Fastest)

```bash
# 1. Install dependencies
npm install
cd server && npm install && cd ..

# 2. Start backend
cd server
npm start &

# 3. Start frontend (new terminal)
cd ..
npm run dev
```

Open http://localhost:5173 in your browser.

## Docker Compose (Easy)

```bash
# Start everything
docker-compose up -d

# Check it's running
docker-compose ps
docker-compose logs -f
```

Open http://localhost:3000 in your browser.

Data is stored in `./data/courses.db`

## Kubernetes (Production)

### Prerequisites
- Kubernetes cluster running
- `kubectl` configured
- Container registry (Docker Hub, GHCR, etc.)

### Deploy

```bash
# 1. Set your registry
export REGISTRY=ghcr.io/yourusername

# 2. Build and push images
make push REGISTRY=$REGISTRY VITE_API_URL=https://your-domain.com

# 3. Update k8s manifests
sed -i "s|your-registry|$REGISTRY|g" k8s/*-deployment.yaml

# 4. Deploy
make deploy

# 5. Check status
make status

# 6. Access the app
kubectl port-forward -n udemy-tracker svc/udemy-tracker-frontend 3000:80
```

Open http://localhost:3000 in your browser.

## What You Get

✅ Cross-device data sync  
✅ Persistent storage (survives restarts)  
✅ Automatic migration from localStorage  
✅ Simple SQLite database (no complex setup)  
✅ Easy backups and restores  

## Key Features

- **Single User:** No authentication needed (private cluster)
- **Low Maintenance:** SQLite requires no database server
- **Simple Scaling:** Frontend scales horizontally
- **Small Footprint:** Backend uses ~64MB RAM, Frontend ~32MB RAM
- **Easy Backups:** Single file database

## Common Tasks

### Backup Database
```bash
# Docker Compose
cp ./data/courses.db ./backup.db

# Kubernetes
make backup
```

### Restore Database
```bash
# Docker Compose
cp ./backup.db ./data/courses.db

# Kubernetes
make restore BACKUP=backups/courses-YYYYMMDD.db
```

### View Logs
```bash
# Docker Compose
docker-compose logs -f backend
docker-compose logs -f frontend

# Kubernetes
make logs-backend
make logs-frontend
```

### Update Deployment
```bash
# Rebuild and push new version
make push REGISTRY=$REGISTRY VERSION=v1.1.0

# Update deployments
kubectl set image -n udemy-tracker deployment/udemy-tracker-backend backend=$REGISTRY/udemy-tracker-backend:v1.1.0
kubectl set image -n udemy-tracker deployment/udemy-tracker-frontend nginx=$REGISTRY/udemy-tracker-frontend:v1.1.0
```

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend
# or
make logs-backend

# Common issues:
# - Port 3001 already in use
# - Database file permissions
# - Missing node_modules (run npm install in server/)
```

### Frontend can't connect to backend
```bash
# Check API URL was set during build
docker inspect your-registry/udemy-tracker-frontend:latest | grep VITE_API_URL

# Rebuild with correct URL
docker build --build-arg VITE_API_URL=http://backend:3001 -t your-registry/udemy-tracker-frontend:latest .
```

### Data not syncing
```bash
# Check browser console (F12) for errors
# Verify backend is reachable
curl http://localhost:3001/health

# Check backend logs for save operations
make logs-backend | grep "saving courses"
```

## Next Steps

- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment options
- Check [k8s/README.md](./k8s/README.md) for Kubernetes specifics
- See [docs/storage.md](./docs/storage.md) for storage architecture

## Support

This is a personal project with minimal dependencies. If something breaks:
1. Check logs first
2. Verify API connectivity
3. Ensure database file has correct permissions
4. Try restarting services

Enjoy tracking your courses! 🚀


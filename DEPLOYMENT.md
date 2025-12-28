# Deployment Guide for Udemy Tracker

This application now supports **cross-device data synchronization** through a simple backend API with SQLite database.

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Browser   │ ───> │   Frontend   │ ───> │   Backend   │
│             │      │   (Nginx)    │      │  (Express)  │
└─────────────┘      └──────────────┘      └─────────────┘
                                                   │
                                                   v
                                            ┌─────────────┐
                                            │   SQLite    │
                                            │  (on PVC)   │
                                            └─────────────┘
```

- **Frontend:** Static React app served by Nginx
- **Backend:** Node.js/Express API with SQLite database
- **Database:** SQLite file stored on Persistent Volume (K8s) or local directory (Docker Compose)

## Local Development

### Option 1: Development Mode (Recommended)

```bash
# Terminal 1 - Start backend
cd server
npm install
npm start

# Terminal 2 - Start frontend
npm install
npm run dev
```

Create a `.env` file in the root:
```bash
VITE_API_URL=http://localhost:3001
```

Access at: http://localhost:5173 (Vite dev server)

### Option 2: Docker Compose

```bash
# Build and start both services
docker-compose up --build

# Or run in background
docker-compose up -d
```

Access at: http://localhost:3000

Data is stored in `./data/courses.db` (gitignored)

## Kubernetes Deployment

See detailed instructions in [`k8s/README.md`](./k8s/README.md)

### Quick Deploy

```bash
# 1. Build images
docker build -t your-registry/udemy-tracker-backend:latest ./server
docker build --build-arg VITE_API_URL=https://your-domain.com -t your-registry/udemy-tracker-frontend:latest .

# 2. Push to registry
docker push your-registry/udemy-tracker-backend:latest
docker push your-registry/udemy-tracker-frontend:latest

# 3. Update image references in k8s/*.yaml files

# 4. Deploy
kubectl apply -f k8s/
```

## Storage Persistence

### Local Development / Docker Compose
- Data stored in `./data/courses.db`
- Automatically created on first run
- Backed up with regular file backups

### Kubernetes
- **PersistentVolumeClaim:** 1Gi (more than enough)
- **Access Mode:** ReadWriteOnce
- **Backend Replicas:** Must be 1 (SQLite limitation)
- **Mount Path:** `/data/courses.db`

### Backup Strategy

**Docker Compose:**
```bash
# Backup
cp ./data/courses.db ./backups/courses-$(date +%Y%m%d).db

# Restore
cp ./backups/courses-20250128.db ./data/courses.db
```

**Kubernetes:**
```bash
# Backup
kubectl exec -n udemy-tracker deployment/udemy-tracker-backend -- cat /data/courses.db > backup.db

# Restore
kubectl cp backup.db udemy-tracker/$(kubectl get pod -n udemy-tracker -l app=udemy-tracker-backend -o jsonpath='{.items[0].metadata.name}'):/data/courses.db
```

## Migration from LocalStorage

When you first deploy the backend, the frontend will:
1. Try to load from API
2. If empty, check browser localStorage
3. If found in localStorage, migrate to API automatically
4. Fall back to CSV data if nothing exists

This means your existing data will be automatically synced when you first access the app with the backend running.

## API Endpoints

- `GET /health` - Health check
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Save all courses (bulk update)
- `GET /api/settings/:key` - Get a setting
- `POST /api/settings/:key` - Save a setting

## Environment Variables

### Frontend Build Args
- `VITE_API_URL` - Backend API URL (default: `http://localhost:3001`)

### Backend Runtime
- `PORT` - Server port (default: `3001`)
- `DATA_DIR` - Database directory (default: `./data`)

## Cross-Device Sync

Once deployed to Kubernetes:
1. All devices access the same frontend URL
2. Frontend calls backend API for all data operations
3. Changes from any device are immediately saved to the shared database
4. Other devices get updates on next page load or action

**Note:** Real-time sync is not implemented (no WebSockets). Changes sync when:
- Page is refreshed
- Any course operation is performed
- App is reopened

## Troubleshooting

### Data not syncing
1. Check browser console for API errors
2. Verify backend is running: `curl http://your-backend/health`
3. Check backend logs: `kubectl logs -n udemy-tracker -l app=udemy-tracker-backend`

### Database locked errors
- SQLite locks if multiple pods try to access it
- Ensure backend deployment has `replicas: 1`
- Check PVC is using `ReadWriteOnce`

### Lost data after restart
- Verify PVC is bound: `kubectl get pvc -n udemy-tracker`
- Check volume mount: `kubectl describe pod -n udemy-tracker -l app=udemy-tracker-backend`
- Ensure `DATA_DIR=/data` and volume is mounted at `/data`

## Future Enhancements (Optional)

If you want real-time sync:
- Add WebSocket support
- Use Server-Sent Events (SSE)
- Poll API periodically

If you want to scale beyond SQLite:
- Migrate to PostgreSQL or MySQL
- Can then scale backend horizontally
- Requires database deployment with its own PVC

For now, SQLite is perfect for single-user, low-write scenarios!


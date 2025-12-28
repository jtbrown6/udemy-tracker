I'll help you understand the storage architecture of your Udemy tracker application so you can plan for Kubernetes persistent volumes. Let me explore the codebase to see how course data is stored and managed.

[8 tools called]

Based on my analysis of your codebase, here's a comprehensive breakdown of how storage works in your Udemy tracker application:

## **Current Storage Architecture**

### **1. Browser-Based Storage (LocalStorage)**

Your application currently uses **browser LocalStorage** as its primary data persistence mechanism:

```38:42:App.tsx
  // Save to LocalStorage on change
  useEffect(() => {
    if (courses.length > 0) {
      localStorage.setItem('skilltrack_courses', JSON.stringify(courses));
    }
  }, [courses]);
```

**What's stored:**
- `skilltrack_courses` - All course data (added, edited, progress updates)
- `skilltrack_monthly_goal` - User's monthly goal setting

### **2. Data Initialization Flow**

```37:60:utils.ts
export const getInitialData = (): Course[] => {
  const saved = localStorage.getItem('skilltrack_courses');
  if (saved) {
    let courses = JSON.parse(saved) as Course[];
    let needsSave = false;
    
    // Migration: Fix Slack course category from "Work" to "Personal"
    courses = courses.map(c => {
      if (c.id === '6834117' && c.category === 'Work') {
        needsSave = true;
        return { ...c, category: 'Personal' };
      }
      return c;
    });
    
    // Save the migrated data back to localStorage
    if (needsSave) {
      localStorage.setItem('skilltrack_courses', JSON.stringify(courses));
    }
    
    return courses;
  }
  return parseCSV(RAW_CSV_DATA);
};
```

**How it works:**
1. On app load, checks if LocalStorage has saved data
2. If yes → loads from LocalStorage (with any migrations)
3. If no → parses initial CSV data from `constants.ts` (hardcoded seed data)

### **3. Operations That Modify Data**

All these operations trigger LocalStorage saves:
- Adding new courses (`handleSaveCourse`)
- Editing course details
- Updating progress (`updateCourseProgress`)
- Toggling favorites (`toggleFavorite`)
- Pinning to dashboard (`toggleDashboardPin`)
- Reordering courses (`moveCourse`)

## **🚨 Critical Kubernetes Considerations**

### **Problem: Data is NOT Persistent Across Pods**

Your current architecture has a **fundamental issue** for Kubernetes deployment:

1. **LocalStorage is browser-specific** - Data is stored in the user's browser, not on the server
2. **No backend database** - There's no server-side persistence
3. **Static file serving** - Your Docker container just serves static files via Nginx

```19:31:Dockerfile
# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### **What This Means for Kubernetes**

✅ **Good news:** 
- No persistent volumes needed for the app itself
- Pods are stateless and can scale horizontally
- No data migration issues when pods restart/redeploy

⚠️ **Important to understand:**
- Each user's data lives in their browser only
- If a user clears browser data → all course progress is lost
- Multiple devices = separate data stores (no sync)
- No server-side backups possible

## **Recommended Kubernetes Architecture**

Since your app is **client-side only**, your K8s deployment will be simple:

```yaml
# Deployment example (no PVs needed)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: udemy-tracker
spec:
  replicas: 3  # Can scale freely
  selector:
    matchLabels:
      app: udemy-tracker
  template:
    metadata:
      labels:
        app: udemy-tracker
    spec:
      containers:
      - name: nginx
        image: your-registry/udemy-tracker:latest
        ports:
        - containerPort: 80
        resources:
          limits:
            memory: "128Mi"
            cpu: "100m"
---
apiVersion: v1
kind: Service
metadata:
  name: udemy-tracker
spec:
  selector:
    app: udemy-tracker
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

**No persistent volumes required** because:
- The app is a static React SPA
- All state lives in the browser
- The container only serves HTML/JS/CSS files

## **Future Enhancement Options**

If you want **true persistence** and multi-device sync, you'd need to add:

1. **Backend API** (Node.js/Express, Python/FastAPI, etc.)
2. **Database** (PostgreSQL, MongoDB, etc.) with PVC
3. **Authentication** (to associate data with users)
4. **API endpoints** for CRUD operations

This would then require:
```yaml
# PostgreSQL StatefulSet with PVC
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: standard  # or your cloud provider's storage class
```

Would you like me to help you design a backend architecture with proper database persistence, or are you comfortable with the current browser-based storage approach for your Kubernetes deployment?

---

## **UPDATE: Backend Storage Implementation**

The application has been updated with a simple backend API and SQLite database for cross-device data synchronization.

### **New Architecture**

```
Browser (Device 1) ──┐
                     ├──> Frontend (Nginx) ──> Backend (Express) ──> SQLite DB (PVC)
Browser (Device 2) ──┘
```

### **Storage Components**

1. **SQLite Database**
   - Single file: `/data/courses.db`
   - Stores all course data and settings
   - Perfect for single-user, low-write scenarios
   - No separate database server needed

2. **Persistent Volume (Kubernetes)**
   - PVC: `udemy-tracker-data`
   - Size: 1Gi (more than enough)
   - Access Mode: ReadWriteOnce
   - Mount Path: `/data` in backend pod

3. **Backend API (Express)**
   - Endpoints:
     - `GET /api/courses` - Load all courses
     - `POST /api/courses` - Save all courses
     - `GET /api/settings/:key` - Get setting
     - `POST /api/settings/:key` - Save setting
   - Single replica (SQLite limitation)
   - Recreate deployment strategy

4. **Frontend Updates**
   - Auto-migrates from localStorage to API
   - Debounced saves (500ms) to reduce API calls
   - Fallback to localStorage on API failure

### **Kubernetes Storage Requirements**

**PersistentVolumeClaim:**
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: udemy-tracker-data
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

**Important Constraints:**
- Backend must run with `replicas: 1` (SQLite is file-based)
- Uses `Recreate` strategy (not RollingUpdate)
- Cannot scale backend horizontally with SQLite

### **Data Migration**

When you first access the app with the backend:
1. Frontend tries to load from API
2. If API returns empty, checks localStorage
3. If localStorage has data, automatically migrates to API
4. Falls back to CSV seed data if nothing exists

### **Backup & Restore**

**Kubernetes:**
```bash
# Backup
kubectl exec -n udemy-tracker deployment/udemy-tracker-backend -- cat /data/courses.db > backup.db

# Restore
kubectl cp backup.db udemy-tracker/POD_NAME:/data/courses.db
```

**Docker Compose:**
```bash
# Backup
cp ./data/courses.db ./backups/courses-$(date +%Y%m%d).db

# Restore
cp ./backups/courses-YYYYMMDD.db ./data/courses.db
```

### **Cross-Device Sync**

✅ **Now works across devices!**
- All changes saved to centralized database
- Changes sync when page loads or on any action
- No real-time sync (no WebSockets) but good enough for low-frequency updates

See [`DEPLOYMENT.md`](../DEPLOYMENT.md) for full deployment instructions.
# Makefile for Udemy Tracker

.PHONY: help dev build push deploy clean

# Variables
REGISTRY ?= your-registry
VERSION ?= latest
VITE_API_URL ?= http://localhost:3001

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

dev: ## Run in development mode
	@echo "Starting backend..."
	@cd server && npm install && npm start &
	@echo "Starting frontend..."
	@npm install && npm run dev

dev-compose: ## Run using docker-compose
	docker-compose up --build

build: ## Build Docker images
	@echo "Building backend..."
	docker build -t $(REGISTRY)/udemy-tracker-backend:$(VERSION) ./server
	@echo "Building frontend..."
	docker build --build-arg VITE_API_URL=$(VITE_API_URL) -t $(REGISTRY)/udemy-tracker-frontend:$(VERSION) .
	@docker tag $(REGISTRY)/udemy-tracker-backend:$(VERSION) $(REGISTRY)/udemy-tracker-backend:latest
	@docker tag $(REGISTRY)/udemy-tracker-frontend:$(VERSION) $(REGISTRY)/udemy-tracker-frontend:latest

push: build ## Build and push images to registry
	docker push $(REGISTRY)/udemy-tracker-backend:$(VERSION)
	docker push $(REGISTRY)/udemy-tracker-backend:latest
	docker push $(REGISTRY)/udemy-tracker-frontend:$(VERSION)
	docker push $(REGISTRY)/udemy-tracker-frontend:latest

deploy: ## Deploy to Kubernetes
	kubectl apply -f k8s/namespace.yaml
	kubectl apply -f k8s/pvc.yaml
	kubectl apply -f k8s/backend-deployment.yaml
	kubectl apply -f k8s/frontend-deployment.yaml

status: ## Check Kubernetes deployment status
	@echo "=== Pods ==="
	kubectl get pods -n udemy-tracker
	@echo "\n=== Services ==="
	kubectl get svc -n udemy-tracker
	@echo "\n=== PVC ==="
	kubectl get pvc -n udemy-tracker

logs-backend: ## View backend logs
	kubectl logs -n udemy-tracker -l app=udemy-tracker-backend -f

logs-frontend: ## View frontend logs
	kubectl logs -n udemy-tracker -l app=udemy-tracker-frontend -f

port-forward: ## Port forward frontend to localhost:3000
	kubectl port-forward -n udemy-tracker svc/udemy-tracker-frontend 3000:80

backup: ## Backup database from Kubernetes
	@mkdir -p backups
	@POD=$$(kubectl get pod -n udemy-tracker -l app=udemy-tracker-backend -o jsonpath='{.items[0].metadata.name}'); \
	kubectl exec -n udemy-tracker $$POD -- cat /data/courses.db > backups/courses-$$(date +%Y%m%d-%H%M%S).db
	@echo "Backup saved to backups/"

restore: ## Restore database (usage: make restore BACKUP=backups/courses-YYYYMMDD.db)
	@if [ -z "$(BACKUP)" ]; then echo "Error: BACKUP not specified. Usage: make restore BACKUP=backups/courses-YYYYMMDD.db"; exit 1; fi
	@POD=$$(kubectl get pod -n udemy-tracker -l app=udemy-tracker-backend -o jsonpath='{.items[0].metadata.name}'); \
	kubectl cp $(BACKUP) udemy-tracker/$$POD:/data/courses.db
	@echo "Database restored from $(BACKUP)"

clean: ## Clean up Kubernetes resources
	kubectl delete -f k8s/ || true

restart: ## Restart all pods
	kubectl rollout restart -n udemy-tracker deployment/udemy-tracker-backend
	kubectl rollout restart -n udemy-tracker deployment/udemy-tracker-frontend

scale-frontend: ## Scale frontend (usage: make scale-frontend REPLICAS=3)
	kubectl scale -n udemy-tracker deployment/udemy-tracker-frontend --replicas=$(REPLICAS)


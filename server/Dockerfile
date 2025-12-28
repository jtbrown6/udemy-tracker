FROM node:20-alpine

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy server code
COPY index.js ./

# Create data directory
RUN mkdir -p /data

# Use /data for database (will be mounted as PVC)
ENV DATA_DIR=/data

EXPOSE 3001

CMD ["node", "index.js"]


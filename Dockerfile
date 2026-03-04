# Multi-stage build for LeadTrack CRM

# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Setup the backend and serve the application
FROM node:18-alpine
WORKDIR /app

# Install backend dependencies
COPY server/package*.json ./server/
RUN cd server && npm install

# Copy backend source
COPY server/ ./server/

# Copy built frontend to backend static folder (optional, if server is serving SPA)
# RUN mkdir -p server/public
# COPY --from=frontend-builder /app/client/dist ./server/public

# Setup data directory for Excel persistence
RUN mkdir -p server/data

EXPOSE 4000
# EXPOSE 5173

CMD ["node", "server/server.js"]

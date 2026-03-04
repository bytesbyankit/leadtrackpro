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

# Create non-root user
RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

# Install backend dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy backend source
COPY server/ ./server/

# Setup data directory for Excel persistence
RUN mkdir -p server/data && chown -R app:app /app

# Switch to non-root user
USER app

ENV NODE_ENV=production

EXPOSE 4000

CMD ["node", "server/server.js"]

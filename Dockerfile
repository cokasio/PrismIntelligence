# Prism Intelligence Dockerfile
# This creates a container image that includes everything needed to run the application
# Think of this as a recipe for building a perfectly configured server environment

# Use the official Node.js runtime as the base image
# We're using the LTS (Long Term Support) version for stability
FROM node:18-alpine AS base

# Set working directory inside the container
# This is like choosing which folder to work in
WORKDIR /app

# Install system dependencies that might be needed for native modules
# Alpine Linux is minimal, so we add only what we need
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && ln -sf python3 /usr/bin/python

# Copy package files first for better Docker layer caching
# Docker builds in layers - if package.json hasn't changed, it can reuse the npm install layer
COPY package*.json ./

# Install dependencies
# This step is cached unless package.json changes, making rebuilds faster
RUN npm ci --only=production && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Build the TypeScript application
# This compiles our TypeScript into JavaScript for production
RUN npm run build

# Create a non-root user for security
# Running as root in containers is a security risk
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership of the app directory to the new user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose the port the app runs on
# This doesn't actually publish the port - it's documentation
EXPOSE 3000

# Define the command to run the application
# This starts the production server
CMD ["npm", "run", "start"]

# Health check to ensure the container is working properly
# Docker will periodically run this to check if the app is responding
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
# Development stage
FROM node:24-bookworm-slim AS dev

# Install necessary dependencies
RUN apt-get update && apt-get install -y \
    bash \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Turbo and npm (no pnpm required)
RUN npm install -g turbo npm tsx

# Copy package.json and package-lock.json (assume they're in the root of your project)
COPY package.json ./
COPY package-lock.json ./

# Install dependencies with npm
RUN npm install

# Copy all source code from the root of your project
COPY ./ ./ 

# Start development server using Turbo
CMD ["npm", "run", "dev"]

# Prune stage (optional, for optimizing the build)
FROM node:24-bookworm-slim AS prune
WORKDIR /app

# Install Turbo and npm
RUN npm install -g turbo npm

# Copy necessary files for pruning (using package.json)
COPY package.json ./
COPY package-lock.json ./
COPY ./ ./  # Copy the full project to prune

# Prune the project using Turbo (no filters, so it prunes everything)
RUN turbo prune --docker

# Builder stage
FROM node:24-bookworm-slim AS builder
WORKDIR /app

# Install Turbo and npm
RUN npm install -g turbo npm

# Copy pruned workspace
COPY --from=prune /app/out/ ./

# Install dependencies for the pruned app
RUN npm install --production

# Copy source files from pruned build
COPY --from=prune /app/out/full/ ./

# Build the app with Turbo
RUN turbo build

# Production stage
FROM node:18-alpine AS prod

WORKDIR /app

# Add a non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Use the non-root user for running the app
USER nextjs

# Copy built app from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./ 
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./ ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Expose the port the app will run on
EXPOSE 3000

# Command to start the production server
CMD ["node", "server.js"]

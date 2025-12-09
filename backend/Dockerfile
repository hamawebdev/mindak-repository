# -----------------------------
# DEV STAGE
# -----------------------------
FROM node:22-alpine AS dev
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose port (your backend port, e.g. 8080 or ${PORT})
EXPOSE 8080

# Default dev command
CMD ["npm", "run", "dev"]



# -----------------------------
# BUILD STAGE
# -----------------------------
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the backend
RUN npm run build



# -----------------------------
# PRODUCTION STAGE
# -----------------------------
FROM node:22-alpine AS server
WORKDIR /app

# Copy build output
COPY --from=builder /app/build ./build
COPY --from=builder /app/src/infra/database/migrations ./build/infra/database/migrations

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

ENV DRIZZLE_OUT=build/infra/database/migrations
ENV DRIZZLE_SCHEMA=build/infra/database/schemas

EXPOSE 8080

# Run migrations then start the server
CMD ["sh", "-c", "npm run migrate && npm start"]

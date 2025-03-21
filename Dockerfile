# Stage 1: Development - Base environment
FROM node:18-alpine AS base
WORKDIR /app
ENV NODE_ENV=development
# Install dependencies needed for development
RUN apk add --no-cache python3 make g++ libc6-compat

# Stage 2: Dependencies - Used by both development and production
FROM base AS deps
# Copy package files
COPY package.json package-lock.json* ./
# Install dependencies (including dev dependencies for build process)
RUN npm ci

# Stage 3: Development - With hot reloading
FROM base AS development
# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
# Copy all files
COPY . .
# Expose port
EXPOSE 3000
# Start development server with hot reloading
CMD ["npm", "run", "dev"]

# Stage 4: Build - Produces the production build
FROM base AS builder
# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
# Copy all source files
COPY . .
# Build the application
RUN npm run build

# Stage 5: Production - Minimal image with only what's needed to run
FROM nginx:alpine AS production
# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy nginx configuration
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
# Expose port
EXPOSE 80
# Start nginx
CMD ["nginx", "-g", "daemon off;"] 

# Add this near the development target in your Dockerfile
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1
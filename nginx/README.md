# Nginx Configuration

## Purpose

Nginx is used in this project to:

1. **Serve the Frontend Application**: In production mode, Nginx serves the built React app's static files.

2. **API Reverse Proxy**: It forwards API requests from frontend to the backend service.

3. **Support SPA Routing**: Redirects all frontend routes to index.html for client-side routing.

4. **Add Security Headers**: Enhances security with proper HTTP headers.

## Configuration Details

The `default.conf` file contains:

- Static file serving configuration with proper caching
- API proxy configuration to forward requests to the backend
- SPA routing support for React Router
- Security headers to protect the application

## When is this used?

This Nginx configuration is primarily used when running the application in production mode (`npm run start:prod`). In development mode, the Vite dev server handles these functions instead. 
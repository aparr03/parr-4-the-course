import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Listen on all addresses
    strictPort: true, // Don't try other ports if 3000 is taken
    open: true, // Open browser automatically
  },
  build: {
    outDir: 'dist',
  },
  // Make sure environment variables are loaded
  envPrefix: 'VITE_',
  // Configure root directory
  root: path.resolve(__dirname),
  // Configure public directory
  publicDir: 'public',
  // Configure resolve aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

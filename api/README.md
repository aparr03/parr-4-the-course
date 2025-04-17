# API Backend

## Directory Structure

The API backend follows a TypeScript project structure:

- `/src` - TypeScript source code (what you edit)
  - `/lib` - Shared utility functions and libraries
  - `/middleware` - Express middleware (like authentication)
  - `/routes` - API endpoint definitions
  - `index.ts` - Main application entry point

- `/dist` - Compiled JavaScript output (generated automatically)
  - This directory is automatically generated when you build the TypeScript code
  - You should never manually edit files in this directory

## Development Workflow

1. Make changes to TypeScript files in the `/src` directory
2. These changes are automatically compiled when:
   - Running in development mode with `npm run dev` (uses ts-node-dev)
   - Building for production with `npm run build` (uses tsc)
3. The compiled JavaScript in `/dist` is what actually runs in production

## Important Notes

- **Only edit files in `/src`** - Changes to files in `/dist` will be overwritten
- The `/dist` directory should be in your `.gitignore` file
- Both directories are needed for the project to work correctly, but you only work with `/src` 
# Project Scripts

This directory contains scripts for managing the project lifecycle.

## Available Scripts

### `start.ps1`
Starts the application in either development or production mode.
- Development mode: `npm run start:dev`
- Production mode: `npm run start:prod`

### `stop.ps1`
Stops all running Docker containers for the project.
- Usage: `npm run stop`

### `clean.ps1`
Cleans up project artifacts like build directories, Docker volumes, and caches.
- Regular clean: `npm run clean`
- Deep clean (removes node_modules): `npm run clean:deep`

## Notes
- These scripts are primarily designed for PowerShell on Windows.
- All scripts can be run through the npm commands defined in package.json. 
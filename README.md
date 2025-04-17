# Recipe App

## Docker Setup

This project uses Docker for both development and production environments. The configuration uses a single `docker-compose.yml` file with environment-specific settings.

### Prerequisites

- Docker Desktop
- A Supabase account and project with appropriate credentials

### Setup Instructions

#### Using Start Scripts

1. Update your Supabase credentials in the environment files:
   - `.env.development` for development
   - `.env.production` for production

2. Start the application using the provided scripts:

   **For Windows (PowerShell):**
   ```
   # Development mode (default)
   ./start.ps1
   
   # OR explicitly specify mode
   ./start.ps1 -Mode dev
   
   # Production mode
   ./start.ps1 -Mode prod
   
   # Stop containers
   ./stop.ps1
   ```

   **For Unix/Linux/macOS (Bash):**
   ```
   # Development mode (default)
   ./start.sh
   
   # OR explicitly specify mode
   ./start.sh dev
   
   # Production mode
   ./start.sh prod
   
   # Stop containers
   ./stop.sh
   ```

#### Using Docker Compose Directly

1. Update your Supabase credentials in the `.env` file

2. Run Docker Compose:
   ```
   # Start containers
   docker-compose up -d

   # Stop containers
   docker-compose down
   ```

### Development Without Docker

You can also run the application without Docker:

1. Start the API server:
   ```
   cd api
   npm install
   npm run dev:build-start
   ```

2. In another terminal, start the frontend:
   ```
   npm install
   npm run dev
   ```

## Project Structure

```
parr-4-the-course/
├── api/                   # Backend API codebase
│   ├── src/               # Source code
│   │   ├── lib/           # Shared libraries
│   │   ├── middleware/    # Request middleware
│   │   └── routes/        # API routes
│   ├── .env               # API environment variables (local dev only)
│   └── package.json       # API dependencies
├── src/                   # Frontend codebase
│   ├── components/        # React components
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Shared libraries
│   ├── pages/             # Page components
│   ├── services/          # API service clients
│   ├── styles/            # CSS styles
│   └── utils/             # Utility functions
├── .env                   # Main environment variables
├── .env.development       # Development environment variables
├── .env.production        # Production environment variables
├── docker-compose.yml     # Docker configuration
├── start.ps1              # Windows startup script
├── start.sh               # Unix startup script
├── stop.ps1               # Windows stop script
└── stop.sh                # Unix stop script
```

## Environment Files

- `.env` - Default environment settings (copied from profile-specific env files)
- `.env.development` - Development settings
- `.env.production` - Production settings

## Troubleshooting Docker Issues

If you encounter Docker issues:

1. Make sure Docker Desktop is running
2. Try resetting Docker Desktop
3. Check for valid Supabase credentials in your .env files
4. If Docker continues to fail, use the non-Docker development approach 
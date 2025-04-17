#!/bin/bash
# Universal start script with mode parameter

# Default to development mode if no parameter provided
MODE=${1:-dev}

echo -e "\033[0;32mStarting the application in $MODE mode...\033[0m"

# Determine which environment file to use
if [ "$MODE" = "dev" ]; then
  ENV_FILE=".env.development"
elif [ "$MODE" = "prod" ]; then
  ENV_FILE=".env.production"
else
  ENV_FILE=".env.development"
fi

# Copy the selected environment file to .env
echo -e "\033[0;34mUsing environment settings from $ENV_FILE\033[0m"
cp $ENV_FILE .env

# Start the containers
docker-compose up -d

echo -e "\033[0;32mApplication started in $MODE mode!\033[0m"

if [ "$MODE" = "dev" ]; then
  echo -e "\033[0;33mDevelopment URLs:\033[0m"
  echo -e "\033[0;36mFrontend: http://localhost:3000\033[0m"
  echo -e "\033[0;36mAPI: http://localhost:3001\033[0m"
else
  echo -e "\033[0;36mProduction URL: http://localhost\033[0m"
fi

echo -e "\033[0;33mUse ./stop.sh to stop the containers\033[0m" 
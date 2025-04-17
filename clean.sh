#!/bin/bash
# Project cleanup script

# Check for deep clean flag
DEEP_CLEAN=false
if [ "$1" = "--deep" ]; then
  DEEP_CLEAN=true
fi

echo -e "\033[0;33mCleaning up project...\033[0m"

# Stop any running containers first
if [ -f ./stop.sh ]; then
  echo -e "\033[0;34mStopping any running containers...\033[0m"
  ./stop.sh
fi

# Remove Docker networks and volumes
echo -e "\033[0;34mRemoving Docker artifacts...\033[0m"
docker-compose down --volumes --remove-orphans

# Remove build artifacts
echo -e "\033[0;34mRemoving build artifacts...\033[0m"
if [ -d ./api/dist ]; then
  rm -rf ./api/dist
fi

echo -e "\033[0;34mRemoving cache files...\033[0m"
if [ -d ./.vite ]; then
  rm -rf ./.vite
fi
if [ -d ./node_modules/.vite ]; then
  rm -rf ./node_modules/.vite
fi

# Deep cleaning - remove node_modules
if [ "$DEEP_CLEAN" = true ]; then
  echo -e "\033[0;31mPerforming deep clean - removing node_modules...\033[0m"
  
  if [ -d ./node_modules ]; then
    rm -rf ./node_modules
  fi
  
  if [ -d ./api/node_modules ]; then
    rm -rf ./api/node_modules
  fi
  
  echo -e "\033[0;34mCleaning npm cache...\033[0m"
  npm cache clean --force
fi

echo -e "\033[0;32mProject cleanup complete!\033[0m"
if [ "$DEEP_CLEAN" = true ]; then
  echo -e "\033[0;33mNote: You'll need to run 'npm install' before starting the project again.\033[0m"
fi 
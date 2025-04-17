#!/bin/bash
# Stop Docker containers

echo -e "\033[0;33mStopping Docker containers...\033[0m"

# Stop all containers
docker-compose down

echo -e "\033[0;32mDocker containers stopped\033[0m" 
# Stop Docker containers
Write-Host "Stopping Docker containers..." -ForegroundColor Yellow

# Stop all containers
docker-compose down

Write-Host "Docker containers stopped" -ForegroundColor Green 
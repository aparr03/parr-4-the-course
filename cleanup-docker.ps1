# Script to clean up all Docker and Supabase local configuration
Write-Host "Cleaning up Docker and Supabase local configuration..." -ForegroundColor Green

# Stop and remove all Docker containers
Write-Host "Stopping and removing all Docker containers..." -ForegroundColor Yellow
docker stop $(docker ps -aq) 2>$null
docker rm $(docker ps -aq) 2>$null

# Remove Docker volumes related to Supabase
Write-Host "Removing Docker volumes related to Supabase..." -ForegroundColor Yellow
docker volume rm $(docker volume ls -q -f name=supabase) 2>$null
docker volume rm $(docker volume ls -q -f name=parr-4-the-course) 2>$null

# Remove Docker networks
Write-Host "Removing Docker networks..." -ForegroundColor Yellow
docker network rm supabase_network 2>$null

# Clean up Docker system
Write-Host "Cleaning up Docker system..." -ForegroundColor Yellow
docker system prune -f

# Remove Supabase local directories
Write-Host "Cleaning up Supabase local directories..." -ForegroundColor Yellow
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue .\.supabase
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue .\supabase\.temp

# Clean up Docker scripts
Write-Host "Cleaning up Docker scripts..." -ForegroundColor Yellow
$scriptsToDelete = @(
    "docker-setup.ps1",
    "start-docker-debug.ps1",
    "manual-docker-steps.md",
    "restart-supabase.sh"
)

foreach ($script in $scriptsToDelete) {
    if (Test-Path $script) {
        Remove-Item -Force $script
        Write-Host "Deleted $script" -ForegroundColor Green
    }
}

# Remove Docker compose file if it exists
if (Test-Path "docker-compose.yml") {
    Remove-Item -Force "docker-compose.yml"
    Write-Host "Deleted docker-compose.yml" -ForegroundColor Green
}

Write-Host "Cleanup complete!" -ForegroundColor Green
Write-Host "Your project is now configured to use only the production Supabase instance." -ForegroundColor Green
Write-Host "You can continue development with 'npm run dev'" -ForegroundColor Green 
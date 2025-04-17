# Project cleanup script
param(
  [switch]$Deep = $false
)

Write-Host "Cleaning up project..." -ForegroundColor Yellow

# Stop any running containers first
if (Test-Path ./stop.ps1) {
  Write-Host "Stopping any running containers..." -ForegroundColor Blue
  ./stop.ps1
}

# Remove Docker networks and volumes
Write-Host "Removing Docker artifacts..." -ForegroundColor Blue
docker-compose down --volumes --remove-orphans

# Remove build artifacts
Write-Host "Removing build artifacts..." -ForegroundColor Blue
if (Test-Path ./api/dist) {
  Remove-Item -Recurse -Force ./api/dist
}

Write-Host "Removing cache files..." -ForegroundColor Blue
if (Test-Path ./.vite) {
  Remove-Item -Recurse -Force ./.vite
}
if (Test-Path ./node_modules/.vite) {
  Remove-Item -Recurse -Force ./node_modules/.vite
}

# Deep cleaning - remove node_modules
if ($Deep) {
  Write-Host "Performing deep clean - removing node_modules..." -ForegroundColor Red
  
  if (Test-Path ./node_modules) {
    Remove-Item -Recurse -Force ./node_modules
  }
  
  if (Test-Path ./api/node_modules) {
    Remove-Item -Recurse -Force ./api/node_modules
  }
  
  Write-Host "Cleaning npm cache..." -ForegroundColor Blue
  npm cache clean --force
}

Write-Host "Project cleanup complete!" -ForegroundColor Green
if ($Deep) {
  Write-Host "Note: You'll need to run 'npm install' before starting the project again." -ForegroundColor Yellow
} 
# Universal start script with mode parameter
param(
  [string]$Mode = "dev" # Default to development mode
)

Write-Host "Starting the application in $Mode mode..." -ForegroundColor Green

# Determine which environment file to use
$EnvFile = switch ($Mode) {
  "dev" { ".env.development" }
  "prod" { ".env.production" }
  default { ".env.development" }
}

# Copy the selected environment file to .env
Write-Host "Using environment settings from $EnvFile" -ForegroundColor Blue
Copy-Item -Path $EnvFile -Destination .env -Force

# Start the containers
docker-compose up -d

Write-Host "Application started in $Mode mode!" -ForegroundColor Green

if ($Mode -eq "dev") {
  Write-Host "Development URLs:" -ForegroundColor Yellow
  Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
  Write-Host "API: http://localhost:3001" -ForegroundColor Cyan
} else {
  Write-Host "Production URL: http://localhost" -ForegroundColor Cyan
}

Write-Host "Use ./stop.ps1 to stop the containers" -ForegroundColor Yellow 
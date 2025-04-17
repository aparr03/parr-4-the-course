@echo off
setlocal enabledelayedexpansion

REM Check for deep clean flag
set DEEP_CLEAN=false
for %%a in (%*) do (
    if "%%a"=="--deep" set DEEP_CLEAN=true
)

echo [94m========================================[0m
echo [94m  Project Cleanup Script (Windows)      [0m
echo [94m========================================[0m

REM Stop running containers if stop.bat exists
if exist stop.bat (
    echo [93mStopping running containers...[0m
    call stop.bat
)

REM Remove Docker networks and volumes
echo [93mRemoving Docker networks and volumes...[0m
docker-compose down --volumes --remove-orphans

REM Remove build artifacts
echo [93mRemoving build artifacts...[0m
if exist .\api\dist (
    rmdir /S /Q .\api\dist
)

REM Remove cache files
echo [93mCleaning cache files...[0m
if exist .\.vite (
    rmdir /S /Q .\.vite
)
if exist .\node_modules\.vite (
    rmdir /S /Q .\node_modules\.vite
)

REM Deep clean if flag is set
if "%DEEP_CLEAN%"=="true" (
    echo [93mPerforming deep clean...[0m
    echo [93mRemoving node_modules...[0m
    
    if exist .\node_modules (
        rmdir /S /Q .\node_modules
    )
    
    if exist .\api\node_modules (
        rmdir /S /Q .\api\node_modules
    )
    
    echo [93mCleaning npm cache...[0m
    call npm cache clean --force
)

echo [92m========================================[0m
echo [92m  Cleanup Complete!                    [0m
if "%DEEP_CLEAN%"=="true" (
    echo [92m  Don't forget to run 'npm install'   [0m
)
echo [92m========================================[0m

endlocal 
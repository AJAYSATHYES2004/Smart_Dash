@echo off
REM Face Recognition System - Automated Test Suite (Windows)
REM Run all tests with automated scripts

echo ===============================================
echo Face Recognition System - Test Suite
echo ===============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js is not installed
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    echo.
)

REM Run tests
echo 🧪 Running Test Suite...
echo.

REM Check if running from root or backend directory
if exist "package.json" (
    findstr /M "digital-drive-backend" package.json >nul
    if errorlevel 1 (
        REM Running from root directory
        echo 📍 Running from root directory
        cd backend
        call npm install
        call npm test
        cd ..
    ) else (
        REM Running from backend directory
        echo 📍 Running from backend directory
        call npm test
    )
) else (
    echo ❌ Could not find package.json
    exit /b 1
)

echo.
echo ===============================================
echo ✅ Test Suite Complete
echo ===============================================
pause

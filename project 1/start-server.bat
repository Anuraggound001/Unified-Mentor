@echo off
echo Smart To-Do List - Local Server Startup
echo =====================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Starting Python HTTP Server on port 8000...
    echo Visit: http://localhost:8000
    echo Press Ctrl+C to stop the server
    echo.
    python -m http.server 8000
) else (
    echo Python not found. Trying alternative methods...
    
    REM Check if Node.js is available
    node --version >nul 2>&1
    if %errorlevel% == 0 (
        echo Starting Node.js HTTP Server on port 8000...
        echo Visit: http://localhost:8000
        echo Press Ctrl+C to stop the server
        echo.
        npx http-server -p 8000
    ) else (
        echo.
        echo No suitable server found!
        echo Please install Python or Node.js to run a local server.
        echo.
        echo Alternatively, you can:
        echo 1. Open index.html directly in your browser
        echo 2. Use Visual Studio Code with Live Server extension
        echo 3. Use any other local development server
        echo.
        pause
    )
)

#!/bin/bash

echo "Smart To-Do List - Local Server Startup"
echo "====================================="
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "Starting Python 3 HTTP Server on port 8000..."
    echo "Visit: http://localhost:8000"
    echo "Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "Starting Python HTTP Server on port 8000..."
    echo "Visit: http://localhost:8000"
    echo "Press Ctrl+C to stop the server"
    echo ""
    python -m http.server 8000
elif command -v node &> /dev/null; then
    echo "Starting Node.js HTTP Server on port 8000..."
    echo "Visit: http://localhost:8000"
    echo "Press Ctrl+C to stop the server"
    echo ""
    npx http-server -p 8000
elif command -v php &> /dev/null; then
    echo "Starting PHP Built-in Server on port 8000..."
    echo "Visit: http://localhost:8000"
    echo "Press Ctrl+C to stop the server"
    echo ""
    php -S localhost:8000
else
    echo ""
    echo "No suitable server found!"
    echo "Please install Python, Node.js, or PHP to run a local server."
    echo ""
    echo "Alternatively, you can:"
    echo "1. Open index.html directly in your browser"
    echo "2. Use Visual Studio Code with Live Server extension"
    echo "3. Use any other local development server"
    echo ""
fi

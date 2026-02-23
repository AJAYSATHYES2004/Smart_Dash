#!/bin/bash

# Face Recognition System - Automated Test Suite
# Run all tests with automated scripts

echo "==============================================="
echo "Face Recognition System - Test Suite"
echo "==============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Run tests
echo "🧪 Running Test Suite..."
echo ""

# Check if running from root or backend directory
if [ -f "package.json" ] && grep -q "digital-drive-backend" package.json; then
    # Running from backend directory
    echo "📍 Running from backend directory"
    npm test
elif [ -f "backend/package.json" ]; then
    # Running from root directory
    echo "📍 Running from root directory"
    cd backend
    npm install
    npm test
    cd ..
else
    echo "❌ Could not find backend directory"
    exit 1
fi

echo ""
echo "==============================================="
echo "✅ Test Suite Complete"
echo "==============================================="

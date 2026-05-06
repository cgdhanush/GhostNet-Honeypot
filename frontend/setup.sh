#!/bin/bash

# GhostNet Frontend - Quick Setup Script

echo "🚀 Setting up GhostNet SSH Honeypot Dashboard Frontend"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js and npm found"
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")/frontend" 2>/dev/null || cd "$(dirname "$0")" 2>/dev/null

echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "🔧 Creating .env.local file..."
    cp .env.example .env.local
    echo "✅ .env.local created (using default API URL: http://localhost:8000/api)"
    echo ""
    echo "   ℹ️  If your API runs on a different URL, edit .env.local and update VITE_API_URL"
else
    echo "ℹ️  .env.local already exists, skipping creation"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Start your backend API (should listen on http://localhost:8000)"
echo "   2. Run: npm run dev"
echo "   3. Open: http://localhost:5173"
echo ""
echo "📚 For more info, see FRONTEND_README.md"

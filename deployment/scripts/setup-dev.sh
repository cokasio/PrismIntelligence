#!/bin/bash

# Prism Intelligence Development Setup Script
# This script automates the entire development environment setup
# Think of it as your personal assistant that handles all the boring setup work

set -e  # Exit on any error

echo "🚀 Setting up Prism Intelligence development environment..."
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. You have version $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop."
    echo "   Visit: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is installed and running"

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating environment configuration..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your actual API keys and configuration"
    echo "   Key variables to set:"
    echo "   - ANTHROPIC_API_KEY (get from https://console.anthropic.com/)"
    echo "   - SENDGRID_API_KEY (get from https://sendgrid.com/)"
    echo "   - DATABASE_URL (your Supabase connection string)"
else
    echo "✅ Environment file already exists"
fi

# Build the project
echo "🔨 Building the project..."
npm run build

# Start the development services
echo "🐳 Starting development services with Docker Compose..."
docker-compose up -d

# Wait for services to be ready
echo "⏱️  Waiting for services to be ready..."
sleep 10

# Run database migrations/setup
echo "🗃️  Setting up database..."
npm run db:setup

# Run tests to verify everything is working
echo "🧪 Running tests to verify setup..."
npm test

echo ""
echo "🎉 Development environment setup complete!"
echo "=================================================="
echo ""
echo "🌟 What's running:"
echo "   • Main application: http://localhost:3000"
echo "   • Redis: localhost:6379"
echo "   • PostgreSQL: localhost:5432"
echo ""
echo "🚀 Next steps:"
echo "   1. Edit .env file with your API keys"
echo "   2. Run 'npm run dev' to start development server"
echo "   3. Visit http://localhost:3000/health to verify everything works"
echo ""
echo "📚 Useful commands:"
echo "   • npm run dev      - Start development server"
echo "   • npm run test     - Run tests"
echo "   • npm run lint     - Check code quality"
echo "   • docker-compose logs - View service logs"
echo ""
echo "Happy coding! 🎯"

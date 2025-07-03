#!/bin/bash
# Quick launcher for AI Orchestra

echo ""
echo "🎭 AI Orchestra for PrismIntelligence"
echo "===================================="
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Please install Node.js first."
    exit 1
fi

# If no arguments, show help
if [ $# -eq 0 ]; then
    node .ai-orchestra/orchestra.js
else
    # Run the orchestrator with all arguments
    node .ai-orchestra/orchestra.js "$@"
fi

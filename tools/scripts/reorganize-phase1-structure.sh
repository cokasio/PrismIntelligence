#!/bin/bash
# Phase 1: Create the new directory structure for Prism Intelligence

echo "🏗️ ============================================"
echo "    PRISM INTELLIGENCE REORGANIZATION"
echo "    Phase 1: Creating Directory Structure"
echo "============================================"
echo ""

# Store the current date for archiving
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
echo "📅 Timestamp: $TIMESTAMP"
echo ""

# Create core AI engine directories
echo "🧠 Creating Core AI Engine directories..."
mkdir -p core/ai/{classifiers,analyzers,orchestrators}
mkdir -p core/processors/{parsers,extractors,validators}
mkdir -p core/database/{models,migrations,services}
mkdir -p core/workflows
echo "   ✅ Core AI structure created"

# Create application directories
echo "📱 Creating Application directories..."
mkdir -p apps/{attachment-loop,dashboard,email-processor,api}
echo "   ✅ Application structure created"

# Create shared packages
echo "📦 Creating Package directories..."
mkdir -p packages/{utils,ui,types,config}
echo "   ✅ Package structure created"

# Create testing structure
echo "🧪 Creating Testing directories..."
mkdir -p tests/{unit,integration,e2e,fixtures}
echo "   ✅ Testing structure created"

# Create documentation structure
echo "📚 Creating Documentation directories..."
mkdir -p docs/{api,guides,architecture,examples}
echo "   ✅ Documentation structure created"

# Create deployment infrastructure
echo "🚀 Creating Deployment directories..."
mkdir -p deployment/{docker,kubernetes,terraform,scripts}
echo "   ✅ Deployment structure created"

# Create data management
echo "📊 Creating Data directories..."
mkdir -p data/{samples,templates,schemas}
echo "   ✅ Data structure created"

# Create development tools
echo "🔧 Creating Tools directories..."
mkdir -p tools/{scripts,generators,validators}
echo "   ✅ Tools structure created"

# Create archive for legacy code
echo "📦 Creating Archive directories..."
mkdir -p archive/legacy-$TIMESTAMP
echo "   ✅ Archive structure created"

echo ""
echo "✅ NEW DIRECTORY STRUCTURE CREATED SUCCESSFULLY!"
echo ""
echo "📂 New Structure Overview:"
echo "   🧠 core/          - AI Engine & Core Logic"
echo "   📱 apps/          - Applications (Loop, Dashboard, API)"
echo "   📦 packages/      - Shared Components"
echo "   🧪 tests/         - All Testing"
echo "   📚 docs/          - Documentation"
echo "   🚀 deployment/    - Infrastructure"
echo "   📊 data/          - Sample Data & Schemas"
echo "   🔧 tools/         - Development Tools"
echo "   📦 archive/       - Legacy Code Archive"
echo ""
echo "🚀 Ready for Phase 2: Legacy Code Cleanup"

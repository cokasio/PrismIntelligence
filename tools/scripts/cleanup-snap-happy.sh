#!/bin/bash
# Cleanup script for old SnapHappy files

echo "🧹 Cleaning up old SnapHappy files..."

# Files to remove (from the incorrect implementation)
FILES_TO_REMOVE=(
  "src/components/snap-happy/SnapGrid.tsx"
  "src/components/snap-happy/SnapScroll.tsx"
  "src/components/snap-happy/ScreenCapture.tsx"
  "src/components/snap-happy/SnapAnimation.tsx"
  "src/components/snap-happy/SnapDashboard.tsx"
  "src/components/snap-happy/types.ts"
  "src/components/snap-happy/INSTALLATION.md"
)

# Remove hooks directory
if [ -d "src/components/snap-happy/hooks" ]; then
  echo "Removing hooks directory..."
  rm -rf "src/components/snap-happy/hooks"
fi

# Remove individual files
for file in "${FILES_TO_REMOVE[@]}"; do
  if [ -f "$file" ]; then
    echo "Removing $file..."
    rm "$file"
  fi
done

echo "✅ Cleanup complete!"
echo ""
echo "📁 Remaining files (the correct SnapHappy implementation):"
echo "  - SnapHappy.tsx (main widget)"
echo "  - SnapHappyButton.tsx (capture button)"
echo "  - SnapHappyWidget.tsx (easy integration)"
echo "  - SnapHappyProvider.tsx (context provider)"
echo "  - index.ts (exports)"
echo "  - README.md (documentation)"
echo "  - snap-happy.css (styles)"
echo ""
echo "🚀 SnapHappy is ready to use for screen sharing with Claude!"
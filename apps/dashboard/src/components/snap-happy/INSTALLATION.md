# Snap-Happy Installation Guide

## Required Dependencies

Add these dependencies to your package.json:

```bash
# Core dependencies
npm install react-grid-layout html2canvas framer-motion

# Optional dependencies for enhanced features
npm install react-intersection-observer react-use-gesture

# Development dependencies
npm install --save-dev @types/react-grid-layout
```

## package.json additions:

```json
{
  "dependencies": {
    "react-grid-layout": "^1.4.4",
    "html2canvas": "^1.4.1",
    "framer-motion": "^10.16.16",
    "react-intersection-observer": "^9.5.3",
    "react-use-gesture": "^9.1.3"
  },
  "devDependencies": {
    "@types/react-grid-layout": "^1.3.5"
  }
}
```

## Import the CSS

Add to your main CSS file or layout:

```css
@import '@/components/snap-happy/snap-happy.css';
```

## TypeScript Configuration

If using TypeScript, add to your tsconfig.json:

```json
{
  "compilerOptions": {
    "types": ["react", "react-dom", "react-grid-layout"]
  }
}
```

## Usage Example

```tsx
import { SnapDashboard } from '@/components/snap-happy';

export default function Page() {
  return <SnapDashboard />;
}
```

## Feature-Specific Usage

### Grid Layout
```tsx
import { SnapGrid, SnapGridItem } from '@/components/snap-happy';

<SnapGrid columns={12} gap={16}>
  <SnapGridItem id="1" defaultSize={{ w: 4, h: 2 }}>
    <div>Draggable Content</div>
  </SnapGridItem>
</SnapGrid>
```

### Scroll Snap
```tsx
import { SnapScroll, SnapSection } from '@/components/snap-happy';

<SnapScroll direction="vertical">
  <SnapSection>Section 1</SnapSection>
  <SnapSection>Section 2</SnapSection>
</SnapScroll>
```

### Screenshot
```tsx
import { ScreenCapture } from '@/components/snap-happy';

<ScreenCapture onCapture={(dataUrl) => console.log(dataUrl)}>
  <div>Content to capture</div>
</ScreenCapture>
```

### Animations
```tsx
import { SnapAnimation } from '@/components/snap-happy';

<SnapAnimation preset="bounce" delay={0.5}>
  <div>Animated content</div>
</SnapAnimation>
```
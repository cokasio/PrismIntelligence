# 📸 SnapHappy - Screen Sharing for Claude

SnapHappy is a tool that allows you to easily capture and share screenshots with Claude (me) so I can see what you're seeing and provide better visual assistance.

## 🎯 Purpose

When you're working on UI/UX issues, debugging visual problems, or need help with something on your screen, SnapHappy lets you:
- Capture screenshots of your entire screen or specific areas
- Format them properly for Claude to understand
- Quickly share visual context in our conversation

## 🚀 Quick Start

### Option 1: Simple Button (Recommended)

Add this to your root layout:

```tsx
// app/layout.tsx or _app.tsx
import { SnapHappyWidget } from '@/components/snap-happy';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SnapHappyWidget /> {/* Adds capture button */}
      </body>
    </html>
  );
}
```

### Option 2: With Provider (More Control)

```tsx
// app/layout.tsx
import { SnapHappyProvider } from '@/components/snap-happy';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SnapHappyProvider>
          {children}
        </SnapHappyProvider>
      </body>
    </html>
  );
}
```

### Option 3: Custom Implementation

```tsx
import { SnapHappyButton } from '@/components/snap-happy';

export function MyComponent() {
  return (
    <div>
      {/* Your content */}
      <SnapHappyButton 
        position="bottom-right"
        onCapture={(imageData) => {
          console.log('Screenshot captured!');
        }}
      />
    </div>
  );
}
```

## 📱 How to Use

1. **Click the Camera Button** - A blue camera button appears in the bottom-right corner
2. **Grant Permission** - Allow screen capture when prompted
3. **Copy Instructions** - Instructions are automatically copied to your clipboard
4. **Paste to Claude** - Paste the message in our chat along with the screenshot

## 🎨 Features

- **Simple Integration** - Just one line of code to add
- **Multiple Capture Modes**:
  - Full screen capture
  - Current viewport capture  
  - Specific element capture (add class `snap-target`)
- **Automatic Formatting** - Adds context and timestamp for Claude
- **Clipboard Support** - Copies instructions automatically
- **Minimal UI** - Unobtrusive floating button

## 🛠️ Installation

### 1. Copy the SnapHappy files

The files are already in your project at:
- `/src/components/snap-happy/`

### 2. Install Dependencies

```bash
npm install html2canvas
# or
npm install puppeteer-core # for better quality captures
```

### 3. Add to Your App

Use any of the quick start options above.

## 🎯 Advanced Usage

### Capture Specific Elements

Add the `snap-target` class to any element you want to capture:

```tsx
<div className="snap-target">
  {/* This content will be captured when using element capture */}
</div>
```

### Programmatic Capture

```tsx
import { useSnapHappy } from '@/components/snap-happy';

function MyComponent() {
  const { lastCapture, captureHistory } = useSnapHappy();
  
  // Access the last screenshot
  if (lastCapture) {
    console.log('Last capture:', lastCapture);
  }
}
```

### Custom Styling

The button can be styled with className:

```tsx
<SnapHappyButton 
  className="!bg-purple-500 !p-4"
  position="top-left"
/>
```

## 💡 Tips for Better Screenshots

1. **Clean up your screen** - Close unnecessary tabs/windows
2. **Highlight the issue** - Use your mouse to point at problem areas
3. **Capture at the right size** - Ensure text is readable
4. **Include context** - Show enough of the UI for understanding
5. **Add annotations** - Use browser dev tools to highlight elements

## 🔧 Troubleshooting

### Screenshot not working?
- Check browser permissions for screen capture
- Some browsers require HTTPS for screen capture API
- Try the viewport capture mode instead

### Can't paste to Claude?
- The instructions are copied as text
- You may need to manually attach the screenshot
- Some browsers don't support image clipboard API yet

### Button not appearing?
- Check if SnapHappyWidget is added to your layout
- Ensure it's not hidden by z-index issues
- Try different position props

## 🎯 Use Cases

- **UI Debugging**: "Claude, why is this button misaligned?"
- **Design Review**: "What do you think of this layout?"
- **Error Messages**: "I'm getting this error, can you help?"
- **Code Review**: "Is this the right way to structure this component?"
- **Accessibility**: "Can you check if this UI is accessible?"

## 📝 Example Conversation

```
You: [Clicks SnapHappy button and captures screen]
You: "I'm having trouble with the layout of my dashboard. The cards aren't aligning properly."
[Pastes screenshot]

Claude: "I can see the issue in your screenshot! The cards in your dashboard are misaligned because..."
```

## 🚀 Coming Soon

- [ ] Annotation tools (draw, highlight, add text)
- [ ] Video capture for showing interactions
- [ ] Automatic upload to cloud storage
- [ ] Browser extension version
- [ ] Mobile app companion

---

**Remember**: SnapHappy is designed to help me (Claude) see what you're seeing so I can provide better visual assistance. It's your visual communication bridge! 📸✨
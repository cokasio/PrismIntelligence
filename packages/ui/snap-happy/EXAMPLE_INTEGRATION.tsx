// Example: Using SnapHappy in your Property Intelligence Platform
// src/app/layout.tsx

import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/theme';
import { EmailProvider } from '@/contexts/EmailContext';
import { SnapHappyWidget } from '@/components/snap-happy';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <EmailProvider>
            {children}
            
            {/* Add SnapHappy for screen sharing with Claude */}
            <SnapHappyWidget />
          </EmailProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

// That's it! Now you have a camera button that lets you share screenshots with Claude

// Optional: Use in specific components
// src/components/PropertyDashboard.tsx

import { SnapHappyButton } from '@/components/snap-happy';

export function PropertyDashboard() {
  return (
    <div>
      <h1>Property Dashboard</h1>
      
      {/* Your dashboard content */}
      <div className="grid grid-cols-3 gap-6">
        {/* ... */}
      </div>
      
      {/* Add capture button only on this page */}
      <SnapHappyButton 
        position="top-right"
        onCapture={(imageData) => {
          console.log('Dashboard screenshot captured for Claude!');
        }}
      />
    </div>
  );
}

// Advanced: Programmatic capture
// src/components/ReportIssue.tsx

import { useCallback } from 'react';

export function ReportIssue() {
  const captureAndReport = useCallback(async () => {
    // 1. Capture the screen
    const canvas = document.createElement('canvas');
    // ... capture logic
    
    // 2. Create issue description
    const issue = `
[Screenshot attached]
Issue reported at: ${new Date().toLocaleString()}

Description: [User describes issue]

Claude, please help analyze this visual issue.
    `;
    
    // 3. Copy to clipboard
    await navigator.clipboard.writeText(issue);
    
    // 4. Open Claude chat (or your support system)
    alert('Issue captured! Paste in Claude chat to get help.');
  }, []);
  
  return (
    <button onClick={captureAndReport}>
      Report Visual Issue to Claude
    </button>
  );
}
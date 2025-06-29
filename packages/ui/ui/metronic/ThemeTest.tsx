// Test file to verify theme is working
// Run this in your Next.js app to test the theme

import React from 'react';
import { ThemeProvider, useTheme, useMetronicClasses, theme } from '@/theme';
import { MetronicButton } from '@/components/ui/metronic/MetronicButton';

function TestComponent() {
  const { getColor } = useTheme();
  const { card, input } = useMetronicClasses();
  
  console.log('Theme loaded:', theme.name, theme.version);
  console.log('Primary color:', getColor('primary.DEFAULT'));
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Metronic Theme Test</h1>
      
      <div className={card.wrapper}>
        <div className={card.header}>
          Theme Test Card
        </div>
        <div className={card.body}>
          <p className="mb-4">Testing Metronic theme components...</p>
          
          <div className="space-y-4">
            <div>
              <label className={input.label}>Test Input</label>
              <input 
                type="text" 
                className={input.input}
                placeholder="Type something..."
              />
            </div>
            
            <div className="flex gap-2">
              <MetronicButton variant="primary">Primary</MetronicButton>
              <MetronicButton variant="secondary">Secondary</MetronicButton>
              <MetronicButton variant="success">Success</MetronicButton>
              <MetronicButton variant="danger">Danger</MetronicButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThemeTest() {
  return (
    <ThemeProvider>
      <TestComponent />
    </ThemeProvider>
  );
}
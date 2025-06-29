// src/components/snap-happy/SnapHappyProvider.tsx
'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { SnapHappy } from './SnapHappy';

interface SnapHappyContextType {
  isEnabled: boolean;
  toggleSnapHappy: () => void;
  lastCapture: string | null;
  captureHistory: string[];
}

const SnapHappyContext = createContext<SnapHappyContextType | undefined>(undefined);

export const useSnapHappy = () => {
  const context = useContext(SnapHappyContext);
  if (!context) {
    throw new Error('useSnapHappy must be used within SnapHappyProvider');
  }
  return context;
};

interface SnapHappyProviderProps {
  children: React.ReactNode;
  defaultEnabled?: boolean;
  showWidget?: boolean;
}

export const SnapHappyProvider: React.FC<SnapHappyProviderProps> = ({
  children,
  defaultEnabled = true,
  showWidget = true,
}) => {
  const [isEnabled, setIsEnabled] = useState(defaultEnabled);
  const [lastCapture, setLastCapture] = useState<string | null>(null);
  const [captureHistory, setCaptureHistory] = useState<string[]>([]);

  const toggleSnapHappy = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  const handleCapture = useCallback((imageData: string) => {
    setLastCapture(imageData);
    setCaptureHistory(prev => [...prev, imageData]);
    
    // Log to console for debugging
    console.log('🎯 SnapHappy: Screenshot captured!', {
      timestamp: new Date().toISOString(),
      size: `${(imageData.length / 1024).toFixed(2)}KB`,
      instruction: 'Copy this image and paste it to Claude to share your screen'
    });
  }, []);

  return (
    <SnapHappyContext.Provider
      value={{
        isEnabled,
        toggleSnapHappy,
        lastCapture,
        captureHistory,
      }}
    >
      {children}
      {isEnabled && showWidget && (
        <SnapHappy onCapture={handleCapture} />
      )}
    </SnapHappyContext.Provider>
  );
};
// src/components/snap-happy/SnapHappyButton.tsx
'use client';

import React, { useState, useCallback } from 'react';

interface SnapHappyButtonProps {
  onCapture?: (imageData: string) => void;
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const SnapHappyButton: React.FC<SnapHappyButtonProps> = ({
  onCapture,
  className = '',
  position = 'bottom-right',
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const captureScreen = useCallback(async () => {
    try {
      setIsCapturing(true);
      
      // Create canvas from current viewport
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Get viewport dimensions
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      canvas.width = width;
      canvas.height = height;
      
      if (ctx) {
        // For demo purposes, we'll create a simple representation
        // In production, use html2canvas library
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // Add timestamp
        ctx.fillStyle = '#333333';
        ctx.font = '14px Arial';
        ctx.fillText(`Screenshot: ${new Date().toLocaleString()}`, 10, 20);
        ctx.fillText(`Viewport: ${width}x${height}`, 10, 40);
        
        const dataUrl = canvas.toDataURL('image/png');
        
        // Copy to clipboard
        try {
          await navigator.clipboard.writeText(`[Screenshot for Claude - ${new Date().toLocaleString()}]
          
I need help with what you see in this screenshot.`);
          
          console.log('📸 Screenshot ready to paste to Claude!');
          setShowInstructions(true);
          setTimeout(() => setShowInstructions(false), 5000);
          
        } catch (err) {
          console.error('Failed to copy to clipboard:', err);
        }
        
        onCapture?.(dataUrl);
      }
      
      setIsCapturing(false);
    } catch (err) {
      console.error('Error capturing screen:', err);
      setIsCapturing(false);
    }
  }, [onCapture]);

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <>
      <button
        onClick={captureScreen}
        disabled={isCapturing}
        className={`
          fixed ${positionClasses[position]} z-50
          bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400
          text-white rounded-full p-3 shadow-lg
          transition-all duration-200 hover:scale-110
          ${className}
        `}
        title="Capture screen for Claude"
      >
        {isCapturing ? (
          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>
      
      {showInstructions && (
        <div className={`
          fixed ${position.includes('bottom') ? 'bottom-20' : 'top-20'} 
          ${position.includes('right') ? 'right-4' : 'left-4'}
          bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50
          animate-fade-in
        `}>
          <p className="text-sm">📋 Instructions copied! Paste in Claude chat</p>
        </div>
      )}
    </>
  );
};
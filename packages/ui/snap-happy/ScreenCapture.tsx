// src/components/snap-happy/ScreenCapture.tsx
'use client';

import React, { useRef, useCallback, useState } from 'react';
import { ScreenshotOptions } from './types';

// Mock html2canvas for now - in real implementation, install: npm install html2canvas
const html2canvas = (element: HTMLElement, options?: any): Promise<HTMLCanvasElement> => {
  // This is a mock implementation
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = element.offsetWidth;
    canvas.height = element.offsetHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = options?.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#333';
      ctx.font = '20px Arial';
      ctx.fillText('Screenshot Preview', 50, 50);
    }
    resolve(canvas);
  });
};

interface ScreenCaptureProps {
  children: React.ReactNode;
  onCapture?: (dataUrl: string) => void;
  filename?: string;
  className?: string;
}

export const ScreenCapture: React.FC<ScreenCaptureProps> = ({
  children,
  onCapture,
  filename = 'screenshot',
  className = '',
}) => {
  const captureRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const capture = useCallback(async (options: ScreenshotOptions = {}) => {
    if (!captureRef.current) return;
    
    setIsCapturing(true);
    
    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: options.backgroundColor || '#ffffff',
        scale: options.scale || 2,
        logging: options.logging || false,
        useCORS: options.useCORS || true,
        allowTaint: options.allowTaint || false,
      });
      
      const dataUrl = canvas.toDataURL(
        `image/${options.format || 'png'}`,
        options.quality || 0.95
      );
      
      setPreview(dataUrl);
      onCapture?.(dataUrl);
      
      return dataUrl;
    } catch (error) {
      console.error('Screenshot failed:', error);
    } finally {
      setIsCapturing(false);
    }
  }, [onCapture]);
  const download = useCallback(() => {
    if (!preview) return;
    
    const link = document.createElement('a');
    link.download = `${filename}-${Date.now()}.png`;
    link.href = preview;
    link.click();
  }, [preview, filename]);

  const copyToClipboard = useCallback(async () => {
    if (!preview) return;
    
    try {
      const blob = await (await fetch(preview)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
    }
  }, [preview]);

  return (
    <div className={`screen-capture ${className}`}>
      <div ref={captureRef} className="capture-area">
        {children}
      </div>
      
      <div className="capture-controls">
        <button
          onClick={() => capture()}
          disabled={isCapturing}
          className="capture-button"
        >
          {isCapturing ? 'Capturing...' : '📸 Capture'}
        </button>
        
        {preview && (
          <>
            <button onClick={download} className="download-button">
              💾 Download
            </button>
            <button onClick={copyToClipboard} className="copy-button">
              📋 Copy
            </button>
            <button onClick={() => setPreview(null)} className="clear-button">
              ❌ Clear
            </button>
          </>
        )}
      </div>
      
      {preview && (
        <div className="capture-preview">
          <img src={preview} alt="Screenshot preview" />
        </div>
      )}
    </div>
  );
};

// Custom hook for screenshot functionality
export const useScreenshot = () => {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const captureElement = useCallback(async (
    element: HTMLElement,
    options: ScreenshotOptions = {}
  ) => {
    setIsCapturing(true);
    
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: options.backgroundColor || '#ffffff',
        scale: options.scale || 2,
        logging: options.logging || false,
        useCORS: options.useCORS || true,
        allowTaint: options.allowTaint || false,
      });
      
      const dataUrl = canvas.toDataURL(
        `image/${options.format || 'png'}`,
        options.quality || 0.95
      );
      
      setScreenshot(dataUrl);
      return dataUrl;
    } catch (error) {
      console.error('Screenshot failed:', error);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const downloadScreenshot = useCallback((filename = 'screenshot') => {
    if (!screenshot) return;
    
    const link = document.createElement('a');
    link.download = `${filename}-${Date.now()}.png`;
    link.href = screenshot;
    link.click();
  }, [screenshot]);

  const clearScreenshot = useCallback(() => {
    setScreenshot(null);
  }, []);

  return {
    screenshot,
    isCapturing,
    captureElement,
    downloadScreenshot,
    clearScreenshot,
  };
};
// src/components/snap-happy/hooks/useSnapCapture.ts
import { useState, useCallback } from 'react';
import { ScreenshotOptions } from '../types';

export const useSnapCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastCapture, setLastCapture] = useState<string | null>(null);
  const [captureHistory, setCaptureHistory] = useState<string[]>([]);

  const captureArea = useCallback(async (
    element: HTMLElement,
    options: ScreenshotOptions = {}
  ): Promise<string | null> => {
    setIsCapturing(true);
    
    try {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      // Set canvas dimensions
      const rect = element.getBoundingClientRect();
      const scale = options.scale || 2;
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      
      // Scale for high DPI displays
      ctx.scale(scale, scale);
      
      // Draw background
      ctx.fillStyle = options.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, rect.width, rect.height);
      
      // This is a simplified version - in production, use html2canvas
      // For now, just create a placeholder
      ctx.fillStyle = '#333';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        'Screenshot Preview', 
        rect.width / 2, 
        rect.height / 2
      );
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL(
        `image/${options.format || 'png'}`,
        options.quality || 0.95
      );
      
      setLastCapture(dataUrl);
      setCaptureHistory(prev => [...prev, dataUrl]);
      
      return dataUrl;
    } catch (error) {
      console.error('Capture failed:', error);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const downloadCapture = useCallback((
    dataUrl: string = lastCapture || '',
    filename: string = 'screenshot'
  ) => {
    if (!dataUrl) return;
    
    const link = document.createElement('a');
    link.download = `${filename}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }, [lastCapture]);

  const copyToClipboard = useCallback(async (dataUrl: string = lastCapture || '') => {
    if (!dataUrl) return false;
    
    try {
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      return true;
    } catch (error) {
      console.error('Copy failed:', error);
      return false;
    }
  }, [lastCapture]);

  const clearHistory = useCallback(() => {
    setCaptureHistory([]);
    setLastCapture(null);
  }, []);

  return {
    isCapturing,
    lastCapture,
    captureHistory,
    captureArea,
    downloadCapture,
    copyToClipboard,
    clearHistory,
  };
};
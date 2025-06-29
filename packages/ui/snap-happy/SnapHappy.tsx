// src/components/snap-happy/SnapHappy.tsx
'use client';

import React, { useState, useCallback, useRef } from 'react';

interface SnapHappyProps {
  apiKey?: string;
  onCapture?: (imageData: string) => void;
}

export const SnapHappy: React.FC<SnapHappyProps> = ({ apiKey, onCapture }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Capture full screen
  const captureScreen = useCallback(async () => {
    try {
      setIsCapturing(true);
      
      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } as any
      });

      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // Wait a moment for video to be ready
        setTimeout(() => {
          captureFrame();
          
          // Stop the stream
          stream.getTracks().forEach(track => track.stop());
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
        }, 100);
      }
    } catch (err) {
      console.error('Error capturing screen:', err);
      setIsCapturing(false);
    }
  }, []);

  // Capture current viewport
  const captureViewport = useCallback(async () => {
    try {
      setIsCapturing(true);
      
      // Use html2canvas or similar
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // For now, capture the body element
      const body = document.body;
      const rect = body.getBoundingClientRect();
      
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // This is simplified - in production use html2canvas
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Capture DOM as image
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
        onCapture?.(dataUrl);
      }
      
      setIsCapturing(false);
    } catch (err) {
      console.error('Error capturing viewport:', err);
      setIsCapturing(false);
    }
  }, [onCapture]);

  // Capture specific element
  const captureElement = useCallback(async (selector: string) => {
    try {
      setIsCapturing(true);
      
      const element = document.querySelector(selector) as HTMLElement;
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const rect = element.getBoundingClientRect();
      
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      if (ctx) {
        // This is simplified - in production use html2canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
        onCapture?.(dataUrl);
      }
      
      setIsCapturing(false);
    } catch (err) {
      console.error('Error capturing element:', err);
      setIsCapturing(false);
    }
  }, [onCapture]);

  // Capture frame from video
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedImage(dataUrl);
      onCapture?.(dataUrl);
    }
    
    setIsCapturing(false);
  }, [onCapture]);

  // Copy to clipboard with instructions for Claude
  const copyForClaude = useCallback(async () => {
    if (!capturedImage) return;
    
    setCopyStatus('copying');
    
    try {
      // Create a message with the image
      const message = `Here's a screenshot of what I'm seeing:

[Screenshot captured at ${new Date().toLocaleString()}]

Please analyze this image and help me with what you see.`;

      // Copy text to clipboard
      await navigator.clipboard.writeText(message);
      
      // Also try to copy image
      try {
        const blob = await (await fetch(capturedImage)).blob();
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
            'text/plain': new Blob([message], { type: 'text/plain' })
          })
        ]);
      } catch (imgError) {
        console.log('Image copy not supported, text copied instead');
      }
      
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  }, [capturedImage]);

  return (
    <div className="snap-happy-widget fixed bottom-4 right-4 z-50">
      {/* Hidden elements for capture */}
      <video ref={videoRef} style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow-xl p-4 space-y-3 max-w-sm">
        <h3 className="text-sm font-semibold text-gray-700">Share Screen with Claude</h3>
        
        {/* Capture Buttons */}
        <div className="space-y-2">
          <button
            onClick={captureScreen}
            disabled={isCapturing}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 transition-colors text-sm"
          >
            {isCapturing ? '📷 Capturing...' : '🖥️ Capture Full Screen'}
          </button>
          
          <button
            onClick={captureViewport}
            disabled={isCapturing}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 transition-colors text-sm"
          >
            {isCapturing ? '📷 Capturing...' : '📄 Capture Current View'}
          </button>
          
          <button
            onClick={() => captureElement('.snap-target')}
            disabled={isCapturing}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-300 transition-colors text-sm"
          >
            {isCapturing ? '📷 Capturing...' : '🎯 Capture Target Element'}
          </button>
        </div>
        
        {/* Preview */}
        {capturedImage && (
          <div className="space-y-2">
            <div className="relative rounded-md overflow-hidden border border-gray-200">
              <img 
                src={capturedImage} 
                alt="Screenshot preview" 
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity" />
            </div>
            
            <button
              onClick={copyForClaude}
              disabled={copyStatus === 'copying'}
              className={`w-full px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                copyStatus === 'copied' 
                  ? 'bg-green-500 text-white' 
                  : copyStatus === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-700 text-white hover:bg-gray-800'
              }`}
            >
              {copyStatus === 'copying' ? '📋 Copying...' : 
               copyStatus === 'copied' ? '✅ Copied! Paste in Claude' :
               copyStatus === 'error' ? '❌ Copy Failed' :
               '📋 Copy for Claude'}
            </button>
          </div>
        )}
        
        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>1. Click capture to take a screenshot</p>
          <p>2. Click "Copy for Claude"</p>
          <p>3. Paste in your message to Claude</p>
          <p className="text-gray-400 italic">
            Add class "snap-target" to any element you want to capture specifically
          </p>
        </div>
      </div>
    </div>
  );
};
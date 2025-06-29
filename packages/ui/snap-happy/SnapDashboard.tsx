// src/components/snap-happy/SnapDashboard.tsx
'use client';

import React, { useState } from 'react';
import { SnapGrid, SnapGridItem } from './SnapGrid';
import { SnapScroll, SnapSection } from './SnapScroll';
import { ScreenCapture, useScreenshot } from './ScreenCapture';
import { SnapAnimation } from './SnapAnimation';
import { MetronicButton } from '../ui/metronic/MetronicButton';
import { useMetronicClasses } from '@/theme/hooks/useMetronicClasses';

export const SnapDashboard = () => {
  const { card } = useMetronicClasses();
  const [activeView, setActiveView] = useState<'grid' | 'scroll' | 'capture' | 'animation'>('grid');
  const { captureElement, screenshot, downloadScreenshot } = useScreenshot();

  const handleCapture = async () => {
    const element = document.getElementById('dashboard-content');
    if (element) {
      await captureElement(element);
    }
  };

  return (
    <div className="snap-dashboard min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-dark">Snap-Happy Dashboard</h1>
          <div className="flex gap-2">
            <MetronicButton
              variant={activeView === 'grid' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveView('grid')}
            >
              Grid Layout
            </MetronicButton>
            <MetronicButton
              variant={activeView === 'scroll' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveView('scroll')}
            >
              Scroll Snap
            </MetronicButton>
            <MetronicButton
              variant={activeView === 'capture' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveView('capture')}
            >
              Screenshot
            </MetronicButton>
            <MetronicButton
              variant={activeView === 'animation' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveView('animation')}
            >
              Animations
            </MetronicButton>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main id="dashboard-content" className="container mx-auto p-8">
        {activeView === 'grid' && (
          <SnapAnimation preset="fadeIn">
            <h2 className="text-xl font-semibold mb-6">Draggable Grid Layout</h2>
            <SnapGrid columns={12} gap={16} rowHeight={100}>
              <SnapGridItem id="card1" defaultSize={{ w: 4, h: 2 }}>
                <div className={`${card.wrapper} h-full`}>
                  <div className={card.body}>
                    <h3 className="text-lg font-semibold mb-2">Properties</h3>
                    <p className="text-3xl font-bold text-primary">248</p>
                    <p className="text-sm text-gray-600">Total managed</p>
                  </div>
                </div>
              </SnapGridItem>
              
              <SnapGridItem id="card2" defaultSize={{ w: 4, h: 2 }} defaultPosition={{ x: 4, y: 0 }}>
                <div className={`${card.wrapper} h-full`}>
                  <div className={card.body}>
                    <h3 className="text-lg font-semibold mb-2">Revenue</h3>
                    <p className="text-3xl font-bold text-success">$1.2M</p>
                    <p className="text-sm text-gray-600">Monthly recurring</p>
                  </div>
                </div>
              </SnapGridItem>
              
              <SnapGridItem id="card3" defaultSize={{ w: 4, h: 2 }} defaultPosition={{ x: 8, y: 0 }}>
                <div className={`${card.wrapper} h-full`}>
                  <div className={card.body}>
                    <h3 className="text-lg font-semibold mb-2">Occupancy</h3>
                    <p className="text-3xl font-bold text-info">94%</p>
                    <p className="text-sm text-gray-600">Average rate</p>
                  </div>
                </div>
              </SnapGridItem>
              
              <SnapGridItem id="card4" defaultSize={{ w: 8, h: 3 }} defaultPosition={{ x: 0, y: 2 }}>
                <div className={`${card.wrapper} h-full`}>
                  <div className={card.header}>
                    <h3>Property Performance Chart</h3>
                  </div>
                  <div className={card.body}>
                    <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                      <p className="text-gray-500">📊 Drag me around!</p>
                    </div>
                  </div>
                </div>
              </SnapGridItem>
            </SnapGrid>
            <p className="mt-4 text-sm text-gray-600">
              💡 Tip: Drag cards to rearrange them. They snap to grid positions!
            </p>
          </SnapAnimation>
        )}
        {activeView === 'scroll' && (
          <SnapAnimation preset="slideUp">
            <h2 className="text-xl font-semibold mb-6">Scroll Snap Sections</h2>
            <div className="h-[600px] rounded-lg overflow-hidden border border-gray-200">
              <SnapScroll direction="vertical" type="mandatory">
                <SnapSection className="bg-primary-50">
                  <div className="text-center p-12">
                    <h3 className="text-4xl font-bold text-primary mb-4">Section 1</h3>
                    <p className="text-lg text-gray-700">Scroll down to snap to the next section</p>
                    <p className="mt-4">⬇️</p>
                  </div>
                </SnapSection>
                
                <SnapSection className="bg-success-50">
                  <div className="text-center p-12">
                    <h3 className="text-4xl font-bold text-success mb-4">Section 2</h3>
                    <p className="text-lg text-gray-700">Each section snaps into place</p>
                  </div>
                </SnapSection>
                
                <SnapSection className="bg-info-50">
                  <div className="text-center p-12">
                    <h3 className="text-4xl font-bold text-info mb-4">Section 3</h3>
                    <p className="text-lg text-gray-700">Perfect for presentations!</p>
                  </div>
                </SnapSection>
                
                <SnapSection className="bg-warning-50">
                  <div className="text-center p-12">
                    <h3 className="text-4xl font-bold text-warning mb-4">Section 4</h3>
                    <p className="text-lg text-gray-700">Smooth scrolling experience</p>
                    <p className="mt-4">⬆️</p>
                  </div>
                </SnapSection>
              </SnapScroll>
            </div>
          </SnapAnimation>
        )}

        {activeView === 'capture' && (
          <SnapAnimation preset="scale">
            <h2 className="text-xl font-semibold mb-6">Screenshot Tool</h2>
            <ScreenCapture onCapture={(dataUrl) => console.log('Captured!', dataUrl)}>
              <div className={card.wrapper}>
                <div className={card.header}>
                  <h3>Property Report - Q4 2024</h3>
                </div>
                <div className={card.body}>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                      <p className="text-2xl font-bold text-success">$3.6M</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Properties Managed</p>
                      <p className="text-2xl font-bold text-primary">248</p>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-6">
                    <p className="text-center text-gray-600">
                      📸 Click "Capture" to take a screenshot of this report!
                    </p>
                  </div>
                </div>
              </div>
            </ScreenCapture>
            
            {screenshot && (
              <div className="mt-6">
                <MetronicButton onClick={() => downloadScreenshot('property-report')} variant="success">
                  💾 Download Screenshot
                </MetronicButton>
              </div>
            )}
          </SnapAnimation>
        )}
        {activeView === 'animation' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Snappy Animations</h2>
            <div className="grid grid-cols-3 gap-6">
              {(['fadeIn', 'slideUp', 'slideDown', 'slideLeft', 'slideRight', 'scale', 'rotate', 'bounce', 'snap'] as const).map((preset, index) => (
                <SnapAnimation key={preset} preset={preset} delay={index * 0.1}>
                  <div className={card.wrapper}>
                    <div className={card.body}>
                      <h3 className="text-lg font-semibold mb-2 capitalize">{preset}</h3>
                      <p className="text-sm text-gray-600">
                        Animation with {preset} effect
                      </p>
                      <div className="mt-4">
                        <div className="w-12 h-12 bg-primary rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                </SnapAnimation>
              ))}
            </div>
            
            <div className="mt-8">
              <SnapAnimation preset="bounce" delay={1}>
                <div className={`${card.wrapper} text-center`}>
                  <div className={card.body}>
                    <h3 className="text-xl font-semibold mb-4">
                      All animations are hardware-accelerated for smooth performance!
                    </h3>
                    <p className="text-gray-600">
                      Perfect for creating engaging user interfaces with personality.
                    </p>
                  </div>
                </div>
              </SnapAnimation>
            </div>
          </div>
        )}
      </main>
      
      {/* Quick Actions */}
      <div className="fixed bottom-8 right-8">
        <SnapAnimation preset="snap">
          <MetronicButton
            variant="primary"
            onClick={handleCapture}
            className="shadow-lg"
          >
            📸 Quick Capture
          </MetronicButton>
        </SnapAnimation>
      </div>
    </div>
  );
};